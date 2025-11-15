# Help Request Heatmap Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Add a toggleable heatmap overlay to visualize help request density on Google Maps, weighted by people count and urgency.

**Architecture:** Create `HeatmapLayer` component using Google Maps Visualization API, add toggle button UI control, integrate with existing `MapContainer` to share filtered help request data with `VictimMarkers`.

**Tech Stack:** React, TypeScript, Google Maps JavaScript API (visualization library), Tailwind CSS (glassmorphic styling)

---

## Task 1: Add TypeScript Definitions for Visualization API

**Files:**
- Modify: `frontend/src/types/google-maps.d.ts`

**Step 1: Extend TypeScript definitions**

Add visualization library type definitions to support heatmap API:

```typescript
// Declare google maps on window
declare global {
  interface Window {
    google: typeof google;
  }
}

// Add visualization library types
declare namespace google.maps.visualization {
  class HeatmapLayer {
    constructor(opts?: HeatmapLayerOptions);
    getData(): MVCArray<LatLng | WeightedLocation>;
    getMap(): google.maps.Map | null;
    setData(data: MVCArray<LatLng | WeightedLocation> | Array<LatLng | WeightedLocation>): void;
    setMap(map: google.maps.Map | null): void;
    setOptions(options: HeatmapLayerOptions): void;
  }

  interface HeatmapLayerOptions {
    data: MVCArray<LatLng | WeightedLocation> | Array<LatLng | WeightedLocation>;
    dissipating?: boolean;
    gradient?: string[];
    map?: google.maps.Map | null;
    maxIntensity?: number;
    opacity?: number;
    radius?: number;
  }

  interface WeightedLocation {
    location: google.maps.LatLng;
    weight: number;
  }
}

export {};
```

**Step 2: Verify TypeScript compiles**

Run: `cd frontend && npm run build`
Expected: No TypeScript errors related to visualization types

**Step 3: Commit**

```bash
git add frontend/src/types/google-maps.d.ts
git commit -m "feat: add TypeScript definitions for Google Maps visualization API"
```

---

## Task 2: Create HeatmapLayer Component

**Files:**
- Create: `frontend/src/components/map/HeatmapLayer.tsx`

**Step 1: Create the HeatmapLayer component skeleton**

```typescript
import { useEffect, useRef } from 'react';
import { importLibrary } from '@googlemaps/js-api-loader';
import type { HelpRequest } from '@/types';

interface HeatmapLayerProps {
  map: any; // Google Maps Map instance
  helpRequests: HelpRequest[];
  visible: boolean;
}

export function HeatmapLayer({ map, helpRequests, visible }: HeatmapLayerProps) {
  const heatmapRef = useRef<google.maps.visualization.HeatmapLayer | null>(null);

  useEffect(() => {
    if (!map || !window.google) return;

    const initHeatmap = async () => {
      try {
        // Load visualization library
        await importLibrary('visualization');

        // This will be implemented in next step
      } catch (err) {
        console.error('Error loading visualization library:', err);
      }
    };

    initHeatmap();

    // Cleanup
    return () => {
      if (heatmapRef.current) {
        heatmapRef.current.setMap(null);
        heatmapRef.current = null;
      }
    };
  }, [map]);

  return null; // This component doesn't render anything in React
}
```

**Step 2: Implement weight calculation helper**

Add this function inside the component before the useEffect:

```typescript
const calculateWeightedPoints = (
  requests: HelpRequest[]
): google.maps.visualization.WeightedLocation[] => {
  const urgencyMultipliers = {
    critical: 3,
    high: 2,
    medium: 1.5,
    low: 1,
  };

  return requests.map((request) => ({
    location: new window.google.maps.LatLng(
      request.location.lat,
      request.location.lng
    ),
    weight: request.peopleCount * urgencyMultipliers[request.urgency],
  }));
};
```

**Step 3: Implement heatmap initialization in useEffect**

Replace the `// This will be implemented in next step` comment with:

