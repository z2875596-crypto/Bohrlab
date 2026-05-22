"""
main.py
FastAPI backend for BohrLab.
POST /api/research  → SSE stream of agent steps
GET  /api/materials → list available materials
GET  /api/health    → health check
"""
import asyncio
import json
import os
from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import StreamingResponse
from pydantic import BaseModel
from dotenv import load_dotenv

load_dotenv()

from agent import run_agent
from predictor import get_available_materials, predict_properties

app = FastAPI(title="BohrLab API", version="1.0.0")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)


class ResearchRequest(BaseModel):
    query: str
    session_id: str = "default"


@app.get("/api/health")
async def health():
    api_key_set = bool(os.getenv("DEEPSEEK_API_KEY", ""))
    return {
        "status": "ok",
        "api_key_configured": api_key_set,
        "available_materials": len(get_available_materials()),
    }


@app.get("/api/materials")
async def materials():
    return {"materials": get_available_materials()}


@app.post("/api/research")
async def research(req: ResearchRequest):
    if not req.query.strip():
        raise HTTPException(status_code=400, detail="Query cannot be empty")

    queue: asyncio.Queue = asyncio.Queue()

    async def send_event(event_type: str, data: dict):
        await queue.put((event_type, data))

    async def agent_task():
        try:
            await run_agent(req.query, send_event)
        except Exception as e:
            await send_event("error", {"message": str(e)})
        finally:
            await queue.put(None)  # sentinel

    async def event_generator():
        task = asyncio.create_task(agent_task())
        try:
            while True:
                item = await asyncio.wait_for(queue.get(), timeout=90.0)
                if item is None:
                    yield "data: [DONE]\n\n"
                    break
                event_type, data = item
                payload = json.dumps({"type": event_type, **data}, ensure_ascii=False)
                yield f"data: {payload}\n\n"
        except asyncio.TimeoutError:
            yield 'data: {"type":"error","message":"Request timed out"}\n\n'
            task.cancel()

    return StreamingResponse(
        event_generator(),
        media_type="text/event-stream",
        headers={
            "Cache-Control": "no-cache",
            "X-Accel-Buffering": "no",
        },
    )


if __name__ == "__main__":
    import uvicorn
    uvicorn.run("main:app", host="0.0.0.0", port=8000, reload=True)
