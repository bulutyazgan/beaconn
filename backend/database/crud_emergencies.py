"""
CRUD operations for emergencies, case_groups, and cases tables
"""
from typing import List, Optional
from .db import get_db_cursor
from .models import (
    EmergencyCreate, EmergencyUpdate, EmergencyResponse,
    CaseGroupCreate, CaseGroupUpdate, CaseGroupResponse,
    CaseCreate, CaseUpdate, CaseResponse, LocationPoint
)


def _parse_point(point_str: str) -> LocationPoint:
    """Parse PostgreSQL POINT format '(lat,lng)' to LocationPoint"""
    if not point_str:
        return None
    coords = point_str.strip('()').split(',')
    return LocationPoint(latitude=float(coords[0]), longitude=float(coords[1]))


def _format_point(location: LocationPoint) -> str:
    """Format LocationPoint to PostgreSQL POINT format"""
    return f"({location.latitude},{location.longitude})"


# ============================================================================
# EMERGENCIES CRUD
# ============================================================================

def create_emergency(emergency: EmergencyCreate) -> EmergencyResponse:
    """Create a new emergency"""
    with get_db_cursor() as cursor:
        cursor.execute(
            """
            INSERT INTO emergencies (name, area, description, type, status, severity_level)
            VALUES (%s, %s, %s, %s, %s, %s)
            RETURNING id, name, area, description, type, status, severity_level, start_time, end_time
            """,
            (
                emergency.name,
                emergency.area,
                emergency.description,
                emergency.type,
                emergency.status,
                emergency.severity_level
            )
        )
        row = cursor.fetchone()
        return EmergencyResponse(**dict(row))


def get_emergency(emergency_id: int) -> Optional[EmergencyResponse]:
    """Get emergency by ID"""
    with get_db_cursor() as cursor:
        cursor.execute(
            """
            SELECT id, name, area, description, type, status, severity_level, start_time, end_time
            FROM emergencies WHERE id = %s
            """,
            (emergency_id,)
        )
        row = cursor.fetchone()
        if not row:
            return None
        return EmergencyResponse(**dict(row))


def get_emergencies(skip: int = 0, limit: int = 100) -> List[EmergencyResponse]:
    """Get all emergencies with pagination"""
    with get_db_cursor() as cursor:
        cursor.execute(
            """
            SELECT id, name, area, description, type, status, severity_level, start_time, end_time
            FROM emergencies
            ORDER BY start_time DESC
            LIMIT %s OFFSET %s
            """,
            (limit, skip)
        )
        rows = cursor.fetchall()
        return [EmergencyResponse(**dict(row)) for row in rows]


def update_emergency(emergency_id: int, emergency: EmergencyUpdate) -> Optional[EmergencyResponse]:
    """Update emergency by ID"""
    update_fields = []
    params = []

    if emergency.name is not None:
        update_fields.append("name = %s")
        params.append(emergency.name)
    if emergency.area is not None:
        update_fields.append("area = %s")
        params.append(emergency.area)
    if emergency.description is not None:
        update_fields.append("description = %s")
        params.append(emergency.description)
    if emergency.type is not None:
        update_fields.append("type = %s")
        params.append(emergency.type)
    if emergency.status is not None:
        update_fields.append("status = %s")
        params.append(emergency.status)
    if emergency.severity_level is not None:
        update_fields.append("severity_level = %s")
        params.append(emergency.severity_level)
    if emergency.end_time is not None:
        update_fields.append("end_time = %s")
        params.append(emergency.end_time)

    if not update_fields:
        return get_emergency(emergency_id)

    params.append(emergency_id)
    query = f"""
        UPDATE emergencies
        SET {', '.join(update_fields)}
        WHERE id = %s
        RETURNING id, name, area, description, type, status, severity_level, start_time, end_time
    """

    with get_db_cursor() as cursor:
        cursor.execute(query, params)
        row = cursor.fetchone()
        if not row:
            return None
        return EmergencyResponse(**dict(row))


def delete_emergency(emergency_id: int) -> bool:
    """Delete emergency by ID"""
    with get_db_cursor() as cursor:
        cursor.execute("DELETE FROM emergencies WHERE id = %s", (emergency_id,))
        return cursor.rowcount > 0


# ============================================================================
# CASE GROUPS CRUD
# ============================================================================

def create_case_group(case_group: CaseGroupCreate) -> CaseGroupResponse:
    """Create a new case group"""
    with get_db_cursor() as cursor:
        cursor.execute(
            """
            INSERT INTO case_groups (emergency_id, description, group_status)
            VALUES (%s, %s, %s)
            RETURNING id, emergency_id, description, group_status, created_at
            """,
            (case_group.emergency_id, case_group.description, case_group.group_status)
        )
        row = cursor.fetchone()
        return CaseGroupResponse(**dict(row))


