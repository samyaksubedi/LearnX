import yt_dlp
from app.services.ingestion.exceptions import IngestionError


#   check if youtube url is valid


def validate_youtube_url(source_link: str) -> str:
    ydl_opts = {
        "quiet": True,
        "skip_download": True,
        "no_warnings": True,
        "noplaylist": True,
        "socket_timeout": 10,
    }
    try:
        with yt_dlp.YoutubeDL(ydl_opts) as ydl:
            info = ydl.extract_info(source_link, download=False)
            return info.get("title")
    except Exception:
        raise IngestionError("Invalid, private, or unavailable YouTube video")


# is_valid = validate_youtube_url(
#     "https://www.youtube.com/watch?v=GVizJ_jpUnw&list=RDLMnJp_dSdnw&index=10"
# )
# print(is_valid)


# download_audio(youtube_url,output_dir)


#  must need to download ffmpeg locally : "winget install ffmpeg" - on windows
def download_audio(youtube_url: str, output_dir: str) -> str:
    ydl_opts = {
        "format": "bestaudio/best",
        "outtmpl": f"{output_dir}/%(id)s.%(ext)s",
        "quiet": True,
        "no_warnings": True,
        "noplaylist": True,
        "socket_timeout": 10,
        "postprocessors": [
            {
                "key": "FFmpegExtractAudio",
                "preferredcodec": "mp3",
                # "preferredquality": "192",
                "preferredquality": "64",
            }
        ],
    }
    try:
        with yt_dlp.YoutubeDL(ydl_opts) as ydl:
            info = ydl.extract_info(youtube_url, download=True)
            filename = ydl.prepare_filename(info)
            base, _ = filename.rsplit(".", 1)
            return f"{base}.mp3"
    except Exception:
        raise IngestionError("Failed to download audio from YouTube video")


# import os
# output_dir = os.path.join(
#     os.path.dirname(__file__), "..", "..", "..", "tmp", "yt-audio"
# )
# os.makedirs(output_dir, exist_ok=True)

# path = download_audio(
#     "https://www.youtube.com/watch?v=GVizJ_jpUnw&list=RDLMnJp_dSdnw&index=10",
#     output_dir,
# )
# print(path)
