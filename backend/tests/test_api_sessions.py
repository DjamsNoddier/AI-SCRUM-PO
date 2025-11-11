"""
test_api_sessions.py
--------------------
Teste l'endpoint GET /api/sessions/latest de l'API FastAPI.

Fait partie du projet : AI Scrum PO Assistant
Auteur : Djamil
"""

import json
from pathlib import Path
from fastapi.testclient import TestClient
from api.main import app

client = TestClient(app)
SESSIONS_DIR = Path("input/sessions")



def test_latest_session_endpoint():
    """Vérifie que l'API retourne un résumé de session cohérent."""
    # Vérifie qu'au moins une session existe
    sessions = sorted(SESSIONS_DIR.glob("session_*"), key=lambda p: p.stat().st_mtime, reverse=True)
    assert sessions, "❌ Aucune session disponible pour le test"

    response = client.get("/api/sessions/latest")
    assert response.status_code == 200, f"❌ Statut inattendu : {response.status_code}"

    data = response.json()
    assert isinstance(data, dict), "❌ La réponse n'est pas un JSON valide"

    # Champs minimums
    required_fields = ["session_id", "audio_file", "duration_sec"]
    for field in required_fields:
        assert field in data, f"❌ Champ manquant : {field}"

    # Vérifie cohérence du fichier audio
    audio_path = Path(data["audio_file"])
    assert audio_path.exists(), f"❌ Fichier audio inexistant : {audio_path}"

    # Vérifie cohérence du résumé qualité
    quality = data.get("quality", {})
    assert "global_score" in quality, "❌ Champ quality.global_score manquant"
    assert 0 <= quality["global_score"] <= 1, "❌ Score global hors bornes"

    # Vérifie que les métadonnées sont bien présentes
    assert "metadata" in data, "❌ Métadonnées manquantes"
    meta = data["metadata"]
    assert meta.get("session_id") == data["session_id"], "❌ Incohérence entre metadata et summary"

    print(f"✅ API OK : dernière session = {data['session_id']} — Score {quality['global_score']}")
