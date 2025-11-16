# CRITICAL ISSUES AND BUGS - BEACON Platform

**Generated:** 2025-11-15
**Status:** Comprehensive audit of all identified issues

---

## 🔴 CRITICAL ISSUES (Must Fix Immediately)

### 1. AI Agent Processing Failures (500 Errors)
**Location:** Backend agent processing
**Severity:** CRITICAL
**Impact:** All help requests fail to generate AI safety guides

**Evidence:**
```
Error in async processing for case 4: 500 Server Error: Internal Server Error
Error in async processing for case 5: 500 Server Error: Internal Server Error
...case 6, 7, 8, 9 all failing
```

**Root Cause:**
- AWS Bedrock API calls returning 500 errors
- URL: `https://ctwa92wg1b.execute-api.us-east-1.amazonaws.com/prod/invoke`
- Likely causes:
  - Invalid/expired API credentials (TEAM_ID, API_TOKEN)
  - Request payload format mismatch
  - Rate limiting or quota exceeded
  - AWS endpoint configuration error

**Files Affected:**
- `backend/services/research.py` (InputProcessingAgent, ResearchAgent, CallerGuideAgent)
- `backend/services/cases.py:106-122` (async processing thread)
- `backend/main.py` (Bedrock API client setup)

**Impact:**
- Cases are created successfully but AI processing fails
- No caller guides generated (safety instructions for victims)
- No helper guides generated (action steps for responders)
- Research reports not created
- Database still gets the case, but value-add AI features completely broken

**Fix Required:**
1. Verify AWS Bedrock API credentials in `.env`
2. Test Bedrock connection: `cd backend && python main.py`
3. Check request payload format matches Bedrock API spec
4. Add retry logic with exponential backoff
5. Implement graceful degradation (save case even if AI fails)
6. Add detailed error logging to identify exact failure point

---

### 2. Missing Cases on Map Display
**Location:** Frontend map rendering
**Severity:** CRITICAL
**Impact:** Users cannot see help requests on map (main feature broken)

**Evidence:**
- Cases created successfully (confirmed in database: 6 cases with status='open')
- API endpoint `/api/cases/nearby` now working (returns cases correctly)
- Frontend polls every 10 seconds
- **BUT**: No markers appearing on map

**Suspected Root Causes:**

#### 2.1 Type Mismatch in mapCaseToHelpRequest
**Location:** `frontend/src/components/layout/Dashboard.tsx:17-34`

The mapping function creates a `HelpRequest` but has hardcoded defaults:
```typescript
function mapCaseToHelpRequest(apiCase: Case): HelpRequest {
  return {
    id: apiCase.case_id.toString(),
    type: 'medical', // ❌ HARDCODED - all cases show as 'medical'
    location: { lat: apiCase.location.latitude, lng: apiCase.location.longitude },
    peopleCount: apiCase.people_count || undefined,
    urgency: apiCase.urgency,
    status: apiCase.status as any, // ❌ DANGEROUS TYPE CAST
    description: apiCase.description || apiCase.raw_problem_description,
    ...
  };
}
```

**Issues:**
- `type` is hardcoded to 'medical' - should be inferred from description or added to backend
- Missing required fields: `disasterId`, `userId`, `userName`, `createdAt`
- Status type cast `as any` bypasses type safety
- No validation that required fields exist

#### 2.2 Frontend Type Mismatch
**Location:** `frontend/src/types/index.ts:30-44`

```typescript
export interface HelpRequest {
  id: string;
  disasterId: string; // ❌ REQUIRED but not provided in mapping
  userId: string;     // ❌ REQUIRED but not provided
  userName: string;   // ❌ REQUIRED but not provided
  type: HelpRequestType;
  urgency: Urgency;
  location: Location;
  peopleCount: number; // ❌ Mapped as number | undefined, type mismatch
  description: string;
  createdAt: Date;    // ❌ REQUIRED but not provided (API returns string)
  status: HelpRequestStatus;
  claimedBy?: string;
  claimedAt?: Date;
}
```

#### 2.3 Map Marker Rendering Issues
**Possible Issues:**
- `VictimMarkers` component not receiving data correctly
- Map bounds not including marker locations
- Markers rendered outside visible viewport
- Google Maps API key issues
- Console errors preventing map render

