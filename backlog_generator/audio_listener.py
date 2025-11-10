"""
audio_listener.py
-----------------
Module responsable de l’écoute continue (mode atelier).
Permet de lancer et d’arrêter un enregistrement audio local,
puis de déclencher le pipeline de transcription et génération de User Stories.

Fait partie du projet : AI Scrum PO Assistant
Auteur : Djamil
"""

import os
import sys
import json
import signal
import threading
import datetime
import numpy as np
import sounddevice as sd
import wavio
from pathlib import Path
from dataclasses import dataclass
from dotenv import load_dotenv

# Import du pipeline existant
from backlog_generator.audio_transcriber import process_audio_feedback
from backlog_generator.session_summary import generate_session_summary, print_session_summary
from backlog_generator.logger_manager import info, warn, error


# ============================================================
# ⚙️ Configuration
# ============================================================
env_path = Path(__file__).resolve().parent.parent / ".env"
load_dotenv(dotenv_path=env_path)
SESSIONS_DIR = Path("input/sessions")
SESSIONS_DIR.mkdir(parents=True, exist_ok=True)


# ============================================================
# 🎙️ Classe AudioSession
# ============================================================
@dataclass
class AudioSession:
    """Représente une session d’écoute unique."""
    session_id: str
    started_at: datetime.datetime
    ended_at: datetime.datetime = None
    duration_sec: int = 0
    folder_path: Path | None = None
    audio_file: Path | None = None
    processed: bool = False

    def create_session_folder(self, base_dir: Path):
        """Crée un dossier dédié à la session."""
        folder = base_dir / f"session_{self.started_at.strftime('%Y-%m-%d_%H%M')}"
        folder.mkdir(parents=True, exist_ok=True)
        self.folder_path = folder
        return folder

    def to_json(self):
        """Retourne les métadonnées au format JSON."""
        return {
            "session_id": self.session_id,
            "start_time": self.started_at.isoformat(),
            "end_time": self.ended_at.isoformat() if self.ended_at else None,
            "duration_sec": self.duration_sec,
            "audio_file": str(self.audio_file) if self.audio_file else None,
            "folder_path": str(self.folder_path) if self.folder_path else None,
            "processed": self.processed,
            "status": "completed" if self.processed else "recorded"
        }

    def save_metadata(self):
        """Sauvegarde les métadonnées de session dans un fichier JSON."""
        if not self.folder_path:
            print("⚠️ Aucun dossier de session défini.")
            return
        meta_path = self.folder_path / "metadata.json"
        with open(meta_path, "w", encoding="utf-8") as f:
            json.dump(self.to_json(), f, ensure_ascii=False, indent=4)
        print(f"🧾 Métadonnées sauvegardées : {meta_path}")


