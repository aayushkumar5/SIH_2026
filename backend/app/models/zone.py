from sqlalchemy import Boolean, Column, DateTime, Float, JSON, String
from datetime import datetime, timezone
from backend.app.core.database import Base


class Zone(Base):
    __tablename__ = "zones"

    id = Column(String(50), primary_key=True, index=True)  # e.g. ZONE-NORTH-FENCE
    camera_id = Column(String(50), nullable=False, index=True)
    name = Column(String(100), nullable=False)
    zone_type = Column(String(20), default="polygon")  # polygon or line
    coordinates = Column(JSON, nullable=False)  # [[x, y], [x, y], ...]
    severity = Column(String(20), default="HIGH")  # CRITICAL, HIGH, MEDIUM, LOW
    loitering_threshold_seconds = Column(Float, default=10.0)
    enabled = Column(Boolean, default=True)
    created_at = Column(DateTime, default=lambda: datetime.now(timezone.utc))