**Fix Required:**
1. Check browser console for JavaScript errors
2. Add console.log in `mapCaseToHelpRequest` to verify data transformation
3. Add console.log in `VictimMarkers` to verify markers are being rendered
4. Fix type mismatches - add missing required fields or make them optional
5. Convert API string timestamps to Date objects
6. Add fallback values for missing data
7. Verify map center is correct
8. Check if markers are rendered but invisible (CSS issue)

---

### 3. Database Schema / Backend Mismatch
**Location:** Users table
**Severity:** HIGH
**Impact:** Anonymous users cannot be properly tracked

**Issue:**
Database schema requires `name VARCHAR(255) NOT NULL` (line 24 of init.sql), but backend tries to create users with `name = NULL` for anonymous users.

**Evidence:**
- `backend/database/init.sql:24` - `name VARCHAR(255) NOT NULL`
- `backend/services/users.py` - Creates users with `name=None` for anonymous
- Frontend sends `name: null` in LocationConsentRequest

**SQL Constraint Violation:**
```sql
INSERT INTO users (name, location, ...) VALUES (NULL, ..., ...);
-- ERROR: null value in column "name" violates not-null constraint
```

**Fix Options:**
1. **Change schema:** `name VARCHAR(255)` (remove NOT NULL)
2. **Use default value:** `name VARCHAR(255) DEFAULT 'Anonymous'`
3. **Backend validation:** Force 'Anonymous' when name is null

**Recommended:** Option 2 (default value) - maintains data integrity while supporting anonymous users.

---

### 4. PostGIS Extension Not Installed
**Location:** Database
**Severity:** HIGH (Already worked around, but architecture issue)
**Impact:** Cannot use efficient geospatial queries

**Evidence:**
```
ERROR: extension "postgis" is not available
DETAIL: Could not open extension control file "/usr/local/share/postgresql/extension/postgis.control"
```

**Current State:**
- Using `postgres:15-alpine` Docker image (no PostGIS)
- **Workaround implemented:** Python-based Haversine distance calculation
- Works but inefficient for large datasets

**Original SQL (failed):**
```sql
ST_Y(location::geometry)  -- PostGIS function
ST_X(location::geometry)  -- PostGIS function
```

**Current Workaround:**
```python
def haversine_distance(lat1, lon1, lat2, lon2):
    # Pure Python calculation
    # Fetches ALL cases, filters in memory
```

**Impact:**
- Inefficient: Fetches all cases from DB, filters in Python
- Doesn't scale beyond ~1000 cases
- No spatial indexing (GIST indexes unusable)

**Fix Required:**
1. **Option A:** Change Docker image to `postgis/postgis:15-alpine` (recommended)
2. **Option B:** Install PostGIS in current image (more complex)
3. **Option C:** Keep Python workaround (only for hackathon/demo)

**Recommended:** Option A - Change `backend/database/docker-compose.yml`:
```yaml
image: postgis/postgis:15-alpine  # Instead of postgres:15-alpine
```

---

## ⚠️ HIGH PRIORITY BUGS

### 5. Help Request Details Dialog Not Implemented
**Location:** `frontend/src/components/layout/Dashboard.tsx:109-111`
**Severity:** HIGH
**Impact:** Users cannot view full case details or claim cases

**Code:**
```typescript
const handleMarkerClick = (request: any) => {
  console.log('Victim marker clicked:', request);
  // TODO: Show help request details dialog
};
```

**Missing Features:**
- No modal/dialog for case details
- Responders cannot claim cases
- Victims cannot view their request status
- No "I'm Responding" button
- No distance calculation display
- No status update UI

**Fix Required:**
1. Create `HelpRequestDetailsDialog.tsx` component
2. Show full case info (description, urgency, people count, etc.)
3. Role-based actions:
   - **Responders:** "Claim Case" button → calls `/api/assignments`
   - **Victims:** View-only mode
4. Display distance from user to case
5. Show assigned responder info if claimed
6. Follow glassmorphic design system

---

### 6. Mock Data Still Present in Codebase
**Location:** Multiple frontend files
**Severity:** MEDIUM-HIGH
**Impact:** Confusion, unused code, potential conflicts

**Files:**
- `frontend/src/data/mock-disaster.ts` - Mock disasters
- `frontend/src/data/mock-help-requests.ts` - Mock requests
- `frontend/src/data/mock-news.ts` - Mock news
- `frontend/src/data/mock-alerts.ts` - Mock alerts
- `frontend/src/data/mock-resources.ts` - Mock resources (with placeholder phone numbers)

