import React, { useEffect, useState } from 'react';
import { FaceWatchlistItem } from '../types';
import { api } from '../services/api';
import {
  UserCheck,
  Plus,
  Trash2,
  ShieldAlert,
  Fingerprint,
  Search,
  Sparkles,
  User,
  Sliders,
} from 'lucide-react';
import { FaceEnrollModal } from '../components/face/FaceEnrollModal';
import { BiometricMatcherStudio } from '../components/face/BiometricMatcherStudio';

export const FaceRecognitionPage: React.FC = () => {
  const [watchlist, setWatchlist] = useState<FaceWatchlistItem[]>([]);
  const [enrollModalOpen, setEnrollModalOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');

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

  const handleEnroll = async (faceData: {
    id: string;
    name: string;
    category: string;
    notes?: string;
    embedding: number[];
  }) => {
    await api.addFaceWatchlist(faceData);
    await fetchWatchlist();
  };

  const handleRemove = async (id: string) => {
    try {
      await api.removeFaceWatchlist(id);
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
      item.name.toLowerCase().includes(term) ||
      item.category.toLowerCase().includes(term) ||
      (item.notes && item.notes.toLowerCase().includes(term))
    );
  });

  return (
    <div className="flex-1 flex flex-col h-full overflow-y-auto p-6 space-y-6">
      {/* Header */}
      <div className="glass-panel p-5 rounded-xl border border-gray-800 flex flex-wrap items-center justify-between gap-4 select-none">
        <div className="flex items-center gap-3">
          <div className="p-3 rounded-lg bg-blue-600/20 border border-blue-500/40 text-blue-400">
            <UserCheck className="w-6 h-6" />
          </div>
          <div>
            <h2 className="text-base font-bold text-slate-100 uppercase tracking-wider">
              Facial Recognition System (FRS) & Suspect Biometric Watchlist
            </h2>
            <p className="text-xs text-slate-400">
              SCRFD Face Detector + 512-dim ArcFace Feature Embedding & Cosine Similarity Distance Matching
            </p>
          </div>
        </div>

        <button
          onClick={() => setEnrollModalOpen(true)}
          className="flex items-center gap-2 px-4 py-2.5 rounded-lg bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold font-mono transition-all shadow-lg"
        >
          <Plus className="w-4 h-4" />
          ENROLL NEW SUSPECT POI
        </button>
      </div>

      {/* 1:N Biometric Matcher Studio Component */}
      <BiometricMatcherStudio watchlist={watchlist} />

      {/* Suspect Gallery / Watchlist Table */}
      <div className="glass-panel rounded-xl overflow-hidden border border-gray-800 flex flex-col">
        <div className="px-4 py-3.5 bg-gray-900/80 border-b border-gray-800 flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <Fingerprint className="w-4 h-4 text-cyan-400" />
            <span className="text-xs font-bold uppercase tracking-wider text-slate-200">
              Enrolled Biometric Profiles ({filtered.length})
            </span>
          </div>

          <div className="relative">
            <Search className="w-3.5 h-3.5 text-slate-500 absolute left-2.5 top-2" />
            <input
              type="text"
              placeholder="Search suspect name, dossier ID..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="bg-gray-950 border border-gray-700 rounded-lg pl-8 pr-3 py-1 text-slate-200 text-xs font-mono outline-none w-64"
            />
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-gray-950 text-slate-400 font-mono border-b border-gray-800">
              <tr>
                <th className="p-3">SUSPECT DOSSIER ID</th>
                <th className="p-3">FULL NAME / ALIAS</th>
                <th className="p-3">THREAT CATEGORY</th>
                <th className="p-3">ARCFACE EMBEDDING</th>
                <th className="p-3">INTELLIGENCE DOSSIER</th>
                <th className="p-3 text-right">ACTION</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-800 font-mono">
              {filtered.length === 0 ? (
                <tr>
                  <td colSpan={6} className="p-8 text-center text-slate-500">
                    No suspect profiles matching query.
                  </td>
                </tr>
              ) : (
                filtered.map((item) => (
                  <tr key={item.id} className="hover:bg-gray-800/40 transition-colors">
                    <td className="p-3 font-bold text-cyan-400">{item.id}</td>
                    <td className="p-3 font-bold text-slate-100">{item.name}</td>
                    <td className="p-3">
                      <span
                        className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                          item.category === 'WANTED'
                            ? 'bg-red-950/60 text-red-400 border border-red-800'
                            : item.category === 'AUTHORIZED'
                            ? 'bg-emerald-950/60 text-emerald-400 border border-emerald-800'
                            : 'bg-amber-950/60 text-amber-400 border border-amber-800'
                        }`}
                      >
                        {item.category}
                      </span>
                    </td>
                    <td className="p-3 text-emerald-400 text-[10px]">
                      512-dim Float32 Vector (Stored)
                    </td>
                    <td className="p-3 text-slate-400 max-w-sm truncate">{item.notes || '—'}</td>
                    <td className="p-3 text-right">
                      <button
                        onClick={() => handleRemove(item.id)}
                        className="p-1.5 rounded hover:bg-red-500/20 text-red-400 transition-colors"
                        title="Remove suspect from active watchlist"
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

      {/* Suspect Enrollment Modal */}
      <FaceEnrollModal
        isOpen={enrollModalOpen}
        onClose={() => setEnrollModalOpen(false)}
        onEnroll={handleEnroll}
      />
    </div>
  );
};
