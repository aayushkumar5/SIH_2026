# IBVAP Frontend Agent

## Role
Build the security-operator dashboard.

## Stack
React, TypeScript, Vite, Tailwind CSS, Recharts, Leaflet, WebSocket.

## Pages
- Login
- Dashboard
- Live Monitoring
- Alerts
- Investigation
- ANPR
- Face Recognition
- Zones
- Cameras
- Map
- Analytics
- Users
- Settings

## UI Principles
Professional security-operations-center design:
- dark/low-glare
- high contrast alerts
- clear status indicators
- readable dense information
- minimal decoration
- consistent severity treatment
- keyboard accessibility

## Live Monitoring
Support:
- multi-camera layout
- live stream
- detection boxes
- track IDs
- zones
- alert overlays
- camera status

Do not perform AI inference in React.

## Real-Time Alerts
Use WebSocket. On critical alert:
- update alert count
- show notification
- highlight camera
- open evidence

## Zone Editor
Allow polygon and line drawing and send coordinates to backend.

## Testing
Page rendering, filters, WebSocket updates, API errors, accessibility basics.
