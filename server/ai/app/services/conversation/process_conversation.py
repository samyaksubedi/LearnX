from app.workflows.youtube_workflow import process_youtube_conversation
from app.workflows.video_workflow import process_video_conversation
from app.workflows.audio_workflow import process_audio_conversation
from app.workflows.pdf_workflow import process_pdf_conversation


def process_conversation_job(payload):

    if payload["type"] == "youtube":
        process_youtube_conversation(payload)

    elif payload["type"] == "video":
        process_video_conversation(payload)

    elif payload["type"] == "audio":
        process_audio_conversation(payload)

    elif payload["type"] == "pdf":
        process_pdf_conversation(payload)
