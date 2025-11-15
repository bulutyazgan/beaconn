import requests
import json
from pydantic import BaseModel, Field
from typing import List, Optional, Literal, Dict, Any
from langchain_core.tools import tool
from math import radians, sin, cos, asin, sqrt

# NEED TO BE STANDARDIZED, defined here for errors to disappear
MOCK_DB = {}

# --- Case Extraction Models and Tool (from InputProcessingAgent) ---

class CaseExtractionResult(BaseModel):
    caller_user_id: Optional[int] = Field(
        description="ID of the caller user if known, otherwise null."
    )
    reported_by_user_id: Optional[int] = Field(
        description="ID of the user who reported the case. For now, same as caller_user_id if known, otherwise null."
    )
    case_group_id: Optional[int] = Field(
        description="Case group id if already known. Use null for new cases; grouping will be done later."
    )
    location: tuple = Field(
        description="Exact coordinates of the incident as a (lat, lon) tuple."
    )
    description: str = Field(
        description="Short free-text description of the situation, cleaned but preserving key details."
    )
    people_count: Optional[int] = Field(
        description="Number of people affected if it can be inferred; otherwise null."
    )
    mobility_status: Optional[Literal["mobile", "injured", "trapped"]] = Field(
        description="Mobility of the people affected. Choose the best guess."
    )
    vulnerability_factors: List[
        Literal["elderly", "children_present", "medical_needs", "disability", "pregnant"]
    ] = Field(
        default_factory=list,
        description="List of vulnerability factors mentioned or strongly implied, can be empty."
    )
    urgency: Literal["low", "medium", "high", "critical"] = Field(
        description="How soon help is needed, best guess based on the message."
    )
    danger_level: Literal["safe", "moderate", "severe", "life_threatening"] = Field(
        description="Risk to the victim(s) at the current moment, best guess even if uncertain."
    )

class CaseExtractionInput(BaseModel):
    user_text: str = Field(
        description="Raw free-text message from the user describing their situation."
    )
    latitude: float = Field(
        description="Latitude from GPS."
    )
    longitude: float = Field(
        description="Longitude from GPS."
    )
    caller_user_id: Optional[int] = Field(
        default=None,
        description="ID of the logged-in caller user, or null for anonymous."
    )

@tool(args_schema=CaseExtractionInput)
def extract_case_from_text(
    user_text: str,
    latitude: float,
    longitude: float,
    caller_user_id: Optional[int] = None,
) -> Dict[str, Any]:
    """
    Extracts a structured case object from raw user text and GPS coordinates.
    Always returns a best-effort guess for urgency and danger_level.
    Does NOT write to the database; it only returns structured data that can be inserted as a new case.
    """
    # For now, this is a placeholder that just wraps the data in the expected format.
    # The LLM agent will be responsible for filling in better guesses later, or you
    # can later replace this body with rule-based heuristics.
    result = CaseExtractionResult(
        caller_user_id=caller_user_id,
        reported_by_user_id=caller_user_id,
        case_group_id=None,
        location=(latitude, longitude),
        description=user_text.strip(),
        people_count=None,  # best guess to be filled by LLM/agent later
        mobility_status=None,
        vulnerability_factors=[],
        urgency="high",              # sensible default for safety
        danger_level="severe",       # sensible default for safety
    )
    return result.dict()

# --- Case Grouping Models and Tool (from groupingAgents) ---

class NewCaseInput(BaseModel):
    case_id: int = Field(description="The ID of the new case being checked/added.")

def haversine(lat1, lon1, lat2, lon2):
    """Returns distance in meters between two lat/lon points"""
    R = 6371000
    lat1, lon1, lat2, lon2 = map(radians, [lat1, lon1, lat2, lon2])
    dlat = lat2 - lat1
    dlon = lon2 - lon1
    a = sin(dlat/2)**2 + cos(lat1)*cos(lat2)*sin(dlon/2)**2
    c = 2*asin(sqrt(a))
    return R * c

@tool(args_schema=NewCaseInput)
def process_case_grouping(case_id: int) -> dict:
    """
    Determines if the new case should be added to an existing group or create a new group based on location proximity.
    """
    # Retrieve new case info
    new_case = MOCK_DB["cases"].get(str(case_id))
    if not new_case:
        return {"error": "Case not found."}
    if new_case.get("status") != "open":
        return {"error": "Case not open."}
    lat1, lon1 = eval(new_case["location"])
    # Find all other open cases, excluding this one
    open_cases = [
        v for k, v in MOCK_DB["cases"].items()
        if v.get("status") == "open" and int(k) != case_id
    ]
    # Proximity filter
    nearby_cases = []
    for v in open_cases:
        lat2, lon2 = eval(v["location"])
        if haversine(lat1, lon1, lat2, lon2) <= 500:
            nearby_cases.append(int(v["id"]))
    # Only make group if >=2 others found (3+ total)
    if len(nearby_cases) + 1 >= 3:
        # Create group id
        group_id = max([int(x) for x in MOCK_DB.get("case_groups", {}).keys()] or [0]) + 1
        case_ids = [case_id] + nearby_cases
        if "case_groups" not in MOCK_DB:
            MOCK_DB["case_groups"] = {}
        MOCK_DB["case_groups"][str(group_id)] = {"case_ids": case_ids, "description": "Proximity group"}
        # Assign group id to all involved cases
        for cid in case_ids:
            MOCK_DB["cases"][str(cid)]["case_group_id"] = group_id
        return {"group_created": True, "case_group_id": group_id, "cases": case_ids}
    else:
        return {"group_created": False, "cases_found": [case_id] + nearby_cases}

# --- All Tools List ---
all_tools = [extract_case_from_text, process_case_grouping]
