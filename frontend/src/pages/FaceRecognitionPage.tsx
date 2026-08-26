import React, { useEffect, useState } from 'react';
import { FaceWatchlistItem } from '../types';
import { api } from '../services/api';
import { UserCheck, Plus, Trash2, ShieldAlert, Fingerprint } from 'lucide-react';

export const FaceRecognitionPage: React.FC = () => {
  const [watchlist, setWatchlist] = useState<FaceWatchlistItem[]>([]);
  const [name, setName] = useState('');
  const [suspectId, setSuspectId] = useState('');
  const [category, setCategory] = useState('WANTED');
  const [notes, setNotes] = useState('');
  const [loading, setLoading] = useState(false);

  const fetchWatchlist = async () => {
    try {
      const data = await api.getFaceWatchlist();
      setWatchlist(data);
    } catch (e) {
      console.error(e);
    }
  };

  useEffect(() => {
    fetchWatchlist();
  }, []);

  const handleEnroll = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !suspectId.trim()) return;
    setLoading(true);
    try {
      // Generate synthetic 512-dim normalized embedding
      const randomVec = Array.from({ length: 512 }, () => Math.random() - 0.5);
      const norm = Math.sqrt(randomVec.reduce((acc, v) => acc + v * v, 0));
      const normalizedEmbedding = randomVec.map((v) => v / (norm || 1));

      await api.addFaceWatchlist({
        id: suspectId.trim(),
        name: name.trim(),
        category,
        notes: notes.trim(),
        embedding: normalizedEmbedding,
      });

      setName('');
      setSuspectId('');
      setNotes('');
      await fetchWatchlist();
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const handleRemove = async (id: string) => {
    try {
      await api.removeFaceWatchlist(id);
      await fetchWatchlist();
    } catch (e) {
      console.error(e);
    }
  };

  return (
    <div className="flex-1 flex flex-col h-full overflow-hidden p-6 space-y-6">
      <div className="glass-panel p-5 rounded-xl border border-gray-800 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="p-3 rounded-lg bg-blue-600/20 border border-blue-500/40 text-blue-400">
            <UserCheck className="w-6 h-6" />
          </div>
          <div>
            <h2 className="text-base font-bold text-slate-100 uppercase tracking-wider">
              Facial Recognition System (FRS) & Biometric Suspect Watchlist
            </h2>
            <p className="text-xs text-slate-400">
              SCRFD Face Detector + 512-dim ArcFace Feature Embedding & Cosine Similarity Distance Matching
            </p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 flex-1 min-h-0">
        {/* Enroll Form */}
        <div className="glass-panel p-5 rounded-xl border border-gray-800 flex flex-col space-y-4">
          <h3 className="text-xs font-bold uppercase tracking-wider text-slate-200 flex items-center gap-2">
            <Plus className="w-4 h-4 text-blue-400" />
            Enroll Suspect / POI into Biometric Watchlist
          </h3>

          <form onSubmit={handleEnroll} className="space-y-3 text-xs">
            <div>
              <label className="block text-slate-400 mb-1">DOSSIER / SUSPECT ID</label>
              <input
                type="text"
                placeholder="e.g. SUSPECT-2026-084"
                value={suspectId}
                onChange={(e) => setSuspectId(e.target.value.toUpperCase())}
                className="w-full bg-gray-900 border border-gray-700 rounded-lg px-3 py-2 text-slate-100 font-mono"
                required
              />
            </div>

            <div>
              <label className="block text-slate-400 mb-1">FULL NAME / ALIAS</label>
              <input
                type="text"
                placeholder="e.g. Tariq Ahmed / S. Khan"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full bg-gray-900 border border-gray-700 rounded-lg px-3 py-2 text-slate-100"
                required
              />
            </div>

            <div>
              <label className="block text-slate-400 mb-1">THREAT CLASSIFICATION</label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                className="w-full bg-gray-900 border border-gray-700 rounded-lg px-3 py-2 text-slate-100"
              >
                <option value="WANTED">WANTED / RED CORNER NOTICE</option>
                <option value="PERSON_OF_INTEREST">PERSON OF INTEREST (POI)</option>
                <option value="CROSS_BORDER_SMUGGLER">CROSS-BORDER SMUGGLER</option>
                <option value="SECURITY_RISK">SECURITY THREAT</option>
              </select>
            </div>

            <div>
              <label className="block text-slate-400 mb-1">INTELLIGENCE DOSSIER / NOTES</label>
              <textarea
                placeholder="Identifying marks, associated cross-border gangs..."
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                rows={3}
                className="w-full bg-gray-900 border border-gray-700 rounded-lg px-3 py-2 text-slate-100"
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-2.5 rounded-lg bg-blue-600 hover:bg-blue-500 text-white font-bold transition-all shadow-md flex items-center justify-center gap-2"
            >
              <Fingerprint className="w-4 h-4" />
              {loading ? 'ENROLLING BIOMETRICS...' : 'EXTRACT EMBEDDING & ENROLL'}
            </button>
          </form>
        </div>

        {/* Watchlist Table */}
        <div className="lg:col-span-2 glass-panel rounded-xl overflow-hidden border border-gray-800 flex flex-col">
          <div className="px-4 py-3 bg-gray-900/80 border-b border-gray-800 flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-200">
              Active Biometric Watchlist Profiles
            </span>
            <span className="text-xs text-slate-400 font-mono">{watchlist.length} IDENTITIES ENROLLED</span>
          </div>

          <div className="overflow-x-auto flex-1">
            <table className="w-full text-left text-xs">
              <thead className="bg-gray-950 text-slate-400 font-mono border-b border-gray-800">
                <tr>
                  <th className="p-3">SUSPECT ID</th>
                  <th className="p-3">NAME</th>
                  <th className="p-3">CATEGORY</th>
                  <th className="p-3">DOSSIER NOTES</th>
                  <th className="p-3 text-right">ACTION</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-800 font-mono">
                {watchlist.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="p-6 text-center text-slate-500">
                      No suspects currently enrolled in facial watchlist.
                    </td>
                  </tr>
                ) : (
                  watchlist.map((item) => (
                    <tr key={item.id} className="hover:bg-gray-800/40 transition-colors">
                      <td className="p-3 font-bold text-cyan-400">{item.id}</td>
                      <td className="p-3 font-bold text-slate-200">{item.name}</td>
                      <td className="p-3">
                        <span className="px-2 py-0.5 rounded bg-red-950/60 text-red-400 border border-red-800 text-[10px] font-bold">
                          {item.category}
                        </span>
                      </td>
                      <td className="p-3 text-slate-400">{item.notes || '—'}</td>
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
