export interface BackendSite {
  site_id: string;
  name: string;
  city: string;
  state: string;
  latitude: number;
  longitude: number;
  description?: string | null;
  historical_significance?: string | null;
  id?: string;
  created_at?: string;
  image_url?: string | null;
  imageUrl?: string | null;
  image?: string | null;
  category?: string | null;
  architectural_style?: string | null;
  time_period?: string | null;
  is_unesco?: boolean | null;
}

import { API_BASE_URL } from './config';

// ======================================================
// SITES
// ======================================================

export async function getSites(): Promise<BackendSite[]> {
  const response = await fetch(`${API_BASE_URL}/api/sites`);

  if (!response.ok) {
    throw new Error(`Failed to fetch sites: ${response.status}`);
  }

  return response.json();
}

export async function getSite(siteId: string): Promise<BackendSite> {
  const response = await fetch(`${API_BASE_URL}/api/sites/${encodeURIComponent(siteId)}`);

  if (!response.ok) {
    throw new Error(`Failed to fetch site ${siteId}: ${response.status}`);
  }

  return response.json();
}

// ======================================================
// DAMAGE ANALYSIS
// ======================================================

export interface DamageAnalysisResponse {
  site_id: string;
  damage_score: number;
  priority: string;
  detections: Array<Record<string, any>>;
  image_url?: string | null;
}

export async function analyzeDamage(
  siteId: string,
  file: File,
  notes?: string
): Promise<DamageAnalysisResponse> {
  const formData = new FormData();

  formData.append('file', file);

  if (notes && notes.trim()) {
    formData.append('notes', notes.trim());
  }

  const response = await fetch(
    `${API_BASE_URL}/api/damage/${siteId}/analyze`,
    {
      method: 'POST',
      body: formData,
    }
  );

  if (!response.ok) {
    const errorText = await response.text();

    throw new Error(
      `Damage analysis failed: ${response.status} ${errorText}`
    );
  }

  return response.json();
}

export interface RAGQuery {
  site_id: string;
  question: string;
  language?: string;
}

export async function queryHeritageRAG(
  data: RAGQuery
): Promise<any> {
  const response = await fetch(
    `${API_BASE_URL}/api/rag/query`,
    {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(data),
    }
  );

  if (!response.ok) {
    const errorText = await response.text();

    throw new Error(
      `RAG query failed: ${response.status} ${errorText}`
    );
  }

  return response.json();
}

export interface ItineraryCreateRequest {
  starting_latitude: number;
  starting_longitude: number;
  start_time: string;
  available_time_minutes: number;
  budget: number;
  interests: Record<string, any>;
  crowd_tolerance: number;
  itinerary: Record<string, any>;
}

export async function createItinerary(
  data: ItineraryCreateRequest
): Promise<any> {
  const response = await fetch(
    `${API_BASE_URL}/api/itineraries`,
    {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(data),
    }
  );

  if (!response.ok) {
    const errorText = await response.text();

    throw new Error(
      `Itinerary generation failed: ${response.status} ${errorText}`
    );
  }

  return response.json();
}

export interface CreateReportPayload {
  site_id: string;
  damage_score: number;
  detections: any[];
  summary?: string | null;
  severity?: string;
  report_type?: string;
  image_url?: string;
  pressure?: any;
  crowd?: any;
}

export async function createReport(
  payload: CreateReportPayload
) {
  const response = await fetch(
    `${API_BASE_URL}/api/reports`,
    {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Accept: 'application/json',
      },
      body: JSON.stringify(payload),
    }
  );

  if (!response.ok) {
    const text = await response.text();

    throw new Error(
      `Create report failed (${response.status}): ${text}`
    );
  }

  return response.json();
}

// Re-export Pressure & Crowd types and helpers for single source of truth
export type { PressureFactors, PressureResponse } from './pressure';
export { getPressure } from './pressure';
export type { CrowdPredictionResponse, HourlyPrediction } from './crowd';
export { getCrowd } from './crowd';