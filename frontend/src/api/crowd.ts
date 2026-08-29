const API_BASE_URL =
  import.meta.env.VITE_API_BASE_URL || "http://localhost:8000";

export async function getCrowd(siteId: string) {
  const response = await fetch(
    `${API_BASE_URL}/api/crowd/${siteId}`
  );

  if (!response.ok) {
    throw new Error(
      `Failed to fetch crowd: ${response.status}`
    );
  }

  return response.json();
}