```typescript
// Calculate weighted points
const weightedPoints = calculateWeightedPoints(helpRequests);

// Create heatmap layer
const heatmap = new window.google.maps.visualization.HeatmapLayer({
  data: weightedPoints,
  map: visible ? map : null,
  radius: 40,
  opacity: 0.6,
  gradient: [
    'rgba(0, 255, 255, 0)',
    'rgba(0, 255, 255, 1)',
    'rgba(0, 191, 255, 1)',
    'rgba(0, 127, 255, 1)',
    'rgba(0, 63, 255, 1)',
    'rgba(0, 0, 255, 1)',
    'rgba(0, 0, 223, 1)',
    'rgba(0, 0, 191, 1)',
    'rgba(0, 0, 159, 1)',
    'rgba(0, 0, 127, 1)',
    'rgba(63, 0, 91, 1)',
    'rgba(127, 0, 63, 1)',
    'rgba(191, 0, 31, 1)',
    'rgba(255, 0, 0, 1)',
  ],
});

heatmapRef.current = heatmap;
```

**Step 4: Add effect to update heatmap data when requests change**

Add a new useEffect after the initialization effect:

```typescript
// Update heatmap data when help requests change
useEffect(() => {
  if (!heatmapRef.current || !window.google || helpRequests.length === 0) return;

  const weightedPoints = calculateWeightedPoints(helpRequests);
  heatmapRef.current.setData(weightedPoints);
}, [helpRequests]);
```

**Step 5: Add effect to toggle visibility**

Add another useEffect for visibility control:

```typescript
// Toggle heatmap visibility
useEffect(() => {
  if (!heatmapRef.current) return;

  heatmapRef.current.setMap(visible ? map : null);
}, [visible, map]);
```

**Step 6: Verify TypeScript compiles**

Run: `cd frontend && npm run build`
Expected: No TypeScript errors

**Step 7: Commit**

```bash
git add frontend/src/components/map/HeatmapLayer.tsx
git commit -m "feat: create HeatmapLayer component with weighted visualization"
```

---

## Task 3: Create HeatmapToggle Button Component

**Files:**
- Create: `frontend/src/components/map/HeatmapToggle.tsx`

**Step 1: Create the toggle button component**

```typescript
import { Flame } from 'lucide-react';

interface HeatmapToggleProps {
  visible: boolean;
  onToggle: () => void;
}

export function HeatmapToggle({ visible, onToggle }: HeatmapToggleProps) {
  return (
    <button
      onClick={onToggle}
      className="glass hover:bg-background-elevated transition-all duration-200 rounded-lg p-3 shadow-lg"
      title={visible ? 'Hide Heatmap' : 'Show Heatmap'}
      aria-label={visible ? 'Hide Heatmap' : 'Show Heatmap'}
      style={{
        border: visible ? '1px solid var(--accent-red)' : '1px solid var(--glass-border)',
      }}
    >
      <Flame
        size={20}
        color={visible ? 'var(--accent-red)' : '#9ca3af'}
        fill={visible ? 'var(--accent-red)' : 'none'}
      />
    </button>
  );
}
```

**Step 2: Verify TypeScript compiles**

Run: `cd frontend && npm run build`
Expected: No TypeScript errors

**Step 3: Commit**

```bash
git add frontend/src/components/map/HeatmapToggle.tsx
git commit -m "feat: create HeatmapToggle button with glassmorphic styling"
```

---

## Task 4: Integrate Heatmap into MapContainer

**Files:**
- Modify: `frontend/src/components/map/MapContainer.tsx`

**Step 1: Add imports at the top of the file**

Add after the existing imports:

```typescript
import { HeatmapLayer } from './HeatmapLayer';
import { HeatmapToggle } from './HeatmapToggle';
```

**Step 2: Add state for heatmap visibility**

Add after the existing state declarations (around line 24):

```typescript
const [showHeatmap, setShowHeatmap] = useState(false);
```

**Step 3: Add HeatmapLayer component**

In the return statement, add the HeatmapLayer after the VictimMarkers component (around line 92):

