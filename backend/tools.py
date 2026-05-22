"""
tools.py
Four science tools callable by the ReAct agent.
Each tool returns structured JSON so the LLM can reason over results.
"""
import httpx
import json
import re
import asyncio
from predictor import batch_predict, get_available_materials

# ---------------------------------------------------------------------------
# Curated synthesis routes for demo (in production: LLM-extracted from papers)
# ---------------------------------------------------------------------------
SYNTHESIS_ROUTES = {
    "La0.8Sr0.2MnO3": {
        "method": "Solid-state reaction",
        "precursors": ["La2O3 (99.9%)", "SrCO3 (99%)", "MnO2 (99%)"],
        "steps": [
            "Weigh precursors in stoichiometric ratio (La0.8Sr0.2MnO3)",
            "Ball-mill in ethanol for 12 h, dry at 80°C",
            "Calcine at 900°C for 4 h in air (ramp 3°C/min)",
            "Re-mill, press into pellets at 200 MPa",
            "Sinter at 1300°C for 6 h in air",
            "Slow cool at 1°C/min to avoid cracking",
        ],
        "atmosphere": "Air",
        "duration_h": 30,
        "difficulty": "Medium",
        "notes": "Sr doping level controls conductivity; x=0.2-0.3 optimal for SOFC.",
    },
    "La0.7Sr0.3CrO3": {
        "method": "Pechini sol-gel",
        "precursors": ["La(NO3)3·6H2O", "Sr(NO3)2", "Cr(NO3)3·9H2O", "Citric acid", "Ethylene glycol"],
        "steps": [
            "Dissolve nitrate salts in DI water (molar ratio La:Sr:Cr = 0.7:0.3:1)",
            "Add citric acid (metal:citric = 1:2) and ethylene glycol",
            "Stir at 80°C until gel forms (~4 h)",
            "Char at 300°C (exothermic, use fume hood)",
            "Calcine at 800°C for 3 h",
            "Sinter at 1400°C for 8 h in reducing (5% H2/Ar) then oxidizing atmosphere",
        ],
        "atmosphere": "Reducing → Oxidizing",
        "duration_h": 24,
        "difficulty": "Medium-High",
        "notes": "LSCr is Cr-containing; consider toxicity. Phase-pure synthesis requires careful atmosphere control.",
    },
    "MnCo2O4": {
        "method": "Coprecipitation",
        "precursors": ["Mn(NO3)2·4H2O", "Co(NO3)2·6H2O", "NaOH (precipitant)"],
        "steps": [
            "Dissolve Mn and Co nitrates (Mn:Co = 1:2) in DI water",
            "Slowly add 2M NaOH until pH=10, stir 2 h",
            "Filter, wash with DI water until neutral",
            "Dry at 120°C overnight",
            "Calcine at 700°C for 4 h in air",
            "Press and sinter at 1100°C for 6 h",
        ],
        "atmosphere": "Air",
        "duration_h": 18,
        "difficulty": "Low-Medium",
        "notes": "Spinel forms easily; good for coating applications on metallic interconnects.",
    },
    "La0.8Sr0.2Cr0.5Mn0.5O3": {
        "method": "Solid-state reaction",
        "precursors": ["La2O3", "SrCO3", "Cr2O3", "MnO2"],
        "steps": [
            "Mix precursors: La:Sr:Cr:Mn = 0.8:0.2:0.5:0.5",
            "Ball-mill 24 h, dry",
            "Pre-calcine at 800°C for 4 h",
            "Re-mill and press at 250 MPa",
            "Sinter at 1350°C for 8 h in wet H2 (fuel electrode side simulation)",
            "Anneal at 800°C in air for 2 h",
        ],
        "atmosphere": "Wet H2 / Air",
        "duration_h": 40,
        "difficulty": "High",
        "notes": "LSCM shows excellent redox stability; suitable for dual-atmosphere interconnects.",
    },
    "La2NiO4": {
        "method": "Pechini sol-gel",
        "precursors": ["La(NO3)3·6H2O", "Ni(NO3)2·6H2O", "Citric acid", "Ethylene glycol"],
        "steps": [
            "Dissolve La and Ni nitrates (La:Ni = 2:1)",
            "Add citric acid (molar ratio 2:1 vs metals)",
            "Heat to 80°C, stir until viscous gel (~6 h)",
            "Combust gel at 400°C",
            "Calcine at 900°C for 5 h in air",
            "Sinter at 1200°C for 6 h",
        ],
        "atmosphere": "Air",
        "duration_h": 25,
        "difficulty": "Medium",
        "notes": "K2NiF4-type structure; good mixed ionic-electronic conductivity.",
    },
}

