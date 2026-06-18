from langchain_openai import OpenAIEmbeddings
from langchain_qdrant import QdrantVectorStore
from qdrant_client import QdrantClient
from qdrant_client.models import VectorParams, Distance, PayloadSchemaType
from app.config import settings

COLLECTION_NAME = "learnx_chunks"
VECTOR_SIZE = 3072  # text-embedding-3-large

_client = None
_embeddings = None
_vector_store = None


def get_vector_store():
    global _client, _embeddings, _vector_store

    if _vector_store is None:
        _client = QdrantClient(
            url=settings.get_qdrant_url, api_key=settings.QDRANT_API_KEY
        )

        _embeddings = OpenAIEmbeddings(
            api_key=settings.OPENAI_API_KEY, model="text-embedding-3-large"
        )

        if not _client.collection_exists(COLLECTION_NAME):
            _client.create_collection(
                collection_name=COLLECTION_NAME,
                vectors_config=VectorParams(size=VECTOR_SIZE, distance=Distance.COSINE),
            )

            # ✅ ADDED FIX: payload indexes (required for filtering)
            _client.create_payload_index(
                collection_name=COLLECTION_NAME,
                field_name="metadata.conversation_id",
                field_schema=PayloadSchemaType.KEYWORD,
            )

            _client.create_payload_index(
                collection_name=COLLECTION_NAME,
                field_name="metadata.user_id",
                field_schema=PayloadSchemaType.KEYWORD,
            )

        _vector_store = QdrantVectorStore(
            client=_client,
            collection_name=COLLECTION_NAME,
            embedding=_embeddings,
        )

    return _vector_store


def get_qdrant_client():
    get_vector_store()  # make sure it's alr initialized
    return _client
