from typing import List, Optional
from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session
from backend.app.core.database import get_db
from backend.app.models.event import Event
from backend.app.schemas.schemas import EventCreate, EventOut
from backend.app.services.event_service import EventService

router = APIRouter()


@router.get("/", response_model=List[EventOut])
def list_events(
    camera_id: Optional[str] = None,
    event_type: Optional[str] = None,
    severity: Optional[str] = None,
    limit: int = Query(50, le=200),
    offset: int = 0,
    db: Session = Depends(get_db)
):
    query = db.query(Event)
    if camera_id:
        query = query.filter(Event.camera_id == camera_id)
    if event_type:
        query = query.filter(Event.event_type == event_type)
    if severity:
        query = query.filter(Event.severity == severity)
    return query.order_by(Event.timestamp.desc()).offset(offset).limit(limit).all()


@router.post("/", response_model=EventOut)
async def ingest_event(event_in: EventCreate, db: Session = Depends(get_db)):
    event = await EventService.create_event(db=db, event_in=event_in)
    return event


@router.get("/{event_id}", response_model=EventOut)
def get_event(event_id: str, db: Session = Depends(get_db)):
    event = db.query(Event).filter(Event.id == event_id).first()
    if not event:
        raise HTTPException(status_code=404, detail="Event not found")
    return event
