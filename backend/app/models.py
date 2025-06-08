from sqlalchemy import Column, Integer, String, Text, ForeignKey
from sqlalchemy.orm import relationship

from .database import Base


class User(Base):
    __tablename__ = "users"
    id = Column(Integer, primary_key=True, index=True)
    name = Column(String, nullable=False)  # Added name field
    email = Column(String, unique=True, index=True, nullable=False)
    hashed_password = Column(String, nullable=False)

    notes = relationship("Note", back_populates="owner", cascade="all, delete")


class Note(Base):
    __tablename__ = "notes"
    id = Column(Integer, primary_key=True, index=True)
    title = Column(String, default="Untitled")
    content = Column(Text, default="")
    owner_id = Column(
        Integer, ForeignKey("users.id", ondelete="CASCADE"), nullable=True  # Allow null for guest notes
    )
    session_id = Column(String, nullable=True)  # For guest session identification

    owner = relationship("User", back_populates="notes")
