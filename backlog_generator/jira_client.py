"""
jira_client.py
--------------
Gestion de la création automatique de User Stories dans Jira Cloud.
"""

import os
import requests
from dotenv import load_dotenv
from pathlib import Path
import time

# -------------------------
# 🔧 Chargement de la configuration Jira
# -------------------------
ENV_PATH = Path(__file__).resolve().parent.parent / ".env"
load_dotenv(dotenv_path=ENV_PATH)

JIRA_URL = (os.getenv("JIRA_URL") or "").rstrip("/")
JIRA_EMAIL = os.getenv("JIRA_EMAIL")  # <-- on standardise sur JIRA_EMAIL
JIRA_API_TOKEN = os.getenv("JIRA_API_TOKEN")
JIRA_PROJECT_KEY = os.getenv("JIRA_PROJECT_KEY")

def _ensure_config():
    missing = [k for k, v in {
        "JIRA_URL": JIRA_URL,
        "JIRA_EMAIL": JIRA_EMAIL,
        "JIRA_API_TOKEN": JIRA_API_TOKEN,
        "JIRA_PROJECT_KEY": JIRA_PROJECT_KEY
    }.items() if not v]
    if missing:
        raise RuntimeError(f"Variables d'environnement manquantes: {', '.join(missing)}. "
                           f"Vérifie ton fichier .env à la racine du projet ({ENV_PATH}).")

# -------------------------
# 🧱 Création d'une User Story unique
# -------------------------
def create_jira_issue(summary: str, description_md: str):
    """
    Crée une User Story dans Jira Cloud avec description en format texte.
    """
    if not all([JIRA_URL, JIRA_EMAIL, JIRA_API_TOKEN, JIRA_PROJECT_KEY]):
        print("❌ Variables d'environnement Jira manquantes. Vérifie ton .env.")
        return None

    url = f"{JIRA_URL}/rest/api/3/issue"
    headers = {
        "Accept": "application/json",
        "Content-Type": "application/json"
    }
    auth = (JIRA_EMAIL, JIRA_API_TOKEN)

    payload = {
        "fields": {
            "project": {"key": JIRA_PROJECT_KEY},
            "summary": summary,
            "issuetype": {"name": "Story"},
            "description": {
                "type": "doc",
                "version": 1,
                "content": [
                    {
                        "type": "paragraph",
                        "content": [
                            {"type": "text", "text": description_md}
                        ]
                    }
                ]
            }
        }
    }

    response = requests.post(url, json=payload, headers=headers, auth=auth)

    if response.status_code == 201:
        issue_key = response.json()["key"]
        return issue_key
    else:
        print(f"❌ Erreur Jira ({response.status_code}) : {response.text}")
        return None


# -------------------------
# 🚀 Export en lot vers Jira
# -------------------------
def export_user_stories_to_jira(stories):
    """
    Exporte plusieurs User Stories vers Jira.
    stories : liste d'objets { idea, user_story, acceptance_criteria, priority }
    """
    created_issues = []
    print("🚀 Export des User Stories vers Jira...\n")

    for i, s in enumerate(stories, start=1):
        summary = s.get("idea", "User Story sans titre").capitalize()
        description_md = (
            f"### Contexte\n\n{s['user_story']}\n\n"
            f"### Critères d’acceptation\n"
            + "\n".join(f"- {c}" for c in s["acceptance_criteria"])
            + f"\n\n⭐ **Priorité : {s['priority']}**"
        )

        print(f"➡️ ({i}/{len(stories)}) Création de l’US : {summary}")

        issue_key = create_jira_issue(summary=summary, description_md=description_md)

        if issue_key:
            print(f"   ✅ Créée avec succès → {issue_key}\n")
            created_issues.append(issue_key)
        else:
            print(f"   ❌ Erreur sur la création de {summary}\n")

        time.sleep(1)

    print("🎯 Export terminé !")
    print(f"Total : {len(created_issues)} User Stories créées ✅")

    return created_issues
