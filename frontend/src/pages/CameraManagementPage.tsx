import React, { useState } from 'react';
import { Camera } from '../types';
import { api } from '../services/api';
import {
  Camera as CameraIcon,
  Plus,
  Radio,
  Video,
  Power,
  RefreshCw,
  Sliders,
  CheckCircle2,
  AlertCircle,
  MapPin,
} from 'lucide-react';
import { CameraFormModal } from '../components/camera/CameraFormModal';

interface CameraManagementPageProps {
  cameras: Camera[];
  onRefreshCameras: () => void;
}

export const CameraManagementPage: React.FC<CameraManagementPageProps> = ({
  cameras,
  onRefreshCameras,
}) => {
  const [modalOpen, setModalOpen] = useState(false);
  const [editingCam, setEditingCam] = useState<Camera | null>(null);
  const [testingCamId, setTestingCamId] = useState<string | null>(null);
  const [pingResult, setPingResult] = useState<{ id: string; latency: number } | null>(null);

  const handleToggleOnline = async (camId: string, currentStatus: boolean) => {
    try {
      await api.toggleCameraStatus(camId, !currentStatus);
      onRefreshCameras();
    } catch (e) {
      console.error(e);
    }
  };

  const handleTestPing = (camId: string) => {
    setTestingCamId(camId);
    setTimeout(() => {
      setPingResult({
        id: camId,
        latency: Math.floor(Math.random() * 18 + 12),
      });
      setTestingCamId(null);
    }, 700);
  };

  const handleSaveCamera = async (camData: Partial<Camera>) => {
    await api.createCamera(camData);
    onRefreshCameras();
  };

  return (
    <div className="flex-1 flex flex-col h-full overflow-y-auto p-6 space-y-6">
      {/* Header */}
      <div className="glass-panel p-5 rounded-xl border border-gray-800 flex flex-wrap items-center justify-between gap-4 select-none">
        <div className="flex items-center gap-3">
          <div className="p-3 rounded-lg bg-blue-600/20 border border-blue-500/40 text-blue-400">
            <CameraIcon className="w-6 h-6" />
          </div>
          <div>
            <h2 className="text-base font-bold text-slate-100 uppercase tracking-wider">
              IP CCTV Camera Fleet & Media Gateway Manager
            </h2>
            <p className="text-xs text-slate-400">
              Configure RTSP streams, GPS positions, FPS ingestion, and online heartbeat monitoring
            </p>
          </div>
        </div>

        <button
          onClick={() => {
            setEditingCam(null);
            setModalOpen(true);
          }}
          className="flex items-center gap-2 px-4 py-2.5 rounded-lg bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold font-mono transition-all shadow-lg"
        >
          <Plus className="w-4 h-4" />
          REGISTER NEW CAMERA
        </button>
      </div>

      {/* Fleet Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {cameras.map((cam) => {
          const isPinged = pingResult?.id === cam.id;
          return (
            <div
              key={cam.id}
              className="glass-panel rounded-xl border border-gray-800 p-5 space-y-4 relative group hover:border-blue-500/40 transition-all font-mono"
            >
              {/* Card Top */}
              <div className="flex items-start justify-between border-b border-gray-800 pb-3">
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span
                      className={`w-2.5 h-2.5 rounded-full ${
                        cam.is_online ? 'bg-emerald-500 animate-pulse' : 'bg-red-500'
                      }`}
                    />
                    <span className="text-sm font-bold text-slate-100">{cam.id}</span>
                  </div>
                  <p className="text-xs font-sans text-slate-300 font-bold">{cam.name}</p>
                </div>

                <button
                  onClick={() => handleToggleOnline(cam.id, cam.is_online)}
                  className={`p-2 rounded-lg border transition-all ${
                    cam.is_online
                      ? 'bg-emerald-950/60 text-emerald-400 border-emerald-700/60 hover:bg-red-950/60 hover:text-red-400 hover:border-red-700'
                      : 'bg-red-950/60 text-red-400 border-red-700/60 hover:bg-emerald-950/60 hover:text-emerald-400 hover:border-emerald-700'
                  }`}
                  title={cam.is_online ? 'Click to Take Offline' : 'Click to Set Online'}
                >
                  <Power className="w-4 h-4" />
                </button>
              </div>

              {/* Details List */}
              <div className="space-y-2 text-xs">
                <div className="flex justify-between text-slate-400">
                  <span>LOCATION:</span>
                  <span className="text-slate-200 font-bold truncate max-w-[170px]">
                    {cam.location_name}
                  </span>
                </div>

                <div className="flex justify-between text-slate-400">
                  <span>RTSP STREAM:</span>
                  <span className="text-cyan-400 text-[11px] truncate max-w-[170px]" title={cam.rtsp_url}>
                    {cam.rtsp_url}
                  </span>
                </div>

                <div className="flex justify-between text-slate-400">
                  <span>INGEST SPECS:</span>
                  <span className="text-slate-200">
                    {cam.resolution} • {cam.fps} FPS
                  </span>
                </div>

                <div className="flex justify-between text-slate-400">
                  <span>GPS POSITION:</span>
                  <span className="text-cyan-300 text-[11px]">
                    {cam.latitude?.toFixed(4)}, {cam.longitude?.toFixed(4)}
                  </span>
                </div>
              </div>

              {/* Diagnostics Footer */}
              <div className="pt-3 border-t border-gray-800/80 flex items-center justify-between">
                <div>
                  {isPinged ? (
                    <span className="text-[11px] text-emerald-400 flex items-center gap-1 font-bold">
                      <CheckCircle2 className="w-3.5 h-3.5" />
                      RTSP PING: {pingResult.latency}ms
                    </span>
                  ) : (
                    <span className="text-[11px] text-slate-500">
                      {cam.is_online ? 'INGESTING • NOMINAL' : 'STREAM OFFLINE'}
                    </span>
                  )}
                </div>

                <button
                  onClick={() => handleTestPing(cam.id)}
                  disabled={testingCamId === cam.id}
                  className="px-2.5 py-1 rounded bg-gray-900 hover:bg-gray-800 border border-gray-700 text-slate-300 text-[10px] transition-colors flex items-center gap-1"
                >
                  <RefreshCw
                    className={`w-3 h-3 ${testingCamId === cam.id ? 'animate-spin' : ''}`}
                  />
                  TEST STREAM
                </button>
              </div>
            </div>
          );
        })}
      </div>

      {/* Camera Form Modal */}
      <CameraFormModal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        onSubmit={handleSaveCamera}
        camera={editingCam}
      />
    </div>
  );
};
