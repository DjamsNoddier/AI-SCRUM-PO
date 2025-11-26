"""
audio_transcriber.py
--------------------
Transcrit un feedback audio (voix) en texte clair,
segmente automatiquement la discussion par thèmes (clustering sémantique),
puis génère une ou plusieurs User Stories par idée détectée.

Fait partie du projet : AI Scrum PO Assistant
Auteur : Djamil
"""

import os
import re
import json
from pathlib import Path
from difflib import SequenceMatcher
from dotenv import load_dotenv
from functools import lru_cache
from groq import Groq

from .consolidator import consolidate_user_stories
from .generator import generate_user_story, generate_short_title
from .jira_client import export_user_stories_to_jira
from .logger_manager import info, warn, error


# -------------------------
# ⚙️ Chargement du .env
# -------------------------
ROOT_DIR = Path(__file__).resolve().parents[2]
ENV_PATH = ROOT_DIR / ".env"

if ENV_PATH.exists():
    load_dotenv(dotenv_path=ENV_PATH)
else:
    warn(f"Fichier .env non trouvé à {ENV_PATH}")


# -------------------------
# 🧠 Initialisation paresseuse du client Groq
# -------------------------
@lru_cache()
def get_groq_client():
    """Initialise le client Groq une seule fois et le met en cache."""
    api_key = os.getenv("GROQ_API_KEY")
    if not api_key:
        raise RuntimeError("❌ GROQ_API_KEY manquant. Vérifie ton fichier .env à la racine du projet.")
    return Groq(api_key=api_key)


# -------------------------
# 🔧 Helper JSON robuste
# -------------------------
def _extract_json_block(raw: str, context: str) -> dict:
    """
    Tente d'extraire un vrai JSON depuis la réponse du modèle.
    Gère les cas :
    - ```json ... ```
    - texte avant/après le JSON
    """
    if not raw:
        raise ValueError("Réponse vide")

    txt = raw.strip()

    # Cas 1 : bloc markdown ```json ... ```
    if txt.startswith("```"):
        # on enlève ```json / ``` et on garde l'intérieur
        txt = re.sub(r"^```[a-zA-Z]*\s*", "", txt)
        txt = re.sub(r"```$", "", txt.strip()).strip()

    # Cas 2 : il y a du texte autour, on récupère entre le 1er { et le dernier }
    start = txt.find("{")
    end = txt.rfind("}")
    if start != -1 and end != -1 and end > start:
        txt = txt[start:end + 1]

    try:
        return json.loads(txt)
    except json.JSONDecodeError as e:
        # Log détaillé pour debug, mais on ne fait pas planter le backend
        warn(f"Erreur parsing JSON ({context})", error=str(e), raw_preview=txt[:300])
        raise


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
        client = get_groq_client()
        response = client.audio.transcriptions.create(
            model="whisper-large-v3-turbo",
            file=audio_file
        )

    text = response.text.strip()
    info("Transcription terminée", file=file_path, word_count=len(text.split()))
    return text


