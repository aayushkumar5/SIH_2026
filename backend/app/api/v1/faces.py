from typing import List
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from backend.app.core.database import get_db
from backend.app.models.watchlist import FaceWatchlist
from backend.app.schemas.schemas import FaceWatchlistCreate, FaceWatchlistOut

router = APIRouter()


@router.get("/watchlist", response_model=List[FaceWatchlistOut])
def list_face_watchlist(db: Session = Depends(get_db)):
    return db.query(FaceWatchlist).filter(FaceWatchlist.is_active == True).all()


@router.post("/watchlist", response_model=FaceWatchlistOut)
def add_to_face_watchlist(face_in: FaceWatchlistCreate, db: Session = Depends(get_db)):
    existing = db.query(FaceWatchlist).filter(FaceWatchlist.id == face_in.id).first()
    if existing:
        existing.name = face_in.name
        existing.category = face_in.category
        existing.notes = face_in.notes
        existing.photo_path = face_in.photo_path
        existing.embedding = face_in.embedding
        existing.is_active = True
        db.commit()
        db.refresh(existing)
        return existing

    item = FaceWatchlist(**face_in.model_dump())
    db.add(item)
    db.commit()
    db.refresh(item)
    return item


@router.delete("/watchlist/{identity_id}")
def remove_from_face_watchlist(identity_id: str, db: Session = Depends(get_db)):
    item = db.query(FaceWatchlist).filter(FaceWatchlist.id == identity_id).first()
    if not item:
        raise HTTPException(status_code=404, detail="Suspect identity not found")
    item.is_active = False
    db.commit()
    return {"message": f"Suspect {identity_id} removed from active watchlist"}
