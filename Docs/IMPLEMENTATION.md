# IBVAP — Implementation Plan

## Goal
IBVAP (Intelligent Border Video Analytics Platform) converts existing IP CCTV infrastructure into an AI-driven surveillance network.

Core flow:

CCTV / RTSP → Video Ingestion → AI Detection → Tracking → Feature Pipelines → Event Engine → Alert Engine → Backend → Database/Storage → React Dashboard

The system is edge-first for remote border locations and must continue basic detection during temporary WAN outages.

## MVP
1. RTSP/IP-camera ingestion
2. Person detection
3. Vehicle detection/classification
4. Multi-object tracking
5. Virtual line/polygon zones
6. Intrusion detection
7. Loitering detection
8. Night movement detection using time + detection/tracking
9. Real-time alerts
10. Event logging
11. Live monitoring dashboard
12. Alert dashboard
13. Camera management
14. Event investigation/history

Phase 2:
- ANPR
- Face detection/recognition
- Watchlists

Phase 3:
- Advanced behavior models
- Cross-camera tracking
- Low-light improvements
- Edge optimization
- Tamper-evident audit logging
- Advanced analytics

Do not claim a feature is implemented until executable code and a test/demo exist.

## Technology Baseline

### AI
- Python 3.11+
- PyTorch
- Ultralytics YOLO or approved YOLO implementation
- ByteTrack
- OpenCV
- InsightFace / ArcFace
- SCRFD or equivalent face detector
- PaddleOCR
- NumPy

### Backend
- FastAPI
- Pydantic
- SQLAlchemy
- PostgreSQL
- Alembic
- WebSocket
- JWT/session authentication

### Frontend
- React
- TypeScript
- Vite
- Tailwind CSS
- Recharts
- Leaflet
- WebSocket client

### Video
- FFmpeg
- OpenCV
- RTSP
- WebRTC through a media gateway such as MediaMTX

### Deployment
- Docker / Docker Compose
- NVIDIA Container Toolkit when GPU is available
- Linux for edge deployment

## Repository

```text
IBVAP/
├── ai/
├── backend/
├── edge/
├── frontend/
├── models/
├── config/
├── storage/
├── scripts/
├── tests/
├── docs/
├── demo/
├── requirements.txt
├── pyproject.toml
├── docker-compose.yml
├── .env.example
└── README.md
```

## AI Pipeline

### Detection
YOLO detects person and configured vehicle classes.

Output:
```json
{
  "class_name": "person",
  "confidence": 0.94,
  "bbox": [x1, y1, x2, y2],
  "frame_id": 123,
  "timestamp": "..."
}
```

### Tracking
ByteTrack assigns stable IDs.

```json
{
  "track_id": 17,
  "class_name": "person",
  "confidence": 0.94,
  "bbox": [x1, y1, x2, y2],
  "timestamp": "..."
}
```

### Zones / Intrusion
Use polygon/line geometry + tracking. No separate ML model is required.

### Loitering
Measure how long a tracked object remains inside a configured zone. Make the threshold configurable.

### Night Movement
Use configured night hours plus detection/tracking. Low-light enhancement is optional preprocessing, not the definition of night movement.

### ANPR
Vehicle → plate detector → plate crop → preprocessing → PaddleOCR → validation → watchlist.

### Face Recognition
Face detector → alignment → ArcFace embedding → similarity search → watchlist decision.

## Event Contract

Every event should follow one consistent schema:

```json
{
  "event_id": "uuid",
  "camera_id": "CAM-07",
  "timestamp": "ISO-8601",
  "event_type": "INTRUSION",
  "severity": "CRITICAL",
  "track_id": 17,
  "object_class": "person",
  "confidence": 0.94,
  "zone_id": "restricted-01",
  "snapshot_path": "...",
  "clip_path": "...",
  "metadata": {}
}
```

Initial event types:
- INTRUSION
- LOITERING
- NIGHT_MOVEMENT
- VEHICLE_INTRUSION
- ANPR_DETECTION
- WATCHLIST_PLATE
- FACE_DETECTION
- WATCHLIST_FACE
- CAMERA_OFFLINE
- SYSTEM_ERROR

## Alert Engine

event → rule evaluation → severity → alert → WebSocket → dashboard

Examples:
- person crosses restricted zone → CRITICAL
- vehicle crosses restricted zone → CRITICAL
- loitering → HIGH
- night movement in restricted zone → HIGH
- watchlist plate → CRITICAL
- watchlist face → CRITICAL
- camera offline → MEDIUM

Alert lifecycle:
- created
- acknowledged
- resolved
- dismissed

## Backend

API groups:
```text
/auth
/cameras
/streams
/detections
/tracking
/events
/alerts
/anpr
/faces
/zones
/analytics
/users
/system
```

REST handles CRUD/query operations. WebSocket handles real-time events. PostgreSQL stores structured data. Snapshots/clips are stored outside PostgreSQL.

## Frontend

Required pages:
1. Login
2. Dashboard
3. Live Monitoring
4. Alerts
5. Investigation
6. ANPR
7. Face Recognition
8. Zones
9. Camera Management
10. Map
11. Analytics
12. Users
13. Settings

Live Monitoring must support multi-camera view, status, detection boxes, track IDs, zones, alert indicators, and event drill-down.

## Edge

```text
IP Cameras
   ↓ RTSP
Edge Video Manager
   ↓
AI Pipeline
   ↓
Local Event Store
   ↓
Local Alerting
   ↓
Sync Queue
   ↓
Central Backend
```

During WAN outage:
- detection continues
- events are queued
- evidence remains local
- synchronization resumes after reconnection
- duplicate submissions are prevented

## Security

MVP:
- password hashing
- authentication
- RBAC
- input validation
- HTTPS in deployment
- protected RTSP credentials
- no secrets in Git
- audit logging
- evidence access control

Phase 3:
- hash-chained audit events
- signed event payloads
- stronger device authentication

Do not call hash chaining implemented until code and verification tests exist.

## Testing

Every major module needs unit tests. The integration test must cover:

sample video → detector → tracker → intrusion event → backend → database → WebSocket → dashboard

Measure:
- detection precision/recall where ground truth exists
- false positives/negatives
- alert latency
- processing FPS
- CPU/GPU/RAM
- tracking stability
- ANPR accuracy
- face threshold behavior

## Definition of Done

A feature is DONE only when:
- implementation exists
- tests exist
- error handling exists
- configuration is externalized
- documentation is updated
- demo instructions work
- no mock is described as production functionality

## Implementation Order

1. Project bootstrap + shared schemas
2. RTSP + YOLO
3. ByteTrack
4. Zones + intrusion + loitering + night rules
5. FastAPI + PostgreSQL + events/alerts
6. React dashboard + live monitoring + WebSocket
7. ANPR
8. Face recognition
9. Edge offline queue + synchronization
10. Security + audit + performance + integration testing
