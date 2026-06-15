# embed_and_store(chunks)
# app/rag/vector_store.py (or wherever embed_and_store lives)
from app.clients.vector_store_client import get_vector_store
from app.services.ingestion.exceptions import IngestionError
from qdrant_client.models import Filter, FieldCondition, MatchValue


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


def delete_conversation_vectors(conversation_id: str):
    vector_store = get_vector_store()

    vector_store.client.delete(
        collection_name=vector_store.collection_name,
        points_selector=Filter(
            must=[
                FieldCondition(
                    key="metadata.conversation_id",
                    match=MatchValue(value=conversation_id),
                )
            ]
        ),
    )
