import os
from pydantic_settings import BaseSettings


is_vercel = os.getenv("VERCEL") == "1" or "VERCEL" in os.environ


class Settings(BaseSettings):
    PROJECT_NAME: str = "IBVAP — Intelligent Border Video Analytics Platform"
    VERSION: str = "1.0.0"
    API_V1_STR: str = "/api/v1"
    
    SECRET_KEY: str = os.getenv("SECRET_KEY", "dev-only-change-this-secret")
    ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 60 * 24  # 24 hours
    
    # SQLite default: /tmp/ibvap.db on Vercel, ./ibvap.db locally
    DATABASE_URL: str = os.getenv(
        "DATABASE_URL",
        "sqlite:////tmp/ibvap.db" if is_vercel else "sqlite:///./ibvap.db"
    )
    
    # CORS Origins
    CORS_ORIGINS: str = "http://localhost:5173,http://localhost:3000"
    
    # Storage Paths
    STORAGE_DIR: str = os.getenv("STORAGE_DIR", "/tmp/storage" if is_vercel else "./storage")
    SNAPSHOT_DIR: str = os.getenv("SNAPSHOT_DIR", f"{'/tmp/storage' if is_vercel else './storage'}/snapshots")
    CLIP_DIR: str = os.getenv("CLIP_DIR", f"{'/tmp/storage' if is_vercel else './storage'}/clips")
    
    # BOP Settings
    BOP_ID: str = os.getenv("BOP_ID", "BOP-DHARCHULA-01")

    class Config:
        env_file = ".env"
        extra = "ignore"


settings = Settings()

if is_vercel and settings.SECRET_KEY == "dev-only-change-this-secret":
    raise RuntimeError("SECRET_KEY must be configured in the Vercel environment")
