from fastapi import APIRouter
from app.schemas.chat_schema import (
    ChatRequest,
    ChatResponse,
    ChatDeleteRequest,
    YoutubeMetaDataRequest,
)
from app.services.chat.chat_service import generate_chat_response
from app.services.chat.chat_service import delete_conversation
from app.services.ingestion.youtube import validate_youtube_url

router = APIRouter(prefix="/api/internal/chat")


# Handle Errors


# @router.post("/", response_model=ChatResponse, status_code=200)
@router.post("/", status_code=200)
async def chat(request_body: ChatRequest):
    result = generate_chat_response(
        request_body.query, request_body.conversation_id, request_body.history
    )
    return result  # Here result is alr in ChatResponse Format


@router.delete("/delete", status_code=200)
async def delete_chat(request_body: ChatDeleteRequest):

    delete_conversation(request_body.conversation_id)
    return {"success": True}


@router.post(
    "/youtube-metadata", status_code=200, description="Get meta data for youtube video"
)
async def get_youtube_metadata(request_body: YoutubeMetaDataRequest):
    return validate_youtube_url(request_body.youtube_url)
