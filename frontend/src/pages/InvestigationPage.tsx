import React, { useState } from 'react';
import { Camera, EventItem } from '../types';
import {
  Search,
  Calendar,
  Filter,
  Eye,
  FileText,
  Download,
  ShieldCheck,
  Sparkles,
  Sliders,
  Camera as CameraIcon,
  Tag,
} from 'lucide-react';
import { formatTimestamp, getSeverityBadgeClass } from '../utils/formatters';

interface InvestigationPageProps {
  events: EventItem[];
  cameras: Camera[];
}

export const InvestigationPage: React.FC<InvestigationPageProps> = ({ events, cameras }) => {
  const [selectedCam, setSelectedCam] = useState<string>('ALL');
  const [selectedType, setSelectedType] = useState<string>('ALL');
  const [selectedSeverity, setSelectedSeverity] = useState<string>('ALL');
  const [minConfidence, setMinConfidence] = useState<number>(0.7);
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [selectedEvent, setSelectedEvent] = useState<EventItem | null>(null);

  const filtered = events.filter((e) => {
    if (selectedCam !== 'ALL' && e.camera_id !== selectedCam) return false;
    if (selectedType !== 'ALL' && e.event_type !== selectedType) return false;
    if (selectedSeverity !== 'ALL' && e.severity !== selectedSeverity) return false;
    if (e.confidence < minConfidence) return false;
    if (searchTerm) {
      const matchText = JSON.stringify(e).toLowerCase();
      if (!matchText.includes(searchTerm.toLowerCase())) return false;
    }
    return true;
  });

  const exportCSV = () => {
    const headers = ['EventID', 'Timestamp', 'CameraID', 'EventType', 'Severity', 'ObjectClass', 'TrackID', 'Confidence', 'Metadata'];
    const rows = filtered.map((e) => [
      e.id,
      e.timestamp,
      e.camera_id,
      e.event_type,
      e.severity,
      e.object_class || '',
      e.track_id || '',
      e.confidence,
      JSON.stringify(e.metadata_json || {}).replace(/"/g, '""'),
    ]);

    const csvContent = [headers.join(','), ...rows.map((r) => r.map((f) => `"${f}"`).join(','))].join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `IBVAP_FORENSIC_EXPORT_${Date.now()}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="flex-1 flex flex-col h-full overflow-hidden p-6 space-y-4">
      {/* Search & Filter Header */}
      <div className="glass-panel p-4 rounded-xl border border-gray-800 space-y-3 select-none">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-blue-600/20 text-blue-400 border border-blue-500/30">
              <Search className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-sm font-bold text-slate-100 uppercase tracking-wider">
                Forensic Event Investigation & Intelligence Search
              </h2>
              <p className="text-xs text-slate-400">
                Multi-parameter query across AI detections, track trajectories, and evidential records
              </p>
            </div>
          </div>

          <button
            onClick={exportCSV}
            className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold font-mono transition-all shadow-md"
          >
            <Download className="w-3.5 h-3.5" />
            EXPORT CSV DOSSIER
          </button>
        </div>

        {/* Filter Toolbar */}
        <div className="flex flex-wrap items-center gap-3 text-xs pt-2 border-t border-gray-800">
          <div className="relative flex-1 min-w-[200px]">
            <Search className="w-3.5 h-3.5 text-slate-500 absolute left-3 top-2.5" />
            <input
              type="text"
              placeholder="Search keyword, plate, suspect name, track ID..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full bg-gray-950 border border-gray-700 rounded-lg pl-8 pr-3 py-1.5 text-slate-200 placeholder-slate-500 outline-none font-mono text-xs"
            />
          </div>

          <select
            value={selectedCam}
            onChange={(e) => setSelectedCam(e.target.value)}
            className="bg-gray-950 border border-gray-700 rounded-lg px-2.5 py-1.5 text-slate-200 font-mono text-xs outline-none"
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
            className="bg-gray-950 border border-gray-700 rounded-lg px-2.5 py-1.5 text-slate-200 font-mono text-xs outline-none"
          >
            <option value="ALL">ALL EVENT TYPES</option>
            <option value="INTRUSION">RESTRICTED INTRUSION</option>
            <option value="TRIPWIRE_CROSS">TRIPWIRE BREACH</option>
            <option value="LOITERING">LOITERING DWELL</option>
            <option value="NIGHT_MOVEMENT">NIGHT THERMAL MOVEMENT</option>
            <option value="ANPR_DETECTION">ANPR DETECTION</option>
            <option value="WATCHLIST_PLATE">HOTLISTED VEHICLE</option>
            <option value="WATCHLIST_FACE">WANTED POI MATCH</option>
          </select>

          <select
            value={selectedSeverity}
            onChange={(e) => setSelectedSeverity(e.target.value)}
            className="bg-gray-950 border border-gray-700 rounded-lg px-2.5 py-1.5 text-slate-200 font-mono text-xs outline-none"
          >
            <option value="ALL">ALL SEVERITY</option>
            <option value="CRITICAL">CRITICAL</option>
            <option value="HIGH">HIGH</option>
            <option value="MEDIUM">MEDIUM</option>
            <option value="LOW">LOW</option>
          </select>

          <div className="flex items-center gap-2 bg-gray-950 px-3 py-1 rounded-lg border border-gray-700 font-mono text-xs">
            <span className="text-slate-400">MIN CONF:</span>
            <span className="text-cyan-400 font-bold">{Math.round(minConfidence * 100)}%</span>
            <input
              type="range"
              min={0.5}
              max={0.95}
              step={0.05}
              value={minConfidence}
              onChange={(e) => setMinConfidence(Number(e.target.value))}
              className="w-20 accent-blue-500 cursor-pointer h-1.5 bg-gray-800 rounded"
            />
          </div>
        </div>
      </div>

      {/* Events Results Table */}
      <div className="flex-1 glass-panel rounded-xl overflow-hidden border border-gray-800 flex flex-col">
        <div className="overflow-x-auto flex-1">
          <table className="w-full text-left text-xs">
            <thead className="bg-gray-950 text-slate-400 font-mono border-b border-gray-800 sticky top-0">
              <tr>
                <th className="p-3">EVENT ID</th>
                <th className="p-3">TIMESTAMP</th>
                <th className="p-3">CAMERA</th>
                <th className="p-3">EVENT CLASSIFICATION</th>
                <th className="p-3">SEVERITY</th>
                <th className="p-3">OBJECT / TRACK ID</th>
                <th className="p-3">AI CONF</th>
                <th className="p-3">INTELLIGENCE DETAILS</th>
                <th className="p-3 text-right">ACTION</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-800 font-mono">
              {filtered.length === 0 ? (
                <tr>
                  <td colSpan={9} className="p-8 text-center text-slate-500">
                    No historical events match the query criteria.
                  </td>
                </tr>
              ) : (
                filtered.map((e) => (
                  <tr
                    key={e.id}
                    onClick={() => setSelectedEvent(e)}
                    className="hover:bg-gray-800/40 cursor-pointer transition-colors"
                  >
                    <td className="p-3 text-cyan-400 font-bold">{e.id}</td>
                    <td className="p-3 text-slate-300">
                      {formatTimestamp(e.timestamp)}
                    </td>
                    <td className="p-3 text-slate-200 font-bold">{e.camera_id}</td>
                    <td className="p-3">
                      <span className="px-2 py-0.5 rounded bg-blue-950 text-blue-300 border border-blue-800 text-[10px]">
                        {e.event_type}
                      </span>
                    </td>
                    <td className="p-3">
                      <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${getSeverityBadgeClass(e.severity)}`}>
                        {e.severity}
                      </span>
                    </td>
                    <td className="p-3 text-slate-300">
                      {e.object_class?.toUpperCase() || 'UNKNOWN'} {e.track_id ? `(#${e.track_id})` : ''}
                    </td>
                    <td className="p-3 text-emerald-400 font-bold">
                      {Math.round(e.confidence * 100)}%
                    </td>
                    <td className="p-3 text-slate-400 text-[11px]">
                      {e.metadata_json?.plate_text && `Plate: ${e.metadata_json.plate_text} `}
                      {e.metadata_json?.person_name && `Suspect: ${e.metadata_json.person_name} `}
                      {e.metadata_json?.dwell_duration_seconds &&
                        `Dwell: ${e.metadata_json.dwell_duration_seconds}s`}
                    </td>
                    <td className="p-3 text-right">
                      <button
                        onClick={(evt) => {
                          evt.stopPropagation();
                          setSelectedEvent(e);
                        }}
                        className="p-1 rounded hover:bg-blue-600/20 text-blue-400"
                        title="View Dossier"
                      >
                        <Eye className="w-4 h-4" />
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Detail Forensic Dossier Modal */}
      {selectedEvent && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-4">
          <div className="glass-panel w-full max-w-2xl rounded-2xl border border-gray-700 shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
            <div className="px-5 py-4 bg-gray-900/90 border-b border-gray-800 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <FileText className="w-5 h-5 text-cyan-400" />
                <div>
                  <h3 className="text-sm font-bold text-slate-100 uppercase tracking-wider font-mono">
                    Event Forensic Dossier • {selectedEvent.id}
                  </h3>
                  <p className="text-xs text-slate-400">{formatTimestamp(selectedEvent.timestamp)}</p>
                </div>
              </div>

              <button
                onClick={() => setSelectedEvent(null)}
                className="p-1 rounded-lg hover:bg-gray-800 text-slate-400 hover:text-slate-200"
              >
                ✕
              </button>
            </div>

            <div className="p-6 space-y-4 overflow-y-auto text-xs font-mono">
              <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                <div className="glass-card p-3 rounded-lg">
                  <span className="text-slate-400 text-[10px] block">SOURCE CAMERA</span>
                  <span className="text-cyan-400 font-bold text-sm">{selectedEvent.camera_id}</span>
                </div>

                <div className="glass-card p-3 rounded-lg">
                  <span className="text-slate-400 text-[10px] block">OBJECT CLASS</span>
                  <span className="text-slate-200 font-bold">
                    {selectedEvent.object_class?.toUpperCase() || 'UNKNOWN'}
                  </span>
                </div>

                <div className="glass-card p-3 rounded-lg">
                  <span className="text-slate-400 text-[10px] block">AI CONFIDENCE</span>
                  <span className="text-emerald-400 font-bold">
                    {Math.round(selectedEvent.confidence * 100)}%
                  </span>
                </div>
              </div>

              {/* Raw JSON metadata inspector */}
              <div className="space-y-1">
                <span className="text-slate-400 text-[10px] uppercase font-bold">
                  Raw AI Telemetry & Evidential Metadata (JSON)
                </span>
                <pre className="p-4 bg-gray-950 rounded-xl border border-gray-800 text-cyan-300 text-[11px] overflow-x-auto max-h-48">
                  {JSON.stringify(selectedEvent.metadata_json || {}, null, 2)}
                </pre>
              </div>

              <div className="flex justify-end pt-2">
                <button
                  onClick={() => setSelectedEvent(null)}
                  className="px-4 py-2 rounded-lg bg-gray-800 hover:bg-gray-700 text-slate-200 font-bold"
                >
                  Close Dossier
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
