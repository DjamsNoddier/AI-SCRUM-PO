"""
generator.py
------------
Module responsable de la génération automatique des User Stories à partir d'idées nettoyées.
Fait partie du projet : AI Scrum PO Assistant
Auteur : Djamil
"""

import os
import time
from typing import List, Dict
from dotenv import load_dotenv
from pathlib import Path
from groq import Groq

# Charger la clé API Groq depuis le .env (placé à la racine du projet)
env_path = Path(__file__).resolve().parent.parent / ".env"
load_dotenv(dotenv_path=env_path)

# Initialiser le client Groq
client = Groq(api_key=os.getenv("GROQ_API_KEY"))

# -------------------------
# 🧩 1️⃣ Génération d'une seule User Story
# -------------------------

def generate_user_story(idea: str) -> Dict:
    """
    Génère une User Story complète (US + critères + priorité) à partir d'une idée.
    Utilise le modèle Groq Llama 3.3 (actif et gratuit).
    """
    prompt = f"""
    Tu es un Product Owner expert en agilité.
    Transforme l’idée suivante en une User Story claire et concise.
    Fournis :
    1️⃣ La User Story au format : "En tant que [type d'utilisateur], je veux [objectif] afin de [bénéfice]."
    2️⃣ Trois critères d'acceptation au minimum (phrases mesurables).
    3️⃣ Une estimation de priorité : Haute / Moyenne / Basse.

    Idée : "{idea}"
    """

    response = client.chat.completions.create(
        model="llama-3.3-70b-versatile",
        messages=[
            {"role": "system", "content": "Tu es un assistant agile qui rédige des User Stories professionnelles et bien structurées."},
            {"role": "user", "content": prompt}
        ],
        temperature=0.7,
    )

    text = response.choices[0].message.content.strip()

    # Découper la réponse
    lines = [l.strip() for l in text.split("\n") if l.strip()]
    user_story = ""
    criteria = []
    priority = "Moyenne"

    for line in lines:
        lower = line.lower()
        if lower.startswith("en tant"):
            user_story = line
        elif any(k in lower for k in ["critère", "-", "•"]):
            criteria.append(line.lstrip("-• ").strip())
        elif "priorité" in lower or lower in ["haute", "moyenne", "basse"]:
            priority = line.split(":")[-1].strip().capitalize()

    return {
        "user_story": user_story or f"En tant qu’utilisateur, je veux {idea.lower()} afin d’obtenir une valeur ajoutée.",
        "acceptance_criteria": criteria or ["Critère à définir"],
        "priority": priority or "Moyenne",
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
            print(f"   ✅ Générée : {story['priority']} - {story['user_story']}\n")
        except Exception as e:
            print(f"   ❌ Erreur sur '{idea}' : {e}\n")
            all_stories.append({
                "idea": idea,
                "user_story": "",
                "acceptance_criteria": [],
                "priority": "Erreur"
            })
        time.sleep(1)  # petite pause pour éviter la surcharge API

    print("🎯 Génération terminée.")
    return all_stories
