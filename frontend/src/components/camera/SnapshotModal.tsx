import React from 'react';
import { Camera, EventItem } from '../../types';
import { X, Download, ShieldCheck, Eye, MapPin, Clock, Camera as CameraIcon, Hash } from 'lucide-react';
import { formatTimestamp } from '../../utils/formatters';

interface SnapshotModalProps {
  camera: Camera | null;
  event?: EventItem | null;
  isOpen: boolean;
  onClose: () => void;
}

export const SnapshotModal: React.FC<SnapshotModalProps> = ({
  camera,
  event,
  isOpen,
  onClose,
}) => {
  if (!isOpen || !camera) return null;

  const mockDigest =
    event?.metadata_json?.sha256_digest ||
    'e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855';

  const downloadReport = () => {
    const reportData = {
      platform: 'IBVAP - Intelligent Border Video Analytics Platform (SSB)',
      camera_id: camera.id,
      camera_name: camera.name,
      location: camera.location_name,
      coordinates: { lat: camera.latitude, lon: camera.longitude },
      event_id: event?.id || 'SNAPSHOT_MANUAL_CAPTURE',
      event_type: event?.event_type || 'MANUAL_SURVEILLANCE_INSPECTION',
      severity: event?.severity || 'LOW',
      timestamp: event?.timestamp || new Date().toISOString(),
      evidential_sha256: mockDigest,
    };

    const blob = new Blob([JSON.stringify(reportData, null, 2)], {
      type: 'application/json',
    });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `IBVAP_EVIDENCE_${camera.id}_${Date.now()}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-4">
      <div className="glass-panel w-full max-w-3xl rounded-2xl border border-gray-700 shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="px-5 py-3.5 bg-gray-900/90 border-b border-gray-800 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <CameraIcon className="w-5 h-5 text-blue-400" />
            <div>
              <h3 className="text-sm font-bold text-slate-100 uppercase tracking-wider">
                Forensic Frame Snapshot • {camera.id}
              </h3>
              <p className="text-[11px] text-slate-400">{camera.name}</p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 rounded-lg hover:bg-gray-800 text-slate-400 hover:text-slate-200 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Snapshot Viewport */}
        <div className="relative bg-black flex items-center justify-center min-h-[320px] overflow-hidden border-b border-gray-800">
          <div className="w-full h-full p-4 flex items-center justify-center">
            {/* Synthetic Tactical Snapshot Image Canvas Simulation */}
            <div className="relative w-full aspect-video max-w-2xl bg-gradient-to-br from-gray-950 via-[#0B0F19] to-slate-900 rounded-lg border border-gray-700 flex flex-col items-center justify-center overflow-hidden">
              {/* Grid overlay */}
              <div className="absolute inset-0 bg-[linear-gradient(to_right,#1f293720_1px,transparent_1px),linear-gradient(to_bottom,#1f293720_1px,transparent_1px)] bg-[size:24px_24px]" />

              {/* Simulated Bounding Box */}
              <div className="absolute top-1/4 left-1/3 w-32 h-44 border-2 border-red-500 bg-red-500/10 rounded-sm">
                <div className="absolute -top-5 left-0 px-2 py-0.5 bg-red-600 text-white text-[9px] font-bold font-mono rounded-t">
                  PERSON #104 94%
                </div>
                <div className="absolute bottom-1 right-1 text-[8px] text-red-300 font-mono">
                  Z: INTRUSION
                </div>
              </div>

              {/* Watermark Details */}
              <div className="absolute top-3 left-3 text-[10px] font-mono text-emerald-400 bg-black/70 px-2 py-1 rounded border border-gray-700">
                REC • {camera.id} • {camera.resolution} • FPS: {camera.fps}
              </div>

              <div className="absolute bottom-3 left-3 text-[10px] font-mono text-slate-300 bg-black/70 px-2.5 py-1 rounded border border-gray-700">
                TIME: {formatTimestamp(event?.timestamp || new Date().toISOString())}
              </div>

              <div className="absolute bottom-3 right-3 text-[9px] font-mono text-cyan-400 bg-black/70 px-2 py-1 rounded border border-gray-700">
                SHA-256: {mockDigest.slice(0, 16)}...
              </div>
            </div>
          </div>
        </div>

        {/* Telemetry & Metadata Drawer */}
        <div className="p-5 space-y-4 overflow-y-auto text-xs font-mono">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            <div className="glass-card p-2.5 rounded-lg">
              <span className="text-slate-400 text-[10px] block">LOCATION</span>
              <span className="text-slate-200 font-bold text-[11px] truncate block">
                {camera.location_name}
              </span>
            </div>

            <div className="glass-card p-2.5 rounded-lg">
              <span className="text-slate-400 text-[10px] block">COORDINATES</span>
              <span className="text-cyan-400 font-bold text-[11px]">
                {camera.latitude?.toFixed(4)}, {camera.longitude?.toFixed(4)}
              </span>
            </div>

            <div className="glass-card p-2.5 rounded-lg">
              <span className="text-slate-400 text-[10px] block">EVENT CLASSIFICATION</span>
              <span className="text-amber-400 font-bold text-[11px]">
                {event?.event_type || 'MANUAL_INSPECTION'}
              </span>
            </div>

            <div className="glass-card p-2.5 rounded-lg">
              <span className="text-slate-400 text-[10px] block">EVIDENCE STATE</span>
              <span className="text-emerald-400 font-bold text-[11px] flex items-center gap-1">
                <ShieldCheck className="w-3 h-3" />
                IMMUTABLE HASHED
              </span>
            </div>
          </div>

          <div className="glass-card p-3 rounded-lg flex items-center justify-between">
            <div className="space-y-0.5">
              <span className="text-slate-400 text-[10px]">
                CRYPTOGRAPHIC SHA-256 EVIDENTIAL DIGEST
              </span>
              <p className="text-[11px] text-cyan-300 font-mono break-all">{mockDigest}</p>
            </div>
          </div>

          {/* Action buttons */}
          <div className="flex justify-end gap-3 pt-2">
            <button
              onClick={onClose}
              className="px-4 py-2 rounded-lg bg-gray-800 hover:bg-gray-700 text-slate-300 text-xs font-bold transition-colors"
            >
              DISMISS
            </button>
            <button
              onClick={downloadReport}
              className="px-4 py-2 rounded-lg bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold transition-colors flex items-center gap-2 shadow-lg"
            >
              <Download className="w-4 h-4" />
              EXPORT FORENSIC EVIDENCE DOSSIER
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
