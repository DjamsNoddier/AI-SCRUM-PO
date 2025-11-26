# backend/api/routes/meetings.py

"""
Routes pour l’enregistrement et le traitement des meetings audio.

Flux global :
1. /meetings/create       → crée une MeetingSession (DB)
2. /meetings/start        → crée un dossier temporaire et un meeting_id
3. /meetings/upload-chunk → reçoit les chunks audio (WAV)
4. /meetings/finalize     → concatène, lance le pipeline IA, sauvegarde le résumé
5. /meetings/             → liste les sessions de l’utilisateur
6. /meetings/{session_id} → détails d’un meeting (résumé IA + métadonnées)
"""

from __future__ import annotations

import re
import shutil
import subprocess
import unicodedata
from datetime import datetime
from pathlib import Path
from uuid import uuid4
from typing import Any

from fastapi import (
    APIRouter,
    Depends,
    File,
    Form,
    HTTPException,
    UploadFile,
)
from fastapi.responses import JSONResponse
from pydantic import BaseModel
from sqlmodel import Session as SQLModelSession

from backend.backlog_generator.audio_transcriber import (
    process_audio_feedback,
    generate_consulting_summary,
)
from backend.backlog_generator.logger_manager import info, error, warn
from backend.backlog_generator.meeting_summary import generate_meeting_summary
from backend.core.db import get_session
from backend.core.security import get_current_user
from backend.models.projectmodel import Project
from backend.models.session import MeetingSession
from backend.repositories.user_repo import User

# -------------------------------------------------------------------
# Router & chemins de stockage
# -------------------------------------------------------------------

router = APIRouter(prefix="/meetings", tags=["meetings"])

MEETINGS_DIR = Path("input/meetings")
MEETINGS_DIR.mkdir(parents=True, exist_ok=True)

PROJECTS_DIR = Path("input/projects")
PROJECTS_DIR.mkdir(parents=True, exist_ok=True)


# -------------------------------------------------------------------
# Utils
# -------------------------------------------------------------------

def slugify(text: str) -> str:
    """
    Normalise un texte en slug (ASCII, minuscules, séparé par des tirets).
    """
    text_norm = unicodedata.normalize("NFKD", text).encode("ascii", "ignore").decode("ascii")
    text_norm = re.sub(r"[^a-zA-Z0-9]+", "-", text_norm)
    return text_norm.strip("-").lower()


def build_meeting_folder_name(title: str, meeting_id: str) -> str:
    """
    Transforme un titre en slug, puis concatène avec l'ID de meeting.

    Exemple :
        title = "Daily AEGIR"
        meeting_id = "meeting_2025-11-22_103211_a93f"
        → "daily-aegir-2025-11-22-103211-a93f"
    """
    title_slug = slugify(title) if title else "meeting"
    clean_id = meeting_id.replace("meeting_", "").replace("_", "-")
    return f"{title_slug}-{clean_id}"


def concat_chunks_with_ffmpeg(chunks: list[Path], output_path: Path, meeting_dir: Path) -> None:
    """
    Concatène les chunks WAV avec ffmpeg en un seul fichier WAV mono 16 kHz.
    Utilise le demuxer 'concat' + fichier de liste.
    """
    if not chunks:
        raise ValueError("Aucun chunk à concaténer")

    concat_list = meeting_dir / "chunks.txt"
    with concat_list.open("w", encoding="utf-8") as f:
        for c in chunks:
            f.write(f"file '{c.resolve()}'\n")

    cmd = [
        "ffmpeg",
        "-y",
        "-f",
        "concat",
        "-safe",
        "0",
        "-i",
        str(concat_list),
        "-acodec",
        "pcm_s16le",
        "-ar",
        "16000",
        "-ac",
        "1",
        str(output_path),
    ]

    try:
        subprocess.run(
            cmd,
            check=True,
            stdout=subprocess.DEVNULL,
            stderr=subprocess.DEVNULL,
        )
    except subprocess.CalledProcessError as e:
        error("Erreur ffmpeg concat", error=str(e), cmd=" ".join(cmd))
        raise HTTPException(status_code=500, detail="Erreur lors de la concaténation audio.")


# -------------------------------------------------------------------
# 0️⃣ Création d’un meeting côté filesystem (avant chunks)
# -------------------------------------------------------------------

@router.post("/start")
async def start_meeting() -> dict[str, str]:
    """
    Crée un identifiant de meeting et le dossier temporaire associé.
    Utilisé par le frontend avant d'envoyer les chunks.
    """
    meeting_id = f"meeting_{datetime.now().strftime('%Y-%m-%d_%H%M%S')}_{uuid4().hex[:4]}"
    meeting_dir = MEETINGS_DIR / meeting_id
    (meeting_dir / "chunks").mkdir(parents=True, exist_ok=True)

    info("Meeting démarré", meeting_id=meeting_id, path=str(meeting_dir))
    return {"meeting_id": meeting_id}


