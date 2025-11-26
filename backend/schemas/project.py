# Fichier: src/schemas/project.py
from pydantic import BaseModel, Field
from datetime import datetime
from typing import Optional

# --------------------------
# 1. Schéma de Requête (Entrée - POST)
# --------------------------
class ProjectCreate(BaseModel):
    """
    Schéma utilisé pour la création d'un nouveau projet (requête POST).
    """
    # AC: Titre du projet (obligatoire)
    title: str = Field(..., min_length=3, max_length=100, description="Titre unique et clair du projet.")
    
    # AC: Description libre (obligatoire)
    description: str = Field(..., min_length=10, description="Description détaillée du projet.")

# --------------------------
# 2. Schéma de Réponse (Sortie - GET/POST)
# --------------------------
class ProjectResponse(ProjectCreate):
    """
    Schéma utilisé pour la réponse de l'API.
    Il inclut les données du modèle DB.
    """
    id: int
    owner_id: int
    created_at: datetime

    model_config = {
        "from_attributes": True
    }
