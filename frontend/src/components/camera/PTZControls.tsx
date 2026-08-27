import React, { useState } from 'react';
import {
  ChevronUp,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  ZoomIn,
  ZoomOut,
  RotateCcw,
  Navigation,
  Sliders,
  Crosshair,
} from 'lucide-react';

interface PTZControlsProps {
  cameraId: string;
  onAction?: (action: string, value?: number) => void;
}

export const PTZControls: React.FC<PTZControlsProps> = ({ cameraId, onAction }) => {
  const [zoomLevel, setZoomLevel] = useState<number>(1.0);
  const [activePreset, setActivePreset] = useState<string>('HOME');
  const [statusMsg, setStatusMsg] = useState<string>('IDLE');

  const triggerPTZ = (cmd: string) => {
    setStatusMsg(`PTZ: ${cmd}`);
    if (onAction) onAction(cmd);
    setTimeout(() => setStatusMsg('TRACKING'), 1200);
  };

  const handleZoom = (delta: number) => {
    const next = Math.max(1.0, Math.min(10.0, Math.round((zoomLevel + delta) * 10) / 10));
    setZoomLevel(next);
    setStatusMsg(`ZOOM: ${next}x`);
    if (onAction) onAction('ZOOM', next);
  };

  return (
    <div className="glass-panel p-4 rounded-xl border border-gray-800 space-y-4 select-none">
      <div className="flex items-center justify-between pb-2 border-b border-gray-800">
        <div className="flex items-center gap-2">
          <Crosshair className="w-4 h-4 text-cyan-400" />
          <span className="text-xs font-bold uppercase text-slate-200">
            PTZ Optical Controller • {cameraId}
          </span>
        </div>
        <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-gray-900 border border-gray-700 text-emerald-400">
          {statusMsg}
        </span>
      </div>

      {/* D-Pad Controller */}
      <div className="flex flex-col items-center justify-center">
        <button
          onClick={() => triggerPTZ('PAN_UP')}
          className="p-2.5 rounded-lg bg-gray-900 hover:bg-blue-600/30 border border-gray-700 text-slate-200 active:scale-95 transition-all shadow-md"
          title="Tilt Up"
        >
          <ChevronUp className="w-5 h-5" />
        </button>

        <div className="flex items-center gap-4 my-1">
          <button
            onClick={() => triggerPTZ('PAN_LEFT')}
            className="p-2.5 rounded-lg bg-gray-900 hover:bg-blue-600/30 border border-gray-700 text-slate-200 active:scale-95 transition-all shadow-md"
            title="Pan Left"
          >
            <ChevronLeft className="w-5 h-5" />
          </button>

          <button
            onClick={() => {
              setZoomLevel(1.0);
              triggerPTZ('RESET_HOME');
            }}
            className="p-2.5 rounded-full bg-blue-600/20 border border-blue-500/40 text-blue-400 hover:bg-blue-600/40 active:scale-95 transition-all"
            title="Reset to Home Position"
          >
            <RotateCcw className="w-4 h-4" />
          </button>

          <button
            onClick={() => triggerPTZ('PAN_RIGHT')}
            className="p-2.5 rounded-lg bg-gray-900 hover:bg-blue-600/30 border border-gray-700 text-slate-200 active:scale-95 transition-all shadow-md"
            title="Pan Right"
          >
            <ChevronRight className="w-5 h-5" />
          </button>
        </div>

        <button
          onClick={() => triggerPTZ('PAN_DOWN')}
          className="p-2.5 rounded-lg bg-gray-900 hover:bg-blue-600/30 border border-gray-700 text-slate-200 active:scale-95 transition-all shadow-md"
          title="Tilt Down"
        >
          <ChevronDown className="w-5 h-5" />
        </button>
      </div>

      {/* Optical Zoom Slider */}
      <div className="space-y-1.5 pt-2 border-t border-gray-800">
        <div className="flex items-center justify-between text-xs">
          <span className="text-slate-400 font-mono text-[11px]">OPTICAL ZOOM:</span>
          <span className="text-cyan-400 font-bold font-mono">{zoomLevel}x</span>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={() => handleZoom(-0.5)}
            disabled={zoomLevel <= 1.0}
            className="p-1.5 rounded bg-gray-900 border border-gray-700 text-slate-300 hover:bg-gray-800 disabled:opacity-40"
          >
            <ZoomOut className="w-3.5 h-3.5" />
          </button>
          <input
            type="range"
            min={1.0}
            max={10.0}
            step={0.5}
            value={zoomLevel}
            onChange={(e) => {
              const val = Number(e.target.value);
              setZoomLevel(val);
              if (onAction) onAction('ZOOM', val);
            }}
            className="w-full accent-blue-500 cursor-pointer h-1.5 bg-gray-800 rounded-lg"
          />
          <button
            onClick={() => handleZoom(0.5)}
            disabled={zoomLevel >= 10.0}
            className="p-1.5 rounded bg-gray-900 border border-gray-700 text-slate-300 hover:bg-gray-800 disabled:opacity-40"
          >
            <ZoomIn className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* Preset Patrol Points */}
      <div className="space-y-1.5 pt-2 border-t border-gray-800">
        <span className="text-slate-400 font-mono text-[10px] uppercase">
          Tactical Presets
        </span>
        <div className="grid grid-cols-3 gap-2">
          {['HOME', 'GATE', 'RIVER'].map((preset) => (
            <button
              key={preset}
              onClick={() => {
                setActivePreset(preset);
                triggerPTZ(`PRESET_${preset}`);
              }}
              className={`py-1.5 px-2 rounded text-[10px] font-mono font-bold border transition-all ${
                activePreset === preset
                  ? 'bg-blue-600/30 border-blue-500/50 text-blue-300'
                  : 'bg-gray-900 border-gray-800 text-slate-400 hover:bg-gray-800'
              }`}
            >
              P-{preset}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
};
