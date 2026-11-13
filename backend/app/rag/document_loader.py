"""Document loader - loads and chunks text documents for RAG pipeline."""

import logging
import os
from typing import List, Dict, Any

logger = logging.getLogger(__name__)


def chunk_text(text: str, chunk_size: int = 500, overlap: int = 50) -> List[str]:
    """
    Split text into overlapping chunks for embedding.

    Args:
        text: The full text to split.
        chunk_size: Maximum characters per chunk.
        overlap: Number of overlapping characters between chunks.

    Returns:
        List of text chunks.
    """
    if not text or not text.strip():
        return []

    chunks = []
    start = 0
    text_len = len(text)

    while start < text_len:
        end = min(start + chunk_size, text_len)

        # Try to break at a sentence boundary
        if end < text_len:
            last_period = text.rfind(".", start, end)
            last_newline = text.rfind("\n", start, end)
            break_point = max(last_period, last_newline)
            if break_point > start:
                end = break_point + 1

        chunk = text[start:end].strip()
        if chunk:
            chunks.append(chunk)

        start = end - overlap if end < text_len else text_len

    logger.info("Chunked text into %d chunks (chunk_size=%d, overlap=%d)", len(chunks), chunk_size, overlap)
    return chunks


def load_text_file(file_path: str) -> str:
    """Load a text file and return its contents."""
    if not os.path.exists(file_path):
        raise FileNotFoundError(f"File not found: {file_path}")

    with open(file_path, "r", encoding="utf-8") as f:
        return f.read()


def load_and_chunk_file(file_path: str, chunk_size: int = 500, overlap: int = 50) -> List[Dict[str, Any]]:
    """
    Load a file and return chunked documents with metadata.

    Returns:
        List of dicts with 'text', 'metadata' keys.
    """
    text = load_text_file(file_path)
    chunks = chunk_text(text, chunk_size, overlap)

    documents = []
    for i, chunk in enumerate(chunks):
        documents.append({
            "text": chunk,
            "metadata": {
                "source": file_path,
                "chunk_index": i,
                "total_chunks": len(chunks),
            },
        })

    return documents

