from typing import Any, Dict, List
from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from backend.app.core.database import get_db
from backend.app.services.analytics_service import AnalyticsService

router = APIRouter()


@router.get("/summary", response_model=Dict[str, Any])
def get_summary(db: Session = Depends(get_db)):
    return AnalyticsService.get_dashboard_summary(db)


@router.get("/trends", response_model=List[Dict[str, Any]])
def get_trends(hours: int = 24, db: Session = Depends(get_db)):
    return AnalyticsService.get_hourly_trends(db, hours=hours)
