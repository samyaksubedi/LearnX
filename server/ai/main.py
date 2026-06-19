from fastapi import FastAPI
from app.routers.chat_router import router as chat_router
from app.services.ingestion.exceptions import IngestionError
from fastapi.responses import JSONResponse
from fastapi import Request

app = FastAPI(title="AI Related Backend For LearnX")


#  Global Error Handler


@app.exception_handler(IngestionError)
async def ingestion_error_handler(request: Request, exc: IngestionError):
    return JSONResponse(
        status_code=400,
        content={
            "success": False,
            "message": str(exc),
        },
    ) @ app.exception_handler(IndentationError)


# @app.post("/internal/chat")
# async def chat_Conversation():
#     pass
@app.get("/")
def root():
    return {"status": "Alive"}


app.include_router(chat_router)
