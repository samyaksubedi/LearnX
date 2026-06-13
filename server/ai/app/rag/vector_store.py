# embed_and_store(chunks)
# app/rag/vector_store.py (or wherever embed_and_store lives)
from app.clients.vector_store_client import get_vector_store
from app.services.ingestion.exceptions import IngestionError


def embed_and_store(chunks):
    """
    chunks: list[Document]
    """
    try:
        vector_store = get_vector_store()
        ids = vector_store.add_documents(chunks)
        return ids
    except Exception as e:
        print("EMBED ERROR:", repr(e))
        raise IngestionError("Failed to embed and store chunks")
