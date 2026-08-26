export type Severity = 'CRITICAL' | 'HIGH' | 'MEDIUM' | 'LOW' | 'INFO';

export type EventType =
  | 'INTRUSION'
  | 'TRIPWIRE_CROSS'
  | 'LOITERING'
  | 'NIGHT_MOVEMENT'
  | 'VEHICLE_INTRUSION'
  | 'STATIONARY_VEHICLE'
  | 'ANPR_DETECTION'
  | 'WATCHLIST_PLATE'
  | 'FACE_DETECTION'
  | 'WATCHLIST_FACE'
  | 'CAMERA_OFFLINE'
  | 'SYSTEM_ERROR';

export interface Camera {
  id: string;
  name: string;
  rtsp_url: string;
  location_name: string;
  latitude: number | null;
  longitude: number | null;
  bop_id: string;
  is_online: boolean;
  fps: number;
  resolution: string;
  created_at: string;
}

export interface Zone {
  id: string;
  camera_id: string;
  name: string;
  zone_type: 'polygon' | 'line';
  coordinates: number[][];
  severity: Severity;
  loitering_threshold_seconds: number;
  enabled: boolean;
  created_at: string;
}

export interface EventItem {
  id: string;
  camera_id: string;
  timestamp: string;
  event_type: EventType;
  severity: Severity;
  track_id: number | null;
  object_class: string | null;
  confidence: number;
  zone_id: string | null;
  snapshot_path: string | null;
  clip_path: string | null;
  metadata_json: Record<string, any>;
}

export interface AlertItem {
  id: string;
  event_id: string;
  camera_id: string;
  title: string;
  description: string;
  severity: Severity;
  status: 'ACTIVE' | 'ACKNOWLEDGED' | 'RESOLVED' | 'DISMISSED';
  created_at: string;
  acknowledged_by?: string;
  acknowledged_at?: string;
  resolved_by?: string;
  resolved_at?: string;
  resolution_notes?: string;
}

export interface PlateWatchlistItem {
  id: string;
  category: string;
  reason?: string;
  added_by?: string;
  is_active: boolean;
  created_at: string;
}

export interface FaceWatchlistItem {
  id: string;
  name: string;
  category: string;
  notes?: string;
  photo_path?: string;
  is_active: boolean;
  created_at: string;
}

export interface AuditRecord {
  sequence_id: number;
  event_id: string;
  timestamp: string;
  actor: string;
  action: string;
  target_resource: string;
  payload_digest: string;
  previous_hash: string;
  current_hash: string;
}

export interface AuditVerificationResult {
  is_valid: boolean;
  total_records: number;
  verified_records: number;
  corrupted_sequence_id?: number | null;
  message: string;
}

export interface DashboardSummary {
  threat_level: string;
  total_cameras: number;
  online_cameras: number;
  active_alerts: number;
  critical_alerts: number;
  events_last_24h: number;
  events_by_type: Record<string, number>;
  timestamp: string;
}

export interface SystemMetrics {
  platform: string;
  cpu_percent: number;
  memory_percent: number;
  memory_used_mb: number;
  disk_percent: number;
  disk_free_gb: number;
  bop_id: string;
  timestamp: string;
}