# -------------------------
# 🧩 Segmentation de la conversation
# -------------------------
def segment_conversation_llm(transcribed_text: str) -> list[dict]:
    """Découpe le texte transcrit en segments thématiques exploitables pour le backlog."""
    prompt = f"""
Tu es un facilitateur d'atelier produit.
Découpe le texte suivant en 3 à 8 segments logiques,
chacun correspondant à un thème produit cohérent.

- Ignore les salutations, transitions, ou phrases hors-sujet.
- Donne pour chaque segment :
  - "theme": titre court (max 8 mots)
  - "content": le texte cohérent du segment
- Réponds STRICTEMENT en JSON valide :
{{"segments":[{{"theme":"...","content":"..."}}]}}.

Texte :
\"\"\"{transcribed_text}\"\"\"
"""
    try:
        client = get_groq_client()
        response = client.chat.completions.create(
            model="llama-3.3-70b-versatile",
            messages=[
                {"role": "system", "content": "Réponds uniquement en JSON valide, sans texte hors JSON."},
                {"role": "user", "content": prompt}
            ],
            temperature=0.25,
        )
        raw = response.choices[0].message.content.strip()
        data = _extract_json_block(raw, context="segmentation")
        return [
            {"theme": s["theme"].strip(), "content": s["content"].strip()}
            for s in data.get("segments", [])
            if s.get("content") and len(s["content"].split()) > 5
        ]
    except Exception as e:
        error("Erreur segmentation conversation", error=str(e))
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
    client = get_groq_client()
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
    """Extrait les besoins produit explicites et implicites du segment."""
    prompt = f"""
Tu es un Product Manager senior assistant à un atelier produit.
Analyse ce segment et identifie les besoins produit exprimés (ou implicites).
Ignore le bruit conversationnel.

Retourne STRICTEMENT en JSON :
{{"ideas":[{{"idea":"...","title":"...","why":"...","confidence":0.0}}]}}
Si aucune idée produit n'est trouvée : {{"ideas":[]}}

Segment :
\"\"\"{segment_text}\"\"\"
"""
    try:
        client = get_groq_client()
        response = client.chat.completions.create(
            model="llama-3.3-70b-versatile",
            messages=[
                {"role": "system", "content": "Tu es un Product Manager expérimenté. Réponds UNIQUEMENT en JSON valide."},
                {"role": "user", "content": prompt}
            ],
            temperature=0.3,
        )
        raw = response.choices[0].message.content.strip()
        data = _extract_json_block(raw, context="extraction_idées")
        return [i for i in data.get("ideas", []) if i.get("idea") and i.get("confidence", 0) >= 0.5]
    except Exception as e:
        warn("Erreur extraction d’idées", error=str(e))
        return []


# -------------------------
# 📊 Scoring de la qualité globale
# -------------------------
def compute_us_quality_score(user_stories: list[dict]) -> dict:
    """Évalue la qualité globale des User Stories générées."""
    if not user_stories:
        return {"confidence": 0, "diversity": 0, "pertinence": 0, "global_score": 0}

    confidences = [us.get("confidence", 0) for us in user_stories]
    avg_confidence = sum(confidences) / len(confidences) if confidences else 0
    themes = {us["theme"] for us in user_stories if us.get("theme")}
    diversity = len(themes) / len(user_stories)
    valid_us = [us for us in user_stories if us.get("title") and us.get("acceptance_criteria")]
    pertinence = len(valid_us) / len(user_stories)
    global_score = round((avg_confidence * 0.5 + diversity * 0.3 + pertinence * 0.2), 2)

    return {
        "confidence": round(avg_confidence, 2),
        "diversity": round(diversity, 2),
        "pertinence": round(pertinence, 2),
        "global_score": global_score
    }


# -------------------------
# 🚀 Pipeline complet : audio → US + summaries
# -------------------------
def process_audio_feedback(file_path: str, push_to_jira: bool = False):
    """Pipeline principal complet"""
    info("Pipeline IA démarré", file=file_path)

    # Étape 1 : transcription
    text = transcribe_audio(file_path)
    info("Transcription terminée", word_count=len(text.split()))

    # Étape 2 : segmentation
    segments = segment_conversation_llm(text)
    info("Segmentation effectuée", segments_count=len(segments))

    user_stories: list[dict] = []

    # Étape 3 : boucle segment → idées
    for idx, seg in enumerate(segments, 1):
        info("Traitement segment", index=idx, theme=seg["theme"])

        if not is_segment_about_product(seg["content"]):
            warn("Segment ignoré (non-produit)", theme=seg["theme"])
            continue

        ideas = extract_ideas_from_segment(seg["content"])
        if not ideas:
            warn("Aucune idée détectée", theme=seg["theme"])
            continue

        for idea in ideas[:2]:
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

    # Étape 4 : consolidation finale
    before = len(user_stories)
    user_stories = consolidate_user_stories(user_stories, threshold=0.8)
    after = len(user_stories)
    info("Consolidation terminée", before=before, after=after)

    # Étape 5 : export Jira
    if push_to_jira and user_stories:
        info("Export Jira activé", count=len(user_stories))
        export_user_stories_to_jira(user_stories)
    else:
        info("Export Jira désactivé")

    # Étape 6 : scoring qualité
    quality = compute_us_quality_score(user_stories)
    info("Qualité évaluée", **quality)

    # Étape 7 : résumé meeting (même sans US)
    meeting_summary = summarize_meeting(text)

    # Étape 8 : résumé consultant premium
    consulting_summary = generate_consulting_summary(text, user_stories)

    # Résumé global
    info(
        "Pipeline IA terminé",
        file=file_path,
        segments=len(segments),
        user_stories=len(user_stories)
    )

    return {
        "transcription": text,          # ⬅️ utilisé par le backend
        "user_stories": user_stories,
        "segments": segments,
        "quality": quality,
        "meeting_summary": meeting_summary,
        "consulting_summary": consulting_summary,
    }


