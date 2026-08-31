
import { API_BASE_URL } from './config';

export interface RAGQueryRequest {
  site_id: string;
  question: string;
  language?: string;
}

export async function queryHeritage(
  data: RAGQueryRequest
) {
  const response = await fetch(
    `${API_BASE_URL}/api/rag/query`,
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
      `Failed to query heritage: ${response.status}`
    );
  }

  return response.json();
}