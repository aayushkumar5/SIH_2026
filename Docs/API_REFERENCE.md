# API reference

Draft spec for the backend platform API. Base URL: `https://<host>/api/v1`. All endpoints (except `/auth/login`) require a bearer token from `/auth/login`.

## Authentication

### `POST /auth/login`
```json
// request
{ "username": "operator1", "password": "..." }
// response
{ "access_token": "...", "role": "operator", "expires_in": 3600 }
```

Roles: `admin`, `operator`, `auditor`. Auditors get read-only access to logs, no live control.

## Cameras

### `GET /cameras`
List all registered cameras with live status.
```json
[
  { "camera_id": "bop14-cam2", "bop_id": "bop14", "status": "online", "last_frame_at": "2026-08-26T09:40:00Z" }
]
```

### `GET /cameras/{camera_id}/stream`
Returns a signed WebRTC/HLS stream URL for live viewing.

### `POST /cameras/{camera_id}/zones`
Define a virtual fence / zone for this camera (drawn by an operator in the dashboard).
```json
{ "zone_type": "line", "points": [[0, 200], [640, 200]], "label": "north tripwire" }
```

## Events & alerts

### `GET /events`
Query historical events. Filters: `camera_id`, `event_type`, `from`, `to`, `min_confidence`.
```json
{
  "results": [
    {
      "event_id": "evt_8891",
      "event_type": "virtual_fence_intrusion",
      "camera_id": "bop14-cam2",
      "track_id": 5,
      "object_class": "person",
      "confidence": 0.71,
      "timestamp": "2026-08-26T09:38:44Z",
      "clip_url": "https://.../clips/evt_8891.mp4"
    }
  ],
  "next_cursor": "..."
}
```

### `GET /events/{event_id}`
Full detail for one event, including audit hash chain reference.

### `WS /alerts/stream`
WebSocket feed of alerts as they're confirmed by the edge alert engine. Dashboard subscribes here for the live alert panel — this is the same event shape as `GET /events`, pushed in real time.

## Watchlists

### `GET /watchlist/faces` / `POST /watchlist/faces`
Manage the face watchlist. POST accepts an image; the backend computes and stores the ArcFace embedding.
```json
// POST request (multipart): image file + metadata
{ "label": "person of interest 114", "notes": "..." }
```

### `GET /watchlist/plates` / `POST /watchlist/plates`
Manage the plate watchlist.
```json
{ "plate_number": "UP32AB1234", "label": "flagged vehicle", "notes": "..." }
```

## Audit

### `GET /audit/verify`
Recomputes the hash chain over a range of events and confirms integrity (or reports the first broken link). Auditor-role only.

## Error format

```json
{ "error": { "code": "camera_offline", "message": "Camera bop14-cam2 has not sent a frame in 120s" } }
```

Standard HTTP status codes apply (`401` unauthenticated, `403` wrong role, `404` not found, `422` validation error).

## Notes

This is a design-stage spec to guide implementation, not a documented/tested API yet — endpoint names and payload shapes should be finalized alongside the actual backend framework choice (FastAPI/NestJS) as the platform is built out.
