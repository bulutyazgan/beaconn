import json
from typing import Literal

from langgraph.graph import StateGraph, END
from langgraph.prebuilt import ToolNode

# --- 1. Import from our other files ---
from main import get_api_session, API_ENDPOINT, MODELS, TEAM_ID, API_TOKEN
from agent_state import AgentState
import agent_tools

api_client = get_api_session()
model_id = MODELS["recommended"]

workflow = StateGraph(AgentState)


from agent_state import AgentState
from main import get_api_session, API_ENDPOINT, MODELS, TEAM_ID, API_TOKEN

api_client = get_api_session()
model_id = MODELS["recommended"]

def intake_agent(state: AgentState):
    """
    Intake agent: turns raw user text + GPS into a structured case object.
    Does NOT write to DB; only populates state['case_context'] with the extracted fields.
    """
    print("--- NODE: intake_agent ---")
    messages = state["messages"]
    last_user_msg = None
    for m in reversed(messages):
        if m.get("role") == "user":
            last_user_msg = m.get("content")
            break

    latitude = state.get("latitude")
    longitude = state.get("longitude")
    caller_user_id = state.get("caller_user_id")

    if last_user_msg is None or latitude is None or longitude is None:
        # Minimal safety: if anything key is missing, just echo back
        content = "Could not extract case: missing text or location."
        return {
            "messages": [{"role": "assistant", "content": content}],
            "case_context": None,
        }

    # System prompt describing the schema we want
    system_prompt = (
        "You are an emergency intake agent. Your job is to read a user's free-text "
        "message describing an emergency and infer as much structured information as possible. "
        "Always return JSON strictly matching this Python dict schema:\n\n"
        "{\n"
        '  "caller_user_id": int | null,\n'
        '  "reported_by_user_id": int | null,\n'
        '  "case_group_id": null,\n'
        '  "location": [lat: float, lon: float],\n'
        '  "description": str,\n'
        '  "people_count": int | null,\n'
        '  "mobility_status": "mobile" | "injured" | "trapped" | null,\n'
        '  "vulnerability_factors": list of '
        '["elderly","children_present","medical_needs","disability","pregnant"],\n'
        '  "urgency": "low" | "medium" | "high" | "critical",\n'
        '  "danger_level": "safe" | "moderate" | "severe" | "life_threatening"\n'
        "}\n\n"
        "Always make a best guess. If unsure, use null for optional fields, "
        'urgency = "high", and danger_level = "severe". '
        "Do not include any extra keys or text outside the JSON."
    )

    body = {
        "team_id": TEAM_ID,
        "api_token": API_TOKEN,
        "model": model_id,
        "messages": [
            {"role": "system", "content": system_prompt},
            {
                "role": "user",
                "content": (
                    f"User text: {last_user_msg}\n"
                    f"Latitude: {latitude}\n"
                    f"Longitude: {longitude}\n"
                    f"Caller user id: {caller_user_id}"
                ),
            },
        ],
        "max_tokens": 512,
        # No tools here; pure structured generation
    }

    response = api_client.post(API_ENDPOINT, json=body)
    response.raise_for_status()
    result = response.json()

    # Depending on Holistic response format; assuming first content item is JSON text
    raw_content = result.get("content", [])[0].get("text", "{}")
    try:
        case_obj = json.loads(raw_content)
    except Exception:
        # Fallback: minimum viable case
        case_obj = {
            "caller_user_id": caller_user_id,
            "reported_by_user_id": caller_user_id,
            "case_group_id": None,
            "location": [latitude, longitude],
            "description": last_user_msg,
            "people_count": None,
            "mobility_status": None,
            "vulnerability_factors": [],
            "urgency": "high",
            "danger_level": "severe",
        }

    confirmation_msg = (
        f"Created structured case object at location ({latitude}, {longitude}). "
        f"Urgency: {case_obj.get('urgency')}, danger_level: {case_obj.get('danger_level')}."
    )

    return {
        "messages": [{"role": "assistant", "content": confirmation_msg}],
        "case_context": case_obj,
    }

workflow.add_node("intake_agent", intake_agent)

# Example: make intake_agent the entry point for the “new help call” flow
workflow.set_entry_point("intake_agent")

# Or have your main coordinator route to it when a new call arrives.