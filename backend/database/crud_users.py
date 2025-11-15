"""
CRUD operations for users and location_tracking tables
"""
from typing import List, Optional
from .db import get_db_cursor
from .models import UserCreate, UserUpdate, UserResponse, LocationTrackingCreate, LocationTrackingResponse, LocationPoint


def _parse_point(point_str: str) -> LocationPoint:
    """Parse PostgreSQL POINT format '(lat,lng)' to LocationPoint"""
    if not point_str:
        return None
    # Remove parentheses and split
    coords = point_str.strip('()').split(',')
    return LocationPoint(latitude=float(coords[0]), longitude=float(coords[1]))


def _format_point(location: LocationPoint) -> str:
    """Format LocationPoint to PostgreSQL POINT format"""
    return f"({location.latitude},{location.longitude})"


# ============================================================================
# USERS CRUD
# ============================================================================

def create_user(user: UserCreate) -> UserResponse:
    """Create a new user"""
    with get_db_cursor() as cursor:
        cursor.execute(
            """
            INSERT INTO users (name, location, contact_info, helper_skills, helper_max_range)
            VALUES (%s, %s, %s, %s, %s)
            RETURNING id, name, location, contact_info, helper_skills, helper_max_range, created_at
            """,
            (
                user.name,
                _format_point(user.location),
                user.contact_info,
                user.helper_skills,
                user.helper_max_range
            )
        )
        row = cursor.fetchone()
        return UserResponse(
            id=row['id'],
            name=row['name'],
            location=_parse_point(row['location']),
            contact_info=row['contact_info'],
            helper_skills=row['helper_skills'],
            helper_max_range=row['helper_max_range'],
            created_at=row['created_at']
        )


def get_user(user_id: int) -> Optional[UserResponse]:
    """Get user by ID"""
    with get_db_cursor() as cursor:
        cursor.execute(
            """
            SELECT id, name, location, contact_info, helper_skills, helper_max_range, created_at
            FROM users WHERE id = %s
            """,
            (user_id,)
        )
        row = cursor.fetchone()
        if not row:
            return None
        return UserResponse(
            id=row['id'],
            name=row['name'],
            location=_parse_point(row['location']),
            contact_info=row['contact_info'],
            helper_skills=row['helper_skills'],
            helper_max_range=row['helper_max_range'],
            created_at=row['created_at']
        )


def get_users(skip: int = 0, limit: int = 100) -> List[UserResponse]:
    """Get all users with pagination"""
    with get_db_cursor() as cursor:
        cursor.execute(
            """
            SELECT id, name, location, contact_info, helper_skills, helper_max_range, created_at
            FROM users
            ORDER BY id
            LIMIT %s OFFSET %s
            """,
            (limit, skip)
        )
        rows = cursor.fetchall()
        return [
            UserResponse(
                id=row['id'],
                name=row['name'],
                location=_parse_point(row['location']),
                contact_info=row['contact_info'],
                helper_skills=row['helper_skills'],
                helper_max_range=row['helper_max_range'],
                created_at=row['created_at']
            )
            for row in rows
        ]


def update_user(user_id: int, user: UserUpdate) -> Optional[UserResponse]:
    """Update user by ID"""
    # Build dynamic update query
    update_fields = []
    params = []

    if user.name is not None:
        update_fields.append("name = %s")
        params.append(user.name)
    if user.location is not None:
        update_fields.append("location = %s")
        params.append(_format_point(user.location))
    if user.contact_info is not None:
        update_fields.append("contact_info = %s")
        params.append(user.contact_info)
    if user.helper_skills is not None:
        update_fields.append("helper_skills = %s")
        params.append(user.helper_skills)
    if user.helper_max_range is not None:
        update_fields.append("helper_max_range = %s")
        params.append(user.helper_max_range)

    if not update_fields:
        return get_user(user_id)

    params.append(user_id)
    query = f"""
        UPDATE users
        SET {', '.join(update_fields)}
        WHERE id = %s
        RETURNING id, name, location, contact_info, helper_skills, helper_max_range, created_at
    """

    with get_db_cursor() as cursor:
        cursor.execute(query, params)
        row = cursor.fetchone()
        if not row:
            return None
        return UserResponse(
            id=row['id'],
            name=row['name'],
            location=_parse_point(row['location']),
            contact_info=row['contact_info'],
            helper_skills=row['helper_skills'],
            helper_max_range=row['helper_max_range'],
            created_at=row['created_at']
        )


def delete_user(user_id: int) -> bool:
    """Delete user by ID"""
    with get_db_cursor() as cursor:
        cursor.execute("DELETE FROM users WHERE id = %s", (user_id,))
        return cursor.rowcount > 0


# ============================================================================
# LOCATION TRACKING CRUD
# ============================================================================

def create_location_tracking(tracking: LocationTrackingCreate) -> LocationTrackingResponse:
    """Create a new location tracking entry"""
    with get_db_cursor() as cursor:
        cursor.execute(
            """
            INSERT INTO location_tracking (user_id, location)
            VALUES (%s, %s)
            RETURNING id, user_id, location, timestamp
            """,
            (tracking.user_id, _format_point(tracking.location))
        )
        row = cursor.fetchone()
        return LocationTrackingResponse(
            id=row['id'],
            user_id=row['user_id'],
            location=_parse_point(row['location']),
            timestamp=row['timestamp']
        )


def get_location_tracking(tracking_id: int) -> Optional[LocationTrackingResponse]:
    """Get location tracking entry by ID"""
    with get_db_cursor() as cursor:
        cursor.execute(
            """
            SELECT id, user_id, location, timestamp
            FROM location_tracking WHERE id = %s
            """,
            (tracking_id,)
        )
        row = cursor.fetchone()
        if not row:
            return None
        return LocationTrackingResponse(
            id=row['id'],
            user_id=row['user_id'],
            location=_parse_point(row['location']),
            timestamp=row['timestamp']
        )


def get_location_tracking_by_user(user_id: int, skip: int = 0, limit: int = 100) -> List[LocationTrackingResponse]:
    """Get all location tracking entries for a user"""
    with get_db_cursor() as cursor:
        cursor.execute(
            """
            SELECT id, user_id, location, timestamp
            FROM location_tracking
            WHERE user_id = %s
            ORDER BY timestamp DESC
            LIMIT %s OFFSET %s
            """,
            (user_id, limit, skip)
        )
        rows = cursor.fetchall()
        return [
            LocationTrackingResponse(
                id=row['id'],
                user_id=row['user_id'],
                location=_parse_point(row['location']),
                timestamp=row['timestamp']
            )
            for row in rows
        ]


def delete_location_tracking(tracking_id: int) -> bool:
    """Delete location tracking entry by ID"""
    with get_db_cursor() as cursor:
        cursor.execute("DELETE FROM location_tracking WHERE id = %s", (tracking_id,))
        return cursor.rowcount > 0
