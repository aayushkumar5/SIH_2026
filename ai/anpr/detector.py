import logging
from typing import Dict, List, Optional, Set, Tuple
import numpy as np
from ai.anpr.ocr import PlateOCREngine
from ai.anpr.validator import normalize_plate, validate_indian_plate
from ai.schemas import ANPRResult, EventRecord, EventType, SeverityLevel, TrackedObject

logger = logging.getLogger("ai.anpr.detector")


class PlateDetector:
    """
    ANPR Pipeline:
    1. Crops lower-middle portion of detected vehicles
    2. Runs PlateOCREngine
    3. Validates against Indian standard registration rules
    4. Matches against active vehicle watchlists
    5. Emits structured ANPR / WATCHLIST_PLATE events
    """
    def __init__(self, watchlisted_plates: Optional[Dict[str, str]] = None):
        self.ocr_engine = PlateOCREngine()
        # Watchlist dict: {plate_number: reason_or_category} e.g. {"DL01AB1234": "Stolen / Red Corner"}
        self.watchlist = watchlisted_plates or {}
        # Track already logged plates for active vehicles to prevent duplicate alerts
        self.seen_vehicle_plates: Dict[int, str] = {}

    def update_watchlist(self, watchlist: Dict[str, str]):
        self.watchlist = {normalize_plate(k): v for k, v in watchlist.items()}

    def extract_plate_region(self, frame: np.ndarray, vehicle_bbox: Tuple[int, int, int, int]) -> Optional[np.ndarray]:
        """Heuristic crop of vehicle lower region where number plate is usually located."""
        x1, y1, x2, y2 = vehicle_bbox
        vh, vw = y2 - y1, x2 - x1
        if vh <= 20 or vw <= 20:
            return None

        # Plate is commonly in lower 40% of the vehicle bbox
        plate_y1 = int(y1 + 0.60 * vh)
        plate_y2 = y2
        plate_x1 = int(x1 + 0.15 * vw)
        plate_x2 = int(x2 - 0.15 * vw)

        h_img, w_img = frame.shape[:2]
        plate_x1, plate_y1 = max(0, plate_x1), max(0, plate_y1)
        plate_x2, plate_y2 = min(w_img, plate_x2), min(h_img, plate_y2)

        if plate_x2 <= plate_x1 or plate_y2 <= plate_y1:
            return None

        return frame[plate_y1:plate_y2, plate_x1:plate_x2]

    def process_vehicles(
        self,
        frame: np.ndarray,
        tracks: List[TrackedObject],
        camera_id: str
    ) -> Tuple[List[ANPRResult], List[EventRecord]]:
        anpr_results: List[ANPRResult] = []
        events: List[EventRecord] = []

        vehicle_classes = {"car", "motorcycle", "bus", "truck"}
        for track in tracks:
            if track.class_name not in vehicle_classes:
                continue

            # Skip if we already recognized this vehicle's plate
            if track.track_id in self.seen_vehicle_plates:
                continue

            plate_crop = self.extract_plate_region(frame, track.bbox)
            if plate_crop is None or plate_crop.size == 0:
                continue

            plate_text, conf = self.ocr_engine.read_plate(plate_crop)
            if not plate_text or len(plate_text) < 4:
                continue

            is_valid, pattern_type = validate_indian_plate(plate_text)
            watchlist_match = plate_text in self.watchlist
            category = self.watchlist.get(plate_text)

            res = ANPRResult(
                plate_text=plate_text,
                confidence=conf,
                bbox=track.bbox,
                is_valid_format=is_valid,
                watchlist_match=watchlist_match,
                watchlist_category=category,
                vehicle_track_id=track.track_id,
            )
            anpr_results.append(res)
            self.seen_vehicle_plates[track.track_id] = plate_text

            # Create event
            evt_type = EventType.WATCHLIST_PLATE if watchlist_match else EventType.ANPR_DETECTION
            severity = SeverityLevel.CRITICAL if watchlist_match else SeverityLevel.INFO

            events.append(
                EventRecord(
                    camera_id=camera_id,
                    event_type=evt_type,
                    severity=severity,
                    track_id=track.track_id,
                    object_class=track.class_name,
                    confidence=conf,
                    metadata={
                        "plate_text": plate_text,
                        "is_valid_format": is_valid,
                        "pattern_type": pattern_type,
                        "watchlist_match": watchlist_match,
                        "watchlist_category": category,
                        "bbox": track.bbox,
                    }
                )
            )

        return anpr_results, events
