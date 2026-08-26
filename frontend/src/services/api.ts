import {
  AlertItem,
  AuditRecord,
  AuditVerificationResult,
  Camera,
  DashboardSummary,
  EventItem,
  FaceWatchlistItem,
  PlateWatchlistItem,
  SystemMetrics,
  Zone
} from '../types';

const API_BASE = '/api/v1';

async function fetchJSON<T>(endpoint: string, options?: RequestInit): Promise<T> {
  const res = await fetch(`${API_BASE}${endpoint}`, {
    headers: {
      'Content-Type': 'application/json',
    },
    ...options,
  });
  if (!res.ok) {
    throw new Error(`API error ${res.status}: ${res.statusText}`);
  }
  return res.json();
}

export const api = {
  // Summary & Metrics
  getSummary: () => fetchJSON<DashboardSummary>('/analytics/summary'),
  getTrends: (hours = 24) => fetchJSON<{ time: string; events: number }[]>(`/analytics/trends?hours=${hours}`),
  getMetrics: () => fetchJSON<SystemMetrics>('/system/metrics'),

  // Cameras
  getCameras: () => fetchJSON<Camera[]>('/cameras/'),
  createCamera: (data: Partial<Camera>) => fetchJSON<Camera>('/cameras/', {
    method: 'POST',
    body: JSON.stringify(data),
  }),

  // Zones
  getZones: (cameraId?: string) => fetchJSON<Zone[]>(`/zones/${cameraId ? `?camera_id=${cameraId}` : ''}`),
  createZone: (data: Partial<Zone>) => fetchJSON<Zone>('/zones/', {
    method: 'POST',
    body: JSON.stringify(data),
  }),
  deleteZone: (zoneId: string) => fetchJSON<{ message: string }>(`/zones/${zoneId}`, {
    method: 'DELETE',
  }),

  // Events & Alerts
  getEvents: (params?: { camera_id?: string; event_type?: string; limit?: number }) => {
    const query = new URLSearchParams();
    if (params?.camera_id) query.append('camera_id', params.camera_id);
    if (params?.event_type) query.append('event_type', params.event_type);
    if (params?.limit) query.append('limit', params.limit.toString());
    return fetchJSON<EventItem[]>(`/events/?${query.toString()}`);
  },
  getAlerts: (params?: { status?: string; severity?: string; limit?: number }) => {
    const query = new URLSearchParams();
    if (params?.status) query.append('status', params.status);
    if (params?.severity) query.append('severity', params.severity);
    if (params?.limit) query.append('limit', params.limit.toString());
    return fetchJSON<AlertItem[]>(`/alerts/?${query.toString()}`);
  },
  alertAction: (alertId: string, action: 'ACKNOWLEDGE' | 'RESOLVE' | 'DISMISS', notes?: string) =>
    fetchJSON<AlertItem>(`/alerts/${alertId}/action`, {
      method: 'POST',
      body: JSON.stringify({ action, notes }),
    }),

  // Watchlists
  getPlateWatchlist: () => fetchJSON<PlateWatchlistItem[]>('/anpr/watchlist'),
  addPlateWatchlist: (plate: { id: string; category: string; reason?: string }) =>
    fetchJSON<PlateWatchlistItem>('/anpr/watchlist', {
      method: 'POST',
      body: JSON.stringify(plate),
    }),
  removePlateWatchlist: (plateId: string) =>
    fetchJSON<{ message: string }>(`/anpr/watchlist/${plateId}`, { method: 'DELETE' }),

  getFaceWatchlist: () => fetchJSON<FaceWatchlistItem[]>('/faces/watchlist'),
  addFaceWatchlist: (face: { id: string; name: string; category: string; embedding: number[]; notes?: string }) =>
    fetchJSON<FaceWatchlistItem>('/faces/watchlist', {
      method: 'POST',
      body: JSON.stringify(face),
    }),
  removeFaceWatchlist: (faceId: string) =>
    fetchJSON<{ message: string }>(`/faces/watchlist/${faceId}`, { method: 'DELETE' }),

  // Audit Hash Chain
  getAuditChain: (limit = 50) => fetchJSON<AuditRecord[]>(`/audit/chain?limit=${limit}`),
  verifyAuditIntegrity: () => fetchJSON<AuditVerificationResult>('/audit/verify'),
};
