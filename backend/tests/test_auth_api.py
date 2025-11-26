
from fastapi.testclient import TestClient
from api.main import app
from core.db import init_db
from pathlib import Path

client = TestClient(app)



def setup_module(_):
    # Nettoie la DB de test si nécessaire
    db_path = Path("backend/input/db/mindloop.sqlite")
    if db_path.exists():
        db_path.unlink()
    init_db()


def test_signup_then_login_ok():
    """Teste l’inscription + connexion standard"""
    r = client.post("/api/v1/auth/signup", json={"email": "alice@example.com", "password": "supersecret"})
    assert r.status_code == 200
    data = r.json()
    assert "access_token" in data
    assert data["user"]["email"] == "alice@example.com"

    # Login
    r2 = client.post("/api/v1/auth/login", json={"email": "alice@example.com", "password": "supersecret"})
    assert r2.status_code == 200
    d2 = r2.json()
    assert "access_token" in d2
    assert d2["user"]["email"] == "alice@example.com"


def test_signup_conflict():
    """Vérifie qu'on ne peut pas s'inscrire deux fois avec le même email"""
    client.post("/api/v1/auth/signup", json={"email": "dup@example.com", "password": "12345678"})
    r = client.post("/api/v1/auth/signup", json={"email": "dup@example.com", "password": "87654321"})
    assert r.status_code == 409


