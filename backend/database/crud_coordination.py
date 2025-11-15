"""
CRUD operations for assignments, updates, and research_reports tables
"""
from typing import List, Optional
from .db import get_db_cursor
from .models import (
    AssignmentCreate, AssignmentUpdate, AssignmentResponse,
    UpdateCreate, UpdateResponse,
    ResearchReportCreate, ResearchReportResponse
)


# ============================================================================
# ASSIGNMENTS CRUD
# ============================================================================

def create_assignment(assignment: AssignmentCreate) -> AssignmentResponse:
    """Create a new assignment"""
    with get_db_cursor() as cursor:
        cursor.execute(
            """
            INSERT INTO assignments (case_id, helper_user_id)
            VALUES (%s, %s)
            RETURNING id, case_id, helper_user_id, assigned_at, completed_at, outcome
            """,
            (assignment.case_id, assignment.helper_user_id)
        )
        row = cursor.fetchone()
        return AssignmentResponse(**dict(row))


def get_assignment(assignment_id: int) -> Optional[AssignmentResponse]:
    """Get assignment by ID"""
    with get_db_cursor() as cursor:
        cursor.execute(
            """
            SELECT id, case_id, helper_user_id, assigned_at, completed_at, outcome
            FROM assignments WHERE id = %s
            """,
            (assignment_id,)
        )
        row = cursor.fetchone()
        if not row:
            return None
        return AssignmentResponse(**dict(row))


def get_assignments_by_case(case_id: int, skip: int = 0, limit: int = 100) -> List[AssignmentResponse]:
    """Get all assignments for a case"""
    with get_db_cursor() as cursor:
        cursor.execute(
            """
            SELECT id, case_id, helper_user_id, assigned_at, completed_at, outcome
            FROM assignments
            WHERE case_id = %s
            ORDER BY assigned_at DESC
            LIMIT %s OFFSET %s
            """,
            (case_id, limit, skip)
        )
        rows = cursor.fetchall()
        return [AssignmentResponse(**dict(row)) for row in rows]


def get_assignments_by_helper(helper_user_id: int, skip: int = 0, limit: int = 100) -> List[AssignmentResponse]:
    """Get all assignments for a helper"""
    with get_db_cursor() as cursor:
        cursor.execute(
            """
            SELECT id, case_id, helper_user_id, assigned_at, completed_at, outcome
            FROM assignments
            WHERE helper_user_id = %s
            ORDER BY assigned_at DESC
            LIMIT %s OFFSET %s
            """,
            (helper_user_id, limit, skip)
        )
        rows = cursor.fetchall()
        return [AssignmentResponse(**dict(row)) for row in rows]


def update_assignment(assignment_id: int, assignment: AssignmentUpdate) -> Optional[AssignmentResponse]:
    """Update assignment by ID"""
    update_fields = []
    params = []

    if assignment.completed_at is not None:
        update_fields.append("completed_at = %s")
        params.append(assignment.completed_at)
    if assignment.outcome is not None:
        update_fields.append("outcome = %s")
        params.append(assignment.outcome)

    if not update_fields:
        return get_assignment(assignment_id)

    params.append(assignment_id)
    query = f"""
        UPDATE assignments
        SET {', '.join(update_fields)}
        WHERE id = %s
        RETURNING id, case_id, helper_user_id, assigned_at, completed_at, outcome
    """

    with get_db_cursor() as cursor:
        cursor.execute(query, params)
        row = cursor.fetchone()
        if not row:
            return None
        return AssignmentResponse(**dict(row))


def delete_assignment(assignment_id: int) -> bool:
    """Delete assignment by ID"""
    with get_db_cursor() as cursor:
        cursor.execute("DELETE FROM assignments WHERE id = %s", (assignment_id,))
        return cursor.rowcount > 0


# ============================================================================
# UPDATES CRUD
# ============================================================================

