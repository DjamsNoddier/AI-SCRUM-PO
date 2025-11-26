# backend/schemas/usermodel.py

from pydantic import BaseModel, EmailStr, Field
from typing import Annotated

# ---- Public User (retourné au front) ----

class UserPublic(BaseModel):
    id: str
    email: EmailStr


# ---- Input pour signup/register ----

class SignupIn(BaseModel):
    email: EmailStr
    password: Annotated[str, Field(min_length=8)]


class LoginIn(BaseModel):
    email: EmailStr
    password: str


class RegisterSchema(BaseModel):
    email: EmailStr
    password: Annotated[str, Field(min_length=8)]


# ---- Structure de réponse ----

class AuthOut(BaseModel):
    access_token: str
    refresh_token: str
    token_type: str = "bearer"
    user: UserPublic
