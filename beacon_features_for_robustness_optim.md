# Beacon: The "Iron Man" MVP Implementation Guide

## Project Goal

Transform the 7-step MVP from a *functional* app into a *winning "Agent Iron Man" project* by integrating five unique, demo-able features that prove the agent "doesn't break" and is "fast, efficient, and robust".

## Submission Checklist Compliance

- **[X] Performance metrics documented (latency, cost, tokens):** Features 1, 2, and 5
- **[X] Error handling demonstrated:** Features 3, 4, and 5
- **[X] Comparison with baseline:** Features 1, 2, and 3

---

## Section 1: Performance Optimization Features

### Feature 1: Asynchronous Parallel Tool Calls

**Purpose:** Optimize latency by running independent network-bound tasks concurrently instead of sequentially.

**The Problem:** The `CoordinatorAgent` performs two slow, independent tasks sequentially:
1. Call the `ResearchAgent` (VALYU API)
2. Call a database tool (e.g., `find_nearby_helpers` or `get_case_details`)

A baseline agent does these one after the other, wasting time.

**The Solution:** Run both tasks in parallel using `asyncio.gather()`. This is a non-blocking operation that dramatically cuts perceived latency.

**Performance Gains:**
- **Baseline (Sequential):** `find_helpers (2s) + get_research (4s) = 6 seconds`
- **Iron Man (Parallel):** `asyncio.gather(find_helpers, get_research) = max(2s, 4s) = 4 seconds`
- **Result:** 33% reduction in latency

**Implementation Location:**
- **MVP Steps:** 2 (Caller Guide) & 3 (Helper Guide)
- **File:** `backend/services/cases.py` or `services/research.py`

**Key Implementation Points:**
- Ensure backend (FastAPI/Flask) is set up for `async`
- Agents/tools must have `.ainvoke()` methods
- Use `asyncio.gather()` to run independent tasks concurrently
- Define both slow tasks before gathering them
- Unpack results after gather completes
- Save guide and return combined results

---

### Feature 2: Tool-Result Caching

**Purpose:** Eliminate redundant API calls when multiple users request the same information.

**The Problem:** The `InputProcessingAgent` smartly groups 50 reports into one `case_group_id`. But if 50 different helpers accept that same case, the `Helper Guide pipeline` calls the expensive VALYU API 50 times for the exact same query. This is a "resource exhaustion" failure.

**The Solution:** Use a simple, one-line in-memory cache (`functools.lru_cache`). The first helper's request triggers the expensive research; the next 49 get the saved result instantly.

**Performance Gains:**
- **Baseline (50 Helpers):** 50 API calls × 4s/call = 200s total wait, $0.50 cost
- **Iron Man (50 Helpers):** (1 API call × 4s) + (49 cache hits × 0.01s) = 4.49s total wait, $0.01 cost
- **Result:** 98% cost & token reduction, 99% latency optimization for grouped helper requests

**Implementation Location:**
- **MVP Step:** 3 (Helper Guide pipeline)
- **File:** `backend/services/research.py`

**Key Implementation Points:**
- Wrap the research function with `@functools.lru_cache(maxsize=100)` decorator
- Cache the 100 most recent unique queries
- The expensive `agent.invoke()` runs only once per unique query
- Subsequent calls with the same query return cached results instantly
- Helper pipeline calls the cached wrapper instead of agent directly

---

## Section 2: Robustness & Reliability Features

### Feature 3: The "Chaos Mode" Toggle (Graceful Degradation Demo)

**Purpose:** Demonstrate error handling by forcing tool failures and showing graceful degradation to fallback systems.

