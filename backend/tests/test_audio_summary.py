"""
test_audio_summary.py
---------------------
Vérifie la cohérence du fichier summary.json généré
après une session audio complète.

Fait partie du projet : AI Scrum PO Assistant
Auteur : Djamil
"""

import json
from pathlib import Path
import pytest

SESSIONS_DIR = Path("input/sessions")

def test_summary_json_exists():
    """Vérifie que le dernier résumé de session existe et est valide."""
    sessions = sorted(SESSIONS_DIR.glob("session_*"), key=lambda p: p.stat().st_mtime, reverse=True)
    assert sessions, "❌ Aucune session détectée dans input/sessions"
    latest = sessions[0]
    summary_path = latest / "summary.json"
    meta_path = latest / "metadata.json"

    # existence
    assert summary_path.exists(), f"❌ Le fichier summary.json est manquant dans {latest}"
    assert meta_path.exists(), f"❌ Le fichier metadata.json est manquant dans {latest}"

    # lecture
    with open(summary_path, "r", encoding="utf-8") as f:
        summary = json.load(f)
    with open(meta_path, "r", encoding="utf-8") as f:
        meta = json.load(f)

    # validations structurelles (ajustées à la réalité)
    required_fields = ["session_id", "audio_file", "duration_sec"]
    for field in required_fields:
        assert field in summary, f"❌ Champ manquant dans summary.json : {field}"

    # le score global peut être dans quality.global_score
    score_global = (
        summary.get("score_global")
        or summary.get("quality", {}).get("global_score")
    )
    assert score_global is not None, "❌ Champ score_global manquant ou invalide"
    assert isinstance(score_global, (float, int)), "❌ Type du score invalide"
    assert 0 <= score_global <= 1, "❌ Score global hors bornes (0–1)"

    # cohérence
    assert summary["session_id"] == meta["session_id"], "❌ Incohérence entre metadata et summary (ID)"
    assert Path(summary["audio_file"]).exists(), "❌ Le chemin audio référencé est invalide"
    assert summary["duration_sec"] >= 0, "❌ Durée incohérente"

    print(f"✅ Test OK : Résumé cohérent ({summary['session_id']}) — Score {score_global}")
