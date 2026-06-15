import os
import uuid
import subprocess
from app.services.ingestion.exceptions import IngestionError


def extract_audio(video_path: str, output_dir: str) -> str:
    output_path = os.path.join(output_dir, f"{uuid.uuid4().hex}.mp3")

    try:
        subprocess.run(
            [
                "ffmpeg",
                "-i",
                video_path,
                "-vn",
                "-acodec",
                "libmp3lame",
                "-ar",
                "16000",
                "-ac",
                "1",
                "-b:a",
                "64k",
                "-y",
                output_path,
            ],
            check=True,
            capture_output=True,
        )
        return output_path
    except subprocess.CalledProcessError as e:
        raise IngestionError(f"Audio extraction failed: {e.stderr.decode()}") from e
