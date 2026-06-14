from fastapi import FastAPI
from app.routers.chat_router import router as chat_router

app = FastAPI(title="AI Related Backend For LearnX")


# @app.post("/internal/chat")
# async def chat_Conversation():
#     pass
@app.get("/")
def root():
    return {"status": "Alive"}


app.include_router(chat_router)
