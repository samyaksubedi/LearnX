from app.services.ingestion.youtube import validate_youtube_url, download_audio
from app.services.ingestion.exceptions import IngestionError
from app.clients.node_api_client import update_conversation_status
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
        download_audio(youtube_url, output_dir)
        print("Youtube's audio downloaded successfully")
        #  transcribe that audio -> returns raw segments/chunks
        #  process raw chunks / segments to langchain defined document format including metadata: )
        #  embed the generated chunks using langchain vector store  : )
        update_conversation_status(conversation_id, "ready")
        print("Youtube chat processed successfully")
        pass
    except IngestionError as e:
        # log error
        print(str(e))  # TODO  Replace with a global logger
        update_conversation_status(
            conversation_id=conversation_id, status="failed", error_message=str(e)
        )
    except Exception as e:
        print("Unexpected Error : ", {e})
        update_conversation_status(
            conversation_id,
            "failed",
            "Something went wrong while processing youtube conversation : Python",
        )
