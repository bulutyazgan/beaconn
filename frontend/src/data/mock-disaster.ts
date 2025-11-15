import type { DisasterInfo } from '@/types';

// Example disaster: Earthquake in Istanbul, Turkey
export const mockDisasterInfo: DisasterInfo = {
  name: 'Istanbul Earthquake',
  date: 'Feb 6, 2025',
  location: 'Istanbul, Turkey',
  boundary: [
    { lat: 41.0200, lng: 28.9600 },
    { lat: 41.0200, lng: 29.0000 },
    { lat: 40.9900, lng: 29.0000 },
    { lat: 40.9900, lng: 28.9600 },
  ],
};

// Default center location (Istanbul city center)
export const defaultCenter = { lat: 41.0082, lng: 28.9784 };
