"""
Pydantic models for request/response schemas
"""
from pydantic import BaseModel, Field
from typing import Optional, List
from datetime import datetime


# ============================================================================
# USERS & LOCATION
# ============================================================================

class LocationPoint(BaseModel):
    latitude: float
    longitude: float


class UserCreate(BaseModel):
    name: str
    location: LocationPoint
    contact_info: Optional[str] = None
    helper_skills: Optional[List[str]] = None
    helper_max_range: Optional[int] = None


class UserUpdate(BaseModel):
    name: Optional[str] = None
    location: Optional[LocationPoint] = None
    contact_info: Optional[str] = None
    helper_skills: Optional[List[str]] = None
    helper_max_range: Optional[int] = None


class UserResponse(BaseModel):
    id: int
    name: str
    location: LocationPoint
    contact_info: Optional[str]
    helper_skills: Optional[List[str]]
    helper_max_range: Optional[int]
    created_at: datetime


class LocationTrackingCreate(BaseModel):
    user_id: int
    location: LocationPoint


class LocationTrackingResponse(BaseModel):
    id: int
    user_id: int
    location: LocationPoint
    timestamp: datetime


# ============================================================================
# EMERGENCY HIERARCHY
# ============================================================================

class EmergencyCreate(BaseModel):
    name: str
    area: str
    description: Optional[str] = None
    type: str
    status: str = 'active'
    severity_level: Optional[str] = None


class EmergencyUpdate(BaseModel):
    name: Optional[str] = None
    area: Optional[str] = None
    description: Optional[str] = None
    type: Optional[str] = None
    status: Optional[str] = None
    severity_level: Optional[str] = None
    end_time: Optional[datetime] = None


class EmergencyResponse(BaseModel):
    id: int
    name: str
    area: str
    description: Optional[str]
    type: str
    status: str
    severity_level: Optional[str]
    start_time: datetime
    end_time: Optional[datetime]


class CaseGroupCreate(BaseModel):
    emergency_id: int
    description: Optional[str] = None
    group_status: str = 'open'


class CaseGroupUpdate(BaseModel):
    description: Optional[str] = None
    group_status: Optional[str] = None


class CaseGroupResponse(BaseModel):
    id: int
    emergency_id: int
    description: Optional[str]
    group_status: str
    created_at: datetime


class CaseCreate(BaseModel):
    caller_user_id: Optional[int] = None
    reported_by_user_id: Optional[int] = None
    case_group_id: Optional[int] = None
    location: LocationPoint
    description: Optional[str] = None
    raw_problem_description: Optional[str] = None
    people_count: Optional[int] = None
    mobility_status: Optional[str] = None
    vulnerability_factors: Optional[List[str]] = None
    urgency: str
    danger_level: str
    status: str = 'open'


class CaseUpdate(BaseModel):
    caller_user_id: Optional[int] = None
    reported_by_user_id: Optional[int] = None
    case_group_id: Optional[int] = None
    location: Optional[LocationPoint] = None
    description: Optional[str] = None
    raw_problem_description: Optional[str] = None
    people_count: Optional[int] = None
    mobility_status: Optional[str] = None
    vulnerability_factors: Optional[List[str]] = None
    urgency: Optional[str] = None
    danger_level: Optional[str] = None
    status: Optional[str] = None
    resolved_at: Optional[datetime] = None


class CaseResponse(BaseModel):
    id: int
    caller_user_id: Optional[int]
    reported_by_user_id: Optional[int]
    case_group_id: Optional[int]
    location: LocationPoint
    description: Optional[str]
    raw_problem_description: Optional[str]
    people_count: Optional[int]
    mobility_status: Optional[str]
    vulnerability_factors: Optional[List[str]]
    urgency: str
    danger_level: str
    status: str
    created_at: datetime
    resolved_at: Optional[datetime]


# ============================================================================
# COORDINATION & HISTORY
# ============================================================================

class AssignmentCreate(BaseModel):
    case_id: int
    helper_user_id: int


class AssignmentUpdate(BaseModel):
    completed_at: Optional[datetime] = None
    outcome: Optional[str] = None


class AssignmentResponse(BaseModel):
    id: int
    case_id: int
    helper_user_id: int
    assigned_at: datetime
    completed_at: Optional[datetime]
    outcome: Optional[str]


class UpdateCreate(BaseModel):
    emergency_id: Optional[int] = None
    case_group_id: Optional[int] = None
    case_id: Optional[int] = None
    assignment_id: Optional[int] = None
    update_source: str
    update_type: str
    update_text: Optional[str] = None


class UpdateResponse(BaseModel):
    id: int
    emergency_id: Optional[int]
    case_group_id: Optional[int]
    case_id: Optional[int]
    assignment_id: Optional[int]
    update_source: str
    update_type: str
    update_text: Optional[str]
    timestamp: datetime


class ResearchReportCreate(BaseModel):
    topic: str
    report: str


class ResearchReportResponse(BaseModel):
    id: int
    topic: str
    report: str
    created_at: datetime
