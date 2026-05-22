"""
agent.py  —  ReAct agent using DeepSeek native function-calling API
"""
import json, os, httpx, asyncio
from tools import TOOL_DEFINITIONS, dispatch_tool

DEEPSEEK_API_KEY  = os.getenv("DEEPSEEK_API_KEY", "")
DEEPSEEK_BASE_URL = "https://api.deepseek.com/v1"
MODEL             = "deepseek-chat"

SYSTEM_PROMPT = """You are BohrLab, an autonomous materials discovery agent.

You have 4 tools. Use them in this exact order every time:
1. literature_search  — find candidate materials from papers
2. predict_properties — predict conductivity / TEC / max-temp for the candidates
3. score_and_rank     — rank candidates against the user targets
4. get_synthesis_route — get synthesis procedure for the top candidate

Rules:
- Call tools immediately; never just describe what you plan to do.
- Extract real material formulas from literature results (e.g. La0.8Sr0.2MnO3).
- After all 4 tools have run, write your conclusion starting with: FINAL_ANSWER:
"""

# ── DeepSeek tool schema ──────────────────────────────────────────────────────
DS_TOOLS = [
    {
        "type": "function",
        "function": {
            "name": t["name"],
            "description": t["description"],
            "parameters": t["parameters"],
        },
    }
    for t in TOOL_DEFINITIONS
]


async def call_deepseek(messages: list) -> dict:
    headers = {
        "Authorization": f"Bearer {DEEPSEEK_API_KEY}",
        "Content-Type": "application/json",
    }
    payload = {
        "model": MODEL,
        "messages": messages,
        "tools": DS_TOOLS,
        "tool_choice": "auto",
        "max_tokens": 1500,
        "temperature": 0.2,
    }
    async with httpx.AsyncClient(timeout=60.0) as client:
        resp = await client.post(
            f"{DEEPSEEK_BASE_URL}/chat/completions",
            headers=headers,
            json=payload,
        )
    resp.raise_for_status()
    return resp.json()["choices"][0]["message"]


async def run_agent(user_query: str, send_event):
    MAX_STEPS = 12
    messages = [
        {"role": "system", "content": SYSTEM_PROMPT},
        {"role": "user",   "content": user_query},
    ]

    await send_event("status", {"message": "Agent initialized, starting research...", "step": 0})

    for step in range(1, MAX_STEPS + 1):
        await send_event("status", {"message": f"Reasoning step {step}...", "step": step})

        try:
            msg = await call_deepseek(messages)
        except Exception as e:
            await send_event("error", {"message": str(e)})
            return

        content    = msg.get("content") or ""
        tool_calls = msg.get("tool_calls") or []

        # Append assistant turn
        assistant_turn = {"role": "assistant", "content": content}
        if tool_calls:
            assistant_turn["tool_calls"] = tool_calls
        messages.append(assistant_turn)

        # Show any reasoning text
        if content.strip():
            await send_event("thought", {"step": step, "content": content.strip()[:600]})

        # Final answer check
        if "FINAL_ANSWER:" in content:
            final = content.split("FINAL_ANSWER:", 1)[-1].strip()
            await send_event("final", {"content": final, "total_steps": step})
            return

        # Execute tool calls
        if tool_calls:
            for tc in tool_calls:
                fn        = tc.get("function", {})
                tool_name = fn.get("name", "")
                call_id   = tc.get("id", f"call_{step}")
                try:
                    tool_args = json.loads(fn.get("arguments", "{}"))
                except Exception:
                    tool_args = {}

                await send_event("action", {
                    "step": step, "tool": tool_name,
                    "args": tool_args, "reasoning": "",
                })

                try:
                    obs = await dispatch_tool(tool_name, tool_args)
                except Exception as e:
                    obs = {"error": str(e)}

                await send_event("observation", {
                    "step": step, "tool": tool_name, "result": obs,
                })

                messages.append({
                    "role": "tool",
                    "tool_call_id": call_id,
                    "content": json.dumps(obs, ensure_ascii=False),
                })
            continue

        # No tool call and no final answer — nudge
        messages.append({
            "role": "user",
            "content": (
                "Please call the next required tool now. "
                "If all 4 tools have been used, write FINAL_ANSWER: with your summary."
            ),
        })

    await send_event("error", {"message": "Reached maximum reasoning steps."})
    await send_event("final", {"content": "Research incomplete — please refine your query.", "total_steps": MAX_STEPS})
