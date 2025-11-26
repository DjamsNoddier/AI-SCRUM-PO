"""
Serveur FastAPI pour exposer les endpoints du projet AI Scrum PO Assistant.
"""

from fastapi import FastAPI
from fastapi.responses import JSONResponse
from fastapi.middleware.cors import CORSMiddleware
from .routes.meetings import router as meetings_router
from .routes.sessions import router as sessions_router
from .routes.auth import router as auth_router
from .routes.project import router as project_router
from backend.core.db import init_db   

app = FastAPI(
    title="AI Scrum PO Assistant API",
    description="API REST du moteur d'analyse et de génération d'User Stories",
    version="1.0.0",
)

init_db()

# CORS pour le frontend local
origins = [
    "http://localhost:5173",
    "http://127.0.0.1:5173",
]
app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Healthcheck
@app.get("/ping", tags=["healthcheck"])
def ping():
    return JSONResponse(content={"status": "ok", "message": "API opérationnelle 🚀"})


# --- Routers versionnés ---
# v1
app.include_router(sessions_router, prefix="/api/v1")
app.include_router(meetings_router, prefix="/api/v1")
app.include_router(auth_router, prefix="/api/v1")
app.include_router(project_router, prefix="/api/v1")



# point d’entrée
if __name__ == "__main__":
    import uvicorn
    uvicorn.run("api.main:app", host="0.0.0.0", port=8000, reload=True)
