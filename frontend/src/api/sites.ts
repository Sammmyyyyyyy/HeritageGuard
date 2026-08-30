export interface BackendSite {
  site_id: string;
  name: string;
  city: string;
  state: string;
  latitude: number;
  longitude: number;
  description: string;
  historical_significance: string;
  id: string;
  created_at: string;
}



const API_BASE_URL =
  import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000';

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

export interface PressureFactors {
  visitor_pressure: number;
  physical_vulnerability: number;
  recent_deterioration: number;
}

export interface PressureResponse {
  site_id: string;
  pressure_score: number;
  risk: string;
  factors: PressureFactors;
}

export async function getPressure(
  siteId: string
): Promise<PressureResponse> {
  const response = await fetch(
    `${API_BASE_URL}/api/pressure/${siteId}`
  );

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(
      `Failed to fetch heritage pressure: ${response.status} ${errorText}`
    );
  }

  return response.json();
}

export async function getCrowd(
  siteId: string
): Promise<any> {
  const response = await fetch(
    `${API_BASE_URL}/api/crowd/${siteId}`
  );

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(
      `Failed to fetch crowd data: ${response.status} ${errorText}`
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
}

export async function createReport(
  payload: CreateReportPayload
) {
  const response = await fetch(
    'http://127.0.0.1:8000/api/reports',
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