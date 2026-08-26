# IBVAP — Actual Face Recognition Implementation Specification

## Objective
Implement face detection, embedding generation, matching, watchlists, and events.

## Pipeline
```text
Frame
 ↓
Face Detector
 ↓
Face Alignment
 ↓
Embedding Model
 ↓
Vector Similarity
 ↓
Threshold Decision
 ↓
Watchlist Match
 ↓
Face Event
```

## Components
- face detector such as SCRFD
- ArcFace/InsightFace embedding model
- vector similarity search
- watchlist
- threshold configuration
- evidence capture

## Data
A watchlist identity should contain:
- identity ID
- display name
- reference image/embedding
- status
- created_at
- updated_at

## Important
A similarity score is not proof of identity. The UI must distinguish:
- no match
- possible match
- high-confidence configured match

## Privacy/Security
Protect embeddings and reference images. Restrict access through RBAC and audit sensitive actions.

## Acceptance Criteria
- face detected
- embedding generated
- comparison executed
- configured threshold applied
- match event persisted
- evidence accessible only to authorized users