def get_case_group(case_group_id: int) -> Optional[CaseGroupResponse]:
    """Get case group by ID"""
    with get_db_cursor() as cursor:
        cursor.execute(
            """
            SELECT id, emergency_id, description, group_status, created_at
            FROM case_groups WHERE id = %s
            """,
            (case_group_id,)
        )
        row = cursor.fetchone()
        if not row:
            return None
        return CaseGroupResponse(**dict(row))


def get_case_groups_by_emergency(emergency_id: int, skip: int = 0, limit: int = 100) -> List[CaseGroupResponse]:
    """Get all case groups for an emergency"""
    with get_db_cursor() as cursor:
        cursor.execute(
            """
            SELECT id, emergency_id, description, group_status, created_at
            FROM case_groups
            WHERE emergency_id = %s
            ORDER BY created_at DESC
            LIMIT %s OFFSET %s
            """,
            (emergency_id, limit, skip)
        )
        rows = cursor.fetchall()
        return [CaseGroupResponse(**dict(row)) for row in rows]


def update_case_group(case_group_id: int, case_group: CaseGroupUpdate) -> Optional[CaseGroupResponse]:
    """Update case group by ID"""
    update_fields = []
    params = []

    if case_group.description is not None:
        update_fields.append("description = %s")
        params.append(case_group.description)
    if case_group.group_status is not None:
        update_fields.append("group_status = %s")
        params.append(case_group.group_status)

    if not update_fields:
        return get_case_group(case_group_id)

    params.append(case_group_id)
    query = f"""
        UPDATE case_groups
        SET {', '.join(update_fields)}
        WHERE id = %s
        RETURNING id, emergency_id, description, group_status, created_at
    """

    with get_db_cursor() as cursor:
        cursor.execute(query, params)
        row = cursor.fetchone()
        if not row:
            return None
        return CaseGroupResponse(**dict(row))


def delete_case_group(case_group_id: int) -> bool:
    """Delete case group by ID"""
    with get_db_cursor() as cursor:
        cursor.execute("DELETE FROM case_groups WHERE id = %s", (case_group_id,))
        return cursor.rowcount > 0


# ============================================================================
# CASES CRUD
# ============================================================================

def create_case(case: CaseCreate) -> CaseResponse:
    """Create a new case"""
    with get_db_cursor() as cursor:
        cursor.execute(
            """
            INSERT INTO cases (
                caller_user_id, reported_by_user_id, case_group_id, location,
                description, raw_problem_description, people_count, mobility_status,
                vulnerability_factors, urgency, danger_level, status
            )
            VALUES (%s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s)
            RETURNING id, caller_user_id, reported_by_user_id, case_group_id, location,
                      description, raw_problem_description, people_count, mobility_status,
                      vulnerability_factors, urgency, danger_level, status, created_at, resolved_at
            """,
            (
                case.caller_user_id,
                case.reported_by_user_id,
                case.case_group_id,
                _format_point(case.location),
                case.description,
                case.raw_problem_description,
                case.people_count,
                case.mobility_status,
                case.vulnerability_factors,
                case.urgency,
                case.danger_level,
                case.status
            )
        )
        row = cursor.fetchone()
        return CaseResponse(
            id=row['id'],
            caller_user_id=row['caller_user_id'],
            reported_by_user_id=row['reported_by_user_id'],
            case_group_id=row['case_group_id'],
            location=_parse_point(row['location']),
            description=row['description'],
            raw_problem_description=row['raw_problem_description'],
            people_count=row['people_count'],
            mobility_status=row['mobility_status'],
            vulnerability_factors=row['vulnerability_factors'],
            urgency=row['urgency'],
            danger_level=row['danger_level'],
            status=row['status'],
            created_at=row['created_at'],
            resolved_at=row['resolved_at']
        )


def get_case(case_id: int) -> Optional[CaseResponse]:
    """Get case by ID"""
    with get_db_cursor() as cursor:
        cursor.execute(
            """
            SELECT id, caller_user_id, reported_by_user_id, case_group_id, location,
                   description, raw_problem_description, people_count, mobility_status,
                   vulnerability_factors, urgency, danger_level, status, created_at, resolved_at
            FROM cases WHERE id = %s
            """,
            (case_id,)
        )
        row = cursor.fetchone()
        if not row:
            return None
        return CaseResponse(
            id=row['id'],
            caller_user_id=row['caller_user_id'],
            reported_by_user_id=row['reported_by_user_id'],
            case_group_id=row['case_group_id'],
            location=_parse_point(row['location']),
            description=row['description'],
            raw_problem_description=row['raw_problem_description'],
            people_count=row['people_count'],
            mobility_status=row['mobility_status'],
            vulnerability_factors=row['vulnerability_factors'],
            urgency=row['urgency'],
            danger_level=row['danger_level'],
            status=row['status'],
            created_at=row['created_at'],
            resolved_at=row['resolved_at']
        )