# -------------------------------------------------------------------
# 1️⃣ Upload d’un chunk audio
# -------------------------------------------------------------------

@router.post("/upload-chunk")
async def upload_chunk(
    meeting_id: str = Form(...),
    index: int = Form(...),
    file: UploadFile = File(...),
) -> dict[str, str]:
    """
    Reçoit un chunk audio (WAV) et le sauvegarde sous :
        input/meetings/{meeting_id}/chunks/chunk_XXX.wav
    """
    try:
        chunks_dir = MEETINGS_DIR / meeting_id / "chunks"
        chunks_dir.mkdir(parents=True, exist_ok=True)

        chunk_path = chunks_dir / f"chunk_{index:03d}.wav"
        with chunk_path.open("wb") as buffer:
            shutil.copyfileobj(file.file, buffer)

        info("Chunk reçu", meeting_id=meeting_id, index=index, path=str(chunk_path))
        return {"status": "ok"}

    except Exception as e:
        error("Erreur upload chunk", meeting_id=meeting_id, error=str(e))
        raise HTTPException(status_code=500, detail="Erreur lors de l'upload du chunk.")


# -------------------------------------------------------------------
# 2️⃣ Finalisation du meeting (concat + IA + résumé)
# -------------------------------------------------------------------

@router.post("/finalize")
async def finalize(
    meeting_id: str = Form(...),
    session_id: str = Form(...),
    current_user: User = Depends(get_current_user),
    db: SQLModelSession = Depends(get_session),
) -> JSONResponse:
    """
    Finalise un meeting :
    - concatène les chunks en un enregistrement unique
    - lance le pipeline IA (user stories + qualité)
    - génère un résumé structuré (meeting_summary)
    - génère un résumé consultant (consulting_summary)
    - met à jour la MeetingSession en base
    """
    temp_meeting_dir = MEETINGS_DIR / meeting_id
    chunks_dir = temp_meeting_dir / "chunks"

    if not chunks_dir.exists():
        raise HTTPException(status_code=404, detail="Aucun chunk trouvé pour ce meeting.")

    # Récupération de tous les chunks WAV
    chunks = sorted(chunks_dir.glob("chunk_*.wav"))
    if not chunks:
        raise HTTPException(status_code=404, detail="Aucun chunk audio disponible.")

    # 1️⃣ Concaténation dans le dossier temporaire
    temp_final_audio = temp_meeting_dir / "recording.wav"
    concat_chunks_with_ffmpeg(chunks, temp_final_audio, temp_meeting_dir)

    # 2️⃣ Récupération de la session DB
    db_session: MeetingSession | None = (
        db.query(MeetingSession)
        .filter(
            MeetingSession.id == session_id,
            MeetingSession.user_id == current_user.id,
        )
        .first()
    )

    if not db_session:
        raise HTTPException(status_code=404, detail="Session DB introuvable.")

    project_id = db_session.project_id

    # 3️⃣ Déplacement éventuel dans un dossier projet
    if project_id is None:
        # Pas de projet → on laisse dans /input/meetings
        final_meeting_dir = temp_meeting_dir
        final_audio = temp_final_audio
    else:
        project: Project | None = db.query(Project).filter(Project.id == project_id).first()

        if project:
            project_slug = slugify(project.title)
            project_folder = f"{project_slug}-{project.id}"
        else:
            # fallback rare : on garde l’ID brut
            project_folder = f"project-{project_id}"

        meeting_folder_name = build_meeting_folder_name(db_session.title, meeting_id)
        final_meeting_dir = PROJECTS_DIR / project_folder / "meetings" / meeting_folder_name

        # En cas de collision (très rare), on ajoute un suffixe
        if final_meeting_dir.exists():
            final_meeting_dir = PROJECTS_DIR / project_folder / "meetings" / (
                f"{meeting_folder_name}-{uuid4().hex[:4]}"
            )

        # Création du dossier parent
        final_meeting_dir.parent.mkdir(parents=True, exist_ok=True)

        # Déplacement du dossier temporaire vers le dossier projet
        shutil.move(str(temp_meeting_dir), str(final_meeting_dir))

        # Suppression des chunks (une fois concaténés)
        shutil.rmtree(final_meeting_dir / "chunks", ignore_errors=True)

        final_audio = final_meeting_dir / "recording.wav"

    # 4️⃣ Pipeline IA : US + qualité + (optionnellement) segmentation
    try:
        ia_result: dict[str, Any] = process_audio_feedback(str(final_audio))
        info(
            "Pipeline IA terminé",
            meeting_id=meeting_id,
            user_stories=len(ia_result.get("user_stories", [])),
        )
    except Exception as e:
        error("Erreur pipeline IA", meeting_id=meeting_id, error=str(e))
        ia_result = {
            "user_stories": [],
            "quality": {},
            "meeting_summary": {},
        }

    # 4.b Résumé consultant (optionnel mais encapsulé proprement)
    consulting_summary: dict[str, Any] | None = None
    try:
        consulting_summary = generate_consulting_summary(
            ia_result.get("transcription", ""),
            ia_result.get("user_stories", []),
        )
    except Exception as e:
        warn("Erreur résumé consultant", meeting_id=meeting_id, error=str(e))
        consulting_summary = None

    # 4.c Construction du résumé global (meeting_summary.json)
    try:
        summary = generate_meeting_summary(
            meeting_id=meeting_id,
            audio_path=final_audio,
            summary_engine_output=ia_result,
            consulting_summary=consulting_summary,
            meeting_dir=final_meeting_dir,
        )
    except Exception as e:
        error("Erreur résumé meeting", meeting_id=meeting_id, error=str(e))
        # Fallback minimal si le builder plante
        summary = {
            "meeting_id": meeting_id,
            "audio_path": str(final_audio),
            "created_at": datetime.utcnow().isoformat(),
            "user_stories_count": len(ia_result.get("user_stories", [])),
            "themes": [],
            "quality": ia_result.get("quality", {}),
            "user_stories": ia_result.get("user_stories", []),
            "sections": {
                "context": "",
                "key_points": [],
                "decisions": [],
                "risks": [],
                "next_steps": [],
            },
            "top_user_stories": [],
            "consulting_summary": consulting_summary or {
                "context": "",
                "insights": [],
                "decisions": [],
                "risks": [],
                "recommendations": [],
            },
        }

    # 5️⃣ Mise à jour DB
    db_session.summary = summary
    db_session.top_user_stories = summary.get("top_user_stories", [])
    db_session.user_stories_count = summary.get(
        "user_stories_count", len(summary.get("user_stories", []))
    )
    db_session.decisions = len(summary.get("sections", {}).get("decisions", []))
    db_session.risks = len(summary.get("sections", {}).get("risks", []))

    # Si la colonne consulting_summary existe dans le modèle, cette ligne est OK.
    # Sinon, elle sera simplement ignorée par SQLModel / provoquerait une erreur.
    if hasattr(db_session, "consulting_summary"):
        setattr(
            db_session,
            "consulting_summary",
            summary.get("consulting_summary", {}),
        )

    db.add(db_session)
    db.commit()
    db.refresh(db_session)

    return JSONResponse(content=summary)


