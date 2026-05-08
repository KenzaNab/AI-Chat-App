# AI Chat App

ChatGPT-like application with React frontend and FastAPI backend. Multiple chats, model selection, personas.

> React 18 · FastAPI · OpenAI API · Python · Docker

## Features
- Multiple chat sessions with sidebar
- GPT-4o-mini / GPT-3.5 / GPT-4o model selection
- 4 AI personas: Assistant, Coder, Teacher, German
- Works without API key (demo mode)
- Clean dark GitHub-inspired UI

## Quick start

```bash
# Backend
cd backend
pip install -r requirements.txt
echo "OPENAI_API_KEY=your_key" > .env
uvicorn app.main:app --reload --port 8000

# Frontend
cd frontend
npm install && npm start
```

Frontend: http://localhost:3000 · API docs: http://localhost:8000/docs


