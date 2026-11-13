"""Retrieval service - ChromaDB or keyword-based scheme search."""

import logging
from typing import List, Dict, Any, Optional

from app.config.settings import settings
from app.rag.embedding_service import keyword_match_score

logger = logging.getLogger(__name__)

# In-memory document store for demo mode
_demo_documents: List[Dict[str, Any]] = []

_chroma_collection = None


def _get_chroma_collection():
    """Lazy-load ChromaDB collection."""
    global _chroma_collection
    if _chroma_collection is not None:
        return _chroma_collection

    if settings.DEMO_MODE:
        return None

    try:
        import chromadb
        client = chromadb.Client(chromadb.Settings(
            persist_directory=settings.CHROMA_PERSIST_DIR,
            anonymized_telemetry=False,
        ))
        _chroma_collection = client.get_or_create_collection(
            name="agriculture_schemes",
            metadata={"description": "Government agricultural schemes"},
        )
        logger.info("ChromaDB collection loaded: agriculture_schemes")
        return _chroma_collection
    except Exception as exc:
        logger.warning("ChromaDB not available: %s. Using keyword search.", exc)
        return None


async def add_document(text: str, metadata: Optional[Dict[str, Any]] = None) -> None:
    """Add a document to the retrieval index."""
    doc_id = f"doc_{len(_demo_documents)}"

    collection = _get_chroma_collection()
    if collection is not None:
        try:
            collection.add(
                documents=[text],
                metadatas=[metadata or {}],
                ids=[doc_id],
            )
            logger.info("Added document to ChromaDB: %s", doc_id)
            return
        except Exception as exc:
            logger.warning("ChromaDB add failed: %s. Adding to in-memory store.", exc)

    # Fallback: in-memory store
    _demo_documents.append({
        "id": doc_id,
        "text": text,
        "metadata": metadata or {},
    })
    logger.info("Added document to in-memory store: %s", doc_id)


async def search_schemes(query: str, top_k: int = 4) -> List[Dict[str, Any]]:
    """
    Search for relevant schemes using ChromaDB or keyword matching.

    Args:
        query: Search query text.
        top_k: Maximum number of results.

    Returns:
        List of matching scheme dicts.
    """
    collection = _get_chroma_collection()
    if collection is not None:
        try:
            results = collection.query(
                query_texts=[query],
                n_results=top_k,
            )
            matches = []
            for i, doc in enumerate(results.get("documents", [[]])[0]):
                meta = results.get("metadatas", [[]])[0][i] if results.get("metadatas") else {}
                distance = results.get("distances", [[]])[0][i] if results.get("distances") else 0
                matches.append({
                    "scheme_name": meta.get("name", f"Scheme {i+1}"),
                    "text": doc,
                    "relevance_score": max(0, 1 - distance),
                    "metadata": meta,
                })
            return matches
        except Exception as exc:
            logger.warning("ChromaDB search failed: %s. Falling back to keyword search.", exc)

    # Keyword-based search fallback
    return _keyword_search(query, top_k)


def _keyword_search(query: str, top_k: int = 4) -> List[Dict[str, Any]]:
    """Search in-memory documents using keyword matching."""
    if not _demo_documents:
        return []

    scored = []
    for doc in _demo_documents:
        score = keyword_match_score(query, doc["text"])
        if score > 0:
            scored.append({
                "scheme_name": doc["metadata"].get("name", "Unknown"),
                "text": doc["text"][:200],
                "relevance_score": round(score, 3),
                "metadata": doc["metadata"],
            })

    scored.sort(key=lambda x: x["relevance_score"], reverse=True)
    return scored[:top_k]

