"""
tools.py
Four science tools with:
- Retry decorator (3x, exponential backoff) for all network calls
- LLM-assisted candidate extraction from arXiv abstracts
- Fuzzy matching against expanded material database
"""
import asyncio, httpx, json, re, os
from predictor import batch_predict, get_available_materials, fuzzy_match, MATERIAL_DB

DEEPSEEK_API_KEY  = os.getenv("DEEPSEEK_API_KEY", "")
DEEPSEEK_BASE_URL = "https://api.deepseek.com/v1"

# ── Retry decorator ────────────────────────────────────────────────────────────
def with_retry(max_attempts: int = 3, base_delay: float = 1.0):
    """Async retry with exponential backoff. Retries on any Exception."""
    def decorator(fn):
        async def wrapper(*args, **kwargs):
            last_exc = None
            for attempt in range(max_attempts):
                try:
                    return await fn(*args, **kwargs)
                except Exception as e:
                    last_exc = e
                    if attempt < max_attempts - 1:
                        delay = base_delay * (2 ** attempt)
                        await asyncio.sleep(delay)
            raise last_exc
        wrapper.__name__ = fn.__name__
        return wrapper
    return decorator


# ── Synthesis routes ───────────────────────────────────────────────────────────
SYNTHESIS_ROUTES = {
    "La0.8Sr0.2MnO3": {
        "method": "Solid-state reaction",
        "precursors": ["La2O3 (99.9%)", "SrCO3 (99%)", "MnO2 (99%)"],
        "steps": [
            "Weigh precursors in stoichiometric ratio for La0.8Sr0.2MnO3",
            "Ball-mill in ethanol for 12 h, then dry at 80°C",
            "Calcine at 900°C for 4 h in air (ramp 3°C/min)",
            "Re-mill, press into pellets at 200 MPa",
            "Sinter at 1300°C for 6 h in air",
            "Slow cool at 1°C/min to room temperature",
        ],
        "atmosphere": "Air", "duration_h": 30, "difficulty": "Medium",
        "notes": "Sr doping x=0.2–0.3 is optimal for SOFC interconnect conductivity.",
    },
    "La0.7Sr0.3CrO3": {
        "method": "Pechini sol-gel",
        "precursors": ["La(NO3)3·6H2O", "Sr(NO3)2", "Cr(NO3)3·9H2O", "Citric acid", "Ethylene glycol"],
        "steps": [
            "Dissolve nitrate salts (La:Sr:Cr = 0.7:0.3:1) in DI water",
            "Add citric acid (metal:citric = 1:2) and ethylene glycol",
            "Stir at 80°C ~4 h until gel forms",
            "Combust gel at 300°C (use fume hood — exothermic)",
            "Calcine at 800°C for 3 h in air",
            "Sinter at 1400°C for 8 h, switching reducing→oxidizing atmosphere",
        ],
        "atmosphere": "Reducing → Oxidizing", "duration_h": 24, "difficulty": "Medium-High",
        "notes": "LSCr contains Cr — consider toxicity. Phase purity requires careful atmosphere control.",
    },
    "MnCo2O4": {
        "method": "Coprecipitation",
        "precursors": ["Mn(NO3)2·4H2O", "Co(NO3)2·6H2O", "NaOH (precipitant)"],
        "steps": [
            "Dissolve Mn and Co nitrates (Mn:Co = 1:2) in DI water",
            "Add 2M NaOH dropwise to pH=10, stir 2 h at RT",
            "Filter and wash with DI water until pH neutral",
            "Dry at 120°C overnight",
            "Calcine at 700°C for 4 h in air",
            "Press and sinter at 1100°C for 6 h",
        ],
        "atmosphere": "Air", "duration_h": 18, "difficulty": "Low-Medium",
        "notes": "Excellent for protective coatings on ferritic steel interconnects. Reduces Cr poisoning.",
    },
    "La0.8Sr0.2Cr0.5Mn0.5O3": {
        "method": "Solid-state reaction",
        "precursors": ["La2O3", "SrCO3", "Cr2O3", "MnO2"],
        "steps": [
            "Mix precursors: La:Sr:Cr:Mn = 0.8:0.2:0.5:0.5",
            "Ball-mill 24 h and dry",
            "Pre-calcine at 800°C for 4 h",
            "Re-mill and press at 250 MPa",
            "Sinter at 1350°C for 8 h in wet H2 (dual-atmosphere test)",
            "Anneal at 800°C in air for 2 h",
        ],
        "atmosphere": "Wet H2 / Air", "duration_h": 40, "difficulty": "High",
        "notes": "Excellent redox stability. Suitable for dual-atmosphere (fuel/air side) interconnects.",
    },
    "La2NiO4": {
        "method": "Pechini sol-gel",
        "precursors": ["La(NO3)3·6H2O", "Ni(NO3)2·6H2O", "Citric acid", "Ethylene glycol"],
        "steps": [
            "Dissolve La and Ni nitrates (La:Ni = 2:1) in DI water",
            "Add citric acid (molar ratio 2:1 vs metals)",
            "Heat to 80°C, stir ~6 h until viscous gel",
            "Combust gel at 400°C",
            "Calcine at 900°C for 5 h in air",
            "Sinter at 1200°C for 6 h",
        ],
        "atmosphere": "Air", "duration_h": 25, "difficulty": "Medium",
        "notes": "K2NiF4 structure gives good mixed ionic-electronic conductivity.",
    },
    "La0.8Sr0.2Mn0.8Co0.2O3": {
        "method": "Solid-state reaction",
        "precursors": ["La2O3", "SrCO3", "MnO2", "Co3O4"],
        "steps": [
            "Weigh and mix precursors in stoichiometric ratio",
            "Ball-mill 12 h in ethanol, dry",
            "Calcine at 950°C for 4 h in air",
            "Re-mill and press at 200 MPa",
            "Sinter at 1280°C for 6 h",
        ],
        "atmosphere": "Air", "duration_h": 28, "difficulty": "Medium",
        "notes": "Co substitution increases electronic conductivity vs pure LSM.",
    },
    "La0.6Sr0.4Co0.2Fe0.8O3": {
        "method": "Sol-gel combustion",
        "precursors": ["La(NO3)3·6H2O","Sr(NO3)2","Co(NO3)2·6H2O","Fe(NO3)3·9H2O","Glycine"],
        "steps": [
            "Dissolve all nitrates in DI water (La:Sr:Co:Fe = 0.6:0.4:0.2:0.8)",
            "Add glycine (fuel, nitrate:glycine = 1:0.56)",
            "Heat on hotplate at 250°C until self-ignition",
            "Calcine ash at 800°C for 3 h",
            "Press and sinter at 1150°C for 5 h",
        ],
        "atmosphere": "Air", "duration_h": 16, "difficulty": "Medium",
        "notes": "LSCF shows high oxygen permeability; suitable for cathode and interconnect.",
    },
    "Mn1.5Co1.5O4": {
        "method": "Coprecipitation",
        "precursors": ["Mn(NO3)2·4H2O", "Co(NO3)2·6H2O", "NaOH"],
        "steps": [
            "Dissolve Mn and Co nitrates (Mn:Co = 1.5:1.5) in DI water",
            "Precipitate at pH=11 with 2M NaOH",
            "Age 2 h, filter, wash, dry at 100°C",
            "Calcine at 650°C for 3 h",
            "Sinter at 1050°C for 5 h",
        ],
        "atmosphere": "Air", "duration_h": 16, "difficulty": "Low-Medium",
        "notes": "Optimised Mn/Co ratio for low electrical resistivity in spinel coatings.",
    },
}

