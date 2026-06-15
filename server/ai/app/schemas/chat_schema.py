from pydantic import BaseModel, Field
from typing import Optional, Union


class ChatRequest(BaseModel):
    query: str = Field(...)
    conversation_id: str = Field(...)
    history: Optional[list[dict]] = None


class RangeReference(BaseModel):  # For Media Chat
    start: int
    end: int


class PageReference(BaseModel):  # For pdf chat
    pageNumber: int


class ChatResponse(BaseModel):
    response: str
    source_reference: Optional[Union[RangeReference, PageReference]] = None


class ChatDeleteRequest(BaseModel):
    conversation_id: str = Field(...)
