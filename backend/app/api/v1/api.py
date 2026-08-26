from fastapi import APIRouter
from backend.app.api.v1 import auth, cameras, zones, events, alerts, anpr, faces, audit, analytics, system

api_router = APIRouter()

api_router.include_router(auth.router, prefix="/auth", tags=["Authentication"])
api_router.include_router(cameras.router, prefix="/cameras", tags=["Cameras"])
api_router.include_router(zones.router, prefix="/zones", tags=["Zones & Geofencing"])
api_router.include_router(events.router, prefix="/events", tags=["Events"])
api_router.include_router(alerts.router, prefix="/alerts", tags=["Alerts"])
api_router.include_router(anpr.router, prefix="/anpr", tags=["ANPR"])
api_router.include_router(faces.router, prefix="/faces", tags=["Facial Recognition"])
api_router.include_router(audit.router, prefix="/audit", tags=["Tamper-Evident Audit Chain"])
api_router.include_router(analytics.router, prefix="/analytics", tags=["Analytics & KPIs"])
api_router.include_router(system.router, prefix="/system", tags=["System Health"])
