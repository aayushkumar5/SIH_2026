import React, { useState } from 'react';
import { AlertItem } from '../../types';
import {
  X,
  ShieldAlert,
  Clock,
  Camera,
  CheckCircle2,
  AlertTriangle,
  Radio,
  FileText,
  User,
  Send,
} from 'lucide-react';
import { formatTimestamp, getSeverityBadgeClass, getStatusBadgeClass } from '../../utils/formatters';

interface AlertDetailModalProps {
  alert: AlertItem | null;
  isOpen: boolean;
  onClose: () => void;
  onAction: (alertId: string, action: 'ACKNOWLEDGE' | 'RESOLVE' | 'DISMISS', notes?: string) => Promise<void>;
}

export const AlertDetailModal: React.FC<AlertDetailModalProps> = ({
  alert,
  isOpen,
  onClose,
  onAction,
}) => {
  if (!isOpen || !alert) return null;

  const [resolutionNotes, setResolutionNotes] = useState('');
  const [qrfDispatched, setQrfDispatched] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const handleAction = async (action: 'ACKNOWLEDGE' | 'RESOLVE' | 'DISMISS') => {
    setSubmitting(true);
    try {
      await onAction(alert.id, action, resolutionNotes);
      onClose();
    } finally {
      setSubmitting(false);
    }
  };

  const handleEscalateQRF = () => {
    setQrfDispatched(true);
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-4">
      <div className="glass-panel w-full max-w-2xl rounded-2xl border border-gray-700 shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="px-5 py-4 bg-gray-900/90 border-b border-gray-800 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div
              className={`p-2.5 rounded-lg border ${
                alert.severity === 'CRITICAL'
                  ? 'bg-red-500/20 text-red-400 border-red-500/40 animate-pulse'
                  : 'bg-amber-500/20 text-amber-400 border-amber-500/40'
              }`}
            >
              <ShieldAlert className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-mono text-xs font-bold text-cyan-400">{alert.id}</span>
                <span className={`text-[10px] px-2 py-0.5 rounded font-mono font-bold ${getSeverityBadgeClass(alert.severity)}`}>
                  {alert.severity}
                </span>
                <span className={`text-[10px] px-2 py-0.5 rounded font-mono ${getStatusBadgeClass(alert.status)}`}>
                  {alert.status}
                </span>
              </div>
              <h3 className="text-sm font-bold text-slate-100 mt-1">{alert.title}</h3>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 rounded-lg hover:bg-gray-800 text-slate-400 hover:text-slate-200 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-5 overflow-y-auto text-xs">
          {/* Incident Description */}
          <div className="glass-card p-3.5 rounded-xl space-y-1">
            <span className="text-[10px] uppercase font-bold text-slate-400 font-mono">
              Operational Incident Description
            </span>
            <p className="text-slate-200 leading-relaxed text-[13px]">{alert.description}</p>
          </div>

          {/* Telemetry Grid */}
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 font-mono">
            <div className="glass-card p-3 rounded-lg">
              <span className="text-slate-400 text-[10px] block">SOURCE CAMERA</span>
              <span className="text-cyan-400 font-bold text-sm">{alert.camera_id}</span>
            </div>

            <div className="glass-card p-3 rounded-lg">
              <span className="text-slate-400 text-[10px] block">TIMESTAMP (UTC)</span>
              <span className="text-slate-200 font-bold text-[11px] block">
                {formatTimestamp(alert.created_at)}
              </span>
            </div>

            <div className="glass-card p-3 rounded-lg">
              <span className="text-slate-400 text-[10px] block">EVENT ID LINK</span>
              <span className="text-slate-200 font-bold text-[11px] truncate block">
                {alert.event_id}
              </span>
            </div>
          </div>

          {/* QRF Dispatch Status */}
          {qrfDispatched && (
            <div className="p-3 rounded-xl bg-red-950/60 border border-red-500/60 text-red-300 font-mono text-xs flex items-center justify-between animate-in fade-in">
              <div className="flex items-center gap-2">
                <Radio className="w-4 h-4 text-red-400 animate-ping" />
                <span>
                  <strong>QRF ALERT DISPATCHED:</strong> Quick Reaction Force Team Bravo deployed to{' '}
                  {alert.camera_id} Sector.
                </span>
              </div>
              <span className="text-[10px] px-2 py-0.5 rounded bg-red-900 text-white font-bold">
                ETA: 2 MIN
              </span>
            </div>
          )}

          {/* Resolution Notes Input */}
          <div className="space-y-1.5">
            <label className="block text-slate-400 font-mono text-[11px]">
              INCIDENT RESOLUTION NOTES / COMMANDER INSTRUCTIONS
            </label>
            <textarea
              rows={3}
              placeholder="Record forensic observations, field patrol verification, or dispatch log..."
              value={resolutionNotes}
              onChange={(e) => setResolutionNotes(e.target.value)}
              className="w-full bg-gray-900 border border-gray-700 rounded-lg p-3 text-slate-100 focus:border-blue-500 outline-none text-xs"
            />
          </div>

          {/* Action Workflow Buttons */}
          <div className="flex flex-wrap items-center justify-between gap-3 pt-3 border-t border-gray-800">
            <div>
              {!qrfDispatched && alert.status === 'ACTIVE' && (
                <button
                  type="button"
                  onClick={handleEscalateQRF}
                  className="px-3 py-2 rounded-lg bg-red-600/30 hover:bg-red-600/50 text-red-300 border border-red-500/50 text-xs font-bold transition-all flex items-center gap-2"
                >
                  <Radio className="w-3.5 h-3.5 text-red-400 animate-pulse" />
                  ESCALATE & DISPATCH QRF
                </button>
              )}
            </div>

            <div className="flex items-center gap-2">
              {alert.status === 'ACTIVE' && (
                <button
                  onClick={() => handleAction('ACKNOWLEDGE')}
                  disabled={submitting}
                  className="px-3.5 py-2 rounded-lg bg-amber-600/30 hover:bg-amber-600/50 text-amber-300 border border-amber-500/50 text-xs font-bold transition-colors"
                >
                  ACKNOWLEDGE
                </button>
              )}

              <button
                onClick={() => handleAction('RESOLVE')}
                disabled={submitting}
                className="px-4 py-2 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold transition-colors flex items-center gap-1.5 shadow-lg"
              >
                <CheckCircle2 className="w-4 h-4" />
                {submitting ? 'RESOLVING...' : 'RESOLVE INCIDENT'}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