**Issues:**
- Dead code that's no longer used (switched to API)
- Increases bundle size
- Developers might accidentally import mock data
- Inconsistent with production data structure

**Mock Resources Phone Numbers:**
```typescript
contact: '+90 212 XXX XXXX',  // Line 14 - not real
contact: '+90 212 XXX XXXY',  // Line 24 - not real
contact: '+90 212 XXX XXXZ',  // Line 34 - not real
contact: '+90 212 XXX XXXW',  // Line 72 - not real
```

**Fix Required:**
1. **Option A:** Delete all mock-*.ts files (recommended for production)
2. **Option B:** Keep for testing, move to `__tests__/fixtures/` directory
3. **Option C:** Add clear warning comments at top of files
4. Update mock phone numbers with real emergency numbers or proper test format

---

### 7. Excessive Console Logging in Production
**Location:** Frontend (15 files)
**Severity:** MEDIUM
**Impact:** Performance, security (exposes internal data), debugging noise

**Console Logs Found:**
- `frontend/src/services/api.ts:160` - API request logging
- `frontend/src/services/api.ts:168` - Response status logging
- `frontend/src/components/layout/RequestHelpDialog.tsx:188` - Case created log
- `frontend/src/components/layout/Dashboard.tsx:109` - Marker click log
- `frontend/src/App.tsx:43` - Registration error log
- Plus 10 more console.error and console.warn statements

**Issues:**
- Exposes sensitive data in browser console (user IDs, locations, API responses)
- Performance overhead in production builds
- Hard to debug real issues due to noise
- No structured logging or log levels

**Fix Required:**
1. Remove all `console.log()` statements from production code
2. Keep `console.error()` for actual errors
3. Implement proper logging service:
```typescript
// logger.ts
export const logger = {
  debug: (msg: string, data?: any) => {
    if (import.meta.env.DEV) console.log(msg, data);
  },
  error: (msg: string, error?: any) => {
    console.error(msg, error);
    // Send to monitoring service (Sentry, LogRocket)
  }
};
```

---

### 8. No Error Boundaries in React App
**Location:** Frontend React components
**Severity:** MEDIUM-HIGH
**Impact:** Entire app crashes on component errors

**Current State:**
- No error boundaries implemented
- Single component error crashes entire app
- User sees white screen with no recovery
- No error reporting to developers

**Example Scenarios:**
- Map component fails → entire dashboard blank
- API response has unexpected format → app crashes
- TypeScript type mismatch at runtime → white screen

**Fix Required:**
1. Create `ErrorBoundary.tsx` component
2. Wrap key sections:
```typescript
<ErrorBoundary fallback={<ErrorPage />}>
  <Dashboard />
</ErrorBoundary>
```
3. Log errors to monitoring service
4. Provide user-friendly error messages
5. Add "Retry" or "Reload" buttons

---

### 9. Race Condition in Location Updates
**Location:** `frontend/src/App.tsx` + `useGeolocation`
**Severity:** MEDIUM
**Impact:** User registration can fail or use stale location

**Flow:**
1. App mounts → `useGeolocation()` starts fetching location
2. User selects role → `registerUser()` called immediately
3. If location not ready yet → uses fallback London coordinates
4. User gets registered at wrong location

**Evidence:**
```typescript
// App.tsx
const { location } = useGeolocation();

const handleRoleSelect = async (selectedRole: UserRole) => {
  // location might still be null here!
  await registerUser(selectedRole, location.lat, location.lng);
};
```

**Fix Required:**
1. Add loading state while fetching location
2. Disable role selection until location is ready
3. Show spinner: "Getting your location..."
4. Add manual location entry as fallback
5. Or: Allow registration without location, update later

---

### 10. No Request Validation on Backend
**Location:** Backend API endpoints
**Severity:** MEDIUM
**Impact:** Invalid data can corrupt database

**Issues:**
- No latitude/longitude range validation (-90 to 90, -180 to 180)
- No max length on `raw_problem_description`
- No sanitization of user input (SQL injection risk low with parameterized queries, but XSS risk exists)
- No phone number format validation
- No email format validation

**Example:**
```python
@app.post("/api/cases", status_code=201)
def create_case(request: CreateCaseRequest):
    # ❌ No validation that latitude is between -90 and 90
    # ❌ No validation that raw_problem_description isn't 1MB of text
    # ❌ No HTML sanitization
    return cases.create_case(...)
```

