"""
main.py — KiteLab 鸢见 后端 API v3
"""
import asyncio, json, os, time, uuid
from collections import defaultdict
from fastapi import FastAPI, HTTPException, UploadFile, File
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import StreamingResponse
from pydantic import BaseModel
from dotenv import load_dotenv

load_dotenv()

from agent import run_agent
from predictor import get_available_materials, predict_properties, get_material_families, MATERIAL_DB
from knowledge_base import (
    get_all_papers, get_paper_by_id, get_papers_by_category,
    get_categories, get_stats, search_papers
)
from experiment_design import generate_experiment_plan
from pdf_processor import (
    extract_text_from_pdf, extract_metadata_with_llm, make_paper_id,
    add_user_paper, get_user_papers, delete_user_paper, search_user_papers
)

app = FastAPI(title="KiteLab API — 鸢见", version="3.0.0")
app.add_middleware(
    CORSMiddleware, allow_origins=["*"], allow_methods=["*"], allow_headers=["*"]
)

SESSION_STORE: dict[str, list[dict]] = defaultdict(list)

# ── Request models ─────────────────────────────────────────────────────────────
class ResearchRequest(BaseModel):
    query:      str
    session_id: str = "default"

class PredictRequest(BaseModel):
    formulas: list[str]

class ExperimentRequest(BaseModel):
    material:        str
    experiment_type: str
    objectives:      str
    constraints:     str = ""

# ── Health ─────────────────────────────────────────────────────────────────────
@app.get("/api/health")
async def health():
    return {
        "status": "ok",
        "version": "3.0.0",
        "api_key_configured": bool(os.getenv("DEEPSEEK_API_KEY", "")),
        "available_materials": len(get_available_materials()),
        "user_papers": len(get_user_papers()),
    }

# ── Materials ──────────────────────────────────────────────────────────────────
@app.get("/api/materials")
async def materials():
    return {
        "materials": get_available_materials(),
        "families":  get_material_families(),
        "total":     len(get_available_materials()),
    }

@app.post("/api/predict")
async def predict(req: PredictRequest):
    if not req.formulas:
        raise HTTPException(status_code=400, detail="formulas list cannot be empty")
    return {"predictions": [predict_properties(f) for f in req.formulas], "model": "GBR surrogate v2"}

# ── Curated Knowledge Base ─────────────────────────────────────────────────────
@app.get("/api/kb/stats")
async def kb_stats():
    s = get_stats()
    s["user_papers"] = len(get_user_papers())
    return s

@app.get("/api/kb/papers")
async def kb_papers(category: str = "", search: str = "", source: str = "curated"):
    """
    source: 'curated' | 'user' | 'all'
    """
    if source == "user":
        papers = search_user_papers(search) if search else get_user_papers()
    elif source == "all":
        curated = search_papers(search) if search else get_all_papers()
        user    = search_user_papers(search) if search else get_user_papers()
        papers  = curated + user
    else:
        # curated
        if search:   papers = search_papers(search)
        elif category: papers = get_papers_by_category(category)
        else:          papers = get_all_papers()
    return {"papers": papers, "total": len(papers)}

@app.get("/api/kb/papers/{paper_id}")
async def kb_paper(paper_id: str):
    # check curated first, then user
    p = get_paper_by_id(paper_id)
    if not p:
        user = [x for x in get_user_papers() if x["id"] == paper_id]
        p = user[0] if user else None
    if not p:
        raise HTTPException(status_code=404, detail="Paper not found")
    return p

@app.get("/api/kb/categories")
async def kb_categories():
    return {"categories": get_categories()}

# ── User Knowledge Base (PDF upload) ──────────────────────────────────────────
@app.post("/api/kb/upload")
async def kb_upload(file: UploadFile = File(...)):
    """Upload PDF → extract text → LLM metadata extraction → add to user KB."""
    if not file.filename.lower().endswith(".pdf"):
        raise HTTPException(status_code=400, detail="Only PDF files are supported")

    MAX_SIZE = 20 * 1024 * 1024  # 20 MB
    file_bytes = await file.read()
    if len(file_bytes) > MAX_SIZE:
        raise HTTPException(status_code=413, detail="File too large (max 20 MB)")

    # Extract text
    try:
        text = extract_text_from_pdf(file_bytes)
    except Exception as e:
        raise HTTPException(status_code=422, detail=f"PDF text extraction failed: {e}")

    if len(text) < 100:
        raise HTTPException(status_code=422, detail="PDF appears to be image-only or empty. Text extraction requires a text-based PDF.")

    # LLM metadata extraction
    metadata = await extract_metadata_with_llm(text)
    if "error" in metadata:
        raise HTTPException(status_code=500, detail=f"Metadata extraction failed: {metadata['error']}")

    paper_id = make_paper_id(metadata.get("title", file.filename), file_bytes)
    paper = {
        "id":                  paper_id,
        "title":               metadata.get("title", file.filename),
        "authors":             metadata.get("authors", []),
        "journal":             metadata.get("journal", ""),
        "year":                metadata.get("year", 0),
        "doi":                 metadata.get("doi", ""),
        "url":                 f"https://doi.org/{metadata.get('doi','')}" if metadata.get("doi") else "",
        "tags":                metadata.get("tags", []),
        "abstract":            metadata.get("abstract", ""),
        "extracted_materials": metadata.get("extracted_materials", []),
        "key_properties":      metadata.get("key_properties", {}),
        "category":            metadata.get("category", "user-uploaded"),
        "relevance_score":     metadata.get("relevance_score", 0.80),
        "source":              "user-uploaded",
        "filename":            file.filename,
    }

    add_user_paper(paper)
    return {"success": True, "paper": paper, "text_length": len(text)}


