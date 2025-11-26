# backend/api/routes/sessions.py

from fastapi import APIRouter, UploadFile, File, HTTPException
from fastapi.responses import JSONResponse
from pathlib import Path
from datetime import datetime
import shutil
import json
import uuid
from backend.backlog_generator.audio_transcriber import process_audio_feedback
from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session as SQLASession

router = APIRouter(prefix="/sessions", tags=["sessions"])

# Dossier racine pour les meetings
MEETINGS_DIR = Path("input/meetings")  # 🆕 nouveau répertoire global
MEETINGS_DIR.mkdir(parents=True, exist_ok=True)

CURRENT_MEETING_ID = None  # 🆕 identifiant du meeting actif


# ------------------------------------------------------------
# 🧩 Fonction utilitaire pour créer ou retrouver le meeting actif
# ------------------------------------------------------------
def get_or_create_meeting_dir():
    """
    Retourne le dossier du meeting actif (le crée si nécessaire).
    Chaque meeting regroupe plusieurs enregistrements (part_xxx.wav).
    """
    global CURRENT_MEETING_ID

    if CURRENT_MEETING_ID is None:
        CURRENT_MEETING_ID = f"meeting_{datetime.now().strftime('%Y-%m-%d_%H%M')}_{uuid.uuid4().hex[:4]}"

    meeting_dir = MEETINGS_DIR / CURRENT_MEETING_ID
    (meeting_dir / "sessions").mkdir(parents=True, exist_ok=True)
    return meeting_dir


# ------------------------------------------------------------
# 🚀 Endpoint principal : reçoit un fichier audio
# ------------------------------------------------------------
@router.post("/transcribe")
async def transcribe_audio(file: UploadFile = File(...)):
    """
    🚀 Reçoit un fichier audio depuis le frontend et l’associe
    au meeting actif (ou en crée un nouveau).
    """
    try:
        # 1️⃣ Récupérer ou créer le dossier de meeting actif
        meeting_dir = get_or_create_meeting_dir()
        sessions_dir = meeting_dir / "sessions"

        # 2️⃣ Créer un nom de fichier unique pour la partie
        part_num = len(list(sessions_dir.glob("part_*.wav"))) + 1
        ext = ".webm" if "webm" in (file.content_type or "") else ".wav"
        audio_path = sessions_dir / f"part_{part_num:03d}{ext}"

        # 3️⃣ Sauvegarder le fichier audio
        with audio_path.open("wb") as buffer:
            shutil.copyfileobj(file.file, buffer)

        # 4️⃣ Exécuter le pipeline IA pour ce segment
        user_stories = process_audio_feedback(str(audio_path))

        # 5️⃣ Construire un résumé simple pour cette partie
        summary = {
            "meeting_id": CURRENT_MEETING_ID,
            "part_id": f"part_{part_num:03d}",
            "audio_path": str(audio_path),
            "user_stories_count": len(user_stories),
            "themes": sorted({us.get("theme", "") for us in user_stories}),
            "user_stories": user_stories,
        }

        # 6️⃣ Sauvegarder le résumé partiel
        summary_path = sessions_dir / f"part_{part_num:03d}_summary.json"
        summary_path.write_text(json.dumps(summary, ensure_ascii=False, indent=2), encoding="utf-8")

        # 7️⃣ Retourner la réponse au frontend
        return JSONResponse(content=summary)

    except Exception as e:
        import traceback
        print("\n❌ ERREUR SERVEUR :")
        traceback.print_exc()
        raise HTTPException(status_code=500, detail=f"Erreur lors du traitement audio : {e}")

# ------------------------------------------------------------
# 📄 Endpoint pour récupérer la dernière session (test & dashboard)
# ------------------------------------------------------------
@router.get("/latest")
def get_latest_session():
    """
    Retourne la dernière session analysée disponible.
    Utilisée par les tests et le futur dashboard PO.
    """
    try:
        # On parcourt tous les meetings
        meetings = sorted(MEETINGS_DIR.glob("meeting_*"), key=lambda p: p.stat().st_mtime, reverse=True)
        if not meetings:
            raise HTTPException(status_code=404, detail="Aucun meeting disponible")

        # On prend le dernier meeting
        latest_meeting = meetings[0]
        summaries = list(latest_meeting.rglob("summary.json")) or list(latest_meeting.rglob("*_summary.json"))

        if not summaries:
            raise HTTPException(status_code=404, detail="Aucun résumé de session trouvé")

        latest_summary = max(summaries, key=lambda p: p.stat().st_mtime)

        with open(latest_summary, "r", encoding="utf-8") as f:
            data = json.load(f)

        return JSONResponse(content=data)

    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Erreur lors de la récupération : {e}")

# ============================================================
# 📜 Liste des sessions locales
# ============================================================

SESSIONS_DIR = Path("input/sessions")

@router.get("/list")
async def list_sessions():
    """
    📜 Retourne la liste des sessions locales (mode terminal).
    Parcourt les dossiers de `input/sessions/` et lit les fichiers `summary.json`.
    """
    try:
        if not SESSIONS_DIR.exists():
            return JSONResponse(content={"sessions": []})

        sessions_data = []
        for session_dir in sorted(SESSIONS_DIR.glob("session_*"), reverse=True):
            summary_path = session_dir / "summary.json"
            if not summary_path.exists():
                continue

            try:
                with open(summary_path, "r", encoding="utf-8") as f:
                    summary = json.load(f)
                sessions_data.append({
                    "session_id": summary.get("session_id", session_dir.name),
                    "date": summary.get("started_at", ""),
                    "themes": summary.get("themes_detected", []),
                    "user_story_count": summary.get("user_story_count", 0),
                    "score": summary.get("quality", {}).get("global_score", 0.0),
                    "audio_file": summary.get("audio_file", "")
                })
            except Exception as e:
                print(f"⚠️ Erreur lecture résumé {summary_path}: {e}")

        return JSONResponse(content={"sessions": sessions_data})

    except Exception as e:
        print(f"❌ Erreur serveur list_sessions: {e}")
        raise HTTPException(status_code=500, detail=str(e))

router = APIRouter(prefix="/sessions", tags=["sessions"])
SESSIONS_DIR = Path("input/sessions")

#========


@router.get("/{session_id}")
async def get_session_details(session_id: str):
    """
    🔍 Retourne les détails complets d'une session donnée (résumé + métadonnées)
    """
    session_dir = SESSIONS_DIR / session_id
    if not session_dir.exists():
        raise HTTPException(status_code=404, detail=f"Session {session_id} introuvable")

    metadata_path = session_dir / "metadata.json"
    summary_path = session_dir / "summary.json"

    try:
        metadata = {}
        summary = {}

        if metadata_path.exists():
            with open(metadata_path, "r", encoding="utf-8") as f:
                metadata = json.load(f)
        if summary_path.exists():
            with open(summary_path, "r", encoding="utf-8") as f:
                summary = json.load(f)

        return JSONResponse(content={
            "session_id": session_id,
            "metadata": metadata,
            "summary": summary,
            "top_user_stories": summary.get("top_user_stories", [])
        })

    except Exception as e:
        print(f"❌ Erreur lecture session {session_id}: {e}")
        raise HTTPException(status_code=500, detail=str(e))