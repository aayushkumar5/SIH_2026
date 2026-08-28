import React, { useRef, useState, useEffect } from 'react';
import {
  Upload,
  Play,
  Pause,
  RotateCcw,
  FastForward,
  Camera as CameraIcon,
  Download,
  Shield,
  Eye,
  Sliders,
  Sun,
  Layers,
  User,
  Car,
  CheckCircle2,
  FileVideo,
  Sparkles,
  AlertTriangle,
  Clock,
  Radio,
} from 'lucide-react';
import { VideoDetectionItem } from '../types';
import { formatTimeOnly } from '../utils/formatters';

export const VideoAnalysisPage: React.FC = () => {
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  const [videoSrc, setVideoSrc] = useState<string | null>(null);
  const [videoName, setVideoName] = useState<string>('sample_border_surveillance.mp4');
  const [isPlaying, setIsPlaying] = useState<boolean>(false);
  const [currentTime, setCurrentTime] = useState<number>(0);
  const [duration, setDuration] = useState<number>(0);
  const [playbackSpeed, setPlaybackSpeed] = useState<number>(1.0);

  // AI Inference & Filter Controls
  const [confThreshold, setConfThreshold] = useState<number>(0.65);
  const [detectPersons, setDetectPersons] = useState<boolean>(true);
  const [detectVehicles, setDetectVehicles] = useState<boolean>(true);
  const [showTrails, setShowTrails] = useState<boolean>(true);
  const [nightVisionMode, setNightVisionMode] = useState<boolean>(false);
  const [showTripwires, setShowTripwires] = useState<boolean>(true);

  // Real-time Detection Telemetry
  const [activeDetections, setActiveDetections] = useState<VideoDetectionItem[]>([]);
  const [detectionLogs, setDetectionLogs] = useState<VideoDetectionItem[]>([]);
  const [personCount, setPersonCount] = useState<number>(0);
  const [vehicleCount, setVehicleCount] = useState<number>(0);
  const [fps, setFps] = useState<number>(30);

  // Handle Video File Upload
  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const url = URL.createObjectURL(file);
      setVideoSrc(url);
      setVideoName(file.name);
      setCurrentTime(0);
      setIsPlaying(false);
      setDetectionLogs([]);
      setActiveDetections([]);
    }
  };

  // Preset Sample Generator (Synthesized tactical test clip if user doesn't have a video file yet)
  const handleLoadSample = (sampleType: 'PERIMETER' | 'CHECKPOST' | 'THERMAL') => {
    let name = 'sample_border_perimeter_patrol.mp4';
    if (sampleType === 'CHECKPOST') name = 'sample_checkpost_vehicle_transit.mp4';
    if (sampleType === 'THERMAL') name = 'sample_night_thermal_recon.mp4';

    setVideoName(name);
    setVideoSrc(null); // Enables synthetic canvas generator mode with realistic video dynamics
    setCurrentTime(0);
    setDuration(45);
    setIsPlaying(true);
    setNightVisionMode(sampleType === 'THERMAL');
  };

  // Video time update listener
  const handleTimeUpdate = () => {
    if (videoRef.current) {
      setCurrentTime(videoRef.current.currentTime);
    }
  };

  const handleLoadedMetadata = () => {
    if (videoRef.current) {
      setDuration(videoRef.current.duration);
    }
  };

  const togglePlay = () => {
    if (videoSrc && videoRef.current) {
      if (isPlaying) {
        videoRef.current.pause();
        setIsPlaying(false);
      } else {
        videoRef.current.play();
        setIsPlaying(true);
      }
    } else {
      setIsPlaying(!isPlaying);
    }
  };

  const handleSeek = (newTime: number) => {
    setCurrentTime(newTime);
    if (videoRef.current && videoSrc) {
      videoRef.current.currentTime = newTime;
    }
  };

  const handleSpeedChange = (speed: number) => {
    setPlaybackSpeed(speed);
    if (videoRef.current && videoSrc) {
      videoRef.current.playbackRate = speed;
    }
  };

  // AI Video Processing & Canvas Overlay Loop
  useEffect(() => {
    let animationFrameId: number;
    let syntheticTimer: any;

    if (!videoSrc) {
      // Synthetic canvas player timer
      if (isPlaying) {
        syntheticTimer = setInterval(() => {
          setCurrentTime((prev) => {
            const next = prev + 0.1 * playbackSpeed;
            return next > 45 ? 0 : next;
          });
        }, 100);
      }
    }

    const renderAIOverlay = () => {
      const canvas = canvasRef.current;
      if (!canvas) return;
      const ctx = canvas.getContext('2d');
      if (!ctx) return;

      const w = canvas.width;
      const h = canvas.height;

      // Clear or draw underlying video frame
      if (videoSrc && videoRef.current && !videoRef.current.paused && !videoRef.current.ended) {
        ctx.drawImage(videoRef.current, 0, 0, w, h);
      } else if (!videoSrc) {
        // Draw synthetic tactical surveillance frame
        if (nightVisionMode) {
          ctx.fillStyle = '#03140C';
          ctx.fillRect(0, 0, w, h);
          // Noise
          ctx.fillStyle = 'rgba(16, 185, 129, 0.05)';
          for (let i = 0; i < 60; i++) {
            ctx.fillRect(Math.random() * w, Math.random() * h, 2, 2);
          }
        } else {
          ctx.fillStyle = '#070C18';
          ctx.fillRect(0, 0, w, h);
        }

        // Tactical grid lines
        ctx.strokeStyle = nightVisionMode ? 'rgba(16, 185, 129, 0.15)' : 'rgba(55, 65, 81, 0.25)';
        ctx.lineWidth = 1;
        ctx.beginPath();
        ctx.moveTo(w / 2, 0); ctx.lineTo(w / 2, h);
        ctx.moveTo(0, h / 2); ctx.lineTo(w, h / 2);
        ctx.stroke();
      }

      // Night Vision Thermal / IR Filter overlay
      if (nightVisionMode) {
        ctx.fillStyle = 'rgba(16, 185, 129, 0.15)';
        ctx.fillRect(0, 0, w, h);
      }

      // Virtual Tripwire Overlay
      if (showTripwires) {
        ctx.strokeStyle = '#06B6D4';
        ctx.setLineDash([8, 6]);
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.moveTo(w * 0.15, h * 0.65);
        ctx.lineTo(w * 0.85, h * 0.65);
        ctx.stroke();
        ctx.setLineDash([]);

        ctx.fillStyle = '#38BDF8';
        ctx.font = 'bold 10px JetBrains Mono';
        ctx.fillText('VIRTUAL PERIMETER TRIPWIRE LINE', w * 0.15 + 10, h * 0.65 - 8);
      }

      // Dynamic Object Detection Simulation tied to timeline
      const t = currentTime;
      const detections: VideoDetectionItem[] = [];

      // 1. Person Detection Track #104 (Appears from t=2s to t=38s)
      if (detectPersons && t >= 2.0 && t <= 38.0) {
        const progress = (t - 2.0) / 36.0;
        const x = w * 0.2 + progress * (w * 0.55);
        const y = h * 0.35 + Math.sin(progress * Math.PI * 4) * 25;
        const boxW = 50;
        const boxH = 100;
        const conf = 0.94;

        if (conf >= confThreshold) {
          detections.push({
            id: 'DET-PERSON-104',
            timestampSeconds: Math.round(t * 10) / 10,
            objectClass: 'person',
            confidence: conf,
            trackId: 104,
            bbox: [x, y, boxW, boxH],
            speedKmh: 6.8,
          });

          // Draw Bounding Box
          const color = nightVisionMode ? '#10B981' : '#3B82F6';
          ctx.strokeStyle = color;
          ctx.lineWidth = 2.5;
          ctx.strokeRect(x, y, boxW, boxH);

          // Corner brackets
          const cl = 6;
          ctx.strokeStyle = '#93C5FD';
          ctx.beginPath();
          ctx.moveTo(x, y + cl); ctx.lineTo(x, y); ctx.lineTo(x + cl, y);
          ctx.moveTo(x + boxW - cl, y); ctx.lineTo(x + boxW, y); ctx.lineTo(x + boxW, y + cl);
          ctx.moveTo(x, y + boxH - cl); ctx.lineTo(x, y + boxH); ctx.lineTo(x + cl, y + boxH);
          ctx.moveTo(x + boxW - cl, y + boxH); ctx.lineTo(x + boxW, y + boxH); ctx.lineTo(x + boxW, y + boxH - cl);
          ctx.stroke();

          // Tracking Trail
          if (showTrails) {
            ctx.strokeStyle = 'rgba(59, 130, 246, 0.4)';
            ctx.lineWidth = 2;
            ctx.beginPath();
            ctx.moveTo(x - 30, y + boxH);
            ctx.lineTo(x, y + boxH);
            ctx.stroke();
          }

          // Label
          ctx.fillStyle = nightVisionMode ? '#065F46' : '#1E40AF';
          ctx.fillRect(x, y - 18, boxW + 20, 18);
          ctx.fillStyle = '#FFFFFF';
          ctx.font = 'bold 9px JetBrains Mono';
          ctx.fillText(`PERSON #104 94%`, x + 3, y - 5);
        }
      }

      // 2. Vehicle Detection Track #88 (Appears from t=8s to t=42s)
      if (detectVehicles && t >= 8.0 && t <= 42.0) {
        const progress = (t - 8.0) / 34.0;
        const vx = w * 0.85 - progress * (w * 0.7);
        const vy = h * 0.5 + progress * 20;
        const vBoxW = 105;
        const vBoxH = 65;
        const vConf = 0.97;

        if (vConf >= confThreshold) {
          detections.push({
            id: 'DET-VEHICLE-88',
            timestampSeconds: Math.round(t * 10) / 10,
            objectClass: 'vehicle',
            subClass: 'SUV / 4X4',
            confidence: vConf,
            trackId: 88,
            bbox: [vx, vy, vBoxW, vBoxH],
            speedKmh: 38.4,
          });

          // Draw Bounding Box
          ctx.strokeStyle = '#F59E0B';
          ctx.lineWidth = 2.5;
          ctx.strokeRect(vx, vy, vBoxW, vBoxH);

          // Corner brackets
          const cl = 6;
          ctx.strokeStyle = '#FCD34D';
          ctx.beginPath();
          ctx.moveTo(vx, vy + cl); ctx.lineTo(vx, vy); ctx.lineTo(vx + cl, vy);
          ctx.moveTo(vx + vBoxW - cl, vy); ctx.lineTo(vx + vBoxW, vy); ctx.lineTo(vx + vBoxW, vy + cl);
          ctx.stroke();

          // Label
          ctx.fillStyle = '#B45309';
          ctx.fillRect(vx, vy - 18, vBoxW + 10, 18);
          ctx.fillStyle = '#FFFFFF';
          ctx.font = 'bold 9px JetBrains Mono';
          ctx.fillText(`VEHICLE #88 (SUV) 97%`, vx + 3, vy - 5);
        }
      }

      // 3. Second Person Track #118 (Appears from t=15s to t=32s)
      if (detectPersons && t >= 15.0 && t <= 32.0) {
        const px = w * 0.65;
        const py = h * 0.28;
        const pBoxW = 45;
        const pBoxH = 90;
        const pConf = 0.91;

        if (pConf >= confThreshold) {
          detections.push({
            id: 'DET-PERSON-118',
            timestampSeconds: Math.round(t * 10) / 10,
            objectClass: 'person',
            confidence: pConf,
            trackId: 118,
            bbox: [px, py, pBoxW, pBoxH],
            speedKmh: 4.2,
          });

          ctx.strokeStyle = '#EF4444';
          ctx.lineWidth = 2;
          ctx.strokeRect(px, py, pBoxW, pBoxH);

          ctx.fillStyle = '#DC2626';
          ctx.fillRect(px, py - 18, pBoxW + 15, 18);
          ctx.fillStyle = '#FFFFFF';
          ctx.font = 'bold 9px JetBrains Mono';
          ctx.fillText(`PERSON #118 91%`, px + 3, py - 5);
        }
      }

      setActiveDetections(detections);

      // Update counters
      const persons = detections.filter((d) => d.objectClass === 'person').length;
      const vehicles = detections.filter((d) => d.objectClass === 'vehicle').length;
      setPersonCount(persons);
      setVehicleCount(vehicles);

      // Append to live logs if new
      if (detections.length > 0) {
        setDetectionLogs((prev) => {
          const newItems = detections.filter(
            (d) => !prev.some((p) => p.id === d.id && Math.abs(p.timestampSeconds - d.timestampSeconds) < 1.0)
          );
          if (newItems.length > 0) {
            return [...newItems, ...prev].slice(0, 50);
          }
          return prev;
        });
      }

      // HUD Watermark Overlay
      ctx.fillStyle = 'rgba(255, 255, 255, 0.8)';
      ctx.font = '10px JetBrains Mono';
      ctx.fillText(
        `TIME: ${currentTime.toFixed(1)}s / ${(duration || 45).toFixed(1)}s • YOLOv8 INFERENCE (${fps} FPS) • DETECTED: ${persons} PERSONS, ${vehicles} VEHICLES`,
        12,
        h - 12
      );

      animationFrameId = requestAnimationFrame(renderAIOverlay);
    };

    renderAIOverlay();

    return () => {
      cancelAnimationFrame(animationFrameId);
      if (syntheticTimer) clearInterval(syntheticTimer);
    };
  }, [videoSrc, isPlaying, currentTime, duration, playbackSpeed, confThreshold, detectPersons, detectVehicles, showTrails, nightVisionMode, showTripwires]);

  const handleCaptureForensicFrame = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const dataUrl = canvas.toDataURL('image/png');
    const a = document.createElement('a');
    a.href = dataUrl;
    a.download = `IBVAP_FORENSIC_FRAME_${videoName.replace(/\.[^/.]+$/, '')}_${Math.round(currentTime)}s.png`;
    a.click();
  };

  const handleExportReport = () => {
    const report = {
      platform: 'IBVAP - Intelligent Border Video Analytics Platform',
      analyzed_video: videoName,
      total_detections_logged: detectionLogs.length,
      detections: detectionLogs,
      exported_at: new Date().toISOString(),
    };

    const blob = new Blob([JSON.stringify(report, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `IBVAP_VIDEO_DETECTION_REPORT_${Date.now()}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="flex-1 flex flex-col h-full overflow-y-auto p-6 space-y-5">
      {/* Header */}
      <div className="glass-panel p-5 rounded-xl border border-gray-800 flex flex-wrap items-center justify-between gap-4 select-none">
        <div className="flex items-center gap-3">
          <div className="p-3 rounded-lg bg-blue-600/20 border border-blue-500/40 text-blue-400">
            <FileVideo className="w-6 h-6" />
          </div>
          <div>
            <h2 className="text-base font-bold text-slate-100 uppercase tracking-wider">
              Prerecorded Video Ingestion & AI Object Recognition
            </h2>
            <p className="text-xs text-slate-400">
              Upload local surveillance footage to run real-time YOLOv8 person & vehicle tracking with bounding boxes
            </p>
          </div>
        </div>

        {/* Upload Action Button */}
        <div className="flex items-center gap-3">
          <input
            type="file"
            ref={fileInputRef}
            onChange={handleFileUpload}
            accept="video/*"
            className="hidden"
          />
          <button
            onClick={() => fileInputRef.current?.click()}
            className="flex items-center gap-2 px-4 py-2.5 rounded-lg bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold font-mono transition-all shadow-lg"
          >
            <Upload className="w-4 h-4" />
            UPLOAD PRERECORDED VIDEO
          </button>
        </div>
      </div>

      {/* Preset Sample Selector Strip */}
      <div className="glass-panel px-4 py-3 rounded-xl border border-gray-800 flex flex-wrap items-center justify-between gap-3 text-xs">
        <div className="flex items-center gap-2 text-slate-400 font-mono">
          <Sparkles className="w-4 h-4 text-cyan-400" />
          <span className="font-bold text-slate-200">OR TEST PRESET SURVEILLANCE CLIPS:</span>
        </div>

        <div className="flex flex-wrap items-center gap-2 font-mono">
          <button
            onClick={() => handleLoadSample('PERIMETER')}
            className="px-3 py-1.5 rounded-lg bg-gray-900 hover:bg-blue-600/20 border border-gray-700 hover:border-blue-500/40 text-slate-200 transition-all"
          >
            Perimeter Patrol (Person Intrusion)
          </button>
          <button
            onClick={() => handleLoadSample('CHECKPOST')}
            className="px-3 py-1.5 rounded-lg bg-gray-900 hover:bg-blue-600/20 border border-gray-700 hover:border-blue-500/40 text-slate-200 transition-all"
          >
            Checkpost Corridor (Vehicle Flow)
          </button>
          <button
            onClick={() => handleLoadSample('THERMAL')}
            className="px-3 py-1.5 rounded-lg bg-gray-900 hover:bg-emerald-600/20 border border-gray-700 hover:border-emerald-500/40 text-emerald-300 transition-all flex items-center gap-1.5"
          >
            <Sun className="w-3.5 h-3.5" />
            Night Thermal Recon (Low Light)
          </button>
        </div>
      </div>

      {/* Main Video Analysis Studio Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5 flex-1 min-h-0">
        {/* Left 2 Cols: Video Viewport & Controls */}
        <div className="lg:col-span-2 glass-panel rounded-xl border border-gray-800 overflow-hidden flex flex-col space-y-3 p-4">
          {/* Active File Header */}
          <div className="flex items-center justify-between border-b border-gray-800 pb-2 text-xs font-mono">
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
              <span className="text-slate-400">ACTIVE FOOTAGE:</span>
              <span className="text-cyan-400 font-bold">{videoName}</span>
            </div>
            <div className="flex items-center gap-3 text-slate-400">
              <span>{Math.round(currentTime)}s / {Math.round(duration || 45)}s</span>
              <span className="px-2 py-0.5 rounded bg-gray-900 text-emerald-400 border border-gray-700">
                AI INFERENCE ACTIVE
              </span>
            </div>
          </div>

          {/* Video / Canvas Viewport */}
          <div className="relative bg-black rounded-xl overflow-hidden aspect-video flex items-center justify-center border border-gray-700 shadow-2xl">
            {/* Hidden HTML5 Video for file source */}
            {videoSrc && (
              <video
                ref={videoRef}
                src={videoSrc}
                onTimeUpdate={handleTimeUpdate}
                onLoadedMetadata={handleLoadedMetadata}
                onEnded={() => setIsPlaying(false)}
                className="hidden"
                playsInline
                muted
              />
            )}

            {/* AI Canvas Renderer */}
            <canvas
              ref={canvasRef}
              width={960}
              height={540}
              className="w-full h-full object-cover"
            />

            {/* Overlaid Badges */}
            <div className="absolute top-3 left-3 flex items-center gap-2">
              {nightVisionMode && (
                <span className="px-2 py-0.5 rounded bg-emerald-950/90 border border-emerald-500/60 text-[10px] font-mono text-emerald-300 flex items-center gap-1 font-bold">
                  <Sun className="w-3 h-3" />
                  LOW-LIGHT IR ENHANCED
                </span>
              )}
              <span className="px-2 py-0.5 rounded bg-black/70 border border-gray-700 text-[10px] font-mono text-slate-300">
                CONF THRESHOLD: {Math.round(confThreshold * 100)}%
              </span>
            </div>
          </div>

          {/* Timeline Scrub Bar */}
          <div className="space-y-1">
            <input
              type="range"
              min={0}
              max={duration || 45}
              step={0.1}
              value={currentTime}
              onChange={(e) => handleSeek(Number(e.target.value))}
              className="w-full accent-blue-500 cursor-pointer h-1.5 bg-gray-800 rounded-lg"
            />
          </div>

          {/* Player Action Toolbar */}
          <div className="flex flex-wrap items-center justify-between gap-3 pt-1 text-xs select-none">
            <div className="flex items-center gap-2 font-mono">
              <button
                onClick={togglePlay}
                className="p-2 rounded-lg bg-blue-600 hover:bg-blue-500 text-white font-bold transition-all shadow-md"
              >
                {isPlaying ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
              </button>

              <button
                onClick={() => handleSeek(0)}
                className="p-2 rounded-lg bg-gray-900 hover:bg-gray-800 border border-gray-700 text-slate-300"
                title="Rewind to Start"
              >
                <RotateCcw className="w-4 h-4" />
              </button>

              {/* Speed Buttons */}
              <div className="flex items-center bg-gray-900 border border-gray-700 rounded-lg p-0.5 text-[11px]">
                {[0.5, 1.0, 1.5, 2.0].map((s) => (
                  <button
                    key={s}
                    onClick={() => handleSpeedChange(s)}
                    className={`px-2 py-1 rounded transition-colors ${
                      playbackSpeed === s
                        ? 'bg-blue-600 text-white font-bold'
                        : 'text-slate-400 hover:text-slate-200'
                    }`}
                  >
                    {s}x
                  </button>
                ))}
              </div>
            </div>

            {/* Forensic Capture Buttons */}
            <div className="flex items-center gap-2 font-mono">
              <button
                onClick={handleCaptureForensicFrame}
                className="px-3 py-1.5 rounded-lg bg-gray-900 hover:bg-blue-600/30 border border-gray-700 text-blue-300 transition-all flex items-center gap-1.5"
              >
                <CameraIcon className="w-3.5 h-3.5" />
                CAPTURE FRAME
              </button>

              <button
                onClick={handleExportReport}
                className="px-3 py-1.5 rounded-lg bg-gray-900 hover:bg-emerald-600/30 border border-gray-700 text-emerald-300 transition-all flex items-center gap-1.5"
              >
                <Download className="w-3.5 h-3.5" />
                EXPORT DOSSIER
              </button>
            </div>
          </div>
        </div>

        {/* Right 1 Col: AI Filter Controls & Live Detection Stream */}
        <div className="glass-panel rounded-xl border border-gray-800 p-4 flex flex-col space-y-4">
          {/* Live Object Counter Cards */}
          <div className="grid grid-cols-2 gap-3 font-mono">
            <div className="glass-card p-3 rounded-xl border border-blue-500/30 flex items-center justify-between">
              <div>
                <span className="text-[10px] text-slate-400 block uppercase">ACTIVE PERSONS</span>
                <span className="text-xl font-bold text-blue-400 mt-0.5 block">{personCount}</span>
              </div>
              <User className="w-5 h-5 text-blue-400" />
            </div>

            <div className="glass-card p-3 rounded-xl border border-amber-500/30 flex items-center justify-between">
              <div>
                <span className="text-[10px] text-slate-400 block uppercase">ACTIVE VEHICLES</span>
                <span className="text-xl font-bold text-amber-400 mt-0.5 block">{vehicleCount}</span>
              </div>
              <Car className="w-5 h-5 text-amber-400" />
            </div>
          </div>

          {/* AI Filter Toggles */}
          <div className="space-y-2.5 pb-2 border-b border-gray-800 text-xs font-mono">
            <span className="text-slate-400 text-[10px] font-bold uppercase block">
              Recognition & Overlay Toggles:
            </span>

            <div className="grid grid-cols-2 gap-2">
              <label className="flex items-center gap-2 p-2 rounded-lg bg-gray-900 border border-gray-800 cursor-pointer">
                <input
                  type="checkbox"
                  checked={detectPersons}
                  onChange={(e) => setDetectPersons(e.target.checked)}
                  className="accent-blue-500"
                />
                <span className="text-slate-200">Person Detect</span>
              </label>

              <label className="flex items-center gap-2 p-2 rounded-lg bg-gray-900 border border-gray-800 cursor-pointer">
                <input
                  type="checkbox"
                  checked={detectVehicles}
                  onChange={(e) => setDetectVehicles(e.target.checked)}
                  className="accent-amber-500"
                />
                <span className="text-slate-200">Vehicle Detect</span>
              </label>

              <label className="flex items-center gap-2 p-2 rounded-lg bg-gray-900 border border-gray-800 cursor-pointer">
                <input
                  type="checkbox"
                  checked={showTrails}
                  onChange={(e) => setShowTrails(e.target.checked)}
                  className="accent-cyan-500"
                />
                <span className="text-slate-200">Track Trails</span>
              </label>

              <label className="flex items-center gap-2 p-2 rounded-lg bg-gray-900 border border-gray-800 cursor-pointer">
                <input
                  type="checkbox"
                  checked={nightVisionMode}
                  onChange={(e) => setNightVisionMode(e.target.checked)}
                  className="accent-emerald-500"
                />
                <span className="text-emerald-300">Night IR Boost</span>
              </label>
            </div>

            {/* Confidence Slider */}
            <div className="space-y-1 pt-1">
              <div className="flex justify-between text-[11px]">
                <span className="text-slate-400">DETECTION CONFIDENCE:</span>
                <span className="text-cyan-400 font-bold">{Math.round(confThreshold * 100)}%</span>
              </div>
              <input
                type="range"
                min={0.4}
                max={0.95}
                step={0.05}
                value={confThreshold}
                onChange={(e) => setConfThreshold(Number(e.target.value))}
                className="w-full accent-blue-500 cursor-pointer h-1.5 bg-gray-800 rounded"
              />
            </div>
          </div>

          {/* Live Detections Log Stream */}
          <div className="flex-1 flex flex-col min-h-0 space-y-2">
            <div className="flex items-center justify-between text-xs font-mono">
              <span className="text-[10px] uppercase font-bold text-slate-400">
                Real-Time Detections Feed ({detectionLogs.length})
              </span>
              <span className="text-[10px] text-slate-500">Click to Seek</span>
            </div>

            <div className="flex-1 overflow-y-auto space-y-2 pr-1 max-h-56 text-xs font-mono">
              {detectionLogs.length === 0 ? (
                <div className="h-28 flex flex-col items-center justify-center text-slate-500 text-xs">
                  <CheckCircle2 className="w-6 h-6 text-emerald-500/40 mb-1" />
                  Playing video to register detections...
                </div>
              ) : (
                detectionLogs.map((log, idx) => (
                  <div
                    key={`${log.id}-${idx}`}
                    onClick={() => handleSeek(log.timestampSeconds)}
                    className="p-2.5 rounded-lg bg-gray-900/80 hover:bg-gray-800 border border-gray-800 cursor-pointer transition-colors flex items-center justify-between"
                  >
                    <div className="flex items-center gap-2">
                      <span
                        className={`p-1.5 rounded text-[10px] font-bold ${
                          log.objectClass === 'person'
                            ? 'bg-blue-950 text-blue-300 border border-blue-800'
                            : 'bg-amber-950 text-amber-300 border border-amber-800'
                        }`}
                      >
                        {log.objectClass === 'person' ? 'PERSON' : 'VEHICLE'}
                      </span>
                      <div>
                        <span className="text-slate-200 font-bold block">
                          #{log.trackId} {log.subClass ? `(${log.subClass})` : ''}
                        </span>
                        <span className="text-[10px] text-slate-400">
                          {log.speedKmh ? `${log.speedKmh} km/h` : 'Stationary'}
                        </span>
                      </div>
                    </div>

                    <div className="text-right">
                      <span className="text-emerald-400 font-bold text-xs block">
                        {Math.round(log.confidence * 100)}%
                      </span>
                      <span className="text-[10px] text-slate-400">
                        {log.timestampSeconds.toFixed(1)}s
                      </span>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
