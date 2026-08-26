# IBVAP — Actual Core AI Implementation Specification

## Objective
Implement real inference modules rather than placeholders.

## Required Pipeline
```text
Frame
 ↓
YOLO Detector
 ↓
ByteTrack
 ↓
Behavior/Zone Engine
 ↓
Event Generator
```

## Detector
Implement:
- model loading
- configurable weights
- confidence threshold
- class filtering
- inference
- structured Detection output

Required initial classes:
- person
- car
- motorcycle
- bus
- truck

## Tracker
Integrate ByteTrack and maintain:
- track_id
- class
- bbox
- confidence
- first_seen
- last_seen
- trajectory

## Pipeline Interface
Create a stable interface so edge and backend code do not depend on YOLO internals.

## Performance
Support:
- configurable inference FPS
- frame skipping
- CPU/GPU selection
- FP16 when supported
- bounded queues

## Acceptance Criteria
Given a sample video:
1. frames are read
2. objects are detected
3. objects receive track IDs
4. results are emitted using the common schema
5. inference FPS and errors are logged