@app.get("/api/kb/user")
async def kb_user_list():
    return {"papers": get_user_papers(), "total": len(get_user_papers())}


@app.delete("/api/kb/user/{paper_id}")
async def kb_user_delete(paper_id: str):
    ok = delete_user_paper(paper_id)
    if not ok:
        raise HTTPException(status_code=404, detail="Paper not found in user library")
    return {"deleted": paper_id}

# ── Experiment Design ──────────────────────────────────────────────────────────
@app.get("/api/experiment/materials")
async def experiment_materials():
    return {"materials": [{"formula": k, "name": v["name"], "family": v["family"]} for k, v in MATERIAL_DB.items()]}

@app.post("/api/experiment/generate")
async def experiment_generate(req: ExperimentRequest):
    if not req.material.strip():
        raise HTTPException(status_code=400, detail="Material name required")
    return await generate_experiment_plan(
        material=req.material, experiment_type=req.experiment_type,
        objectives=req.objectives, constraints=req.constraints,
    )

# ── Session History ────────────────────────────────────────────────────────────
@app.get("/api/sessions/{session_id}/history")
async def session_history(session_id: str):
    rounds = SESSION_STORE.get(session_id, [])
    return {
        "session_id": session_id,
        "total_rounds": len(rounds),
        "rounds": [
            {"round": i+1, "query": r["query"], "timestamp": r["timestamp"],
             "candidates_found": len(r.get("ranked_candidates",[])),
             "top_recommendation": r.get("top_recommendation"),
             "final_summary": r.get("final_content","")[:300]}
            for i, r in enumerate(rounds)
        ],
    }

@app.delete("/api/sessions/{session_id}")
async def clear_session(session_id: str):
    SESSION_STORE.pop(session_id, None)
    return {"cleared": session_id}

# ── Research SSE ───────────────────────────────────────────────────────────────
@app.post("/api/research")
async def research(req: ResearchRequest):
    if not req.query.strip():
        raise HTTPException(status_code=400, detail="Query cannot be empty")

    session_id = req.session_id or str(uuid.uuid4())
    history    = SESSION_STORE[session_id]
    prior_context = ""
    if history:
        prev = history[-1]
        prior_context = (
            f"\n\n--- Context from previous round ---\n"
            f"Previous query: {prev['query']}\n"
            f"Top recommendation: {prev.get('top_recommendation','N/A')}\n"
            f"Summary: {prev.get('final_content','')[:400]}\n--- End ---\n"
        )

    round_data: dict = {
        "query": req.query,
        "timestamp": time.strftime("%Y-%m-%dT%H:%M:%SZ", time.gmtime()),
        "events": [], "ranked_candidates": [],
        "top_recommendation": None, "final_content": "",
    }
    queue: asyncio.Queue = asyncio.Queue()

    async def send_event(event_type: str, data: dict):
        round_data["events"].append({"type": event_type, **data})
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
            await run_agent(req.query + prior_context, send_event)
        except Exception as e:
            await send_event("error", {"message": str(e)})
        finally:
            SESSION_STORE[session_id].append(round_data)
            if len(SESSION_STORE[session_id]) > 10:
                SESSION_STORE[session_id] = SESSION_STORE[session_id][-10:]
            await queue.put(None)

    async def event_generator():
        asyncio.create_task(agent_task())
        yield f"data: {json.dumps({'type':'session','session_id':session_id,'round':len(history)+1})}\n\n"
        try:
            while True:
                item = await asyncio.wait_for(queue.get(), timeout=90.0)
                if item is None:
                    yield "data: [DONE]\n\n"; break
                event_type, data = item
                yield f"data: {json.dumps({'type':event_type,**data}, ensure_ascii=False)}\n\n"
        except asyncio.TimeoutError:
            yield 'data: {"type":"error","message":"Request timed out"}\n\n'

    return StreamingResponse(
        event_generator(),
        media_type="text/event-stream",
        headers={"Cache-Control":"no-cache","X-Accel-Buffering":"no"},
    )

if __name__ == "__main__":
    import uvicorn
    uvicorn.run("main:app", host="0.0.0.0", port=8000, reload=True)
