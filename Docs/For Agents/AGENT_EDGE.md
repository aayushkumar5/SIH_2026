# IBVAP Edge Agent

## Role
Build the software running near cameras at a Border Out Post.

## Responsibilities
- RTSP ingestion
- camera health
- local AI pipeline
- local event/evidence storage
- offline queue
- synchronization

## Architecture
Camera → RTSP → stream manager → frame buffer → AI → event engine → local store → sync queue → central API

## Offline Requirement
When central connectivity is unavailable:
- detection continues
- events queue locally
- evidence stays local
- retry with exponential backoff
- prevent duplicates

## Camera Health
Track online/offline, last frame, FPS, reconnect count, errors.

## Resource Management
Support configurable inference FPS, frame skipping, CPU/GPU selection, bounded queues, graceful shutdown.

## Browser Streaming
Never expose RTSP directly to browsers. Use a media gateway such as MediaMTX/WebRTC.

## Tests
Reconnects, offline queue, duplicate prevention, bad frames, shutdown, synchronization.