# -------------------------
# 🧾 Résumé meeting structuré
# -------------------------
def summarize_meeting(transcribed_text: str) -> dict:
    """
    Résume le meeting entier et extrait :
    - contexte
    - points clés
    - décisions
    - risques
    - next steps
    Même si aucune user story n’a été trouvée.
    """

    prompt = f"""
Tu es un assistant IA spécialisé dans les réunions produit.

À partir de ce texte transcrit, produis un résumé structuré.
Même si le texte n’est pas très clair, fais de ton mieux pour remplir les sections.

Retourne STRICTEMENT en JSON :
{{
  "context": "...",
  "key_points": ["...", "..."],
  "decisions": ["...", "..."],
  "risks": ["...", "..."],
  "next_steps": ["...", "..."]
}}

Texte :
\"\"\"{transcribed_text}\"\"\"
"""

    try:
        client = get_groq_client()
        response = client.chat.completions.create(
            model="llama-3.3-70b-versatile",
            messages=[
                {"role": "system", "content": "Tu es un expert en analyse de réunion. Réponds uniquement en JSON valide."},
                {"role": "user", "content": prompt}
            ],
            temperature=0.3,
        )

        raw = response.choices[0].message.content.strip()
        data = _extract_json_block(raw, context="resume_meeting")
        return {
            "context": data.get("context", ""),
            "key_points": data.get("key_points", []) or [],
            "decisions": data.get("decisions", []) or [],
            "risks": data.get("risks", []) or [],
            "next_steps": data.get("next_steps", []) or [],
        }

    except Exception as e:
        warn("Erreur résumé meeting", error=str(e))
        return {
            "context": "",
            "key_points": [],
            "decisions": [],
            "risks": [],
            "next_steps": []
        }


# -------------------------
# 💼 Résumé consultant (premium)
# -------------------------
def generate_consulting_summary(transcribed_text: str, user_stories: list[dict]) -> dict:
    """
    Génère un résumé premium style consultant (McKinsey-like).
    S'appuie sur : transcription brute + US générées.
    Retourne un bloc JSON structuré.
    """

    prompt = f"""
Tu es un consultant senior (McKinsey / BCG).
Produis un résumé PREMIUM du meeting.

Utilise :
- la transcription brute
- les user stories ci-dessous

User Stories détectées :
{json.dumps(user_stories, ensure_ascii=False, indent=2)}

Transcription :
\"\"\"{transcribed_text}\"\"\"

Structure attendue STRICTEMENT en JSON valide :
{{
  "context": "2-3 lignes claires résumant le sujet du meeting",
  "key_points": ["point clé 1", "point clé 2", ...],
  "decisions": ["décision 1", "décision 2"],
  "risks": ["risque 1", "risque 2"],
  "next_steps": ["action 1", "action 2", "action 3"]
}}

Rappels :
- pas de texte hors JSON
- écris des phrases concises, orientées action
- bullet points courts
"""

    try:
        client = get_groq_client()
        response = client.chat.completions.create(
            model="llama-3.3-70b-versatile",
            messages=[
                {
                    "role": "system",
                    "content": "Tu es un consultant McKinsey. Livrable ultra clair. Réponds uniquement en JSON."
                },
                {
                    "role": "user",
                    "content": prompt
                }
            ],
            temperature=0.3,
        )

        raw = response.choices[0].message.content.strip()
        data = _extract_json_block(raw, context="consulting_summary")

        return {
            "context": data.get("context", ""),
            "key_points": data.get("key_points", []) or [],
            "decisions": data.get("decisions", []) or [],
            "risks": data.get("risks", []) or [],
            "next_steps": data.get("next_steps", []) or [],
        }

    except Exception as e:
        warn("Erreur résumé consultant", error=str(e))
        return {
            "context": "",
            "key_points": [],
            "decisions": [],
            "risks": [],
            "next_steps": []
        }
