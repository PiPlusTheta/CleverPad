from typing import List
from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from .. import schemas, crud
from ..dependencies import get_db, get_current_user

router = APIRouter(prefix="/notes", tags=["notes"])


# ──────────────────────────────────────────────────
@router.get("/", response_model=List[schemas.NoteOut])
def list_notes(db: Session = Depends(get_db), current_user=Depends(get_current_user)):
    return crud.get_notes(db, current_user.id)


# ──────────────────────────────────────────────────
@router.post("/", response_model=schemas.NoteOut, status_code=201)
def create_note(
    note_in: schemas.NoteCreate,
    db: Session = Depends(get_db),
    current_user=Depends(get_current_user),
):
    return crud.create_note(db, note_in, current_user.id)


# ──────────────────────────────────────────────────
@router.put("/{note_id}", response_model=schemas.NoteOut)
def update_note(
    note_id: int,
    note_in: schemas.NoteCreate,
    db: Session = Depends(get_db),
    current_user=Depends(get_current_user),
):
    return crud.update_note(db, note_id, note_in, current_user.id)


# ──────────────────────────────────────────────────
@router.delete("/{note_id}", status_code=204)
def delete_note(
    note_id: int, db: Session = Depends(get_db), current_user=Depends(get_current_user)
):
    crud.delete_note(db, note_id, current_user.id)