def get_cases(skip: int = 0, limit: int = 100) -> List[CaseResponse]:
    """Get all cases with pagination"""
    with get_db_cursor() as cursor:
        cursor.execute(
            """
            SELECT id, caller_user_id, reported_by_user_id, case_group_id, location,
                   description, raw_problem_description, people_count, mobility_status,
                   vulnerability_factors, urgency, danger_level, status, created_at, resolved_at
            FROM cases
            ORDER BY created_at DESC
            LIMIT %s OFFSET %s
            """,
            (limit, skip)
        )
        rows = cursor.fetchall()
        return [
            CaseResponse(
                id=row['id'],
                caller_user_id=row['caller_user_id'],
                reported_by_user_id=row['reported_by_user_id'],
                case_group_id=row['case_group_id'],
                location=_parse_point(row['location']),
                description=row['description'],
                raw_problem_description=row['raw_problem_description'],
                people_count=row['people_count'],
                mobility_status=row['mobility_status'],
                vulnerability_factors=row['vulnerability_factors'],
                urgency=row['urgency'],
                danger_level=row['danger_level'],
                status=row['status'],
                created_at=row['created_at'],
                resolved_at=row['resolved_at']
            )
            for row in rows
        ]


def update_case(case_id: int, case: CaseUpdate) -> Optional[CaseResponse]:
    """Update case by ID"""
    update_fields = []
    params = []

    if case.caller_user_id is not None:
        update_fields.append("caller_user_id = %s")
        params.append(case.caller_user_id)
    if case.reported_by_user_id is not None:
        update_fields.append("reported_by_user_id = %s")
        params.append(case.reported_by_user_id)
    if case.case_group_id is not None:
        update_fields.append("case_group_id = %s")
        params.append(case.case_group_id)
    if case.location is not None:
        update_fields.append("location = %s")
        params.append(_format_point(case.location))
    if case.description is not None:
        update_fields.append("description = %s")
        params.append(case.description)
    if case.raw_problem_description is not None:
        update_fields.append("raw_problem_description = %s")
        params.append(case.raw_problem_description)
    if case.people_count is not None:
        update_fields.append("people_count = %s")
        params.append(case.people_count)
    if case.mobility_status is not None:
        update_fields.append("mobility_status = %s")
        params.append(case.mobility_status)
    if case.vulnerability_factors is not None:
        update_fields.append("vulnerability_factors = %s")
        params.append(case.vulnerability_factors)
    if case.urgency is not None:
        update_fields.append("urgency = %s")
        params.append(case.urgency)
    if case.danger_level is not None:
        update_fields.append("danger_level = %s")
        params.append(case.danger_level)
    if case.status is not None:
        update_fields.append("status = %s")
        params.append(case.status)
    if case.resolved_at is not None:
        update_fields.append("resolved_at = %s")
        params.append(case.resolved_at)

    if not update_fields:
        return get_case(case_id)

    params.append(case_id)
    query = f"""
        UPDATE cases
        SET {', '.join(update_fields)}
        WHERE id = %s
        RETURNING id, caller_user_id, reported_by_user_id, case_group_id, location,
                  description, raw_problem_description, people_count, mobility_status,
                  vulnerability_factors, urgency, danger_level, status, created_at, resolved_at
    """

    with get_db_cursor() as cursor:
        cursor.execute(query, params)
        row = cursor.fetchone()
        if not row:
            return None
        return CaseResponse(
            id=row['id'],
            caller_user_id=row['caller_user_id'],
            reported_by_user_id=row['reported_by_user_id'],
            case_group_id=row['case_group_id'],
            location=_parse_point(row['location']),
            description=row['description'],
            raw_problem_description=row['raw_problem_description'],
            people_count=row['people_count'],
            mobility_status=row['mobility_status'],
            vulnerability_factors=row['vulnerability_factors'],
            urgency=row['urgency'],
            danger_level=row['danger_level'],
            status=row['status'],
            created_at=row['created_at'],
            resolved_at=row['resolved_at']
        )


def delete_case(case_id: int) -> bool:
    """Delete case by ID"""
    with get_db_cursor() as cursor:
        cursor.execute("DELETE FROM cases WHERE id = %s", (case_id,))
        return cursor.rowcount > 0
