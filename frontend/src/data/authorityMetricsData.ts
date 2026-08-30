import { AlertItem, AuthorityKPIs } from '../types/heritage';

/* =========================================================
   AUTHORITY KPI SUMMARY
   ========================================================= */

export const AUTHORITY_KPIS: AuthorityKPIs = {
  totalSites: 20,
  highRiskSites: 0,
  overcrowdedSites: 0,
  activeAlerts: 0,
  pendingInspections: 0,
  totalFootfallToday: 0,
  footfallDeltaPercent: 0,
};

/* =========================================================
   RISK DISTRIBUTION
   =========================================================
   Site-level risk is now supplied by the backend pressure API.
   Therefore this file does not invent risk counts/scores.
   ========================================================= */

export const RISK_DISTRIBUTION: Array<{
  label: string;
  count: number;
  percentage: number;
  color: string;
}> = [];

/* =========================================================
   HOURLY OVERALL CROWD
   =========================================================
   Keep empty until an aggregate hourly crowd endpoint is
   available. Site-level crowd comes from the backend.
   ========================================================= */

export const HOURLY_OVERALL_CROWD: Array<{
  hour: string;
  footfall: number;
}> = [];

/* =========================================================
   HIGH-RISK SITES
   =========================================================
   No fake Taj Mahal / Hampi / Konark etc.
   Real site risk comes from Shagun/backend telemetry.
   ========================================================= */

export const HIGH_RISK_SITES_SUMMARY: Array<{
  id: string;
  site_id: string;
  name: string;
  state: string;
  riskScore: number;
  footfallRatio: string;
  alertType: string;
}> = [];

/* =========================================================
   RECENT ALERTS
   =========================================================
   Real alerts are loaded from the backend.
   ========================================================= */

export const RECENT_ALERTS: AlertItem[] = [];

/* =========================================================
   GIS MONUMENT PINS
   =========================================================
   Your exact 20-site database set.
   Only 10 are rendered on the visual GIS map so labels
   stay readable.

   IMPORTANT:
   - mapTop/mapLeft = visual map position only
   - lat/lng = real site coordinates
   - riskScore/footfall start at 0
   - real pressure/crowd values come from backend
   ========================================================= */

