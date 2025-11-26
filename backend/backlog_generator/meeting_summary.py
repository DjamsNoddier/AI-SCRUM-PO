"""
meeting_summary.py
------------------
Construit et sauvegarde un résumé structuré d'un meeting
enregistré via le frontend (chunks + ffmpeg).

Version optimisée — clean, robuste et sans doublons.
"""

from __future__ import annotations
from pathlib import Path
from datetime import datetime
import json
from typing import Any, Dict, List


def generate_meeting_summary(
    meeting_id: str,
    audio_path: Path,
    summary_engine_output: dict,
    consulting_summary: dict,
    meeting_dir: Path,
) -> Dict[str, Any]:
    """
    Construit le résumé final d’un meeting en fusionnant :
    - le résultat principal IA (user stories, qualité, segmentation…)
    - le consulting summary IA (style consultant)
    """

    # ------------------------------
    # 🔐 Sécurisation des données IA
    # ------------------------------
    user_stories = summary_engine_output.get("user_stories", []) or []
    quality = summary_engine_output.get("quality", {}) or {}

    # meeting_summary (structure interne : contexte, key-points, décisions…)
    sections = summary_engine_output.get("meeting_summary", {
        "context": "",
        "key_points": [],
        "decisions": [],
        "risks": [],
        "next_steps": []
    })

    # consulting summary (version haut niveau)
    # 👉 priorité au résumé consultant généré par IA
    consulting = (
        consulting_summary
        or summary_engine_output.get("consulting_summary")
        or summary_engine_output.get("consultant_summary")
        or {
            "context": "",
            "insights": [],
            "decisions": [],
            "risks": [],
            "recommendations": []
        }
    )

    # ------------------------------
    # 🎨 Extraction des thèmes
    # ------------------------------
    themes_detected = sorted({
        us.get("theme")
        for us in user_stories
        if isinstance(us, dict) and us.get("theme")
    })

    # ------------------------------
    # 📦 Construction du payload JSON
    # ------------------------------
    summary: Dict[str, Any] = {
        "meeting_id": meeting_id,
        "audio_path": str(audio_path),
        "created_at": datetime.now().isoformat(),

        # ---- Données IA principales ----
        "user_stories": user_stories,
        "user_stories_count": len(user_stories),
        "themes": themes_detected,
        "quality": quality,
        "sections": sections,
        "top_user_stories": _extract_top_user_stories(user_stories),

        # ---- Version consulting ----
        "consulting_summary": consulting,
    }

    # ------------------------------
    # 💾 Sauvegarde JSON
    # ------------------------------
    summary_path = meeting_dir / "meeting_summary.json"
    with summary_path.open("w", encoding="utf-8") as f:
        json.dump(summary, f, ensure_ascii=False, indent=2)

    print(f"📊 Résumé meeting sauvegardé : {summary_path}")
    return summary


# =====================================================================
# 🏆 Helper : sélection des Top User Stories
# =====================================================================

def _extract_top_user_stories(
    user_stories: List[Any],
    limit: int = 3
) -> List[Dict[str, Any]]:
    """
    Sélectionne les meilleures US (fallback safe).
    """
    top: List[Dict[str, Any]] = []

    for us in user_stories[:limit]:
        if isinstance(us, dict):
            top.append({
                "title": us.get("title", "Sans titre"),
                "priority": us.get("priority", "normal"),
                "theme": us.get("theme", ""),
            })
        else:
            top.append({
                "title": str(us),
                "priority": "normal",
                "theme": "",
            })

    return top
