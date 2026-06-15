from app.services.ingestion.exceptions import IngestionError
from app.clients.node_api_client import update_conversation_status
from app.services.processing.transcription import transcribe
from app.services.processing.chunking import chunk_transcript
from app.rag.vector_store import embed_and_store
from app.utils.file_utils import delete_files


def process_audio_conversation(payload):
    try:
        file_path = payload[
            "filePath"
        ]  # Audio-Path - Herw we will directly get audio path by the node in /shared
        conversation_id = payload["conversationId"]
        _type = payload["type"]

        #  transcribe that audio -> returns raw segments/chunks
        raw_chunks = transcribe(file_path)
        print("Audio transcribed into raw chunks successfully ")
        # print(raw_chunks)
        #  process raw chunks / segments to langchain defined document format including metadata: )
        langchain_documents = chunk_transcript(raw_chunks, conversation_id, _type)
        print(" Converted raw chunks into lc Documents successfully !")
        #  embed the generated chunks using langchain vector store  : )
        embed_and_store(langchain_documents)
        print("lc Document chunks for audio fully embeded and stored in v DB  !")
        update_conversation_status(conversation_id, "ready")
        print(f"Audio conversation processed successfully : {conversation_id}")
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
            "Something went wrong while processing audio conversation : Python",
        )
    finally:
        delete_files(file_path)
        print("Temp audio file deleted sucessfully")
