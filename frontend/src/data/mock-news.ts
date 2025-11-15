import type { NewsUpdate } from '@/types';

export const mockNews: NewsUpdate[] = [
  {
    id: '1',
    title: 'Emergency Response Teams Deployed',
    content: 'International emergency response teams have arrived and are setting up medical facilities in the main stadium. All medical emergencies should be directed there.',
    source: 'Emergency Management Office',
    severity: 'info',
    timestamp: new Date(Date.now() - 20 * 60 * 1000), // 20 minutes ago
  },
  {
    id: '2',
    title: 'Power Restoration Update',
    content: 'Power has been restored to sectors 3, 5, and 7. Work continues in other areas. Estimated full restoration in 48 hours.',
    source: 'City Utilities',
    severity: 'info',
    timestamp: new Date(Date.now() - 60 * 60 * 1000), // 1 hour ago
  },
  {
    id: '3',
    title: 'Weather Alert - Heavy Rain Expected',
    content: 'Heavy rainfall expected in the next 12 hours. This may complicate rescue operations and increase risk of landslides in damaged areas.',
    source: 'National Weather Service',
    severity: 'warning',
    timestamp: new Date(Date.now() - 90 * 60 * 1000), // 1.5 hours ago
  },
  {
    id: '4',
    title: 'Food Distribution Schedule',
    content: 'Food distribution will occur at designated safe zones twice daily at 10:00 AM and 6:00 PM. Bring identification if possible.',
    source: 'Red Crescent Society',
    severity: 'info',
    timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000), // 2 hours ago
  },
  {
    id: '5',
    title: 'Communication Networks Partially Restored',
    content: 'Mobile networks are now operational in most areas. Emergency hotline: 112 is fully functional.',
    source: 'Telecom Authority',
    severity: 'info',
    timestamp: new Date(Date.now() - 3 * 60 * 60 * 1000), // 3 hours ago
  },
];
