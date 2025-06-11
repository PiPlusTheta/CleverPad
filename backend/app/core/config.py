from pydantic import BaseModel
from dotenv import load_dotenv
import os

load_dotenv()  # load environment variables from .env file
class Settings(BaseModel):
    database_url: str = os.getenv("DATABASE_URL")
    secret_key: str = os.getenv("SECRET_KEY")
    algorithm: str = os.getenv("ALGORITHM", "HS256")
    access_token_expire_minutes: int = int(os.getenv("ACCESS_TOKEN_EXPIRE_MINUTES", 30))


settings = Settings()
