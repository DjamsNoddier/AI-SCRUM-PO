from datetime import datetime
from fastapi import APIRouter, Depends, status, HTTPException
from typing import List

from pydantic import BaseModel
from sqlmodel import Session, select

# --- Imports internes ---
from backend.schemas.project import ProjectCreate, ProjectResponse
from backend.models.projectmodel import Project as DBProject
from backend.core.security import get_current_user
from backend.core.db import get_session

router = APIRouter(
    prefix="/projects",
    tags=["Projects"],
)


# ============================================================
# ✅ 1) CRÉATION DE PROJET (EXISTANT – CORRIGÉ)
# ============================================================

@router.post(
    "/",
    response_model=ProjectResponse,
    status_code=status.HTTP_201_CREATED,
    summary="Créer un nouveau projet"
)
def create_project(
    project_in: ProjectCreate,
    db: Session = Depends(get_session),
    current_user = Depends(get_current_user)
):
    """
    Crée un projet appartenant à l'utilisateur authentifié.
    """

    db_project = DBProject(
        title=project_in.title,
        description=project_in.description,
        # On récupère objectives seulement si le schéma le définit, sinon None
        objectives=getattr(project_in, "objectives", None),
        owner_id=current_user.id,
    )

    try:
        db.add(db_project)
        db.commit()
        db.refresh(db_project)
    except Exception as e:
        db.rollback()
        raise HTTPException(
            status_code=500,
            detail=f"Erreur lors de la sauvegarde du projet: {e}"
        )

    return db_project

# ============================================================
# ✅ 2) LISTER LES PROJETS DE L'UTILISATEUR (EXISTANT)
# ============================================================

@router.get(
    "/",
    response_model=List[ProjectResponse],
    summary="Lister les projets de l’utilisateur"
)
def read_projects(
    db: Session = Depends(get_session),
    current_user = Depends(get_current_user)
):
    """
    Retourne tous les projets appartenant à l’utilisateur connecté.
    """
    statement = select(DBProject).where(DBProject.owner_id == current_user.id)
    projects = db.exec(statement).all()
    return projects


# ============================================================
# 🔥 3) ENDPOINTS POUR PROJECT VIEW
# ============================================================

# --- Modèles simples pour les mocks (pas SQLModel) ---

class ProjectDocument(BaseModel):
    id: str
    name: str
    url: str
    created_at: datetime | None = None


class ProjectSession(BaseModel):
    id: str
    title: str
    created_at: datetime
    status: str | None = None


class ProjectStats(BaseModel):
    decisions: int
    risks: int
    user_stories: int


# ============================================================
# 🔥 MOCK DATA TEMPORAIRE POUR TESTER LE FRONT
# ============================================================

DEMO_PROJECT_ID = 1  # tu peux mettre 1, cohérent avec SQLModel auto-incrémenté

demo_documents: List[ProjectDocument] = [
    ProjectDocument(
        id="doc-1",
        name="Roadmap v1",
        url="https://example.com/roadmap-v1.pdf",
        created_at=datetime(2025, 1, 2, 9, 0)
    ),
    ProjectDocument(
        id="doc-2",
        name="Discovery notes",
        url="https://example.com/discovery-notes",
        created_at=datetime(2025, 1, 3, 14, 30)
    ),
]

demo_sessions: List[ProjectSession] = [
    ProjectSession(
        id="sess-1",
        title="Kick-off & scope",
        created_at=datetime(2025, 1, 5, 15, 0),
        status="READY",
    ),
    ProjectSession(
        id="sess-2",
        title="Design review",
        created_at=datetime(2025, 1, 12, 11, 30),
        status="READY",
    ),
    ProjectSession(
        id="sess-3",
        title="Refinement – Sprint 14",
        created_at=datetime(2025, 1, 20, 16, 0),
        status="PROCESSING",
    ),
]

demo_stats = ProjectStats(decisions=5, risks=2, user_stories=12)


# ============================================================
# ✅ 4) GET SINGLE PROJECT (VERSION DB)
# ============================================================

@router.get("/{project_id}", response_model=ProjectResponse)
def get_project(
    project_id: int,
    db: Session = Depends(get_session),
    current_user = Depends(get_current_user),
):
    """
    Retourne le projet réel de la base (pas mock).
    """
    project = db.get(DBProject, project_id)

    if not project or project.owner_id != current_user.id:
        raise HTTPException(404, "Project not found")

    return project


# ============================================================
# ✅ 5) DOCUMENTS DU PROJET (Mock pour l’instant)
# ============================================================

@router.get("/{project_id}/documents", response_model=List[ProjectDocument])
def get_project_documents(project_id: int):
    """
    Mock: documents du projet.
    """
    if project_id != DEMO_PROJECT_ID:
        return []  # safe pour le front

    return demo_documents


# ============================================================
# ✅ 6) SESSIONS DU PROJET (Mock pour l’instant)
# ============================================================

@router.get("/{project_id}/sessions", response_model=List[ProjectSession])
def get_project_sessions(project_id: int):
    """
    Mock: sessions du projet.
    """
    if project_id != DEMO_PROJECT_ID:
        return []

    return demo_sessions


# ============================================================
# ✅ 7) STATISTIQUES DU PROJET (Mock pour l’instant)
# ============================================================

@router.get("/{project_id}/stats", response_model=ProjectStats)
def get_project_stats(project_id: int):
    """
    Mock: statistiques globales du projet.
    """
    if project_id != DEMO_PROJECT_ID:
        return ProjectStats(decisions=0, risks=0, user_stories=0)

    return demo_stats