TOOL_DEFINITIONS = [
    {
        "name": "literature_search",
        "description": (
            "Search arXiv for recent materials science papers. "
            "Returns paper titles, abstracts, and LLM-extracted candidate material formulas."
        ),
        "parameters": {
            "type": "object",
            "properties": {
                "query": {"type": "string", "description": "Search query"},
                "max_results": {"type": "integer", "description": "Max papers (default 8)"},
            },
            "required": ["query"],
        },
    },
    {
        "name": "predict_properties",
        "description": "Predict electrical conductivity, TEC, and max-use temperature for candidate materials using the surrogate ML model.",
        "parameters": {
            "type": "object",
            "properties": {
                "formulas": {"type": "array", "items": {"type": "string"}, "description": "Material formulas"},
            },
            "required": ["formulas"],
        },
    },
    {
        "name": "get_synthesis_route",
        "description": "Retrieve synthesis procedure, precursors, sintering conditions, and difficulty for a material.",
        "parameters": {
            "type": "object",
            "properties": {"formula": {"type": "string"}},
            "required": ["formula"],
        },
    },
    {
        "name": "score_and_rank",
        "description": "Score and rank candidate materials against performance targets. Returns ranked list with explanations.",
        "parameters": {
            "type": "object",
            "properties": {
                "candidates": {"type": "array", "items": {"type": "string"}},
                "targets": {"type": "object", "description": "min_conductivity_S_m, max_tec_ppm_K, min_temp_C"},
            },
            "required": ["candidates", "targets"],
        },
    },
]


