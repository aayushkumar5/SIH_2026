import pytest
import numpy as np

from ai.anpr.validator import normalize_plate, validate_indian_plate
from ai.anpr.detector import PlateDetector
from ai.face.embedder import cosine_similarity, FaceEmbedder
from ai.face.matcher import FaceMatcher
from ai.schemas import TrackedObject, EventType, SeverityLevel


def test_indian_license_plate_validation():
    # Valid standard plates
    valid_plates = ["DL01AB1234", "UP32BZ9999", "UK04CA5678", "MH12DE1423", "22BH1234AA"]
    for p in valid_plates:
        is_valid, pat_type = validate_indian_plate(p)
        assert is_valid is True, f"Plate {p} should be recognized as valid Indian format"

    # Invalid plates
    invalid_plates = ["12345", "INVALID", "ZZ99999999999999"]
    for p in invalid_plates:
        is_valid, _ = validate_indian_plate(p)
        assert is_valid is False, f"Plate {p} should fail validation"


def test_plate_detector_and_watchlist():
    detector = PlateDetector(watchlisted_plates={"UP32BZ9999": "SMUGGLING_SUSPECT"})
    
    # Synthetic frame and tracked vehicle
    frame = np.full((480, 640, 3), 120, dtype=np.uint8)
    track = TrackedObject(
        track_id=10,
        class_name="car",
        confidence=0.92,
        bbox=(100, 100, 300, 300),
        first_seen=100.0,
        last_seen=100.0
    )

    # Test region extraction
    crop = detector.extract_plate_region(frame, track.bbox)
    assert crop is not None
    assert crop.shape[0] > 0 and crop.shape[1] > 0


def test_cosine_similarity():
    v1 = [1.0, 0.0, 0.0]
    v2 = [1.0, 0.0, 0.0]
    v3 = [0.0, 1.0, 0.0]
    v4 = [0.7071, 0.7071, 0.0]

    assert abs(cosine_similarity(v1, v2) - 1.0) < 1e-4
    assert abs(cosine_similarity(v1, v3) - 0.0) < 1e-4
    assert abs(cosine_similarity(v1, v4) - 0.7071) < 1e-3


def test_face_matcher():
    matcher = FaceMatcher(threshold=0.60)
    suspect_emb = [0.8, 0.6, 0.0]  # normalized vector

    matcher.add_identity(
        identity_id="SUSPECT-007",
        name="John Doe",
        category="WANTED",
        embedding=suspect_emb
    )

    # Query with identical embedding -> Match
    matched, ident_id, name, cat, score = matcher.match([0.8, 0.6, 0.0])
    assert matched is True
    assert ident_id == "SUSPECT-007"
    assert name == "John Doe"
    assert cat == "WANTED"
    assert score > 0.99

    # Query with orthogonal embedding -> No Match
    matched2, _, _, _, score2 = matcher.match([0.0, 0.0, 1.0])
    assert matched2 is False
    assert score2 == 0.0
