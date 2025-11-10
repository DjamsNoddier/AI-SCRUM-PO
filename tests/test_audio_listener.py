"""
tests/test_audio_listener.py
----------------------------
Vérifie que le module audio_listener :
 - crée bien un fichier audio .wav
 - crée le dossier de session
 - génère un fichier metadata.json valide
"""

import os
import json
import time
from pathlib import Path
from backlog_generator.audio_listener import AudioListener

def test_audio_session_creation():
    listener = AudioListener(output_dir="input/sessions")

    # 1️⃣ Démarrer brièvement l’enregistrement (2 secondes)
    listener.start_listening()
    time.sleep(2)
    listener.stop_listening()

    # 2️⃣ Vérifier que le dossier de session existe
    latest_session = sorted(Path("input/sessions").glob("session_*"))[-1]
    assert latest_session.exists(), "❌ Dossier de session non créé"

    # 3️⃣ Vérifier la présence du fichier audio
    audio_file = latest_session / "audio.wav"
    assert audio_file.exists(), "❌ Fichier audio non généré"

    # 4️⃣ Vérifier la présence du fichier JSON
    metadata_file = latest_session / "metadata.json"
    assert metadata_file.exists(), "❌ Fichier metadata.json manquant"

    # 5️⃣ Vérifier la validité du JSON
    with open(metadata_file, "r", encoding="utf-8") as f:
        data = json.load(f)
    assert "session_id" in data, "❌ Champ 'session_id' manquant dans le JSON"
    assert "audio_file" in data, "❌ Champ 'audio_file' manquant dans le JSON"

    print("✅ Test passé avec succès : session audio complète et métadonnées valides.")

if __name__ == "__main__":
    test_audio_session_creation()
