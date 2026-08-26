from datetime import datetime
from typing import Any, Dict, List, Optional
from pydantic import BaseModel, EmailStr, Field


# Auth Schemas
class Token(BaseModel):
    access_token: str
    token_type: str = "bearer"
    role: str
    username: str


class TokenPayload(BaseModel):
    sub: Optional[str] = None


class UserCreate(BaseModel):
    username: str
    email: EmailStr
    password: str
    full_name: Optional[str] = None
    role: str = "OPERATOR"


class UserOut(BaseModel):
    id: int
    username: str
    email: EmailStr
    full_name: Optional[str]
    role: str
    is_active: bool
    created_at: datetime

    class Config:
        from_attributes = True


# Camera Schemas
class CameraCreate(BaseModel):
    id: str
    name: str
    rtsp_url: str
    location_name: str = "Perimeter"
    latitude: Optional[float] = None
    longitude: Optional[float] = None
    bop_id: str = "BOP-DHARCHULA-01"
    fps: int = 25
    resolution: str = "1920x1080"


class CameraOut(BaseModel):
    id: str
    name: str
    rtsp_url: str
    location_name: str
    latitude: Optional[float]
    longitude: Optional[float]
    bop_id: str
    is_online: bool
    fps: int
    resolution: str
    created_at: datetime

    class Config:
        from_attributes = True


# Zone Schemas
class ZoneCreate(BaseModel):
    id: str
    camera_id: str
    name: str
    zone_type: str = "polygon"
    coordinates: List[List[int]]
    severity: str = "HIGH"
    loitering_threshold_seconds: float = 10.0
    enabled: bool = True


class ZoneOut(BaseModel):
    id: str
    camera_id: str
    name: str
    zone_type: str
    coordinates: List[List[int]]
    severity: str
    loitering_threshold_seconds: float
    enabled: bool
    created_at: datetime

    class Config:
        from_attributes = True


# Event Schemas
class EventCreate(BaseModel):
    event_id: Optional[str] = None
    camera_id: str
    timestamp: Optional[str] = None
    event_type: str
    severity: str
    track_id: Optional[int] = None
    object_class: Optional[str] = None
    confidence: float = 1.0
    zone_id: Optional[str] = None
    snapshot_path: Optional[str] = None
    clip_path: Optional[str] = None
    metadata: Dict[str, Any] = Field(default_factory=dict)


class EventOut(BaseModel):
    id: str
    camera_id: str
    timestamp: datetime
    event_type: str
    severity: str
    track_id: Optional[int]
    object_class: Optional[str]
    confidence: float
    zone_id: Optional[str]
    snapshot_path: Optional[str]
    clip_path: Optional[str]
    metadata_json: Dict[str, Any]

    class Config:
        from_attributes = True


# Alert Schemas
class AlertAction(BaseModel):
    action: str  # ACKNOWLEDGE, RESOLVE, DISMISS
    notes: Optional[str] = None


class AlertOut(BaseModel):
    id: str
    event_id: str
    camera_id: str
    title: str
    description: Optional[str]
    severity: str
    status: str
    created_at: datetime
    acknowledged_by: Optional[str]
    acknowledged_at: Optional[datetime]
    resolved_by: Optional[str]
    resolved_at: Optional[datetime]
    resolution_notes: Optional[str]

    class Config:
        from_attributes = True


# Watchlist Schemas
class PlateWatchlistCreate(BaseModel):
    id: str  # Plate number e.g. DL01AB1234
    category: str = "STOLEN"
    reason: Optional[str] = None


class PlateWatchlistOut(BaseModel):
    id: str
    category: str
    reason: Optional[str]
    added_by: Optional[str]
    is_active: bool
    created_at: datetime

    class Config:
        from_attributes = True


class FaceWatchlistCreate(BaseModel):
    id: str
    name: str
    category: str = "WANTED"
    notes: Optional[str] = None
    photo_path: Optional[str] = None
    embedding: List[float]


class FaceWatchlistOut(BaseModel):
    id: str
    name: str
    category: str
    notes: Optional[str]
    photo_path: Optional[str]
    is_active: bool
    created_at: datetime

    class Config:
        from_attributes = True


# Audit Hash Chain Schemas
class AuditRecordOut(BaseModel):
    sequence_id: int
    event_id: str
    timestamp: datetime
    actor: str
    action: str
    target_resource: str
    payload_digest: str
    previous_hash: str
    current_hash: str

    class Config:
        from_attributes = True


class AuditVerificationResult(BaseModel):
    is_valid: bool
    total_records: int
    verified_records: int
    corrupted_sequence_id: Optional[int] = None
    message: str
