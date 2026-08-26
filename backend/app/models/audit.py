from sqlalchemy import Column, DateTime, Integer, JSON, String, Text
from datetime import datetime, timezone
from backend.app.core.database import Base


class AuditHashChain(Base):
    """
    Tamper-Evident Audit Record Model.
    Each block hashes its own payload plus the previous record's SHA-256 hash:
    H_n = SHA256(Record_n || H_{n-1})
    """
    __tablename__ = "audit_hash_chain"

    sequence_id = Column(Integer, primary_key=True, autoincrement=True)  # Strictly monotonic
    event_id = Column(String(50), index=True, nullable=False)
    timestamp = Column(DateTime, default=lambda: datetime.now(timezone.utc), index=True)
    actor = Column(String(50), nullable=False, default="SYSTEM_AI")
    action = Column(String(50), nullable=False)  # EVENT_LOGGED, ALERT_ACKNOWLEDGED, WATCHLIST_UPDATED
    target_resource = Column(String(100), nullable=False)
    payload_digest = Column(String(64), nullable=False)  # SHA-256 of the payload content
    previous_hash = Column(String(64), nullable=False)   # SHA-256 of sequence_id - 1
    current_hash = Column(String(64), nullable=False)    # SHA-256(sequence_id || timestamp || actor || action || payload_digest || previous_hash)
