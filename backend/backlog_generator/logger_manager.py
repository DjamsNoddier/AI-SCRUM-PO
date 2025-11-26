"""
logger_manager.py
-----------------
Gestion centralisée des logs structurés JSON pour AI Scrum PO Assistant.
Chaque module (listener, transcriber, API...) peut l’utiliser.
"""

import os
import json
import datetime
import inspect
from pathlib import Path

LOG_DIR = Path("logs/structured_logs")
LOG_DIR.mkdir(parents=True, exist_ok=True)


def _serialize(obj):
    """Permet de sérialiser les objets non natifs JSON (datetime, Path...)"""
    if isinstance(obj, (datetime.datetime, datetime.date)):
        return obj.isoformat()
    if isinstance(obj, Path):
        return str(obj)
    return str(obj)


def _detect_module_name():
    """
    Détecte automatiquement le nom du module appelant (ex: 'api.meetings' ou 'backlog_generator.audio_transcriber').
    Cela permet de tracer la provenance du log sans le préciser à chaque appel.
    """
    try:
        frame = inspect.stack()[2]
        module = inspect.getmodule(frame[0])
        if module and module.__name__:
            return module.__name__
    except Exception:
        pass
    return "unknown"


def log_event(level: str, message: str, **kwargs):
    """
    Écrit un log structuré JSON dans le fichier du jour.
    Exemple :
        log_event("INFO", "Session démarrée", session_id="2025-11-11_0006")
    """
    log_entry = {
        "timestamp": datetime.datetime.now().isoformat(),
        "level": level.upper(),
        "module": _detect_module_name(),
        "message": message,
        **kwargs
    }

    # Fichier du jour
    log_file = LOG_DIR / f"{datetime.date.today().isoformat()}.log"
    with open(log_file, "a", encoding="utf-8") as f:
        f.write(json.dumps(log_entry, default=_serialize) + "\n")

    # Affichage console (pour le dev)
    print(f"[{log_entry['level']}] {log_entry['timestamp']} | {log_entry['module']} → {message}")


# Helpers
def info(msg, **kw): log_event("INFO", msg, **kw)
def warn(msg, **kw): log_event("WARN", msg, **kw)
def error(msg, **kw): log_event("ERROR", msg, **kw)
