# Natural Disaster Emergency Response App - Design Document

**Date:** 2025-11-15
**Status:** Approved

## Overview

A location-aware emergency response web application for civilians affected by major natural disasters (earthquakes, hurricanes, tsunamis, floods). The app auto-detects when users are in an active disaster zone and provides an interactive map centered on their immediate area, allowing them to request help, view nearby emergency resources, and receive live updates.

## Core Concept

This is a **region-specific emergency response app** that gets deployed for specific disaster events. When a disaster occurs (e.g., earthquake in Turkey), users in the affected area choose their role and access relevant features.

### Role-Based System

**Initial Screen:**
When users open the app, they see two options:
- **"I Need Help"** (Victim role)
- **"I Want to Provide Help"** (Responder/Volunteer role)

**Victim Role Features:**
- Request help with specific needs (medical, food, shelter, rescue)
- View own help request status
- See nearby emergency resources (shelters, hospitals, water stations, safe zones)
- Receive official news updates and alerts
- Navigate to emergency resources
- **Cannot see** other victims' help requests (reduces information overload)

**Responder/Volunteer Role Features:**
- View all nearby help requests from victims on the map
- Filter help requests by type and urgency
- Mark themselves as "responding" to a specific request
- See emergency resources to coordinate relief efforts
- Receive official news updates and alerts
- **Cannot create** help requests (they're there to provide assistance)

## Tech Stack

- **React 18** with TypeScript
- **Vite** for build tooling
- **Tailwind CSS** for styling
- **Radix UI** primitives (Dialog, Sheet, Tabs, Toast)
- **Shadcn/UI** components built on Radix
- **Google Maps JavaScript API** for interactive mapping
- **Lucide React** for icons

## User Flow

### Initial Role Selection
1. User opens app → Auto-detects GPS location
2. Role selection screen appears with two large options:
   - "I Need Help" (victim role)
   - "I Want to Provide Help" (responder role)
3. User selects role → Stored in localStorage for session persistence

### Victim Flow (After selecting "I Need Help")
1. Map loads centered on user's neighborhood (zoom ~15)
2. Map shows:
   - User location marker (pulsing blue)
   - Emergency resource markers (green) - shelters, hospitals, water stations
   - Disaster zone boundary (polygon overlay)
   - **No other victims' help requests visible**
3. Persistent "Request Help" FAB (bottom-right) always visible
4. Left slide-in panel with tabs: Alerts, News, Resources, My Requests
5. User can request help, view resources, get directions, read updates

### Responder Flow (After selecting "I Want to Provide Help")
1. Map loads centered on user's neighborhood (zoom ~15)
2. Map shows:
   - User location marker (pulsing blue)
   - **All nearby help request markers** (color-coded by urgency: red/orange/yellow)
   - Emergency resource markers (green)
   - Disaster zone boundary (polygon overlay)
3. No "Request Help" FAB (responders don't request help)
4. Left slide-in panel with tabs: Alerts, News, Help Requests, Resources
5. User can view help requests, mark as responding, filter by type/urgency, navigate to victims

## Map System (Google Maps API)

### Configuration
- **API:** Google Maps JavaScript API with custom dark theme
- **Initial View:** User's GPS location, zoom level 15 (neighborhood detail)
- **Map Type:** Hybrid (satellite + street labels)
- **Styling:** Dark theme, desaturated colors to emphasize markers

### Map Elements

**User Location:**
- Pulsing blue marker with circular radius showing immediate area

**Help Request Markers (Responder Role Only):**
- Custom SVG markers with icon badges (medical, food, shelter, rescue, other)
- Color-coded by urgency:
  - Red: Critical
  - Orange: Urgent
  - Yellow: Standard
- Marker clustering for dense areas (Google Maps MarkerClusterer)
- **Not visible to victims** (only responders see these)

**Emergency Resources:**
- Green custom markers for:
  - Hospitals/Medical centers
  - Emergency shelters
  - Water distribution points
  - Safe zones

**Disaster Zone Boundary:**
- Polygon overlay with subtle red tint and glowing border
- Shows full extent of affected area

### Interactions
- Click marker → Opens detail sheet from right side
- Hover marker → Info window with type, urgency, distance
- Search → Google Places API autocomplete, smooth pan/zoom
- Layer toggles → Show/hide different marker types
- Get Directions → Route to selected location

## UI Layout & Components

### Role Selection Screen

**Initial Landing (Before Role Selection):**
- Full viewport centered layout
- App logo and disaster info at top (e.g., "Turkey Earthquake • Feb 6")
- Two large glassmorphic cards with role options:
  - **"I Need Help"** card with victim icon
  - **"I Want to Provide Help"** card with responder icon
- Each card shows brief description of role features
- Selection triggers transition to main map interface

### Main Layout (After Role Selection)

**Map Canvas:**
- Full viewport background (100vw × 100vh)
- Google Maps container with custom dark theme
- Content varies by role (victims see resources only, responders see help requests)

**Top Bar (Fixed):**
- Glassmorphic header
- App logo
- Current disaster info chip (e.g., "Turkey Earthquake • Feb 6")
- Role indicator badge ("Victim" or "Responder")
- Location search with autocomplete
- Settings icon (includes "Change Role" option)

**Request Help FAB (Victim Role Only):**
- Bottom-right floating action button
- Always visible, high z-index
- Glassmorphic with red accent glow
- Opens Dialog modal on click
- **Not shown to responders**

**Left Slide Panel (Sheet):**
- Collapsible (default closed on mobile)
- Toggle button on left edge
- Glassmorphic background with backdrop blur
- **Tabs vary by role:**
  - **Victims:** Alerts, News, Resources, My Requests
  - **Responders:** Alerts, News, Help Requests, Resources

**Right Detail Panel (Sheet):**
- Slides in when clicking map markers
- Shows detailed information about selected item
- **Action buttons vary by role:**
  - **Victims:** Get Directions, Close
  - **Responders:** Get Directions, Mark Responding, Close

### Key Components (Shadcn/Radix)

- **Sheet:** Left panel and right detail drawer
- **Dialog:** Request Help form modal
- **Tabs:** Content switching in left panel
- **Card:** News items, help requests, resource listings
- **Badge:** Urgency levels, status indicators
- **Button:** Glassmorphic variants
- **Toast:** Notifications
- **Select/Combobox:** Filters, location search

### Responsive Behavior
- **Desktop:** Left panel can stay open, map adjusts width
- **Mobile:** Panels overlay map completely, swipe to dismiss

## Theme & Styling

### Color Palette (Sleek Minimal + Glassmorphism)

**Backgrounds:**
- Primary: `#0a0a0a` (deep black)
- Secondary: `#171717` (soft black)
- Elevated: `#1f1f1f` (card backgrounds)

**Glassmorphic Panels:**
- Background: `rgba(23, 23, 23, 0.7)`
- Backdrop blur: 24px
- Border: `1px solid rgba(255, 255, 255, 0.1)`

**Accents:**
- Primary (blue): `#3b82f6` - user location, links
- Success (green): `#10b981` - resources, safe zones
- Warning (orange): `#f59e0b` - urgent help
- Danger (red): `#ef4444` - critical help, alerts
- Purple glow: `#a855f7` - subtle highlights, focus states

### Typography
- **Primary Font:** Inter (sans-serif)
- **Mono Font:** JetBrains Mono (timestamps, coordinates, IDs)

### Component Styling
- Buttons: 8px border radius, subtle shadows, hover glow
- Cards: Glassmorphic, 1px border, 12px border radius
- Inputs: Dark background, subtle border, blue focus ring with glow
- Sheets/Dialogs: Glassmorphic overlay, smooth slide animations

## Core Features

### 1. Role Selection (Initial Screen)

**Layout:**
- Centered screen with two large option cards
- Each card is glassmorphic with icon and description
- Smooth transition animation on selection

**Options:**
- **"I Need Help"** → Sets user role to "victim"
- **"I Want to Provide Help"** → Sets user role to "responder"

**Persistence:**
- Role stored in localStorage
- "Change Role" option available in settings
- Confirmation dialog when changing roles

### 2. Request Help (Victim Role Only)

**Trigger:** Click FAB → Opens Dialog modal

**Form Fields:**
- Help Type (select): Medical Emergency, Food/Water, Shelter, Rescue, Other
- Urgency (radio): Critical, Urgent, Standard
- Number of People (number input)
- Description (textarea, optional)
- Location (auto-filled from GPS, adjustable on map)

**Submission:**
- Creates help request in system
- Visible to all responders on map
- Adds to victim's "My Requests" tab
- Stores in localStorage (mock backend)
- Shows Toast confirmation with request ID

**My Requests Tab (Victim Role):**
- Shows victim's own help requests
- Status indicators: Active, Responding (someone is coming), Resolved
- Can update or cancel requests
- Shows which responders are coming (if any)

### 3. Help Requests Feed (Responder Role Only)

**Left Panel Tab showing all nearby help requests:**
- Scrollable list of Cards showing:
  - Help type icon and urgency badge
  - Distance from responder (calculated)
  - Time posted (relative: "5 mins ago")
  - Number of people affected
  - Brief description (truncated)
  - Status: Available, Responding (by someone else), Resolved
  - "View on Map" button (pans to marker)
  - "I'm Responding" button to claim the request

**Filters:**
- By help type (medical, food, shelter, rescue, other)
- By urgency (critical, urgent, standard)
- By status (available, all)
- Sort by: Distance, Time, Urgency

### 3. News/Updates Tab (Left Panel)

Timeline of disaster updates:
- Official alerts (aftershocks, evacuation orders)
- Relief organization announcements
- Safety advisories

Each update includes:
- Timestamp
- Source
- Severity badge
- Full description

### 4. Emergency Resources Tab (Both Roles)

**Available to both victims and responders**

Filterable list of nearby resources:
- Hospitals/Medical centers
- Emergency shelters
- Water distribution points
- Safe zones

Each resource shows:
- Type icon
- Name
- Distance from user
- Capacity status (if available)
- Operating hours/status
- "Get Directions" button

**Filters:**
- By resource type
- By distance
- By availability/capacity

### 5. Alerts Tab (Both Roles)

**Available to both victims and responders**

High-priority notifications:
- Immediate danger warnings (aftershocks, weather alerts)
- Evacuation notices
- Critical system updates
- Safe zone updates

### 6. News/Updates Tab (Both Roles)

**Available to both victims and responders**

Timeline of disaster updates:
- Official announcements from authorities
- Relief organization updates
- Safety advisories
- Recovery progress

## Project Structure

```
greatagent/
├── frontend/                # All frontend code
│   ├── src/
│   │   ├── components/
│   │   │   ├── ui/              # Shadcn components
│   │   │   │   ├── button.tsx
│   │   │   │   ├── card.tsx
│   │   │   │   ├── dialog.tsx
│   │   │   │   ├── sheet.tsx
│   │   │   │   ├── tabs.tsx
│   │   │   │   ├── toast.tsx
│   │   │   │   ├── badge.tsx
│   │   │   │   └── ...
│   │   │   ├── role/            # Role selection
│   │   │   │   └── RoleSelection.tsx
│   │   │   ├── map/             # Map-related components
│   │   │   │   ├── MapContainer.tsx
│   │   │   │   ├── CustomMarker.tsx
│   │   │   │   ├── MarkerCluster.tsx
│   │   │   │   └── DisasterBoundary.tsx
│   │   │   ├── panels/
│   │   │   │   ├── LeftPanel.tsx
│   │   │   │   ├── DetailPanel.tsx
│   │   │   │   ├── RequestHelpDialog.tsx
│   │   │   │   ├── HelpRequestsTab.tsx  # Responder only
│   │   │   │   ├── MyRequestsTab.tsx     # Victim only
│   │   │   │   ├── NewsTab.tsx
│   │   │   │   ├── ResourcesTab.tsx
│   │   │   │   └── AlertsTab.tsx
│   │   │   └── layout/
│   │   │       ├── Header.tsx
│   │   │       └── RequestHelpFAB.tsx    # Victim only
│   │   ├── lib/
│   │   │   ├── utils.ts         # Tailwind cn(), etc.
│   │   │   └── maps.ts          # Google Maps utilities
│   │   ├── hooks/
│   │   │   ├── useGeolocation.ts
│   │   │   ├── useMapMarkers.ts
│   │   │   └── useUserRole.ts   # Role management
│   │   ├── types/
│   │   │   └── index.ts         # TypeScript interfaces
│   │   ├── styles/
│   │   │   └── map-theme.ts     # Google Maps dark theme config
│   │   ├── data/
│   │   │   ├── mock-news.ts
│   │   │   ├── mock-resources.ts
│   │   │   └── mock-alerts.ts
│   │   ├── App.tsx
│   │   └── main.tsx
│   ├── public/
│   │   └── markers/             # Custom marker SVGs
│   ├── tailwind.config.js
│   ├── components.json          # Shadcn config
│   ├── tsconfig.json
│   ├── vite.config.ts
│   └── package.json
├── backend/                 # Empty for now
└── docs/
    └── plans/
```

## Key Type Definitions

```typescript
type UserRole = 'victim' | 'responder'
type HelpRequestType = 'medical' | 'food' | 'shelter' | 'rescue' | 'other'
type Urgency = 'critical' | 'urgent' | 'standard'
type ResourceType = 'hospital' | 'shelter' | 'water' | 'safe-zone'
type HelpRequestStatus = 'active' | 'responding' | 'resolved'

interface User {
  id: string
  role: UserRole
  location: { lat: number; lng: number }
}

interface HelpRequest {
  id: string
  victimId: string
  type: HelpRequestType
  urgency: Urgency
  location: { lat: number; lng: number }
  peopleCount: number
  description?: string
  timestamp: Date
  status: HelpRequestStatus
  responderId?: string  // ID of responder who claimed this request
}

interface EmergencyResource {
  id: string
  type: ResourceType
  name: string
  location: { lat: number; lng: number }
  capacity?: number
  currentOccupancy?: number
  operatingStatus: 'open' | 'full' | 'closed'
  contact?: string
}

interface NewsUpdate {
  id: string
  title: string
  content: string
  source: string
  severity: 'info' | 'warning' | 'critical'
  timestamp: Date
}

interface Alert {
  id: string
  title: string
  message: string
  severity: 'warning' | 'critical'
  timestamp: Date
  expiresAt?: Date
}
```

## Dependencies

```json
{
  "dependencies": {
    "react": "^18.3.0",
    "react-dom": "^18.3.0",
    "@googlemaps/js-api-loader": "^1.16.0",
    "@radix-ui/react-dialog": "^1.0.5",
    "@radix-ui/react-slot": "^1.0.2",
    "@radix-ui/react-tabs": "^1.0.4",
    "@radix-ui/react-toast": "^1.1.5",
    "class-variance-authority": "^0.7.0",
    "clsx": "^2.1.0",
    "tailwind-merge": "^2.2.0",
    "lucide-react": "^0.344.0",
    "date-fns": "^3.3.0"
  },
  "devDependencies": {
    "@types/react": "^18.2.55",
    "@types/react-dom": "^18.2.19",
    "@types/google.maps": "^3.55.0",
    "@vitejs/plugin-react": "^4.2.1",
    "typescript": "^5.2.2",
    "vite": "^5.1.0",
    "tailwindcss": "^3.4.1",
    "autoprefixer": "^10.4.17",
    "postcss": "^8.4.35"
  }
}
```

## Mock Data Approach

Since there's no backend yet:
- **User Role:** Stored in localStorage, managed by useUserRole hook
- **Help Requests:** Local state (useState/useReducer) + localStorage (simulates real-time updates)
- **News Updates:** Mock data file with sample updates
- **Emergency Resources:** Mock data file with sample locations
- **Alerts:** Mock data file with sample alerts
- **Geolocation:** Browser Geolocation API (with override for testing)
- **Responder Actions:** Stored in localStorage (tracking which responder claimed which request)

## Implementation Status

### ✅ COMPLETED

**Phase 1: Project Setup (100% Complete)**
- ✅ Initialized Vite + React + TypeScript in `frontend/` directory
- ✅ Configured Tailwind with custom glassmorphic dark theme
- ✅ Set up Shadcn/UI components (Button, Card, Dialog, Tabs)
- ✅ Installed Google Maps dependencies
- ✅ Created comprehensive type definitions

**Phase 2: Role Selection (100% Complete)**
- ✅ Built RoleSelection screen component
- ✅ Implemented useUserRole hook with localStorage
- ✅ Created role switching functionality
- ✅ Designed glassmorphic role selection cards
- ✅ Added DisasterSelectionDialog component

**Phase 3: Core Map (100% Complete)**
- ✅ Implemented MapContainer with Google Maps
- ✅ Added user location detection with UserLocationMarker component
- ✅ Created VictimMarkers component with custom styling
- ✅ Applied dark theme styling to map
- ✅ Conditional marker rendering based on user role
- ✅ Added HeatmapLayer for visualizing help request density
- ✅ Created HeatmapToggle button for layer control

**Phase 4: UI Layout (100% Complete)**
- ✅ Built Header component with role indicator
- ✅ Created RequestHelpFAB (victim role only)
- ✅ Implemented LeftPanel with role-specific tabs
- ✅ Built Dashboard component for main layout

**Data Layer (100% Complete)**
- ✅ Created mock-alerts.ts
- ✅ Created mock-disaster.ts
- ✅ Created mock-help-requests.ts
- ✅ Created mock-news.ts
- ✅ Created mock-resources.ts

**Hooks (100% Complete)**
- ✅ Implemented useGeolocation hook
- ✅ Implemented useUserRole hook
- ✅ Implemented useDisasterSelection hook

**Tab Components (Partial)**
- ✅ NewsTab component
- ✅ ResourcesTab component
- ✅ AlertsTab component
- ✅ HelpRequestList component (for responders)

### 🚧 IN PROGRESS / MISSING

**Missing UI Components:**
- ❌ Sheet component (Radix UI) - needed for slide-in panels
- ❌ Badge component - for urgency indicators
- ❌ Toast component - for notifications
- ❌ Select/Combobox - for filters

**Missing Features:**

**Phase 5: Victim Features**
- ❌ Request Help dialog form (dialog exists, needs form implementation)
- ❌ MyRequestsTab showing victim's own requests
- ❌ Proper integration of Emergency Resources, News, and Alerts tabs into LeftPanel

**Phase 6: Responder Features**
- ✅ Help Requests feed (HelpRequestList exists)
- ❌ Filters for help requests (type, urgency, distance, sort)
- ❌ "I'm Responding" action to claim requests
- ❌ Status updates when responders claim requests
- ❌ Integration with map markers

**Phase 7: Map Interactions**
- ❌ Marker clustering (Google Maps MarkerClusterer)
- ❌ Click handlers opening right detail panel/sheet
- ❌ Search/autocomplete with Google Places API
- ❌ Layer toggles for different marker types
- ❌ Directions integration (Get Directions button)

**Phase 8: Polish**
- ❌ Responsive design refinement
- ❌ Smooth animations and transitions
- ❌ Toast notifications for actions
- ❌ Loading states and skeletons
- ❌ Error handling
- ❌ Role switching confirmation dialogs

**Right Detail Panel:**
- ❌ DetailPanel component (Sheet) that slides from right
- ❌ Shows help request details when clicking markers
- ❌ Shows resource details when clicking resource markers
- ❌ Action buttons (Get Directions, Mark Responding for responders)

## Implementation Priorities (Remaining Work)

1. **Phase 5A: Install Missing Shadcn Components**
   - Install Sheet component for slide-in panels
   - Install Badge component for status indicators
   - Install Toast component for notifications
   - Install Select component for filters

2. **Phase 5B: Complete Victim Features**
   - Implement Request Help form in dialog
   - Create MyRequestsTab component
   - Wire up all tabs in LeftPanel based on role

3. **Phase 6: Complete Responder Features**
   - Add filter UI to HelpRequestList (type, urgency, status, sort)
   - Implement "I'm Responding" action
   - Update request status in localStorage
   - Show claimed status on markers

4. **Phase 7A: Right Detail Panel**
   - Create DetailPanel component (Sheet)
   - Wire up marker click handlers
   - Show help request details
   - Show resource details
   - Add action buttons (Get Directions, etc.)

5. **Phase 7B: Map Interactions**
   - Add marker clustering for dense areas
   - Implement search with Google Places autocomplete
   - Add layer toggles (resources, help requests, heatmap)
   - Integrate Google Directions API

6. **Phase 8: Polish & Refinement**
   - Add responsive breakpoints
   - Smooth animations for panels
   - Toast notifications for all actions
   - Loading skeletons
   - Error boundaries
   - Confirmation dialogs for critical actions

## Success Criteria

- App loads and shows role selection screen
- User can choose between victim and responder roles
- Role persists across page refreshes
- User location is detected automatically
- Map displays with dark glassmorphic theme styling

**Victim Role:**
- Can create help requests via FAB
- Help requests stored and shown in "My Requests" tab
- Can see emergency resources on map
- Cannot see other victims' help requests
- Can view news, alerts, and resources

**Responder Role:**
- Can see all nearby help requests on map as markers
- Can filter help requests by type, urgency, status
- Can claim requests with "I'm Responding" action
- Cannot create help requests (no FAB visible)
- Can view news, alerts, and resources

**General:**
- Panels slide in/out smoothly
- All tabs show relevant mock data
- Responsive on mobile and desktop
- Glassmorphic theme applied consistently
- User can switch roles via settings
