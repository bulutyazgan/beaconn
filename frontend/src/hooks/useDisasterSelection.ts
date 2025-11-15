import { useState, useEffect } from 'react';
import type { DisasterInfo, UserRole } from '@/types';
import { findNearbyDisasters, getDisasterById, mockActiveDisasters } from '@/data/mock-disaster';

const DISASTER_STORAGE_KEY = 'selected_disaster';

interface UseDisasterSelectionReturn {
  selectedDisaster: DisasterInfo | null;
  selectDisaster: (disasterId: string) => void;
  clearDisaster: () => void;
  nearbyDisasters: DisasterInfo[];
  allDisasters: DisasterInfo[];
}

export function useDisasterSelection(
  userLocation: { lat: number; lng: number } | null,
  _userRole: UserRole | null
): UseDisasterSelectionReturn {
  const [selectedDisaster, setSelectedDisaster] = useState<DisasterInfo | null>(null);

  const [nearbyDisasters, setNearbyDisasters] = useState<DisasterInfo[]>([]);

  // Find nearby disasters and auto-select closest one
  useEffect(() => {
    if (userLocation) {
      const nearby = findNearbyDisasters(userLocation.lat, userLocation.lng);
      setNearbyDisasters(nearby);

      // Auto-select the closest disaster if user hasn't selected one
      if (!selectedDisaster && nearby.length > 0) {
        // Select the most severe disaster first, then by proximity
        const mostSevere = nearby.sort((a, b) => {
          const severityOrder = { catastrophic: 4, severe: 3, moderate: 2, minor: 1 };
          return severityOrder[b.severity] - severityOrder[a.severity];
        })[0];
        selectDisaster(mostSevere.id);
      }
    } else {
      setNearbyDisasters([]);
    }
  }, [userLocation]);

  const selectDisaster = (disasterId: string) => {
    const disaster = getDisasterById(disasterId);
    if (disaster) {
      setSelectedDisaster(disaster);
      localStorage.setItem(DISASTER_STORAGE_KEY, disasterId);
    }
  };

  const clearDisaster = () => {
    setSelectedDisaster(null);
    localStorage.removeItem(DISASTER_STORAGE_KEY);
  };

  return {
    selectedDisaster,
    selectDisaster,
    clearDisaster,
    nearbyDisasters,
    allDisasters: mockActiveDisasters,
  };
}
