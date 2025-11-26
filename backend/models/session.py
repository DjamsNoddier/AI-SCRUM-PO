# backend/models/session.py

from sqlmodel import SQLModel, Field, Column, JSON
from typing import Optional
from datetime import datetime
import uuid


class MeetingSession(SQLModel, table=True):
    id: str = Field(default_factory=lambda: str(uuid.uuid4()), primary_key=True)
    user_id: int = Field(foreign_key="user.id")  # adapt if needed
    project_id: int | None = None    # 👈 vérifier que ça existe
    title: str
    created_at: datetime = Field(default_factory=datetime.utcnow)

    # Résumé IA
    summary: Optional[dict] = Field(default=None, sa_column=Column(JSON))
    top_user_stories: Optional[list] = Field(default=None, sa_column=Column(JSON))
    consulting_summary: Optional[dict] = Field(default=None, sa_column=Column(JSON))

    # Métadonnées
    decisions: int = 0
    risks: int = 0
    user_stories_count: int = 0