TOOL_DEFINITIONS = [
    {
        "name": "literature_search",
        "description": "Search arXiv for recent papers on materials science topics. Returns titles, authors, abstracts, and extracted candidate materials.",
        "parameters": {
            "type": "object",
            "properties": {
                "query": {"type": "string", "description": "Search query string"},
                "max_results": {"type": "integer", "description": "Max papers to retrieve (default 8)"},
            },
            "required": ["query"],
        },
    },
    {
        "name": "predict_properties",
        "description": "Predict electrical conductivity, thermal expansion coefficient, and maximum use temperature for candidate materials using the surrogate ML model.",
        "parameters": {
            "type": "object",
            "properties": {
                "formulas": {
                    "type": "array",
                    "items": {"type": "string"},
                    "description": "List of material formulas to predict",
                }
            },
            "required": ["formulas"],
        },
    },
    {
        "name": "get_synthesis_route",
        "description": "Retrieve synthesis procedure, precursors, sintering conditions, and difficulty rating for a specific material.",
        "parameters": {
            "type": "object",
            "properties": {
                "formula": {"type": "string", "description": "Material formula"}
            },
            "required": ["formula"],
        },
    },
    {
        "name": "score_and_rank",
        "description": "Score and rank candidate materials against user-specified performance targets. Returns a ranked list with explanations.",
        "parameters": {
            "type": "object",
            "properties": {
                "candidates": {
                    "type": "array",
                    "items": {"type": "string"},
                    "description": "List of material formulas to rank",
                },
                "targets": {
                    "type": "object",
                    "description": "Performance targets: min_conductivity_S_m, max_tec_ppm_K, min_temp_C",
                },
            },
            "required": ["candidates", "targets"],
        },
    },
]


# ---------------------------------------------------------------------------
# Tool implementations
# ---------------------------------------------------------------------------

async def tool_literature_search(query: str, max_results: int = 8) -> dict:
    """Query arXiv API for materials science papers."""
    url = "https://export.arxiv.org/api/query"
    params = {
        "search_query": f"all:{query} AND cat:cond-mat",
        "max_results": max_results,
        "sortBy": "relevance",
        "sortOrder": "descending",
    }
    try:
        async with httpx.AsyncClient(timeout=15.0) as client:
            resp = await client.get(url, params=params)
        xml = resp.text

        # Simple regex extraction from Atom XML
        titles   = re.findall(r"<title>(.*?)</title>", xml, re.DOTALL)[1:]  # skip feed title
        summaries = re.findall(r"<summary>(.*?)</summary>", xml, re.DOTALL)
        links    = re.findall(r'<id>(http://arxiv\.org/abs/[^<]+)</id>', xml)

        papers = []
        known = get_available_materials()
        found_candidates = set()

        for i, (t, s, l) in enumerate(zip(titles, summaries, links)):
            title   = t.strip().replace("\n", " ")
            summary = s.strip().replace("\n", " ")[:300]
            # Naively look for known formulas mentioned in abstracts
            for mat in known:
                base = mat.split("(")[0].strip()
                if base in summary or base in title:
                    found_candidates.add(mat)
            papers.append({"title": title, "abstract": summary, "url": l.strip()})

        return {
            "query": query,
            "total_found": len(papers),
            "papers": papers[:6],
            "extracted_candidates": list(found_candidates) if found_candidates else [
                "La0.8Sr0.2MnO3", "La0.7Sr0.3CrO3", "MnCo2O4"
            ],
            "note": "Candidate extraction based on formula matching in abstracts.",
        }
    except Exception as e:
        # Fallback to curated results if arXiv unreachable
        return {
            "query": query,
            "total_found": 3,
            "papers": [
                {
                    "title": "High-temperature electrical properties of La1−xSrxMnO3 for SOFC interconnects",
                    "abstract": "We report electrical conductivity up to 1000°C for La0.8Sr0.2MnO3 perovskites. The TEC of 11.8 ppm/K is well-matched to YSZ electrolyte.",
                    "url": "https://arxiv.org/abs/example1",
                },
                {
                    "title": "Chromite-based perovskites as SOFC interconnect materials",
                    "abstract": "La0.7Sr0.3CrO3 demonstrates conductivity of 13,000 S/m at 800°C with excellent oxidation resistance.",
                    "url": "https://arxiv.org/abs/example2",
                },
                {
                    "title": "Spinel MnCo2O4 coating for ferritic steel interconnects",
                    "abstract": "MnCo2O4 spinel coatings reduce Cr poisoning and show 60,000 S/m at 800°C.",
                    "url": "https://arxiv.org/abs/example3",
                },
            ],
            "extracted_candidates": ["La0.8Sr0.2MnO3", "La0.7Sr0.3CrO3", "MnCo2O4", "La0.8Sr0.2Cr0.5Mn0.5O3"],
            "note": f"arXiv temporarily unavailable ({e}); showing curated results.",
        }


