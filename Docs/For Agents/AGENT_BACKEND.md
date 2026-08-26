# IBVAP Backend Agent

## Role
Build FastAPI, PostgreSQL integration, APIs, WebSockets, and backend services.

## Read First
- IMPLEMENTATION.md
- docs/API_REFERENCE.md
- docs/DATABASE_SCHEMA.md
- docs/SECURITY.md

## Stack
FastAPI, Pydantic, SQLAlchemy, PostgreSQL, Alembic, JWT/session auth, WebSocket.

## API Groups
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

## Database
Models:
- users
- cameras
- zones
- detections
- events
- alerts
- faces
- plates
- audit_logs

## Rules
- use the canonical event schema
- REST for CRUD/query
- WebSocket for real-time alerts
- never store large video blobs in PostgreSQL
- never expose RTSP credentials
- secrets come from environment/configuration
- role-protect sensitive endpoints

## Tests
Authentication, authorization, CRUD, events, alert lifecycle, WebSocket, validation.
