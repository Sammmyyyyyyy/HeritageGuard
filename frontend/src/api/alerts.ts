const API_BASE_URL =
  import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000';

export interface BackendAlert {
  id?: string;
  site_id: string;
  title: string;
  alert_type: string;
  severity: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
  message: string;
  is_resolved: boolean;
  created_at?: string | null;
  resolved_at?: string | null;
}

export interface AlertCreate {
  site_id: string;
  title: string;
  alert_type: string;
  severity: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
  message: string;
}

export interface AlertUpdate {
  is_resolved?: boolean;
}

// GET /api/alerts
export async function getAlerts(): Promise<BackendAlert[]> {
  const response = await fetch(`${API_BASE_URL}/api/alerts`);

  if (!response.ok) {
    throw new Error(`Failed to fetch alerts: ${response.status}`);
  }

  return response.json();
}

// POST /api/alerts
export async function createAlert(
  alert: AlertCreate
): Promise<BackendAlert> {
  const response = await fetch(`${API_BASE_URL}/api/alerts`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(alert),
  });

  if (!response.ok) {
    throw new Error(`Failed to create alert: ${response.status}`);
  }

  return response.json();
}

// PATCH /api/alerts/{alert_id}/resolve
export async function resolveAlert(
  alertId: string
): Promise<BackendAlert> {
  const response = await fetch(
    `${API_BASE_URL}/api/alerts/${alertId}/resolve`,
    {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
      },
    }
  );

  if (!response.ok) {
    throw new Error(`Failed to resolve alert: ${response.status}`);
  }

  return response.json();
}