async def tool_predict_properties(formulas: list) -> dict:
    results = batch_predict(formulas)
    return {"predictions": results, "model": "GBR surrogate (6-feature descriptor)"}


async def tool_get_synthesis_route(formula: str) -> dict:
    if formula in SYNTHESIS_ROUTES:
        return {"formula": formula, "route": SYNTHESIS_ROUTES[formula]}
    return {
        "formula": formula,
        "error": f"No synthesis route available for '{formula}' in current database.",
        "suggestion": f"Available materials: {list(SYNTHESIS_ROUTES.keys())}",
    }


async def tool_score_and_rank(candidates: list, targets: dict) -> dict:
    min_cond  = targets.get("min_conductivity_S_m", 1e4)
    max_tec   = targets.get("max_tec_ppm_K", 12.0)
    min_temp  = targets.get("min_temp_C", 500)

    predictions = batch_predict(candidates)
    scored = []

    for pred in predictions:
        if "error" in pred:
            continue
        cond = pred["electrical_conductivity"]["value"]
        tec  = pred["thermal_expansion_coefficient"]["value"]
        temp = pred["max_use_temperature"]["value"]

        # Normalized scores [0, 1]
        s_cond = min(1.0, cond / (min_cond * 10))
        s_tec  = max(0.0, 1.0 - (tec - max_tec) / max_tec) if tec > max_tec else 1.0
        s_temp = min(1.0, temp / (min_temp * 1.5))

        # Weights: conductivity 40%, TEC 35%, temperature 25%
        total = 0.40 * s_cond + 0.35 * s_tec + 0.25 * s_temp
        explanation = []
        if cond >= min_cond:
            explanation.append(f"conductivity {cond:.0f} S/m meets target ({min_cond:.0f} S/m)")
        else:
            explanation.append(f"conductivity {cond:.0f} S/m below target ({min_cond:.0f} S/m)")
        if tec <= max_tec:
            explanation.append(f"TEC {tec:.1f} ppm/K within limit ({max_tec} ppm/K)")
        else:
            explanation.append(f"TEC {tec:.1f} ppm/K exceeds limit ({max_tec} ppm/K)")
        if temp >= min_temp:
            explanation.append(f"stable to {temp:.0f}°C, meets {min_temp}°C requirement")

        scored.append({
            "formula": pred["formula"],
            "name": pred["name"],
            "score": round(total, 3),
            "conductivity_S_m": cond,
            "tec_ppm_K": tec,
            "max_temp_C": temp,
            "explanation": "; ".join(explanation),
            "recommendation": "Recommended" if total >= 0.7 else ("Marginal" if total >= 0.5 else "Not recommended"),
        })

    scored.sort(key=lambda x: x["score"], reverse=True)
    return {
        "targets": targets,
        "ranked_candidates": scored,
        "top_recommendation": scored[0]["formula"] if scored else None,
    }


# ---------------------------------------------------------------------------
# Dispatcher
# ---------------------------------------------------------------------------
async def dispatch_tool(name: str, args: dict) -> dict:
    if name == "literature_search":
        return await tool_literature_search(**args)
    elif name == "predict_properties":
        return await tool_predict_properties(**args)
    elif name == "get_synthesis_route":
        return await tool_get_synthesis_route(**args)
    elif name == "score_and_rank":
        return await tool_score_and_rank(**args)
    else:
        return {"error": f"Unknown tool: {name}"}
