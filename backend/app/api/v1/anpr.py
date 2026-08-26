from typing import List
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from backend.app.core.database import get_db
from backend.app.models.watchlist import PlateWatchlist
from backend.app.schemas.schemas import PlateWatchlistCreate, PlateWatchlistOut

router = APIRouter()


@router.get("/watchlist", response_model=List[PlateWatchlistOut])
def list_plate_watchlist(db: Session = Depends(get_db)):
    return db.query(PlateWatchlist).filter(PlateWatchlist.is_active == True).all()


@router.post("/watchlist", response_model=PlateWatchlistOut)
def add_to_plate_watchlist(plate_in: PlateWatchlistCreate, db: Session = Depends(get_db)):
    norm_id = plate_in.id.replace(" ", "").upper()
    existing = db.query(PlateWatchlist).filter(PlateWatchlist.id == norm_id).first()
    if existing:
        existing.category = plate_in.category
        existing.reason = plate_in.reason
        existing.is_active = True
        db.commit()
        db.refresh(existing)
        return existing

    item = PlateWatchlist(
        id=norm_id,
        category=plate_in.category,
        reason=plate_in.reason,
        added_by="HQ_INTEL"
    )
    db.add(item)
    db.commit()
    db.refresh(item)
    return item


@router.delete("/watchlist/{plate_id}")
def remove_from_plate_watchlist(plate_id: str, db: Session = Depends(get_db)):
    norm_id = plate_id.replace(" ", "").upper()
    item = db.query(PlateWatchlist).filter(PlateWatchlist.id == norm_id).first()
    if not item:
        raise HTTPException(status_code=404, detail="Plate not in watchlist")
    item.is_active = False
    db.commit()
    return {"message": f"Plate {norm_id} removed from active watchlist"}
