from langchain_openai import ChatOpenAI
from langchain_core.messages import HumanMessage, AIMessage
from app.config import settings
from app.rag.retrieval import retrieve
from app.services.chat.schemas import LLMChatOutput
from app.services.chat.prompts import chat_prompt
from app.schemas.chat_schema import ChatResponse, RangeReference, PageReference

_llm = None


def _get_llm():
    global _llm
    if _llm is None:
        _llm = ChatOpenAI(model="gpt-4o", api_key=settings.OPENAI_API_KEY)
    return _llm


def _to_lc_messages(history):
    if not history:
        return []
    return [
        HumanMessage(content=h["content"])
        if h["role"] == "User"
        else AIMessage(content=h["content"])
        for h in history
    ]


def _build_context(docs):
    lines = []
    for d in docs:
        if d.metadata["type"] in ["audio", "video", "youtube"]:
            lines.append(
                f"[start({d.metadata['start']}) - end({d.metadata['end']})] -> {d.page_content}"
            )
        else:
            lines.append(f"[page({d.metadata['page']})] -> {d.page_content}")
    return "\n\n".join(lines)


def generate_chat_response(
    query: str, conversation_id: str, history: list[dict] | None
) -> ChatResponse:
    docs = retrieve(query, conversation_id, k=3)

    if len(docs) == 0:
        return ChatResponse(
            response="Sorry, no relevant information was found for this question.",
            source_reference=None,
        )

    is_media = docs[0].metadata["type"] in ["audio", "video", "youtube"]
    docs.sort(key=lambda x: x.metadata["start"] if is_media else x.metadata["page"])

    context = _build_context(docs)

    chain = chat_prompt | _get_llm().with_structured_output(LLMChatOutput)
    result = chain.invoke(
        {
            "context": context,
            "history": _to_lc_messages(history),
            "query": query,
        }
    )

    source_reference = None
    if is_media and result.source_start is not None and result.source_end is not None:
        source_reference = RangeReference(
            start=result.source_start, end=result.source_end
        )
    elif not is_media and result.source_page is not None:
        source_reference = PageReference(pageNumber=result.source_page)

    return ChatResponse(response=result.answer, source_reference=source_reference)