**Fix Required:**
1. Add Pydantic validators:
```python
class CreateCaseRequest(BaseModel):
    latitude: float = Field(..., ge=-90, le=90)
    longitude: float = Field(..., ge=-180, le=180)
    raw_problem_description: str = Field(..., max_length=5000)
```
2. Sanitize HTML input to prevent XSS
3. Validate phone numbers and emails with regex
4. Add rate limiting per user/IP

---

## 🟡 MEDIUM PRIORITY ISSUES

### 11. Polling Every 10 Seconds Creates Heavy Load
**Location:** `frontend/src/components/layout/Dashboard.tsx:83`
**Severity:** MEDIUM
**Impact:** Unnecessary server load, battery drain on mobile

**Current Implementation:**
```typescript
useEffect(() => {
  fetchCases(); // Immediate
  const interval = setInterval(fetchCases, 10000); // Every 10s
  return () => clearInterval(interval);
}, [location]);
```

**Issues:**
- 360 requests per hour per user
- All users poll simultaneously (thundering herd)
- Fetches even when tab is not visible
- No exponential backoff on errors
- Drains mobile battery

**Fix Required:**
1. **Option A:** Implement WebSocket for real-time updates
2. **Option B:** Increase polling interval to 30-60 seconds
3. **Option C:** Use `visibilitychange` API to pause when tab hidden
4. Add exponential backoff on errors
5. Implement server-sent events (SSE) as middle ground

**Recommended:** Start with Option C (pause when hidden) + increase to 30s, later add WebSocket.

---

### 12. No Authentication/Authorization
**Location:** Backend + Frontend
**Severity:** MEDIUM (acceptable for hackathon, critical for production)
**Impact:** Anyone can claim to be any user, access any data

**Current State:**
- User ID is UUID stored in localStorage (client-side)
- No password, no login flow
- Anyone can send any user_id in API requests
- No JWT tokens, no session management

**Security Issues:**
- User A can claim cases as User B
- User A can view User B's help requests
- No rate limiting per user (can spam cases)
- No audit trail of who did what

**Fix Required (for production):**
1. Implement JWT-based authentication
2. Add login/register endpoints
3. Require `Authorization: Bearer <token>` header
4. Validate user_id from token, not request body
5. Add rate limiting per authenticated user
6. Implement RBAC (role-based access control)

**Acceptable for now:** Hackathon/demo mode, but mark as technical debt.

---

### 13. Emergency/Disaster Data Not Used
**Location:** Multiple files
**Severity:** MEDIUM
**Impact:** Key feature (disaster context) not implemented

**Database Schema Exists:**
- `emergencies` table fully defined
- `case_groups` table for grouping
- Cases should link to emergencies via `case_group_id` → `case_groups.emergency_id`

**Current State:**
- `emergency_id` in `CreateCaseRequest` is optional and never used
- Frontend creates default "Emergency Response Testing" disaster (fake)
- No real disaster selection
- No disaster-specific filtering
- No emergency status tracking

**Impact:**
- Can't differentiate between different disasters
- Can't show cases for specific emergency
- Can't track emergency lifecycle (active → contained → resolved)
- No disaster-specific statistics

**Fix Required:**
1. Create `/api/emergencies` endpoints (CRUD)
2. Populate emergencies table with real data
3. Update case creation to require emergency_id
4. Add disaster selection UI in frontend
5. Filter cases by emergency_id
6. Show disaster info in header/context

---

### 14. Google Maps API Key Exposed in Frontend
**Location:** `frontend/.env`, client-side code
**Severity:** MEDIUM-LOW
**Impact:** API key can be stolen, quota abuse

**Current State:**
```env
VITE_GOOGLE_MAPS_API_KEY=AIzaSyD0KJqzyARTXKm-gaY7M7aPrKF7tNsUIc8
```

**Issues:**
- API key visible in browser network tab
- Anyone can extract and use the key
- No domain restrictions configured
- Can exceed quota and incur charges

**Fix Required:**
1. Add domain restrictions in Google Cloud Console
2. Add HTTP referrer restrictions
3. Monitor usage for abuse
4. Consider server-side proxy for sensitive operations
5. Rotate key if compromised

**Note:** Google Maps API keys are meant to be public but should have restrictions.

---

### 15. No Test Coverage
**Location:** Entire codebase
**Severity:** MEDIUM
**Impact:** Cannot verify changes don't break functionality

**Current State:**
- No unit tests
- No integration tests
- No E2E tests
- No test framework setup

