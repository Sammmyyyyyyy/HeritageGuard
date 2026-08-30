const API_BASE_URL =
  import.meta.env.VITE_API_BASE_URL || "http://localhost:8000";

export interface RecommendationRequest {
  starting_latitude: number;
  starting_longitude: number;
  start_time: string;
  available_time_minutes: number;
  budget: number;
  interests: Record<string, any> | string[];
  crowd_tolerance: number;
  itinerary?: Record<string, any>;
}

export async function getRecommendation(
  data: RecommendationRequest
) {
  const response = await fetch(
    `${API_BASE_URL}/api/recommendation`,
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(data),
    }
  );

  if (!response.ok) {
    throw new Error(
      `Failed to get recommendation: ${response.status}`
    );
  }

  return response.json();
}