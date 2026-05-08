from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.routers import chat, health

app = FastAPI(title="AI Chat API", version="1.0.0")

app.add_middleware(CORSMiddleware, allow_origins=["http://localhost:3000"], allow_methods=["*"], allow_headers=["*"])

app.include_router(health.router)
app.include_router(chat.router, prefix="/api/chat")