# -------------------------------------------------------------------
# 3️⃣ Création d’une session de meeting (DB)
# -------------------------------------------------------------------

class CreateMeetingIn(BaseModel):
    title: str
    project_id: int | None = None


@router.post("/create")
def create_session(
    payload: CreateMeetingIn,
    current_user: User = Depends(get_current_user),
    session: SQLModelSession = Depends(get_session),
) -> dict[str, str]:
    """
    Crée une MeetingSession en base de données.
    Utilisée par le frontend avant de lancer l’enregistrement audio.
    """
    new_session = MeetingSession(
        title=payload.title,
        user_id=current_user.id,
        project_id=payload.project_id,
    )

    session.add(new_session)
    session.commit()
    session.refresh(new_session)

    info(
        "MeetingSession créée",
        session_id=new_session.id,
        user_id=current_user.id,
        project_id=payload.project_id,
    )

    return {"session_id": new_session.id}


# -------------------------------------------------------------------
# 4️⃣ Liste des sessions de l’utilisateur courant
# -------------------------------------------------------------------

@router.get("/")
def list_sessions(
    current_user: User = Depends(get_current_user),
    session: SQLModelSession = Depends(get_session),
):
    """
    Retourne toutes les MeetingSession de l'utilisateur courant,
    triées de la plus récente à la plus ancienne.
    """
    sessions_db = (
        session.query(MeetingSession)
        .filter(MeetingSession.user_id == current_user.id)
        .order_by(MeetingSession.created_at.desc())
        .all()
    )

    return sessions_db


# -------------------------------------------------------------------
# 5️⃣ Détail d’un meeting (par session_id)
# -------------------------------------------------------------------

@router.get("/{session_id}")
def get_meeting_details(
    session_id: str,
    current_user: User = Depends(get_current_user),
    db: SQLModelSession = Depends(get_session),
):
    """
    Retourne les détails d'une MeetingSession :
    - métadonnées (titre, date)
    - résumé IA structuré
    - top user stories
    - compteurs décisions / risques / nb US
    """
    db_session: MeetingSession | None = (
        db.query(MeetingSession)
        .filter(
            MeetingSession.id == session_id,
            MeetingSession.user_id == current_user.id,
        )
        .first()
    )

    if not db_session:
        raise HTTPException(status_code=404, detail="Meeting introuvable.")

    return {
        "session_id": db_session.id,
        "title": db_session.title,
        "created_at": db_session.created_at,
        "summary": db_session.summary or {},
        "top_user_stories": db_session.top_user_stories or [],
        "decisions": db_session.decisions,
        "risks": db_session.risks,
        "user_stories_count": db_session.user_stories_count,
    }
