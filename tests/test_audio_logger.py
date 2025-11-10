"""
test_audio_logger.py
--------------------
Vérifie que le logger structuré trace bien les événements clés
du module audio_listener (session start/stop/pipeline).
"""

import json
from pathlib import Path
from backlog_generator.logger_manager import LOG_DIR, log_event, info
from backlog_generator.audio_listener import AudioListener
import time


def test_audio_session_logs(tmp_path):
    """Teste que le logger enregistre correctement les événements de session audio."""
    # 1️⃣ Démarre une session audio simulée
    listener = AudioListener()
    listener.start_listening()
    time.sleep(1)
    listener.stop_listening()

    # 2️⃣ Récupère le fichier de log du jour
    log_files = sorted(LOG_DIR.glob("*.log"), key=lambda p: p.stat().st_mtime, reverse=True)
    assert log_files, "❌ Aucun fichier de log trouvé."
    latest_log = log_files[0]

    # 3️⃣ Lit les lignes du log
    lines = latest_log.read_text(encoding="utf-8").splitlines()
    assert lines, "❌ Le fichier de log est vide."

    # 4️⃣ Vérifie la structure JSON
    json_lines = []
    for line in lines:
        try:
            data = json.loads(line)
            json_lines.append(data)
        except json.JSONDecodeError:
            continue

    assert json_lines, "❌ Aucune entrée JSON valide détectée."

    # 5️⃣ Vérifie la présence des logs essentiels
    start_logs = [l for l in json_lines if l.get("event") == "session_start"]
    stop_logs = [l for l in json_lines if l.get("event") == "session_stop"]

    assert start_logs, "❌ Aucun log de démarrage de session détecté."
    assert stop_logs, "❌ Aucun log d’arrêt de session détecté."

    # 6️⃣ Vérifie cohérence du session_id
    sid_start = start_logs[0].get("session_id")
    sid_stop = stop_logs[0].get("session_id")
    assert sid_start == sid_stop, f"❌ Session ID incohérent entre start ({sid_start}) et stop ({sid_stop})"

    print(f"✅ Test OK : Logs complets détectés pour la session {sid_start}")