# ── Tool implementations ───────────────────────────────────────────────────────

@with_retry(max_attempts=3, base_delay=1.0)
async def _fetch_arxiv(query: str, max_results: int) -> str:
    url = "https://export.arxiv.org/api/query"
    params = {
        "search_query": f"all:{query} AND cat:cond-mat",
        "max_results": max_results,
        "sortBy": "relevance",
        "sortOrder": "descending",
    }
    async with httpx.AsyncClient(timeout=15.0) as client:
        resp = await client.get(url, params=params)
    resp.raise_for_status()
    return resp.text


async def _extract_candidates_with_llm(abstracts: list[str]) -> list[str]:
    """Ask DeepSeek to extract material formulas from paper abstracts."""
    if not DEEPSEEK_API_KEY or not abstracts:
        return []
    combined = "\n\n".join(abstracts[:5])
    prompt = (
        "Extract all specific material chemical formulas mentioned in these abstracts. "
        "Return ONLY a JSON array of formula strings, e.g. [\"La0.8Sr0.2MnO3\", \"MnCo2O4\"]. "
        "Include only oxide/ceramic materials relevant to SOFC interconnects. "
        "No explanation, only the JSON array.\n\n" + combined
    )
    try:
        async with httpx.AsyncClient(timeout=20.0) as client:
            resp = await client.post(
                f"{DEEPSEEK_BASE_URL}/chat/completions",
                headers={"Authorization": f"Bearer {DEEPSEEK_API_KEY}", "Content-Type": "application/json"},
                json={"model": "deepseek-chat", "messages": [{"role":"user","content":prompt}],
                      "max_tokens": 300, "temperature": 0.0},
            )
        data = resp.json()
        text = data["choices"][0]["message"]["content"].strip()
        # Parse JSON array
        match = re.search(r'\[.*?\]', text, re.DOTALL)
        if match:
            raw = json.loads(match.group())
            # fuzzy-match each extracted formula against our DB
            matched = []
            for f in raw:
                key = fuzzy_match(f)
                if key and key not in matched:
                    matched.append(key)
            return matched
    except Exception:
        pass
    return []


async def tool_literature_search(query: str, max_results: int = 8) -> dict:
    papers, abstracts = [], []
    try:
        xml = await _fetch_arxiv(query, max_results)
        titles    = re.findall(r"<title>(.*?)</title>",   xml, re.DOTALL)[1:]
        summaries = re.findall(r"<summary>(.*?)</summary>", xml, re.DOTALL)
        links     = re.findall(r'<id>(http://arxiv\.org/abs/[^<]+)</id>', xml)
        for t, s, l in zip(titles, summaries, links):
            papers.append({
                "title":    t.strip().replace("\n"," "),
                "abstract": s.strip().replace("\n"," ")[:350],
                "url":      l.strip(),
            })
            abstracts.append(s.strip())
        source = "arXiv (live)"
    except Exception as e:
        # Curated fallback after all retries exhausted
        papers = [
            {"title": "High-temperature electrical properties of La1-xSrxMnO3 for SOFC interconnects",
             "abstract": "La0.8Sr0.2MnO3 shows conductivity >100,000 S/m at 800°C with TEC 11.8 ppm/K matching YSZ.",
             "url": "https://arxiv.org/abs/example1"},
            {"title": "Chromite-based perovskites as SOFC interconnect materials",
             "abstract": "La0.7Sr0.3CrO3 shows 13,000 S/m at 800°C with excellent oxidation resistance.",
             "url": "https://arxiv.org/abs/example2"},
            {"title": "Spinel MnCo2O4 coating for ferritic steel interconnects",
             "abstract": "MnCo2O4 spinel coatings achieve 60,000 S/m and suppress Cr evaporation.",
             "url": "https://arxiv.org/abs/example3"},
        ]
        abstracts = [p["abstract"] for p in papers]
        source = f"curated fallback (arXiv error: {e})"

    # LLM-assisted candidate extraction
    llm_candidates = await _extract_candidates_with_llm(abstracts)

    # Supplement with keyword matching if LLM returns few results
    keyword_candidates: list[str] = []
    all_text = " ".join(abstracts).lower()
    for key, meta in MATERIAL_DB.items():
        for alias in [key] + meta.get("aliases", []):
            if alias.lower() in all_text and key not in keyword_candidates:
                keyword_candidates.append(key)

    # Merge, deduplicate, cap at 8
    merged: list[str] = []
    for c in llm_candidates + keyword_candidates:
        if c not in merged:
            merged.append(c)
    extracted = merged[:8] if merged else ["La0.8Sr0.2MnO3", "La0.7Sr0.3CrO3", "MnCo2O4"]

    return {
        "query": query,
        "source": source,
        "total_papers": len(papers),
        "papers": papers[:6],
        "extracted_candidates": extracted,
        "extraction_method": "LLM + keyword matching" if llm_candidates else "keyword matching",
    }


