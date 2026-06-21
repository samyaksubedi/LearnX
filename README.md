# LearnX - Distributed AI learning platform 

## Project Overview

**LearnX** is a full-stack project powered by RAG(Retrieval-Augmented Generation) which helps us chat with the content we have already read / watched . The content type which the app supports ( **youtube** , **pdf** , **video** , **audio**). 

![alt text](/README_ASSETS/landing_page.png)

## Motivation
I was learning RAG couple of months ago , I really thought building some kind of RAG based application is easy , but it wasn't . I thought it's just a simple RAG but , i't wasn't this project taught me  how to manage , multi device authentication using access and refreshToken ,  how can node application communicate with python application using Queue , It taught me that redis is not only ment for caching , it taught me how to implement or build a custom queue using redis **blpop** , It taught me how to process youtube videos locally , and many more . It just started with a simple RAG ChatBot but it end with a full end to end engineered RAG based application with authentication and Microservices  .
## What is it and what can it do ? 

It's just an RAG based chat app , which let's you have a conversation with any type of media source like - **Youtube** ,  **Video** , **Audio** , **PDF** . Also The AI bot not only gives you answer but also tells and  pip point the exact segment from where that answer was takes (source citation) .
![alt text](/README_ASSETS/create_convo.png)

## Interesting Feature
- When Chatting with a youtube video or nay type of media source which is supported   , you  won't just get a simple answer from the content , it will point and fast forward to the exact part / page number from where AI made the answer . 
[▶ Watch Live Example](./README_ASSETS/youtube_demo.mp4)
- As we know , For processing a media (Video , Audio , Youtube , PDF) backend takes time so we can't just process all thing at once or in a single API call , because response time will be more that 1 min in such cases . It's bad system design , So When user creates conversation it just don't start processing at the spot rather it creates a row in Conversation Table and put the status as processing and fastly return back the response with conversation details , and push the conversation Job to the Redis Queue so it can process it in background .  
- I implemented a custom redis queue using **blpop** , As there was no any library which helped me connect Node Application with Pytho Application . So , i used lpush to push job to the queue on node side and on python side i have used blpop to continuously listen to the queue for job . 
- In my old project i suffered from a problem when using AccessToken and RefreshToken for user authentication as If i loggedIn the same account from anothe device the backend generates a new RefreshToken so my other device get's logged out , That wasn't good , SO in this project i have handled multi device sessions by storing user session on a seperate database table :  i.e **user_session**


## App Flow
- User registers on our app and complete all verification flow .
- User logins to our app and creates a conversation of any type (youtube,video.audio,pdf)
- After creating conversation cackend instantly send's response and add a job to the redis queue for processing the media . When i say processing i typically mean -  Extracting audio from the media , transcribing it , chunking it , overlapping it and embedding all the chunks , and lastly saving to Qdrant (Vector store) .
- After successfully processing the media user can finally chat with the source media .  
- AI gives you exact pageNumber , auto scrolls the pdf to the exact content which was used by AI to answer  your question . So you can trust it completely .Same goes with other media source(audio , video , youtube)

## Server Architecture

