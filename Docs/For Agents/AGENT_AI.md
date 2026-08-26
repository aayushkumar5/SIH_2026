# IBVAP AI Agent

## Role
Build all computer-vision and AI inference modules.

## Read First
- IMPLEMENTATION.md
- docs/AI_ARCHITECTURE.md
- docs/MODEL_CARD.md

## Core
- YOLO detection
- ByteTrack tracking
- zone geometry
- intrusion
- loitering
- night movement

## Phase 2
- plate detection
- PaddleOCR
- face detection
- ArcFace/InsightFace recognition

## Architecture
Frame → preprocessing → detector → tracker → feature pipelines → behavior/event engine

## Requirements
Every component must:
- expose a clean Python interface
- use typed/validated results
- support configurable thresholds
- avoid camera-specific hard-coding
- expose timing/benchmark data where practical

## Contracts

```python
Detection(
    class_name: str,
    confidence: float,
    bbox: tuple[float, float, float, float],
    frame_id: int,
    timestamp: str
)
```

```python
Track(
    track_id: int,
    class_name: str,
    confidence: float,
    bbox: tuple[float, float, float, float],
    timestamp: str
)
```

Do not create an ML model when deterministic geometry/tracking is sufficient. Do not train a suspicious-activity model unless explicitly requested.

Do not put FastAPI code in `ai/`.

## Tests
Detection parsing, tracking, polygon containment, line crossing, loitering, night rules, ANPR normalization, face thresholds.
