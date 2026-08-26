import React from 'react';
import { Camera, DashboardSummary, EventItem, AlertItem, Zone } from '../types';
import { VideoWall } from '../components/VideoWall';
import { AlertFeed } from '../components/AlertFeed';
import { Shield, Radio, Video, AlertTriangle, Activity, Eye, CheckCircle2, TrendingUp } from 'lucide-react';

interface DashboardPageProps {
  summary: DashboardSummary | null;
  cameras: Camera[];
  zones: Zone[];
  alerts: AlertItem[];
  lastEvent: EventItem | null;
  onAlertAction: (id: string, action: 'ACKNOWLEDGE' | 'RESOLVE' | 'DISMISS') => void;
}

export const DashboardPage: React.FC<DashboardPageProps> = ({
  summary,
  cameras,
  zones,
  alerts,
  lastEvent,
  onAlertAction,
}) => {
  return (
    <div className="flex-1 flex flex-col h-full overflow-hidden p-6 space-y-6">
      {/* Top Metric Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Threat Level */}
        <div className="glass-panel p-4 rounded-xl border border-gray-800 flex items-center justify-between">
          <div>
            <p className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Sector Threat Status</p>
            <p className="text-xl font-bold text-slate-100 mt-1 font-mono">
              {summary?.threat_level || 'NORMAL'}
            </p>
            <p className="text-[10px] text-slate-500 mt-0.5">Real-time dynamic risk calculation</p>
          </div>
          <div className="p-3 rounded-lg bg-blue-500/10 text-blue-400 border border-blue-500/20">
            <Shield className="w-5 h-5" />
          </div>
        </div>

        {/* Active Cameras */}
        <div className="glass-panel p-4 rounded-xl border border-gray-800 flex items-center justify-between">
          <div>
            <p className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Active CCTV Feeds</p>
            <p className="text-xl font-bold text-emerald-400 mt-1 font-mono">
              {summary?.online_cameras || cameras.length} / {summary?.total_cameras || cameras.length}
            </p>
            <p className="text-[10px] text-emerald-500/80 mt-0.5">100% Edge AI Ingestion Online</p>
          </div>
          <div className="p-3 rounded-lg bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
            <Video className="w-5 h-5" />
          </div>
        </div>

        {/* Active Alerts */}
        <div className="glass-panel p-4 rounded-xl border border-gray-800 flex items-center justify-between">
          <div>
            <p className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Active Security Alerts</p>
            <p className="text-xl font-bold text-red-400 mt-1 font-mono">
              {summary?.active_alerts || 0}
            </p>
            <p className="text-[10px] text-red-500/80 mt-0.5">
              {summary?.critical_alerts || 0} Critical incidents pending
            </p>
          </div>
          <div className="p-3 rounded-lg bg-red-500/10 text-red-400 border border-red-500/20">
            <AlertTriangle className="w-5 h-5" />
          </div>
        </div>

        {/* 24h Detections */}
        <div className="glass-panel p-4 rounded-xl border border-gray-800 flex items-center justify-between">
          <div>
            <p className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">24h AI Detections</p>
            <p className="text-xl font-bold text-cyan-400 mt-1 font-mono">
              {summary?.events_last_24h || 0}
            </p>
            <p className="text-[10px] text-cyan-500/80 mt-0.5">YOLO + ByteTrack + ANPR + FRS</p>
          </div>
          <div className="p-3 rounded-lg bg-cyan-500/10 text-cyan-400 border border-cyan-500/20">
            <Activity className="w-5 h-5" />
          </div>
        </div>
      </div>

      {/* Main Tactical Grid: Live Video Wall (Left) + Real-Time Alert Stream (Right) */}
      <div className="flex-1 grid grid-cols-1 lg:grid-cols-3 gap-6 min-h-0">
        <div className="lg:col-span-2 flex flex-col min-h-0">
          <VideoWall cameras={cameras} zones={zones} lastEvent={lastEvent} />
        </div>
        <div className="lg:col-span-1 flex flex-col min-h-0">
          <AlertFeed alerts={alerts} onAction={onAlertAction} />
        </div>
      </div>
    </div>
  );
};
