from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from .database import Base, engine
from .routes import users, notes

# Create tables at startup (simple projects only; for production use Alembic migrations)
Base.metadata.create_all(bind=engine)

app = FastAPI(title="CleverPad API")


@app.get("/")
def root():
    return {"message": "Welcome to the CleverPad API!"}


# CORS – allow your React dev server
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(users.router)
app.include_router(notes.router)
