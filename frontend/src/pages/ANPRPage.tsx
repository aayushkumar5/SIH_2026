import React, { useEffect, useState } from 'react';
import { PlateWatchlistItem } from '../types';
import { api } from '../services/api';
import { Car, Plus, Trash2, ShieldAlert, CheckCircle2 } from 'lucide-react';

export const ANPRPage: React.FC = () => {
  const [watchlist, setWatchlist] = useState<PlateWatchlistItem[]>([]);
  const [newPlate, setNewPlate] = useState('');
  const [newCategory, setNewCategory] = useState('STOLEN');
  const [newReason, setNewReason] = useState('');
  const [loading, setLoading] = useState(false);

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
      await api.addPlateWatchlist({
        id: newPlate.trim(),
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

  return (
    <div className="flex-1 flex flex-col h-full overflow-hidden p-6 space-y-6">
      {/* Header */}
      <div className="glass-panel p-5 rounded-xl border border-gray-800 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="p-3 rounded-lg bg-blue-600/20 border border-blue-500/40 text-blue-400">
            <Car className="w-6 h-6" />
          </div>
          <div>
            <h2 className="text-base font-bold text-slate-100 uppercase tracking-wider">
              Automatic Number Plate Recognition (ANPR) & Hotlist Engine
            </h2>
            <p className="text-xs text-slate-400">
              Indian registration format validation (Standard, Bharat BH, Military) + OCR & Watchlist Interception
            </p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 flex-1 min-h-0">
        {/* Add Plate Form */}
        <div className="glass-panel p-5 rounded-xl border border-gray-800 flex flex-col space-y-4">
          <h3 className="text-xs font-bold uppercase tracking-wider text-slate-200 flex items-center gap-2">
            <Plus className="w-4 h-4 text-blue-400" />
            Add Vehicle to Watchlist
          </h3>

          <form onSubmit={handleAdd} className="space-y-3 text-xs">
            <div>
              <label className="block text-slate-400 mb-1">REGISTRATION NUMBER (INDIAN STANDARD)</label>
              <input
                type="text"
                placeholder="e.g. DL01AB1234, UP32BZ9999"
                value={newPlate}
                onChange={(e) => setNewPlate(e.target.value.toUpperCase())}
                className="w-full bg-gray-900 border border-gray-700 rounded-lg px-3 py-2 text-slate-100 font-mono"
                required
              />
            </div>

            <div>
              <label className="block text-slate-400 mb-1">ALERT CATEGORY</label>
              <select
                value={newCategory}
                onChange={(e) => setNewCategory(e.target.value)}
                className="w-full bg-gray-900 border border-gray-700 rounded-lg px-3 py-2 text-slate-100"
              >
                <option value="STOLEN">STOLEN VEHICLE</option>
                <option value="WANTED">WANTED / SMUGGLING SUSPECT</option>
                <option value="SUSPICIOUS">SUSPICIOUS NIGHT SIGHTINGS</option>
                <option value="HIGH_RISK">HIGH RISK BORDER VEHICLE</option>
              </select>
            </div>

            <div>
              <label className="block text-slate-400 mb-1">INTELLIGENCE BRIEF / REASON</label>
              <textarea
                placeholder="Details, FIR number, or border intelligence note..."
                value={newReason}
                onChange={(e) => setNewReason(e.target.value)}
                rows={3}
                className="w-full bg-gray-900 border border-gray-700 rounded-lg px-3 py-2 text-slate-100"
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-2.5 rounded-lg bg-blue-600 hover:bg-blue-500 text-white font-bold transition-all shadow-md"
            >
              {loading ? 'ENROLLING...' : 'ENROLL INTO HOTLIST'}
            </button>
          </form>
        </div>

        {/* Watchlist Table */}
        <div className="lg:col-span-2 glass-panel rounded-xl overflow-hidden border border-gray-800 flex flex-col">
          <div className="px-4 py-3 bg-gray-900/80 border-b border-gray-800 flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-200">
              Active Interception Hotlist
            </span>
            <span className="text-xs text-slate-400 font-mono">{watchlist.length} ENROLLED VEHICLES</span>
          </div>

          <div className="overflow-x-auto flex-1">
            <table className="w-full text-left text-xs">
              <thead className="bg-gray-950 text-slate-400 font-mono border-b border-gray-800">
                <tr>
                  <th className="p-3">LICENSE PLATE</th>
                  <th className="p-3">CATEGORY</th>
                  <th className="p-3">REASON / BRIEF</th>
                  <th className="p-3">ENROLLED</th>
                  <th className="p-3 text-right">ACTION</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-800 font-mono">
                {watchlist.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="p-6 text-center text-slate-500">
                      No vehicles currently enrolled in watchlist.
                    </td>
                  </tr>
                ) : (
                  watchlist.map((item) => (
                    <tr key={item.id} className="hover:bg-gray-800/40 transition-colors">
                      <td className="p-3 font-bold text-amber-400 text-sm tracking-wider">
                        {item.id}
                      </td>
                      <td className="p-3">
                        <span className="px-2 py-0.5 rounded bg-red-950/60 text-red-400 border border-red-800 text-[10px] font-bold">
                          {item.category}
                        </span>
                      </td>
                      <td className="p-3 text-slate-300">{item.reason || '—'}</td>
                      <td className="p-3 text-slate-400 text-[11px]">
                        {new Date(item.created_at).toLocaleDateString()}
                      </td>
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
    </div>
  );
};
