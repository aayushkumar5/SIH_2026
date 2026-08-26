from typing import List
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from backend.app.core.database import get_db
from backend.app.models.zone import Zone
from backend.app.schemas.schemas import ZoneCreate, ZoneOut

router = APIRouter()


@router.get("/", response_model=List[ZoneOut])
def list_zones(camera_id: str = None, db: Session = Depends(get_db)):
    query = db.query(Zone)
    if camera_id:
        query = query.filter(Zone.camera_id == camera_id)
    return query.all()


@router.post("/", response_model=ZoneOut)
def create_zone(zone_in: ZoneCreate, db: Session = Depends(get_db)):
    existing = db.query(Zone).filter(Zone.id == zone_in.id).first()
    if existing:
        raise HTTPException(status_code=400, detail="Zone ID already exists")

    zone = Zone(**zone_in.model_dump())
    db.add(zone)
    db.commit()
    db.refresh(zone)
    return zone


@router.delete("/{zone_id}")
def delete_zone(zone_id: str, db: Session = Depends(get_db)):
    zone = db.query(Zone).filter(Zone.id == zone_id).first()
    if not zone:
        raise HTTPException(status_code=404, detail="Zone not found")
    db.delete(zone)
    db.commit()
    return {"message": "Zone deleted successfully"}
