from pydantic import BaseModel, Field
from typing import Optional


class LLMChatOutput(BaseModel):
    answer: str = Field(
        description="The answer to the user's question, based only on the provided context"
    )
    source_start: Optional[int] = Field(
        default=None,
        description="Start timestamp (in seconds) of the most relevant chunk, if context is audio/video/youtube",
    )
    source_end: Optional[int] = Field(
        default=None,
        description="End timestamp (in seconds) of the most relevant chunk, if context is audio/video/youtube",
    )
    source_page: Optional[int] = Field(
        default=None,
        description="Page number of the most relevant chunk, if context is a PDF",
    )
