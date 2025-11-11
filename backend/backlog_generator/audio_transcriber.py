"""
audio_transcriber.py
--------------------
Transcrit un feedback audio (voix) en texte clair,
segmente automatiquement la discussion par thèmes (clustering sémantique),
puis génère une ou plusieurs User Stories par idée détectée.
Peut enfin les exporter automatiquement vers Jira.

Fait partie du projet : AI Scrum PO Assistant
Auteur : Djamil
"""

import os
import re
import json
from pathlib import Path
from difflib import SequenceMatcher
from dotenv import load_dotenv
from groq import Groq
from .consolidator import consolidate_user_stories
from .generator import generate_user_story, generate_short_title
from .jira_client import export_user_stories_to_jira


# -------------------------
# ⚙️ Initialisation
# -------------------------
env_path = Path(__file__).resolve().parent.parent / ".env"
load_dotenv(dotenv_path=env_path)
client = Groq(api_key=os.getenv("GROQ_API_KEY"))

# -------------------------
# 🧰 Nettoyage / déduplication
# -------------------------
def _normalize(txt: str) -> str:
    return re.sub(r"\s+", " ", txt.strip().lower())

def _similar(a: str, b: str) -> float:
    return SequenceMatcher(None, _normalize(a), _normalize(b)).ratio()

def dedupe_keep_order(items: list[str], threshold: float = 0.88) -> list[str]:
    """Supprime les doublons tout en gardant l’ordre logique."""
    out = []
    for it in items:
        if not it or len(it.strip()) < 5:
            continue
        if not any(_similar(it, x) >= threshold for x in out):
            out.append(it.strip())
    return out


# -------------------------
# 🎧 Transcription Audio → Texte
# -------------------------
def transcribe_audio(file_path: str) -> str:
    if not os.path.exists(file_path):
        raise FileNotFoundError(f"❌ Fichier introuvable : {file_path}")

    with open(file_path, "rb") as audio_file:
        response = client.audio.transcriptions.create(
            model="whisper-large-v3-turbo",
            file=audio_file
        )

    text = response.text.strip()
    print(f"🎙️ Transcription terminée : {len(text.split())} mots détectés")
    return text


# -------------------------
# 🧩 Segmentation de la conversation
# -------------------------
def segment_conversation_llm(transcribed_text: str) -> list[dict]:
    """
    Découpe le texte transcrit en segments thématiques exploitables pour le backlog.
    """
    prompt = f"""
Tu es un facilitateur d'atelier produit.
Découpe le texte suivant en 3 à 8 segments logiques,
chacun correspondant à un thème produit cohérent.

- Ignore les salutations, transitions, ou phrases hors-sujet.
- Donne pour chaque segment :
  - "theme": titre court (max 8 mots)
  - "content": le texte cohérent du segment
- Réponds STRICTEMENT en JSON valide au format :
{{"segments":[{{"theme":"...","content":"..."}}]}}.

Texte :
\"\"\"{transcribed_text}\"\"\"
"""
    try:
        response = client.chat.completions.create(
            model="llama-3.3-70b-versatile",
            messages=[
                {"role": "system", "content": "Réponds uniquement en JSON valide, sans texte hors JSON."},
                {"role": "user", "content": prompt}
            ],
            temperature=0.25,
        )
        raw = response.choices[0].message.content.strip()
        data = json.loads(raw)
        return [
            {"theme": s["theme"].strip(), "content": s["content"].strip()}
            for s in data.get("segments", [])
            if s.get("content") and len(s["content"].split()) > 5
        ]
    except Exception:
        # fallback simple : 1 segment global
        return [{"theme": "Discussion générale", "content": transcribed_text}]


# -------------------------
# 🧠 Détection du contenu produit
# -------------------------
def is_segment_about_product(segment_text: str) -> bool:
    """Vérifie si un segment contient une discussion produit réelle."""
    prompt = f"""
Dis seulement "oui" ou "non".

Réponds "oui" si ce texte contient une discussion produit :
fonctionnalités, problèmes utilisateurs, idées d'amélioration,
besoins métier, ou retours sur un produit existant.
Sinon, réponds "non".

Texte :
\"\"\"{segment_text}\"\"\"
"""
    response = client.chat.completions.create(
        model="llama-3.3-70b-versatile",
        messages=[{"role": "user", "content": prompt}],
        temperature=0,
    )
    return "oui" in response.choices[0].message.content.lower()


# -------------------------
# 🧩 Extraction d’idées produit
# -------------------------
def extract_ideas_from_segment(segment_text: str) -> list[dict]:
    """
    Extrait les besoins produit explicites et implicites du segment.
    Retourne une liste structurée d'idées (JSON).
    """
    prompt = f"""
Tu es un Product Manager senior assistant à un atelier produit.
Analyse ce segment et identifie les besoins produit exprimés (ou implicites).
Ignore le bruit conversationnel.

Retourne STRICTEMENT en JSON :
{{
  "ideas": [
    {{
      "idea": "besoin ou problème détecté",
      "title": "titre court et clair",
      "why": "raison ou objectif du besoin",
      "confidence": 0.0–1.0
    }}
  ]
}}

Si aucune idée produit n'est trouvée : {{"ideas":[]}}

Segment :
\"\"\"{segment_text}\"\"\"
"""
    try:
        response = client.chat.completions.create(
            model="llama-3.3-70b-versatile",
            messages=[
                {"role": "system", "content": "Tu es un Product Manager expérimenté. Réponds UNIQUEMENT en JSON valide."},
                {"role": "user", "content": prompt}
            ],
            temperature=0.3,
        )
        data = json.loads(response.choices[0].message.content.strip())
        return [
            i for i in data.get("ideas", [])
            if i.get("idea") and i.get("confidence", 0) >= 0.5
        ]
    except Exception:
        return []

