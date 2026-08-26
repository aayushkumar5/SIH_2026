from dataclasses import dataclass, field
from datetime import datetime, timezone
from enum import Enum
from typing import Any, Dict, List, Optional, Tuple
import uuid


class SeverityLevel(str, Enum):
    INFO = "INFO"
    LOW = "LOW"
    MEDIUM = "MEDIUM"
    HIGH = "HIGH"
    CRITICAL = "CRITICAL"


class EventType(str, Enum):
    INTRUSION = "INTRUSION"
    TRIPWIRE_CROSS = "TRIPWIRE_CROSS"
    LOITERING = "LOITERING"
    NIGHT_MOVEMENT = "NIGHT_MOVEMENT"
    VEHICLE_INTRUSION = "VEHICLE_INTRUSION"
    STATIONARY_VEHICLE = "STATIONARY_VEHICLE"
    ANPR_DETECTION = "ANPR_DETECTION"
    WATCHLIST_PLATE = "WATCHLIST_PLATE"
    FACE_DETECTION = "FACE_DETECTION"
    WATCHLIST_FACE = "WATCHLIST_FACE"
    CAMERA_OFFLINE = "CAMERA_OFFLINE"
    SYSTEM_ERROR = "SYSTEM_ERROR"


@dataclass
class Detection:
    class_name: str
    confidence: float
    bbox: Tuple[int, int, int, int]  # (x1, y1, x2, y2)
    frame_id: int = 0
    timestamp: str = field(default_factory=lambda: datetime.now(timezone.utc).isoformat())

    @property
    def center(self) -> Tuple[int, int]:
        x1, y1, x2, y2 = self.bbox
        return int((x1 + x2) / 2), int((y1 + y2) / 2)

    @property
    def bottom_center(self) -> Tuple[int, int]:
        x1, y1, x2, y2 = self.bbox
        return int((x1 + x2) / 2), int(y2)


@dataclass
class TrackedObject:
    track_id: int
    class_name: str
    confidence: float
    bbox: Tuple[int, int, int, int]
    first_seen: float  # Unix timestamp
    last_seen: float   # Unix timestamp
    trajectory: List[Tuple[int, int]] = field(default_factory=list)
    zone_dwell_times: Dict[str, float] = field(default_factory=dict)
    state: Dict[str, Any] = field(default_factory=dict)

    @property
    def current_pos(self) -> Tuple[int, int]:
        x1, y1, x2, y2 = self.bbox
        return int((x1 + x2) / 2), int(y2)


@dataclass
class ZoneDefinition:
    zone_id: str
    name: str
    zone_type: str  # 'polygon' or 'line'
    coordinates: List[Tuple[int, int]]  # [(x, y), ...]
    camera_id: str
    severity: SeverityLevel = SeverityLevel.HIGH
    loitering_threshold_seconds: float = 10.0
    enabled: bool = True


@dataclass
class ANPRResult:
    plate_text: str
    confidence: float
    bbox: Tuple[int, int, int, int]
    is_valid_format: bool
    watchlist_match: bool = False
    watchlist_category: Optional[str] = None
    vehicle_track_id: Optional[int] = None


@dataclass
class FaceResult:
    bbox: Tuple[int, int, int, int]
    confidence: float
    embedding: Optional[List[float]] = None
    match_found: bool = False
    matched_identity_id: Optional[str] = None
    matched_name: Optional[str] = None
    similarity_score: float = 0.0
    watchlist_category: Optional[str] = None


@dataclass
class EventRecord:
    event_id: str = field(default_factory=lambda: str(uuid.uuid4()))
    camera_id: str = "CAM-01"
    timestamp: str = field(default_factory=lambda: datetime.now(timezone.utc).isoformat())
    event_type: EventType = EventType.INTRUSION
    severity: SeverityLevel = SeverityLevel.HIGH
    track_id: Optional[int] = None
    object_class: Optional[str] = None
    confidence: float = 1.0
    zone_id: Optional[str] = None
    snapshot_path: Optional[str] = None
    clip_path: Optional[str] = None
    metadata: Dict[str, Any] = field(default_factory=dict)

    def to_dict(self) -> Dict[str, Any]:
        return {
            "event_id": self.event_id,
            "camera_id": self.camera_id,
            "timestamp": self.timestamp,
            "event_type": self.event_type.value if isinstance(self.event_type, EventType) else str(self.event_type),
            "severity": self.severity.value if isinstance(self.severity, SeverityLevel) else str(self.severity),
            "track_id": self.track_id,
            "object_class": self.object_class,
            "confidence": round(self.confidence, 4),
            "zone_id": self.zone_id,
            "snapshot_path": self.snapshot_path,
            "clip_path": self.clip_path,
            "metadata": self.metadata,
        }
