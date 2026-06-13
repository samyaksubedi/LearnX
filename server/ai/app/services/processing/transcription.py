from faster_whisper import WhisperModel
from app.config import settings
from app.services.ingestion.exceptions import IngestionError


# Convert into raw chunks without overlapp -> [{start  , end , text}]
def transcribe(audio_path: str) -> list[dict]:
    try:
        if settings.WHISPER_MODE == "local":
            return _transcribe_local(audio_path)
        else:
            return _transcribe_api(audio_path)
    except Exception:
        raise IngestionError("Transcription Failed : Python")


_model = None


def _get_model():
    global _model
    if _model is None:
        _model = WhisperModel(
            "medium", device=settings.WHISPER_DEVICE, compute_type="float16"
        )
    return _model


def _transcribe_local(audio_path: str) -> list[dict]:
    model = _get_model()
    segments, _ = model.transcribe(
        audio_path, vad_filter=True, vad_parameters=dict(min_silence_duration_ms=500)
    )
    return [
        {"start": s.start, "end": s.end, "text": s.text.strip()}
        for s in segments
        if s.text.strip()
    ]


_client = None


def _get_client():
    global _client
    if _client is None:
        from openai import OpenAI

        _client = OpenAI(api_key=settings.OPENAI_API_KEY)
    return _client


def _transcribe_api(audio_path: str) -> list[dict]:
    client = _get_client()
    with open(audio_path, "rb") as f:
        result = client.audio.transcriptions.create(
            model="whisper-1",
            file=f,
            response_format="verbose_json",
            timestamp_granularities=["segment"],
            language=None,
            temperature=0,
        )
    return [
        {"start": s.start, "end": s.end, "text": s.text.strip()}
        for s in result.segments
        if s.text.strip()
    ]
