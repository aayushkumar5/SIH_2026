import React, { useEffect, useState } from 'react';
import { PlateWatchlistItem } from '../types';
import { api } from '../services/api';
import { Car, Plus, Trash2, ShieldAlert, Sparkles, Search, CheckCircle2 } from 'lucide-react';
import { IndianPlateBadge } from '../components/anpr/IndianPlateBadge';
import { PlateScannerModal } from '../components/anpr/PlateScannerModal';
import { validateAndNormalizePlate } from '../utils/plateValidator';

export const ANPRPage: React.FC = () => {
  const [watchlist, setWatchlist] = useState<PlateWatchlistItem[]>([]);
  const [newPlate, setNewPlate] = useState('');
  const [newCategory, setNewCategory] = useState<'STOLEN' | 'WANTED' | 'SUSPICIOUS' | 'HIGH_RISK' | 'VIP'>('WANTED');
  const [newReason, setNewReason] = useState('');
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [scannerModalOpen, setScannerModalOpen] = useState(false);

  const fetchWatchlist = async () => {
    try {
      const data = await api.getPlateWatchlist();
      setWatchlist(data);
    } catch (e) {
      console.error(e);
    }
  };

  useEffect(() => {
    fetchWatchlist();
  }, []);

  const handleAdd = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newPlate.trim()) return;

    setLoading(true);
    try {
      const norm = newPlate.replace(/\s+/g, '').toUpperCase();
      await api.addPlateWatchlist({
        id: norm,
        category: newCategory,
        reason: newReason.trim(),
      });
      setNewPlate('');
      setNewReason('');
      await fetchWatchlist();
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const handleRemove = async (plateId: string) => {
    try {
      await api.removePlateWatchlist(plateId);
      await fetchWatchlist();
    } catch (e) {
      console.error(e);
    }
  };

  const filtered = watchlist.filter((item) => {
    if (!searchTerm) return true;
    const term = searchTerm.toLowerCase();
    return (
      item.id.toLowerCase().includes(term) ||
      item.category.toLowerCase().includes(term) ||
      (item.reason && item.reason.toLowerCase().includes(term))
    );
  });

  return (
    <div className="flex-1 flex flex-col h-full overflow-hidden p-6 space-y-6">
      {/* Header */}
      <div className="glass-panel p-5 rounded-xl border border-gray-800 flex flex-wrap items-center justify-between gap-4 select-none">
        <div className="flex items-center gap-3">
          <div className="p-3 rounded-lg bg-blue-600/20 border border-blue-500/40 text-blue-400">
            <Car className="w-6 h-6" />
          </div>
          <div>
            <h2 className="text-base font-bold text-slate-100 uppercase tracking-wider">
              Automatic Number Plate Recognition (ANPR) & Hotlist Engine
            </h2>
            <p className="text-xs text-slate-400">
              Indian registration format validation (Standard State, Bharat BH, Armed Forces Military) + PaddleOCR & Hotlist Interception
            </p>
          </div>
        </div>

        <button
          onClick={() => setScannerModalOpen(true)}
          className="flex items-center gap-2 px-4 py-2.5 rounded-lg bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-500 hover:to-cyan-500 text-white text-xs font-bold font-mono transition-all shadow-lg"
        >
          <Sparkles className="w-4 h-4" />
          LAUNCH OCR SCANNER TESTER
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 flex-1 min-h-0">
        {/* Add Plate Form */}
        <div className="glass-panel p-5 rounded-xl border border-gray-800 flex flex-col space-y-4">
          <h3 className="text-xs font-bold uppercase tracking-wider text-slate-200 flex items-center gap-2 pb-2 border-b border-gray-800">
            <Plus className="w-4 h-4 text-blue-400" />
            Enroll Vehicle to Hotlist
          </h3>

          <form onSubmit={handleAdd} className="space-y-3.5 text-xs">
            <div>
              <label className="block text-slate-400 mb-1 font-mono">REGISTRATION NUMBER (INDIAN FORMAT)</label>
              <input
                type="text"
                placeholder="e.g. DL01AB1234, UP32BZ9999, 22BH1234AA"
                value={newPlate}
                onChange={(e) => setNewPlate(e.target.value.toUpperCase())}
                className="w-full bg-gray-900 border border-gray-700 rounded-lg px-3 py-2 text-slate-100 font-mono text-sm uppercase focus:border-blue-500 outline-none"
                required
              />
              {newPlate && (
                <div className="mt-2">
                  <IndianPlateBadge plateNumber={newPlate} size="sm" />
                </div>
              )}
            </div>

            <div>
              <label className="block text-slate-400 mb-1">ALERT CATEGORY</label>
              <select
                value={newCategory}
                onChange={(e) => setNewCategory(e.target.value as any)}
                className="w-full bg-gray-900 border border-gray-700 rounded-lg px-3 py-2 text-slate-100 focus:border-blue-500 outline-none"
              >
                <option value="WANTED">WANTED / SMUGGLING SUSPECT</option>
                <option value="STOLEN">STOLEN VEHICLE</option>
                <option value="SUSPICIOUS">SUSPICIOUS NIGHT SIGHTINGS</option>
                <option value="HIGH_RISK">HIGH RISK BORDER VEHICLE</option>
                <option value="VIP">VIP / OFFICIAL PROTOCOL</option>
              </select>
            </div>

            <div>
              <label className="block text-slate-400 mb-1">INTELLIGENCE BRIEF / REASON</label>
              <textarea
                placeholder="Details, FIR number, or border surveillance note..."
                value={newReason}
                onChange={(e) => setNewReason(e.target.value)}
                rows={3}
                className="w-full bg-gray-900 border border-gray-700 rounded-lg p-3 text-slate-100 focus:border-blue-500 outline-none"
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-2.5 rounded-lg bg-blue-600 hover:bg-blue-500 text-white font-bold transition-all shadow-md flex items-center justify-center gap-2"
            >
              <Car className="w-4 h-4" />
              {loading ? 'ENROLLING HOTLIST...' : 'ENROLL INTO HOTLIST'}
            </button>
          </form>
        </div>

        {/* Watchlist Table */}
        <div className="lg:col-span-2 glass-panel rounded-xl overflow-hidden border border-gray-800 flex flex-col">
          <div className="px-4 py-3 bg-gray-900/80 border-b border-gray-800 flex flex-wrap items-center justify-between gap-3">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-200">
              Active Hotlist Watchlist ({filtered.length})
            </span>

            <div className="relative">
              <Search className="w-3.5 h-3.5 text-slate-500 absolute left-2.5 top-2" />
              <input
                type="text"
                placeholder="Search plate or reason..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="bg-gray-950 border border-gray-700 rounded-lg pl-8 pr-3 py-1 text-slate-200 text-xs font-mono outline-none"
              />
            </div>
          </div>

          <div className="overflow-x-auto flex-1">
            <table className="w-full text-left text-xs">
              <thead className="bg-gray-950 text-slate-400 font-mono border-b border-gray-800">
                <tr>
                  <th className="p-3">LICENSE PLATE</th>
                  <th className="p-3">CATEGORY</th>
                  <th className="p-3">INTELLIGENCE BRIEF</th>
                  <th className="p-3">ADDED BY</th>
                  <th className="p-3 text-right">ACTION</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-800 font-mono">
                {filtered.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="p-8 text-center text-slate-500">
                      No vehicles matching query in watchlist.
                    </td>
                  </tr>
                ) : (
                  filtered.map((item) => (
                    <tr key={item.id} className="hover:bg-gray-800/40 transition-colors">
                      <td className="p-3">
                        <IndianPlateBadge plateNumber={item.id} isHotlisted={item.category === 'WANTED' || item.category === 'STOLEN'} size="sm" />
                      </td>
                      <td className="p-3">
                        <span
                          className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                            item.category === 'WANTED' || item.category === 'STOLEN'
                              ? 'bg-red-950/60 text-red-400 border border-red-800'
                              : item.category === 'VIP'
                              ? 'bg-blue-950/60 text-cyan-400 border border-blue-800'
                              : 'bg-amber-950/60 text-amber-400 border border-amber-800'
                          }`}
                        >
                          {item.category}
                        </span>
                      </td>
                      <td className="p-3 text-slate-300 max-w-xs truncate">{item.reason || '—'}</td>
                      <td className="p-3 text-slate-400 text-[11px]">{item.added_by || 'HQ'}</td>
                      <td className="p-3 text-right">
                        <button
                          onClick={() => handleRemove(item.id)}
                          className="p-1.5 rounded hover:bg-red-500/20 text-red-400 transition-colors"
                          title="Remove from watchlist"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* OCR Tester Modal */}
      <PlateScannerModal
        isOpen={scannerModalOpen}
        onClose={() => setScannerModalOpen(false)}
        watchlist={watchlist}
      />
    </div>
  );
};
