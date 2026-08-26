import os
from pydantic_settings import BaseSettings


class AIConfig(BaseSettings):
    CONFIDENCE_THRESHOLD: float = 0.5
    IOU_THRESHOLD: float = 0.45
    DEVICE: str = "cpu"  # 'cpu' or 'cuda'
    MODEL_WEIGHTS: str = "yolov8n.pt"
    
    # Target Classes to detect
    TARGET_CLASSES: list[str] = [
        "person", "car", "motorcycle", "bus", "truck", "bicycle"
    ]
    
    # Tracker settings
    TRACK_BUFFER: int = 30
    MATCH_THRESH: float = 0.8
    
    # Low-light enhancement
    ENABLE_LOW_LIGHT: bool = True
    DARKNESS_THRESHOLD_MEAN_INTENSITY: float = 65.0
    
    # ANPR & Face
    ANPR_CONF_THRESHOLD: float = 0.6
    FACE_MATCH_THRESHOLD: float = 0.60
    
    # Night hours (24h)
    NIGHT_START_HOUR: int = 18
    NIGHT_END_HOUR: int = 6

    class Config:
        env_file = ".env"
        extra = "ignore"


ai_config = AIConfig()
