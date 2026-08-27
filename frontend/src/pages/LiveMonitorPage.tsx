import React, { useState } from 'react';
import { Camera, Zone, EventItem } from '../types';
import { VideoWall } from '../components/camera/VideoWall';
import {
  Camera as CameraIcon,
  Sun,
  Layers,
  LayoutGrid,
  Maximize2,
  Sliders,
  Radio,
  Eye,
} from 'lucide-react';

interface LiveMonitorPageProps {
  cameras: Camera[];
  zones: Zone[];
  lastEvent: EventItem | null;
}

export const LiveMonitorPage: React.FC<LiveMonitorPageProps> = ({
  cameras,
  zones,
  lastEvent,
}) => {
  const [layout, setLayout] = useState<'1x1' | '2x2' | '3x3'>('2x2');
  const [nightModeAll, setNightModeAll] = useState(false);
  const [showOverlays, setShowOverlays] = useState(true);

  return (
    <div className="flex-1 flex flex-col h-full overflow-hidden p-6 space-y-4">
      {/* Surveillance Desk Controls Header */}
      <div className="glass-panel px-5 py-3.5 rounded-xl border border-gray-800 flex flex-wrap items-center justify-between gap-4 select-none">
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-lg bg-blue-600/20 text-blue-400 border border-blue-500/30">
            <CameraIcon className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-sm font-bold text-slate-100 uppercase tracking-wider">
              Surveillance Video Wall & Live CCTV Control Desk
            </h2>
            <p className="text-xs text-slate-400">
              Multi-feed edge RTSP ingestion • Low-light Night IR Enhancement • Real-Time YOLOv8 & ByteTrack
            </p>
          </div>
        </div>

        {/* Layout & Filter Controls */}
        <div className="flex flex-wrap items-center gap-3 text-xs">
          {/* Grid Layout Switcher */}
          <div className="flex items-center gap-1 bg-gray-900 border border-gray-700 rounded-lg p-1 font-mono">
            <button
              onClick={() => setLayout('1x1')}
              className={`px-2.5 py-1 rounded text-xs transition-all ${
                layout === '1x1'
                  ? 'bg-blue-600 text-white font-bold'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              1x1 FOCUS
            </button>
            <button
              onClick={() => setLayout('2x2')}
              className={`px-2.5 py-1 rounded text-xs transition-all ${
                layout === '2x2'
                  ? 'bg-blue-600 text-white font-bold'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              2x2 QUAD
            </button>
            <button
              onClick={() => setLayout('3x3')}
              className={`px-2.5 py-1 rounded text-xs transition-all ${
                layout === '3x3'
                  ? 'bg-blue-600 text-white font-bold'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              3x3 SECTOR
            </button>
          </div>

          {/* AI Bounding Box Overlay Toggle */}
          <button
            onClick={() => setShowOverlays(!showOverlays)}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg border font-mono transition-all ${
              showOverlays
                ? 'bg-blue-950/50 border-blue-500/50 text-blue-300 font-bold'
                : 'bg-gray-800 border-gray-700 text-slate-400'
            }`}
          >
            <Layers className="w-3.5 h-3.5" />
            <span>AI OVERLAYS: {showOverlays ? 'ACTIVE' : 'HIDDEN'}</span>
          </button>
        </div>
      </div>

      {/* Main Video Wall */}
      <div className="flex-1 min-h-0">
        <VideoWall
          cameras={cameras}
          zones={zones}
          lastEvent={lastEvent}
          layout={layout}
        />
      </div>
    </div>
  );
};
