# Beacon Emergency Response API

Complete FastAPI implementation with CRUD operations for all database tables using psycopg2.

## Project Structure

```
backend/database/
├── api.py                      # FastAPI application with all endpoints
├── db.py                       # Database connection utilities
├── models.py                   # Pydantic models for request/response schemas
├── crud_users.py               # CRUD operations for users & location_tracking
├── crud_emergencies.py         # CRUD operations for emergencies, case_groups, cases
├── crud_coordination.py        # CRUD operations for assignments, updates, research_reports
├── run.py                      # Application entry point
├── requirements.txt            # Python dependencies
├── .env.example                # Environment variables template
└── __init__.py                 # Package initialization
```

## Setup

### 1. Install Dependencies

```bash
cd backend/database
pip install -r requirements.txt
```

### 2. Configure Environment

Copy `.env.example` to `.env` and update with your database credentials:

```bash
cp .env.example .env
```

Edit `.env`:
```
DB_NAME=beacon_db
DB_USER=postgres
DB_PASSWORD=your_password
DB_HOST=localhost
DB_PORT=5432
```

### 3. Initialize Database

Make sure PostgreSQL is running and execute the init.sql schema:

```bash
psql -U postgres -d beacon_db -f init.sql
```

### 4. Run the API

```bash
# Using the run script
python run.py

# Or using uvicorn directly
uvicorn api:app --reload --host 0.0.0.0 --port 8000
```

The API will be available at: http://localhost:8000

API documentation (Swagger UI): http://localhost:8000/docs

## API Endpoints

### Users
- `POST /users` - Create a new user
- `GET /users/{user_id}` - Get user by ID
- `GET /users?skip=0&limit=100` - List all users with pagination
- `PUT /users/{user_id}` - Update user
- `DELETE /users/{user_id}` - Delete user

### Location Tracking
- `POST /location-tracking` - Create location tracking entry
- `GET /location-tracking/{tracking_id}` - Get tracking entry by ID
- `GET /location-tracking/user/{user_id}` - Get all tracking entries for a user
- `DELETE /location-tracking/{tracking_id}` - Delete tracking entry

### Emergencies
- `POST /emergencies` - Create a new emergency
- `GET /emergencies/{emergency_id}` - Get emergency by ID
- `GET /emergencies?skip=0&limit=100` - List all emergencies
- `PUT /emergencies/{emergency_id}` - Update emergency
- `DELETE /emergencies/{emergency_id}` - Delete emergency

### Case Groups
- `POST /case-groups` - Create a new case group
- `GET /case-groups/{case_group_id}` - Get case group by ID
- `GET /case-groups/emergency/{emergency_id}` - Get all case groups for an emergency
- `PUT /case-groups/{case_group_id}` - Update case group
- `DELETE /case-groups/{case_group_id}` - Delete case group

### Cases
- `POST /cases` - Create a new case
- `GET /cases/{case_id}` - Get case by ID
- `GET /cases?skip=0&limit=100` - List all cases
- `PUT /cases/{case_id}` - Update case
- `DELETE /cases/{case_id}` - Delete case

### Assignments
- `POST /assignments` - Create a new assignment
- `GET /assignments/{assignment_id}` - Get assignment by ID
- `GET /assignments/case/{case_id}` - Get all assignments for a case
- `GET /assignments/helper/{helper_user_id}` - Get all assignments for a helper
- `PUT /assignments/{assignment_id}` - Update assignment
- `DELETE /assignments/{assignment_id}` - Delete assignment

### Updates
- `POST /updates` - Create a new update
- `GET /updates/{update_id}` - Get update by ID
- `GET /updates/emergency/{emergency_id}` - Get all updates for an emergency
- `GET /updates/case/{case_id}` - Get all updates for a case
- `DELETE /updates/{update_id}` - Delete update

### Research Reports
- `POST /research-reports` - Create a new research report
- `GET /research-reports/{report_id}` - Get research report by ID
- `GET /research-reports?skip=0&limit=100` - List all research reports
- `DELETE /research-reports/{report_id}` - Delete research report

### Health Check
- `GET /health` - Health check endpoint

## Example Usage

### Create a User

```bash
curl -X POST "http://localhost:8000/users" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "John Doe",
    "location": {"latitude": 37.7749, "longitude": -122.4194},
    "contact_info": "john@example.com",
    "helper_skills": ["medical", "first_aid"],
    "helper_max_range": 5000
  }'
```

### Create an Emergency

```bash
curl -X POST "http://localhost:8000/emergencies" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "San Francisco Wildfire 2025",
    "area": "San Francisco Bay Area",
    "description": "Major wildfire spreading through residential areas",
    "type": "wildfire",
    "status": "active",
    "severity_level": "critical"
  }'
```

### Create a Case

```bash
curl -X POST "http://localhost:8000/cases" \
  -H "Content-Type: application/json" \
  -d '{
    "location": {"latitude": 37.7849, "longitude": -122.4294},
    "description": "Family trapped in building",
    "people_count": 4,
    "mobility_status": "trapped",
    "vulnerability_factors": ["children_present", "elderly"],
    "urgency": "critical",
    "danger_level": "life_threatening",
    "status": "open"
  }'
```

### Get All Cases

```bash
curl "http://localhost:8000/cases?skip=0&limit=10"
```

## Architecture

### Database Connection
- Uses psycopg2 with connection pooling via context managers
- Automatic transaction management with commit/rollback
- RealDictCursor for dictionary-style row access

### Models
- Pydantic models for request validation and response serialization
- Separate Create, Update, and Response models for each table
- Type-safe LocationPoint model for PostgreSQL POINT type

### CRUD Operations
- Organized by domain (users, emergencies, coordination)
- Dynamic SQL generation for partial updates
- Proper error handling and None checks
- Support for pagination on list endpoints

### API Layer
- RESTful design with standard HTTP methods
- 404 errors for missing resources
- 201 status for successful creation
- 204 status for successful deletion
- Query parameters for pagination

## Development

### Running Tests
```bash
# Add your test framework here
pytest
```

### Code Organization
- **db.py**: Database connection management
- **models.py**: Pydantic schemas for all tables
- **crud_users.py**: Users and location tracking operations
- **crud_emergencies.py**: Emergency hierarchy operations
- **crud_coordination.py**: Assignment and update operations
- **api.py**: FastAPI endpoints
- **run.py**: Application entry point

## Notes

- All endpoints support pagination via `skip` and `limit` query parameters
- Location data uses PostgreSQL POINT type (latitude, longitude)
- Timestamps are automatically managed by the database
- Foreign key constraints are enforced at the database level
- The API follows REST best practices with proper HTTP status codes