**Risk:**
- Refactoring breaks features silently
- Bugs only caught in production
- Hard to onboard new developers
- No CI/CD confidence

**Fix Required (prioritized):**
1. **Critical path tests:**
   - User registration flow
   - Case creation and retrieval
   - Case claiming by responders
2. **API tests:**
   - Test all endpoints with pytest
   - Mock Bedrock API calls
3. **Frontend tests:**
   - Test form validation
   - Test map marker rendering
4. **Integration tests:**
   - Full user journey E2E

---

## 🟢 LOW PRIORITY / TECHNICAL DEBT

### 16. Type Coercion with `as any`
**Location:** `frontend/src/components/layout/Dashboard.tsx:24`
**Severity:** LOW
**Impact:** Bypasses TypeScript type safety

```typescript
status: apiCase.status as any, // ❌ Dangerous
```

**Fix:** Define proper type union or add type guard.

---

### 17. Duplicate Haversine Implementation
**Location:** `backend/agent_tools.py:111` and `backend/services/cases.py:246`
**Severity:** LOW
**Impact:** Code duplication, maintenance burden

**Fix:** Extract to shared `backend/utils/geo.py` module.

---

### 18. Docker Compose Version Warning
**Location:** `backend/database/docker-compose.yml`
**Severity:** LOW
**Impact:** Annoying warning on every command

```
level=warning msg="docker-compose.yml: the attribute `version` is obsolete"
```

**Fix:** Remove `version:` line from docker-compose.yml (now deprecated).

---

### 19. Incomplete Type Definitions
**Location:** `frontend/src/types/index.ts`
**Severity:** LOW
**Impact:** Type mismatches between frontend and backend

**Issues:**
- `DisasterInfo.type` has only 4 types, backend uses 5+ types
- `HelpRequest` has different fields than backend `Case`
- `ResourceType` limited to 4 types, might need more

**Fix:** Generate TypeScript types from Pydantic models automatically.

---

### 20. No Environment-Specific Configuration
**Location:** `.env` files
**Severity:** LOW
**Impact:** Cannot easily switch between dev/staging/production

**Current:**
- Single `.env` file
- Hardcoded API URLs
- No environment detection

**Fix:**
1. Create `.env.development`, `.env.staging`, `.env.production`
2. Use environment variables for all config
3. Add config validation on app start

---

## 📊 ISSUE SUMMARY

| Severity | Count | Must Fix Before Launch |
|----------|-------|------------------------|
| 🔴 Critical | 4 | YES |
| ⚠️ High | 6 | YES |
| 🟡 Medium | 6 | Recommended |
| 🟢 Low | 4 | Optional |
| **Total** | **20** | **10 must fix** |

---

## 🎯 RECOMMENDED FIX PRIORITY

### Phase 1: Critical Path (Do First)
1. **Fix AI Agent Processing** (Issue #1) - Core value broken
2. **Fix Cases Not Showing on Map** (Issue #2) - Main feature broken
3. **Fix Database Schema Mismatch** (Issue #3) - Data integrity
4. **Implement Help Request Details Dialog** (Issue #5) - Cannot claim cases

### Phase 2: High Priority (Do Next)
5. **Add Error Boundaries** (Issue #8) - Prevent crashes
6. **Fix Location Race Condition** (Issue #9) - Bad UX
7. **Add Request Validation** (Issue #10) - Security

### Phase 3: Production Ready (Before Real Launch)
8. **Reduce Polling Frequency** (Issue #11) - Server load
9. **Add Authentication** (Issue #12) - Security
10. **Install PostGIS** (Issue #4) - Scalability

### Phase 4: Technical Debt (Ongoing)
11-20. All remaining issues

---

## 🔍 HOW ISSUES WERE IDENTIFIED

1. **Console error analysis** - Screenshots showing 422 errors, 500 errors
2. **Backend logs** - "Error in async processing" messages
3. **Database queries** - Schema inspection, data verification
4. **Code review** - Grep for TODO, FIXME, console.log
5. **Type analysis** - Frontend/backend type mismatches
6. **Architecture review** - PostGIS missing, mock data present
7. **Security review** - No auth, exposed API keys
8. **Performance review** - 10-second polling, no error boundaries

---

**Next Steps:**
1. Review this document with team
2. Assign owners to each critical issue
3. Create GitHub issues/tickets
4. Start with Phase 1 fixes
5. Re-test after each fix
6. Update this document as issues are resolved