# -------------------------
# 📊 Scoring de la qualité globale
# -------------------------
def compute_us_quality_score(user_stories: list[dict]) -> dict:
    """
    Évalue la qualité globale des User Stories générées :
    - confiance moyenne (si disponible dans les idées)
    - diversité (thèmes distincts / total)
    - ratio pertinence (titre + critères non vides)
    """
    if not user_stories:
        return {"confidence": 0, "diversity": 0, "pertinence": 0, "global_score": 0}

    # Moyenne des scores de confiance
    confidences = [us.get("confidence", 0) for us in user_stories]
    avg_confidence = sum(confidences) / len(confidences) if confidences else 0

    # Diversité thématique
    themes = {us["theme"] for us in user_stories if us.get("theme")}
    diversity = len(themes) / len(user_stories)

    # Pertinence basique : titre et critères non vides
    valid_us = [
        us for us in user_stories
        if us.get("title") and us.get("acceptance_criteria")
    ]
    pertinence = len(valid_us) / len(user_stories)

    # Score global pondéré
    global_score = round((avg_confidence * 0.5 + diversity * 0.3 + pertinence * 0.2), 2)

    return {
        "confidence": round(avg_confidence, 2),
        "diversity": round(diversity, 2),
        "pertinence": round(pertinence, 2),
        "global_score": global_score
    }


# -------------------------
# 🚀 Pipeline complet : audio → US
# -------------------------
def process_audio_feedback(file_path: str, push_to_jira: bool = False):
    """Pipeline principal complet"""
    # Étape 1 : transcription
    text = transcribe_audio(file_path)
    print("\n🧠 Texte transcrit :")
    print(text[:400] + ("..." if len(text) > 400 else ""))

    # Étape 2 : segmentation
    print("\n🧩 Segmentation de la conversation...")
    segments = segment_conversation_llm(text)
    print(f"✅ {len(segments)} segment(s) détecté(s).\n")

    user_stories = []

    # Étape 3 : boucle segment → idées
    for idx, seg in enumerate(segments, 1):
        print(f"🎯 Segment {idx}/{len(segments)} — Thème : {seg['theme']}")
        if not is_segment_about_product(seg["content"]):
            print("🗨️ Segment conversationnel ignoré.\n")
            continue

        ideas = extract_ideas_from_segment(seg["content"])
        if not ideas:
            print("⚠️ Aucun besoin détecté dans ce segment.\n")
            continue

        print(f"💡 {len(ideas)} idée(s) pertinentes détectées :")
        for idea in ideas[:2]:  # max 2 idées/segment pour éviter le spam
            print(f"   → {idea['title']} ({idea['confidence']:.2f})")

            story = generate_user_story(idea["idea"])
            short_title = generate_short_title(story["user_story"])

            enriched = {
                "theme": seg["theme"],
                "idea": idea["idea"],
                "title": short_title,
                "why": idea.get("why", ""),
                "confidence": idea.get("confidence", 0),
                **story
            }
            user_stories.append(enriched)
            print(f"✅ {short_title} → {story['user_story']}\n")

    # Étape 4 : consolidation finale
    print("\n🔁 Consolidation des User Stories similaires...")
    before = len(user_stories)
    user_stories = consolidate_user_stories(user_stories, threshold=0.8)
    after = len(user_stories)
    print(f"✅ {before - after} fusion(s), {after} User Stories finales.\n")

    # Étape 5 : export Jira
    if push_to_jira and user_stories:
        print("🚀 Export vers Jira...")
        export_user_stories_to_jira(user_stories)
    else:
        print("ℹ️ Export Jira désactivé.")

        # Évaluation de la qualité
    print("\n📊 Évaluation de la qualité des User Stories...")
    quality = compute_us_quality_score(user_stories)
    print(f"   - Confiance moyenne : {quality['confidence']:.2f}")
    print(f"   - Diversité thématique : {quality['diversity']:.2f}")
    print(f"   - Pertinence : {quality['pertinence']:.2f}")
    print(f"   👉 Score global : {quality['global_score']:.2f}\n")


    # Résumé
    print("\n🧾 RÉSUMÉ FINAL -------------------")
    print(f"🎙️ Fichier : {file_path}")
    print(f"🧩 {len(segments)} segment(s) analysé(s)")
    print(f"🧱 {len(user_stories)} User Stories générée(s)\n")
    for i, us in enumerate(user_stories, 1):
        print(f"{i}. 🧱 [{us['theme']}] {us['title']}")
        print(f"   🗣️ Idée : {us['idea']}")
        print(f"   ⭐ Priorité : {us['priority']}\n")

    print("✅ Pipeline audio multi-intervenants terminé.")
    return user_stories
