from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from fastapi.security import OAuth2PasswordRequestForm

from .. import schemas, crud
from ..core.security import create_access_token
from ..dependencies import get_db, get_current_user

router = APIRouter(prefix="/auth", tags=["auth"])


# ──────────────────────────────────────────────────
@router.post("/signup", response_model=schemas.UserOut)
def signup(user_in: schemas.UserCreate, db: Session = Depends(get_db)):
    return crud.create_user(db, user_in)


# ──────────────────────────────────────────────────
@router.post("/login", response_model=schemas.Token)
def login(
    form_data: OAuth2PasswordRequestForm = Depends(), db: Session = Depends(get_db)
):
    user = crud.authenticate_user(db, form_data.username, form_data.password)
    if not user:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Incorrect e-mail or password",
        )
    token = create_access_token({"sub": str(user.id)})
    return {"access_token": token, "token_type": "bearer"}


# ──────────────────────────────────────────────────
@router.post("/guest", response_model=schemas.GuestSession)
def guest_login():
    """Create a guest session for unauthenticated users"""
    session_id = crud.generate_guest_session_id()
    return {"session_id": session_id, "token_type": "guest"}


# ──────────────────────────────────────────────────
@router.get("/me", response_model=schemas.UserOut)
def read_current_user(current_user=Depends(get_current_user)):
    return current_user
