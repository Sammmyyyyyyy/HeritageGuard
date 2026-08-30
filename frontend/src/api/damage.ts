const API_BASE_URL =
  import.meta.env.VITE_API_BASE_URL || "http://localhost:8000";

export async function analyzeDamage(
  siteId: string,
  image: File
) {
  const formData = new FormData();
  formData.append("file", image);

  const response = await fetch(
    `${API_BASE_URL}/api/damage/${siteId}/analyze`,
    {
      method: "POST",
      body: formData,
    }
  );

  if (!response.ok) {
    throw new Error(
      `Failed to analyze damage: ${response.status}`
    );
  }

  return response.json();
}