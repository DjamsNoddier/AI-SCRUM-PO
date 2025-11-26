"""
user_repo.py
------------
Modèle + repository utilisateur (SQLModel).
Responsable de l'accès aux données (CRUD) sans logique métier.
"""
from datetime import datetime
from typing import Optional
from sqlmodel import SQLModel, Field, Session, select
from backend.core.password import hash_password, verify_password

class User(SQLModel, table=True):
    id: Optional[int] = Field(default=None, primary_key=True)
    email: str = Field(index=True, unique=True, nullable=False)
    password_hash: str
    role: str = Field(default="user")
    created_at: datetime = Field(default_factory=datetime.utcnow)

def get_by_email(session: Session, email: str) -> Optional[User]:
    return session.exec(select(User).where(User.email == email.lower())).first()

def create_user(session: Session, email: str, password: str) -> User:
    email = email.lower().strip()
    if get_by_email(session, email):
        raise ValueError("Email already exists")
    user = User(
        email=email,
        password_hash=hash_password(password)
    )
    session.add(user)
    session.commit()
    session.refresh(user)
    return user

def check_credentials(session: Session, email: str, password: str) -> Optional[User]:
    user = get_by_email(session, email.lower().strip())
    if not user or not verify_password(password, user.password_hash):
        return None
    return user


def get_by_id(session: Session, user_id: int) -> Optional[User]:
    return session.get(User, user_id)
