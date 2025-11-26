"""
auth.py
-------
Endpoints d'authentification :
- POST /api/v1/auth/signup
- POST /api/v1/auth/login
Renvoient un JWT (access_token) et un profil utilisateur minimal.
"""
from typing import Annotated
from pydantic import BaseModel, EmailStr, Field, constr
from fastapi import APIRouter, HTTPException, Depends, status
from sqlmodel import Session
from backend.core.db import get_session
from backend.core.security import create_access_token
from backend.repositories.user_repo import create_user, check_credentials
from backend.core.security import decode_access_token, create_refresh_token, get_current_user
from backend.models.usermodel import (
    UserPublic,
    SignupIn,
    LoginIn,
    RegisterSchema,
    AuthOut
)

router = APIRouter(prefix="/auth", tags=["auth"])

# ---------- Endpoints ----------

@router.post("/register", response_model=AuthOut)
def register(payload: RegisterSchema, session: Session = Depends(get_session)):
    try:
        user = create_user(session, payload.email, payload.password)
    except ValueError:
        raise HTTPException(status_code=409, detail="Email already exists")

    access = create_access_token(sub=str(user.id))
    refresh = create_refresh_token(sub=str(user.id))

    return AuthOut(
        access_token=access,
        refresh_token=refresh,
        user=UserPublic(id=str(user.id), email=user.email)
    )


@router.post("/login", response_model=AuthOut)
def login(payload: LoginIn, session: Session = Depends(get_session)):
    user = check_credentials(session, payload.email, payload.password)
    if not user:
        raise HTTPException(status_code=401, detail="Invalid credentials")
    access = create_access_token(sub=str(user.id))
    refresh = create_refresh_token(sub=str(user.id))
    return AuthOut(
        access_token=access,
        refresh_token=refresh,
        user=UserPublic(id=str(user.id), email=user.email)
    )


class RefreshIn(BaseModel):
    refresh_token: str


@router.post("/refresh", response_model=AuthOut)
def refresh(payload: RefreshIn):
    """
    Rafraîchir le token d'accès à partir du refresh_token.
    """
    sub = decode_access_token(payload.refresh_token)
    if not sub:
        raise HTTPException(status_code=401, detail="Invalid or expired token")
    
    new_access = create_access_token(sub=sub)
    new_refresh = create_refresh_token(sub=sub)
    
    return AuthOut(
        access_token=new_access,
        refresh_token=new_refresh,
        user=UserPublic(id=str(sub), email="placeholder@example.com")
    )


@router.post("/logout")
def logout():
    """
    Déconnexion (MVP) — aucune gestion serveur des tokens.
    Le front doit simplement supprimer les tokens stockés.
    """
    return {"message": "Logged out successfully"}


@router.get("/me", response_model=UserPublic)
def get_me(current_user_id: str = Depends(get_current_user), session: Session = Depends(get_session)):
    """
    Retourne le profil de l'utilisateur connecté à partir du JWT.
    """
    from backend.repositories.user_repo import get_by_id
    user = get_by_id(session, int(current_user_id))
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    return UserPublic(id=str(user.id), email=user.email)


