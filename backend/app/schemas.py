from pydantic import BaseModel, EmailStr
from typing import List, Optional


# ──────────────────────────────────────────────────
# Auth / Users
# ──────────────────────────────────────────────────
class UserCreate(BaseModel):
    name: str
    email: EmailStr
    password: str


class UserOut(BaseModel):
    id: int
    name: str
    email: EmailStr

    model_config = {"from_attributes": True}


class Token(BaseModel):
    access_token: str
    token_type: str = "bearer"


# ──────────────────────────────────────────────────
# Notes
# ──────────────────────────────────────────────────
class NoteBase(BaseModel):
    title: str
    content: str


class NoteCreate(NoteBase):
    pass


class NoteOut(NoteBase):
    id: int
    owner_id: int

    model_config = {"from_attributes": True}
