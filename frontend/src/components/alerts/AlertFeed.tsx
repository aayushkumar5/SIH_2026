import React, { useState } from 'react';
import { AlertItem } from '../../types';
import {
  ShieldAlert,
  CheckCircle2,
  Clock,
  ExternalLink,
  Radio,
  ChevronRight,
  Filter,
} from 'lucide-react';
import { formatTimeOnly, getSeverityBadgeClass, getStatusBadgeClass } from '../../utils/formatters';
import { AlertDetailModal } from './AlertDetailModal';

interface AlertFeedProps {
  alerts: AlertItem[];
  onAction: (alertId: string, action: 'ACKNOWLEDGE' | 'RESOLVE' | 'DISMISS', notes?: string) => Promise<void>;
}

export const AlertFeed: React.FC<AlertFeedProps> = ({ alerts, onAction }) => {
  const [selectedAlert, setSelectedAlert] = useState<AlertItem | null>(null);
  const [modalOpen, setModalOpen] = useState(false);

  const activeCount = alerts.filter((a) => a.status === 'ACTIVE').length;

  const handleCardClick = (alert: AlertItem) => {
    setSelectedAlert(alert);
    setModalOpen(true);
  };

  return (
    <div className="flex flex-col h-full overflow-hidden glass-panel rounded-xl p-4 space-y-3">
      {/* Header */}
      <div className="flex items-center justify-between pb-2 border-b border-gray-800 select-none">
        <div className="flex items-center gap-2">
          <ShieldAlert className="w-5 h-5 text-red-400 animate-pulse" />
          <h3 className="text-xs font-bold uppercase tracking-wider text-slate-200">
            Real-Time Alert Feed
          </h3>
        </div>
        <span className="px-2 py-0.5 rounded-full text-[11px] font-mono font-bold bg-red-500/20 text-red-400 border border-red-500/30">
          {activeCount} ACTIVE
        </span>
      </div>

      {/* Feed List */}
      <div className="flex-1 overflow-y-auto space-y-2.5 pr-1">
        {alerts.length === 0 ? (
          <div className="h-40 flex flex-col items-center justify-center text-slate-500 text-xs font-mono">
            <CheckCircle2 className="w-8 h-8 text-emerald-500/40 mb-2" />
            No active border security alerts.
          </div>
        ) : (
          alerts.map((alert) => {
            const isCritical = alert.severity === 'CRITICAL';
            return (
              <div
                key={alert.id}
                onClick={() => handleCardClick(alert)}
                className={`p-3 rounded-lg border cursor-pointer transition-all duration-150 relative group ${
                  isCritical
                    ? 'border-red-500/60 bg-red-950/20 hover:bg-red-950/30'
                    : 'border-gray-800 bg-gray-900/60 hover:bg-gray-800/80'
                }`}
              >
                <div className="flex items-start justify-between gap-2">
                  <div className="space-y-1 flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <span className={`text-[9px] px-1.5 py-0.2 rounded font-mono font-bold ${getSeverityBadgeClass(alert.severity)}`}>
                        {alert.severity}
                      </span>
                      <span className="text-xs font-bold text-slate-200 truncate">
                        {alert.title}
                      </span>
                    </div>
                    <p className="text-[11px] text-slate-400 line-clamp-2 leading-relaxed">
                      {alert.description}
                    </p>
                  </div>

                  <div className="flex flex-col items-end gap-1 flex-shrink-0">
                    <span className="text-[10px] font-mono text-slate-400 flex items-center gap-1">
                      <Clock className="w-3 h-3 text-slate-500" />
                      {formatTimeOnly(alert.created_at)}
                    </span>
                    <span className={`text-[9px] px-1.5 py-0.2 rounded font-mono ${getStatusBadgeClass(alert.status)}`}>
                      {alert.status}
                    </span>
                  </div>
                </div>

                {/* Card Footer */}
                <div className="flex items-center justify-between pt-2 mt-2 border-t border-gray-800/60 text-[10px] font-mono text-slate-400">
                  <span className="text-slate-400">
                    CAM: <span className="text-cyan-400 font-bold">{alert.camera_id}</span>
                  </span>

                  <span className="flex items-center gap-1 text-blue-400 group-hover:translate-x-0.5 transition-transform">
                    <span>Triage</span>
                    <ChevronRight className="w-3 h-3" />
                  </span>
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* Incident Detail Modal */}
      <AlertDetailModal
        alert={selectedAlert}
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        onAction={onAction}
      />
    </div>
  );
};
