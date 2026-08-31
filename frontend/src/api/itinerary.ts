import { API_BASE_URL } from './config';

export interface ItineraryRequest {
  starting_latitude: number;
  starting_longitude: number;
  start_time: string;
  available_time_minutes: number;
  budget: number;
  interests: Record<string, any> | string[];
  crowd_tolerance: number;
  itinerary?: Record<string, any>;
}

export async function createItinerary(
  data: ItineraryRequest
) {
  const response = await fetch(
    `${API_BASE_URL}/api/itineraries`,
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
      `Failed to create itinerary: ${response.status}`
    );
  }

  return response.json();
}