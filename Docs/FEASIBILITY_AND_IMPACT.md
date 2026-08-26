# Feasibility and impact

## Technical feasibility

- **Core pipeline (detection, tracking, virtual fence, alerting) is proven feasible** — it's implemented and running against real video in this project already, not a theoretical claim.
- **Individual components (face recognition, ANPR, low-light enhancement) are all mature, well-documented techniques** (ArcFace, PaddleOCR, Zero-DCE) with existing open implementations — the engineering work is integration and fine-tuning, not novel research.
- **Main technical risk:** real-world accuracy on actual BOP footage (as opposed to public datasets) is unknown until region-representative data is available for fine-tuning and testing. This is flagged honestly rather than assumed away.
- **Edge hardware feasibility:** Jetson-class devices are proven for real-time YOLO-class inference; the risk is tuning throughput when running multiple model branches (detection + face + ANPR) concurrently on constrained hardware, which is a solvable engineering problem (model quantization, selective frame sampling) rather than a fundamental blocker.

## Economic / operational feasibility

- **Primary cost saving:** avoiding per-camera dedicated FRS/ANPR/smart-camera hardware, which is the explicit cost problem stated in the PS. One edge box can serve multiple existing cameras.
- **Deployment cost is concentrated in:** edge compute hardware (one-time per BOP/camera-cluster), central server infrastructure (shared across all BOPs), and the software development effort itself (a hackathon-realistic scope, unlike hardware-heavy alternatives).
- **Ongoing cost:** minimal incremental cost per additional camera on an existing edge box, until that box's throughput limit is reached.

## Social / operational impact

- **Reduced dependence on continuous human monitoring** — operators are alerted to events rather than having to watch every feed continuously, directly addressing observer fatigue.
- **Faster response time** — real-time alerts with location context (map view) rather than after-the-fact review of recorded footage.
- **Extends coverage to remote/resource-constrained BOPs** that couldn't otherwise afford dedicated smart-camera infrastructure — this is an equity-of-coverage argument worth making explicitly, since remote BOPs are often the ones with the weakest existing capability.
- **Evidentiary value** — tamper-evident logging gives confirmed events a defensible chain of custody, useful beyond just real-time alerting.

## Challenges and mitigations

| Challenge | Mitigation |
|---|---|
| Real border footage unavailable for training | Public dataset pretraining + explicit fine-tuning phase once representative data is available; state this as a pre-deployment step, not skip it |
| Poor/unreliable connectivity at remote BOPs | Edge-first architecture; only structured events cross the network, with local buffering during outages |
| Alarm fatigue from false positives | Confirmation-frame thresholding, dedupe logic, and false-positive-rate tracking as a first-class operational metric |
| Biometric data sensitivity | Role-gated access, encryption at rest, explicit open questions flagged to SSB/MHA around retention policy (see SECURITY.md) |
| Model performance in extreme weather (fog, dust, heavy rain) | Named as a known limitation; low-light enhancement helps with darkness but not necessarily with fog/dust — worth testing explicitly rather than assuming it's covered |
| Operator trust and adoption | Explainable alerts (why did this fire — bounding box, trajectory, confidence shown), phased shadow-mode rollout before live alerting |

## What would make this a stronger deployment case (beyond hackathon scope)

- A formal pilot with measured false-positive/false-negative rates on real BOP footage.
- Sign-off from SSB/MHA on data handling and retention policy for biometric data.
- Integration testing against the actual CIBMS interface rather than a generic webhook design.
