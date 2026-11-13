"""Embedding service - keyword matching in DEMO_MODE, sentence-transformers otherwise."""

import logging
from typing import List, Optional

from app.config.settings import settings

logger = logging.getLogger(__name__)

_model = None


def _get_embedding_model():
    """Lazy-load the sentence-transformers model."""
    global _model
    if _model is None and not settings.DEMO_MODE:
        try:
            from sentence_transformers import SentenceTransformer
            _model = SentenceTransformer("all-MiniLM-L6-v2")
            logger.info("Loaded sentence-transformers model: all-MiniLM-L6-v2")
        except Exception as exc:
            logger.warning("Could not load sentence-transformers: %s", exc)
    return _model


def compute_embeddings(texts: List[str]) -> Optional[List[List[float]]]:
    """
    Compute embeddings for a list of texts.

    In DEMO_MODE, returns None (use keyword matching instead).
    """
    if settings.DEMO_MODE:
        logger.info("[DEMO] Skipping embeddings — using keyword matching")
        return None

    model = _get_embedding_model()
    if model is None:
        return None

    try:
        embeddings = model.encode(texts, show_progress_bar=False)
        return embeddings.tolist()
    except Exception as exc:
        logger.error("Embedding computation failed: %s", exc)
        return None


def keyword_match_score(query: str, text: str) -> float:
    """
    Simple keyword matching score between query and text.

    Returns a score between 0.0 and 1.0.
    """
    query_words = set(query.lower().split())
    text_words = set(text.lower().split())

    if not query_words:
        return 0.0

    matched = query_words.intersection(text_words)
    return len(matched) / len(query_words)

