import React, { useState } from 'react';
import { Camera, Zone } from '../types';
import { api } from '../services/api';
import { ShieldAlert, Plus, Trash2, Sliders, CheckSquare, Layers } from 'lucide-react';

interface ZonesPageProps {
  zones: Zone[];
  cameras: Camera[];
  onRefreshZones: () => void;
}

export const ZonesPage: React.FC<ZonesPageProps> = ({ zones, cameras, onRefreshZones }) => {
  const [selectedCam, setSelectedCam] = useState<string>(cameras[0]?.id || 'CAM-01');
  const [name, setName] = useState('');
  const [zoneType, setZoneType] = useState<'polygon' | 'line'>('polygon');
  const [severity, setSeverity] = useState<string>('HIGH');
  const [loiterSec, setLoiterSec] = useState<number>(10);
  const [loading, setLoading] = useState(false);

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;
    setLoading(true);
    try {
      const id = `ZONE-${selectedCam}-${Date.now().toString().slice(-4)}`;
      // Sample default polygon or line
      const coords =
        zoneType === 'polygon'
          ? [
              [100, 100],
              [800, 100],
              [800, 450],
              [100, 450],
            ]
          : [
              [100, 300],
              [850, 300],
            ];

      await api.createZone({
        id,
        camera_id: selectedCam,
        name: name.trim(),
        zone_type: zoneType,
        coordinates: coords,
        severity: severity as any,
        loitering_threshold_seconds: loiterSec,
        enabled: true,
      });

      setName('');
      onRefreshZones();
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (zoneId: string) => {
    try {
      await api.deleteZone(zoneId);
      onRefreshZones();
    } catch (e) {
      console.error(e);
    }
  };

  return (
    <div className="flex-1 flex flex-col h-full overflow-hidden p-6 space-y-6">
      <div className="glass-panel p-5 rounded-xl border border-gray-800 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="p-3 rounded-lg bg-blue-600/20 border border-blue-500/40 text-blue-400">
            <ShieldAlert className="w-6 h-6" />
          </div>
          <div>
            <h2 className="text-base font-bold text-slate-100 uppercase tracking-wider">
              Virtual Perimeter & Tripwire Geofencing Studio
            </h2>
            <p className="text-xs text-slate-400">
              Define ray-casting restricted polygon zones, intrusion tripwires, and dwell-time loitering thresholds
            </p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 flex-1 min-h-0">
        {/* Create Zone Form */}
        <div className="glass-panel p-5 rounded-xl border border-gray-800 flex flex-col space-y-4">
          <h3 className="text-xs font-bold uppercase tracking-wider text-slate-200 flex items-center gap-2">
            <Plus className="w-4 h-4 text-blue-400" />
            Create Geofence / Virtual Line
          </h3>

          <form onSubmit={handleCreate} className="space-y-3 text-xs">
            <div>
              <label className="block text-slate-400 mb-1">CAMERA SELECTION</label>
              <select
                value={selectedCam}
                onChange={(e) => setSelectedCam(e.target.value)}
                className="w-full bg-gray-900 border border-gray-700 rounded-lg px-3 py-2 text-slate-100 font-mono"
              >
                {cameras.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.id} — {c.name}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-slate-400 mb-1">ZONE IDENTIFIER / NAME</label>
              <input
                type="text"
                placeholder="e.g. Zero-Tolerance Buffer Strip"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full bg-gray-900 border border-gray-700 rounded-lg px-3 py-2 text-slate-100"
                required
              />
            </div>

            <div>
              <label className="block text-slate-400 mb-1">ZONE GEOMETRY TYPE</label>
              <select
                value={zoneType}
                onChange={(e) => setZoneType(e.target.value as any)}
                className="w-full bg-gray-900 border border-gray-700 rounded-lg px-3 py-2 text-slate-100"
              >
                <option value="polygon">RESTRICTED POLYGON (Ray-casting In-Out Check)</option>
                <option value="line">TRIPWIRE LINE (Trajectory Crossing Intersection)</option>
              </select>
            </div>

            <div>
              <label className="block text-slate-400 mb-1">SEVERITY LEVEL</label>
              <select
                value={severity}
                onChange={(e) => setSeverity(e.target.value)}
                className="w-full bg-gray-900 border border-gray-700 rounded-lg px-3 py-2 text-slate-100"
              >
                <option value="CRITICAL">CRITICAL</option>
                <option value="HIGH">HIGH</option>
                <option value="MEDIUM">MEDIUM</option>
              </select>
            </div>

            <div>
              <label className="block text-slate-400 mb-1">LOITERING THRESHOLD (SECONDS)</label>
              <input
                type="number"
                min={1}
                max={300}
                value={loiterSec}
                onChange={(e) => setLoiterSec(Number(e.target.value))}
                className="w-full bg-gray-900 border border-gray-700 rounded-lg px-3 py-2 text-slate-100 font-mono"
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-2.5 rounded-lg bg-blue-600 hover:bg-blue-500 text-white font-bold transition-all shadow-md"
            >
              {loading ? 'DEPLOYING ZONE...' : 'DEPLOY GEOFENCE ZONE'}
            </button>
          </form>
        </div>

        {/* Existing Zones List */}
        <div className="lg:col-span-2 glass-panel rounded-xl overflow-hidden border border-gray-800 flex flex-col">
          <div className="px-4 py-3 bg-gray-900/80 border-b border-gray-800 flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-200">
              Active Geofence Rules
            </span>
            <span className="text-xs text-slate-400 font-mono">{zones.length} CONFIGURED ZONES</span>
          </div>

          <div className="overflow-x-auto flex-1">
            <table className="w-full text-left text-xs">
              <thead className="bg-gray-950 text-slate-400 font-mono border-b border-gray-800">
                <tr>
                  <th className="p-3">ZONE ID</th>
                  <th className="p-3">CAMERA</th>
                  <th className="p-3">NAME</th>
                  <th className="p-3">TYPE</th>
                  <th className="p-3">SEVERITY</th>
                  <th className="p-3">LOITER THRESHOLD</th>
                  <th className="p-3 text-right">ACTION</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-800 font-mono">
                {zones.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="p-6 text-center text-slate-500">
                      No active zones configured.
                    </td>
                  </tr>
                ) : (
                  zones.map((zone) => (
                    <tr key={zone.id} className="hover:bg-gray-800/40 transition-colors">
                      <td className="p-3 font-bold text-cyan-400">{zone.id}</td>
                      <td className="p-3 text-slate-200">{zone.camera_id}</td>
                      <td className="p-3 font-bold text-slate-300">{zone.name}</td>
                      <td className="p-3">
                        <span className="px-2 py-0.5 rounded bg-blue-950/60 text-blue-300 border border-blue-800 text-[10px]">
                          {zone.zone_type.toUpperCase()}
                        </span>
                      </td>
                      <td className="p-3">
                        <span
                          className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                            zone.severity === 'CRITICAL'
                              ? 'bg-red-500/20 text-red-400'
                              : 'bg-amber-500/20 text-amber-400'
                          }`}
                        >
                          {zone.severity}
                        </span>
                      </td>
                      <td className="p-3 text-slate-300">{zone.loitering_threshold_seconds}s</td>
                      <td className="p-3 text-right">
                        <button
                          onClick={() => handleDelete(zone.id)}
                          className="p-1.5 rounded hover:bg-red-500/20 text-red-400 transition-colors"
                          title="Delete Zone"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
};
