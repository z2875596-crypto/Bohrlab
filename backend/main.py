"""
main.py
FastAPI backend with:
- Session management (research history persisted per session_id)
- /api/research  → SSE stream
- /api/sessions/{id}/history → get session history
- /api/predict   → standalone property prediction
- /api/health    → health check
- /api/materials → list available materials
"""
import asyncio, json, os, time, uuid
from collections import defaultdict
from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import StreamingResponse
from pydantic import BaseModel
from dotenv import load_dotenv

load_dotenv()

from agent import run_agent
from predictor import get_available_materials, predict_properties, get_material_families

app = FastAPI(title="KiteLab API — 鸢见", version="2.0.0")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"], allow_methods=["*"], allow_headers=["*"],
)

# ── In-memory session store ────────────────────────────────────────────────────
# Structure: session_id → list of research rounds
# Each round: { query, timestamp, events, ranked_candidates, final_content }
SESSION_STORE: dict[str, list[dict]] = defaultdict(list)
SESSION_TTL = 3600  # seconds before a session's history is cleared


class ResearchRequest(BaseModel):
    query:      str
    session_id: str = "default"


class PredictRequest(BaseModel):
    formulas: list[str]


# ── Endpoints ──────────────────────────────────────────────────────────────────

@app.get("/api/health")
async def health():
    return {
        "status": "ok",
        "version": "2.0.0",
        "api_key_configured": bool(os.getenv("DEEPSEEK_API_KEY", "")),
        "available_materials": len(get_available_materials()),
        "material_families": get_material_families(),
    }


@app.get("/api/materials")
async def materials():
    return {
        "materials": get_available_materials(),
        "families": get_material_families(),
        "total": len(get_available_materials()),
    }


@app.post("/api/predict")
async def predict(req: PredictRequest):
    """Standalone prediction endpoint — useful for live demos in Swagger UI."""
    if not req.formulas:
        raise HTTPException(status_code=400, detail="formulas list cannot be empty")
    results = [predict_properties(f) for f in req.formulas]
    return {"predictions": results, "model": "GBR surrogate v2"}


@app.get("/api/sessions/{session_id}/history")
async def session_history(session_id: str):
    """Return all research rounds for a session."""
    rounds = SESSION_STORE.get(session_id, [])
    return {
        "session_id": session_id,
        "total_rounds": len(rounds),
        "rounds": [
            {
                "round": i + 1,
                "query": r["query"],
                "timestamp": r["timestamp"],
                "candidates_found": len(r.get("ranked_candidates", [])),
                "top_recommendation": r.get("top_recommendation"),
                "final_summary": r.get("final_content", "")[:300],
            }
            for i, r in enumerate(rounds)
        ],
    }


@app.delete("/api/sessions/{session_id}")
async def clear_session(session_id: str):
    SESSION_STORE.pop(session_id, None)
    return {"cleared": session_id}


@app.post("/api/research")
async def research(req: ResearchRequest):
    if not req.query.strip():
        raise HTTPException(status_code=400, detail="Query cannot be empty")

    session_id = req.session_id or str(uuid.uuid4())
    history    = SESSION_STORE[session_id]

    # Build context summary from previous rounds
    prior_context = ""
    if history:
        prev = history[-1]
        prior_context = (
            f"\n\n--- Context from previous research round ---\n"
            f"Previous query: {prev['query']}\n"
            f"Top recommendation: {prev.get('top_recommendation', 'N/A')}\n"
            f"Summary: {prev.get('final_content', '')[:400]}\n"
            f"--- End of context ---\n"
        )

    # Round data collected during streaming
    round_data: dict = {
        "query": req.query,
        "timestamp": time.strftime("%Y-%m-%dT%H:%M:%SZ", time.gmtime()),
        "events": [],
        "ranked_candidates": [],
        "top_recommendation": None,
        "final_content": "",
    }

    queue: asyncio.Queue = asyncio.Queue()

    async def send_event(event_type: str, data: dict):
        round_data["events"].append({"type": event_type, **data})
        # Update round summary fields live
        if event_type == "observation" and data.get("tool") == "score_and_rank":
            rc = data.get("result", {}).get("ranked_candidates", [])
            if rc:
                round_data["ranked_candidates"] = rc
                round_data["top_recommendation"] = rc[0]["formula"]
        if event_type == "final":
            round_data["final_content"] = data.get("content", "")
        await queue.put((event_type, data))

    async def agent_task():
        try:
            augmented_query = req.query + prior_context
            await run_agent(augmented_query, send_event)
        except Exception as e:
            await send_event("error", {"message": str(e)})
        finally:
            # Persist round to session history
            SESSION_STORE[session_id].append(round_data)
            # Keep only last 10 rounds per session
            if len(SESSION_STORE[session_id]) > 10:
                SESSION_STORE[session_id] = SESSION_STORE[session_id][-10:]
            await queue.put(None)

    async def event_generator():
        task = asyncio.create_task(agent_task())
        # Emit session metadata as first event
        yield f"data: {json.dumps({'type':'session','session_id':session_id,'round':len(history)+1})}\n\n"
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
        headers={"Cache-Control": "no-cache", "X-Accel-Buffering": "no"},
    )


if __name__ == "__main__":
    import uvicorn
    uvicorn.run("main:app", host="0.0.0.0", port=8000, reload=True)
