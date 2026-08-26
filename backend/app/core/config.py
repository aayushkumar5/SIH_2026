import os
from typing import List
from pydantic_settings import BaseSettings


class Settings(BaseSettings):
    PROJECT_NAME: str = "IBVAP — Intelligent Border Video Analytics Platform"
    VERSION: str = "1.0.0"
    API_V1_STR: str = "/api/v1"
    
    SECRET_KEY: str = os.getenv("SECRET_KEY", "supersecretkey-ibvap-sih26187-border-security-2026")
    ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 60 * 24  # 24 hours
    
    # SQLite default for zero-friction local development, PostgreSQL ready for production
    DATABASE_URL: str = os.getenv("DATABASE_URL", "sqlite:///./ibvap.db")
    
    # CORS Origins
    CORS_ORIGINS: List[str] = ["*"]
    
    # Storage Paths
    STORAGE_DIR: str = os.getenv("STORAGE_DIR", "./storage")
    SNAPSHOT_DIR: str = os.getenv("SNAPSHOT_DIR", "./storage/snapshots")
    CLIP_DIR: str = os.getenv("CLIP_DIR", "./storage/clips")
    
    # BOP Settings
    BOP_ID: str = os.getenv("BOP_ID", "BOP-DHARCHULA-01")

    class Config:
        env_file = ".env"
        extra = "ignore"


settings = Settings()