def create_update(update: UpdateCreate) -> UpdateResponse:
    """Create a new update"""
    with get_db_cursor() as cursor:
        cursor.execute(
            """
            INSERT INTO updates (
                emergency_id, case_group_id, case_id, assignment_id,
                update_source, update_type, update_text
            )
            VALUES (%s, %s, %s, %s, %s, %s, %s)
            RETURNING id, emergency_id, case_group_id, case_id, assignment_id,
                      update_source, update_type, update_text, timestamp
            """,
            (
                update.emergency_id,
                update.case_group_id,
                update.case_id,
                update.assignment_id,
                update.update_source,
                update.update_type,
                update.update_text
            )
        )
        row = cursor.fetchone()
        return UpdateResponse(**dict(row))


def get_update(update_id: int) -> Optional[UpdateResponse]:
    """Get update by ID"""
    with get_db_cursor() as cursor:
        cursor.execute(
            """
            SELECT id, emergency_id, case_group_id, case_id, assignment_id,
                   update_source, update_type, update_text, timestamp
            FROM updates WHERE id = %s
            """,
            (update_id,)
        )
        row = cursor.fetchone()
        if not row:
            return None
        return UpdateResponse(**dict(row))


def get_updates_by_emergency(emergency_id: int, skip: int = 0, limit: int = 100) -> List[UpdateResponse]:
    """Get all updates for an emergency"""
    with get_db_cursor() as cursor:
        cursor.execute(
            """
            SELECT id, emergency_id, case_group_id, case_id, assignment_id,
                   update_source, update_type, update_text, timestamp
            FROM updates
            WHERE emergency_id = %s
            ORDER BY timestamp DESC
            LIMIT %s OFFSET %s
            """,
            (emergency_id, limit, skip)
        )
        rows = cursor.fetchall()
        return [UpdateResponse(**dict(row)) for row in rows]


def get_updates_by_case(case_id: int, skip: int = 0, limit: int = 100) -> List[UpdateResponse]:
    """Get all updates for a case"""
    with get_db_cursor() as cursor:
        cursor.execute(
            """
            SELECT id, emergency_id, case_group_id, case_id, assignment_id,
                   update_source, update_type, update_text, timestamp
            FROM updates
            WHERE case_id = %s
            ORDER BY timestamp DESC
            LIMIT %s OFFSET %s
            """,
            (case_id, limit, skip)
        )
        rows = cursor.fetchall()
        return [UpdateResponse(**dict(row)) for row in rows]


def delete_update(update_id: int) -> bool:
    """Delete update by ID"""
    with get_db_cursor() as cursor:
        cursor.execute("DELETE FROM updates WHERE id = %s", (update_id,))
        return cursor.rowcount > 0


# ============================================================================
# RESEARCH REPORTS CRUD
# ============================================================================

def create_research_report(report: ResearchReportCreate) -> ResearchReportResponse:
    """Create a new research report"""
    with get_db_cursor() as cursor:
        cursor.execute(
            """
            INSERT INTO research_reports (topic, report)
            VALUES (%s, %s)
            RETURNING id, topic, report, created_at
            """,
            (report.topic, report.report)
        )
        row = cursor.fetchone()
        return ResearchReportResponse(**dict(row))


def get_research_report(report_id: int) -> Optional[ResearchReportResponse]:
    """Get research report by ID"""
    with get_db_cursor() as cursor:
        cursor.execute(
            """
            SELECT id, topic, report, created_at
            FROM research_reports WHERE id = %s
            """,
            (report_id,)
        )
        row = cursor.fetchone()
        if not row:
            return None
        return ResearchReportResponse(**dict(row))


def get_research_reports(skip: int = 0, limit: int = 100) -> List[ResearchReportResponse]:
    """Get all research reports with pagination"""
    with get_db_cursor() as cursor:
        cursor.execute(
            """
            SELECT id, topic, report, created_at
            FROM research_reports
            ORDER BY created_at DESC
            LIMIT %s OFFSET %s
            """,
            (limit, skip)
        )
        rows = cursor.fetchall()
        return [ResearchReportResponse(**dict(row)) for row in rows]


def delete_research_report(report_id: int) -> bool:
    """Delete research report by ID"""
    with get_db_cursor() as cursor:
        cursor.execute("DELETE FROM research_reports WHERE id = %s", (report_id,))
        return cursor.rowcount > 0
