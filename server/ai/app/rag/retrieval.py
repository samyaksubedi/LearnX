from app.clients.vector_store_client import get_vector_store
from qdrant_client.models import Filter, FieldCondition, MatchValue


def retrieve(query: str, conversation_id: str, k: int = 5):
    vector_store = get_vector_store()
    return vector_store.similarity_search(
        query,
        k=k,
        filter=Filter(
            must=[
                FieldCondition(
                    key="metadata.conversation_id",
                    match=MatchValue(value=conversation_id),
                )
            ]
        ),
    )