export const GIS_MONUMENT_PINS: Array<{
  id: string;
  site_id: string;
  name: string;
  city: string;
  state: string;
  lat: number;
  lng: number;
  mapTop: string;
  mapLeft: string;
  risk: 'low' | 'moderate' | 'high';
  riskScore: number;
  footfall: number;
}> = [
  /* ------------------------- DELHI ------------------------- */

  {
    id: 'DEL001',
    site_id: 'DEL001',
    name: 'Red Fort',
    city: 'Delhi',
    state: 'Delhi',
    lat: 28.6562,
    lng: 77.2410,
    mapTop: '16%',
    mapLeft: '28%',
    risk: 'low' as const,
    riskScore: 0,
    footfall: 0,
  },

  {
    id: 'DEL002',
    site_id: 'DEL002',
    name: 'Qutub Minar',
    city: 'Delhi',
    state: 'Delhi',
    lat: 28.5245,
    lng: 77.1855,
    mapTop: '27%',
    mapLeft: '47%',
    risk: 'low' as const,
    riskScore: 0,
    footfall: 0,
  },

  {
    id: 'DEL003',
    site_id: 'DEL003',
    name: 'India Gate',
    city: 'Delhi',
    state: 'Delhi',
    lat: 28.6129,
    lng: 77.2295,
    mapTop: '42%',
    mapLeft: '78%',
    risk: 'low' as const,
    riskScore: 0,
    footfall: 0,
  },

  {
    id: 'DEL004',
    site_id: 'DEL004',
    name: "Humayun's Tomb",
    city: 'Delhi',
    state: 'Delhi',
    lat: 28.5933,
    lng: 77.2507,
    mapTop: '73%',
    mapLeft: '28%',
    risk: 'low' as const,
    riskScore: 0,
    footfall: 0,
  },

  {
    id: 'DEL005',
    site_id: 'DEL005',
    name: 'Lotus Temple',
    city: 'Delhi',
    state: 'Delhi',
    lat: 28.5535,
    lng: 77.2588,
    mapTop: '78%',
    mapLeft: '82%',
    risk: 'low' as const,
    riskScore: 0,
    footfall: 0,
  },

  /* ------------------------ JAIPUR ------------------------- */

  {
    id: 'JAI001',
    site_id: 'JAI001',
    name: 'Amer Fort',
    city: 'Jaipur',
    state: 'Rajasthan',
    lat: 26.9855,
    lng: 75.8513,
    mapTop: '39%',
    mapLeft: '22%',
    risk: 'low' as const,
    riskScore: 0,
    footfall: 0,
  },

  {
    id: 'JAI002',
    site_id: 'JAI002',
    name: 'Hawa Mahal',
    city: 'Jaipur',
    state: 'Rajasthan',
    lat: 26.9239,
    lng: 75.8267,
    mapTop: '53%',
    mapLeft: '42%',
    risk: 'low' as const,
    riskScore: 0,
    footfall: 0,
  },

  {
    id: 'JAI003',
    site_id: 'JAI003',
    name: 'City Palace',
    city: 'Jaipur',
    state: 'Rajasthan',
    lat: 26.9255,
    lng: 75.8236,
    mapTop: '19%',
    mapLeft: '61%',
    risk: 'low' as const,
    riskScore: 0,
    footfall: 0,
  },

  {
    id: 'JAI004',
    site_id: 'JAI004',
    name: 'Jantar Mantar',
    city: 'Jaipur',
    state: 'Rajasthan',
    lat: 26.9247,
    lng: 75.8245,
    mapTop: '22%',
    mapLeft: '72%',
    risk: 'low' as const,
    riskScore: 0,
    footfall: 0,
  },

  {
    id: 'JAI005',
    site_id: 'JAI005',
    name: 'Albert Hall Museum',
    city: 'Jaipur',
    state: 'Rajasthan',
    lat: 26.9116,
    lng: 75.8195,
    mapTop: '84%',
    mapLeft: '50%',
    risk: 'low' as const,
    riskScore: 0,
    footfall: 0,
  },

  /* ------------------------ MUMBAI ------------------------- */

  {
    id: 'BOM001',
    site_id: 'BOM001',
    name: 'Gateway of India',
    city: 'Mumbai',
    state: 'Maharashtra',
    lat: 18.9220,
    lng: 72.8347,
    mapTop: '63%',
    mapLeft: '20%',
    risk: 'low' as const,
    riskScore: 0,
    footfall: 0,
  },

  {
    id: 'BOM002',
    site_id: 'BOM002',
    name: 'Elephanta Caves',
    city: 'Mumbai',
    state: 'Maharashtra',
    lat: 18.9633,
    lng: 72.9315,
    mapTop: '88%',
    mapLeft: '30%',
    risk: 'low' as const,
    riskScore: 0,
    footfall: 0,
  },

  {
    id: 'BOM003',
    site_id: 'BOM003',
    name: 'Chhatrapati Shivaji Maharaj Terminus',
    city: 'Mumbai',
    state: 'Maharashtra',
    lat: 18.9400,
    lng: 72.8355,
    mapTop: '78%',
    mapLeft: '44%',
    risk: 'low' as const,
    riskScore: 0,
    footfall: 0,
  },

  {
    id: 'BOM004',
    site_id: 'BOM004',
    name: 'Haji Ali Dargah',
    city: 'Mumbai',
    state: 'Maharashtra',
    lat: 18.9827,
    lng: 72.8089,
    mapTop: '49%',
    mapLeft: '87%',
    risk: 'low' as const,
    riskScore: 0,
    footfall: 0,
  },

  {
    id: 'BOM005',
    site_id: 'BOM005',
    name: 'Siddhivinayak Temple',
    city: 'Mumbai',
    state: 'Maharashtra',
    lat: 19.0166,
    lng: 72.8304,
    mapTop: '88%',
    mapLeft: '66%',
    risk: 'low' as const,
    riskScore: 0,
    footfall: 0,
  },

  /* ---------------------- PRAYAGRAJ ------------------------ */

  {
    id: 'PRA001',
    site_id: 'PRA001',
    name: 'Triveni Sangam',
    city: 'Prayagraj',
    state: 'Uttar Pradesh',
    lat: 25.4299,
    lng: 81.8848,
    mapTop: '66%',
    mapLeft: '63%',
    risk: 'low' as const,
    riskScore: 0,
    footfall: 0,
  },

  {
    id: 'PRA002',
    site_id: 'PRA002',
    name: 'Allahabad Fort',
    city: 'Prayagraj',
    state: 'Uttar Pradesh',
    lat: 25.4287,
    lng: 81.8761,
    mapTop: '92%',
    mapLeft: '52%',
    risk: 'low' as const,
    riskScore: 0,
    footfall: 0,
  },

  {
    id: 'PRA003',
    site_id: 'PRA003',
    name: 'Khusro Bagh',
    city: 'Prayagraj',
    state: 'Uttar Pradesh',
    lat: 25.4429,
    lng: 81.8153,
    mapTop: '46%',
    mapLeft: '11%',
    risk: 'low' as const,
    riskScore: 0,
    footfall: 0,
  },

  {
    id: 'PRA004',
    site_id: 'PRA004',
    name: 'Anand Bhavan',
    city: 'Prayagraj',
    state: 'Uttar Pradesh',
    lat: 25.4615,
    lng: 81.8596,
    mapTop: '37%',
    mapLeft: '82%',
    risk: 'low' as const,
    riskScore: 0,
    footfall: 0,
  },

  {
    id: 'PRA005',
    site_id: 'PRA005',
    name: 'Chandrashekhar Azad Park',
    city: 'Prayagraj',
    state: 'Uttar Pradesh',
    lat: 25.4542,
    lng: 81.8499,
    mapTop: '82%',
    mapLeft: '72%',
    risk: 'low' as const,
    riskScore: 0,
    footfall: 0,
  },
];

