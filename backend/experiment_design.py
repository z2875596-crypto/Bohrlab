"""
experiment_design.py
AI-driven experiment plan generator using DeepSeek API.
Supports: synthesis, characterization, performance testing.
"""
import os, httpx, json

DEEPSEEK_API_KEY  = os.getenv("DEEPSEEK_API_KEY", "")
DEEPSEEK_BASE_URL = "https://api.deepseek.com/v1"

SYSTEM_PROMPT = """You are an expert materials scientist specializing in solid oxide fuel cell (SOFC) 
interconnect materials. Generate detailed, practical experiment plans for researchers.

Always respond with a JSON object (no markdown, no backticks) with this exact structure:
{
  "title": "Experiment title",
  "objective": "Clear scientific objective",
  "estimated_duration": "X days/weeks",
  "difficulty": "Low/Medium/High",
  "safety_notes": ["safety note 1", "safety note 2"],
  "equipment": [{"name": "equipment name", "purpose": "why needed"}],
  "reagents": [{"name": "chemical name", "amount": "quantity", "purity": "grade"}],
  "steps": [
    {
      "phase": "Phase name (e.g. Synthesis / Characterization / Testing)",
      "title": "Step title",
      "description": "Detailed description",
      "duration": "time estimate",
      "temperature": "temperature if relevant or null",
      "atmosphere": "atmosphere if relevant or null",
      "expected_outcome": "what to observe/measure"
    }
  ],
  "characterization_targets": [
    {"technique": "XRD/SEM/EIS etc", "purpose": "what to measure", "expected_result": "expected finding"}
  ],
  "success_criteria": ["criterion 1", "criterion 2"],
  "troubleshooting": [{"problem": "common issue", "solution": "how to fix"}],
  "references": ["key reference 1", "key reference 2"]
}"""


async def generate_experiment_plan(
    material: str,
    experiment_type: str,
    objectives: str,
    constraints: str = "",
) -> dict:
    """
    Generate a detailed experiment plan via DeepSeek.
    experiment_type: 'synthesis' | 'characterization' | 'performance'
    """
    type_context = {
        "synthesis": "Focus on powder synthesis, sintering conditions, phase purity verification.",
        "characterization": "Focus on structural (XRD, SEM, TEM), compositional (EDS, XPS), and microstructural analysis.",
        "performance": "Focus on electrical conductivity measurement (4-probe), TEC measurement (dilatometry), long-term stability testing.",
    }.get(experiment_type, "Cover synthesis, characterization, and performance testing comprehensively.")

    user_prompt = f"""Generate a detailed experiment plan for:
Material: {material}
Experiment type: {experiment_type}
Scientific objectives: {objectives}
Constraints/notes: {constraints if constraints else 'None'}

Context: {type_context}

The plan should be practical for a university materials science lab with standard equipment.
Respond ONLY with the JSON object, no other text."""

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
                        {"role": "system", "content": SYSTEM_PROMPT},
                        {"role": "user",   "content": user_prompt},
                    ],
                    "max_tokens": 2000,
                    "temperature": 0.3,
                },
            )
        data = resp.json()
        raw = data["choices"][0]["message"]["content"].strip()
        # Strip markdown fences if present
        raw = raw.replace("```json", "").replace("```", "").strip()
        plan = json.loads(raw)
        plan["material"]        = material
        plan["experiment_type"] = experiment_type
        return {"success": True, "plan": plan}
    except json.JSONDecodeError as e:
        return {"success": False, "error": f"JSON parse error: {e}", "raw": raw[:500]}
    except Exception as e:
        return {"success": False, "error": str(e)}
