import React, { useState } from 'react';
import { Camera, Zone } from '../types';
import { api } from '../services/api';
import { ShieldAlert, Trash2, Layers, CheckCircle2 } from 'lucide-react';
import { ZoneCanvasEditor } from '../components/zones/ZoneCanvasEditor';

interface ZonesPageProps {
  zones: Zone[];
  cameras: Camera[];
  onRefreshZones: () => void;
}

export const ZonesPage: React.FC<ZonesPageProps> = ({
  zones,
  cameras,
  onRefreshZones,
}) => {
  const [selectedCam, setSelectedCam] = useState<string>(cameras[0]?.id || 'CAM-01');

  const handleSaveZone = async (zoneData: Partial<Zone>) => {
    await api.createZone(zoneData);
    onRefreshZones();
  };

  const handleDeleteZone = async (zoneId: string) => {
    try {
      await api.deleteZone(zoneId);
      onRefreshZones();
    } catch (e) {
      console.error(e);
    }
  };

  return (
    <div className="flex-1 flex flex-col h-full overflow-y-auto p-6 space-y-6">
      {/* Header */}
      <div className="glass-panel p-5 rounded-xl border border-gray-800 flex items-center justify-between select-none">
        <div className="flex items-center gap-3">
          <div className="p-3 rounded-lg bg-blue-600/20 border border-blue-500/40 text-blue-400">
            <ShieldAlert className="w-6 h-6" />
          </div>
          <div>
            <h2 className="text-base font-bold text-slate-100 uppercase tracking-wider">
              Virtual Geofence Perimeter & Tripwire Drawing Studio
            </h2>
            <p className="text-xs text-slate-400">
              Interactive canvas drawing: Plot custom Ray-Casting restricted polygons, Tripwires, and Dwell Loitering rules
            </p>
          </div>
        </div>
      </div>

      {/* Interactive Canvas Geofence Editor */}
      <ZoneCanvasEditor
        cameras={cameras}
        selectedCameraId={selectedCam}
        onSelectCamera={setSelectedCam}
        existingZones={zones}
        onSaveZone={handleSaveZone}
      />

      {/* Active Zones List Table */}
      <div className="glass-panel rounded-xl overflow-hidden border border-gray-800 flex flex-col">
        <div className="px-4 py-3 bg-gray-900/80 border-b border-gray-800 flex items-center justify-between">
          <span className="text-xs font-bold uppercase tracking-wider text-slate-200">
            Active Geofence Rules Across Sector ({zones.length})
          </span>
          <span className="text-xs text-slate-400 font-mono">
            RAY-CASTING & TRAJECTORY INTERSECTION ENABLED
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-gray-950 text-slate-400 font-mono border-b border-gray-800">
              <tr>
                <th className="p-3">ZONE ID</th>
                <th className="p-3">CAMERA</th>
                <th className="p-3">GEOFENCE NAME</th>
                <th className="p-3">GEOMETRY TYPE</th>
                <th className="p-3">SEVERITY</th>
                <th className="p-3">LOITER THRESHOLD</th>
                <th className="p-3 text-right">ACTION</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-800 font-mono">
              {zones.length === 0 ? (
                <tr>
                  <td colSpan={7} className="p-8 text-center text-slate-500">
                    No active geofence zones configured. Use the canvas editor above to deploy rules.
                  </td>
                </tr>
              ) : (
                zones.map((zone) => (
                  <tr key={zone.id} className="hover:bg-gray-800/40 transition-colors">
                    <td className="p-3 font-bold text-cyan-400">{zone.id}</td>
                    <td className="p-3 font-bold text-slate-100">{zone.camera_id}</td>
                    <td className="p-3 font-bold text-slate-200">{zone.name}</td>
                    <td className="p-3">
                      <span className="px-2 py-0.5 rounded bg-blue-950 text-blue-300 border border-blue-800 text-[10px]">
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
                        onClick={() => handleDeleteZone(zone.id)}
                        className="p-1.5 rounded hover:bg-red-500/20 text-red-400 transition-colors"
                        title="Delete Geofence Rule"
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
  );
};
