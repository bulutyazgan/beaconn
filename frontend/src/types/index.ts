// User roles
export type UserRole = 'victim' | 'responder';

// Help request types
export type HelpRequestType = 'medical' | 'food' | 'shelter' | 'rescue' | 'supplies' | 'other';
export type Urgency = 'critical' | 'high' | 'medium' | 'low';
export type HelpRequestStatus = 'pending' | 'in_progress' | 'resolved';

// Resource types
export type ResourceType = 'hospital' | 'shelter' | 'water' | 'safe-zone';
export type OperatingStatus = 'open' | 'full' | 'closed';

// News severity
export type NewsSeverity = 'info' | 'warning' | 'critical';
export type AlertSeverity = 'warning' | 'critical';

// Location
export interface Location {
  lat: number;
  lng: number;
}

// User
export interface User {
  id: string;
  role: UserRole;
  location: Location;
}

// Help Request
export interface HelpRequest {
  id: string;
  disasterId: string; // Which disaster this request is for
  userId: string;
  userName: string;
  type: HelpRequestType;
  urgency: Urgency;
  location: Location;
  peopleCount: number;
  description: string; // AI-cleaned/processed description
  rawDescription?: string; // Original user input (exactly what they typed)
  aiReasoning?: string; // AI's explanation of urgency/danger assessment
  createdAt: Date;
  status: HelpRequestStatus;
  claimedBy?: string; // ID of responder who claimed this request
  claimedAt?: Date; // When the request was claimed
}

// Emergency Resource
export interface EmergencyResource {
  id: string;
  type: ResourceType;
  name: string;
  location: Location;
  capacity?: number;
  currentOccupancy?: number;
  operatingStatus: OperatingStatus;
  contact?: string;
}

// News Update
export interface NewsUpdate {
  id: string;
  title: string;
  content: string;
  source: string;
  severity: NewsSeverity;
  timestamp: Date;
}

// Alert
export interface Alert {
  id: string;
  title: string;
  message: string;
  severity: AlertSeverity;
  timestamp: Date;
  expiresAt?: Date;
}

// Disaster Info
export interface DisasterInfo {
  id: string;
  name: string;
  type: 'earthquake' | 'hurricane' | 'tsunami' | 'flood';
  date: Date;
  location: string;
  center: Location;
  boundary?: Location[]; // Polygon points for disaster zone
  severity: 'minor' | 'moderate' | 'severe' | 'catastrophic';
  affectedRadius: number; // in kilometers
  isActive: boolean;
}

// User's selected/subscribed disaster
export interface UserDisasterSubscription {
  userId: string;
  disasterId: string;
  subscribedAt: Date;
  role: UserRole;
}
