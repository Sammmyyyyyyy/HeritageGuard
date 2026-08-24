import { AlertItem, AuthorityKPIs } from '../types/heritage';

export const AUTHORITY_KPIS: AuthorityKPIs = {
  totalSites: 1248,
  highRiskSites: 28,
  overcrowdedSites: 63,
  activeAlerts: 42,
  pendingInspections: 19,
  totalFootfallToday: 342581,
  footfallDeltaPercent: 18.6
};

export const RISK_DISTRIBUTION = [
  { label: 'Low Risk (0 - 30%)', count: 812, percentage: 65, color: '#10B981' },
  { label: 'Moderate Risk (30 - 60%)', count: 338, percentage: 27, color: '#F59E0B' },
  { label: 'High Risk (> 60%)', count: 98, percentage: 8, color: '#EF4444' }
];

export const HOURLY_OVERALL_CROWD = [
  { hour: '00:00', footfall: 1200 },
  { hour: '02:00', footfall: 800 },
  { hour: '04:00', footfall: 1500 },
  { hour: '06:00', footfall: 18400 },
  { hour: '08:00', footfall: 42100 },
  { hour: '10:00', footfall: 76500 },
  { hour: '12:00', footfall: 92800 },
  { hour: '14:00', footfall: 84300 },
  { hour: '16:00', footfall: 89600 },
  { hour: '18:00', count: 52000, footfall: 52000 },
  { hour: '20:00', footfall: 21000 },
  { hour: '22:00', footfall: 6400 }
];

export const HIGH_RISK_SITES_SUMMARY = [
  { id: 'taj-mahal', name: 'Taj Mahal', state: 'Uttar Pradesh', riskScore: 91, footfallRatio: '122% capacity', alertType: 'Overcrowding & Marble Stress' },
  { id: 'hawa-mahal', name: 'Hawa Mahal', state: 'Rajasthan', riskScore: 87, footfallRatio: '115% capacity', alertType: 'Facade Vibration & Structural Shift' },
  { id: 'konark-sun-temple', name: 'Konark Sun Temple', state: 'Odisha', riskScore: 82, footfallRatio: '138% capacity', alertType: 'Saline Exfoliation & Foundation Strain' },
  { id: 'ajanta-caves', name: 'Ajanta Caves', state: 'Maharashtra', riskScore: 79, footfallRatio: '124% capacity', alertType: 'Cave Humidity & Pigment Flaking' },
  { id: 'hampi-monuments', name: 'Hampi Vittala Complex', state: 'Karnataka', riskScore: 78, footfallRatio: '108% capacity', alertType: 'Pillar Resonant Abrasion' },
  { id: 'fatehpur-sikri', name: 'Fatehpur Sikri Buland Darwaza', state: 'Uttar Pradesh', riskScore: 68, footfallRatio: '96% capacity', alertType: 'Red Sandstone Joint Weathering' },
  { id: 'meenakshi-temple', name: 'Meenakshi Amman Temple', state: 'Tamil Nadu', riskScore: 66, footfallRatio: '145% capacity', alertType: 'Gopuram Crowd Bottleneck' }
];

export const RECENT_ALERTS: AlertItem[] = [
  {
    id: 'alt-1',
    type: 'crowd',
    severity: 'critical',
    title: 'High footfall detected at Taj Mahal',
    monumentName: 'Taj Mahal, Agra',
    timeAgo: '3 min ago',
    timestamp: '2026-08-24 16:55 IST',
    status: 'investigating',
    details: 'Live visitor count reached 42,800 against safe hourly threshold of 35,000. Recommend enabling tourist diversion flow to Mehtab Bagh.'
  },
  {
    id: 'alt-2',
    type: 'damage',
    severity: 'high',
    title: 'Structural damage detected at Ajanta Caves',
    monumentName: 'Ajanta Cave 17, Maharashtra',
    timeAgo: '18 min ago',
    timestamp: '2026-08-24 16:40 IST',
    status: 'unread',
    details: 'Multi-spectral sensor detected 14% increase in capillary humidity above Cave 17 ceiling mural.'
  },
  {
    id: 'alt-3',
    type: 'unauthorized',
    severity: 'medium',
    title: 'Unauthorized activity reported in Hampi',
    monumentName: 'Vittala Temple, Hampi',
    timeAgo: '45 min ago',
    timestamp: '2026-08-24 16:13 IST',
    status: 'actioned',
    details: 'AI CCTV detected tourists crossing cordoned acoustic pillar enclosure.'
  },
  {
    id: 'alt-4',
    type: 'crowd',
    severity: 'high',
    title: 'Crowd limit exceeded at Meenakshi Temple',
    monumentName: 'Meenakshi Temple, Madurai',
    timeAgo: '1 hr ago',
    timestamp: '2026-08-24 15:58 IST',
    status: 'actioned',
    details: 'East Gopuram courtyard occupancy peaked at 145%. Queue gating initiated.'
  }
];

export const GIS_MONUMENT_PINS = [
  { id: 'pin-1', name: 'Taj Mahal', state: 'Uttar Pradesh', lat: 27.1751, lng: 78.0421, risk: 'high', riskScore: 91, footfall: 42800 },
  { id: 'pin-2', name: 'Hampi', state: 'Karnataka', lat: 15.3350, lng: 76.4600, risk: 'high', riskScore: 78, footfall: 18400 },
  { id: 'pin-3', name: 'Konark Sun Temple', state: 'Odisha', lat: 19.8876, lng: 86.0945, risk: 'high', riskScore: 82, footfall: 16500 },
  { id: 'pin-4', name: 'Ajanta Caves', state: 'Maharashtra', lat: 20.5519, lng: 75.7033, risk: 'high', riskScore: 79, footfall: 11200 },
  { id: 'pin-5', name: 'Qutub Minar', state: 'Delhi', lat: 28.5245, lng: 77.1855, risk: 'moderate', riskScore: 52, footfall: 14200 },
  { id: 'pin-6', name: 'Brihadisvara Temple', state: 'Tamil Nadu', lat: 10.7828, lng: 79.1318, risk: 'moderate', riskScore: 48, footfall: 8600 },
  { id: 'pin-7', name: 'Khajuraho Group', state: 'Madhya Pradesh', lat: 24.8318, lng: 79.9199, risk: 'moderate', riskScore: 54, footfall: 5200 },
  { id: 'pin-8', name: 'Mehrangarh Fort', state: 'Rajasthan', lat: 26.2978, lng: 73.0185, risk: 'moderate', riskScore: 45, footfall: 9800 },
  { id: 'pin-9', name: 'Airavatesvara Temple', state: 'Tamil Nadu', lat: 10.9492, lng: 79.3562, risk: 'low', riskScore: 19, footfall: 1200 },
  { id: 'pin-10', name: 'Mehtab Bagh', state: 'Uttar Pradesh', lat: 27.1800, lng: 78.0422, risk: 'low', riskScore: 24, footfall: 2100 },
  { id: 'pin-11', name: 'Rani ki Vav', state: 'Gujarat', lat: 23.8589, lng: 72.1017, risk: 'low', riskScore: 28, footfall: 3400 },
  { id: 'pin-12', name: 'Badami Caves', state: 'Karnataka', lat: 15.9189, lng: 75.6766, risk: 'low', riskScore: 26, footfall: 2900 }
];
