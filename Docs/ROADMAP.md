# Roadmap

Phased so each stage is independently demoable — useful both for actual development and for showing progress across SIH's prototype and grand-finale rounds.

## Phase 0 — Core pipeline ✅ done

- Human/vehicle detection (YOLOv8n)
- Multi-object tracking (ByteTrack)
- Virtual fence intrusion detection
- Structured event logging with confidence-threshold false-positive suppression

*Status: working prototype exists — see `ibvap_core_pipeline.py`.*

## Phase 1 — Recognition modules

- Face detection + recognition against a watchlist (RetinaFace + ArcFace)
- ANPR (plate detection + OCR)
- Watchlist management (add/remove faces and plates)

## Phase 2 — Robustness modules

- Low-light/night enhancement (Zero-DCE) feeding into the existing detection pipeline
- Behavior rule engine: loitering (dwell time), wrong-direction movement, fence-approach trajectory
- False-positive tuning pass using shadow-mode test data (see TESTING.md)

## Phase 3 — Dashboard frontend

- Live video wall + WebSocket alert feed
- Map view with BOP/camera locations and alert pins
- Zone/tripwire drawing tool (operator-configurable, replaces the hardcoded fence in Phase 0)
- Event log search/playback, evidence export

## Phase 4 — Platform hardening

- Hash-chained tamper-evident audit log (see SECURITY.md)
- RBAC (admin/operator/auditor roles)
- Edge-to-central sync with offline buffering and retry
- Monitoring (per-camera health, per-BOP sync lag, false-positive trend)

## Phase 5 — Edge optimization & multi-camera

- Model export to TensorRT for Jetson deployment
- Cross-camera re-identification within a BOP (OSNet/FastReID)
- Multi-BOP central aggregation

## Phase 6 — Pilot deployment

- Single-camera shadow-mode pilot at one BOP
- Threshold tuning against real operational data
- Phased rollout to full camera coverage, then additional BOPs

## Suggested mapping to SIH rounds

- **Prototype/idea round:** Phase 0 (working) + Phase 1 mockup/partial implementation + full architecture and documentation set (this repo).
- **Grand finale:** Phase 0-3 substantially working, live demo on recorded or staged footage, honest metrics from TESTING.md rather than unqualified claims.

## Explicitly out of scope for the hackathon timeline (name this, don't hide it)

- Full field validation at a real BOP (Phase 6) — propose it as a post-hackathon deployment plan, not something you claim to have done.
- Deep learned behavior models (ST-GCN or similar) — heuristics are the honest scope; note the learned approach as future work.
- Formal biometric data retention/compliance policy — flag as an open question for SSB/MHA to resolve, not something a hackathon team can unilaterally decide.
