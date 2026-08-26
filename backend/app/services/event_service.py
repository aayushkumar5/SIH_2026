import uuid
from datetime import datetime, timezone
from typing import Any, Dict, List, Optional, Union
from sqlalchemy.orm import Session
from backend.app.models.event import Event
from backend.app.schemas.schemas import EventCreate
from backend.app.services.alert_service import AlertService
from backend.app.services.hash_chain import HashChainService
from backend.app.websocket.connection_manager import ws_manager


class EventService:
    @staticmethod
    async def create_event(db: Session, event_in: Union[EventCreate, Any], actor: str = "EDGE_AI") -> Event:
        # Determine event_id and payload dict
        if hasattr(event_in, "model_dump"):
            payload_dict = event_in.model_dump()
        elif hasattr(event_in, "to_dict"):
            payload_dict = event_in.to_dict()
        else:
            payload_dict = dict(event_in)

        event_id = payload_dict.get("event_id") or str(uuid.uuid4())
        
        # Check idempotency
        existing = db.query(Event).filter(Event.id == event_id).first()
        if existing:
            return existing

        ts = datetime.now(timezone.utc)
        ts_str = payload_dict.get("timestamp")
        if ts_str:
            try:
                ts = datetime.fromisoformat(str(ts_str).replace("Z", "+00:00"))
            except Exception:
                pass

        event_type = payload_dict.get("event_type", "INTRUSION")
        severity = payload_dict.get("severity", "HIGH")
        if hasattr(event_type, "value"):
            event_type = event_type.value
        if hasattr(severity, "value"):
            severity = severity.value

        event = Event(
            id=event_id,
            camera_id=payload_dict.get("camera_id", "CAM-01"),
            timestamp=ts,
            event_type=str(event_type),
            severity=str(severity),
            track_id=payload_dict.get("track_id"),
            object_class=payload_dict.get("object_class"),
            confidence=float(payload_dict.get("confidence", 1.0)),
            zone_id=payload_dict.get("zone_id"),
            snapshot_path=payload_dict.get("snapshot_path"),
            clip_path=payload_dict.get("clip_path"),
            metadata_json=payload_dict.get("metadata", {}),
        )
        db.add(event)
        db.commit()
        db.refresh(event)

        # 1. Cryptographically hash and append to Tamper-Evident Hash Chain
        HashChainService.append_audit_record(
            db=db,
            event_id=event.id,
            actor=actor,
            action="EVENT_LOGGED",
            target_resource=f"camera:{event.camera_id}",
            payload=payload_dict
        )

        # 2. Evaluate Alert Rule
        await AlertService.evaluate_and_create_alert(db, event)

        # 3. Broadcast Event to Live Video Wall WebSocket
        await ws_manager.broadcast("NEW_EVENT", {
            "id": event.id,
            "camera_id": event.camera_id,
            "timestamp": event.timestamp.isoformat(),
            "event_type": event.event_type,
            "severity": event.severity,
            "track_id": event.track_id,
            "object_class": event.object_class,
            "confidence": event.confidence,
            "zone_id": event.zone_id,
            "metadata": event.metadata_json,
        })

        return event