```typescript
{/* Victim markers */}
<VictimMarkers
  map={map}
  helpRequests={helpRequests}
  onMarkerClick={onMarkerClick}
/>

{/* Heatmap layer */}
<HeatmapLayer
  map={map}
  helpRequests={helpRequests}
  visible={showHeatmap}
/>
```

**Step 4: Add HeatmapToggle button**

Add the toggle button UI after the error overlay (around line 120), before the closing div:

```typescript
{/* Heatmap toggle button */}
{map && !loading && !error && (
  <div className="absolute top-4 right-4 z-10">
    <HeatmapToggle
      visible={showHeatmap}
      onToggle={() => setShowHeatmap(!showHeatmap)}
    />
  </div>
)}
```

**Step 5: Verify TypeScript compiles**

Run: `cd frontend && npm run build`
Expected: No TypeScript errors

**Step 6: Commit**

```bash
git add frontend/src/components/map/MapContainer.tsx
git commit -m "feat: integrate heatmap layer and toggle button into MapContainer"
```

---

## Task 5: Manual Testing and Verification

**Step 1: Start the development server**

Run: `cd frontend && npm run dev`
Expected: Server starts without errors

**Step 2: Test basic heatmap functionality**

1. Open browser to the app URL
2. Select a disaster and role to view the map
3. Verify victim markers are displayed
4. Click the flame icon in the top-right
5. Expected: Heatmap overlay appears showing heat intensity
6. Click flame icon again
7. Expected: Heatmap disappears

**Step 3: Test weight calculation**

1. With heatmap visible, observe the heat intensity
2. Areas with critical requests should show more intense red
3. Areas with high people counts should show more intense heat
4. Example: "help-006" (12 people, high urgency) should show very hot
5. Example: "help-003" (1 person, high urgency) should show less hot

**Step 4: Test filter integration (if filters exist)**

1. If the app has filters for urgency/type, apply a filter
2. Expected: Heatmap updates to show only filtered requests
3. Remove filter
4. Expected: Heatmap returns to showing all requests

**Step 5: Test edge cases**

1. Toggle heatmap with no help requests (empty array)
2. Expected: No errors, heatmap handles gracefully
3. Zoom in/out on the map
4. Expected: Heatmap scales appropriately

**Step 6: Document any issues found**

Create a list of any bugs or unexpected behavior for follow-up fixes.

---

## Task 6: Final Build and Commit

**Step 1: Run production build**

Run: `cd frontend && npm run build`
Expected: Build succeeds with no errors or warnings

**Step 2: Test production build locally**

Run: `cd frontend && npm run preview`
Expected: Production build works correctly, heatmap functions as expected

**Step 3: Final verification commit**

```bash
git add -A
git commit -m "test: verify heatmap feature works in production build"
```

---

## Success Criteria Checklist

- [ ] Heatmap appears/disappears when toggle button is clicked
- [ ] Heatmap uses red-based gradient (blue → purple → red)
- [ ] Weight calculation combines people count × urgency multiplier
- [ ] Critical requests (3x) show hotter than low urgency (1x)
- [ ] Requests with more people show hotter than fewer people
- [ ] Heatmap updates when help requests change
- [ ] Toggle button uses glassmorphic styling matching app theme
- [ ] Flame icon changes color/fill based on visibility state
- [ ] No TypeScript errors
- [ ] No console errors in browser
- [ ] Production build succeeds
- [ ] Performance is acceptable with 100+ help requests

---

## Notes for Implementation

- **YAGNI**: Don't add max intensity controls or advanced configuration unless needed
- **DRY**: Weight calculation logic is encapsulated in one helper function
- **Performance**: Heatmap instance is preserved when hidden (not recreated)
- **Accessibility**: Toggle button has proper aria-label and title attributes
- **Visual Design**: Matches existing glassmorphic UI with accent-red when active

## Follow-up Improvements (Not in Scope)

- Add max intensity slider for user control
- Add different gradient presets (blue-purple theme)
- Add animation transitions when toggling
- Add keyboard shortcuts for toggle
- Add heatmap legend showing intensity scale
