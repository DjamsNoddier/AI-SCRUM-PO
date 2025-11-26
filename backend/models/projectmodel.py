#backend/models/projectmodel.py

from datetime import datetime
from typing import Optional
from sqlmodel import Field, SQLModel # Utilisation de SQLModel pour l'intégration Pydantic/SQLAlchemy

class Project(SQLModel, table=True):
    """
    Modèle de base de données pour un Projet.
    (AC: Le projet est sauvegardé en base de données. Chaque projet a un identifiant unique.)
    """
    id: Optional[int] = Field(default=None, primary_key=True) # AC: Identifiant unique (auto-incrémenté)
    
    # AC: Titre du projet (obligatoire)
    title: str = Field(index=True, max_length=100)
    
    # AC: Description libre (obligatoire)
    description: str = Field(max_length=500)

    objectives: Optional[str] = Field(default=None, max_length=500)
    
    # Sécurité: Lien vers l'utilisateur qui a créé le projet
    owner_id: int = Field(foreign_key="user.id", index=True) 
    
    # Métadonnées
    created_at: datetime = Field(default_factory=datetime.utcnow, nullable=False)
    updated_at: datetime = Field(default_factory=datetime.utcnow, nullable=False)

    model_config = {
    "from_attributes": True
    }
