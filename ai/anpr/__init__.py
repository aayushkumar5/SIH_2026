"""
ANPR (Automatic Number Plate Recognition) Subsystem
"""
from ai.anpr.validator import normalize_plate, validate_indian_plate
from ai.anpr.ocr import PlateOCREngine
from ai.anpr.detector import PlateDetector

__all__ = ["normalize_plate", "validate_indian_plate", "PlateOCREngine", "PlateDetector"]
