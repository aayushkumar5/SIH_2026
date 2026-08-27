import React, { useState } from 'react';
import { X, Car, Search, ShieldAlert, CheckCircle2, Sparkles, AlertTriangle } from 'lucide-react';
import { validateAndNormalizePlate } from '../../utils/plateValidator';
import { IndianPlateBadge } from './IndianPlateBadge';
import { PlateWatchlistItem } from '../../types';

interface PlateScannerModalProps {
  isOpen: boolean;
  onClose: () => void;
  watchlist: PlateWatchlistItem[];
}

export const PlateScannerModal: React.FC<PlateScannerModalProps> = ({
  isOpen,
  onClose,
  watchlist,
}) => {
  if (!isOpen) return null;

  const [inputPlate, setInputPlate] = useState('UP32BZ9999');
  const [vehicleType, setVehicleType] = useState('SEDAN');
  const [speedKmh, setSpeedKmh] = useState(42);
  const [isScanning, setIsScanning] = useState(false);
  const [scanResult, setScanResult] = useState<any>(null);

  const samplePlates = [
    'UP32BZ9999',
    'DL01AB1234',
    'UK04CA5678',
    '22BH1234AA',
    '↑22D123456A',
    'HR26DK8888',
  ];

  const handleScan = () => {
    setIsScanning(true);
    setTimeout(() => {
      const validation = validateAndNormalizePlate(inputPlate);
      const normInput = inputPlate.replace(/\s+/g, '').toUpperCase();
      const hotlistMatch = watchlist.find((w) => w.id === normInput);

      setScanResult({
        validation,
        hotlistMatch,
        confidence: Math.round((0.88 + Math.random() * 0.1) * 100) / 100,
        scannedAt: new Date().toISOString(),
        vehicleType,
        speedKmh,
      });
      setIsScanning(false);
    }, 600);
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-4">
      <div className="glass-panel w-full max-w-xl rounded-2xl border border-gray-700 shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="px-5 py-4 bg-gray-900/90 border-b border-gray-800 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-blue-600/20 text-blue-400 border border-blue-500/30">
              <Car className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-slate-100 uppercase tracking-wider">
                ANPR OCR Scanner & Hotlist Evaluator
              </h3>
              <p className="text-xs text-slate-400">
                Test Indian license plate OCR extraction and watchlist matching
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 rounded-lg hover:bg-gray-800 text-slate-400 hover:text-slate-200 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-5 space-y-4 overflow-y-auto text-xs">
          {/* Quick presets */}
          <div>
            <span className="text-slate-400 text-[10px] uppercase font-mono block mb-1.5">
              Quick Test Presets (Standard, Bharat BH, Military):
            </span>
            <div className="flex flex-wrap gap-2">
              {samplePlates.map((p) => (
                <button
                  key={p}
                  onClick={() => setInputPlate(p)}
                  className={`px-2.5 py-1 rounded text-xs font-mono border transition-all ${
                    inputPlate === p
                      ? 'bg-blue-600/30 border-blue-500 text-blue-300 font-bold'
                      : 'bg-gray-900 border-gray-700 text-slate-400 hover:text-slate-200'
                  }`}
                >
                  {p}
                </button>
              ))}
            </div>
          </div>

          {/* Form input */}
          <div className="space-y-3">
            <div>
              <label className="block text-slate-400 mb-1 font-mono">PLATE TEXT INPUT</label>
              <input
                type="text"
                value={inputPlate}
                onChange={(e) => setInputPlate(e.target.value.toUpperCase())}
                placeholder="e.g. DL01AB1234"
                className="w-full bg-gray-900 border border-gray-700 rounded-lg px-3 py-2 text-slate-100 font-mono text-sm uppercase focus:border-blue-500 outline-none"
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-slate-400 mb-1">VEHICLE CLASSIFICATION</label>
                <select
                  value={vehicleType}
                  onChange={(e) => setVehicleType(e.target.value)}
                  className="w-full bg-gray-900 border border-gray-700 rounded-lg px-3 py-2 text-slate-100 outline-none"
                >
                  <option value="SEDAN">SEDAN / HATCHBACK</option>
                  <option value="SUV">SUV / 4X4 JEEP</option>
                  <option value="TRUCK">COMMERCIAL TRUCK</option>
                  <option value="MOTORCYCLE">MOTORCYCLE</option>
                </select>
              </div>

              <div>
                <label className="block text-slate-400 mb-1 font-mono">SPEED (KM/H)</label>
                <input
                  type="number"
                  value={speedKmh}
                  onChange={(e) => setSpeedKmh(Number(e.target.value))}
                  className="w-full bg-gray-900 border border-gray-700 rounded-lg px-3 py-2 text-slate-100 font-mono outline-none"
                />
              </div>
            </div>

            <button
              onClick={handleScan}
              disabled={isScanning || !inputPlate.trim()}
              className="w-full py-2.5 rounded-lg bg-blue-600 hover:bg-blue-500 text-white font-bold transition-all flex items-center justify-center gap-2 shadow-lg"
            >
              <Sparkles className={`w-4 h-4 ${isScanning ? 'animate-spin' : ''}`} />
              {isScanning ? 'RUNNING OCR INFERENCE...' : 'TEST ANPR OCR & MATCH'}
            </button>
          </div>

          {/* Results Box */}
          {scanResult && (
            <div className="glass-card p-4 rounded-xl border border-gray-700 space-y-3 font-mono animate-in fade-in">
              <div className="flex items-center justify-between border-b border-gray-800 pb-2">
                <span className="text-[10px] uppercase text-slate-400 font-bold">
                  ANPR Extraction Result
                </span>
                <span className="text-[10px] text-emerald-400 font-bold">
                  OCR CONFIDENCE: {Math.round(scanResult.confidence * 100)}%
                </span>
              </div>

              <div className="flex items-center justify-between">
                <div>
                  <IndianPlateBadge
                    plateNumber={scanResult.validation.normalized || inputPlate}
                    isHotlisted={!!scanResult.hotlistMatch}
                    size="lg"
                  />
                </div>

                <div className="text-right">
                  <span className="text-slate-400 text-[10px] block">FORMAT TYPE</span>
                  <span className="text-cyan-400 font-bold text-xs">
                    {scanResult.validation.format}
                  </span>
                </div>
              </div>

              {/* Hotlist Interception Alert */}
              {scanResult.hotlistMatch ? (
                <div className="p-3 rounded-lg bg-red-950/60 border border-red-500/60 text-red-300 flex items-start gap-2.5">
                  <ShieldAlert className="w-5 h-5 text-red-400 flex-shrink-0 mt-0.5" />
                  <div>
                    <p className="text-xs font-bold text-red-200">
                      HOTLIST MATCH: {scanResult.hotlistMatch.category}
                    </p>
                    <p className="text-[11px] text-red-300/90 mt-0.5">
                      {scanResult.hotlistMatch.reason || 'Flagged in Intelligence Database.'}
                    </p>
                  </div>
                </div>
              ) : (
                <div className="p-2.5 rounded-lg bg-emerald-950/40 border border-emerald-500/40 text-emerald-300 flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                  <span className="text-[11px]">
                    No hotlist flags detected. Vehicle cleared for normal transit.
                  </span>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
