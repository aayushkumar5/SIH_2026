from typing import List
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from backend.app.core.database import get_db
from backend.app.models.camera import Camera
from backend.app.schemas.schemas import CameraCreate, CameraOut

router = APIRouter()


@router.get("/", response_model=List[CameraOut])
def list_cameras(db: Session = Depends(get_db)):
    return db.query(Camera).all()


@router.post("/", response_model=CameraOut)
def create_camera(camera_in: CameraCreate, db: Session = Depends(get_db)):
    existing = db.query(Camera).filter(Camera.id == camera_in.id).first()
    if existing:
        raise HTTPException(status_code=400, detail="Camera ID already exists")

    camera = Camera(**camera_in.model_dump())
    db.add(camera)
    db.commit()
    db.refresh(camera)
    return camera


@router.get("/{camera_id}", response_model=CameraOut)
def get_camera(camera_id: str, db: Session = Depends(get_db)):
    camera = db.query(Camera).filter(Camera.id == camera_id).first()
    if not camera:
        raise HTTPException(status_code=404, detail="Camera not found")
    return camera


@router.patch("/{camera_id}/status", response_model=CameraOut)
def toggle_camera_status(camera_id: str, is_online: bool, db: Session = Depends(get_db)):
    camera = db.query(Camera).filter(Camera.id == camera_id).first()
    if not camera:
        raise HTTPException(status_code=404, detail="Camera not found")
    camera.is_online = is_online
    db.commit()
    db.refresh(camera)
    return camera
