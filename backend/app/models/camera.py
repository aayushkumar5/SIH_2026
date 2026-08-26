from sqlalchemy import Boolean, Column, DateTime, Float, Integer, String
from datetime import datetime, timezone
from backend.app.core.database import Base


class Camera(Base):
    __tablename__ = "cameras"

    id = Column(String(50), primary_key=True, index=True)  # e.g., CAM-01
    name = Column(String(100), nullable=False)
    rtsp_url = Column(String(255), nullable=False)
    location_name = Column(String(100), default="North Perimeter")
    latitude = Column(Float, nullable=True)
    longitude = Column(Float, nullable=True)
    bop_id = Column(String(50), default="BOP-DHARCHULA-01")
    is_online = Column(Boolean, default=True)
    fps = Column(Integer, default=25)
    resolution = Column(String(20), default="1920x1080")
    created_at = Column(DateTime, default=lambda: datetime.now(timezone.utc))
    updated_at = Column(DateTime, default=lambda: datetime.now(timezone.utc), onupdate=lambda: datetime.now(timezone.utc))
