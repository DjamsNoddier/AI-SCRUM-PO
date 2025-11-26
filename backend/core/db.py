"""
db.py
------
Initialise le moteur SQL (SQLite par défaut) et la base SQLModel.
Conçu pour être remplacé facilement (Postgres, etc.) sans toucher aux routes.
"""
from sqlmodel import SQLModel, create_engine, Session
from contextlib import contextmanager
from pathlib import Path
from typing import Generator
import os

# ---------- Configuration du moteur ----------

DB_PATH = Path(os.getenv("MINDLOOP_DB_PATH", "input/db/mindloop.sqlite"))
DB_PATH.parent.mkdir(parents=True, exist_ok=True)

engine = create_engine(f"sqlite:///{DB_PATH}", echo=False)

# ---------- Initialisation de la base ----------

def init_db():
    from backend.repositories.user_repo import User  # import tardif pour éviter cycles
    from backend.models.session import MeetingSession

    SQLModel.metadata.create_all(engine)


# ---------- Gestion de session pour FastAPI ----------

@contextmanager
def get_session():
    with Session(engine) as session:
        yield session


def get_session():
    with Session(engine) as session:
        yield session
