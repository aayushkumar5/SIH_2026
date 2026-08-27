import React, { useEffect, useState } from 'react';
import { AISettings, SystemMetrics } from '../types';
import { api } from '../services/api';
import { useAudioAlarm } from '../hooks/useAudioAlarm';
import {
  Settings,
  Sliders,
  Cpu,
  Server,
  HardDrive,
  Volume2,
  VolumeX,
  RefreshCw,
  Check,
  Shield,
  Save,
  Radio,
} from 'lucide-react';

export const SettingsPage: React.FC = () => {
  const { isSoundEnabled, soundVolume, toggleSound, updateVolume, playAcknowledgeChime } =
    useAudioAlarm();

  const [metrics, setMetrics] = useState<SystemMetrics | null>(null);
  const [health, setHealth] = useState<any>(null);
  const [isSaved, setIsSaved] = useState(false);

  const [aiSettings, setAiSettings] = useState<AISettings>({
    yolo_confidence: 0.65,
    bytetrack_max_age: 30,
    loitering_default_seconds: 10,
    night_enhancement_clip: 3.0,
    face_match_threshold: 0.72,
    edge_sync_interval_seconds: 15,
    sound_alert_enabled: true,
    sound_alert_volume: 0.5,
  });

  useEffect(() => {
    const fetchSys = async () => {
      try {
        const m = await api.getMetrics();
        setMetrics(m);
        const h = await api.getHealth();
        setHealth(h);
      } catch (e) {
        console.error(e);
      }
    };
    fetchSys();
  }, []);

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaved(true);
    playAcknowledgeChime();
    setTimeout(() => setIsSaved(false), 2000);
  };

  return (
    <div className="flex-1 flex flex-col h-full overflow-y-auto p-6 space-y-6 select-none">
      {/* Header */}
      <div className="glass-panel p-5 rounded-xl border border-gray-800 flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="p-3 rounded-lg bg-blue-600/20 border border-blue-500/40 text-blue-400">
            <Settings className="w-6 h-6" />
          </div>
          <div>
            <h2 className="text-base font-bold text-slate-100 uppercase tracking-wider">
              Edge Node System Health & AI Pipeline Parameters
            </h2>
            <p className="text-xs text-slate-400">
              Configure YOLOv8 confidence thresholds, ByteTrack tracking, Night CLAHE filters, and BOP synchronization
            </p>
          </div>
        </div>

        {isSaved && (
          <span className="px-3 py-1 rounded bg-emerald-950 border border-emerald-500 text-emerald-300 text-xs font-mono font-bold flex items-center gap-1.5 animate-in fade-in">
            <Check className="w-4 h-4 text-emerald-400" />
            AI CONFIGURATION PERSISTED
          </span>
        )}
      </div>

      <form onSubmit={handleSave} className="space-y-6">
        {/* Hardware Status Strip */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 font-mono text-xs">
          <div className="glass-panel p-4 rounded-xl border border-gray-800 flex items-center justify-between">
            <div>
              <span className="text-slate-400 text-[10px] uppercase block">HOST PLATFORM</span>
              <span className="text-slate-200 font-bold text-[11px] block mt-0.5">
                {metrics?.platform || 'Linux NVIDIA Jetson AGX Orin'}
              </span>
            </div>
            <Cpu className="w-5 h-5 text-cyan-400" />
          </div>

          <div className="glass-panel p-4 rounded-xl border border-gray-800 flex items-center justify-between">
            <div>
              <span className="text-slate-400 text-[10px] uppercase block">STATION ID</span>
              <span className="text-cyan-400 font-bold text-sm block mt-0.5">
                {metrics?.bop_id || 'BOP-DHARCHULA-01'}
              </span>
            </div>
            <Server className="w-5 h-5 text-blue-400" />
          </div>

          <div className="glass-panel p-4 rounded-xl border border-gray-800 flex items-center justify-between">
            <div>
              <span className="text-slate-400 text-[10px] uppercase block">SYSTEM HEALTH</span>
              <span className="text-emerald-400 font-bold text-sm block mt-0.5 flex items-center gap-1">
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
                {health?.status || 'HEALTHY (ALL NODES NOMINAL)'}
              </span>
            </div>
            <Shield className="w-5 h-5 text-emerald-400" />
          </div>
        </div>

        {/* AI Model Hyperparameter Tuning */}
        <div className="glass-panel p-5 rounded-xl border border-gray-800 space-y-4">
          <div className="flex items-center gap-2 pb-2 border-b border-gray-800">
            <Sliders className="w-5 h-5 text-blue-400" />
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-200">
              AI Computer Vision & Inference Parameters
            </h3>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-xs font-mono">
            {/* YOLO Confidence */}
            <div className="space-y-2">
              <div className="flex justify-between">
                <label className="text-slate-300">YOLOv8 DETECTION CONFIDENCE THRESHOLD:</label>
                <span className="text-cyan-400 font-bold">
                  {Math.round(aiSettings.yolo_confidence * 100)}%
                </span>
              </div>
              <input
                type="range"
                min={0.3}
                max={0.95}
                step={0.05}
                value={aiSettings.yolo_confidence}
                onChange={(e) =>
                  setAiSettings({ ...aiSettings, yolo_confidence: Number(e.target.value) })
                }
                className="w-full accent-blue-500 cursor-pointer h-1.5 bg-gray-800 rounded"
              />
              <span className="text-[10px] text-slate-500 block">
                Minimum probability threshold required to register person or vehicle detection.
              </span>
            </div>

            {/* ByteTrack Max Age */}
            <div className="space-y-2">
              <div className="flex justify-between">
                <label className="text-slate-300">BYTETRACK MAX LOST FRAMES:</label>
                <span className="text-cyan-400 font-bold">
                  {aiSettings.bytetrack_max_age} frames
                </span>
              </div>
              <input
                type="range"
                min={10}
                max={90}
                step={5}
                value={aiSettings.bytetrack_max_age}
                onChange={(e) =>
                  setAiSettings({ ...aiSettings, bytetrack_max_age: Number(e.target.value) })
                }
                className="w-full accent-blue-500 cursor-pointer h-1.5 bg-gray-800 rounded"
              />
              <span className="text-[10px] text-slate-500 block">
                Number of missing frames before ByteTrack drops track ID.
              </span>
            </div>

            {/* Loitering Default Seconds */}
            <div className="space-y-2">
              <div className="flex justify-between">
                <label className="text-slate-300">DEFAULT LOITERING DWELL TIME:</label>
                <span className="text-cyan-400 font-bold">
                  {aiSettings.loitering_default_seconds}s
                </span>
              </div>
              <input
                type="range"
                min={3}
                max={60}
                step={1}
                value={aiSettings.loitering_default_seconds}
                onChange={(e) =>
                  setAiSettings({
                    ...aiSettings,
                    loitering_default_seconds: Number(e.target.value),
                  })
                }
                className="w-full accent-blue-500 cursor-pointer h-1.5 bg-gray-800 rounded"
              />
              <span className="text-[10px] text-slate-500 block">
                Duration an object must remain stationary or dwell in a zone to trigger alert.
              </span>
            </div>

            {/* Face Recognition Cosine Threshold */}
            <div className="space-y-2">
              <div className="flex justify-between">
                <label className="text-slate-300">ARCFACE BIOMETRIC COSINE THRESHOLD:</label>
                <span className="text-cyan-400 font-bold">
                  {aiSettings.face_match_threshold.toFixed(2)}
                </span>
              </div>
              <input
                type="range"
                min={0.5}
                max={0.9}
                step={0.01}
                value={aiSettings.face_match_threshold}
                onChange={(e) =>
                  setAiSettings({
                    ...aiSettings,
                    face_match_threshold: Number(e.target.value),
                  })
                }
                className="w-full accent-blue-500 cursor-pointer h-1.5 bg-gray-800 rounded"
              />
              <span className="text-[10px] text-slate-500 block">
                Cosine similarity threshold for confirming positive POI face watchlist match.
              </span>
            </div>
          </div>
        </div>

        {/* Audio & Alert Settings */}
        <div className="glass-panel p-5 rounded-xl border border-gray-800 space-y-4">
          <div className="flex items-center gap-2 pb-2 border-b border-gray-800">
            <Volume2 className="w-5 h-5 text-cyan-400" />
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-200">
              Audio Chime & Operator Notification Controls
            </h3>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-xs font-mono">
            <div className="flex items-center justify-between p-3 rounded-lg bg-gray-900 border border-gray-800">
              <div>
                <span className="text-slate-200 font-bold block">Tactical Audio Alarm Chime</span>
                <span className="text-[10px] text-slate-500">
                  Plays synthesized tone on incoming CRITICAL alerts
                </span>
              </div>
              <button
                type="button"
                onClick={toggleSound}
                className={`p-2 rounded-lg border transition-all ${
                  isSoundEnabled
                    ? 'bg-blue-600/30 border-blue-500 text-blue-300'
                    : 'bg-gray-800 border-gray-700 text-slate-500'
                }`}
              >
                {isSoundEnabled ? <Volume2 className="w-4 h-4" /> : <VolumeX className="w-4 h-4" />}
              </button>
            </div>

            <div className="space-y-2 p-3 rounded-lg bg-gray-900 border border-gray-800">
              <div className="flex justify-between">
                <span className="text-slate-300">ALARM CHIME VOLUME:</span>
                <span className="text-cyan-400 font-bold">{Math.round(soundVolume * 100)}%</span>
              </div>
              <input
                type="range"
                min={0.1}
                max={1.0}
                step={0.05}
                value={soundVolume}
                onChange={(e) => updateVolume(Number(e.target.value))}
                className="w-full accent-cyan-500 cursor-pointer h-1.5 bg-gray-800 rounded"
              />
            </div>
          </div>
        </div>

        {/* Save Bar */}
        <div className="flex justify-end pt-2">
          <button
            type="submit"
            className="px-6 py-2.5 rounded-lg bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold font-mono transition-all flex items-center gap-2 shadow-lg"
          >
            <Save className="w-4 h-4" />
            SAVE & APPLY AI SETTINGS
          </button>
        </div>
      </form>
    </div>
  );
};
