import React, { useRef, useState, useEffect } from 'react';
import { Camera, Zone, Severity } from '../../types';
import { isPointInPolygon, doLinesIntersect, Point } from '../../utils/geometry';
import {
  ShieldAlert,
  Plus,
  Undo2,
  Trash2,
  Check,
  MousePointer,
  Crosshair,
  HelpCircle,
  AlertTriangle,
} from 'lucide-react';

interface ZoneCanvasEditorProps {
  cameras: Camera[];
  selectedCameraId: string;
  onSelectCamera: (camId: string) => void;
  existingZones: Zone[];
  onSaveZone: (zoneData: Partial<Zone>) => Promise<void>;
}

export const ZoneCanvasEditor: React.FC<ZoneCanvasEditorProps> = ({
  cameras,
  selectedCameraId,
  onSelectCamera,
  existingZones,
  onSaveZone,
}) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  const [zoneName, setZoneName] = useState('');
  const [zoneType, setZoneType] = useState<'polygon' | 'line'>('polygon');
  const [severity, setSeverity] = useState<Severity>('HIGH');
  const [loiterSeconds, setLoiterSeconds] = useState<number>(10);

  const [points, setPoints] = useState<Point[]>([]);
  const [mode, setMode] = useState<'DRAW' | 'TEST'>('DRAW');
  const [testResult, setTestResult] = useState<{ point: Point; triggered: boolean; msg: string } | null>(null);
  const [isSaving, setIsSaving] = useState(false);

  const currentCamera = cameras.find((c) => c.id === selectedCameraId) || cameras[0];
  const cameraZones = existingZones.filter((z) => z.camera_id === selectedCameraId && z.enabled);

  // Redraw Canvas
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const w = canvas.width;
    const h = canvas.height;

    // Background tactical grid
    ctx.fillStyle = '#080C14';
    ctx.fillRect(0, 0, w, h);

    // Cross grid
    ctx.strokeStyle = 'rgba(55, 65, 81, 0.4)';
    ctx.lineWidth = 1;
    for (let x = 0; x < w; x += 40) {
      ctx.beginPath();
      ctx.moveTo(x, 0);
      ctx.lineTo(x, h);
      ctx.stroke();
    }
    for (let y = 0; y < h; y += 40) {
      ctx.beginPath();
      ctx.moveTo(0, y);
      ctx.lineTo(w, y);
      ctx.stroke();
    }

    // Draw Existing Saved Zones for this Camera
    cameraZones.forEach((z) => {
      if (z.coordinates.length < 2) return;

      ctx.beginPath();
      ctx.lineWidth = 1.5;
      if (z.zone_type === 'polygon') {
        ctx.strokeStyle =
          z.severity === 'CRITICAL'
            ? 'rgba(239, 68, 68, 0.6)'
            : 'rgba(245, 158, 11, 0.6)';
        ctx.fillStyle =
          z.severity === 'CRITICAL'
            ? 'rgba(239, 68, 68, 0.1)'
            : 'rgba(245, 158, 11, 0.1)';

        z.coordinates.forEach((pt, idx) => {
          const x = (pt[0] / 960) * w;
          const y = (pt[1] / 540) * h;
          if (idx === 0) ctx.moveTo(x, y);
          else ctx.lineTo(x, y);
        });
        ctx.closePath();
        ctx.fill();
        ctx.stroke();
      } else {
        ctx.strokeStyle = '#06B6D4';
        ctx.setLineDash([6, 6]);
        const p1 = z.coordinates[0];
        const p2 = z.coordinates[1];
        ctx.moveTo((p1[0] / 960) * w, (p1[1] / 540) * h);
        ctx.lineTo((p2[0] / 960) * w, (p2[1] / 540) * h);
        ctx.stroke();
        ctx.setLineDash([]);
      }

      // Label
      const p0 = z.coordinates[0];
      ctx.fillStyle = '#64748B';
      ctx.font = '9px JetBrains Mono';
      ctx.fillText(z.name, (p0[0] / 960) * w + 5, (p0[1] / 540) * h + 12);
    });

    // Draw Current In-Progress Points
    if (points.length > 0) {
      ctx.beginPath();
      ctx.lineWidth = 2.5;
      ctx.strokeStyle = '#3B82F6';
      ctx.fillStyle = 'rgba(59, 130, 246, 0.25)';

      points.forEach((pt, idx) => {
        const x = (pt[0] / 960) * w;
        const y = (pt[1] / 540) * h;
        if (idx === 0) ctx.moveTo(x, y);
        else ctx.lineTo(x, y);
      });

      if (zoneType === 'polygon' && points.length >= 3) {
        ctx.closePath();
        ctx.fill();
      }
      ctx.stroke();

      // Vertex dots
      points.forEach((pt, idx) => {
        const x = (pt[0] / 960) * w;
        const y = (pt[1] / 540) * h;
        ctx.fillStyle = idx === 0 ? '#10B981' : '#60A5FA';
        ctx.beginPath();
        ctx.arc(x, y, 5, 0, Math.PI * 2);
        ctx.fill();
        ctx.strokeStyle = '#FFFFFF';
        ctx.lineWidth = 1.5;
        ctx.stroke();

        ctx.fillStyle = '#FFFFFF';
        ctx.font = 'bold 9px JetBrains Mono';
        ctx.fillText(`P${idx + 1}`, x + 7, y - 5);
      });
    }

    // Draw Test Probe Point if active
    if (testResult) {
      const tx = (testResult.point[0] / 960) * w;
      const ty = (testResult.point[1] / 540) * h;

      ctx.fillStyle = testResult.triggered ? '#EF4444' : '#10B981';
      ctx.beginPath();
      ctx.arc(tx, ty, 8, 0, Math.PI * 2);
      ctx.fill();
      ctx.strokeStyle = '#FFFFFF';
      ctx.lineWidth = 2;
      ctx.stroke();

      ctx.fillStyle = testResult.triggered ? '#FCA5A5' : '#6EE7B7';
      ctx.font = 'bold 10px JetBrains Mono';
      ctx.fillText(testResult.triggered ? 'INTRUSION!' : 'CLEAR', tx + 12, ty + 4);
    }
  }, [points, cameraZones, zoneType, testResult, selectedCameraId]);

  const handleCanvasClick = (e: React.MouseEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const rect = canvas.getBoundingClientRect();
    const clickX = e.clientX - rect.left;
    const clickY = e.clientY - rect.top;

    // Scale to normalized 960x540 coordinates
    const normX = Math.round((clickX / canvas.clientWidth) * 960);
    const normY = Math.round((clickY / canvas.clientHeight) * 540);
    const newPoint: Point = [normX, normY];

    if (mode === 'DRAW') {
      if (zoneType === 'line' && points.length >= 2) {
        // Line only needs 2 points
        setPoints([newPoint]);
        return;
      }
      setPoints([...points, newPoint]);
    } else {
      // TEST MODE: Ray-casting Point-In-Polygon intrusion test
      const targetPoly = points.length >= 3 ? points : cameraZones[0]?.coordinates || [];
      const isInside = isPointInPolygon(newPoint, targetPoly as Point[]);

      setTestResult({
        point: newPoint,
        triggered: isInside,
        msg: isInside
          ? `ALARM: Coordinate [${normX}, ${normY}] penetrated restricted geofence boundary!`
          : `CLEAR: Coordinate [${normX}, ${normY}] is outside restricted zone boundary.`,
      });
    }
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!zoneName.trim() || points.length < (zoneType === 'polygon' ? 3 : 2)) return;

    setIsSaving(true);
    try {
      const zoneId = `ZONE-${selectedCameraId}-${Date.now().toString().slice(-4)}`;
      await onSaveZone({
        id: zoneId,
        camera_id: selectedCameraId,
        name: zoneName.trim(),
        zone_type: zoneType,
        coordinates: points,
        severity,
        loitering_threshold_seconds: loiterSeconds,
        enabled: true,
      });

      setZoneName('');
      setPoints([]);
      setTestResult(null);
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 flex-1 min-h-0">
      {/* Canvas Viewport (Left 2 Columns) */}
      <div className="lg:col-span-2 glass-panel rounded-xl border border-gray-800 overflow-hidden flex flex-col">
        {/* Canvas Toolbar */}
        <div className="px-4 py-3 bg-gray-900/90 border-b border-gray-800 flex flex-wrap items-center justify-between gap-3 select-none">
          <div className="flex items-center gap-3">
            <span className="text-xs font-bold uppercase text-slate-200 font-mono">
              TARGET FEED:
            </span>
            <select
              value={selectedCameraId}
              onChange={(e) => onSelectCamera(e.target.value)}
              className="bg-gray-950 border border-gray-700 rounded-lg px-2.5 py-1 text-xs text-cyan-400 font-mono"
            >
              {cameras.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.id} • {c.name}
                </option>
              ))}
            </select>
          </div>

          {/* Mode Switcher */}
          <div className="flex items-center gap-2 text-xs">
            <button
              onClick={() => {
                setMode('DRAW');
                setTestResult(null);
              }}
              className={`px-3 py-1 rounded-lg border font-mono transition-all ${
                mode === 'DRAW'
                  ? 'bg-blue-600/30 border-blue-500 text-blue-300 font-bold'
                  : 'bg-gray-900 border-gray-700 text-slate-400'
              }`}
            >
              DRAW VERTICES ({points.length})
            </button>

            <button
              onClick={() => setMode('TEST')}
              className={`px-3 py-1 rounded-lg border font-mono transition-all flex items-center gap-1.5 ${
                mode === 'TEST'
                  ? 'bg-cyan-600/30 border-cyan-500 text-cyan-300 font-bold'
                  : 'bg-gray-900 border-gray-700 text-slate-400'
              }`}
            >
              <Crosshair className="w-3.5 h-3.5" />
              TEST INTRUSION
            </button>

            {points.length > 0 && (
              <button
                onClick={() => setPoints(points.slice(0, -1))}
                className="p-1 rounded bg-gray-800 text-slate-400 hover:text-slate-200"
                title="Undo last point"
              >
                <Undo2 className="w-4 h-4" />
              </button>
            )}

            {points.length > 0 && (
              <button
                onClick={() => setPoints([])}
                className="p-1 rounded bg-red-950/40 text-red-400 hover:bg-red-900"
                title="Clear points"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            )}
          </div>
        </div>

        {/* Interactive Canvas */}
        <div className="relative flex-1 bg-black flex items-center justify-center p-4">
          <canvas
            ref={canvasRef}
            width={960}
            height={540}
            onClick={handleCanvasClick}
            className={`w-full max-w-2xl aspect-video rounded-lg border border-gray-700 shadow-2xl cursor-${
              mode === 'DRAW' ? 'crosshair' : 'pointer'
            }`}
          />

          <div className="absolute top-6 left-6 px-2 py-1 rounded bg-black/70 border border-gray-700 text-[10px] font-mono text-slate-300 pointer-events-none">
            {mode === 'DRAW'
              ? `CLICK VIEWPORT TO PLOT ${zoneType.toUpperCase()} VERTICES`
              : 'CLICK ANYWHERE ON VIEWPORT TO TEST RAY-CASTING INTRUSION'}
          </div>
        </div>

        {/* Status result strip */}
        {testResult && (
          <div
            className={`p-3 border-t font-mono text-xs flex items-center gap-2 ${
              testResult.triggered
                ? 'bg-red-950/40 border-red-500/50 text-red-300'
                : 'bg-emerald-950/40 border-emerald-500/50 text-emerald-300'
            }`}
          >
            <AlertTriangle className="w-4 h-4" />
            <span>{testResult.msg}</span>
          </div>
        )}
      </div>

      {/* Configuration Form (Right Column) */}
      <div className="glass-panel p-5 rounded-xl border border-gray-800 flex flex-col justify-between space-y-4">
        <div className="space-y-4">
          <div className="flex items-center gap-2 pb-2 border-b border-gray-800">
            <ShieldAlert className="w-5 h-5 text-blue-400" />
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-200">
              Configure Geofence Parameters
            </h3>
          </div>

          <form onSubmit={handleSave} className="space-y-3.5 text-xs">
            <div>
              <label className="block text-slate-400 mb-1">GEOFENCE / ZONE NAME</label>
              <input
                type="text"
                placeholder="e.g. Zero-Line Buffer Strip North"
                value={zoneName}
                onChange={(e) => setZoneName(e.target.value)}
                className="w-full bg-gray-900 border border-gray-700 rounded-lg px-3 py-2 text-slate-100 focus:border-blue-500 outline-none"
                required
              />
            </div>

            <div>
              <label className="block text-slate-400 mb-1">GEOMETRY TYPE</label>
              <select
                value={zoneType}
                onChange={(e) => {
                  setZoneType(e.target.value as any);
                  setPoints([]);
                }}
                className="w-full bg-gray-900 border border-gray-700 rounded-lg px-3 py-2 text-slate-100 focus:border-blue-500 outline-none"
              >
                <option value="polygon">Restricted Polygon (Ray-casting Boundary)</option>
                <option value="line">Tripwire Line (Vector Crossing Intersection)</option>
              </select>
            </div>

            <div>
              <label className="block text-slate-400 mb-1">ALERT SEVERITY LEVEL</label>
              <select
                value={severity}
                onChange={(e) => setSeverity(e.target.value as Severity)}
                className="w-full bg-gray-900 border border-gray-700 rounded-lg px-3 py-2 text-slate-100 focus:border-blue-500 outline-none"
              >
                <option value="CRITICAL">CRITICAL (Zero-Tolerance Line)</option>
                <option value="HIGH">HIGH (Restricted Perimeter Area)</option>
                <option value="MEDIUM">MEDIUM (Caution / Loitering Track)</option>
              </select>
            </div>

            <div>
              <label className="block text-slate-400 mb-1 font-mono">
                LOITERING DWELL TIME (SECONDS): {loiterSeconds}s
              </label>
              <input
                type="range"
                min={2}
                max={60}
                step={1}
                value={loiterSeconds}
                onChange={(e) => setLoiterSeconds(Number(e.target.value))}
                className="w-full accent-blue-500 cursor-pointer h-1.5 bg-gray-800 rounded-lg"
              />
              <span className="text-[10px] text-slate-500 font-mono mt-0.5 block">
                Triggers security alert if tracked object remains inside zone &gt; {loiterSeconds}s
              </span>
            </div>

            <button
              type="submit"
              disabled={isSaving || !zoneName.trim() || points.length < (zoneType === 'polygon' ? 3 : 2)}
              className="w-full py-2.5 rounded-lg bg-blue-600 hover:bg-blue-500 disabled:opacity-50 text-white font-bold transition-all flex items-center justify-center gap-2 shadow-lg"
            >
              <Check className="w-4 h-4" />
              {isSaving ? 'DEPLOYING GEOFENCE...' : 'DEPLOY GEOFENCE TO EDGE'}
            </button>
          </form>
        </div>

        {/* Instructions */}
        <div className="glass-card p-3 rounded-lg text-[11px] text-slate-400 space-y-1 font-mono">
          <div className="flex items-center gap-1.5 text-cyan-400 font-bold">
            <HelpCircle className="w-3.5 h-3.5" />
            <span>Interactive Instructions</span>
          </div>
          <p>1. Click on the camera viewport to add polygon corner points.</p>
          <p>2. Complete minimum 3 points for a polygon or 2 for a tripwire.</p>
          <p>3. Switch to 'TEST INTRUSION' to verify ray-casting triggers.</p>
        </div>
      </div>
    </div>
  );
};
