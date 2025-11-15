import type { HelpRequest } from '@/types';

// Mock help requests for London Earthquake
export const mockHelpRequests: HelpRequest[] = [
  {
    id: 'help-001',
    disasterId: 'london-eq-2025',
    userId: 'user-001',
    userName: 'Sarah Johnson',
    location: { lat: 51.5145, lng: -0.1270 }, // Near King's Cross
    urgency: 'critical',
    type: 'medical',
    description: 'Elderly person trapped in collapsed building. Needs immediate medical attention. Difficulty breathing.',
    status: 'pending',
    createdAt: new Date('2025-11-15T08:30:00'),
    peopleCount: 2,
  },
  {
    id: 'help-002',
    disasterId: 'london-eq-2025',
    userId: 'user-002',
    userName: 'James Mitchell',
    location: { lat: 51.5074, lng: -0.0877 }, // Near Tower Bridge
    urgency: 'high',
    type: 'rescue',
    description: 'Family of 4 stuck on 3rd floor. Stairway blocked by debris. Children present.',
    status: 'pending',
    createdAt: new Date('2025-11-15T08:45:00'),
    peopleCount: 4,
  },
  {
    id: 'help-003',
    disasterId: 'london-eq-2025',
    userId: 'user-003',
    userName: 'Emily Chen',
    location: { lat: 51.5155, lng: -0.1415 }, // Near Oxford Street
    urgency: 'high',
    type: 'medical',
    description: 'Person with leg injury, unable to walk. Building structure unstable.',
    status: 'pending',
    createdAt: new Date('2025-11-15T09:00:00'),
    peopleCount: 1,
  },
  {
    id: 'help-004',
    disasterId: 'london-eq-2025',
    userId: 'user-004',
    userName: 'Mohammed Ali',
    location: { lat: 51.4975, lng: -0.1357 }, // Near Westminster
    urgency: 'medium',
    type: 'food',
    description: 'Group of 8 people sheltering in basement. Need food and water supplies.',
    status: 'pending',
    createdAt: new Date('2025-11-15T09:15:00'),
    peopleCount: 8,
  },
  {
    id: 'help-005',
    disasterId: 'london-eq-2025',
    userId: 'user-005',
    userName: 'Laura Williams',
    location: { lat: 51.5033, lng: -0.1195 }, // Near London Bridge
    urgency: 'critical',
    type: 'rescue',
    description: 'Child separated from parents in collapsed shopping area. Very distressed.',
    status: 'pending',
    createdAt: new Date('2025-11-15T08:25:00'),
    peopleCount: 1,
  },
  {
    id: 'help-006',
    disasterId: 'london-eq-2025',
    userId: 'user-006',
    userName: 'David Thompson',
    location: { lat: 51.5194, lng: -0.1270 }, // Near St Pancras
    urgency: 'high',
    type: 'medical',
    description: 'Multiple casualties in office building collapse. Need emergency medical team.',
    status: 'in_progress',
    createdAt: new Date('2025-11-15T08:20:00'),
    claimedBy: 'responder-001',
    claimedAt: new Date('2025-11-15T08:35:00'),
    peopleCount: 12,
  },
  {
    id: 'help-007',
    disasterId: 'london-eq-2025',
    userId: 'user-007',
    userName: 'Aisha Patel',
    location: { lat: 51.5007, lng: -0.1246 }, // Near Waterloo
    urgency: 'medium',
    type: 'shelter',
    description: 'Building evacuated, need temporary shelter for elderly residents.',
    status: 'pending',
    createdAt: new Date('2025-11-15T09:30:00'),
    peopleCount: 6,
  },
  {
    id: 'help-008',
    disasterId: 'london-eq-2025',
    userId: 'user-008',
    userName: 'Robert Clarke',
    location: { lat: 51.5226, lng: -0.1571 }, // Near Baker Street
    urgency: 'critical',
    type: 'rescue',
    description: 'Gas leak detected in damaged building with people inside. Immediate evacuation needed.',
    status: 'pending',
    createdAt: new Date('2025-11-15T08:40:00'),
    peopleCount: 5,
  },
  {
    id: 'help-009',
    disasterId: 'london-eq-2025',
    userId: 'user-009',
    userName: 'Sophie Martin',
    location: { lat: 51.5118, lng: -0.1301 }, // Near Holborn
    urgency: 'low',
    type: 'supplies',
    description: 'Need blankets and basic first aid supplies for shelter group.',
    status: 'pending',
    createdAt: new Date('2025-11-15T09:45:00'),
    peopleCount: 15,
  },
  {
    id: 'help-010',
    disasterId: 'london-eq-2025',
    userId: 'user-010',
    userName: 'Thomas Brown',
    location: { lat: 51.5095, lng: -0.0955 }, // Near Liverpool Street
    urgency: 'high',
    type: 'medical',
    description: 'Pregnant woman in labor, hospital unreachable. Need medical assistance urgently.',
    status: 'pending',
    createdAt: new Date('2025-11-15T08:50:00'),
    peopleCount: 2,
  },
  {
    id: 'help-011',
    disasterId: 'london-eq-2025',
    userId: 'user-011',
    userName: 'Nina Kowalski',
    location: { lat: 51.5152, lng: -0.0721 }, // Near Shoreditch
    urgency: 'medium',
    type: 'rescue',
    description: 'Elevator stuck between floors with 3 people inside. Building power out.',
    status: 'pending',
    createdAt: new Date('2025-11-15T09:10:00'),
    peopleCount: 3,
  },
  {
    id: 'help-012',
    disasterId: 'london-eq-2025',
    userId: 'user-012',
    userName: 'Carlos Rodriguez',
    location: { lat: 51.4994, lng: -0.1746 }, // Near Victoria
    urgency: 'medium',
    type: 'food',
    description: 'Community center serving as shelter. Running low on food and water for 50+ people.',
    status: 'in_progress',
    createdAt: new Date('2025-11-15T09:20:00'),
    claimedBy: 'responder-002',
    claimedAt: new Date('2025-11-15T09:25:00'),
    peopleCount: 50,
  },
];

// Get help requests for a specific disaster
export function getHelpRequestsByDisaster(disasterId: string): HelpRequest[] {
  return mockHelpRequests.filter((req) => req.disasterId === disasterId);
}

// Get pending help requests only
export function getPendingHelpRequests(disasterId: string): HelpRequest[] {
  return mockHelpRequests.filter(
    (req) => req.disasterId === disasterId && req.status === 'pending'
  );
}

// Get help requests by urgency
export function getHelpRequestsByUrgency(
  disasterId: string,
  urgency: 'critical' | 'high' | 'medium' | 'low'
): HelpRequest[] {
  return mockHelpRequests.filter(
    (req) => req.disasterId === disasterId && req.urgency === urgency
  );
}

// Get help request by ID
export function getHelpRequestById(id: string): HelpRequest | undefined {
  return mockHelpRequests.find((req) => req.id === id);
}
