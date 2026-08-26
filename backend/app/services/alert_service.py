import uuid
from datetime import datetime, timezone
from typing import Optional
from sqlalchemy.orm import Session
from backend.app.models.alert import Alert
from backend.app.models.event import Event
from backend.app.services.hash_chain import HashChainService
from backend.app.websocket.connection_manager import ws_manager


class AlertService:
    @staticmethod
    async def evaluate_and_create_alert(db: Session, event: Event) -> Optional[Alert]:
        """
        Evaluates incoming event against alert criteria. High & Critical events immediately spawn active alerts.
        """
        if event.severity not in ["CRITICAL", "HIGH", "MEDIUM"]:
            return None

        title_map = {
            "INTRUSION": f"Restricted Zone Intrusion ({event.object_class})",
            "VEHICLE_INTRUSION": f"Unauthorized Vehicle Intrusion ({event.object_class})",
            "LOITERING": f"Suspicious Loitering Detected ({event.object_class})",
            "NIGHT_MOVEMENT": f"Curfew / Night Movement Detected ({event.object_class})",
            "WATCHLIST_PLATE": f"ALERT: Hot-listed Vehicle Plate Identified",
            "WATCHLIST_FACE": f"CRITICAL: Wanted / Hot-listed Person Recognized",
            "CAMERA_OFFLINE": f"Camera Feed Offline",
        }
        title = title_map.get(event.event_type, f"Security Alert: {event.event_type}")
        description = f"Event triggered on camera {event.camera_id} with severity {event.severity} (confidence {round(event.confidence * 100, 1)}%)."

        alert = Alert(
            id=str(uuid.uuid4()),
            event_id=event.id,
            camera_id=event.camera_id,
            title=title,
            description=description,
            severity=event.severity,
            status="ACTIVE",
            created_at=datetime.now(timezone.utc),
        )
        db.add(alert)
        db.commit()
        db.refresh(alert)

        # Broadcast real-time alert via WebSocket
        await ws_manager.broadcast("NEW_ALERT", {
            "id": alert.id,
            "event_id": alert.event_id,
            "camera_id": alert.camera_id,
            "title": alert.title,
            "description": alert.description,
            "severity": alert.severity,
            "status": alert.status,
            "created_at": alert.created_at.isoformat(),
        })

        return alert

    @staticmethod
    def update_alert_status(
        db: Session,
        alert_id: str,
        action: str,
        user_name: str,
        notes: Optional[str] = None
    ) -> Optional[Alert]:
        alert = db.query(Alert).filter(Alert.id == alert_id).first()
        if not alert:
            return None

        now = datetime.now(timezone.utc)
        if action == "ACKNOWLEDGE":
            alert.status = "ACKNOWLEDGED"
            alert.acknowledged_by = user_name
            alert.acknowledged_at = now
        elif action in ["RESOLVE", "DISMISS"]:
            alert.status = "RESOLVED" if action == "RESOLVE" else "DISMISSED"
            alert.resolved_by = user_name
            alert.resolved_at = now
            alert.resolution_notes = notes

        db.commit()
        db.refresh(alert)

        # Record action in Audit Hash Chain
        HashChainService.append_audit_record(
            db=db,
            event_id=alert.event_id,
            actor=user_name,
            action=f"ALERT_{action}",
            target_resource=f"alert:{alert.id}",
            payload={"alert_id": alert.id, "status": alert.status, "notes": notes}
        )

        return alert
