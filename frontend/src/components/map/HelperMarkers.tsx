import { useEffect } from 'react';

export interface Helper {
  user_id: number;
  name: string;
  contact_info: string | null;
  skills: string[];
  max_range: number | null;
  location: {
    latitude: number;
    longitude: number;
  };
  last_updated: string | null;
  distance_km: number;
}

interface HelperMarkersProps {
  map: google.maps.Map | null;
  helpers: Helper[];
  onHelperClick?: (helper: Helper) => void;
}

export function HelperMarkers({ map, helpers, onHelperClick }: HelperMarkersProps) {
  useEffect(() => {
    if (!map || !window.google) return;

    const markers: google.maps.Marker[] = [];
    const infoWindows: google.maps.InfoWindow[] = [];

    helpers.forEach((helper) => {
      if (!helper.location.latitude || !helper.location.longitude) return;

      const position = {
        lat: helper.location.latitude,
        lng: helper.location.longitude,
      };

      // Create custom blue shield icon for helpers
      const icon = {
        path: 'M12 1L3 5v6c0 5.55 3.84 10.74 9 12 5.16-1.26 9-6.45 9-12V5l-9-4z',
        fillColor: '#3B82F6',
        fillOpacity: 0.8,
        strokeColor: '#1E40AF',
        strokeWeight: 2,
        scale: 1.5,
        anchor: new window.google.maps.Point(12, 24),
      };

      const marker = new window.google.maps.Marker({
        position,
        map,
        title: helper.name,
        icon,
        zIndex: 100, // Lower than victim markers
      });

      // Create info window
      const skillsHTML = helper.skills
        .map(skill => `<span style="
          background-color: rgba(59, 130, 246, 0.2);
          border: 1px solid rgba(59, 130, 246, 0.4);
          padding: 2px 8px;
          border-radius: 4px;
          font-size: 11px;
          color: #60A5FA;
          margin-right: 4px;
          display: inline-block;
          margin-top: 2px;
        ">${skill.replace('_', ' ')}</span>`)
        .join('');

      const rangeInfo = helper.max_range
        ? `<div style="font-size: 12px; color: #9CA3AF; margin-top: 4px;">Range: ${helper.max_range}m</div>`
        : '';

      const distanceInfo = `<div style="font-size: 12px; color: #9CA3AF; margin-top: 2px;">${helper.distance_km.toFixed(1)}km away</div>`;

      const content = `
        <div style="
          padding: 8px;
          font-family: system-ui, -apple-system, sans-serif;
          min-width: 200px;
        ">
          <div style="display: flex; align-items: center; gap: 8px; margin-bottom: 8px;">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="#3B82F6">
              <path d="M12 1L3 5v6c0 5.55 3.84 10.74 9 12 5.16-1.26 9-6.45 9-12V5l-9-4z"/>
            </svg>
            <div style="font-weight: 600; color: #1F2937; font-size: 14px;">
              ${helper.name}
            </div>
          </div>

          <div style="margin-top: 8px;">
            <div style="font-size: 12px; color: #6B7280; margin-bottom: 4px;">Skills:</div>
            <div>${skillsHTML}</div>
          </div>

          ${distanceInfo}
          ${rangeInfo}

          <div style="
            margin-top: 12px;
            padding-top: 8px;
            border-top: 1px solid #E5E7EB;
            font-size: 11px;
            color: #9CA3AF;
          ">
            Available helper • Click to request assistance
          </div>
        </div>
      `;

      const infoWindow = new window.google.maps.InfoWindow({
        content,
      });

      // Show info window on hover
      marker.addListener('mouseover', () => {
        infoWindows.forEach(iw => iw.close());
        infoWindow.open(map, marker);
      });

      // Optional: close on mouseout
      marker.addListener('mouseout', () => {
        infoWindow.close();
      });

      // Handle click
      if (onHelperClick) {
        marker.addListener('click', () => {
          onHelperClick(helper);
        });
      }

      markers.push(marker);
      infoWindows.push(infoWindow);
    });

    // Cleanup function
    return () => {
      markers.forEach((marker) => marker.setMap(null));
      infoWindows.forEach((infoWindow) => infoWindow.close());
    };
  }, [map, helpers, onHelperClick]);

  return null;
}
