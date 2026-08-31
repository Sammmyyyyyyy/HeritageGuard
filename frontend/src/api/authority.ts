import { getSites, BackendSite } from './sites';
import { getPressure, PressureResponse } from './pressure';
import { getCrowd, CrowdPredictionResponse } from './crowd';
import { SITE_IMAGE_PATHS } from '../data/siteMapper';
import { MONUMENT_FALLBACKS } from '../assets/monumentImages';

export interface SiteFullTelemetry {
  site: BackendSite;
  pressure: PressureResponse | null;
  crowd: CrowdPredictionResponse | null;
  loading: boolean;
  error: string | null;
}

export interface AuthoritySummary {
  totalSites: number;
  highRiskCount: number;
  overcrowdedCount: number;
  totalFootfallToday: number;
  watchlist: Array<{
    site: BackendSite;
    pressure: PressureResponse;
    crowd: CrowdPredictionResponse | null;
  }>;
  hourlyAggregate: Array<{
    hour: string;
    footfall: number;
    peakSites: string[];
  }>;
  peakAdvisory: {
    peakWindow: string;
    topCity: string;
    message: string;
  };
}

export interface LiveAuthorityMetrics {
  totalSites: number;
  highRiskSites: number;
  overcrowdedSites: number;
  totalFootfallToday: number;
}

import { API_BASE_URL } from './config';

export function resolveImageUrl(url?: string | null, siteId?: string): string {
  if (url && url.trim().length > 0) {
    const clean = url.trim();
    if (
      clean.startsWith('http://') ||
      clean.startsWith('https://') ||
      clean.startsWith('data:')
    ) {
      return clean;
    }
    if (clean.startsWith('/images/')) {
      return clean;
    }
    return `${API_BASE_URL}${clean.startsWith('/') ? '' : '/'}${clean}`;
  }

  if (siteId && SITE_IMAGE_PATHS[siteId]) {
    return SITE_IMAGE_PATHS[siteId];
  }

  if (siteId && MONUMENT_FALLBACKS[siteId]) {
    return MONUMENT_FALLBACKS[siteId];
  }

  return '/images/heritage-placeholder.jpg';
}

let telemetryCache: {
  timestamp: number;
  data: {
    sites: BackendSite[];
    pressureMap: Record<string, PressureResponse>;
    crowdMap: Record<string, CrowdPredictionResponse>;
  };
} | null = null;

export async function fetchAllSitesTelemetry(
  targetDate?: string,
  forceRefresh: boolean = false
): Promise<{
  sites: BackendSite[];
  pressureMap: Record<string, PressureResponse>;
  crowdMap: Record<string, CrowdPredictionResponse>;
}> {
  const CACHE_TTL_MS = 45000;
  const now = Date.now();

  if (!forceRefresh && !targetDate && telemetryCache && now - telemetryCache.timestamp < CACHE_TTL_MS) {
    return telemetryCache.data;
  }

  const sites = await getSites();

  const pressureResults = await Promise.allSettled(
    sites.map((site) => getPressure(site.site_id))
  );

  const crowdResults = await Promise.allSettled(
    sites.map((site) => getCrowd(site.site_id, targetDate))
  );

  const pressureMap: Record<string, PressureResponse> = {};
  pressureResults.forEach((res) => {
    if (res.status === 'fulfilled' && res.value?.site_id) {
      pressureMap[res.value.site_id] = res.value;
    }
  });

  const crowdMap: Record<string, CrowdPredictionResponse> = {};
  crowdResults.forEach((res) => {
    if (res.status === 'fulfilled' && res.value?.site_id) {
      crowdMap[res.value.site_id] = res.value;
    }
  });

  const result = { sites, pressureMap, crowdMap };

  if (!targetDate) {
    telemetryCache = {
      timestamp: now,
      data: result,
    };
  }

  return result;
}

export async function fetchLiveAuthorityMetrics(): Promise<LiveAuthorityMetrics> {
  const { sites, pressureMap, crowdMap } = await fetchAllSitesTelemetry();
  let highRisk = 0;
  let overcrowded = 0;
  let totalFootfall = 0;

  sites.forEach((site) => {
    const p = pressureMap[site.site_id];
    if (p && (p.risk?.toUpperCase() === 'HIGH' || p.risk?.toUpperCase() === 'CRITICAL' || p.pressure_score >= 60)) {
      highRisk += 1;
    }
    const c = crowdMap[site.site_id];
    if (c) {
      totalFootfall += c.daily_expected_total || 0;
      if (c.daily_expected_total > c.safe_capacity || (c.daily_expected_total / c.safe_capacity) >= 0.75) {
        overcrowded += 1;
      }
    }
  });

  return {
    totalSites: sites.length || 20,
    highRiskSites: highRisk,
    overcrowdedSites: overcrowded,
    totalFootfallToday: totalFootfall,
  };
}

export function getCurrentHourPredictedVisitors(
  crowd: CrowdPredictionResponse | null
): number {
  if (!crowd || !crowd.predictions || crowd.predictions.length === 0) {
    return 0;
  }

  const currentHourNum = new Date().getHours();
  const currentHourFormatted = `${String(currentHourNum).padStart(2, '0')}:00`;

  const found = crowd.predictions.find(
    (p) => p.time === currentHourFormatted || p.time.startsWith(String(currentHourNum).padStart(2, '0'))
  );

  if (found) {
    return found.expected_visitors;
  }

  const midIndex = Math.floor(crowd.predictions.length / 2);
  return crowd.predictions[midIndex]?.expected_visitors || 0;
}

export function calculateConditionStatus(
  pressure: PressureResponse | null
): 'CRITICAL' | 'SEVERE' | 'MODERATE' | 'STABLE' {
  if (!pressure) return 'STABLE';

  const score = pressure.pressure_score || 0;
  const deterioration = pressure.factors?.recent_deterioration || 0;

  if (score >= 75 || deterioration >= 70) {
    return 'CRITICAL';
  }
  if (score >= 55 || deterioration >= 50) {
    return 'SEVERE';
  }
  if (score >= 35 || deterioration >= 30) {
    return 'MODERATE';
  }
  return 'STABLE';
}

export function calculateCrowdLevel(
  crowd: CrowdPredictionResponse | null
): 'LOW' | 'MODERATE' | 'HIGH' | 'PEAK' {
  if (!crowd || !crowd.safe_capacity) return 'LOW';

  const ratio = crowd.daily_expected_total / crowd.safe_capacity;
  if (ratio >= 1.0) return 'PEAK';
  if (ratio >= 0.75) return 'HIGH';
  if (ratio >= 0.4) return 'MODERATE';
  return 'LOW';
}
