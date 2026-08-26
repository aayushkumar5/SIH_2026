import React from 'react';
import { AlertItem } from '../types';
import { AlertOctagon, CheckCircle2, ShieldAlert, XCircle, Clock } from 'lucide-react';

interface AlertFeedProps {
  alerts: AlertItem[];
  onAction: (alertId: string, action: 'ACKNOWLEDGE' | 'RESOLVE' | 'DISMISS') => void;
}

export const AlertFeed: React.FC<AlertFeedProps> = ({ alerts, onAction }) => {
  const getSeverityStyle = (severity: string) => {
    switch (severity) {
      case 'CRITICAL':
        return 'border-l-4 border-red-500 bg-red-950/20 text-red-400';
      case 'HIGH':
        return 'border-l-4 border-amber-500 bg-amber-950/20 text-amber-400';
      case 'MEDIUM':
        return 'border-l-4 border-yellow-500 bg-yellow-950/20 text-yellow-400';
      default:
        return 'border-l-4 border-blue-500 bg-blue-950/20 text-blue-400';
    }
  };

  return (
    <div className="flex flex-col h-full overflow-hidden glass-panel rounded-xl p-4 space-y-3">
      <div className="flex items-center justify-between pb-2 border-b border-gray-800">
        <div className="flex items-center gap-2">
          <ShieldAlert className="w-5 h-5 text-red-400 animate-pulse" />
          <h3 className="text-sm font-bold uppercase tracking-wider text-slate-200">
            Real-Time Alert Feed
          </h3>
        </div>
        <span className="px-2 py-0.5 rounded-full text-xs font-mono font-bold bg-red-500/20 text-red-400 border border-red-500/30">
          {alerts.filter((a) => a.status === 'ACTIVE').length} ACTIVE
        </span>
      </div>

      <div className="flex-1 overflow-y-auto space-y-2.5 pr-1">
        {alerts.length === 0 ? (
          <div className="h-40 flex flex-col items-center justify-center text-slate-500 text-xs font-mono">
            <CheckCircle2 className="w-8 h-8 text-emerald-500/40 mb-2" />
            No active border security alerts.
          </div>
        ) : (
          alerts.map((alert) => (
            <div
              key={alert.id}
              className={`p-3 rounded-lg border border-gray-800 ${getSeverityStyle(
                alert.severity
              )} flex flex-col space-y-2 transition-all`}
            >
              <div className="flex items-start justify-between">
                <div className="space-y-0.5">
                  <div className="flex items-center gap-2">
                    <span className="text-[10px] font-bold font-mono px-1.5 py-0.5 rounded bg-gray-900 border border-gray-700">
                      {alert.severity}
                    </span>
                    <span className="text-xs font-bold text-slate-200">{alert.title}</span>
                  </div>
                  <p className="text-[11px] text-slate-400">{alert.description}</p>
                </div>
                <div className="text-[10px] font-mono text-slate-400 flex items-center gap-1">
                  <Clock className="w-3 h-3" />
                  {new Date(alert.created_at).toLocaleTimeString()}
                </div>
              </div>

              <div className="flex items-center justify-between pt-1 border-t border-gray-800/60 text-[11px]">
                <div className="text-slate-400 font-mono">
                  CAM: <span className="text-cyan-400 font-bold">{alert.camera_id}</span> • STATUS:{' '}
                  <span
                    className={
                      alert.status === 'ACTIVE'
                        ? 'text-red-400 font-bold'
                        : alert.status === 'ACKNOWLEDGED'
                        ? 'text-amber-400 font-bold'
                        : 'text-emerald-400 font-bold'
                    }
                  >
                    {alert.status}
                  </span>
                </div>

                {alert.status === 'ACTIVE' && (
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => onAction(alert.id, 'ACKNOWLEDGE')}
                      className="px-2 py-1 rounded bg-amber-600/30 hover:bg-amber-600/50 text-amber-300 text-[10px] font-bold border border-amber-500/40 transition-colors"
                    >
                      ACKNOWLEDGE
                    </button>
                    <button
                      onClick={() => onAction(alert.id, 'RESOLVE')}
                      className="px-2 py-1 rounded bg-emerald-600/30 hover:bg-emerald-600/50 text-emerald-300 text-[10px] font-bold border border-emerald-500/40 transition-colors"
                    >
                      RESOLVE
                    </button>
                  </div>
                )}
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};
