"""
exporter.py
-----------
Module responsable de l'export du backlog généré par l'IA.
Permet d'exporter les User Stories au format Markdown et CSV.
Fait partie du projet : AI Scrum PO Assistant
Auteur : Djamil
"""

import os
from typing import List, Dict
from datetime import datetime
import csv

# -----------------------------
# 🧩 1️⃣ Export au format Markdown
# -----------------------------

def export_to_markdown(stories: List[Dict], output_dir: str = "exports") -> str:
    """
    Exporte les User Stories générées dans un fichier Markdown.
    """
    os.makedirs(output_dir, exist_ok=True)
    filename = f"{output_dir}/user_stories_{datetime.now().strftime('%Y%m%d_%H%M%S')}.md"

    with open(filename, "w", encoding="utf-8") as f:
        f.write("# 📘 Backlog généré automatiquement\n\n")
        f.write(f"_Date de génération : {datetime.now().strftime('%d/%m/%Y %H:%M')}_\n\n")

        for i, s in enumerate(stories, start=1):
            f.write(f"## 🧩 User Story {i}\n")
            f.write(f"**Idée :** {s.get('idea', 'Non spécifiée')}\n\n")
            f.write(f"**User Story :** {s.get('user_story', 'Non générée')}\n\n")
            f.write(f"**Priorité :** {s.get('priority', 'Non définie')}\n\n")
            f.write("**Critères d’acceptation :**\n")
            for c in s.get("acceptance_criteria", []):
                f.write(f"- {c}\n")
            f.write("\n---\n\n")

    print(f"✅ Fichier Markdown généré : {filename}")
    return filename

# -----------------------------
# 🧩 2️⃣ Export au format CSV
# -----------------------------

def export_to_csv(stories: List[Dict], output_dir: str = "exports") -> str:
    """
    Exporte les User Stories générées dans un fichier CSV.
    """
    os.makedirs(output_dir, exist_ok=True)
    filename = f"{output_dir}/user_stories_{datetime.now().strftime('%Y%m%d_%H%M%S')}.csv"

    with open(filename, "w", encoding="utf-8", newline="") as csvfile:
        fieldnames = ["ID", "Idea", "User Story", "Priority", "Acceptance Criteria"]
        writer = csv.DictWriter(csvfile, fieldnames=fieldnames)
        writer.writeheader()

        for i, s in enumerate(stories, start=1):
            writer.writerow({
                "ID": i,
                "Idea": s.get("idea", ""),
                "User Story": s.get("user_story", ""),
                "Priority": s.get("priority", ""),
                "Acceptance Criteria": " | ".join(s.get("acceptance_criteria", [])),
            })

    print(f"✅ Fichier CSV généré : {filename}")
    return filename
