# IBVAP — Actual ANPR Implementation Specification

## Objective
Implement real Automatic Number Plate Recognition.

## Pipeline
```text
Video Frame
 ↓
Vehicle Detection
 ↓
Plate Detection
 ↓
Plate Crop
 ↓
Image Preprocessing
 ↓
OCR
 ↓
Plate Normalization
 ↓
Validation
 ↓
Watchlist Matching
 ↓
ANPR Event
```

## Components
- vehicle detector
- license-plate detector
- plate cropper
- preprocessing
- PaddleOCR or approved OCR engine
- Indian plate normalization/validation
- watchlist matcher
- event generator

## Output
```json
{
  "plate_text": "XX00XX0000",
  "confidence": 0.91,
  "camera_id": "CAM-01",
  "vehicle_track_id": 42,
  "timestamp": "...",
  "watchlist_match": false
}
```

## Requirements
- support configurable OCR thresholds
- retain original OCR confidence
- do not silently correct uncertain characters
- store evidence reference
- support search by plate text
- support watchlist CRUD

## Acceptance Criteria
A test video containing readable plates must produce OCR results and persisted ANPR events. Accuracy must be measured on a labelled sample.
