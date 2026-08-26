import React, { useEffect, useRef, useState } from 'react';
import { Camera, Zone, EventItem } from '../types';
import { Maximize2, Radio, Shield, Video, Zap } from 'lucide-react';

interface VideoWallProps {
  cameras: Camera[];
  zones: Zone[];
  lastEvent: EventItem | null;
}

export const VideoWall: React.FC<VideoWallProps> = ({ cameras, zones, lastEvent }) => {
  const [selectedCam, setSelectedCam] = useState<string | null>(null);
  const canvasRefs = useRef<{ [key: string]: HTMLCanvasElement | null }>({});

  // Synthetic live video simulator for edge streams with dynamic bounding boxes
  useEffect(() => {
    const intervals: any[] = [];

    cameras.forEach((cam) => {
      let simX = 100 + Math.random() * 200;
      let simY = 100 + Math.random() * 150;
      let speedX = (Math.random() - 0.5) * 4;
      let speedY = (Math.random() - 0.5) * 3;
      let trackId = 10 + Math.floor(Math.random() * 90);

      const interval = setInterval(() => {
        const canvas = canvasRefs.current[cam.id];
        if (!canvas) return;
        const ctx = canvas.getContext('2d');
        if (!ctx) return;

        const w = canvas.width;
        const h = canvas.height;

        // Background tactical grid
        ctx.fillStyle = '#080C14';
        ctx.fillRect(0, 0, w, h);

        // Draw camera crosshairs & grid
        ctx.strokeStyle = 'rgba(55, 65, 81, 0.4)';
        ctx.lineWidth = 1;
        ctx.beginPath();
        ctx.moveTo(w / 2, 0);
        ctx.lineTo(w / 2, h);
        ctx.moveTo(0, h / 2);
        ctx.lineTo(w, h / 2);
        ctx.stroke();

        // Draw active zones for this camera
        const camZones = zones.filter((z) => z.camera_id === cam.id && z.enabled);
        camZones.forEach((zone) => {
          if (zone.coordinates.length < 2) return;

          ctx.beginPath();
          ctx.lineWidth = 2;
          if (zone.zone_type === 'polygon') {
            ctx.strokeStyle = zone.severity === 'CRITICAL' ? 'rgba(239, 68, 68, 0.8)' : 'rgba(245, 158, 11, 0.8)';
            ctx.fillStyle = zone.severity === 'CRITICAL' ? 'rgba(239, 68, 68, 0.15)' : 'rgba(245, 158, 11, 0.15)';
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
            // Tripwire line
            ctx.strokeStyle = '#06B6D4';
            ctx.setLineDash([6, 6]);
            const p1 = zone.coordinates[0];
            const p2 = zone.coordinates[1];
            ctx.moveTo((p1[0] / 960) * w, (p1[1] / 540) * h);
            ctx.lineTo((p2[0] / 960) * w, (p2[1] / 540) * h);
            ctx.stroke();
            ctx.setLineDash([]);
          }

          // Label
          const labelPt = zone.coordinates[0];
          ctx.fillStyle = '#94A3B8';
          ctx.font = '10px JetBrains Mono';
          ctx.fillText(`ZONE: ${zone.name}`, (labelPt[0] / 960) * w + 5, (labelPt[1] / 540) * h + 15);
        });

        // Update simulated object position
        simX += speedX;
        simY += speedY;
        if (simX < 50 || simX > w - 100) speedX *= -1;
        if (simY < 50 || simY > h - 120) speedY *= -1;

        // Draw Bounding Box (Person / Vehicle)
        const isPerson = cam.id === 'CAM-01' || cam.id === 'CAM-03';
        const boxW = isPerson ? 45 : 90;
        const boxH = isPerson ? 90 : 55;

        // Color based on active alert
        const isAlert = lastEvent && lastEvent.camera_id === cam.id;
        ctx.strokeStyle = isAlert ? '#EF4444' : '#3B82F6';
        ctx.lineWidth = 2;
        ctx.strokeRect(simX, simY, boxW, boxH);

        // Corner brackets
        const cl = 6;
        ctx.strokeStyle = '#60A5FA';
        ctx.beginPath();
        ctx.moveTo(simX, simY + cl); ctx.lineTo(simX, simY); ctx.lineTo(simX + cl, simY);
        ctx.moveTo(simX + boxW - cl, simY); ctx.lineTo(simX + boxW, simY); ctx.lineTo(simX + boxW, simY + cl);
        ctx.stroke();

        // Label tag
        ctx.fillStyle = isAlert ? '#EF4444' : '#1E40AF';
        ctx.fillRect(simX, simY - 18, boxW, 18);
        ctx.fillStyle = '#FFFFFF';
        ctx.font = 'bold 9px JetBrains Mono';
        ctx.fillText(
          `${isPerson ? 'PERSON' : 'VEHICLE'} #${trackId} 94%`,
          simX + 4,
          simY - 5
        );

        // Timestamp overlay
        ctx.fillStyle = 'rgba(255, 255, 255, 0.7)';
        ctx.font = '10px JetBrains Mono';
        ctx.fillText(`FPS: ${cam.fps} | YOLOv8 + ByteTrack`, 10, h - 12);

      }, 100);

      intervals.push(interval);
    });

    return () => {
      intervals.forEach(clearInterval);
    };
  }, [cameras, zones, lastEvent]);

  return (
    <div className="flex-1 flex flex-col h-full overflow-hidden p-4 space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Video className="w-5 h-5 text-blue-400" />
          <h2 className="text-sm font-bold uppercase tracking-wider text-slate-200">
            Border Out Post Video Wall (Multi-Stream Grid)
          </h2>
        </div>
        <div className="flex items-center gap-3 text-xs">
          <span className="flex items-center gap-1.5 text-emerald-400 font-mono">
            <Radio className="w-3.5 h-3.5 animate-pulse" />
            LIVE RTSP EDGE INGESTION
          </span>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 flex-1 overflow-y-auto">
        {cameras.map((cam) => (
          <div
            key={cam.id}
            className="glass-panel rounded-xl overflow-hidden flex flex-col relative group border border-gray-800 hover:border-blue-500/50 transition-all shadow-lg"
          >
            {/* Camera Header Bar */}
            <div className="px-3 py-2 bg-gray-900/80 border-b border-gray-800 flex items-center justify-between z-10">
              <div className="flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
                <span className="font-mono text-xs font-bold text-slate-200">{cam.id}</span>
                <span className="text-xs text-slate-400">| {cam.name}</span>
              </div>
              <div className="flex items-center gap-2 text-[10px] text-slate-400 font-mono">
                <span>{cam.location_name}</span>
                <span className="px-1.5 py-0.5 rounded bg-gray-800 text-cyan-400">{cam.resolution}</span>
              </div>
            </div>

            {/* Video / Canvas Stream */}
            <div className="relative flex-1 bg-black min-h-[220px] flex items-center justify-center">
              <canvas
                ref={(el) => (canvasRefs.current[cam.id] = el)}
                width={480}
                height={270}
                className="w-full h-full object-cover"
              />

              {/* Status Watermark */}
              <div className="absolute top-2 right-2 px-2 py-0.5 rounded bg-black/60 border border-gray-700 text-[9px] font-mono text-emerald-400">
                REC • AI-ACTIVE
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
