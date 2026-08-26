import os
from contextlib import asynccontextmanager
from fastapi import FastAPI, WebSocket, WebSocketDisconnect
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles

from backend.app.api.v1.api import api_router
from backend.app.core.config import settings
from backend.app.core.database import Base, SessionLocal, engine
from backend.app.core.security import get_password_hash
from backend.app.models.user import User
from backend.app.models.camera import Camera
from backend.app.models.zone import Zone
from backend.app.models.watchlist import PlateWatchlist, FaceWatchlist
from backend.app.websocket.connection_manager import ws_manager


def seed_initial_data():
    """Seed initial admin user, sample border cameras, zones, and sample watchlists."""
    db = SessionLocal()
    try:
        # Create default admin if not exists
        admin = db.query(User).filter(User.username == "commander").first()
        if not admin:
            admin = User(
                username="commander",
                email="commander@ssb.gov.in",
                hashed_password=get_password_hash("ssb@border2026"),
                full_name="BOP Sector Commander",
                role="COMMANDER",
                is_active=True
            )
            db.add(admin)

        # Seed sample cameras
        if db.query(Camera).count() == 0:
            cameras = [
                Camera(
                    id="CAM-01",
                    name="North Perimeter Fence",
                    rtsp_url="rtsp://192.168.1.101:554/live/stream1",
                    location_name="Sector 1 - North Border",
                    latitude=29.8512,
                    longitude=80.5421,
                    bop_id="BOP-DHARCHULA-01",
                    is_online=True
                ),
                Camera(
                    id="CAM-02",
                    name="Main Checkpost Gate",
                    rtsp_url="rtsp://192.168.1.102:554/live/stream1",
                    location_name="Checkpost Alpha",
                    latitude=29.8520,
                    longitude=80.5435,
                    bop_id="BOP-DHARCHULA-01",
                    is_online=True
                ),
                Camera(
                    id="CAM-03",
                    name="River Bank Approach",
                    rtsp_url="rtsp://192.168.1.103:554/live/stream1",
                    location_name="Kali River Bank",
                    latitude=29.8505,
                    longitude=80.5408,
                    bop_id="BOP-DHARCHULA-01",
                    is_online=True
                ),
                Camera(
                    id="CAM-04",
                    name="Forest Trail Outpost",
                    rtsp_url="rtsp://192.168.1.104:554/live/stream1",
                    location_name="Eastern Ridge Trail",
                    latitude=29.8540,
                    longitude=80.5460,
                    bop_id="BOP-DHARCHULA-01",
                    is_online=True
                ),
            ]
            db.add_all(cameras)

        # Seed sample zones
        if db.query(Zone).count() == 0:
            zones = [
                Zone(
                    id="ZONE-NORTH-RESTRICTED",
                    camera_id="CAM-01",
                    name="Buffer Strip - No Man's Land",
                    zone_type="polygon",
                    coordinates=[[50, 50], [900, 50], [900, 450], [50, 450]],
                    severity="CRITICAL",
                    loitering_threshold_seconds=5.0,
                    enabled=True
                ),
                Zone(
                    id="ZONE-GATE-TRIPWIRE",
                    camera_id="CAM-02",
                    name="Checkpost Outer Line",
                    zone_type="line",
                    coordinates=[[100, 300], [850, 300]],
                    severity="HIGH",
                    loitering_threshold_seconds=10.0,
                    enabled=True
                )
            ]
            db.add_all(zones)

        # Seed sample plate watchlist
        if db.query(PlateWatchlist).count() == 0:
            plates = [
                PlateWatchlist(id="UP32BZ9999", category="WANTED", reason="Smuggling Suspect Vehicle", added_by="SSB_INTEL"),
                PlateWatchlist(id="DL01AB1234", category="STOLEN", reason="Stolen Sedan Reported in Border District", added_by="POLICE_HQ"),
                PlateWatchlist(id="UK04CA5678", category="SUSPICIOUS", reason="Multiple Night Sightings", added_by="BOP_OFFICER"),
            ]
            db.add_all(plates)

        db.commit()
    finally:
        db.close()


@asynccontextmanager
async def lifespan(app: FastAPI):
    # Ensure storage dirs exist
    os.makedirs(settings.SNAPSHOT_DIR, exist_ok=True)
    os.makedirs(settings.CLIP_DIR, exist_ok=True)
    # Create DB tables
    Base.metadata.create_all(bind=engine)
    # Seed data
    seed_initial_data()
    yield


app = FastAPI(
    title=settings.PROJECT_NAME,
    version=settings.VERSION,
    description="Software-defined AI Surveillance Platform converting standard IP CCTV streams into an intelligent border monitoring network.",
    lifespan=lifespan
)

# CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.CORS_ORIGINS,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Mount Routers
app.include_router(api_router, prefix=settings.API_V1_STR)


# WebSocket Real-Time Alert Channel
@app.websocket("/ws")
async def websocket_endpoint(websocket: WebSocket):
    await ws_manager.connect(websocket)
    try:
        while True:
            # Keep-alive loop
            data = await websocket.receive_text()
            # Handle client ping
            if data == "ping":
                await websocket.send_text("pong")
    except WebSocketDisconnect:
        ws_manager.disconnect(websocket)
    except Exception:
        ws_manager.disconnect(websocket)
