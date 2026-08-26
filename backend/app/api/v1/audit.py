from typing import List
from fastapi import APIRouter, Depends, Query
from sqlalchemy.orm import Session
from backend.app.core.database import get_db
from backend.app.models.audit import AuditHashChain
from backend.app.schemas.schemas import AuditRecordOut, AuditVerificationResult
from backend.app.services.hash_chain import HashChainService

router = APIRouter()


@router.get("/chain", response_model=List[AuditRecordOut])
def get_audit_chain(
    limit: int = Query(100, le=500),
    offset: int = 0,
    db: Session = Depends(get_db)
):
    """Returns chronological audit records with cryptographic SHA-256 links."""
    return db.query(AuditHashChain).order_by(AuditHashChain.sequence_id.desc()).offset(offset).limit(limit).all()


@router.get("/verify", response_model=AuditVerificationResult)
def verify_audit_chain_integrity(db: Session = Depends(get_db)):
    """
    Cryptographic verification endpoint.
    Recalculates every SHA-256 block hash across the entire sequence and asserts
    that no record has been tampered with or modified.
    """
    return HashChainService.verify_integrity(db)
