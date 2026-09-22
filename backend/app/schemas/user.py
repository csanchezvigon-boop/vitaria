"""Esquemas de autenticación y usuarios."""
from datetime import datetime

from pydantic import BaseModel, ConfigDict, EmailStr, Field


# --- Auth ---
class RegisterIn(BaseModel):
    email: EmailStr
    name: str | None = None
    password: str = Field(min_length=6, max_length=128)
    plan_tier: str = "free"  # starter|pro|premium (elegido en registro)


class LoginIn(BaseModel):
    username: EmailStr  # OAuth2 usa 'username'
    password: str


class TokenOut(BaseModel):
    access_token: str
    token_type: str = "bearer"


# --- User ---
class UserOut(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: int
    email: EmailStr
    name: str | None
    plan_tier: str
    is_active: bool
    created_at: datetime | None
    data: dict | None = None


class UserUpdate(BaseModel):
    name: str | None = None
    plan_tier: str | None = None
    data: dict | None = None
