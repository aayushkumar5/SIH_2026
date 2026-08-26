import logging
from typing import Dict, List, Optional, Tuple
import cv2
import numpy as np
from ai.face.embedder import FaceEmbedder
from ai.face.matcher import FaceMatcher
from ai.schemas import EventRecord, EventType, FaceResult, SeverityLevel, TrackedObject

logger = logging.getLogger("ai.face.detector")


class FaceDetector:
    """
    Facial Detection and Recognition Manager.
    1. Extracts upper portion (head region) of tracked persons
    2. Runs Haar cascade / SCRFD face detection
    3. Extracts ArcFace embeddings
    4. Evaluates similarity against FaceMatcher watchlist
    5. Emits FACE_DETECTION and WATCHLIST_FACE events
    """
    def __init__(self, face_matcher: Optional[FaceMatcher] = None):
        self.embedder = FaceEmbedder()
        self.matcher = face_matcher or FaceMatcher()
        # Track already recognized faces for tracks: {track_id: identity_id}
        self.seen_faces: Dict[int, str] = {}
        self._init_detector()

    def _init_detector(self):
        try:
            self.cascade = cv2.CascadeClassifier(cv2.data.haarcascades + 'haarcascade_frontalface_default.xml')
        except Exception as e:
            logger.warning(f"Haar cascade face model load failed: {e}")
            self.cascade = None

    def extract_head_region(self, frame: np.ndarray, person_bbox: Tuple[int, int, int, int]) -> Optional[np.ndarray]:
        """Extract top 35% of person bounding box containing head/face."""
        x1, y1, x2, y2 = person_bbox
        ph, pw = y2 - y1, x2 - x1
        if ph <= 30 or pw <= 20:
            return None

        head_y1 = y1
        head_y2 = int(y1 + 0.35 * ph)
        head_x1 = x1
        head_x2 = x2

        h_img, w_img = frame.shape[:2]
        head_x1, head_y1 = max(0, head_x1), max(0, head_y1)
        head_x2, head_y2 = min(w_img, head_x2), min(h_img, head_y2)

        if head_x2 <= head_x1 or head_y2 <= head_y1:
            return None

        return frame[head_y1:head_y2, head_x1:head_x2]

    def process_persons(
        self,
        frame: np.ndarray,
        tracks: List[TrackedObject],
        camera_id: str
    ) -> Tuple[List[FaceResult], List[EventRecord]]:
        face_results: List[FaceResult] = []
        events: List[EventRecord] = []

        for track in tracks:
            if track.class_name != "person":
                continue

            if track.track_id in self.seen_faces:
                continue

            head_crop = self.extract_head_region(frame, track.bbox)
            if head_crop is None or head_crop.size == 0:
                continue

            # Detect face within head crop
            face_crop = head_crop
            if self.cascade is not None:
                gray = cv2.cvtColor(head_crop, cv2.COLOR_BGR2GRAY) if len(head_crop.shape) == 3 else head_crop
                faces = self.cascade.detectMultiScale(gray, scaleFactor=1.1, minNeighbors=3, minSize=(20, 20))
                if len(faces) > 0:
                    fx, fy, fw, fh = faces[0]
                    face_crop = head_crop[fy:fy+fh, fx:fx+fw]

            embedding = self.embedder.get_embedding(face_crop)
            if not embedding:
                continue

            matched, ident_id, name, category, sim_score = self.matcher.match(embedding)

            res = FaceResult(
                bbox=track.bbox,
                confidence=float(sim_score) if matched else 0.5,
                embedding=embedding,
                match_found=matched,
                matched_identity_id=ident_id,
                matched_name=name,
                similarity_score=sim_score,
                watchlist_category=category,
            )
            face_results.append(res)

            if matched:
                self.seen_faces[track.track_id] = ident_id or "MATCHED"
                events.append(
                    EventRecord(
                        camera_id=camera_id,
                        event_type=EventType.WATCHLIST_FACE,
                        severity=SeverityLevel.CRITICAL,
                        track_id=track.track_id,
                        object_class="person",
                        confidence=sim_score,
                        metadata={
                            "identity_id": ident_id,
                            "person_name": name,
                            "category": category,
                            "similarity_score": sim_score,
                            "bbox": track.bbox,
                        }
                    )
                )

        return face_results, events
