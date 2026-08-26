import cv2
import numpy as np
from ai.config import ai_config


class LowLightEnhancer:
    """
    Intelligent Low-Light Image Enhancer.
    Calculates average luminance and dynamically applies adaptive gamma correction,
    CLAHE (Contrast Limited Adaptive Histogram Equalization), and noise suppression.
    """
    def __init__(
        self,
        darkness_thresh: float = ai_config.DARKNESS_THRESHOLD_MEAN_INTENSITY,
        clip_limit: float = 3.0,
        grid_size: tuple = (8, 8)
    ):
        self.darkness_thresh = darkness_thresh
        self.clahe = cv2.createCLAHE(clipLimit=clip_limit, tileGridSize=grid_size)

    def is_low_light(self, frame: np.ndarray) -> bool:
        """Determines if image brightness falls below the night/darkness threshold."""
        if frame is None or frame.size == 0:
            return False
        gray = cv2.cvtColor(frame, cv2.COLOR_BGR2GRAY) if len(frame.shape) == 3 else frame
        mean_intensity = np.mean(gray)
        return bool(mean_intensity < self.darkness_thresh)

    def enhance(self, frame: np.ndarray, force: bool = False) -> np.ndarray:
        """
        Enhances low-light frames. Returns original if scene is sufficiently illuminated
        unless force=True.
        """
        if frame is None or frame.size == 0:
            return frame

        if not force and not self.is_low_light(frame):
            return frame

        # Convert to Lab color space to enhance Luminance (L) channel independently
        if len(frame.shape) == 3:
            lab = cv2.cvtColor(frame, cv2.COLOR_BGR2LAB)
            l_channel, a_channel, b_channel = cv2.split(lab)

            # Adaptive Gamma Correction on L channel to lift dark regions (gamma < 1.0)
            mean_l = np.mean(l_channel) / 255.0
            gamma = 0.4 if mean_l < 0.2 else (0.6 if mean_l < 0.35 else 0.75)
            table = np.array([((i / 255.0) ** gamma) * 255 for i in np.arange(0, 256)]).astype("uint8")
            l_gamma = cv2.LUT(l_channel, table)

            # Apply CLAHE on Gamma-corrected L channel
            l_enhanced = self.clahe.apply(l_gamma)

            # Merge back and convert to BGR
            enhanced_lab = cv2.merge((l_enhanced, a_channel, b_channel))
            enhanced_bgr = cv2.cvtColor(enhanced_lab, cv2.COLOR_LAB2BGR)
            return enhanced_bgr
        else:
            # Grayscale enhancement
            return self.clahe.apply(frame)
