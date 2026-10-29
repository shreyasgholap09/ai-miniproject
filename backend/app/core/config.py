import os
from pathlib import Path
from pydantic_settings import BaseSettings, SettingsConfigDict

# Base backend directory
BACKEND_DIR = Path(__file__).resolve().parent.parent.parent

class Settings(BaseSettings):
    PROJECT_NAME: str = "AI Lost and Found Items Matcher"
    API_V1_STR: str = "/api/v1"
    
    DATABASE_URL: str = "postgresql+psycopg2://postgres:shreyas@localhost:5432/lost_and_found_db"
    
    # JWT Auth
    SECRET_KEY: str = "supersecretjwtkey_for_ai_lost_and_found_2026_token_encryption"
    ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 1440
    
    # Media & Uploads
    UPLOAD_DIR: str = "uploads"
    MAX_IMAGE_SIZE_MB: int = 5
    ALLOWED_IMAGE_TYPES: list[str] = ["image/jpeg", "image/png", "image/webp", "image/jpg"]
    
    # AI Models
    AI_TEXT_MODEL: str = "all-MiniLM-L6-v2"
    AI_IMAGE_MODEL: str = "clip-ViT-B-32"
    MATCH_THRESHOLD: float = 0.45
    
    # Initial Admin Seed
    ADMIN_EMAIL: str = "admin@lostandfound.edu"
    ADMIN_PASSWORD: str = "AdminPassword@123"
    ADMIN_NAME: str = "Campus Administrator"

    model_config = SettingsConfigDict(
        env_file=str(BACKEND_DIR / ".env"),
        env_file_encoding="utf-8",
        extra="ignore"
    )

    @property
    def UPLOAD_PATH(self) -> Path:
        path = BACKEND_DIR / self.UPLOAD_DIR
        path.mkdir(parents=True, exist_ok=True)
        return path

settings = Settings()
