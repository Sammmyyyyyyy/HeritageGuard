import { API_BASE_URL } from './config';

export interface HourlyPrediction {
  time: string; // "09:00"
  crowd_percent: number; // e.g. 42
  expected_visitors: number; // e.g. 630
}

export interface CrowdPredictionResponse {
  site_id: string;
  site_name: string;
  city: string;
  state: string;
  date: string; // "2026-08-30"
  day_of_week: string; // "Sunday"
  operating_hours: string; // "09:00-16:00"
  weather: string; // "Clear"
  temperature_c: number; // 28
  safe_capacity: number; // 15000
  daily_expected_total: number; // 8400
  predictions: HourlyPrediction[];
  peak_hours: string[]; // ["11:00-14:00"]
  best_time: string; // "09:00-11:00"
}

export async function getCrowd(
  siteId: string,
  date?: string
): Promise<CrowdPredictionResponse> {
  const url = new URL(`${API_BASE_URL}/api/crowd/${siteId}`);
  if (date) {
    url.searchParams.set("date", date);
  }

  const response = await fetch(url.toString());

  if (!response.ok) {
    throw new Error(
      `Failed to fetch crowd for site ${siteId}: ${response.status} ${response.statusText}`
    );
  }

  return response.json();
}