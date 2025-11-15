import { useEffect } from 'react';
import type { Location } from '@/types';

interface UserLocationMarkerProps {
  map: any; // Google Maps Map instance
  userLocation: Location | null;
}

export function UserLocationMarker({ map, userLocation }: UserLocationMarkerProps) {
  useEffect(() => {
    if (!map || !window.google || !userLocation) return;

    // Create a blue marker for user's location
    const marker = new window.google.maps.Marker({
      position: userLocation,
      map: map,
      title: 'Your Location',
      icon: {
        path: window.google.maps.SymbolPath.CIRCLE,
        fillColor: '#3b82f6', // Blue color
        fillOpacity: 1,
        strokeColor: '#ffffff',
        strokeWeight: 3,
        scale: 10,
      },
      zIndex: 1000, // Ensure it appears on top of other markers
    });

    // Create a pulsing circle effect around the user marker
    const pulseCircle = new window.google.maps.Circle({
      map: map,
      center: userLocation,
      radius: 50, // 50 meters radius
      fillColor: '#3b82f6',
      fillOpacity: 0.15,
      strokeColor: '#3b82f6',
      strokeOpacity: 0.4,
      strokeWeight: 2,
      zIndex: 999,
    });

    // Create info window for user location
    const infoContent = `
      <div style="
        background: linear-gradient(135deg, rgba(59, 130, 246, 0.95) 0%, rgba(37, 99, 235, 0.98) 100%);
        backdrop-filter: blur(20px);
        border-radius: 12px;
        border: 1px solid rgba(255, 255, 255, 0.2);
        padding: 12px 16px;
        min-width: 180px;
        box-shadow: 0 10px 30px rgba(0, 0, 0, 0.4);
        font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
      ">
        <div style="
          font-weight: 700;
          font-size: 14px;
          color: #ffffff;
          text-align: center;
          text-shadow: 0 2px 4px rgba(0, 0, 0, 0.2);
        ">
          📍 Your Location
        </div>
      </div>
    `;

    const infoWindow = new window.google.maps.InfoWindow({
      content: infoContent,
      disableAutoPan: true,
    });

    // Show info window on hover
    marker.addListener('mouseover', () => {
      infoWindow.open(map, marker);
    });

    // Hide info window when mouse leaves
    marker.addListener('mouseout', () => {
      infoWindow.close();
    });

    // Cleanup function to remove marker, circle, and info window
    return () => {
      marker.setMap(null);
      pulseCircle.setMap(null);
      infoWindow.close();
    };
  }, [map, userLocation]);

  return null; // This component doesn't render anything in React
}