```server/
├── shared/
│   └── uploads/              # A shared storage between ( api and ai )service 
│       ├── video/
│       ├── audio/
│       ├── pdf/
│       └── .gitkeep
│
├── api/                      # Node.js / Express
│   ├── prisma/
│   │   ├── schema.prisma     # Database Schema
│   │   ├── prisma.config.ts
│   │   └── migrations/
│   │       
│   │       
│   │        
│   │        
│   │
│   │
│   ├── src/
│   │   ├── app.js                        # Express app setup, middleware, routes
│   │   ├── server.js                     # Server entry point, startup checks
│   │   │
│   │   ├── configs/
│   │   │   ├── env.config.js             # Environment variables validation
│   │   │   ├── logger.config.js          # Winston logger setup
│   │   │   ├── mail.config.js            # Nodemailer transporter
│   │   │   ├── redis.config.js           # Redis client
│   │   │   └── storage.config.js         # Backblaze B2 S3 client
│   │   │
│   │   ├── db/
│   │   │   └── client.db.js              # Prisma client singleton
│   │   │
│   │   ├── middlewares/
│   │   │   ├── auth.middleware.js        # JWT verification + session check
│   │   │   ├── credits.middleware.js     # Rate limiting (40/user, 300/global)
│   │   │   ├── error.middleware.js       # Global error handler
│   │   │   ├── upload.middleware.js      # Multer file upload
│   │   │   └── validate.middleware.js    # Zod request validation
│   │   │
│   │   ├── modules/
│   │   │   ├── auth/
│   │   │   │   ├── auth.controller.js    # signUp, signIn, logout, refresh, getMe...
│   │   │   │   ├── auth.crypto.js        # bcrypt hash/compare
│   │   │   │   ├── auth.device.js        # User-agent device info parser
│   │   │   │   ├── auth.email.js         # Verification/welcome email senders
│   │   │   │   ├── auth.router.js        # Auth routes
│   │   │   │   ├── auth.service.js       # Auth business logic
│   │   │   │   ├── auth.tokens.js        # JWT + verification token generators
│   │   │   │   └── auth.validation.js    # Zod schemas for auth requests
│   │   │   │
│   │   │   ├── conversations/
│   │   │   │   ├── conversations.controller.js   # Request handlers
│   │   │   │   ├── conversations.router.js       # Conversation routes
│   │   │   │   ├── conversations.service.js      # Business logic
│   │   │   │   ├── conversations.validation.js   # Zod schemas
│   │   │   │   ├── conversations.youtube.js      # YouTube URL validation (play-dl)--> Now it's Removed and used python yt-dlp as a single source of truth 
│   │   │   │   ├── conversations.upload.js       # B2 upload/delete helpers
│   │   │   │   ├── conversations.history.js      # Fetch last N messages for chat
│   │   │   │   └── conversations.ai.js           # Node→Python fetch + Qdrant delete +  Youtube validation
│   │   │   │
│   │   │   └── webhooks/
│   │   │       ├── webhooks.controller.js        # Webhook handlers
│   │   │       ├── webhooks.router.js            # Webhook routes
│   │   │       ├── webhooks.service.js           # Update conversation status/error
│   │   │       └── webhook.validation.js         # Webhook zod schema 
│   │   │
│   │   ├── services/
│   │   │   └── queue.service.js          # Redis RPUSH to learnx:conversation-processing
│   │   │
│   │   └── utils/
│   │       ├── api-output.util.js        # ApiResponse + ApiError classes
│   │       └── email.util.js             # Email template helpers
│   │
│   ├── .env
│   ├── .env.example
│   ├── package.json
│   └── package-lock.json
│
└── ai/                       # Python / FastAPI
    ├── main.py               # FastAPI app entry point
    ├── worker.py             # Redis BLPOP worker — processes ingestion jobs
    ├── pyproject.toml
    ├── uv.lock
    ├── .python-version
    ├── README.md
    ├── tmp/                  # Temp audio/video files (gitignored)
    │   └── .gitkeep
    │
    └── app/
        ├── config.py                     # Pydantic settings (env vars)
        │
        ├── clients/
        │   ├── node_api_client.py        # POST to Node webhook (status updates)
        │   ├── redis_client.py           # Redis connection
        │   └── vector_store_client.py    # Qdrant + OpenAI embeddings singleton
        │
        ├── rag/
        │   ├── retrieval.py              # similarity_search with conversation_id filter
        │   └── vector_store.py           # embed_and_store(), delete_conversation_vectors()
        │
        ├── routers/
        │   └── chat_router.py            # FastAPI chat routes
        │
        ├── schemas/
        │   └── chat_schema.py            # ChatRequest, ChatResponse, RangeReference, PageReference
        │
        ├── services/
        │   ├── chat/
        │   │   ├── chat_service.py       # RAG chat service
        │   │   ├── prompts.py            # ChatPromptTemplate + system prompt
        │   │   └── schemas.py            # LLMChatOutput structured schema
        │   │
        │   ├── ingestion/
        │   │   ├── exceptions.py         # IngestionError custom exception
        │   │   ├── pdf.py                # PDF extraction helpers
        │   │   ├── video.py              # FFmpeg audio extraction
        │   │   └── youtube.py            # YouTube validation/download
        │   │
        │   ├── job/
        │   │   └── conversation_job_router.py    # Routes jobs to workflows
        │   │
        │   └── processing/
        │       ├── chunking.py           # Chunking utilities
        │       └── transcription.py      # Whisper transcription
        │
        ├── utils/
        │   └── file_utils.py             # File cleanup helpers
        │
        ├── workers/
        │   └── conversation_worker.py    # Redis worker implementation
        │
        └── workflows/
            ├── youtube_workflow.py       # validate→download→transcribe→chunk→embed
            ├── video_workflow.py         # extract_audio→transcribe→chunk→embed
            ├── audio_workflow.py         # transcribe→chunk→embed
            └── pdf_workflow.py           # extract_pages→chunk→embed
```

## Tech Used

### Backend (Node.js API)

- **Runtime:** Node.js
- **Framework:** Express.js
- **Database:** PostgreSQL
- **ORM:** Prisma
- **Authentication:** JWT (Access Token + Refresh Token)
- **Queue:** Redis (Custom Queue using LPUSH / BLPOP)
* **File Storage:** Backblaze B2 (S3 Compatible)
- **Validation:** Zod
- **Email Service:** Nodemailer

### AI Service (Python)

- **Runtime:** Python 3
- **Framework:** FastAPI
- **LLM:** OpenAI GPT-4o
- **Embeddings:** OpenAI Embeddings
- **Vector Database:** Qdrant
- **Transcription:** Faster-Whisper
- **YouTube Processing:** yt-dlp
- **Video Processing:** FFmpeg
- **AI Framework:** LangChain
- **Queue Consumer:** Redis BLPOP Worker

### Frontend

- **Framework:** React 19
- **Routing:** React Router v7
- **Build Tool:** Vite
- **Styling:** Tailwind CSS
* **HTTP Client:** Axios
- **UI:** Custom Components with Tailwind CSS

### Infrastructure

- **Database Hosting:** Neon PostgreSQL
- **Object Storage:** Backblaze B2
- **Vector Storage:** Qdrant
- **Caching / Queue:** Redis
- **Containerization:** Docker

### AI Uses
- **ChatGPT and Claude** : I took help from AI assistance when creating frontend components and understanding some new concepts in backend such as Blpop  , session based login .... , Also when creating  The file / folder structure part on README only. 

