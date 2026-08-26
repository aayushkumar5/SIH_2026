# Solution overview

## One-line pitch

IBVAP turns the CCTV cameras SSB already has into an intelligent surveillance network — through software alone — giving border posts real-time human/vehicle detection, face and plate recognition, and intrusion alerts without buying a single new specialized camera.

## The core insight

The PS's binding constraint is "without requiring dedicated FRS, ANPR, or smart-camera hardware." Most surveillance-AI pitches quietly assume better cameras than a remote BOP actually has. IBVAP's differentiator is designing *for* generic IP camera footage from the start — every model choice, threshold, and UI decision is made assuming ordinary 2-5MP CCTV, not idealized input.

## Requirement-to-feature mapping

| PS requirement | How IBVAP delivers it |
|---|---|
| Human detection and tracking | YOLOv8/v11 detection + ByteTrack — working in the current prototype |
| Vehicle detection and classification | Same detector, vehicle class head (car/truck/motorcycle/bus) |
| Face detection | RetinaFace/YOLO-face |
| ANPR | Plate detector + PaddleOCR/CRNN, fine-tuned for Indian plates |
| Virtual fence intrusion detection | Operator-drawn zones + tracked-object line-crossing logic — working in the current prototype |
| Suspicious activity detection | Trajectory heuristics: loitering, wrong-direction movement, fence-approach — scoped explicitly rather than oversold |
| Night-time movement detection | Zero-DCE low-light enhancement ahead of the detection stage |
| Real-time alerts + event logging | Message-bus alert pipeline + hash-chained tamper-evident log — working in the current prototype |
| Eliminate dependence on dedicated hardware | Software runs against existing RTSP/ONVIF streams; only new hardware is a generic edge compute box |
| Improve situational awareness and response time | Live dashboard: video wall, map, real-time alert feed |
| Integrate with existing command & control | REST/webhook integration layer designed to connect to CIBMS |
| Cost-effective, scalable, remote-deployable | Edge-first architecture — bandwidth-aware, works over degraded links, scales per-BOP independently |

## What's already built (not just proposed)

The core pipeline — detection, tracking, virtual fence intrusion, and structured event logging with false-positive suppression — is implemented and running (`ibvap_core_pipeline.py`), not just a slide. This is deliberate: it's better to demonstrate one real, working slice of the system end-to-end than to describe eight features that only exist as bullet points.

## Why this approach over the obvious alternatives

- **Why not just buy smart cameras?** That's the exact cost/scale problem the PS states — proprietary smart-camera hardware doesn't scale affordably across every BOP, checkpost, and border road.
- **Why edge inference instead of streaming everything to the cloud?** Border connectivity can't be assumed reliable; a design that requires constant high-bandwidth uplink fails exactly where it's needed most.
- **Why heuristic behavior rules instead of a learned behavior model?** Explainability matters when a non-technical operator has to trust and act on an alert, and learned behavior models need labeled training data that doesn't exist for this domain yet. This is named explicitly as a scoping decision, not a limitation to hide.

## Theme fit — Blockchain & Cybersecurity

Rather than forcing a token or public ledger into a video analytics platform, the theme is addressed through a genuinely relevant mechanism: a hash-chained, tamper-evident event/audit log. Every alert, watchlist change, and privileged action is chained so that any post-hoc tampering is detectable — relevant both operationally (insider threat) and evidentially (chain of custody). See SECURITY.md for the design.

## Honest limitations to state upfront in any pitch

- Face recognition and ANPR accuracy are range- and condition-dependent — present tiered confidence, not a single number.
- Real border footage isn't available for training/testing; public datasets stand in, with fine-tuning on region-representative data flagged as a pre-deployment requirement.
- Full field validation at an actual BOP is out of scope for the hackathon timeline — proposed as a phased pilot (see ROADMAP.md), not claimed as already done.
