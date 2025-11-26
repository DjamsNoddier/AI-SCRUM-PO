"""
security.py
-----------
Utilitaires de sécurité:
- Hash/verify mot de passe (bcrypt via passlib)
- Création/validation des JWT
- Extraction de l'utilisateur courant
"""
from datetime import datetime, timedelta
from typing import Optional

from jose import jwt, JWTError, ExpiredSignatureError

from fastapi import HTTPException, status, Depends
from fastapi.security import OAuth2PasswordBearer

from sqlmodel import Session
from backend.core.config import settings
from backend.core.db import get_session
from backend.repositories.user_repo import User, get_by_id


# ----------- CONFIGS -----------

JWT_SECRET = settings.JWT_SECRET
JWT_ALGO = settings.JWT_ALGO
JWT_EXPIRE_MIN = settings.JWT_EXPIRE_MIN

oauth2_scheme = OAuth2PasswordBearer(tokenUrl="/api/auth/login")

# ----------- TOKEN CREATION -------------

def create_access_token(sub: int | str, expires_minutes: int = None) -> str:
    """
    sub = user id
    """
    expires_minutes = expires_minutes or JWT_EXPIRE_MIN
    expire = datetime.utcnow() + timedelta(minutes=expires_minutes)

    to_encode = {"sub": sub, "exp": expire}
    return jwt.encode(to_encode, JWT_SECRET, algorithm=JWT_ALGO)


def create_refresh_token(sub: int | str, days: int = 7) -> str:
    expire = datetime.utcnow() + timedelta(days=days)
    to_encode = {"sub": sub, "exp": expire}
    return jwt.encode(to_encode, JWT_SECRET, algorithm=JWT_ALGO)


# ----------- TOKEN VALIDATION -----------

def decode_access_token(token: str) -> dict:
    """
    Renvoie tout le payload JWT (pas seulement sub).
    """
    try:
        payload = jwt.decode(token, JWT_SECRET, algorithms=[JWT_ALGO])
        return payload

    except ExpiredSignatureError:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Token expiré"
        )

    except JWTError:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Token invalide"
        )


# ----------- USER EXTRACTION -----------

def get_current_user(
    token: str = Depends(oauth2_scheme),
    db: Session = Depends(get_session)
) -> User:

    payload = decode_access_token(token)

    # payload est un dict → on récupère le sub
    sub = payload.get("sub")

    if not sub:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Token sans identifiant utilisateur"
        )

    # sub = id utilisateur dans la DB
    user = get_by_id(db, sub)

    if not user:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Utilisateur introuvable"
        )

    return user
