# app/dependencies.py
from fastapi import Depends, HTTPException, status
from fastapi.security import OAuth2PasswordBearer
from sqlalchemy.orm import Session

from .database import SessionLocal
from .core.security import decode_access_token
from app import models

oauth2_scheme = OAuth2PasswordBearer(tokenUrl="/auth/login")


# ───────────────────────────────────────────────────────────
# DB session
def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()


# ───────────────────────────────────────────────────────────
# Current user
def get_current_user(
    token: str = Depends(oauth2_scheme), db: Session = Depends(get_db)
) -> models.User:
    try:
        payload = decode_access_token(token)
        user_id: int = int(payload.get("sub"))
    except Exception:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid credentials",
            headers={"WWW-Authenticate": "Bearer"},
        )
    user = db.query(models.User).get(user_id)
    if user is None:
        raise HTTPException(status_code=404, detail="User not found")
    return user
