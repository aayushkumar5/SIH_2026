from typing import Dict, List, Optional, Tuple
from ai.config import ai_config
from ai.face.embedder import cosine_similarity


class FaceMatcher:
    """
    Vector similarity matcher.
    Maintains active suspect watchlist embeddings and computes maximum cosine similarity.
    """
    def __init__(self, threshold: float = ai_config.FACE_MATCH_THRESHOLD):
        self.threshold = threshold
        # Watchlist dict: {identity_id: {"name": str, "category": str, "embedding": List[float]}}
        self.watchlist: Dict[str, dict] = {}

    def add_identity(self, identity_id: str, name: str, category: str, embedding: List[float]):
        self.watchlist[identity_id] = {
            "name": name,
            "category": category,
            "embedding": embedding
        }

    def remove_identity(self, identity_id: str):
        if identity_id in self.watchlist:
            del self.watchlist[identity_id]

    def match(self, query_embedding: List[float]) -> Tuple[bool, Optional[str], Optional[str], Optional[str], float]:
        """
        Returns (matched, identity_id, name, category, similarity_score)
        """
        if not query_embedding or not self.watchlist:
            return False, None, None, None, 0.0

        best_score = -1.0
        best_id = None
        best_name = None
        best_cat = None

        for ident_id, info in self.watchlist.items():
            sim = cosine_similarity(query_embedding, info["embedding"])
            if sim > best_score:
                best_score = sim
                best_id = ident_id
                best_name = info["name"]
                best_cat = info["category"]

        if best_score >= self.threshold:
            return True, best_id, best_name, best_cat, round(best_score, 4)
        else:
            return False, best_id, best_name, best_cat, round(max(best_score, 0.0), 4)
