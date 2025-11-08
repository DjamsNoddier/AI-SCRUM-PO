"""
conversation_segmenter.py
--------------------------
Segmente un texte (issu d'un rush audio ou d'une réunion) en plusieurs blocs cohérents.
Chaque bloc correspond à un thème, un intervenant, ou un besoin.
"""

import re
from groq import Groq
from dotenv import load_dotenv
from pathlib import Path
import os

# Charger la clé API
env_path = Path(__file__).resolve().parent.parent / ".env"
load_dotenv(dotenv_path=env_path)
client = Groq(api_key=os.getenv("GROQ_API_KEY"))

# -------------------------
# 🧩 Segmentation automatique
# -------------------------
def segment_conversation(transcribed_text: str) -> list:
    """
    Segmente automatiquement la conversation en thèmes distincts exploitables pour un backlog.
    Utilise un format JSON strict pour éviter toute interprétation "métadiscursive" du modèle.
    """
    import json
    import re

    if not transcribed_text or len(transcribed_text.split()) < 10:
        raise ValueError("❌ Le texte transcrit est vide ou trop court pour être segmenté.")

    # On tronque légèrement pour éviter les effets de contexte excessif
    snippet = transcribed_text[:3000]

    prompt = f"""
Tu es un assistant produit.
Voici un verbatim issu d'un atelier utilisateur :

<verbatim>
{snippet}
</verbatim>

Analyse ce texte et découpe-le en thèmes cohérents (maximum 5).
Pour chaque thème, fournis :
- un titre court et explicite du thème
- un résumé concis du contenu associé (3 à 5 phrases max)

⚠️ Retourne UNIQUEMENT un JSON valide, strictement au format suivant :

[
  {{
    "theme": "Titre du thème",
    "content": "Résumé concis du passage lié à ce thème"
  }}
]
Aucun texte, introduction, ni explication avant ou après.
    """

    response = client.chat.completions.create(
        model="mixtral-8x7b-32768",  # ✅ modèle le plus stable pour ce type de tâche
        messages=[{"role": "user", "content": prompt}],
        temperature=0.1,
        max_tokens=800,
    )

    text = response.choices[0].message.content.strip()

    # Extraction robuste du JSON
    try:
        json_match = re.search(r"\[.*\]", text, re.DOTALL)
        if json_match:
            json_text = json_match.group(0)
            segments = json.loads(json_text)
        else:
            raise ValueError("Pas de JSON détecté.")
    except Exception as e:
        print(f"⚠️ Erreur de parsing JSON : {e}")
        print("🧩 Sortie brute du modèle :\n", text)
        segments = [{"theme": "Discussion générale", "content": snippet}]

    # Validation minimale
    if not isinstance(segments, list) or not all("theme" in s and "content" in s for s in segments):
        print("⚠️ Structure invalide, fallback appliqué.")
        segments = [{"theme": "Discussion générale", "content": snippet}]

    print(f"✅ {len(segments)} segment(s) détecté(s).")
    return segments
