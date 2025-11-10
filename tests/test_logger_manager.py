"""
test_logger_manager.py
----------------------
Vérifie la création et la validité des logs structurés JSON.
"""

import json
from pathlib import Path
from backlog_generator.logger_manager import log_event, LOG_DIR


def test_logger_json_creation(tmp_path):
    """Teste la création d'un fichier de log structuré JSON valide."""
    # 1️⃣ Simule un log
    log_event("INFO", "Test de log structuré", session_id="test_123", module="unit_test")

    # 2️⃣ Vérifie la présence du fichier du jour
    today_log = LOG_DIR / f"{Path().cwd().stem}.log"
    log_files = list(LOG_DIR.glob("*.log"))
    assert log_files, "❌ Aucun fichier de log créé"
    latest_log = sorted(log_files, key=lambda p: p.stat().st_mtime, reverse=True)[0]

    # 3️⃣ Vérifie la structure JSON
    with open(latest_log, "r", encoding="utf-8") as f:
        lines = f.readlines()
    assert lines, "❌ Le fichier de log est vide"

    # 4️⃣ Vérifie que le JSON est valide
    last_entry = json.loads(lines[-1])
    assert "timestamp" in last_entry, "❌ Champ 'timestamp' manquant"
    assert "level" in last_entry, "❌ Champ 'level' manquant"
    assert "message" in last_entry, "❌ Champ 'message' manquant"
    assert last_entry["level"] == "INFO", "❌ Mauvais niveau de log"
    assert last_entry["message"] == "Test de log structuré", "❌ Message incorrect"

    print(f"✅ Test OK : Log structuré valide → {latest_log.name}")
