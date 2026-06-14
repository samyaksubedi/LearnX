from app.services.ingestion.youtube import validate_youtube_url, download_audio
from app.services.ingestion.exceptions import IngestionError
from app.clients.node_api_client import update_conversation_status
from app.services.processing.transcription import transcribe
from app.services.processing.chunking import chunk_transcript
from app.rag.vector_store import embed_and_store
import os


def process_youtube_conversation(payload):
    try:
        youtube_url = payload["youtubeUrl"]
        conversation_id = payload["conversationId"]
        output_dir = os.path.join(
            "tmp", "yt-audio"
        )  # Since we will be running worker.py and it's in root so we can directly do this join : )
        os.makedirs(output_dir, exist_ok=True)
        validate_youtube_url(youtube_url)
        print("Youtube Link validated successfully ")
        #  download audio from youtube video url
        temp_yt_audio_path = download_audio(youtube_url, output_dir)
        print("Youtube's audio downloaded successfully")
        #  transcribe that audio -> returns raw segments/chunks
        raw_chunks = transcribe(temp_yt_audio_path)
        print("Youtube's audio raw transcribed successfully ")
        # print(raw_chunks)
        #  process raw chunks / segments to langchain defined document format including metadata: )
        langchain_documents = chunk_transcript(raw_chunks, conversation_id)
        print("Youtube's audio raw transcription chunked into Documents successfully !")
        #  embed the generated chunks using langchain vector store  : )
        embed_and_store(langchain_documents)
        print("Youtube's Convo Document chunks fully embeded and stored in v DB  !")
        update_conversation_status(conversation_id, "ready")
        print(f"Youtube conversation processed successfully : {conversation_id}")
        # TODO  remove all temp file created from ai/tmp and server/shared too
    except IngestionError as e:
        # log error
        print(str(e))  # TODO  Replace with a global logger
        update_conversation_status(
            conversation_id=conversation_id, status="failed", error_message=str(e)
        )
    except Exception as e:
        print("Unexpected Error : ", {e})
        # Node_API should always be up and running : )
        update_conversation_status(
            conversation_id,
            "failed",
            "Something went wrong while processing youtube conversation : Python",
        )
