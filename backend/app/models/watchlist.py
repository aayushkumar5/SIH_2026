from sqlalchemy import Boolean, Column, DateTime, JSON, String, Text
from datetime import datetime, timezone
from backend.app.core.database import Base


class PlateWatchlist(Base):
    __tablename__ = "plate_watchlists"

    id = Column(String(50), primary_key=True, index=True)  # Plate number uppercase (e.g. DL01AB1234)
    category = Column(String(50), default="STOLEN")  # STOLEN, SUSPICIOUS, HIGH_RISK, WANTED
    reason = Column(Text, nullable=True)
    added_by = Column(String(50), nullable=True)
    is_active = Column(Boolean, default=True)
    created_at = Column(DateTime, default=lambda: datetime.now(timezone.utc))


class FaceWatchlist(Base):
    __tablename__ = "face_watchlists"

    id = Column(String(50), primary_key=True, index=True)  # Suspect UUID / ID
    name = Column(String(100), nullable=False)
    category = Column(String(50), default="WANTED")  # WANTED, RED_NOTICE, PERSON_OF_INTEREST
    notes = Column(Text, nullable=True)
    photo_path = Column(String(255), nullable=True)
    embedding = Column(JSON, nullable=False)  # 512-dim normalized vector
    is_active = Column(Boolean, default=True)
    created_at = Column(DateTime, default=lambda: datetime.now(timezone.utc))
