# Architecture

## Design principles

1. **Software-only, hardware-agnostic.** The platform assumes only standard IP cameras (RTSP/ONVIF). Any new hardware (edge compute box) is generic and swappable — never a dedicated FRS/ANPR/smart-camera appliance.
2. **Edge-first.** Inference runs at or near the BOP. Only structured events (not raw video) travel over the often-poor uplink to the command center. This is a hard requirement, not an optimization — border connectivity cannot be assumed reliable.
3. **False-positive aware.** Every alert path includes a persistence/confirmation step before it reaches an operator. An unconfirmed single-frame detection is never an alert.
4. **Modular pipeline.** Detection, tracking, recognition, ANPR, and behavior rules are independent stages. Any one can be disabled, swapped, or upgraded without touching the others.
5. **Tamper-evident by design.** Every event is hash-chained at write time so the audit trail can't be silently edited — relevant both for operational trust and evidentiary use.

## System layers

```
IP CCTV cameras (existing infrastructure)
        │  RTSP / ONVIF
        ▼
Edge AI inference (Jetson)
   ├─ video ingestion + preprocessing
   └─ detection + tracking (+ face/ANPR/behavior modules)
        │  structured events only
        ▼
Event & alert engine
   ├─ rule engine (confirm, dedupe, threshold)
   └─ message bus (Kafka / Redis Streams)
        │
        ▼
Backend services
   ├─ REST/GraphQL API
   ├─ PostgreSQL (structured data) + TimescaleDB (event time-series)
   ├─ MinIO (clips, face/plate crops)
   ├─ Vector DB (face/re-ID embeddings)
   └─ Hash-chained audit log
        │  WebSocket + REST
        ▼
Control room dashboard (frontend)
   ├─ live video wall + map
   ├─ alert feed
   └─ watchlist & zone management
```

*(See the interactive architecture diagram shared earlier in this conversation for the visual version of this layer stack.)*

## Frame-level pipeline (per camera, per frame)

```
Camera frame
   → Preprocessing (decode, resize, low-light enhancement)
   → Detection & tracking (YOLO + ByteTrack)
        ├→ Face match (ArcFace vs watchlist)
        ├→ Plate read (OCR + validate)
        └→ Behavior rules (loiter, tripwire, direction)
   → Alert engine (confidence threshold + dedupe)
   → Dashboard & event log (alerts, clips, audit trail)
```

Each of the three branches after detect & track is independent — a camera with no visible plates simply never produces plate-read events, without affecting the other branches.

## Data flow: what crosses the network vs stays local

| Data | Location | Rationale |
|---|---|---|
| Raw video stream | Camera → edge box only | Never leaves the BOP under normal operation — bandwidth cost |
| Detection/tracking state | Edge box (in-memory) | Recomputed per frame, not persisted centrally |
| Confirmed alert events (JSON, ~1KB) | Edge → central, always | Small, must reach command center in near-real-time |
| Alert snapshot/clip (image or short clip) | Edge → central, on-demand or batched | Larger; can be deferred or compressed under poor links |
| Full historical footage | Stays on local NVR at BOP | Central system stores only event-linked clips, not everything |

## Scaling to multiple BOPs

Each BOP runs its own edge box(es) independently — there's no cross-BOP dependency for detection/tracking to function. The central backend aggregates events from all BOPs, so a link outage at one BOP degrades only that BOP's central visibility, not the platform as a whole. Cross-camera re-identification is scoped to cameras *within* a BOP (shared physical area), not across BOPs.

## Failure modes to design for

- **Uplink loss:** edge box buffers events locally, syncs when connectivity returns. Local alerting (siren, on-site display) should not depend on the uplink at all.
- **Camera dropout:** dashboard shows per-camera health status; a dead camera is itself worth alerting on.
- **Model drift / false positive spikes:** dashboard analytics track false-positive rate over time so operators (and your team) can catch a degrading model before it erodes trust in the system.
