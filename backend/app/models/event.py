from sqlalchemy import Column, DateTime, Float, Integer, JSON, String
from datetime import datetime, timezone
from backend.app.core.database import Base


class Event(Base):
    __tablename__ = "events"

    id = Column(String(50), primary_key=True, index=True)  # UUID
    camera_id = Column(String(50), index=True, nullable=False)
    timestamp = Column(DateTime, default=lambda: datetime.now(timezone.utc), index=True)
    event_type = Column(String(50), index=True, nullable=False)  # INTRUSION, ANPR_DETECTION, etc.
    severity = Column(String(20), index=True, nullable=False)    # CRITICAL, HIGH, MEDIUM, LOW
    track_id = Column(Integer, nullable=True)
    object_class = Column(String(50), nullable=True)
    confidence = Column(Float, default=1.0)
    zone_id = Column(String(50), nullable=True)
    snapshot_path = Column(String(255), nullable=True)
    clip_path = Column(String(255), nullable=True)
    metadata_json = Column(JSON, default=dict)
