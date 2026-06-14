# processed chunks with overlapping : )
# create_transcript_chunks(
#     transcript_segments,
#     conversation_id
# )
# Returns :
# [{"text": "...", "metadata": {"conversation_id": "...", "start": 10.2, "end": 20.5}}]

from langchain_core.documents import Document
from langchain_text_splitters import RecursiveCharacterTextSplitter


def chunk_transcript(segments, conversation_id, chunk_duration=60, overlap_duration=15):
    chunks = []
    current_chunk = []
    current_start = segments[0]["start"]

    for seg in segments:
        current_chunk.append(seg)
        if seg["end"] - current_start >= chunk_duration:
            text = " ".join(s["text"] for s in current_chunk)
            chunks.append(
                Document(
                    page_content=text,
                    metadata={
                        "conversation_id": conversation_id,
                        "start": current_chunk[0]["start"],
                        "end": current_chunk[-1]["end"],
                    },
                )
            )
            overlap_start_time = current_chunk[-1]["end"] - overlap_duration
            current_chunk = [s for s in current_chunk if s["end"] >= overlap_start_time]
            current_start = current_chunk[0]["start"] if current_chunk else seg["end"]

    if current_chunk:
        text = " ".join(s["text"] for s in current_chunk)
        chunks.append(
            Document(
                page_content=text,
                metadata={
                    "conversation_id": conversation_id,
                    "start": current_chunk[0]["start"],
                    "end": current_chunk[-1]["end"],
                },
            )
        )

    return chunks


def chunk_pdf(pages, conversation_id, chunk_size=1000, chunk_overlap=150):
    """
    pages: list of {"page_number": int, "text": str}
    """
    splitter = RecursiveCharacterTextSplitter(
        chunk_size=chunk_size,
        chunk_overlap=chunk_overlap,
    )

    chunks = []
    for page in pages:
        page_chunks = splitter.split_text(page["text"])
        for chunk_text in page_chunks:
            chunks.append(
                Document(
                    page_content=chunk_text,
                    metadata={
                        "conversation_id": conversation_id,
                        "page": page["page_number"],
                    },
                )
            )

    return chunks
