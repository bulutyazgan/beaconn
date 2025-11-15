import { useEffect, useRef, useState } from 'react';
import { setOptions, importLibrary } from '@googlemaps/js-api-loader';
import type { Location } from '@/types';
import { defaultMapOptions } from '@/styles/map-theme';

interface MapContainerProps {
  center: Location;
  zoom?: number;
  onMapLoad?: (map: any) => void;
}

// Note: You'll need to add your Google Maps API key
const GOOGLE_MAPS_API_KEY = import.meta.env.VITE_GOOGLE_MAPS_API_KEY || 'YOUR_API_KEY_HERE';

// Configure the API globally
setOptions({
  key: GOOGLE_MAPS_API_KEY,
  v: 'weekly',
});

export function MapContainer({ center, zoom = 15, onMapLoad }: MapContainerProps) {
  const mapRef = useRef<HTMLDivElement>(null);
  const [map, setMap] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!mapRef.current) return;

    const initMap = async () => {
      try {
        const { Map } = await importLibrary('maps');

        if (!mapRef.current) return;

        const mapInstance = new Map(mapRef.current, {
          ...defaultMapOptions,
          center,
          zoom,
        });

        setMap(mapInstance);
        setLoading(false);

        if (onMapLoad) {
          onMapLoad(mapInstance);
        }
      } catch (err) {
        console.error('Error loading Google Maps:', err);
        setError('Failed to load map. Please check your API key.');
        setLoading(false);
      }
    };

    initMap();
  }, []);

  // Update center when it changes
  useEffect(() => {
    if (map && center) {
      map.setCenter(center);
    }
  }, [map, center]);

  if (error) {
    return (
      <div className="w-full h-full flex items-center justify-center bg-background-secondary">
        <div className="glass p-6 rounded-lg max-w-md text-center">
          <p className="text-accent-red mb-2">Map Error</p>
          <p className="text-sm text-gray-400">{error}</p>
          <p className="text-xs text-gray-500 mt-4">
            Add VITE_GOOGLE_MAPS_API_KEY to your .env file
          </p>
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="w-full h-full flex items-center justify-center bg-background-secondary">
        <div className="glass p-6 rounded-lg">
          <p className="text-accent-blue">Loading map...</p>
        </div>
      </div>
    );
  }

  return (
    <div
      ref={mapRef}
      className="w-full h-full"
      style={{ minHeight: '400px' }}
    />
  );
}
