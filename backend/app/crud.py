from sqlalchemy.orm import Session
from fastapi import HTTPException, status
from typing import Optional
import uuid

from . import models, schemas
from .core.security import hash_password, verify_password


# ──────────────────────────────────────────────────
# Users
# ──────────────────────────────────────────────────
def get_user_by_email(db: Session, email: str):
    return db.query(models.User).filter(models.User.email == email).first()


def create_user(db: Session, user_in: schemas.UserCreate):
    if get_user_by_email(db, user_in.email):
        raise HTTPException(status_code=400, detail="E-mail already registered")
    db_user = models.User(
        name=user_in.name,
        email=user_in.email,
        hashed_password=hash_password(user_in.password),
    )
    db.add(db_user)
    db.commit()
    db.refresh(db_user)
    return db_user


def authenticate_user(db: Session, email: str, password: str):
    user = get_user_by_email(db, email)
    if not user or not verify_password(password, user.hashed_password):
        return None
    return user


# ──────────────────────────────────────────────────
# Notes - Support both authenticated and guest users
# ──────────────────────────────────────────────────
def get_notes(db: Session, user_id: Optional[int] = None, session_id: Optional[str] = None):
    """Get notes for authenticated user or guest session"""
    if user_id:
        # Authenticated user notes
        return (
            db.query(models.Note)
            .filter(models.Note.owner_id == user_id)
            .order_by(models.Note.id.desc())
            .all()
        )
    elif session_id:
        # Guest session notes
        return (
            db.query(models.Note)
            .filter(models.Note.session_id == session_id, models.Note.owner_id.is_(None))
            .order_by(models.Note.id.desc())
            .all()
        )
    else:
        return []


def get_note(db: Session, note_id: int, user_id: Optional[int] = None, session_id: Optional[str] = None):
    """Get a specific note for authenticated user or guest session"""
    if user_id:
        # Authenticated user note
        return (
            db.query(models.Note)
            .filter(models.Note.id == note_id, models.Note.owner_id == user_id)
            .first()
        )
    elif session_id:
        # Guest session note
        return (
            db.query(models.Note)
            .filter(
                models.Note.id == note_id, 
                models.Note.session_id == session_id,
                models.Note.owner_id.is_(None)
            )
            .first()
        )
    else:
        return None


def create_note(db: Session, note_in: schemas.NoteCreate, user_id: Optional[int] = None, session_id: Optional[str] = None):
    """Create a note for authenticated user or guest session"""
    if user_id:
        # Authenticated user note
        db_note = models.Note(**note_in.model_dump(), owner_id=user_id)
    elif session_id:
        # Guest session note
        db_note = models.Note(**note_in.model_dump(), session_id=session_id, owner_id=None)
    else:
        raise HTTPException(status_code=400, detail="Either user_id or session_id required")
    
    db.add(db_note)
    db.commit()
    db.refresh(db_note)
    return db_note


def update_note(db: Session, note_id: int, note_in: schemas.NoteCreate, user_id: Optional[int] = None, session_id: Optional[str] = None):
    """Update a note for authenticated user or guest session"""
    db_note = get_note(db, note_id, user_id, session_id)
    if not db_note:
        raise HTTPException(status_code=404, detail="Note not found")
    db_note.title = note_in.title
    db_note.content = note_in.content
    db.commit()
    db.refresh(db_note)
    return db_note


def delete_note(db: Session, note_id: int, user_id: Optional[int] = None, session_id: Optional[str] = None):
    """Delete a note for authenticated user or guest session"""
    db_note = get_note(db, note_id, user_id, session_id)
    if not db_note:
        raise HTTPException(status_code=404, detail="Note not found")
    db.delete(db_note)
    db.commit()


def generate_guest_session_id() -> str:
    """Generate a unique session ID for guest users"""
    return str(uuid.uuid4())
