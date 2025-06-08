from typing import List, Optional
from fastapi import APIRouter, Depends, Header
from sqlalchemy.orm import Session

from .. import schemas, crud
from ..dependencies import get_db, get_current_user_optional

router = APIRouter(prefix="/notes", tags=["notes"])


def get_session_id(x_session_id: Optional[str] = Header(None)) -> Optional[str]:
    """Extract session ID from headers for guest users"""
    return x_session_id


# ──────────────────────────────────────────────────
@router.get("/", response_model=List[schemas.NoteOut])
def list_notes(
    db: Session = Depends(get_db),
    current_user=Depends(get_current_user_optional),
    session_id: Optional[str] = Depends(get_session_id),
):
    """List notes for authenticated user or guest session"""
    if current_user:
        return crud.get_notes(db, user_id=current_user.id)
    elif session_id:
        return crud.get_notes(db, session_id=session_id)
    else:
        return []


# ──────────────────────────────────────────────────
@router.post("/", response_model=schemas.NoteOut, status_code=201)
def create_note(
    note_in: schemas.NoteCreate,
    db: Session = Depends(get_db),
    current_user=Depends(get_current_user_optional),
    session_id: Optional[str] = Depends(get_session_id),
):
    """Create a note for authenticated user or guest session"""
    if current_user:
        return crud.create_note(db, note_in, user_id=current_user.id)
    elif session_id:
        return crud.create_note(db, note_in, session_id=session_id)
    else:
        from fastapi import HTTPException, status

        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Authentication required or session ID missing",
        )


# ──────────────────────────────────────────────────
@router.put("/{note_id}", response_model=schemas.NoteOut)
def update_note(
    note_id: int,
    note_in: schemas.NoteCreate,
    db: Session = Depends(get_db),
    current_user=Depends(get_current_user_optional),
    session_id: Optional[str] = Depends(get_session_id),
):
    """Update a note for authenticated user or guest session"""
    if current_user:
        return crud.update_note(db, note_id, note_in, user_id=current_user.id)
    elif session_id:
        return crud.update_note(db, note_id, note_in, session_id=session_id)
    else:
        from fastapi import HTTPException, status

        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Authentication required or session ID missing",
        )


# ──────────────────────────────────────────────────
@router.delete("/{note_id}", status_code=204)
def delete_note(
    note_id: int,
    db: Session = Depends(get_db),
    current_user=Depends(get_current_user_optional),
    session_id: Optional[str] = Depends(get_session_id),
):
    """Delete a note for authenticated user or guest session"""
    if current_user:
        crud.delete_note(db, note_id, user_id=current_user.id)
    elif session_id:
        crud.delete_note(db, note_id, session_id=session_id)
    else:
        from fastapi import HTTPException, status

        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Authentication required or session ID missing",
        )
