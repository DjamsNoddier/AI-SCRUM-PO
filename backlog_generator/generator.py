"""
generator.py (corrigé)
----------------------
Module responsable de la génération automatique des User Stories à partir d'idées.
Fait partie du projet : AI Scrum PO Assistant
Auteur : Djamil
"""

import os
import time
from typing import List, Dict
from dotenv import load_dotenv
from pathlib import Path
from groq import Groq

# -------------------------
# ⚙️ Configuration environnement
# -------------------------
env_path = Path(__file__).resolve().parent.parent / ".env"
load_dotenv(dotenv_path=env_path)

client = Groq(api_key=os.getenv("GROQ_API_KEY"))

# -------------------------
# 🧩 1️⃣ Génération d'une seule User Story
# -------------------------

def generate_user_story(idea: str) -> Dict:
    """
    Génère une User Story complète (US + critères + priorité + résumé) à partir d'une idée.
    Nettoie les lignes parasites pour un rendu propre.
    """
    prompt = f"""
Tu es un Product Owner expert en agilité.
À partir de l’idée suivante :
"{idea}"

Rédige une User Story claire, concise et exploitable au format suivant :

En tant que [type d’utilisateur], je veux [objectif] afin de [bénéfice].

Critères d’acceptation :
- Trois à cinq critères mesurables et vérifiables
- Chaque critère commence par un tiret “-”
- N’inclus pas de texte "User Story :" ni "Priorité :" dans ta réponse

Priorité : Haute / Moyenne / Basse
    """

    response = client.chat.completions.create(
        model="llama-3.3-70b-versatile",
        messages=[
            {"role": "system", "content": "Tu es un assistant agile qui rédige des User Stories professionnelles et bien structurées."},
            {"role": "user", "content": prompt}
        ],
        temperature=0.5,
    )

    text = response.choices[0].message.content.strip()
    lines = [l.strip() for l in text.split("\n") if l.strip()]

    user_story = ""
    criteria = []
    priority = "Moyenne"

    for line in lines:
        lower = line.lower()

        # ✅ Détection propre de la User Story
        if lower.startswith("en tant"):
            user_story = line.strip("–-• ").strip()

        # ✅ Critères d’acceptation
        elif line.startswith("-"):
            crit = line.lstrip("-•1234567890. ").strip()
            if crit and "user story" not in crit.lower() and "priorité" not in crit.lower():
                criteria.append(crit)

        # ✅ Détection de la priorité
        elif "haute" in lower:
            priority = "Haute"
        elif "moyenne" in lower:
            priority = "Moyenne"
        elif "basse" in lower:
            priority = "Basse"

    # Si pas de critères détectés, on en injecte des placeholders
    if not criteria:
        criteria = [
            "La User Story est validée par le Product Owner.",
            "Les critères d’acceptation seront précisés lors du grooming.",
            "La fonctionnalité répond à un besoin utilisateur concret."
        ]

    # ✅ Génération d’un résumé lisible pour Jira
    summary = ""
    if "je veux" in user_story.lower():
        try:
            summary = user_story.split("je veux", 1)[1].split("afin")[0].strip().capitalize()
        except Exception:
            summary = idea.capitalize()
    else:
        summary = idea.capitalize()

    return {
        "summary": summary,
        "user_story": user_story or f"En tant qu’utilisateur, je veux {idea.lower()} afin d’obtenir une valeur ajoutée.",
        "acceptance_criteria": criteria,
        "priority": priority,
    }

# -------------------------
# 🧩 2️⃣ Génération en lot (plusieurs idées)
# -------------------------

def generate_user_stories(ideas: List[str]) -> List[Dict]:
    """
    Génère plusieurs User Stories à partir d'une liste d'idées.
    Appelle generate_user_story() pour chacune.
    """
    all_stories = []
    total = len(ideas)
    print(f"🧠 Génération de {total} User Stories via Groq...\n")

    for i, idea in enumerate(ideas, start=1):
        print(f"➡️ ({i}/{total}) Idée : {idea}")
        try:
            story = generate_user_story(idea)
            all_stories.append({"idea": idea, **story})
            print(f"   ✅ Générée ({story['priority']}) : {story['summary']}\n")
        except Exception as e:
            print(f"   ❌ Erreur sur '{idea}' : {e}\n")
            all_stories.append({
                "idea": idea,
                "user_story": "",
                "acceptance_criteria": [],
                "priority": "Erreur"
            })
        time.sleep(1)

    print("🎯 Génération terminée.")
    return all_stories
