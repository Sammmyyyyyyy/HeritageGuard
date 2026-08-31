import { API_BASE_URL } from './config';

export interface PressureFactors {
  visitor_pressure: number;
  physical_vulnerability: number;
  recent_deterioration: number;
  maintenance_delay: number;
  historical_importance: number;
}

export interface PressureResponse {
  site_id: string;
  site_name: string;
  pressure_score: number;
  risk: 'low' | 'medium' | 'high' | 'critical' | string;
  factors: PressureFactors;
}

export async function getPressure(
  siteId: string,
  params?: {
    current_visitors?: number;
    decay_score?: number;
  }
): Promise<PressureResponse> {
  const url = new URL(`${API_BASE_URL}/api/pressure/${siteId}`);
  if (params?.current_visitors !== undefined) {
    url.searchParams.set("current_visitors", params.current_visitors.toString());
  }
  if (params?.decay_score !== undefined) {
    url.searchParams.set("decay_score", params.decay_score.toString());
  }

  const response = await fetch(url.toString());

  if (!response.ok) {
    throw new Error(
      `Failed to fetch pressure for site ${siteId}: ${response.status} ${response.statusText}`
    );
  }

  return response.json();
}