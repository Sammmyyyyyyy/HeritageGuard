const API_BASE_URL =
  import.meta.env.VITE_API_BASE_URL || "http://localhost:8000";

export async function getReports() {
  const response = await fetch(`${API_BASE_URL}/api/reports`);

  if (!response.ok) {
    throw new Error(`Failed to fetch reports: ${response.status}`);
  }

  return response.json();
}

export async function getSiteReports(siteId: string) {
  const response = await fetch(
    `${API_BASE_URL}/api/reports/${siteId}`
  );

  if (!response.ok) {
    throw new Error(`Failed to fetch site reports: ${response.status}`);
  }

  return response.json();
}