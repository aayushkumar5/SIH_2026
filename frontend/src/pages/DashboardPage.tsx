import React, { useState } from 'react';
import {
  Camera,
  DashboardSummary,
  EventItem,
  AlertItem,
  Zone,
} from '../types';
import { VideoWall } from '../components/camera/VideoWall';
import { AlertFeed } from '../components/alerts/AlertFeed';
import {
  Shield,
  Video,
  AlertTriangle,
  Activity,
  Radio,
  Lock,
  Volume2,
  RefreshCw,
  Zap,
  TrendingUp,
  MapPin,
} from 'lucide-react';
import { useAudioAlarm } from '../hooks/useAudioAlarm';

interface DashboardPageProps {
  summary: DashboardSummary | null;
  cameras: Camera[];
  zones: Zone[];
  alerts: AlertItem[];
  lastEvent: EventItem | null;
  onAlertAction: (id: string, action: 'ACKNOWLEDGE' | 'RESOLVE' | 'DISMISS', notes?: string) => Promise<void>;
  onRefresh: () => void;
  onNavigateToLive: () => void;
}

export const DashboardPage: React.FC<DashboardPageProps> = ({
  summary,
  cameras,
  zones,
  alerts,
  lastEvent,
  onAlertAction,
  onRefresh,
  onNavigateToLive,
}) => {
  const { playCriticalAlert } = useAudioAlarm();
  const [sectorLockdown, setSectorLockdown] = useState(false);
  const [isRefreshing, setIsRefreshing] = useState(false);

  const handleRefresh = async () => {
    setIsRefreshing(true);
    await onRefresh();
    setTimeout(() => setIsRefreshing(false), 500);
  };

  const handleLockdownToggle = () => {
    const next = !sectorLockdown;
    setSectorLockdown(next);
    if (next) {
      playCriticalAlert();
    }
  };

  const onlineCameras = cameras.filter((c) => c.is_online).length;
  const activeAlerts = alerts.filter((a) => a.status === 'ACTIVE').length;
  const criticalAlerts = alerts.filter((a) => a.severity === 'CRITICAL' && a.status === 'ACTIVE').length;

  return (
    <div className="flex-1 flex flex-col h-full overflow-hidden p-6 space-y-5">
      {/* Sector Lockdown Active Alert Banner */}
      {sectorLockdown && (
        <div className="p-3.5 rounded-xl bg-red-600 text-white font-mono text-xs flex items-center justify-between shadow-2xl animate-pulse">
          <div className="flex items-center gap-3">
            <Radio className="w-5 h-5 animate-spin" />
            <span className="font-bold text-sm">
              SECTOR LOCKDOWN PROTOCOL ACTIVE: All transit barriers engaged. QRF on high alert.
            </span>
          </div>
          <button
            onClick={handleLockdownToggle}
            className="px-3 py-1 rounded bg-black/40 hover:bg-black/60 text-white text-xs font-bold border border-white/30"
          >
            DISENGAGE LOCKDOWN
          </button>
        </div>
      )}

      {/* Top Metric KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Threat Level */}
        <div className="glass-panel p-4 rounded-xl border border-gray-800 flex items-center justify-between">
          <div>
            <p className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">
              Border Threat Index
            </p>
            <p className="text-xl font-bold text-slate-100 mt-1 font-mono">
              {summary?.threat_level || 'NORMAL'}
            </p>
            <p className="text-[10px] text-slate-500 mt-0.5">Automated Multi-Sensor Assessment</p>
          </div>
          <div className="p-3 rounded-lg bg-blue-500/10 text-blue-400 border border-blue-500/20">
            <Shield className="w-5 h-5" />
          </div>
        </div>

        {/* Active CCTV Streams */}
        <div className="glass-panel p-4 rounded-xl border border-gray-800 flex items-center justify-between">
          <div>
            <p className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">
              Active CCTV Streams
            </p>
            <p className="text-xl font-bold text-emerald-400 mt-1 font-mono">
              {onlineCameras} / {cameras.length}
            </p>
            <p className="text-[10px] text-emerald-500/80 mt-0.5">100% Ingestion Online</p>
          </div>
          <div className="p-3 rounded-lg bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
            <Video className="w-5 h-5" />
          </div>
        </div>

        {/* Active Alerts */}
        <div className="glass-panel p-4 rounded-xl border border-gray-800 flex items-center justify-between">
          <div>
            <p className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">
              Active Security Alerts
            </p>
            <p className="text-xl font-bold text-red-400 mt-1 font-mono">
              {activeAlerts}
            </p>
            <p className="text-[10px] text-red-500/80 mt-0.5 font-bold">
              {criticalAlerts} Critical Incidents Pending
            </p>
          </div>
          <div className="p-3 rounded-lg bg-red-500/10 text-red-400 border border-red-500/20">
            <AlertTriangle className="w-5 h-5" />
          </div>
        </div>

        {/* 24h AI Detections */}
        <div className="glass-panel p-4 rounded-xl border border-gray-800 flex items-center justify-between">
          <div>
            <p className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">
              24h AI Detections
            </p>
            <p className="text-xl font-bold text-cyan-400 mt-1 font-mono">
              {summary?.events_last_24h || 128}
            </p>
            <p className="text-[10px] text-cyan-500/80 mt-0.5">YOLO + ByteTrack + ANPR + FRS</p>
          </div>
          <div className="p-3 rounded-lg bg-cyan-500/10 text-cyan-400 border border-cyan-500/20">
            <Activity className="w-5 h-5" />
          </div>
        </div>
      </div>

      {/* Quick Tactical Command Action Bar */}
      <div className="glass-panel px-4 py-2.5 rounded-xl border border-gray-800 flex flex-wrap items-center justify-between gap-3 text-xs">
        <div className="flex items-center gap-2 text-slate-400 font-mono">
          <Zap className="w-4 h-4 text-amber-400" />
          <span className="font-bold text-slate-200">QUICK TACTICAL ACTIONS:</span>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <button
            onClick={handleLockdownToggle}
            className={`px-3 py-1.5 rounded-lg font-mono font-bold text-xs border transition-all flex items-center gap-1.5 ${
              sectorLockdown
                ? 'bg-red-600 text-white border-red-500'
                : 'bg-red-950/40 hover:bg-red-950/70 border-red-500/40 text-red-300'
            }`}
          >
            <Lock className="w-3.5 h-3.5" />
            {sectorLockdown ? 'DISENGAGE LOCKDOWN' : 'LOCKDOWN SECTOR'}
          </button>

          <button
            onClick={playCriticalAlert}
            className="px-3 py-1.5 rounded-lg bg-blue-950/40 hover:bg-blue-950/70 border border-blue-500/40 text-blue-300 font-mono text-xs font-bold transition-all flex items-center gap-1.5"
          >
            <Volume2 className="w-3.5 h-3.5 text-blue-400" />
            TEST TACTICAL ALARM
          </button>

          <button
            onClick={handleRefresh}
            disabled={isRefreshing}
            className="px-3 py-1.5 rounded-lg bg-gray-900 hover:bg-gray-800 border border-gray-700 text-slate-300 font-mono text-xs transition-all flex items-center gap-1.5"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isRefreshing ? 'animate-spin' : ''}`} />
            REFRESH FEEDS
          </button>
        </div>
      </div>

      {/* Main Grid: Live Surveillance Desk (Left 2 Col) + Alert Stream (Right 1 Col) */}
      <div className="flex-1 grid grid-cols-1 lg:grid-cols-3 gap-5 min-h-0">
        <div className="lg:col-span-2 flex flex-col min-h-0">
          <VideoWall cameras={cameras} zones={zones} lastEvent={lastEvent} layout="2x2" />
        </div>
        <div className="lg:col-span-1 flex flex-col min-h-0">
          <AlertFeed alerts={alerts} onAction={onAlertAction} />
        </div>
      </div>
    </div>
  );
};
