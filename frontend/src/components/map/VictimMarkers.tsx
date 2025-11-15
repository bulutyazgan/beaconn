import { useEffect } from 'react';
import type { HelpRequest } from '@/types';

interface VictimMarkersProps {
  map: any; // Google Maps Map instance
  helpRequests: HelpRequest[];
  onMarkerClick?: (request: HelpRequest) => void;
}

// Color coding based on urgency
const getMarkerColor = (urgency: string): string => {
  switch (urgency) {
    case 'critical':
      return '#ef4444'; // Red
    case 'high':
      return '#f59e0b'; // Orange
    case 'medium':
      return '#eab308'; // Yellow
    case 'low':
      return '#10b981'; // Green
    default:
      return '#6b7280'; // Gray
  }
};

export function VictimMarkers({ map, helpRequests, onMarkerClick }: VictimMarkersProps) {
  useEffect(() => {
    if (!map || !window.google) return;

    // Store markers so we can clean them up
    const markers: any[] = [];

    // Add a marker for each help request
    helpRequests.forEach((request) => {
      const marker = new window.google.maps.Marker({
        position: request.location,
        map: map,
        title: `${request.userName} - ${request.type}`,
        icon: {
          path: window.google.maps.SymbolPath.CIRCLE,
          fillColor: getMarkerColor(request.urgency),
          fillOpacity: 0.9,
          strokeColor: '#ffffff',
          strokeWeight: 2,
          scale: request.urgency === 'critical' ? 12 : 8,
        },
        animation: request.urgency === 'critical' ? window.google.maps.Animation.BOUNCE : undefined,
      });

      // Add click listener
      marker.addListener('click', () => {
        if (onMarkerClick) {
          onMarkerClick(request);
        }
      });

      markers.push(marker);
    });

    // Cleanup function to remove markers when component unmounts or dependencies change
    return () => {
      markers.forEach((marker) => marker.setMap(null));
    };
  }, [map, helpRequests, onMarkerClick]);

  return null; // This component doesn't render anything in React
}
