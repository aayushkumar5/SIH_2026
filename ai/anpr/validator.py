import re
from typing import Optional, Tuple

# Standard Indian License Plate regex patterns:
# 1. Standard: DL01AB1234, UP32BZ9999, MH12DE1423
# 2. Single digit district: DL1A1234
# 3. Bharat Series: 22BH1234AA
# 4. Diplomatic / Military: 22D12345, 01B123456
INDIAN_PLATE_PATTERNS = [
    re.compile(r"^[A-Z]{2}[0-9]{1,2}[A-Z]{1,3}[0-9]{4}$"),  # Standard (e.g. DL01AB1234)
    re.compile(r"^[0-9]{2}BH[0-9]{4}[A-Z]{1,2}$"),           # Bharat (BH) Series
    re.compile(r"^[A-Z]{2}[0-9]{2}[0-9]{4}$"),               # Old format (e.g. DL011234)
    re.compile(r"^[0-9]{2}[A-Z][0-9]{5,6}[A-Z]?$"),         # Military format
]

# State and UT code lookup table
VALID_STATE_CODES = {
    "AP", "AR", "AS", "BR", "CG", "CH", "DD", "DL", "DN", "GA", "GJ", "HP",
    "HR", "JH", "JK", "KA", "KL", "LA", "LD", "MH", "ML", "MN", "MP", "MZ",
    "NL", "OD", "PB", "PY", "RJ", "SK", "TN", "TR", "TS", "UK", "UP", "WB"
}

# Common OCR confusion character mapping (e.g., 'O' <-> '0', 'I' <-> '1', 'B' <-> '8')
CHAR_CONFUSIONS_DIGIT_TO_ALPHA = {'0': 'O', '1': 'I', '2': 'Z', '5': 'S', '8': 'B'}
CHAR_CONFUSIONS_ALPHA_TO_DIGIT = {'O': '0', 'I': '1', 'Z': '2', 'S': '5', 'B': '8', 'Q': '0'}


def normalize_plate(raw_text: str) -> str:
    """Clean raw OCR text by removing special chars, whitespace and converting to uppercase."""
    if not raw_text:
        return ""
    cleaned = re.sub(r"[^A-Za-z0-9]", "", raw_text).upper()
    return cleaned


def validate_indian_plate(plate_text: str) -> Tuple[bool, Optional[str]]:
    """
    Validates if normalized text strictly satisfies Indian registration standards.
    Returns (is_valid, matched_pattern_type)
    """
    cleaned = normalize_plate(plate_text)
    if len(cleaned) < 6 or len(cleaned) > 12:
        return False, None

    for pattern in INDIAN_PLATE_PATTERNS:
        if pattern.match(cleaned):
            state_code = cleaned[:2]
            if state_code in VALID_STATE_CODES or state_code.isdigit():  # BH / Military can start with digits
                return True, "STANDARD_INDIAN"

    return False, None
