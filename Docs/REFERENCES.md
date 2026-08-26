# References

> **Note:** I don't have web search or database access in this conversation, so the citations below are drawn from general/training knowledge rather than verified in real time. Model names, dataset names, and general claims (e.g. "YOLOv8 by Ultralytics", "ArcFace paper by Deng et al.") are widely known and very likely correct, but exact paper titles, publication venues, years, and URLs can be misremembered or wrong. **Verify every citation here before putting it in a report or PPT** — especially anything with a specific year, venue, or link.

## Models

- **YOLOv8 / YOLOv11** — Ultralytics. Real-time object detection family, widely used for edge deployment. Verify current version/license terms at ultralytics.com.
- **ByteTrack** — multi-object tracking via associating detection boxes across frames, including low-confidence detections. Originally an academic paper (Zhang et al.) — verify exact citation.
- **ArcFace** — Deng et al., face recognition via additive angular margin loss for embeddings. Verify exact citation; commonly available via the InsightFace open-source project.
- **RetinaFace** — single-stage face detector, also from the InsightFace ecosystem. Verify exact citation.
- **Zero-DCE** — zero-reference low-light image enhancement, doesn't require paired training data. Verify exact citation.
- **PaddleOCR** — Baidu's open-source OCR toolkit, commonly used for scene text and plate recognition.

## Datasets (public, for pretraining/demo — not a substitute for region-representative border footage)

- **COCO** — general object detection pretraining (person, vehicle classes).
- **WIDER FACE** — face detection benchmark, useful for face-detector fine-tuning.
- **CCPD** — Chinese City Parking Dataset, large plate-recognition dataset. Format/fonts differ from Indian plates — fine-tuning on Indian-plate data is necessary, not optional.
- **VIRAT** — surveillance video dataset with annotated human/vehicle activities.
- **UCF-Crime** — surveillance video dataset oriented toward anomaly/crime detection.
- **NVIDIA AI City Challenge datasets** — traffic and multi-camera tracking benchmarks, relevant to the vehicle detection and cross-camera re-identification components.

## Related systems / concepts referenced in this project

- **CIBMS (Comprehensive Integrated Border Management System)** — existing Indian border management system that IBVAP is designed to integrate with via its API/webhook layer, not replace.
- **RTSP / ONVIF** — standard protocols for IP camera streaming and camera control/discovery, assumed as the interface to existing CCTV infrastructure.
- **TensorRT / ONNX Runtime** — NVIDIA/Microsoft inference optimization toolchains used for edge (Jetson) deployment.

## How to use this file

Before your submission, replace each entry above with a verified citation (author, year, venue/URL) by actually checking the source — via web search, the tool's official documentation site, or the paper on arXiv/a conference proceedings page. Judges may ask about your technical references directly, and an unverified or wrong citation is an easy, avoidable point to lose.
