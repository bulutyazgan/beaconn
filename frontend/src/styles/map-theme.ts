// Minimal dark theme - hide everything except basic land/water distinction
export const darkMapTheme: any[] = [
  // Base map - dark background
  {
    elementType: "geometry",
    stylers: [{ color: "#0a0a0a" }], // Very dark background
  },
  // Hide all labels
  {
    elementType: "labels",
    stylers: [{ visibility: "off" }],
  },
  // Hide all POIs
  {
    featureType: "poi",
    stylers: [{ visibility: "off" }],
  },
  // Hide all roads
  {
    featureType: "road",
    stylers: [{ visibility: "off" }],
  },
  // Hide transit (including airports)
  {
    featureType: "transit",
    stylers: [{ visibility: "off" }],
  },
  // Keep water visible for geographic context
  {
    featureType: "water",
    elementType: "geometry",
    stylers: [{ color: "#0f1e2e" }],
  },
  // Hide administrative boundaries
  {
    featureType: "administrative",
    stylers: [{ visibility: "off" }],
  },
];

// Map options for disaster zone
export const defaultMapOptions: any = {
  styles: darkMapTheme,
  disableDefaultUI: true,
  zoomControl: true,
  mapTypeControl: false,
  streetViewControl: false,
  fullscreenControl: true,
  clickableIcons: false,
  gestureHandling: 'greedy',
};
