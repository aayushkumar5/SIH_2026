import React, { useState } from 'react';
import { AlertItem } from '../types';
import { AlertFeed } from '../components/alerts/AlertFeed';
import {
  Bell,
  Filter,
  ShieldAlert,
  Download,
  CheckCircle2,
  Calendar,
  Layers,
} from 'lucide-react';

interface AlertsPageProps {
  alerts: AlertItem[];
  onAlertAction: (id: string, action: 'ACKNOWLEDGE' | 'RESOLVE' | 'DISMISS', notes?: string) => Promise<void>;
}

export const AlertsPage: React.FC<AlertsPageProps> = ({ alerts, onAlertAction }) => {
  const [filterSeverity, setFilterSeverity] = useState<string>('ALL');
  const [filterStatus, setFilterStatus] = useState<string>('ALL');
  const [filterCamera, setFilterCamera] = useState<string>('ALL');

  const filtered = alerts.filter((a) => {
    if (filterSeverity !== 'ALL' && a.severity !== filterSeverity) return false;
    if (filterStatus !== 'ALL' && a.status !== filterStatus) return false;
    if (filterCamera !== 'ALL' && a.camera_id !== filterCamera) return false;
    return true;
  });

  const exportIncidentLog = () => {
    const dataStr = JSON.stringify(filtered, null, 2);
    const blob = new Blob([dataStr], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `IBVAP_INCIDENT_LOG_${Date.now()}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const cameraOptions = Array.from(new Set(alerts.map((a) => a.camera_id)));

  return (
    <div className="flex-1 flex flex-col h-full overflow-hidden p-6 space-y-4">
      {/* Incident Center Header */}
      <div className="glass-panel p-4 rounded-xl border border-gray-800 flex flex-wrap items-center justify-between gap-4 select-none">
        <div className="flex items-center gap-3">
          <div className="p-2.5 rounded-lg bg-red-600/20 text-red-400 border border-red-500/30">
            <Bell className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-sm font-bold text-slate-100 uppercase tracking-wider">
              Border Security Incident & Alert Center
            </h2>
            <p className="text-xs text-slate-400">
              Triage, acknowledge, dispatch QRF teams, and resolve prioritized AI border detections
            </p>
          </div>
        </div>

        {/* Filter Controls */}
        <div className="flex flex-wrap items-center gap-3 text-xs">
          <div className="flex items-center gap-1.5 bg-gray-900 border border-gray-700 rounded-lg px-2.5 py-1">
            <span className="text-slate-400 font-mono text-[11px]">SEVERITY:</span>
            <select
              value={filterSeverity}
              onChange={(e) => setFilterSeverity(e.target.value)}
              className="bg-transparent text-slate-200 font-mono outline-none"
            >
              <option value="ALL">ALL (ALL)</option>
              <option value="CRITICAL">CRITICAL</option>
              <option value="HIGH">HIGH</option>
              <option value="MEDIUM">MEDIUM</option>
              <option value="LOW">LOW</option>
            </select>
          </div>

          <div className="flex items-center gap-1.5 bg-gray-900 border border-gray-700 rounded-lg px-2.5 py-1">
            <span className="text-slate-400 font-mono text-[11px]">STATUS:</span>
            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              className="bg-transparent text-slate-200 font-mono outline-none"
            >
              <option value="ALL">ALL (ALL)</option>
              <option value="ACTIVE">ACTIVE</option>
              <option value="ACKNOWLEDGED">ACKNOWLEDGED</option>
              <option value="RESOLVED">RESOLVED</option>
            </select>
          </div>

          <div className="flex items-center gap-1.5 bg-gray-900 border border-gray-700 rounded-lg px-2.5 py-1">
            <span className="text-slate-400 font-mono text-[11px]">CAMERA:</span>
            <select
              value={filterCamera}
              onChange={(e) => setFilterCamera(e.target.value)}
              className="bg-transparent text-slate-200 font-mono outline-none"
            >
              <option value="ALL">ALL CAMERAS</option>
              {cameraOptions.map((cam) => (
                <option key={cam} value={cam}>
                  {cam}
                </option>
              ))}
            </select>
          </div>

          <button
            onClick={exportIncidentLog}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-gray-800 hover:bg-gray-700 text-slate-200 font-mono transition-colors"
          >
            <Download className="w-3.5 h-3.5" />
            EXPORT LOG
          </button>
        </div>
      </div>

      {/* Main Alert Feed Table View */}
      <div className="flex-1 min-h-0">
        <AlertFeed alerts={filtered} onAction={onAlertAction} />
      </div>
    </div>
  );
};
