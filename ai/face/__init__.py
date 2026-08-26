"""
Face Detection & Recognition Subsystem
"""
from ai.face.embedder import FaceEmbedder, cosine_similarity
from ai.face.matcher import FaceMatcher
from ai.face.detector import FaceDetector

__all__ = ["FaceEmbedder", "cosine_similarity", "FaceMatcher", "FaceDetector"]
