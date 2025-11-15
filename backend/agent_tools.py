import requests
import json
from langchain_core.tools import tool
from pydantic import BaseModel, Field
from math import radians, sin, cos, asin, sqrt

# NEED TO BE STANDARDIZED, defined here for errors to disappear
MOCK_DB = {}
all_tools = []

# Assume MOCK_DB already exists and is up to date with open cases

class NewCaseInput(BaseModel):
    case_id: int = Field(description="The ID of the new case being checked/added.")

# Assumes location is saved as tuple of latitude, longitude

def haversine(lat1, lon1, lat2, lon2):
    # Returns distance in meters between two lat/lon points
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

# Add to all_tools
all_tools.append(process_case_grouping)