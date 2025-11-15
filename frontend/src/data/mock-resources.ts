import type { EmergencyResource } from '@/types';

// These are sample locations around Istanbul, Turkey (example disaster location)
// In production, these would be dynamically loaded based on actual disaster location
export const mockResources: EmergencyResource[] = [
  {
    id: '1',
    type: 'hospital',
    name: 'Central Emergency Medical Center',
    location: { lat: 41.0082, lng: 28.9784 },
    capacity: 500,
    currentOccupancy: 320,
    operatingStatus: 'open',
    contact: '+90 212 XXX XXXX',
  },
  {
    id: '2',
    type: 'shelter',
    name: 'Stadium Emergency Shelter',
    location: { lat: 41.0122, lng: 28.9844 },
    capacity: 2000,
    currentOccupancy: 1450,
    operatingStatus: 'open',
    contact: '+90 212 XXX XXXY',
  },
  {
    id: '3',
    type: 'shelter',
    name: 'School Shelter - District 5',
    location: { lat: 41.0042, lng: 28.9724 },
    capacity: 800,
    currentOccupancy: 800,
    operatingStatus: 'full',
    contact: '+90 212 XXX XXXZ',
  },
  {
    id: '4',
    type: 'water',
    name: 'Central Park Water Distribution',
    location: { lat: 41.0102, lng: 28.9804 },
    operatingStatus: 'open',
  },
  {
    id: '5',
    type: 'water',
    name: 'North District Water Point',
    location: { lat: 41.0162, lng: 28.9864 },
    operatingStatus: 'open',
  },
  {
    id: '6',
    type: 'safe-zone',
    name: 'Open Field Safe Zone A',
    location: { lat: 41.0062, lng: 28.9744 },
    operatingStatus: 'open',
  },
  {
    id: '7',
    type: 'safe-zone',
    name: 'Park Safe Zone B',
    location: { lat: 41.0142, lng: 28.9824 },
    operatingStatus: 'open',
  },
  {
    id: '8',
    type: 'hospital',
    name: 'Field Hospital - North Sector',
    location: { lat: 41.0152, lng: 28.9854 },
    capacity: 150,
    currentOccupancy: 95,
    operatingStatus: 'open',
    contact: '+90 212 XXX XXXW',
  },
];
