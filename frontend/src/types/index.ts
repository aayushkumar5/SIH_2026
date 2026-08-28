export type Severity = 'CRITICAL' | 'HIGH' | 'MEDIUM' | 'LOW' | 'INFO';

export type UserRole = 'COMMANDER' | 'OPERATOR' | 'AUDITOR' | 'ADMIN';

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

export interface User {
  id: number;
  username: string;
  email: string;
  full_name?: string;
  role: UserRole;
  is_active: boolean;
  created_at: string;
}

export interface AuthState {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
}

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
  category: 'STOLEN' | 'WANTED' | 'SUSPICIOUS' | 'HIGH_RISK' | 'VIP';
  reason?: string;
  added_by?: string;
  is_active: boolean;
  created_at: string;
}

export interface PlateDetectionEvent {
  id: string;
  plate_number: string;
  plate_format: 'STANDARD' | 'BHARAT_SERIES' | 'MILITARY' | 'OTHER';
  vehicle_type: 'SEDAN' | 'SUV' | 'TRUCK' | 'MOTORCYCLE' | 'BUS';
  camera_id: string;
  timestamp: string;
  confidence: number;
  is_watchlist_match: boolean;
  category?: string;
  speed_kmh?: number;
}

export interface FaceWatchlistItem {
  id: string;
  name: string;
  category: 'WANTED' | 'PERSON_OF_INTEREST' | 'CROSS_BORDER_SMUGGLER' | 'SECURITY_RISK' | 'AUTHORIZED';
  notes?: string;
  photo_path?: string;
  embedding?: number[];
  is_active: boolean;
  created_at: string;
}

export interface FaceMatchResult {
  suspect_id: string;
  suspect_name: string;
  category: string;
  similarity_score: number;
  is_match: boolean;
  confidence_level: 'HIGH' | 'MEDIUM' | 'LOW' | 'NO_MATCH';
  notes?: string;
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
  threat_level: 'NORMAL' | 'MODERATE' | 'ELEVATED' | 'CRITICAL';
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

export interface AISettings {
  yolo_confidence: number;
  bytetrack_max_age: number;
  loitering_default_seconds: number;
  night_enhancement_clip: number;
  face_match_threshold: number;
  edge_sync_interval_seconds: number;
  sound_alert_enabled: boolean;
  sound_alert_volume: number;
}

export interface VideoDetectionItem {
  id: string;
  timestampSeconds: number;
  objectClass: 'person' | 'vehicle';
  subClass?: string;
  confidence: number;
  trackId: number;
  bbox: [number, number, number, number]; // [x, y, w, h]
  speedKmh?: number;
}

export type TabType =
  | 'dashboard'
  | 'live'
  | 'video-analysis'
  | 'alerts'
  | 'investigation'
  | 'anpr'
  | 'faces'
  | 'cameras'
  | 'zones'
  | 'map'
  | 'analytics'
  | 'audit'
  | 'users'
  | 'settings';
