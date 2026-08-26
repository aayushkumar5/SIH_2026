from sqlalchemy import Column, DateTime, String, Text
from datetime import datetime, timezone
from backend.app.core.database import Base


class Alert(Base):
    __tablename__ = "alerts"

    id = Column(String(50), primary_key=True, index=True)  # UUID
    event_id = Column(String(50), index=True, nullable=False)
    camera_id = Column(String(50), index=True, nullable=False)
    title = Column(String(150), nullable=False)
    description = Column(Text, nullable=True)
    severity = Column(String(20), index=True, nullable=False)
    status = Column(String(20), default="ACTIVE", index=True)  # ACTIVE, ACKNOWLEDGED, RESOLVED, DISMISSED
    created_at = Column(DateTime, default=lambda: datetime.now(timezone.utc), index=True)
    acknowledged_by = Column(String(50), nullable=True)
    acknowledged_at = Column(DateTime, nullable=True)
    resolved_by = Column(String(50), nullable=True)
    resolved_at = Column(DateTime, nullable=True)
    resolution_notes = Column(Text, nullable=True)
