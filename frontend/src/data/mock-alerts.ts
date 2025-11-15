import type { Alert } from '@/types';

export const mockAlerts: Alert[] = [
  {
    id: '1',
    title: 'Aftershock Warning',
    message: 'Seismologists predict possible aftershocks in the next 6 hours. Stay away from damaged buildings and move to open areas.',
    severity: 'critical',
    timestamp: new Date(Date.now() - 10 * 60 * 1000), // 10 minutes ago
  },
  {
    id: '2',
    title: 'Evacuation Order - Zone A',
    message: 'Immediate evacuation required for Zone A due to structural damage risk. Proceed to designated safe zones.',
    severity: 'critical',
    timestamp: new Date(Date.now() - 30 * 60 * 1000), // 30 minutes ago
  },
  {
    id: '3',
    title: 'Water Distribution Point Open',
    message: 'New water distribution point opened at Central Park. Bring containers.',
    severity: 'warning',
    timestamp: new Date(Date.now() - 45 * 60 * 1000), // 45 minutes ago
    expiresAt: new Date(Date.now() + 12 * 60 * 60 * 1000), // 12 hours from now
  },
];