**The Problem:** The map cache is a good backup strategy, but judges will never see it work unless the Google Maps API actually fails during the demo (which it won't). You must force it to fail.

**The Solution:** Add a "Chaos Mode" toggle to the React UI. When toggled ON, the backend intentionally simulates a network failure. Judges will see the agent not crash, but "gracefully degrade" to the cache.

**Error Handling Demonstration:**
- **Baseline:** API fails → Agent crashes → Frontend shows a 500 error toast
- **Iron Man:** API fails → Agent catches error, re-plans, uses cache → Frontend shows "degraded route" warning toast

**Implementation Location:**
- **Frontend (Step 7):** React `Helper` view with Shadcn/ui `Switch` component
- **Backend (Steps 4 & 6):** `GET /api/cases/{case_id}/route` endpoint accepts `&chaos_mode=true` query parameter
- **Agent Graph (Step 5):** `CoordinatorAgent`'s graph with conditional edge to handle tool failure

**Key Implementation Points:**
- Add `Switch` component in React for "Chaos Mode" toggle
- Pass `chaos_mode` flag to backend API endpoint
- Modify `get_google_maps_route` tool to accept `is_chaos_mode` parameter
- When chaos mode is enabled, simulate 3-second timeout and raise exception
- Implement try/except in tool to catch failure and fall back to cache
- Return structured response with `source` field ("live", "cache", or "error")
- Display appropriate warning toast when cache is used
- Agent graph node handles `ToolException` gracefully

---

### Feature 4: The "Self-Healing" Research Agent (Resilient Recovery)

**Purpose:** Ensure the agent continues functioning even when external APIs fail.

**The Problem:** The `Caller/Helper Guide pipelines` depend on the VALYU API and research LLM. If they fail, the agent crashes and users get no guidance.

**The Solution:** Build `try/except` logic into the `ResearchAgent` graph itself. If the VALYU tool fails, the graph doesn't crash. It catches the error and passes it to the final `summarizer` node, which uses a fallback prompt based on internal knowledge.

**Error Handling:**
- Catches external API failures without crashing
- Passes error state to guidance generation node
- Provides fallback guidance using LLM's internal knowledge
- Ensures users always receive advice, even if degraded

**Implementation Location:**
- **Agent Graph (Step 5):** In `ResearchAgent`'s LangGraph definition

**Key Implementation Points:**
- Create `node_call_valyu` with try/except wrapper
- On success: return research results with `error: None`
- On failure: catch exception, return `research_results: None` with error message
- Create `node_generate_guidance` that checks for error state
- Use fallback prompt when VALYU fails: "Based ONLY on internal knowledge..."
- Use normal prompt when research succeeds: "Based on this research..."
- Wire nodes in simple sequence: call_valyu → generate_guidance
- Set appropriate entry and finish points

---

## Section 3: The "Secret Weapon" (Metrics & Demo UI)

### Feature 5: The "Live Agentic Dashboard" (via LangSmith & SSE)

**Purpose:** Provide real-time observability and proof of performance claims through live streaming of agent execution.

**The Problem:** No way to prove performance claims (latency, cost) or show judges that error handling (Features 3 & 4) actually worked. The React app is "dumb" and just waits for a final JSON response.

**The Solution:** Create a multi-stakeholder UI using LangSmith and Server-Sent Events (SSE). The UI shows:
1. **User's View** - Normal app interface (map/chat)
2. **Judge's View** - Live-streamed feed of agent's thoughts
3. **Metrics Dashboard** - Real-time latency, tokens, and cost
4. **Audit Trail Link** - Direct link to full LangSmith trace

**Implementation Location:**
- **Backend (Step 5):** 
  - Enable LangSmith with environment variables
  - Create streaming endpoint using FastAPI's `StreamingResponse`
  - Create custom `AsyncCallbackHandler` to stream trace data
  - Use `langsmith.Client` to fetch final metrics
- **Frontend (Step 7):** 
  - Use `EventSource` API to listen for stream
  - Update "Judge's View" panel in real-time
  - Display metrics and trace link

**Key Implementation Points:**

**Backend Setup:**
- Set environment variables: `LANGCHAIN_TRACING_V2="true"`, `LANGCHAIN_API_KEY`, `LANGCHAIN_PROJECT`
- Create `SSEStreamingCallbackHandler` class that extends `AsyncCallbackHandler`
- Handler puts events into an `asyncio.Queue` for streaming
- Implement callbacks: `on_llm_start`, `on_tool_start`, `on_tool_end`
- Create new `/api/cases/stream` POST endpoint
- Use `StreamingResponse` with `media_type="text/event-stream"`
- Run agent in background task with `asyncio.create_task`
- Stream events from queue while agent runs
- After completion, fetch run metrics from LangSmith
- Send final events: metrics and complete status

**Frontend Implementation:**
- Create two-column layout using grid
- Left column: User's view with normal interface
- Right column: Judge's view with live trace and metrics
- Use `EventSource` API to connect to streaming endpoint
- Listen for different event types: `trace`, `metrics`, `complete`, `error`
- Update state arrays as trace events arrive
- Display metrics in three-column grid (latency, tokens, cost)
- Show live trace log in scrollable container with monospace font
- Render link to full LangSmith audit trail
- Handle connection errors gracefully
- Close EventSource when complete

**Data Displayed:**
- Real-time agent reasoning steps (source + step description)
- Final latency in seconds
- Total tokens used
- Total cost in dollars
- Full trace URL for detailed audit

---

## Summary of Implementation

| Feature | Performance Gain | Error Handling | Implementation Files |
|---------|------------------|----------------|---------------------|
| 1. Async Parallel Calls | 33% latency reduction | - | `services/cases.py` |
| 2. Tool-Result Caching | 98% cost reduction, 99% latency | - | `services/research.py` |
| 3. Chaos Mode Toggle | - | ✓ (Graceful degradation) | `HelperView.tsx`, `agent_tools.py`, `agent_graph.py` |
| 4. Self-Healing Agent | - | ✓ (Resilient recovery) | `ResearchAgent` graph definition |
| 5. Live Dashboard | Full real-time observability | ✓ (Visual proof) | `streaming.py`, `cases.py`, `CallerFlow.tsx` |

**Critical Requirements:**
- Backend must support `async/await` patterns
- All tools and agents need `.ainvoke()` methods for async operations
- LangSmith API key required for Feature 5 observability
- EventSource API used for server-sent events in frontend
- Chaos Mode provides one-click demo of error handling capabilities

**Demo Impact:**
- Features 1 & 2 provide measurable, quantifiable performance improvements
- Features 3 & 4 demonstrate robust error handling under failure conditions
- Feature 5 makes all improvements visible and verifiable to judges in real-time