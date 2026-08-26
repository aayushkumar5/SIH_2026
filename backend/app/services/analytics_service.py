from datetime import datetime, timedelta, timezone
from typing import Any, Dict, List
from sqlalchemy import func
from sqlalchemy.orm import Session
from backend.app.models.alert import Alert
from backend.app.models.camera import Camera
from backend.app.models.event import Event


class AnalyticsService:
    @staticmethod
    def get_dashboard_summary(db: Session) -> Dict[str, Any]:
        now = datetime.now(timezone.utc)
        last_24h = now - timedelta(hours=24)

        total_cameras = db.query(Camera).count()
        online_cameras = db.query(Camera).filter(Camera.is_online == True).count()

        active_alerts_count = db.query(Alert).filter(Alert.status == "ACTIVE").count()
        critical_alerts_count = db.query(Alert).filter(Alert.status == "ACTIVE", Alert.severity == "CRITICAL").count()
        events_24h_count = db.query(Event).filter(Event.timestamp >= last_24h).count()

        # Group events by type
        event_types_query = db.query(Event.event_type, func.count(Event.id)).filter(Event.timestamp >= last_24h).group_by(Event.event_type).all()
        events_by_type = {row[0]: row[1] for row in event_types_query}

        # Calculate Threat Level
        threat_level = "ELEVATED" if critical_alerts_count > 0 else ("MODERATE" if active_alerts_count > 0 else "NORMAL")

        return {
            "threat_level": threat_level,
            "total_cameras": total_cameras,
            "online_cameras": online_cameras,
            "active_alerts": active_alerts_count,
            "critical_alerts": critical_alerts_count,
            "events_last_24h": events_24h_count,
            "events_by_type": events_by_type,
            "timestamp": now.isoformat(),
        }

    @staticmethod
    def get_hourly_trends(db: Session, hours: int = 24) -> List[Dict[str, Any]]:
        now = datetime.now(timezone.utc)
        since = now - timedelta(hours=hours)
        events = db.query(Event).filter(Event.timestamp >= since).order_by(Event.timestamp.asc()).all()

        # Aggregate by hour bucket
        hourly_counts: Dict[str, int] = {}
        for h in range(hours):
            bucket_time = (since + timedelta(hours=h)).strftime("%H:00")
            hourly_counts[bucket_time] = 0

        for evt in events:
            if evt.timestamp:
                bucket = evt.timestamp.strftime("%H:00")
                if bucket in hourly_counts:
                    hourly_counts[bucket] += 1

        return [{"time": k, "events": v} for k, v in hourly_counts.items()]
