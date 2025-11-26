"""
test_transcribe_endpoint.py
---------------------------
Teste le flux complet d'upload audio → exécution du pipeline → création du résumé.
Le pipeline Groq est mocké pour éviter tout appel externe.
"""

import io
import json
from pathlib import Path
from fastapi.testclient import TestClient
from unittest.mock import patch
from api.main import app

client = TestClient(app)
SESSIONS_DIR = Path("input/sessions")

@patch("api.routes.sessions.process_audio_feedback")
def test_transcribe_audio_creates_session(mock_process):
    """
    Vérifie que :
    - le POST /api/v1/sessions/transcribe fonctionne
    - le backend crée un dossier de session avec summary.json
    - la réponse contient les bons champs
    """

    # 1️⃣ Mock du pipeline pour éviter l’appel à Groq
    mock_process.return_value = [
        {
            "theme": "Dashboard",
            "title": "Afficher les stats de session",
            "idea": "L’utilisateur veut voir le score global",
            "confidence": 0.9,
            "priority": "High",
            "acceptance_criteria": ["Afficher le score global sur le dashboard"],
        }
    ]

    # 2️⃣ Création d’un faux fichier audio (buffer WAV minimal)
    fake_audio = io.BytesIO(b"RIFF....WAVEfmt ")  # header minimal d’un WAV
    fake_audio.name = "test.wav"

    # 3️⃣ Envoi de la requête POST
    response = client.post(
        "/api/v1/sessions/transcribe",
        files={"file": ("test.wav", fake_audio, "audio/wav")},
    )

    # 4️⃣ Vérifications de base
    assert response.status_code == 200
    data = response.json()

    # Champs essentiels
    for key in ["session_id", "user_stories", "user_stories_count"]:
        assert key in data

    # 5️⃣ Vérifie la création physique du dossier
    session_path = SESSIONS_DIR / data["session_id"]
    assert session_path.exists(), "Le dossier de session n'a pas été créé."
    assert (session_path / "summary.json").exists(), "Le fichier summary.json est manquant."

    # 6️⃣ Vérifie que le mock a bien été appelé une seule fois
    mock_process.assert_called_once()

    print("\n✅ Test /api/v1/sessions/transcribe passé avec succès !")
