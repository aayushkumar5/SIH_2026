import time
from typing import Dict, List, Optional, Tuple
import numpy as np
from ai.schemas import Detection, TrackedObject


def calculate_iou(box1: Tuple[int, int, int, int], box2: Tuple[int, int, int, int]) -> float:
    """Calculate Intersection over Union between two bounding boxes (x1, y1, x2, y2)."""
    x1 = max(box1[0], box2[0])
    y1 = max(box1[1], box2[1])
    x2 = min(box1[2], box2[2])
    y2 = min(box1[3], box2[3])

    intersection = max(0, x2 - x1) * max(0, y2 - y1)
    if intersection == 0:
        return 0.0

    area1 = (box1[2] - box1[0]) * (box1[3] - box1[1])
    area2 = (box2[2] - box2[0]) * (box2[3] - box2[1])
    union = area1 + area2 - intersection

    return intersection / union if union > 0 else 0.0


class MultiObjectTracker:
    """
    Robust Multi-Object Tracker implementing IoU association with trajectory tracking,
    track buffering, and dwell time calculation.
    """
    def __init__(self, max_age: int = 30, min_hits: int = 2, iou_threshold: float = 0.3):
        self.max_age = max_age
        self.min_hits = min_hits
        self.iou_threshold = iou_threshold
        self.next_track_id = 1
        
        # Active tracks: {track_id: TrackedObject}
        self.tracks: Dict[int, TrackedObject] = {}
        # Unmatched frame counters: {track_id: missed_frames_count}
        self.missed_counts: Dict[int, int] = {}
        # Track hit counts: {track_id: hit_count}
        self.hit_counts: Dict[int, int] = {}

    def update(self, detections: List[Detection], timestamp: Optional[float] = None) -> List[TrackedObject]:
        current_time = timestamp if timestamp is not None else time.time()
        
        if not self.tracks:
            # Initialize tracks for all current detections
            for det in detections:
                track_id = self.next_track_id
                self.next_track_id += 1
                
                pos = det.bottom_center
                new_track = TrackedObject(
                    track_id=track_id,
                    class_name=det.class_name,
                    confidence=det.confidence,
                    bbox=det.bbox,
                    first_seen=current_time,
                    last_seen=current_time,
                    trajectory=[pos],
                    zone_dwell_times={},
                )
                self.tracks[track_id] = new_track
                self.missed_counts[track_id] = 0
                self.hit_counts[track_id] = 1
            
            return list(self.tracks.values())

        # Match existing tracks with new detections using IoU
        track_ids = list(self.tracks.keys())
        iou_matrix = np.zeros((len(track_ids), len(detections)), dtype=np.float32)

        for i, tid in enumerate(track_ids):
            for j, det in enumerate(detections):
                # Only match if same class
                if self.tracks[tid].class_name == det.class_name:
                    iou_matrix[i, j] = calculate_iou(self.tracks[tid].bbox, det.bbox)
                else:
                    iou_matrix[i, j] = 0.0

        matched_tracks = set()
        matched_dets = set()

        # Greedy matching by maximum IoU
        while True:
            if iou_matrix.size == 0:
                break
            max_iou = np.max(iou_matrix)
            if max_iou < self.iou_threshold:
                break
            
            i, j = np.unravel_index(np.argmax(iou_matrix), iou_matrix.shape)
            tid = track_ids[i]
            matched_tracks.add(tid)
            matched_dets.add(j)

            # Update matched track
            det = detections[j]
            track = self.tracks[tid]
            track.bbox = det.bbox
            track.confidence = det.confidence
            track.last_seen = current_time
            track.trajectory.append(det.bottom_center)
            if len(track.trajectory) > 100:
                track.trajectory.pop(0)
            
            self.missed_counts[tid] = 0
            self.hit_counts[tid] = self.hit_counts.get(tid, 0) + 1

            # Invalidate row and col
            iou_matrix[i, :] = -1
            iou_matrix[:, j] = -1

        # Handle unmatched detections -> create new tracks
        for j, det in enumerate(detections):
            if j not in matched_dets:
                track_id = self.next_track_id
                self.next_track_id += 1
                
                pos = det.bottom_center
                new_track = TrackedObject(
                    track_id=track_id,
                    class_name=det.class_name,
                    confidence=det.confidence,
                    bbox=det.bbox,
                    first_seen=current_time,
                    last_seen=current_time,
                    trajectory=[pos],
                    zone_dwell_times={},
                )
                self.tracks[track_id] = new_track
                self.missed_counts[track_id] = 0
                self.hit_counts[track_id] = 1

        # Handle unmatched tracks -> increment missed count
        dead_tracks = []
        for tid in track_ids:
            if tid not in matched_tracks:
                self.missed_counts[tid] = self.missed_counts.get(tid, 0) + 1
                if self.missed_counts[tid] > self.max_age:
                    dead_tracks.append(tid)

        # Remove dead tracks
        for tid in dead_tracks:
            del self.tracks[tid]
            del self.missed_counts[tid]
            if tid in self.hit_counts:
                del self.hit_counts[tid]

        return [t for tid, t in self.tracks.items() if self.hit_counts.get(tid, 0) >= self.min_hits or self.missed_counts.get(tid, 0) == 0]
