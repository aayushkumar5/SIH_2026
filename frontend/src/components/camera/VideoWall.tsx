import React, { useEffect, useRef, useState } from 'react';
import { Camera, Zone, EventItem } from '../../types';
import {
  Maximize2,
  Minimize2,
  Radio,
  Camera as CameraIcon,
  Sun,
  Shield,
  Sliders,
  Eye,
  Crosshair,
  Volume2,
  Layers,
  AlertTriangle,
} from 'lucide-react';
import { PTZControls } from './PTZControls';
import { SnapshotModal } from './SnapshotModal';

interface VideoWallProps {
  cameras: Camera[];
  zones: Zone[];
  lastEvent: EventItem | null;
  layout?: '1x1' | '2x2' | '3x3';
  showControls?: boolean;
}

export const VideoWall: React.FC<VideoWallProps> = ({
  cameras,
  zones,
  lastEvent,
  layout = '2x2',
  showControls = true,
}) => {
  const [selectedCamId, setSelectedCamId] = useState<string | null>(cameras[0]?.id || null);
  const [fullscreenCamId, setFullscreenCamId] = useState<string | null>(null);
  const [nightVisionMap, setNightVisionMap] = useState<{ [key: string]: boolean }>({
    'CAM-03': true,
    'CAM-04': true,
  });
  const [activePTZCamId, setActivePTZCamId] = useState<string | null>(null);
  const [snapshotCam, setSnapshotCam] = useState<Camera | null>(null);
  const [snapshotModalOpen, setSnapshotModalOpen] = useState(false);
  const [showOverlays, setShowOverlays] = useState(true);

  const canvasRefs = useRef<{ [key: string]: HTMLCanvasElement | null }>({});

  const toggleNightVision = (camId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setNightVisionMap((prev) => ({ ...prev, [camId]: !prev[camId] }));
  };

  const handleCaptureSnapshot = (cam: Camera, e: React.MouseEvent) => {
    e.stopPropagation();
    setSnapshotCam(cam);
    setSnapshotModalOpen(true);
  };

  // Live Canvas Tactical Video Feed Simulation
  useEffect(() => {
    const intervals: any[] = [];

    cameras.forEach((cam) => {
      let simX = 80 + Math.random() * 220;
      let simY = 80 + Math.random() * 140;
      let speedX = (Math.random() - 0.48) * 3.5;
      let speedY = (Math.random() - 0.48) * 2.5;
      const trackId = 10 + parseInt(cam.id.replace(/\D/g, '') || '1', 10) * 12;

      const interval = setInterval(() => {
        const canvas = canvasRefs.current[cam.id];
        if (!canvas) return;
        const ctx = canvas.getContext('2d');
        if (!ctx) return;

        const w = canvas.width;
        const h = canvas.height;
        const isNight = nightVisionMap[cam.id];

        // Background Tactical Shading
        if (isNight) {
          // Night vision thermal green/IR tint
          ctx.fillStyle = '#03140C';
          ctx.fillRect(0, 0, w, h);
          // Noise texture
          ctx.fillStyle = 'rgba(16, 185, 129, 0.04)';
          for (let i = 0; i < 40; i++) {
            ctx.fillRect(Math.random() * w, Math.random() * h, 2, 2);
          }
        } else {
          // Dark tactical surveillance view
          ctx.fillStyle = '#070B14';
          ctx.fillRect(0, 0, w, h);
        }

        // Horizon line & Compass Markings
        ctx.strokeStyle = isNight ? 'rgba(16, 185, 129, 0.25)' : 'rgba(55, 65, 81, 0.35)';
        ctx.lineWidth = 1;
        ctx.beginPath();
        ctx.moveTo(w / 2, 0);
        ctx.lineTo(w / 2, h);
        ctx.moveTo(0, h / 2);
        ctx.lineTo(w, h / 2);
        ctx.stroke();

        // Crosshair reticle in center
        ctx.strokeStyle = isNight ? '#10B981' : '#06B6D4';
        ctx.beginPath();
        ctx.arc(w / 2, h / 2, 18, 0, Math.PI * 2);
        ctx.stroke();

        // Zone Geofence & Tripwire Overlays
        if (showOverlays) {
          const camZones = zones.filter((z) => z.camera_id === cam.id && z.enabled);
          camZones.forEach((zone) => {
            if (zone.coordinates.length < 2) return;

            ctx.beginPath();
            ctx.lineWidth = 2;
            if (zone.zone_type === 'polygon') {
              ctx.strokeStyle =
                zone.severity === 'CRITICAL'
                  ? 'rgba(239, 68, 68, 0.85)'
                  : 'rgba(245, 158, 11, 0.85)';
              ctx.fillStyle =
                zone.severity === 'CRITICAL'
                  ? 'rgba(239, 68, 68, 0.18)'
                  : 'rgba(245, 158, 11, 0.18)';

              zone.coordinates.forEach((pt, idx) => {
                const x = (pt[0] / 960) * w;
                const y = (pt[1] / 540) * h;
                if (idx === 0) ctx.moveTo(x, y);
                else ctx.lineTo(x, y);
              });
              ctx.closePath();
              ctx.fill();
              ctx.stroke();
            } else {
              // Tripwire Line
              ctx.strokeStyle = '#06B6D4';
              ctx.setLineDash([6, 4]);
              const p1 = zone.coordinates[0];
              const p2 = zone.coordinates[1];
              ctx.moveTo((p1[0] / 960) * w, (p1[1] / 540) * h);
              ctx.lineTo((p2[0] / 960) * w, (p2[1] / 540) * h);
              ctx.stroke();
              ctx.setLineDash([]);
            }

            // Zone Name Badge
            const labelPt = zone.coordinates[0];
            ctx.fillStyle = isNight ? '#A7F3D0' : '#E2E8F0';
            ctx.font = 'bold 9px JetBrains Mono, monospace';
            ctx.fillText(
              `ZONE: ${zone.name}`,
              (labelPt[0] / 960) * w + 6,
              (labelPt[1] / 540) * h + 14
            );
          });
        }

        // Update movement vector
        simX += speedX;
        simY += speedY;
        if (simX < 40 || simX > w - 90) speedX *= -1;
        if (simY < 40 || simY > h - 100) speedY *= -1;

        // Draw Bounding Boxes with AI Tracking (Person / Vehicle / Drone)
        if (showOverlays) {
          const isVehicle = cam.id === 'CAM-02' || cam.id === 'CAM-05';
          const isDrone = cam.id === 'CAM-06';
          const boxW = isVehicle ? 80 : isDrone ? 45 : 40;
          const boxH = isVehicle ? 50 : isDrone ? 35 : 75;

          const isAlertActive = lastEvent && lastEvent.camera_id === cam.id;
          const boxColor = isAlertActive
            ? '#EF4444'
            : isNight
            ? '#10B981'
            : '#3B82F6';

          ctx.strokeStyle = boxColor;
          ctx.lineWidth = 2;
          ctx.strokeRect(simX, simY, boxW, boxH);

          // Corner brackets
          const cl = 5;
          ctx.strokeStyle = '#93C5FD';
          ctx.beginPath();
          ctx.moveTo(simX, simY + cl);
          ctx.lineTo(simX, simY);
          ctx.lineTo(simX + cl, simY);
          ctx.moveTo(simX + boxW - cl, simY);
          ctx.lineTo(simX + boxW, simY);
          ctx.lineTo(simX + boxW, simY + cl);
          ctx.stroke();

          // Label Tag
          ctx.fillStyle = isAlertActive
            ? '#EF4444'
            : isNight
            ? '#065F46'
            : '#1E40AF';
          ctx.fillRect(simX, simY - 16, boxW, 16);

          ctx.fillStyle = '#FFFFFF';
          ctx.font = 'bold 8.5px JetBrains Mono, monospace';
          const labelText = isVehicle
            ? `VEH #${trackId} 96%`
            : isDrone
            ? `DRONE #${trackId} 89%`
            : `PERSON #${trackId} 94%`;
          ctx.fillText(labelText, simX + 3, simY - 4);
        }

        // Live HUD Camera Specs Overlay
        ctx.fillStyle = isNight ? 'rgba(16, 185, 129, 0.9)' : 'rgba(255, 255, 255, 0.75)';
        ctx.font = '9px JetBrains Mono, monospace';
        ctx.fillText(
          `${cam.id} • ${cam.fps} FPS • ${isNight ? 'LOW-LIGHT IR ON' : 'VISIBLE'} • BYTE_TRACK`,
          10,
          h - 10
        );
      }, 100);

      intervals.push(interval);
    });

    return () => {
      intervals.forEach(clearInterval);
    };
  }, [cameras, zones, lastEvent, nightVisionMap, showOverlays]);

  const displayedCameras = fullscreenCamId
    ? cameras.filter((c) => c.id === fullscreenCamId)
    : layout === '1x1'
    ? cameras.filter((c) => c.id === (selectedCamId || cameras[0]?.id))
    : cameras;

  const gridClass = fullscreenCamId
    ? 'grid-cols-1'
    : layout === '1x1'
    ? 'grid-cols-1'
    : layout === '3x3'
    ? 'grid-cols-1 md:grid-cols-2 lg:grid-cols-3'
    : 'grid-cols-1 md:grid-cols-2';

  return (
    <div className="flex-1 flex flex-col h-full overflow-hidden space-y-3">
      {/* Grid Viewport */}
      <div className={`grid ${gridClass} gap-3.5 flex-1 overflow-y-auto pr-1`}>
        {displayedCameras.map((cam) => {
          const isSelected = selectedCamId === cam.id;
          const isNight = nightVisionMap[cam.id];
          const isPTZOpen = activePTZCamId === cam.id;

          return (
            <div
              key={cam.id}
              onClick={() => setSelectedCamId(cam.id)}
              className={`glass-panel rounded-xl overflow-hidden flex flex-col relative group border transition-all duration-150 shadow-lg ${
                isSelected
                  ? 'border-blue-500 ring-1 ring-blue-500/40'
                  : 'border-gray-800 hover:border-gray-700'
              }`}
            >
              {/* Header Bar */}
              <div className="px-3 py-2 bg-gray-900/90 border-b border-gray-800 flex items-center justify-between z-10 select-none">
                <div className="flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
                  <span className="font-mono text-xs font-bold text-slate-200">{cam.id}</span>
                  <span className="text-[11px] text-slate-400 hidden sm:inline">
                    | {cam.name}
                  </span>
                </div>

                <div className="flex items-center gap-1.5">
                  {/* Night Vision Toggle */}
                  <button
                    onClick={(e) => toggleNightVision(cam.id, e)}
                    title={isNight ? 'Switch to Normal Color' : 'Enable Low-Light Night IR Enhancement'}
                    className={`p-1 rounded text-xs transition-colors ${
                      isNight
                        ? 'bg-emerald-950/80 text-emerald-400 border border-emerald-700'
                        : 'bg-gray-800 text-slate-400 hover:text-slate-200'
                    }`}
                  >
                    <Sun className="w-3.5 h-3.5" />
                  </button>

                  {/* PTZ Controller Trigger */}
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      setActivePTZCamId(isPTZOpen ? null : cam.id);
                    }}
                    title="Toggle Optical PTZ Controls"
                    className={`p-1 rounded text-xs transition-colors ${
                      isPTZOpen
                        ? 'bg-blue-600 text-white'
                        : 'bg-gray-800 text-slate-400 hover:text-slate-200'
                    }`}
                  >
                    <Crosshair className="w-3.5 h-3.5" />
                  </button>

                  {/* Snapshot Tool */}
                  <button
                    onClick={(e) => handleCaptureSnapshot(cam, e)}
                    title="Capture Forensic Snapshot"
                    className="p-1 rounded bg-gray-800 text-slate-400 hover:text-slate-200 transition-colors"
                  >
                    <CameraIcon className="w-3.5 h-3.5" />
                  </button>

                  {/* Fullscreen Expand */}
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      setFullscreenCamId(fullscreenCamId === cam.id ? null : cam.id);
                    }}
                    title={fullscreenCamId ? 'Exit Fullscreen' : 'Expand Stream Fullscreen'}
                    className="p-1 rounded bg-gray-800 text-slate-400 hover:text-slate-200 transition-colors"
                  >
                    {fullscreenCamId ? (
                      <Minimize2 className="w-3.5 h-3.5" />
                    ) : (
                      <Maximize2 className="w-3.5 h-3.5" />
                    )}
                  </button>
                </div>
              </div>

              {/* Video Feed Canvas */}
              <div className="relative flex-1 bg-black min-h-[220px] flex items-center justify-center overflow-hidden">
                <canvas
                  ref={(el) => (canvasRefs.current[cam.id] = el)}
                  width={480}
                  height={270}
                  className="w-full h-full object-cover"
                />

                {/* Night Vision Watermark */}
                {isNight && (
                  <div className="absolute top-2 left-2 px-1.5 py-0.5 rounded bg-emerald-950/80 border border-emerald-600/60 text-[9px] font-mono text-emerald-400 flex items-center gap-1">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-ping"></span>
                    LOW-LIGHT IR ENHANCED
                  </div>
                )}

                {/* AI Detection Active Badge */}
                <div className="absolute top-2 right-2 px-2 py-0.5 rounded bg-black/60 border border-gray-700 text-[9px] font-mono text-cyan-400">
                  REC • YOLOv8 ACTIVE
                </div>

                {/* Embedded PTZ Drawer */}
                {isPTZOpen && (
                  <div
                    onClick={(e) => e.stopPropagation()}
                    className="absolute inset-y-0 right-0 w-64 bg-gray-950/95 border-l border-gray-800 p-3 z-20 overflow-y-auto animate-in slide-in-from-right duration-200"
                  >
                    <PTZControls cameraId={cam.id} />
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* Forensic Snapshot Modal */}
      <SnapshotModal
        camera={snapshotCam}
        event={lastEvent}
        isOpen={snapshotModalOpen}
        onClose={() => setSnapshotModalOpen(false)}
      />
    </div>
  );
};
