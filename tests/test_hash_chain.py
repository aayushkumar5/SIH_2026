import pytest
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker

from backend.app.core.database import Base
from backend.app.models.audit import AuditHashChain
from backend.app.services.hash_chain import HashChainService, GENESIS_HASH


@pytest.fixture
def db_session():
    engine = create_engine("sqlite:///:memory:")
    Base.metadata.create_all(engine)
    Session = sessionmaker(bind=engine)
    session = Session()
    yield session
    session.close()


def test_hash_chain_sequential_integrity(db_session):
    # Append 3 audit records
    rec1 = HashChainService.append_audit_record(
        db=db_session,
        event_id="EVT-001",
        actor="AI_ENGINE",
        action="INTRUSION_LOGGED",
        target_resource="camera:CAM-01",
        payload={"camera": "CAM-01", "confidence": 0.95}
    )
    assert rec1.sequence_id == 1
    assert rec1.previous_hash == GENESIS_HASH
    assert len(rec1.current_hash) == 64

    rec2 = HashChainService.append_audit_record(
        db=db_session,
        event_id="EVT-002",
        actor="AI_ENGINE",
        action="ANPR_MATCH",
        target_resource="camera:CAM-02",
        payload={"plate": "DL01AB1234", "match": True}
    )
    assert rec2.sequence_id == 2
    assert rec2.previous_hash == rec1.current_hash

    rec3 = HashChainService.append_audit_record(
        db=db_session,
        event_id="EVT-003",
        actor="COMMANDER_HQ",
        action="ALERT_ACKNOWLEDGED",
        target_resource="alert:ALT-100",
        payload={"alert_id": "ALT-100"}
    )
    assert rec3.sequence_id == 3
    assert rec3.previous_hash == rec2.current_hash

    # Verify integrity of valid chain
    result = HashChainService.verify_integrity(db_session)
    assert result.is_valid is True
    assert result.total_records == 3
    assert result.verified_records == 3


def test_hash_chain_detects_tampering(db_session):
    # Create valid chain
    for i in range(1, 4):
        HashChainService.append_audit_record(
            db=db_session,
            event_id=f"EVT-00{i}",
            actor="SYSTEM",
            action="LOG",
            target_resource="system",
            payload={"step": i}
        )

    # Malicious actor tampers with Block #2's previous_hash or actor
    block2 = db_session.query(AuditHashChain).filter(AuditHashChain.sequence_id == 2).first()
    block2.previous_hash = "ffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffff"
    db_session.commit()

    # Verification must flag corruption
    result = HashChainService.verify_integrity(db_session)
    assert result.is_valid is False
    assert result.corrupted_sequence_id == 2
    assert "Broken cryptographic hash linkage" in result.message
