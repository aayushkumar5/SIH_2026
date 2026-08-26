# IBVAP — Intelligent Border Video Analytics Platform

**SIH26187** | Ministry of Home Affairs — Sashastra Seema Bal (SSB), Police II Division | Category: Software | Theme: Blockchain & Cybersecurity

Transforms existing IP CCTV infrastructure at Border Out Posts into an intelligent surveillance network using AI/CV — no dedicated FRS, ANPR, or smart-camera hardware required.

## The problem

SSB runs CCTV at BOPs, check posts, and border roads across largely open India–Nepal/Bhutan borders, but conventional CCTV only records and streams — it requires continuous human observation, and advanced capabilities (face recognition, ANPR, intrusion detection) normally need expensive proprietary hardware that's impractical to deploy at scale in remote areas.

## What this does

A software-only analytics layer that ingests standard RTSP/ONVIF camera streams and provides:

- Human detection & tracking
- Vehicle detection & classification
- Face detection (+ recognition against a watchlist)
- Automatic Number Plate Recognition (ANPR)
- Virtual fence intrusion detection
- Suspicious activity detection (loitering, wrong-direction movement)
- Night-time movement detection
- Real-time alerts + tamper-evident event logging

## Repo structure

```
.
├── docs/                          — this documentation set
│   ├── README.md
│   ├── ARCHITECTURE.md            — system design, layers, data flow
│   ├── API_REFERENCE.md           — backend REST/WS API
│   ├── MODEL_CARD.md              — ML/DL models, data, limitations
│   ├── DEPLOYMENT.md              — edge + central deployment
│   ├── SECURITY.md                — threat model, tamper-evident logging
│   ├── TESTING.md                 — test & evaluation strategy
│   ├── ROADMAP.md                 — phased build plan
│   ├── PROBLEM_STATEMENT.md       — official SIH26187 text
│   ├── SOLUTION_OVERVIEW.md       — pitch summary, PS-to-feature mapping
│   ├── FEASIBILITY_AND_IMPACT.md  — feasibility, viability, impact
│   └── REFERENCES.md              — datasets, papers, related systems
├── ibvap_core_pipeline.py         — working prototype: detect+track+fence+alert
├── ibvap_demo_output.mp4          — annotated demo run
├── ibvap_event_log.jsonl          — sample structured alert output
└── IBVAP_Tech_Stack_and_Architecture.md — full hardware/software breakdown
```

## Quick start (prototype)

```bash
pip install ultralytics supervision opencv-python-headless
python3 ibvap_core_pipeline.py
```

Runs YOLOv8n detection + ByteTrack tracking + virtual-fence crossing logic on a sample video, writes an annotated video and a JSON event log. See [ARCHITECTURE.md](./ARCHITECTURE.md) for how this fits the full system, and [ROADMAP.md](./ROADMAP.md) for what's next.

## Tech stack at a glance

| Layer | Stack |
|---|---|
| Frontend | React/Next.js, Tailwind, WebSocket, Leaflet, Recharts |
| Backend (platform) | FastAPI/NestJS, PostgreSQL, Kafka/Redis Streams, MinIO, Qdrant |
| Backend (ML/DL) | YOLOv8/v11, ByteTrack, ArcFace, RetinaFace, PaddleOCR, Zero-DCE |
| Edge hardware | NVIDIA Jetson Orin Nano/NX |
| Deployment | Docker, Kubernetes (central) / k3s (edge) |

Full breakdown: [IBVAP_Tech_Stack_and_Architecture.md](../IBVAP_Tech_Stack_and_Architecture.md)

## Status

Core detection/tracking/virtual-fence pipeline is working (see prototype above). Face recognition, ANPR, night enhancement, and the dashboard frontend are the next build phases — see [ROADMAP.md](./ROADMAP.md).

## License

TBD — add your team's chosen license before public release.
