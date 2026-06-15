from app.services.ingestion.video import extract_audio
from app.services.ingestion.exceptions import IngestionError
from app.clients.node_api_client import update_conversation_status
from app.services.processing.transcription import transcribe
from app.services.processing.chunking import chunk_transcript
from app.rag.vector_store import embed_and_store
from app.utils.file_utils import delete_files
import os


def process_video_conversation(payload):
    try:
        file_path = payload[
            "filePath"
        ]  # Video path which is stored by node inside /shared
        conversation_id = payload["conversationId"]
        _type = payload["type"]
        output_dir = os.path.join(
            "tmp", "audio_extracts_video"
        )  # Since we will be running worker.py and it's in root so we can directly do this join : )
        os.makedirs(output_dir, exist_ok=True)

        #  extract audio from  video file in filePath
        temp_video_audio_path = extract_audio(file_path, output_dir)
        print("Audio extracted from the video successfully")
        #  transcribe that audio -> returns raw segments/chunks
        raw_chunks = transcribe(temp_video_audio_path)
        print("Video's extracted audio raw transcribed successfully ")
        # print(raw_chunks)
        #  process raw chunks / segments to langchain defined document format including metadata: )
        langchain_documents = chunk_transcript(raw_chunks, conversation_id, _type)
        print(
            " Extracted audio raw transcription chunked into Documents successfully !"
        )
        #  embed the generated chunks using langchain vector store  : )
        embed_and_store(langchain_documents)
        print("Video's Convo Document chunks fully embeded and stored in v DB  !")
        update_conversation_status(conversation_id, "ready")
        print(f"Video conversation processed successfully : {conversation_id}")
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
            "Something went wrong while processing video conversation : Python",
        )
    finally:
        delete_files(temp_video_audio_path, file_path)
        print("Temp video and extracted_audio file deleted sucessfully")
