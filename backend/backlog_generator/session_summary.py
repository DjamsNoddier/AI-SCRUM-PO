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

def generate_session_summary(metadata_path: str, user_stories: list[dict], quality: dict) -> dict:
    """Construit un résumé structuré d'une session analysée."""
    meta = {}
    try:
        with open(metadata_path, "r", encoding="utf-8") as f:
            meta = json.load(f)
    except FileNotFoundError:
        print(f"⚠️ Métadonnées introuvables : {metadata_path}")

    summary = {
        "session_id": meta.get("session_id", "unknown"),
        "audio_file": meta.get("audio_file", "n/a"),
        "started_at": meta.get("start_time", ""),
        "ended_at": meta.get("end_time", ""),
        "duration_sec": meta.get("duration_sec", 0),
        "timestamp_summary": datetime.now().isoformat(),
        "quality": quality,
        "user_story_count": len(user_stories),
        "themes_detected": list({us.get('theme') for us in user_stories if us.get('theme')}),
        "top_user_stories": [
            {"title": us.get("title"), "priority": us.get("priority")}
            for us in user_stories[:3]
        ],
    }

    # Sauvegarde du résumé à côté du metadata
    summary_path = Path(metadata_path).parent / "summary.json"
    with open(summary_path, "w", encoding="utf-8") as f:
        json.dump(summary, f, ensure_ascii=False, indent=4)
    print(f"📊 Résumé sauvegardé : {summary_path}")

    return summary


def print_session_summary(summary: dict):
    """Affiche le résumé dans le terminal sous forme lisible."""
    print("\n🧾 RÉSUMÉ DE SESSION -------------------")
    print(f"🆔 Session : {summary['session_id']}")
    print(f"🎙️ Audio : {summary['audio_file']}")
    print(f"⏱️ Durée : {summary['duration_sec']} sec")
    print(f"📊 Score global : {summary['quality']['global_score']:.2f}")
    print(f"💡 {summary['user_story_count']} User Stories générées")
    print(f"🏷️ Thèmes détectés : {', '.join(summary['themes_detected']) or 'Aucun'}")

    print("\n✨ Principales User Stories :")
    for us in summary["top_user_stories"]:
        print(f"   • {us['title']} ({us['priority']})")

    print("---------------------------------------\n")
