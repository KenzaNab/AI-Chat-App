from fastapi import APIRouter
from fastapi.responses import StreamingResponse
from pydantic import BaseModel
from typing import List
import openai
import os
import json

router = APIRouter()

class Message(BaseModel):
    role: str
    content: str

class ChatRequest(BaseModel):
    messages: List[Message]
    model: str = "gpt-4o-mini"


@router.post("/stream")
async def stream_chat(req: ChatRequest):
    client = openai.AsyncOpenAI(api_key=os.getenv("OPENAI_API_KEY"))

    async def generate():
        try:
            stream = await client.chat.completions.create(
                model=req.model,
                messages=[{"role": m.role, "content": m.content} for m in req.messages],
                stream=True,
                max_tokens=1000,
            )
            async for chunk in stream:
                delta = chunk.choices[0].delta.content
                if delta:
                    yield f"data: {json.dumps({'content': delta})}\n\n"
            yield "data: [DONE]\n\n"
        except Exception as e:
            yield f"data: {json.dumps({'error': str(e)})}\n\n"

    return StreamingResponse(generate(), media_type="text/event-stream")


@router.post("/message")
async def chat(req: ChatRequest):
    if not os.getenv("OPENAI_API_KEY"):
        return {"content": "I'm a demo AI assistant! Set OPENAI_API_KEY to enable real responses. Your message: " + req.messages[-1].content}

    client = openai.AsyncOpenAI(api_key=os.getenv("OPENAI_API_KEY"))
    response = await client.chat.completions.create(
        model=req.model,
        messages=[{"role": m.role, "content": m.content} for m in req.messages],
        max_tokens=1000,
    )
    return {"content": response.choices[0].message.content}
