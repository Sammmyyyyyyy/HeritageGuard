export type MonumentCategory =
  | 'All'
  | 'Temples'
  | 'Tombs & Mausoleums'
  | 'Forts & Palaces'
  | 'Caves & Rock Cut'
  | 'Museums'
  | 'UNESCO Sites'
  | 'Other Heritage';

export type CrowdLevel = 'Low' | 'Moderate' | 'High' | 'Overcrowded';

export type DeteriorationStatus =
  | 'Good'
  | 'Moderate Concern'
  | 'Severe Deterioration'
  | 'Critical Restoration Required';

export interface AlternativeSite {
  id: string;
  name: string;
  location: string;
  distanceKm: number;
  pressureScore: number;
  whyVisit: string;
  imageUrl: string;
}

export interface HourlyFootfall {
  hour: string;
  count: number;
  isPeak: boolean;
  pressurePercentage: number;
}

export interface Monument {
  id: string;
  name: string;
  hindiName: string;
  tagline: string;
  city: string;
  state: string;
  lat: number;
  lng: number;
  category: MonumentCategory;
  timePeriod: string;
  architecturalStyle: string;
  isUnesco: boolean;
  rating: number;
  reviewsCount: string;
  imageUrl: string;
  gallery: string[];
  heritagePressureScore: number; // 0 - 100 (Higher means critical vulnerability/strain)
  damageScore: number; // 0 - 100
  crowdLevel: CrowdLevel;
  liveFootfall: number;
  maxCapacity: number;
  bestVisitingWindow: {
    start: string;
    end: string;
    reason: string;
    hindiReason: string;
  };
  openingHours: string;
  entryFee: {
    indian: number;
    foreigner: number;
  };
  deteriorationStatus: DeteriorationStatus;
  description: string;
  hindiDescription: string;
  historicalSignificance: string;
  architectureHighlights: string[];
  acousticFeatures?: string;
  alternativeSites: AlternativeSite[];
  hourlyFootfall: HourlyFootfall[];
  structuralSensors?: {
    crackExpansionRate: string;
    moistureIndex: string;
    vibrationVulnerability: string;
  };
}

export type DamageType = 'crack' | 'erosion' | 'discoloration' | 'vegetation' | 'moisture';

export interface DamageDetection {
  id: string;
  type: DamageType;
  confidence: number; // e.g. 0.94
  severity: 'Low' | 'Medium' | 'High' | 'Critical';
  bbox: {
    x: number; // percentage (0-100)
    y: number;
    width: number;
    height: number;
  };
  title: string;
  description: string;
  recommendedAction: string;
}

export interface DamageScanResult {
  id: string;
  monumentId: string;
  monumentName: string;
  scannedAt: string;
  imageUrl: string;
  overallDamageScore: number;
  detections: DamageDetection[];
  source: 'Citizen Camera Scan' | 'Official Drone LiDAR' | 'Fixed Sensor Scan';
  status: 'Pending Review' | 'Verified' | 'Action Dispatched' | 'Resolved';
  submittedBy?: string;
  locationDetails?: string;
}

export interface AuthorityKPIs {
  totalSites: number;
  highRiskSites: number;
  overcrowdedSites: number;
  activeAlerts: number;
  pendingInspections: number;
  totalFootfallToday: number;
  footfallDeltaPercent: number;
}

export interface AlertItem {
  id: string;
  type: 'damage' | 'crowd' | 'structural' | 'unauthorized';
  severity: 'low' | 'medium' | 'high' | 'critical';
  title: string;
  monumentName: string;
  timeAgo: string;
  timestamp: string;
  status: 'unread' | 'investigating' | 'actioned';
  details: string;
}

export interface ItineraryStop {
  id: string;
  monumentId: string;
  monumentName: string;
  city: string;
  timeSlot: string;
  recommendedDuration: string;
  expectedCrowd: CrowdLevel;
  pressureScore: number;
  isAlternativeRecommended?: boolean;
  alternativeSuggestion?: string;
  travelTimeFromPrev?: string;
  imageUrl: string;
  tips: string;
}

export interface ItineraryPlan {
  id: string;
  title: string;
  region: string;
  durationDays: number;
  idealFor: string;
  stops: ItineraryStop[];
  totalDistanceKm: number;
  sustainabilityScore: number; // 0-100
  crowdAvoidancePercent: number;
}

export interface ChatMessage {
  id: string;
  sender: 'user' | 'ai';
  text: string;
  hindiText?: string;
  timestamp: string;
  sources?: Array<{
    title: string;
    archive: string;
    confidence: number;
  }>;
  suggestedFollowUps?: string[];
}
