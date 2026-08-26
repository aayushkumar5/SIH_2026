from typing import List, Optional
from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session
from backend.app.core.database import get_db
from backend.app.models.alert import Alert
from backend.app.schemas.schemas import AlertAction, AlertOut
from backend.app.services.alert_service import AlertService

router = APIRouter()


@router.get("/", response_model=List[AlertOut])
def list_alerts(
    status: Optional[str] = None,
    severity: Optional[str] = None,
    camera_id: Optional[str] = None,
    limit: int = Query(50, le=200),
    offset: int = 0,
    db: Session = Depends(get_db)
):
    query = db.query(Alert)
    if status:
        query = query.filter(Alert.status == status)
    if severity:
        query = query.filter(Alert.severity == severity)
    if camera_id:
        query = query.filter(Alert.camera_id == camera_id)
    return query.order_by(Alert.created_at.desc()).offset(offset).limit(limit).all()


@router.post("/{alert_id}/action", response_model=AlertOut)
def alert_action(
    alert_id: str,
    action_in: AlertAction,
    db: Session = Depends(get_db)
):
    alert = AlertService.update_alert_status(
        db=db,
        alert_id=alert_id,
        action=action_in.action.upper(),
        user_name="COMMANDER_HQ",
        notes=action_in.notes
    )
    if not alert:
        raise HTTPException(status_code=404, detail="Alert not found")
    return alert
