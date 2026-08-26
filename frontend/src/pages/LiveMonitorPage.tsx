import React, { useState } from 'react';
import { Camera, Zone, EventItem } from '../types';
import { VideoWall } from '../components/VideoWall';
import { Sliders, Sun, Shield, Layers, Camera as CameraIcon } from 'lucide-react';

interface LiveMonitorPageProps {
  cameras: Camera[];
  zones: Zone[];
  lastEvent: EventItem | null;
}

export const LiveMonitorPage: React.FC<LiveMonitorPageProps> = ({ cameras, zones, lastEvent }) => {
  const [selectedLayout, setSelectedLayout] = useState<'2x2' | '1x1'>('2x2');
  const [nightMode, setNightMode] = useState(true);
  const [showOverlays, setShowOverlays] = useState(true);

  return (
    <div className="flex-1 flex flex-col h-full overflow-hidden p-6 space-y-4">
      {/* Tactical Toolbar */}
      <div className="glass-panel px-4 py-3 rounded-xl border border-gray-800 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <CameraIcon className="w-5 h-5 text-blue-400" />
          <span className="text-sm font-bold text-slate-100 uppercase tracking-wider">
            Surveillance Control Desk
          </span>
        </div>

        <div className="flex items-center gap-4 text-xs">
          <button
            onClick={() => setNightMode(!nightMode)}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg border transition-all ${
              nightMode
                ? 'bg-cyan-950/40 border-cyan-500/50 text-cyan-400'
                : 'bg-gray-800 border-gray-700 text-slate-400'
            }`}
          >
            <Sun className="w-3.5 h-3.5" />
            <span>LOW-LIGHT ENHANCER: {nightMode ? 'AUTO' : 'OFF'}</span>
          </button>

          <button
            onClick={() => setShowOverlays(!showOverlays)}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg border transition-all ${
              showOverlays
                ? 'bg-blue-950/40 border-blue-500/50 text-blue-400'
                : 'bg-gray-800 border-gray-700 text-slate-400'
            }`}
          >
            <Layers className="w-3.5 h-3.5" />
            <span>AI BOUNDING BOX OVERLAY</span>
          </button>
        </div>
      </div>

      <div className="flex-1 min-h-0">
        <VideoWall cameras={cameras} zones={zones} lastEvent={lastEvent} />
      </div>
    </div>
  );
};
