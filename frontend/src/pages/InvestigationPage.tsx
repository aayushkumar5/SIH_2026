import React, { useState } from 'react';
import { Camera, EventItem } from '../types';
import { Search, Calendar, Filter, Eye, FileText, Download } from 'lucide-react';

interface InvestigationPageProps {
  events: EventItem[];
  cameras: Camera[];
}

export const InvestigationPage: React.FC<InvestigationPageProps> = ({ events, cameras }) => {
  const [selectedCam, setSelectedCam] = useState<string>('ALL');
  const [selectedType, setSelectedType] = useState<string>('ALL');
  const [searchTerm, setSearchTerm] = useState<string>('');

  const filtered = events.filter((e) => {
    if (selectedCam !== 'ALL' && e.camera_id !== selectedCam) return false;
    if (selectedType !== 'ALL' && e.event_type !== selectedType) return false;
    if (searchTerm) {
      const matchText = JSON.stringify(e).toLowerCase();
      if (!matchText.includes(searchTerm.toLowerCase())) return false;
    }
    return true;
  });

  return (
    <div className="flex-1 flex flex-col h-full overflow-hidden p-6 space-y-4">
      {/* Forensic Search Filter */}
      <div className="glass-panel p-4 rounded-xl border border-gray-800 flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <Search className="w-5 h-5 text-blue-400" />
          <h2 className="text-sm font-bold text-slate-100 uppercase tracking-wider">
            Forensic Event Investigation & Historical Audit
          </h2>
        </div>

        <div className="flex items-center gap-3 text-xs">
          <input
            type="text"
            placeholder="Search plate, person, track ID..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="bg-gray-900 border border-gray-700 rounded-lg px-3 py-1.5 text-slate-200 w-56 placeholder-slate-500"
          />

          <select
            value={selectedCam}
            onChange={(e) => setSelectedCam(e.target.value)}
            className="bg-gray-900 border border-gray-700 rounded-lg px-2.5 py-1.5 text-slate-200"
          >
            <option value="ALL">ALL CAMERAS</option>
            {cameras.map((c) => (
              <option key={c.id} value={c.id}>
                {c.id} ({c.name})
              </option>
            ))}
          </select>

          <select
            value={selectedType}
            onChange={(e) => setSelectedType(e.target.value)}
            className="bg-gray-900 border border-gray-700 rounded-lg px-2.5 py-1.5 text-slate-200"
          >
            <option value="ALL">ALL EVENT TYPES</option>
            <option value="INTRUSION">INTRUSION</option>
            <option value="LOITERING">LOITERING</option>
            <option value="ANPR_DETECTION">ANPR</option>
            <option value="WATCHLIST_PLATE">HOT-LISTED PLATE</option>
            <option value="WATCHLIST_FACE">WANTED SUSPECT</option>
            <option value="NIGHT_MOVEMENT">NIGHT MOVEMENT</option>
          </select>
        </div>
      </div>

      {/* Events Table */}
      <div className="flex-1 glass-panel rounded-xl overflow-hidden border border-gray-800 flex flex-col">
        <div className="overflow-x-auto flex-1">
          <table className="w-full text-left text-xs">
            <thead className="bg-gray-950 text-slate-400 font-mono border-b border-gray-800 sticky top-0">
              <tr>
                <th className="p-3">EVENT ID</th>
                <th className="p-3">TIMESTAMP</th>
                <th className="p-3">CAMERA</th>
                <th className="p-3">TYPE</th>
                <th className="p-3">SEVERITY</th>
                <th className="p-3">OBJECT / TRACK</th>
                <th className="p-3">CONFIDENCE</th>
                <th className="p-3">DETAILS</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-800 font-mono">
              {filtered.length === 0 ? (
                <tr>
                  <td colSpan={8} className="p-8 text-center text-slate-500">
                    No historical events match the query criteria.
                  </td>
                </tr>
              ) : (
                filtered.map((e) => (
                  <tr key={e.id} className="hover:bg-gray-800/40 transition-colors">
                    <td className="p-3 text-cyan-400 font-bold">{e.id.slice(0, 8)}...</td>
                    <td className="p-3 text-slate-300">
                      {new Date(e.timestamp).toLocaleString()}
                    </td>
                    <td className="p-3 text-slate-200 font-bold">{e.camera_id}</td>
                    <td className="p-3">
                      <span className="px-2 py-0.5 rounded bg-blue-950/60 text-blue-300 border border-blue-800 text-[10px]">
                        {e.event_type}
                      </span>
                    </td>
                    <td className="p-3">
                      <span
                        className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                          e.severity === 'CRITICAL'
                            ? 'bg-red-500/20 text-red-400'
                            : e.severity === 'HIGH'
                            ? 'bg-amber-500/20 text-amber-400'
                            : 'bg-emerald-500/20 text-emerald-400'
                        }`}
                      >
                        {e.severity}
                      </span>
                    </td>
                    <td className="p-3 text-slate-300">
                      {e.object_class || 'UNKNOWN'} {e.track_id ? `(#${e.track_id})` : ''}
                    </td>
                    <td className="p-3 text-emerald-400 font-bold">
                      {Math.round(e.confidence * 100)}%
                    </td>
                    <td className="p-3 text-slate-400 text-[11px]">
                      {e.metadata_json?.plate_text && `Plate: ${e.metadata_json.plate_text}`}
                      {e.metadata_json?.person_name && `Wanted: ${e.metadata_json.person_name}`}
                      {e.metadata_json?.dwell_duration_seconds &&
                        `Dwell: ${e.metadata_json.dwell_duration_seconds}s`}
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
