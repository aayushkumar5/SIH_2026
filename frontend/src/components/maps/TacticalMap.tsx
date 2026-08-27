import React, { useState } from 'react';
import { Camera, AlertItem } from '../../types';
import {
  MapPin,
  Camera as CameraIcon,
  Shield,
  Radio,
  Eye,
  Layers,
  ZoomIn,
  ZoomOut,
  Navigation,
  Compass,
  AlertTriangle,
} from 'lucide-react';

interface TacticalMapProps {
  cameras: Camera[];
  alerts: AlertItem[];
  onSelectCamera?: (cameraId: string) => void;
}

export const TacticalMap: React.FC<TacticalMapProps> = ({
  cameras,
  alerts,
  onSelectCamera,
}) => {
  const [selectedCam, setSelectedCam] = useState<Camera | null>(cameras[0] || null);
  const [zoomLevel, setZoomLevel] = useState<number>(1);
  const [showFovCones, setShowFovCones] = useState<boolean>(true);
  const [showPatrolTracks, setShowPatrolTracks] = useState<boolean>(true);

  // Map camera coords to normalized SVG viewport (800x500)
  const getSvgCoordinates = (lat: number | null, lon: number | null) => {
    // Base bounds for Dharchula sector (Lat: 29.848 to 29.856, Lon: 80.538 to 80.548)
    const minLat = 29.848;
    const maxLat = 29.856;
    const minLon = 80.538;
    const maxLon = 80.548;

    const actualLat = lat || 29.8512;
    const actualLon = lon || 80.5421;

    const x = ((actualLon - minLon) / (maxLon - minLon)) * 700 + 50;
    const y = 450 - ((actualLat - minLat) / (maxLat - minLat)) * 400;

    return { x, y };
  };

  const activeAlertCams = new Set(
    alerts.filter((a) => a.status === 'ACTIVE').map((a) => a.camera_id)
  );

  return (
    <div className="flex-1 flex flex-col h-full overflow-hidden glass-panel rounded-xl border border-gray-800 relative">
      {/* Top Map Toolbar */}
      <div className="px-5 py-3 bg-gray-900/90 border-b border-gray-800 flex flex-wrap items-center justify-between gap-4 z-10 select-none">
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-lg bg-blue-600/20 text-blue-400 border border-blue-500/30">
            <Compass className="w-5 h-5 animate-spin-slow" />
          </div>
          <div>
            <h3 className="text-sm font-bold text-slate-100 uppercase tracking-wider">
              Tactical Border Operations Map (Dharchula Sector)
            </h3>
            <p className="text-[11px] text-slate-400">
              Indo-Nepal Zero Line • BOP-DHARCHULA-01 Coverage Zone
            </p>
          </div>
        </div>

        {/* Map Layer Controls */}
        <div className="flex items-center gap-3 text-xs">
          <button
            onClick={() => setShowFovCones(!showFovCones)}
            className={`px-3 py-1.5 rounded-lg border font-mono transition-all ${
              showFovCones
                ? 'bg-blue-600/30 border-blue-500 text-blue-300 font-bold'
                : 'bg-gray-800 border-gray-700 text-slate-400'
            }`}
          >
            FOV CONES: {showFovCones ? 'ON' : 'OFF'}
          </button>

          <button
            onClick={() => setShowPatrolTracks(!showPatrolTracks)}
            className={`px-3 py-1.5 rounded-lg border font-mono transition-all ${
              showPatrolTracks
                ? 'bg-cyan-600/30 border-cyan-500 text-cyan-300 font-bold'
                : 'bg-gray-800 border-gray-700 text-slate-400'
            }`}
          >
            PATROL TRACKS: {showPatrolTracks ? 'ON' : 'OFF'}
          </button>

          <div className="flex items-center gap-1 bg-gray-900 border border-gray-700 rounded-lg p-0.5">
            <button
              onClick={() => setZoomLevel(Math.min(1.6, zoomLevel + 0.2))}
              className="p-1 rounded text-slate-300 hover:bg-gray-800"
            >
              <ZoomIn className="w-4 h-4" />
            </button>
            <span className="text-[10px] font-mono px-1.5 text-slate-400">
              {Math.round(zoomLevel * 100)}%
            </span>
            <button
              onClick={() => setZoomLevel(Math.max(0.8, zoomLevel - 0.2))}
              className="p-1 rounded text-slate-300 hover:bg-gray-800"
            >
              <ZoomOut className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      {/* Interactive Tactical SVG Map Viewport */}
      <div className="flex-1 bg-[#060911] relative overflow-hidden flex items-center justify-center p-4">
        {/* Background Grid Pattern */}
        <div className="absolute inset-0 bg-[linear-gradient(to_right,#1e293b20_1px,transparent_1px),linear-gradient(to_bottom,#1e293b20_1px,transparent_1px)] bg-[size:32px_32px]" />

        <svg
          viewBox="0 0 800 500"
          className="w-full h-full max-w-5xl max-h-[600px] transition-transform duration-200"
          style={{ transform: `scale(${zoomLevel})` }}
        >
          <defs>
            {/* Field of View Cone Gradients */}
            <radialGradient id="fovGradient" cx="0%" cy="50%" r="100%">
              <stop offset="0%" stopColor="#3B82F6" stopOpacity="0.6" />
              <stop offset="100%" stopColor="#3B82F6" stopOpacity="0.0" />
            </radialGradient>

            <radialGradient id="alertFovGradient" cx="0%" cy="50%" r="100%">
              <stop offset="0%" stopColor="#EF4444" stopOpacity="0.7" />
              <stop offset="100%" stopColor="#EF4444" stopOpacity="0.0" />
            </radialGradient>

            {/* River pattern */}
            <linearGradient id="riverGrad" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#0E7490" stopOpacity="0.3" />
              <stop offset="100%" stopColor="#0369A1" stopOpacity="0.5" />
            </linearGradient>
          </defs>

          {/* Kali River Natural Border Line */}
          <path
            d="M 50 480 Q 200 400 350 350 T 600 180 T 780 40"
            fill="none"
            stroke="url(#riverGrad)"
            strokeWidth="32"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
          <path
            d="M 50 480 Q 200 400 350 350 T 600 180 T 780 40"
            fill="none"
            stroke="#0891B2"
            strokeWidth="2"
            strokeDasharray="4 4"
            opacity="0.7"
          />
          <text x="360" y="335" fill="#38BDF8" fontSize="10" fontFamily="JetBrains Mono" opacity="0.6">
            KALI RIVER (INTERNATIONAL BOUNDARY)
          </text>

          {/* Zero Line Border Fence */}
          <path
            d="M 60 460 Q 210 380 360 330 T 610 160 T 770 60"
            fill="none"
            stroke="#F59E0B"
            strokeWidth="1.5"
            strokeDasharray="8 4"
            opacity="0.8"
          />
          <text x="500" y="210" fill="#FBBF24" fontSize="9" fontFamily="JetBrains Mono" opacity="0.8">
            BORDER SECURITY FENCE (SECTOR 1)
          </text>

          {/* BOP Outpost HQ Marker */}
          <g transform="translate(420, 260)">
            <circle r="22" fill="#1E3A8A" fillOpacity="0.4" stroke="#3B82F6" strokeWidth="2" />
            <circle r="8" fill="#3B82F6" />
            <text x="28" y="4" fill="#93C5FD" fontSize="11" fontWeight="bold" fontFamily="JetBrains Mono">
              BOP DHARCHULA-01 (HQ)
            </text>
          </g>

          {/* Patrol Route Polyline */}
          {showPatrolTracks && (
            <g>
              <path
                d="M 180 390 L 320 320 L 450 260 L 580 180 L 680 120"
                fill="none"
                stroke="#10B981"
                strokeWidth="1.5"
                strokeDasharray="5 5"
                opacity="0.6"
              />
              {/* Drone / QRF Team Marker */}
              <circle cx="320" cy="320" r="5" fill="#10B981">
                <animate attributeName="r" values="4;8;4" dur="2s" repeatCount="indefinite" />
                <animate attributeName="opacity" values="1;0.4;1" dur="2s" repeatCount="indefinite" />
              </circle>
              <text x="330" y="315" fill="#6EE7B7" fontSize="9" fontFamily="JetBrains Mono">
                QRF PATROL TEAM BRAVO
              </text>
            </g>
          )}

          {/* Camera Towers & Vision FOV Cones */}
          {cameras.map((cam, idx) => {
            const { x, y } = getSvgCoordinates(cam.latitude, cam.longitude);
            const hasAlert = activeAlertCams.has(cam.id);
            const isSelected = selectedCam?.id === cam.id;

            // Directional FOV angles
            const angleDeg = idx === 0 ? 45 : idx === 1 ? 120 : idx === 2 ? 210 : idx === 3 ? 315 : 90;
            const angleRad = (angleDeg * Math.PI) / 180;
            const spreadRad = (55 * Math.PI) / 180; // 55 degree FOV
            const distance = 95;

            const p1X = x + distance * Math.cos(angleRad - spreadRad / 2);
            const p1Y = y + distance * Math.sin(angleRad - spreadRad / 2);
            const p2X = x + distance * Math.cos(angleRad + spreadRad / 2);
            const p2Y = y + distance * Math.sin(angleRad + spreadRad / 2);

            return (
              <g
                key={cam.id}
                onClick={() => {
                  setSelectedCam(cam);
                  if (onSelectCamera) onSelectCamera(cam.id);
                }}
                className="cursor-pointer group"
              >
                {/* Vision FOV Cone */}
                {showFovCones && (
                  <path
                    d={`M ${x} ${y} L ${p1X} ${p1Y} A ${distance} ${distance} 0 0 1 ${p2X} ${p2Y} Z`}
                    fill={hasAlert ? 'url(#alertFovGradient)' : 'url(#fovGradient)'}
                  />
                )}

                {/* Alert Concentric Pulse Beacon */}
                {hasAlert && (
                  <circle cx={x} cy={y} r="18" fill="none" stroke="#EF4444" strokeWidth="2">
                    <animate attributeName="r" values="8;26" dur="1.4s" repeatCount="indefinite" />
                    <animate attributeName="opacity" values="1;0" dur="1.4s" repeatCount="indefinite" />
                  </circle>
                )}

                {/* Camera Tower Icon */}
                <circle
                  cx={x}
                  cy={y}
                  r={isSelected ? 10 : 8}
                  fill={hasAlert ? '#EF4444' : isSelected ? '#3B82F6' : '#1E293B'}
                  stroke={hasAlert ? '#FCA5A5' : isSelected ? '#93C5FD' : '#64748B'}
                  strokeWidth="2"
                  className="transition-all"
                />

                {/* Camera Label */}
                <rect
                  x={x + 12}
                  y={y - 12}
                  width="70"
                  height="16"
                  rx="3"
                  fill="#0B0F19"
                  stroke={hasAlert ? '#EF4444' : isSelected ? '#3B82F6' : '#374151'}
                  strokeWidth="1"
                />
                <text
                  x={x + 16}
                  y={y - 1}
                  fill={hasAlert ? '#F87171' : isSelected ? '#60A5FA' : '#E2E8F0'}
                  fontSize="9"
                  fontWeight="bold"
                  fontFamily="JetBrains Mono"
                >
                  {cam.id} {hasAlert ? '!' : ''}
                </text>
              </g>
            );
          })}
        </svg>

        {/* Selected Camera Floating Dossier Popup */}
        {selectedCam && (
          <div className="absolute bottom-6 left-6 w-80 glass-panel rounded-xl border border-gray-700 shadow-2xl p-4 space-y-3 z-20 animate-in fade-in slide-in-from-bottom-2">
            <div className="flex items-center justify-between border-b border-gray-800 pb-2">
              <div className="flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
                <span className="font-mono text-xs font-bold text-slate-100">{selectedCam.id}</span>
                <span className="text-[11px] text-slate-400 truncate">| {selectedCam.name}</span>
              </div>
            </div>

            <div className="space-y-1.5 text-xs font-mono">
              <div className="flex justify-between text-slate-400">
                <span>LOCATION:</span>
                <span className="text-slate-200 font-bold">{selectedCam.location_name}</span>
              </div>
              <div className="flex justify-between text-slate-400">
                <span>COORDINATES:</span>
                <span className="text-cyan-400 font-bold">
                  {selectedCam.latitude?.toFixed(4)} N, {selectedCam.longitude?.toFixed(4)} E
                </span>
              </div>
              <div className="flex justify-between text-slate-400">
                <span>INGEST STREAM:</span>
                <span className="text-slate-200">{selectedCam.resolution}</span>
              </div>
              <div className="flex justify-between text-slate-400">
                <span>STATUS:</span>
                <span className="text-emerald-400 font-bold">
                  {activeAlertCams.has(selectedCam.id) ? 'ACTIVE THREAT ALERT' : 'ONLINE • PATROL NOMINAL'}
                </span>
              </div>
            </div>

            {activeAlertCams.has(selectedCam.id) && (
              <div className="p-2 rounded bg-red-950/60 border border-red-500/50 text-red-300 text-[11px] font-mono flex items-center gap-2">
                <AlertTriangle className="w-4 h-4 text-red-400 flex-shrink-0" />
                <span>Security Intrusion Alert Active on this tower</span>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};
