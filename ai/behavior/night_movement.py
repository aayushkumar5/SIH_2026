from datetime import datetime, timezone
from typing import List, Set
from ai.config import ai_config
from ai.schemas import EventRecord, EventType, SeverityLevel, TrackedObject


class NightMovementDetector:
    """
    Detects unusual movement during configured curfew / night hours (e.g., 18:00 - 06:00).
    """
    def __init__(self, start_hour: int = ai_config.NIGHT_START_HOUR, end_hour: int = ai_config.NIGHT_END_HOUR):
        self.start_hour = start_hour
        self.end_hour = end_hour
        self.alerted_tracks: Set[int] = set()

    def is_night_time(self, dt: datetime = None) -> bool:
        if dt is None:
            dt = datetime.now()
        hour = dt.hour
        if self.start_hour > self.end_hour:  # Overnight span, e.g. 18:00 to 06:00
            return hour >= self.start_hour or hour < self.end_hour
        else:
            return self.start_hour <= hour < self.end_hour

    def process(self, tracks: List[TrackedObject], camera_id: str, current_dt: datetime = None) -> List[EventRecord]:
        if current_dt is None:
            current_dt = datetime.now()

        if not self.is_night_time(current_dt):
            self.alerted_tracks.clear()
            return []

        events: List[EventRecord] = []
        active_track_ids = {t.track_id for t in tracks}

        for track in tracks:
            if track.track_id not in self.alerted_tracks:
                self.alerted_tracks.add(track.track_id)
                events.append(
                    EventRecord(
                        camera_id=camera_id,
                        event_type=EventType.NIGHT_MOVEMENT,
                        severity=SeverityLevel.HIGH,
                        track_id=track.track_id,
                        object_class=track.class_name,
                        confidence=track.confidence,
                        metadata={
                            "hour": current_dt.hour,
                            "position": track.current_pos,
                            "bbox": track.bbox,
                            "note": f"Movement detected during night surveillance window ({self.start_hour}:00 - {self.end_hour}:00)"
                        }
                    )
                )

        # Cleanup disappeared tracks
        self.alerted_tracks = self.alerted_tracks.intersection(active_track_ids)
        return events
