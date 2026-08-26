import React, { useState } from 'react';
import { AlertItem } from '../types';
import { AlertFeed } from '../components/AlertFeed';
import { AlertOctagon, Bell, Filter, CheckCircle2, ShieldAlert } from 'lucide-react';

interface AlertsPageProps {
  alerts: AlertItem[];
  onAlertAction: (id: string, action: 'ACKNOWLEDGE' | 'RESOLVE' | 'DISMISS') => void;
}

export const AlertsPage: React.FC<AlertsPageProps> = ({ alerts, onAlertAction }) => {
  const [filterSeverity, setFilterSeverity] = useState<string>('ALL');
  const [filterStatus, setFilterStatus] = useState<string>('ALL');

  const filtered = alerts.filter((a) => {
    if (filterSeverity !== 'ALL' && a.severity !== filterSeverity) return false;
    if (filterStatus !== 'ALL' && a.status !== filterStatus) return false;
    return true;
  });

  return (
    <div className="flex-1 flex flex-col h-full overflow-hidden p-6 space-y-4">
      {/* Filter Header */}
      <div className="glass-panel p-4 rounded-xl border border-gray-800 flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <Bell className="w-5 h-5 text-red-400" />
          <div>
            <h2 className="text-sm font-bold text-slate-100 uppercase tracking-wider">
              Security Incident Center
            </h2>
            <p className="text-xs text-slate-400">Triage, acknowledge, and resolve edge AI alerts</p>
          </div>
        </div>

        <div className="flex items-center gap-3 text-xs">
          <div className="flex items-center gap-2">
            <span className="text-slate-400">SEVERITY:</span>
            <select
              value={filterSeverity}
              onChange={(e) => setFilterSeverity(e.target.value)}
              className="bg-gray-900 border border-gray-700 rounded-lg px-2.5 py-1 text-slate-200"
            >
              <option value="ALL">ALL SEVERITIES</option>
              <option value="CRITICAL">CRITICAL</option>
              <option value="HIGH">HIGH</option>
              <option value="MEDIUM">MEDIUM</option>
            </select>
          </div>

          <div className="flex items-center gap-2">
            <span className="text-slate-400">STATUS:</span>
            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              className="bg-gray-900 border border-gray-700 rounded-lg px-2.5 py-1 text-slate-200"
            >
              <option value="ALL">ALL STATUSES</option>
              <option value="ACTIVE">ACTIVE</option>
              <option value="ACKNOWLEDGED">ACKNOWLEDGED</option>
              <option value="RESOLVED">RESOLVED</option>
            </select>
          </div>
        </div>
      </div>

      <div className="flex-1 min-h-0">
        <AlertFeed alerts={filtered} onAction={onAlertAction} />
      </div>
    </div>
  );
};
