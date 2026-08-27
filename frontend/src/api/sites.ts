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
  import.meta.env.VITE_API_BASE_URL || "http://localhost:8000";

export async function getSites(): Promise<BackendSite[]> {
  const response = await fetch(`${API_BASE_URL}/api/sites`);

  if (!response.ok) {
    throw new Error(`Failed to fetch sites: ${response.status}`);
  }

  return response.json();
}
