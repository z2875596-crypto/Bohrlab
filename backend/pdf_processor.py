"""
pdf_processor.py
Upload PDF → extract text → LLM structured extraction → add to user KB
"""
import os, json, re, hashlib, httpx
import fitz  # pymupdf

DEEPSEEK_API_KEY  = os.getenv("DEEPSEEK_API_KEY", "")
DEEPSEEK_BASE_URL = "https://api.deepseek.com/v1"

EXTRACT_PROMPT = """You are a materials science literature analyst.
Extract structured information from this paper text and return ONLY a JSON object with NO markdown fences.

Required fields:
{
  "title": "full paper title",
  "authors": ["Author1", "Author2"],
  "journal": "journal name",
  "year": 2024,
  "doi": "doi string or empty string",
  "tags": ["tag1", "tag2"],
  "abstract": "2-4 sentence summary focusing on materials, methods, and key findings",
  "extracted_materials": ["formula1", "formula2"],
  "key_properties": {
    "formula": {"conductivity_S_m": 50000, "tec_ppm_K": 11.5, "test_temp_C": 800}
  },
  "category": "one of: perovskite|spinel|ruddlesden-popper|simple oxide|review|synthesis|stability|computational|emerging",
  "relevance_score": 0.85
}

Rules:
- extracted_materials: only oxide/ceramic chemical formulas (e.g. La0.8Sr0.2MnO3)
- key_properties: only fill if numeric values are explicitly stated in text
- relevance_score: 0.0-1.0, how relevant to SOFC interconnect materials
- If a field is unknown, use empty string/array/object
- Return ONLY the JSON, no explanation"""


def extract_text_from_pdf(file_bytes: bytes, max_chars: int = 8000) -> str:
    """Extract text from PDF bytes using PyMuPDF."""
    doc = fitz.open(stream=file_bytes, filetype="pdf")
    texts = []
    for page in doc:
        texts.append(page.get_text())
    doc.close()
    full = "\n".join(texts)
    # Take first + middle section (abstract + results usually there)
    if len(full) > max_chars:
        half = max_chars // 2
        full = full[:half] + "\n...\n" + full[len(full)//2: len(full)//2 + half]
    return full.strip()


async def extract_metadata_with_llm(text: str) -> dict:
    """Use DeepSeek to extract structured metadata from paper text."""
    try:
        async with httpx.AsyncClient(timeout=45.0) as client:
            resp = await client.post(
                f"{DEEPSEEK_BASE_URL}/chat/completions",
                headers={
                    "Authorization": f"Bearer {DEEPSEEK_API_KEY}",
                    "Content-Type": "application/json",
                },
                json={
                    "model": "deepseek-chat",
                    "messages": [
                        {"role": "system", "content": EXTRACT_PROMPT},
                        {"role": "user",   "content": f"Extract from this paper:\n\n{text[:6000]}"},
                    ],
                    "max_tokens": 1000,
                    "temperature": 0.1,
                },
            )
        raw = resp.json()["choices"][0]["message"]["content"].strip()
        raw = raw.replace("```json", "").replace("```", "").strip()
        return json.loads(raw)
    except Exception as e:
        return {"error": str(e)}


def make_paper_id(title: str, file_bytes: bytes) -> str:
    h = hashlib.md5(file_bytes[:1024]).hexdigest()[:6]
    return f"u{h}"


# ── In-memory user KB (persists while backend is running) ──────────────────
USER_PAPERS: list[dict] = []


def add_user_paper(paper: dict) -> dict:
    # Avoid duplicates by id
    existing_ids = {p["id"] for p in USER_PAPERS}
    if paper["id"] not in existing_ids:
        USER_PAPERS.append(paper)
    return paper


def get_user_papers() -> list[dict]:
    return USER_PAPERS


def delete_user_paper(paper_id: str) -> bool:
    global USER_PAPERS
    before = len(USER_PAPERS)
    USER_PAPERS = [p for p in USER_PAPERS if p["id"] != paper_id]
    return len(USER_PAPERS) < before


def search_user_papers(query: str) -> list[dict]:
    q = query.lower()
    results = []
    for p in USER_PAPERS:
        score = 0.0
        if q in p.get("title","").lower():      score += 3.0
        if q in p.get("abstract","").lower():   score += 2.0
        if any(q in t for t in p.get("tags",[])): score += 1.5
        if any(q in m.lower() for m in p.get("extracted_materials",[])): score += 2.5
        if score > 0:
            results.append((score, p))
    results.sort(key=lambda x: x[0], reverse=True)
    return [p for _, p in results]
