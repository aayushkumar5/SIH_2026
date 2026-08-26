# Testing & evaluation strategy

## Unit tests

- **Detection module:** feed known test images/frames, assert expected classes are detected above threshold.
- **Tracking module:** feed a synthetic sequence with known object paths, assert track IDs remain stable and don't fragment/swap unexpectedly.
- **Virtual fence logic:** unit test `side_of_line()` and crossing-detection logic directly with hand-constructed point sequences (this is pure geometry, cheap to test exhaustively — edge cases: point exactly on the line, rapid back-and-forth crossing, object appearing already past the line).
- **Alert dedupe:** assert a single crossing only fires one alert (the `state["alerted"]` guard in the prototype), and that a genuinely new crossing after re-entry does fire again if that's the intended behavior — decide and test this explicitly, it's a real design choice.

## Integration tests

- End-to-end: sample video in → verify expected event log output, including correct event count, correct track-to-class mapping, correct timestamps.
- Edge-to-central sync: simulate an uplink outage, verify events buffer locally and sync correctly once the link returns, with no duplicate or lost events.
- API contract tests: verify each endpoint in API_REFERENCE.md against its documented request/response shape.

## Model evaluation (accuracy, not just "it runs")

| Model | Metric | Notes |
|---|---|---|
| Detection | mAP@0.5, per-class precision/recall | Report separately for day vs low-light conditions — they will differ substantially |
| Tracking | ID-switch rate, track fragmentation rate | Measured on a held-out video with hand-annotated ground truth tracks |
| Face recognition | True positive rate at fixed false positive rate, broken down by distance bucket (e.g. <10m, 10-20m, >20m) | A single blended accuracy number hides where the system actually fails |
| ANPR | Character-level and full-plate read accuracy | Separately for day/night and clean/damaged plates if you can source such test data |
| Virtual fence | Precision/recall on labeled crossing events | Distinguish "person crossed" from "camera shake/noise triggered a false crossing" |

## Operational metrics (what actually matters to an operator)

- **False-positive rate over time** — alerts per hour that a human reviewer marks as not-a-real-event. This is the single most important number for whether the system gets trusted or ignored.
- **Time-to-alert** — latency from the actual event (crossing, face appearing) to the alert reaching the dashboard.
- **Miss rate on known test scenarios** — staged walk-throughs of the virtual fence, at different times of day, at different distances/angles.

## Field/pilot testing plan

1. Deploy the core pipeline (detection, tracking, virtual fence) at a single camera on a single BOP.
2. Run in shadow mode — generate alerts but don't route them to live operator action yet — for a defined period (e.g. 1-2 weeks), logging every alert for manual review.
3. Compute the false-positive rate from shadow-mode data; tune confidence and persistence thresholds against it.
4. Only after false-positive rate is at an acceptable level, move to live operator-facing alerting.
5. Repeat the shadow-mode step for each new module (face, ANPR, behavior) before it goes live.

## What "done" looks like for the SIH prototype round

Not full field validation — that's unrealistic for a hackathon timeline. A credible prototype-round bar: the core pipeline (as already built) running live or on recorded footage with visible detection/tracking/alerting, a working event log, and an honest, specific account of what's measured vs what's still a design target. Judges are more convinced by "here's our measured false-positive rate on this test set and here's our plan to improve it" than by an unqualified accuracy claim.
