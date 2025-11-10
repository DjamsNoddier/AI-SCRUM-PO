"""
api/main.py
------------
Serveur FastAPI pour exposer les endpoints du projet AI Scrum PO Assistant.

Endpoints :
- GET /ping → test basique de disponibilité
"""

from fastapi import FastAPI
from fastapi.responses import JSONResponse

app = FastAPI(
    title="AI Scrum PO Assistant API",
    description="API REST du moteur d'analyse et de génération d'User Stories",
    version="1.0.0",
)


@app.get("/ping", tags=["healthcheck"])
def ping():
    """
    Vérifie que le serveur fonctionne correctement.
    """
    return JSONResponse(content={"status": "ok", "message": "API opérationnelle 🚀"})

from pathlib import Path
import json
from fastapi import HTTPException

SESSIONS_DIR = Path("input/sessions")

@app.get("/api/sessions/latest", tags=["sessions"])
def get_latest_session():
    """
    Retourne le contenu du dernier summary.json généré.
    """
    # Vérifie si le répertoire existe
    if not SESSIONS_DIR.exists():
        raise HTTPException(status_code=404, detail="Répertoire de sessions introuvable")

    # Récupère les sessions triées par date de modification
    sessions = sorted(SESSIONS_DIR.glob("session_*"), key=lambda p: p.stat().st_mtime, reverse=True)
    if not sessions:
        raise HTTPException(status_code=404, detail="Aucune session disponible")

    latest = sessions[0]
    summary_path = latest / "summary.json"
    meta_path = latest / "metadata.json"

    if not summary_path.exists():
        raise HTTPException(status_code=404, detail=f"Fichier summary.json manquant dans {latest.name}")

    # Lecture du fichier JSON
    try:
        with open(summary_path, "r", encoding="utf-8") as f:
            summary = json.load(f)
        if meta_path.exists():
            with open(meta_path, "r", encoding="utf-8") as f:
                summary["metadata"] = json.load(f)
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Erreur de lecture du résumé : {str(e)}")

    return summary



# point d’entrée
if __name__ == "__main__":
    import uvicorn
    uvicorn.run("api.main:app", host="0.0.0.0", port=8000, reload=True)