async def tool_predict_properties(formulas: list) -> dict:
    results = batch_predict(formulas)
    successful = [r for r in results if "error" not in r]
    failed     = [r for r in results if "error" in r]
    return {
        "predictions": results,
        "successful": len(successful),
        "failed": len(failed),
        "model": "GBR surrogate (6-feature descriptor, 22-material training set)",
    }


async def tool_get_synthesis_route(formula: str) -> dict:
    # Fuzzy match the formula key first
    key = fuzzy_match(formula) if formula not in SYNTHESIS_ROUTES else formula
    if key and key in SYNTHESIS_ROUTES:
        return {"formula": key, "route": SYNTHESIS_ROUTES[key]}
    # Try exact match as fallback
    if formula in SYNTHESIS_ROUTES:
        return {"formula": formula, "route": SYNTHESIS_ROUTES[formula]}
    return {
        "formula": formula,
        "error": f"No synthesis route for '{formula}'.",
        "available": list(SYNTHESIS_ROUTES.keys()),
    }


async def tool_score_and_rank(candidates: list, targets: dict) -> dict:
    min_cond = targets.get("min_conductivity_S_m", 1e4)
    max_tec  = targets.get("max_tec_ppm_K", 12.0)
    min_temp = targets.get("min_temp_C", 500)

    predictions = batch_predict(candidates)
    scored = []
    for pred in predictions:
        if "error" in pred:
            continue
        cond = pred["electrical_conductivity"]["value"]
        tec  = pred["thermal_expansion_coefficient"]["value"]
        temp = pred["max_use_temperature"]["value"]

        s_cond = min(1.0, cond / (min_cond * 10))
        s_tec  = max(0.0, 1.0 - (tec - max_tec) / max_tec) if tec > max_tec else 1.0
        s_temp = min(1.0, temp / (min_temp * 1.5))
        total  = 0.40*s_cond + 0.35*s_tec + 0.25*s_temp

        reasons = []
        reasons.append(f"conductivity {cond:.0f} S/m {'✓' if cond>=min_cond else '✗'} (target ≥{min_cond:.0f})")
        reasons.append(f"TEC {tec:.1f} ppm/K {'✓' if tec<=max_tec else '✗'} (target ≤{max_tec})")
        reasons.append(f"max temp {temp:.0f}°C {'✓' if temp>=min_temp else '✗'} (target ≥{min_temp}°C)")

        scored.append({
            "formula": pred["formula"],
            "name": pred["name"],
            "score": round(total, 3),
            "conductivity_S_m": cond,
            "tec_ppm_K": tec,
            "max_temp_C": temp,
            "explanation": "; ".join(reasons),
            "recommendation": (
                "Recommended" if total >= 0.7 else
                "Marginal"    if total >= 0.5 else
                "Not recommended"
            ),
        })

    scored.sort(key=lambda x: x["score"], reverse=True)
    return {
        "targets": targets,
        "ranked_candidates": scored,
        "top_recommendation": scored[0]["formula"] if scored else None,
        "recommended_count":  sum(1 for s in scored if s["recommendation"]=="Recommended"),
    }


# ── Dispatcher ─────────────────────────────────────────────────────────────────
async def dispatch_tool(name: str, args: dict) -> dict:
    if name == "literature_search":    return await tool_literature_search(**args)
    if name == "predict_properties":   return await tool_predict_properties(**args)
    if name == "get_synthesis_route":  return await tool_get_synthesis_route(**args)
    if name == "score_and_rank":       return await tool_score_and_rank(**args)
    return {"error": f"Unknown tool: {name}"}
