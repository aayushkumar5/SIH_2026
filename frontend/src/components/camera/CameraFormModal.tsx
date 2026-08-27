import React, { useState } from 'react';
import { Camera } from '../../types';
import { X, Camera as CameraIcon, Check, Plus } from 'lucide-react';

interface CameraFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (cameraData: Partial<Camera>) => Promise<void>;
  camera?: Camera | null;
}

export const CameraFormModal: React.FC<CameraFormModalProps> = ({
  isOpen,
  onClose,
  onSubmit,
  camera,
}) => {
  if (!isOpen) return null;

  const [id, setId] = useState(camera?.id || `CAM-${Date.now().toString().slice(-2)}`);
  const [name, setName] = useState(camera?.name || '');
  const [rtspUrl, setRtspUrl] = useState(camera?.rtsp_url || 'rtsp://192.168.1.105:554/live/stream1');
  const [locationName, setLocationName] = useState(camera?.location_name || '');
  const [bopId, setBopId] = useState(camera?.bop_id || 'BOP-DHARCHULA-01');
  const [fps, setFps] = useState(camera?.fps || 25);
  const [resolution, setResolution] = useState(camera?.resolution || '1920x1080 (1080p FHD)');
  const [lat, setLat] = useState(camera?.latitude || 29.8512);
  const [lon, setLon] = useState(camera?.longitude || 80.5421);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!id.trim() || !name.trim() || !rtspUrl.trim()) return;

    setLoading(true);
    try {
      await onSubmit({
        id: id.trim().toUpperCase(),
        name: name.trim(),
        rtsp_url: rtspUrl.trim(),
        location_name: locationName.trim(),
        bop_id: bopId.trim(),
        fps: Number(fps),
        resolution,
        latitude: Number(lat),
        longitude: Number(lon),
        is_online: true,
      });
      onClose();
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-4">
      <div className="glass-panel w-full max-w-xl rounded-2xl border border-gray-700 shadow-2xl overflow-hidden flex flex-col">
        {/* Header */}
        <div className="px-5 py-4 bg-gray-900/90 border-b border-gray-800 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-blue-600/20 text-blue-400 border border-blue-500/30">
              <CameraIcon className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-slate-100 uppercase tracking-wider">
                {camera ? 'Edit CCTV Stream' : 'Register New Border IP Camera'}
              </h3>
              <p className="text-xs text-slate-400">
                Configure RTSP edge video gateway ingestion
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 rounded-lg hover:bg-gray-800 text-slate-400 hover:text-slate-200 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-5 space-y-4 text-xs">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-slate-400 mb-1 font-mono">CAMERA IDENTIFIER</label>
              <input
                type="text"
                placeholder="e.g. CAM-07"
                value={id}
                onChange={(e) => setId(e.target.value)}
                disabled={!!camera}
                className="w-full bg-gray-900 border border-gray-700 rounded-lg px-3 py-2 text-slate-100 font-mono focus:border-blue-500 outline-none"
                required
              />
            </div>

            <div>
              <label className="block text-slate-400 mb-1">ASSIGNED BOP ID</label>
              <input
                type="text"
                value={bopId}
                onChange={(e) => setBopId(e.target.value)}
                className="w-full bg-gray-900 border border-gray-700 rounded-lg px-3 py-2 text-slate-100 font-mono focus:border-blue-500 outline-none"
                required
              />
            </div>
          </div>

          <div>
            <label className="block text-slate-400 mb-1">CAMERA NAME / SECTOR DESCRIPTION</label>
            <input
              type="text"
              placeholder="e.g. Southern Ridge Observation Tower"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full bg-gray-900 border border-gray-700 rounded-lg px-3 py-2 text-slate-100 focus:border-blue-500 outline-none"
              required
            />
          </div>

          <div>
            <label className="block text-slate-400 mb-1 font-mono">RTSP STREAM URI</label>
            <input
              type="text"
              placeholder="rtsp://admin:password@192.168.1.105:554/h264Preview_01_main"
              value={rtspUrl}
              onChange={(e) => setRtspUrl(e.target.value)}
              className="w-full bg-gray-900 border border-gray-700 rounded-lg px-3 py-2 text-slate-100 font-mono focus:border-blue-500 outline-none text-[11px]"
              required
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-slate-400 mb-1">LOCATION / POST NAME</label>
              <input
                type="text"
                placeholder="e.g. Sector 2 High Watchtower"
                value={locationName}
                onChange={(e) => setLocationName(e.target.value)}
                className="w-full bg-gray-900 border border-gray-700 rounded-lg px-3 py-2 text-slate-100 focus:border-blue-500 outline-none"
                required
              />
            </div>

            <div>
              <label className="block text-slate-400 mb-1">STREAM RESOLUTION</label>
              <select
                value={resolution}
                onChange={(e) => setResolution(e.target.value)}
                className="w-full bg-gray-900 border border-gray-700 rounded-lg px-3 py-2 text-slate-100 font-mono focus:border-blue-500 outline-none"
              >
                <option value="1920x1080 (1080p FHD)">1920x1080 (1080p FHD)</option>
                <option value="2560x1440 (2K QHD)">2560x1440 (2K QHD)</option>
                <option value="1280x720 (720p HD)">1280x720 (720p HD)</option>
                <option value="Thermal IR 640x512">Thermal IR (640x512)</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-3 gap-3 font-mono">
            <div>
              <label className="block text-slate-400 mb-1">FPS INGEST</label>
              <input
                type="number"
                min={5}
                max={60}
                value={fps}
                onChange={(e) => setFps(Number(e.target.value))}
                className="w-full bg-gray-900 border border-gray-700 rounded-lg px-3 py-2 text-slate-100 focus:border-blue-500 outline-none"
              />
            </div>
            <div>
              <label className="block text-slate-400 mb-1">LATITUDE</label>
              <input
                type="number"
                step="0.0001"
                value={lat}
                onChange={(e) => setLat(Number(e.target.value))}
                className="w-full bg-gray-900 border border-gray-700 rounded-lg px-3 py-2 text-slate-100 focus:border-blue-500 outline-none"
              />
            </div>
            <div>
              <label className="block text-slate-400 mb-1">LONGITUDE</label>
              <input
                type="number"
                step="0.0001"
                value={lon}
                onChange={(e) => setLon(Number(e.target.value))}
                className="w-full bg-gray-900 border border-gray-700 rounded-lg px-3 py-2 text-slate-100 focus:border-blue-500 outline-none"
              />
            </div>
          </div>

          <div className="flex justify-end gap-3 pt-3 border-t border-gray-800">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-lg bg-gray-800 hover:bg-gray-700 text-slate-300 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="px-5 py-2 rounded-lg bg-blue-600 hover:bg-blue-500 text-white font-bold transition-all shadow-lg flex items-center gap-2"
            >
              <Check className="w-4 h-4" />
              {loading ? 'SAVING CAMERA...' : camera ? 'UPDATE CAMERA' : 'REGISTER CAMERA'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
