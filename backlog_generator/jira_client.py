"""
jira_client.py — version corrigée (Jira Cloud API v3)
- Corrige le format Priority (string)
- Corrige le format Description (ADF JSON)
"""

import os
from typing import Dict, List, Optional
from pathlib import Path
import requests
from dotenv import load_dotenv

# --- Charge .env depuis la racine du projet ---
ENV_PATH = Path(__file__).resolve().parent.parent / ".env"
load_dotenv(dotenv_path=ENV_PATH)

JIRA_URL = os.getenv("JIRA_URL", "").rstrip("/")
JIRA_EMAIL = os.getenv("JIRA_EMAIL", "")
JIRA_API_TOKEN = os.getenv("JIRA_API_TOKEN", "")
JIRA_PROJECT_KEY = os.getenv("JIRA_PROJECT_KEY", "")

def _auth():
    if not (JIRA_URL and JIRA_EMAIL and JIRA_API_TOKEN and JIRA_PROJECT_KEY):
        raise RuntimeError(
            "Config Jira incomplète. Vérifie ton .env (JIRA_URL, JIRA_EMAIL, JIRA_API_TOKEN, JIRA_PROJECT_KEY)"
        )
    return (JIRA_EMAIL, JIRA_API_TOKEN)

# --- Conversion description Markdown -> ADF (Atlassian Document Format) ---
def _to_adf(description_md: str) -> dict:
    """
    Convertit un texte structuré en ADF pour Jira Cloud (titres + listes à puces)
    """
    lines = [l.strip() for l in description_md.split("\n") if l.strip()]
    content = []
    bullet_items = []

    def flush_bullets():
        nonlocal bullet_items
        if bullet_items:
            content.append({"type": "bulletList", "content": bullet_items})
            bullet_items = []

    for line in lines:
        if line.startswith("### "):  # titre
            flush_bullets()
            content.append({
                "type": "heading",
                "attrs": {"level": 3},
                "content": [{"type": "text", "text": line.replace("### ", "").strip()}]
            })
        elif line.startswith("- "):  # élément de liste
            bullet_items.append({
                "type": "listItem",
                "content": [{
                    "type": "paragraph",
                    "content": [{"type": "text", "text": line[2:].strip()}]
                }]
            })
        else:  # paragraphe
            flush_bullets()
            content.append({
                "type": "paragraph",
                "content": [{"type": "text", "text": line}]
            })
    flush_bullets()

    return {"type": "doc", "version": 1, "content": content}


def create_jira_issue(summary: str,
                      user_story_text: str,
                      acceptance_criteria: list,
                      priority: str = "Medium",
                      labels: Optional[List[str]] = None) -> Optional[str]:
    """
    Crée une Story dans Jira avec description ADF bien formatée :
    - summary = titre court
    - description = Contexte + Critères d’acceptation
    """
    url = f"{JIRA_URL}/rest/api/3/issue"
    auth = _auth()

    # Nettoie le titre : extrait la partie après "je veux"
    title = summary
    if "je veux" in summary.lower():
        title = summary.split("je veux")[-1].strip().capitalize()

    # Nettoie les critères (supprime la ligne qui contient "Critères")
    cleaned_criteria = [
        c.replace("**", "").strip()
        for c in acceptance_criteria
        if "critère" not in c.lower()
    ]

    # Description Markdown claire
    description_md = f"""### Contexte
{user_story_text}

### Critères d’acceptation
""" + "\n".join([f"- {c}" for c in cleaned_criteria])

    payload = {
        "fields": {
            "project": {"key": JIRA_PROJECT_KEY},
            "summary": title[:254],
            "description": _to_adf(description_md),
            "issuetype": {"name": "Story"},
        }
    }

    if labels:
        payload["fields"]["labels"] = labels

    resp = requests.post(url, json=payload, auth=auth)
    if resp.status_code == 201:
        key = resp.json().get("key")
        print(f"✅ Story créée : {key}")
        return key
    else:
        print(f"❌ Erreur Jira ({resp.status_code}) : {resp.text}")
        return None
