from openai import OpenAI
from app.config import settings
from app.rag.retrieval import retrieve

_client = None


def _get_client():
    global _client
    if _client is None:
        _client = OpenAI(api_key=settings.OPENAI_API_KEY)
    return _client


def generate_chat_response(query: str, conversation_id: str, history: list[dict]):
    docs = retrieve(query, conversation_id, k=3)
    return docs

    # Arrange retrived docs in accending order : with start time :  lower will be in the first place :
     











    #
    # context = "\n\n".join(
    #     f"[{d.metadata['start']}-{d.metadata['end']}] {d.page_content}" for d in docs
    # )

    # system_prompt = f"Answer based on this context:\n{context}"

    # messages = (
    #     [{"role": "system", "content": system_prompt}]
    #     + history
    #     + [{"role": "user", "content": query}]
    # )

    # response = _get_client().chat.completions.create(model="gpt-4o", messages=messages)

    # sources = [{"start": d.metadata["start"], "end": d.metadata["end"]} for d in docs]
    # return {"answer": response.choices[0].message.content, "sources": sources}
