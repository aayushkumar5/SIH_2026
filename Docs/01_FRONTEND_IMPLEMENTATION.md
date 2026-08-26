# IBVAP — Actual Frontend Implementation Specification

## Objective
Build the real React/TypeScript frontend, not a mockup.

## Required Pages
- Login
- Command Dashboard
- Live Monitoring
- Alerts
- Event Investigation
- ANPR
- Face Recognition
- Camera Management
- Zone Management
- Map
- Analytics
- Users/Roles
- Settings/System Health

## Core Components
```text
frontend/src/
├── app/
├── pages/
├── components/
│   ├── camera/
│   ├── alerts/
│   ├── detection/
│   ├── anpr/
│   ├── face/
│   ├── maps/
│   └── charts/
├── hooks/
├── services/
│   ├── api/
│   └── websocket/
├── stores/
├── types/
└── utils/
```

## Live Monitoring
Implement:
- camera grid
- live video playback
- online/offline indicator
- bounding boxes
- track IDs
- zone overlays
- event markers
- camera selection
- fullscreen
- snapshot/event drill-down

The browser must not consume raw RTSP. Use WebRTC/HLS through the approved media gateway.

## Real-Time Alerts
WebSocket events must update:
- alert counter
- notification panel
- camera status
- event feed
- severity indicators

## API Integration
Create a typed API client for:
```text
/auth
/cameras
/events
/alerts
/anpr
/faces
/zones
/analytics
/users
/system
```

Do not hard-code fake API responses in production code.

## State
Use a predictable state-management approach. Keep server state separate from UI state.

## Error Handling
Display useful states for:
- API unavailable
- camera offline
- WebSocket disconnected
- no data
- loading
- permission denied

## Acceptance Criteria
A real backend can be connected without changing the page architecture. The dashboard must display real camera/event/alert data.