# ============================================================
# 🎧 Classe AudioListener
# ============================================================
class AudioListener:
    """Gère le démarrage, l’arrêt et le traitement post-session."""

    def __init__(self, output_dir: str = "input/sessions"):
        self.output_dir = Path(output_dir)
        self.output_dir.mkdir(parents=True, exist_ok=True)
        self.current_session: AudioSession | None = None
        self.fs = 44100
        self.channels = 1
        self.recording = False
        self.frames = []
        self._thread: threading.Thread | None = None
        print(f"📁 Répertoire d’enregistrement configuré : {self.output_dir}")

    # ------------------------------------------------------------
    def _record_audio(self):
        """Thread d’enregistrement continu du micro."""
        print("🎧 Micro prêt — enregistrement en cours...")
        with sd.InputStream(samplerate=self.fs, channels=self.channels, dtype="int16") as stream:
            while self.recording:
                data, _ = stream.read(1024)
                self.frames.append(data.copy())

    # ------------------------------------------------------------
    def start_listening(self):
        """Initialise une nouvelle session et démarre l’enregistrement."""
        session_id = datetime.datetime.now().strftime("session_%Y-%m-%d_%H%M")
        self.current_session = AudioSession(
            session_id=session_id,
            started_at=datetime.datetime.now(),
        )

        # Crée le dossier dédié
        folder = self.current_session.create_session_folder(self.output_dir)
        self.current_session.audio_file = folder / "audio.wav"

        # Démarre l’enregistrement
        self.frames = []
        self.recording = True
        self._thread = threading.Thread(target=self._record_audio)
        self._thread.start()

        print(f"🎙️ Démarrage de l’écoute : {session_id}")
        info("Session audio démarrée", session_id=session_id, event="session_start")
        print("⏺️ Parlez librement... (Ctrl+C ou Entrée pour arrêter)")

    # ------------------------------------------------------------
    def stop_listening(self):
        """Arrête l’écoute, sauvegarde le fichier audio et lance le pipeline."""
        if not self.recording:
            print("⚠️ Aucun enregistrement en cours.")
            return

        print("🛑 Arrêt de l’écoute...")
        info("Arrêt de l’écoute déclenché", session_id=self.current_session.session_id, event="session_stop")
        self.recording = False

        if self._thread and self._thread.is_alive():
            self._thread.join(timeout=3)

        self.current_session.ended_at = datetime.datetime.now()
        self.current_session.duration_sec = int(
            (self.current_session.ended_at - self.current_session.started_at).total_seconds()
        )

        if not self.frames:
            print("⚠️ Aucun son capté — fichier non créé.")
            return

        print(f"💾 Sauvegarde du fichier audio : {self.current_session.audio_file}")
        info("Fichier audio sauvegardé", session_id=self.current_session.session_id, audio_file=str(self.current_session.audio_file))
        try:
            full_audio = np.concatenate(self.frames, axis=0)
            wavio.write(str(self.current_session.audio_file), full_audio, self.fs, sampwidth=2)
        except Exception as e:
            print(f"❌ Erreur lors de la sauvegarde du fichier audio : {e}")
            error("Erreur dans audio_listener", session_id=self.current_session.session_id, details=str(e))
            return

        # Sauvegarde des métadonnées
        self.current_session.save_metadata()

        # =====================================================
        # 🚀 Lancement du pipeline d’analyse post-session
        # =====================================================
        info("Lancement du pipeline d’analyse post-session", session_id=self.current_session.session_id)
        print("🚀 Lancement du pipeline d’analyse post-session...")
        try:
            user_stories = process_audio_feedback(str(self.current_session.audio_file))
            self.current_session.processed = True
            self.current_session.save_metadata()
            info("Pipeline terminé avec succès", session_id=self.current_session.session_id, processed=True)
            print("✅ Session terminée et analysée.")
        except Exception as e:
            print(f"❌ Erreur pendant le pipeline : {e}")
            error("Erreur dans audio_listener", session_id=self.current_session.session_id, details=str(e))
            user_stories, quality = [], {"global_score": 0.0}
        else:
            quality = {"global_score": 0.85}  # Valeur temporaire si non renvoyée

        # =====================================================
        # 📊 Génération du résumé de session
        # =====================================================
        try:
            summary = generate_session_summary(
                metadata_path=self.current_session.folder_path / "metadata.json",
                user_stories=user_stories if user_stories else [],
                quality=quality if quality else {}
            )
            print_session_summary(summary)
        except Exception as e:
            print(f"⚠️ Erreur lors de la génération du résumé : {e}")
            error("Erreur dans audio_listener", session_id=self.current_session.session_id, details=str(e))

# ============================================================
# 🧪 Test interactif avec gestion d'interruption
# ============================================================
if __name__ == "__main__":
    listener = AudioListener()

    def handle_interrupt(sig, frame):
        print("\n⚠️ Interruption détectée — arrêt sécurisé en cours...")
        listener.stop_listening()
        sys.exit(0)

    signal.signal(signal.SIGINT, handle_interrupt)

    listener.start_listening()
    try:
        input("⏸️ Appuyez sur Entrée pour arrêter l’écoute... ")
        listener.stop_listening()
    except KeyboardInterrupt:
        handle_interrupt(None, None)
