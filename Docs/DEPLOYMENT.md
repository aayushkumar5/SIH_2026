# Deployment

## Edge deployment (per BOP)

**Target hardware:** NVIDIA Jetson Orin Nano/NX (single camera cluster) or Orin AGX (larger BOP with many cameras).

**Steps:**
1. Flash JetPack (NVIDIA's Jetson OS/SDK image) onto the device.
2. Export trained models to TensorRT for hardware-accelerated inference:
   ```bash
   yolo export model=best.pt format=engine device=0   # TensorRT engine
   ```
3. Deploy the inference service as a Docker container (or bare k3s pod) on the Jetson, configured with:
   - RTSP URLs for each camera on-site
   - Local event queue with disk-backed buffering (survives uplink loss)
   - Zone/tripwire config synced from central (or set locally if offline)
4. Point the edge box's outbound sync at the central event ingestion endpoint; configure retry/backoff for intermittent connectivity.
5. Wire local alerting (on-site siren/light, if present) to trigger directly off the edge box's alert engine — this must not depend on the central link being up.

**Resource budgeting (rule of thumb, validate against your actual model sizes):** a quantized YOLOv8n running via TensorRT on Orin Nano should sustain real-time inference on a handful of camera streams; scale hardware (or reduce per-camera frame rate) if adding face recognition and ANPR branches on the same box pushes past its throughput.

## Central deployment (command center / regional server)

- **Orchestration:** Kubernetes cluster (can be on-prem given the sensitivity of the data — avoid assuming public cloud is acceptable for an MHA deployment without confirming data-handling policy).
- **Core services:** API gateway, PostgreSQL/TimescaleDB, MinIO, vector DB, Kafka/Redis, monitoring stack (Prometheus + Grafana).
- **Networking:** central services should sit behind the same auth/RBAC boundary as the API — no direct public exposure of the database or object storage.

## Configuration

Environment variables (indicative — finalize alongside actual service implementation):

```
CAMERA_RTSP_URLS=rtsp://...,rtsp://...
EDGE_SYNC_ENDPOINT=https://central.example/api/v1/events/ingest
EDGE_SYNC_RETRY_INTERVAL_S=30
MODEL_ENGINE_PATH=/models/yolov8n.engine
CONFIRM_FRAMES_THRESHOLD=5
DB_CONNECTION_STRING=postgresql://...
VECTOR_DB_URL=http://qdrant:6333
```

## Network requirements

- **Minimum:** enough bandwidth for event JSON (~1KB/event) plus periodic snapshot images. This should work over a weak 4G link.
- **Preferred:** enough for on-demand clip retrieval when an operator wants to review a specific alert.
- **Not required:** continuous raw video streaming to the center — if your deployment design needs this, revisit it; it defeats the bandwidth-aware design principle.

## Monitoring

Track per-BOP: camera uptime, edge inference FPS, sync lag (time since last successful central sync), and false-positive rate trend. A BOP that's silently falling behind on sync or dropping frames is itself a security gap worth surfacing to operators.

## Rollout plan (suggested)

1. Single-camera pilot at one BOP with the core pipeline only (detection, tracking, virtual fence) — validate real-world false-positive rate before adding modules.
2. Add face/ANPR/behavior modules once the core is validated.
3. Expand to full camera coverage at the pilot BOP.
4. Roll out to additional BOPs, feeding lessons learned (threshold tuning, hardware sizing) back into the config before each new site.
