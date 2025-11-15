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

# IMPORTANT TO DEFINE THIS IN WORKING VERSION
workflow = StateGraph(AgentState)


def case_group_manager_agent(state: AgentState):
    case_id = state.get("case_id") or (state.get("case_context") or {}).get("id")
    if not case_id:
        return {"messages": [{"role": "assistant", "content": "No case ID provided."}]}
    # Call grouping tool
    grouping_result = agent_tools.process_case_grouping(case_id=case_id)
    if grouping_result.get("group_created"):
        msg = f"Case group {grouping_result['case_group_id']} created for cases: {grouping_result['cases']}."
    else:
        msg = f"No new group created. Nearby open cases: {grouping_result['cases_found']}."
    return {"messages": [{"role": "assistant", "content": msg}], "case_group_update": grouping_result}

# Register the node in your StateGraph setup
workflow.add_node("case_group_manager", case_group_manager_agent)

# Example: After new case is processed, coordinator routes to this new agent immediately
def coordinator(state: AgentState):
    last_message = state["messages"][-1]
    # Pretend "new case" logic triggers this route, tweak condition for your flow
    if "new case created" in last_message.get("content", ""):
        return "case_group_manager"
    # Your previous logic...
    else:
        return should_continue(state)

workflow.add_conditional_edges(
    "agent",
    coordinator,
    {"case_group_manager": "case_group_manager", "tools": "tools", END: END}
)
workflow.add_edge("case_group_manager", "agent")