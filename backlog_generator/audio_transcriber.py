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
from pathlib import Path
from groq import Groq
from dotenv import load_dotenv

# -------------------------
# ⚙️ 1️⃣ Configuration et client Groq
# -------------------------
env_path = Path(__file__).resolve().parent.parent / ".env"
load_dotenv(dotenv_path=env_path)
client = Groq(api_key=os.getenv("GROQ_API_KEY"))

# -------------------------
# 🎧 2️⃣ Transcription Audio → Texte
# -------------------------
def transcribe_audio(file_path: str) -> str:
    """
    Transcrit un fichier audio (mp3, wav, m4a, etc.) en texte clair.
    Retourne le texte transcrit.
    """
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
# 🧩 3️⃣ Segmentation par thèmes (clustering sémantique)
# -------------------------
def segment_conversation(transcribed_text: str) -> list:
    """
    Segmente automatiquement la conversation en thèmes distincts.
    Chaque segment correspond à un sujet ou besoin exprimé durant le rush.
    """
    prompt = f"""
    Analyse ce texte issu d'une réunion ou d'un atelier produit.
    Sépare la discussion en segments distincts selon les thèmes abordés ou les besoins exprimés.
    Fournis la sortie sous ce format :

    ### Thème : <titre du thème>
    <texte du segment>
    """

    response = client.chat.completions.create(
        model="llama-3.3-70b-versatile",
        messages=[
            {"role": "system", "content": "Tu es un facilitateur d’atelier agile. Segmente la conversation par thèmes cohérents et exploitables pour un backlog produit."},
            {"role": "user", "content": prompt}
        ],
        temperature=0.5,
    )

    text = response.choices[0].message.content.strip()
    raw_segments = re.split(r"### Thème\s*:", text)
    segments = []

    for seg in raw_segments:
        seg = seg.strip()
        if not seg:
            continue
        lines = seg.split("\n", 1)
        theme = lines[0].strip()
        content = lines[1].strip() if len(lines) > 1 else ""
        segments.append({"theme": theme, "content": content})

    return segments


# -------------------------
# 🧠 4️⃣ Extraction d'idées depuis chaque segment
# -------------------------
def extract_ideas_from_segment(segment_text: str) -> list[str]:
    """
    Extrait plusieurs idées ou besoins concrets d'un segment thématique.
    """
    prompt = f"""
    Analyse ce texte et identifie les besoins, frustrations ou suggestions concrètes exprimées.
    Fournis une liste claire et concise (pas de phrases inutiles).

    Texte :
    {segment_text}

    Format attendu :
    - Idée 1 : ...
    - Idée 2 : ...
    """

    response = client.chat.completions.create(
        model="llama-3.3-70b-versatile",
        messages=[
            {"role": "system", "content": "Tu es un Product Owner qui extrait des besoins clairs à partir d’un verbatim d’utilisateur."},
            {"role": "user", "content": prompt}
        ],
        temperature=0.4,
    )

    text = response.choices[0].message.content.strip()
    ideas = []

    for line in text.split("\n"):
        line = line.strip(" -•\t")
        if ":" in line:
            ideas.append(line.split(":", 1)[1].strip())
        elif len(line.split()) > 4:
            ideas.append(line)

    return ideas


import re

def local_segment_text(text):
    """
    Segmente un texte transcrit en thèmes cohérents sans appel à un LLM.
    Utilise la ponctuation et les mots-clés pour découper logiquement.
    """
    if not text or len(text.split()) < 30:
        return [{"theme": "Discussion générale", "content": text}]
    
    # Nettoyage minimal
    text = text.replace("\n", " ").strip()

    # Découpage brut par connecteurs typiques
    raw_segments = re.split(r"(?:\bdu coup\b|alors\b|donc\b|et puis\b|enfin\b|par ailleurs\b)", text, flags=re.IGNORECASE)
    segments = []

    for i, seg in enumerate(raw_segments, start=1):
        seg = seg.strip(" .,-")
        if len(seg.split()) < 5:
            continue
        theme = ""
        if "températur" in seg.lower():
            theme = "Alerte de température"
        elif "prévision" in seg.lower() or "plateforme" in seg.lower():
            theme = "Prévisions météo sur la plateforme"
        elif "randonneur" in seg.lower() or "alpiniste" in seg.lower():
            theme = "Expérience utilisateur en montagne"
        else:
            theme = f"Thème {i}"

        segments.append({
            "theme": theme,
            "content": seg
        })
    
    return segments


# -------------------------
# 🧩 5️⃣ Pipeline complet audio → US → Jira
# -------------------------
from .generator import generate_user_story, generate_short_title
from .jira_client import export_user_stories_to_jira

def process_audio_feedback(file_path: str, push_to_jira: bool = False):
    """
    Transcrit un fichier audio, segmente la discussion en thèmes,
    extrait les besoins par segment et génère automatiquement
    les User Stories correspondantes. (Optionnel : export Jira)
    """
    # Étape 1 : Transcription
    text = transcribe_audio(file_path)

    print("\n🧠 Texte transcrit :")
    print(text[:500] + ("..." if len(text) > 500 else ""))

    # Étape 2 : Segmentation
    print("\n🧩 Segmentation de la conversation...")
    segments = local_segment_text(text)
    print(f"✅ {len(segments)} segment(s) détecté(s).\n")

    all_stories = []
    user_stories = []
    # Étape 3 : Boucle sur les segments
    user_stories = []  # ✅ Liste principale des US

    for i, seg in enumerate(segments, start=1):
        print(f"🎯 Segment {i}/{len(segments)} — Thème : {seg['theme']}")
        ideas = extract_ideas_from_segment(seg["content"])

        if not ideas:
            print("⚠️ Aucun besoin détecté dans ce segment.\n")
            continue

        print(f"💡 {len(ideas)} idée(s) détectée(s) :")
        for j, idea in enumerate(ideas, start=1):
            print(f"   {j}. {idea}")

        # Génération des US pour chaque idée
        for idea in ideas:
            try:
                story = generate_user_story(idea)
                short_title = generate_short_title(story["user_story"])

                user_stories.append({
                    "theme": seg["theme"],
                    "idea": idea,
                    "title": short_title,
                    **story
                })

                print(f"✅ {short_title} → {story['user_story']}\n")

            except Exception as e:
                print(f"❌ Erreur sur l’idée « {idea} » : {e}\n")

    print(f"🎯 Génération terminée — {len(user_stories)} User Stories produites.\n")

    # Étape 4 : Export Jira (optionnel)
    if push_to_jira and user_stories:
        print("🚀 Export des User Stories vers Jira...\n")
        export_user_stories_to_jira(user_stories)
    else:
        print("ℹ️ Export Jira désactivé (push_to_jira=False).")

    # Étape 5 : Résumé
    print("\n🧾 RÉSUMÉ FINAL -------------------")
    print(f"🎙️ Fichier traité : {file_path}")
    print(f"🧩 {len(segments)} segment(s) analysé(s)")
    print(f"🧱 {len(user_stories)} User Stories générée(s)\n")

    for idx, us in enumerate(user_stories, 1):
        print(f"{idx}. 🧱 [{us['theme']}] {us['title']}")
        print(f"   ✅ Critères : {', '.join(us['acceptance_criteria'])}")
        print(f"   ⭐ Priorité : {us['priority']}\n")

    print("✅ Pipeline audio multi-intervenants terminé.")
    return user_stories