/* =========================================================
   COMPLETE 20-SITE HELPERS
   ========================================================= */

export const ALL_HERITAGE_SITE_IDS = [
  'DEL001',
  'DEL002',
  'DEL003',
  'DEL004',
  'DEL005',

  'JAI001',
  'JAI002',
  'JAI003',
  'JAI004',
  'JAI005',

  'BOM001',
  'BOM002',
  'BOM003',
  'BOM004',
  'BOM005',

  'PRA001',
  'PRA002',
  'PRA003',
  'PRA004',
  'PRA005',
] as const;

export const GIS_SITE_NAME_BY_ID: Record<string, string> = {
  DEL001: 'Red Fort',
  DEL002: 'Qutub Minar',
  DEL003: 'India Gate',
  DEL004: "Humayun's Tomb",
  DEL005: 'Lotus Temple',

  JAI001: 'Amer Fort',
  JAI002: 'Hawa Mahal',
  JAI003: 'City Palace',
  JAI004: 'Jantar Mantar',
  JAI005: 'Albert Hall Museum',

  BOM001: 'Gateway of India',
  BOM002: 'Elephanta Caves',
  BOM003: 'Chhatrapati Shivaji Maharaj Terminus',
  BOM004: 'Haji Ali Dargah',
  BOM005: 'Siddhivinayak Temple',

  PRA001: 'Triveni Sangam',
  PRA002: 'Allahabad Fort',
  PRA003: 'Khusro Bagh',
  PRA004: 'Anand Bhavan',
  PRA005: 'Chandrashekhar Azad Park',
};

export const GIS_CITY_BY_ID: Record<string, string> = {
  DEL001: 'Delhi',
  DEL002: 'Delhi',
  DEL003: 'Delhi',
  DEL004: 'Delhi',
  DEL005: 'Delhi',

  JAI001: 'Jaipur',
  JAI002: 'Jaipur',
  JAI003: 'Jaipur',
  JAI004: 'Jaipur',
  JAI005: 'Jaipur',

  BOM001: 'Mumbai',
  BOM002: 'Mumbai',
  BOM003: 'Mumbai',
  BOM004: 'Mumbai',
  BOM005: 'Mumbai',

  PRA001: 'Prayagraj',
  PRA002: 'Prayagraj',
  PRA003: 'Prayagraj',
  PRA004: 'Prayagraj',
  PRA005: 'Prayagraj',
};
