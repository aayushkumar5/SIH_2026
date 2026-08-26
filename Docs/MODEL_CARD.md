# Model card

Covers the models used across the IBVAP pipeline: intended use, data, known limitations, and where human review must stay in the loop. This should be kept current as models are actually trained/fine-tuned — the entries below are the planned/default choices, not yet-measured production metrics.

## Detection — YOLOv8n/s or YOLOv11

- **Task:** person, vehicle (car/truck/motorcycle/bus), face, plate detection in one pass
- **Base weights:** COCO-pretrained, fine-tuned on border/surveillance-style imagery
- **Why this model:** real-time inference speed on edge (Jetson-class) hardware is a hard constraint here — accuracy is traded off against being able to run live at all
- **Known limitation:** COCO pretraining biases toward urban/Western imagery; fine-tuning on locally representative footage (terrain, clothing, vehicle types typical of the border region) is necessary before deployment, not optional

## Tracking — ByteTrack (+ optional OSNet/FastReID for cross-camera)

- **Task:** assign persistent IDs to detected objects across frames; re-identify a subject across multiple cameras within the same BOP
- **Known limitation:** re-identification degrades with long gaps between camera fields of view, drastic lighting changes (day/IR handoff), or heavy occlusion — treat cross-camera identity as a probable match, not a certainty, in the UI

## Face recognition — RetinaFace (detection) + ArcFace (recognition)

- **Task:** detect faces, compute embeddings, compare against a watchlist via cosine similarity
- **Known limitation — report honestly in any demo/pitch:** reliable recognition on standard CCTV resolution typically holds only to roughly 15-20m, and accuracy drops further with off-angle faces, low light, or partial occlusion (masks, headwear). The system should present three tiers — high-confidence match, possible match, insufficient resolution to determine — rather than a single binary yes/no. This is a legitimate face-recognition system operating on identifiable biometric data; access to the watchlist and match results must be role-gated and logged (see SECURITY.md).

## ANPR — YOLO plate detector + PaddleOCR / custom CRNN

- **Task:** detect plate region, read the plate text
- **Known limitation:** needs fine-tuning specifically on Indian plate fonts/formats; night glare, mud/damage, and non-standard plates will reduce read confidence. Unreadable plates should route to manual review rather than being silently dropped or guessed.

## Low-light enhancement — Zero-DCE (fallback: CLAHE/gamma correction)

- **Task:** improve frame visibility before detection on low-light/IR frames
- **Why Zero-DCE:** requires no paired low/normal-light training data, which matters since paired border footage won't exist
- **Known limitation:** enhancement is not a substitute for actual IR-capable cameras where those exist; on true RGB-only cameras in near-darkness, detection quality has a real floor regardless of enhancement

## Suspicious/behavior detection — rule-based heuristics (not deep behavior models)

- **Task:** flag loitering (dwell time over threshold), wrong-direction movement, fence-approach trajectories
- **Why heuristics over deep models (e.g. ST-GCN) for this stage:** heuristics are explainable to a non-technical operator ("this person has been stationary for 4 minutes near the fence") and don't require large labeled behavior datasets that don't exist for this domain. Full learned behavior models are noted as future work, not claimed as current capability.

## Cross-cutting responsible-AI notes

- **False positive vs false negative tradeoff:** in a border security context, a missed intrusion (false negative) is a more severe failure than an extra false alert — but too many false alerts causes operators to start ignoring the system entirely (alarm fatigue), which functionally reduces the same detection rate. Tune confidence and persistence thresholds with both failure modes explicitly in mind, and track the false-positive rate as a first-class metric, not an afterthought.
- **Human-in-the-loop is required, not optional.** No model output in this system should trigger an autonomous action (e.g. automated force response) — every alert routes to a human operator for judgment. This should be stated explicitly in any pitch.
- **Bias and fairness:** face recognition and behavior heuristics can encode bias from training data or threshold choices. Before deployment, evaluate false-match and false-flag rates aren't skewed across any demographic grouping visible in your test data.

## Data sources for prototyping (public, since real border footage is restricted)

COCO, WIDER FACE, CCPD (plates — note: Chinese plates, format differs from Indian plates, fine-tuning required), VIRAT, UCF-Crime, NVIDIA AI City Challenge datasets. See [REFERENCES.md](./REFERENCES.md) for details and the accuracy caveat on these citations.
