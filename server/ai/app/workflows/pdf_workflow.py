from app.services.ingestion.pdf import extract_pdf_pages
from app.services.ingestion.exceptions import IngestionError
from app.services.processing.chunking import chunk_pdf
import os
from app.rag.vector_store import embed_and_store
from app.clients.node_api_client import update_conversation_status
from app.utils.file_utils import delete_files


def process_pdf_conversation(payload):
    try:
        file_path = payload[
            "filePath"
        ]  # pdf path which is stored by node inside /shared
        conversation_id = payload["conversationId"]
        _type = payload["type"]
        output_dir = os.path.join(
            "tmp", "pdfs"
        )  # Since we will be running worker.py and it's in root so we can directly do this join : )
        os.makedirs(output_dir, exist_ok=True)
        # Extract content per pages from pdf
        pages = extract_pdf_pages(file_path)
        # print(pages)
        #  Chunk pdf per page , For eg chunking won't overlap for different pages , it happens per page
        chunks = chunk_pdf(pages, conversation_id, type="pdf")
        #  Embeed and store chunks
        embed_and_store(chunks)
        print(f"Chunks embeded and stored for : {conversation_id}")
        update_conversation_status(conversation_id, "ready")
        print(f"Pdf conversation processed successfully : {conversation_id}")

    except IndentationError as e:
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
        delete_files(file_path)
        print("Temp pdf file deleted sucessfully")
