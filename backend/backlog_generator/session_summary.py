"""
session_summary.py
------------------
Génère et sauvegarde un résumé de session pour l'assistant AI Scrum PO.
Utilisé après chaque enregistrement audio et pipeline d'analyse.

Auteur : Djamil
"""

import json   
from pathlib import Path
from datetime import datetime


def generate_session_summary(metadata_path: str, user_stories: list, quality: dict) -> dict:
    """Construit un résumé structuré d'une session analysée."""
    # Sécurisation du type de données
    user_stories = list(user_stories or [])
    meta = {}

    try:
        with open(metadata_path, "r", encoding="utf-8") as f:
            meta = json.load(f)
    except FileNotFoundError:
        print(f"⚠️ Métadonnées introuvables : {metadata_path}")

    # Construction du résumé
    summary = {
        "session_id": meta.get("session_id", "unknown"),
        "audio_file": meta.get("audio_file", "n/a"),
        "started_at": meta.get("start_time", ""),
        "ended_at": meta.get("end_time", ""),
        "duration_sec": meta.get("duration_sec", 0),
        "timestamp_summary": datetime.now().isoformat(),
        "quality": quality or {},
        "user_story_count": len(user_stories),
        "themes_detected": list({
            us.get("theme") if isinstance(us, dict) else "Général"
            for us in user_stories
            if isinstance(us, dict) and us.get("theme")
        }),
        "top_user_stories": [],
    }

    # Sélection des 3 premières user stories si présentes
    for us in user_stories[:3]:
        if isinstance(us, dict):
            summary["top_user_stories"].append({
                "title": us.get("title", "Sans titre"),
                "priority": us.get("priority", "normal")
            })
        else:
            summary["top_user_stories"].append({
                "title": str(us),
                "priority": "normal"
            })

    # Sauvegarde du résumé
    summary_path = Path(metadata_path).parent / "summary.json"
    with open(summary_path, "w", encoding="utf-8") as f:
        json.dump(summary, f, ensure_ascii=False, indent=4)

    print(f"📊 Résumé sauvegardé : {summary_path}")
    return summary


def print_session_summary(summary: dict):
    """Affiche le résumé dans le terminal sous forme lisible."""
    print("\n🧾 RÉSUMÉ DE SESSION -------------------")
    print(f"🆔 Session : {summary.get('session_id')}")
    print(f"🎙️ Audio : {summary.get('audio_file')}")
    print(f"⏱️ Durée : {summary.get('duration_sec')} sec")
    print(f"📊 Score global : {summary.get('quality', {}).get('global_score', 0):.2f}")
    print(f"💡 {summary.get('user_story_count', 0)} User Stories générées")
    print(f"🏷️ Thèmes détectés : {', '.join(summary.get('themes_detected', [])) or 'Aucun'}")

    print("\n✨ Principales User Stories :")
    for us in summary.get("top_user_stories", []):
        print(f"   • {us.get('title')} ({us.get('priority')})")

    print("---------------------------------------\n")
