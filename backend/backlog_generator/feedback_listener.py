"""
feedback_listener.py
---------------------
Analyse un texte (issu d'un feedback ou d'une transcription audio)
→ extrait plusieurs idées/besoins
→ génère automatiquement les User Stories correspondantes
→ exporte vers Jira si demandé
"""

import os
from typing import Dict, List
from groq import Groq
from dotenv import load_dotenv
from pathlib import Path

from .generator import generate_user_story
from .jira_client import export_user_stories_to_jira


# Charger les variables d’environnement
env_path = Path(__file__).resolve().parent.parent / ".env"
load_dotenv(dotenv_path=env_path)

# Initialiser le client Groq
client = Groq(api_key=os.getenv("GROQ_API_KEY"))

# -------------------------
# 🧠 1️⃣ Extraction d'idées multiples depuis un texte
# -------------------------
def extract_ideas_from_text(feedback_text: str) -> List[str]:
    """
    Analyse un texte de feedback (parlé ou écrit)
    et en extrait plusieurs idées ou besoins distincts.
    """
    prompt = f"""
    Tu es un Product Owner.
    Lis attentivement ce texte de feedback utilisateur et identifie
    les besoins, frustrations ou idées d’amélioration distincts.
    Fournis une liste simple et claire d’idées, sans phrases inutiles.

    Texte :
    {feedback_text}

    Format attendu :
    - Idée 1 : ...
    - Idée 2 : ...
    - Idée 3 : ...
    """

    response = client.chat.completions.create(
        model="llama-3.3-70b-versatile",
        messages=[
            {"role": "system", "content": "Tu es un assistant produit expert qui extrait des besoins utilisateurs clairs à partir d’un texte libre."},
            {"role": "user", "content": prompt}
        ],
        temperature=0.5,
    )

    text = response.choices[0].message.content.strip()

    # Nettoyer les idées extraites
    ideas = []
    for line in text.split("\n"):
        line = line.strip(" -•\t")
        if line and not line.lower().startswith("idée"):
            ideas.append(line)
        elif ":" in line:
            ideas.append(line.split(":", 1)[1].strip())

    return ideas


# -------------------------
# ⚙️ 2️⃣ Pipeline complet : texte → idées → US → Jira
# -------------------------
def process_text_feedback(feedback_text: str, push_to_jira: bool = False) -> List[Dict]:
    """
    Exécute le pipeline complet :
      - Extraction d'idées
      - Génération des User Stories
      - Export Jira (si activé)
    """
    print("\n🚀 Lancement du traitement IA...")

    # Étape 1 : Extraction d'idées
    ideas = extract_ideas_from_text(feedback_text)
    print(f"\n💡 {len(ideas)} idée(s) détectée(s) :")
    for i, idea in enumerate(ideas, start=1):
        print(f"   {i}. {idea}")

    if not ideas:
        print("❌ Aucune idée détectée.")
        return []

    # Étape 2 : Génération des User Stories
    print("\n🧩 Génération des User Stories correspondantes...\n")
    stories = []
    for idea in ideas:
        story = generate_user_story(idea)
        story["idea"] = idea
        stories.append(story)
        print(f"✅ {story['user_story']}\n")

    print(f"🎯 Génération terminée — {len(stories)} User Stories produites.\n")

    # Étape 3 : Export Jira
    if push_to_jira:
        print("🚀 Export des User Stories vers Jira...\n")
        export_user_stories_to_jira(stories)
    else:
        print("ℹ️ Export Jira désactivé (push_to_jira=False).\n")

    return stories
