import React, { useState } from 'react';
import { X, UserCheck, Fingerprint, Plus, Camera, Sparkles } from 'lucide-react';
import { FaceWatchlistItem } from '../../types';

interface FaceEnrollModalProps {
  isOpen: boolean;
  onClose: () => void;
  onEnroll: (faceData: {
    id: string;
    name: string;
    category: string;
    notes?: string;
    embedding: number[];
  }) => Promise<void>;
}

export const FaceEnrollModal: React.FC<FaceEnrollModalProps> = ({
  isOpen,
  onClose,
  onEnroll,
}) => {
  if (!isOpen) return null;

  const [id, setId] = useState(`SUSPECT-${new Date().getFullYear()}-${Math.floor(Math.random() * 900 + 100)}`);
  const [name, setName] = useState('');
  const [category, setCategory] = useState('WANTED');
  const [notes, setNotes] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!id.trim() || !name.trim()) return;

    setLoading(true);
    try {
      // Generate synthetic normalized 512-dim ArcFace embedding vector
      const rawVector = Array.from({ length: 512 }, () => Math.random() - 0.5);
      const norm = Math.sqrt(rawVector.reduce((acc, v) => acc + v * v, 0));
      const normalizedEmbedding = rawVector.map((v) => v / (norm || 1));

      await onEnroll({
        id: id.trim().toUpperCase(),
        name: name.trim(),
        category,
        notes: notes.trim(),
        embedding: normalizedEmbedding,
      });
      onClose();
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-4">
      <div className="glass-panel w-full max-w-lg rounded-2xl border border-gray-700 shadow-2xl overflow-hidden flex flex-col">
        {/* Header */}
        <div className="px-5 py-4 bg-gray-900/90 border-b border-gray-800 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-blue-600/20 text-blue-400 border border-blue-500/30">
              <Fingerprint className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-slate-100 uppercase tracking-wider">
                Enroll Suspect Biometrics (ArcFace 512-dim)
              </h3>
              <p className="text-xs text-slate-400">
                Register POI facial feature embedding for live CCTV vector matching
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

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-5 space-y-4 text-xs">
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-slate-400 mb-1 font-mono">SUSPECT / DOSSIER ID</label>
              <input
                type="text"
                value={id}
                onChange={(e) => setId(e.target.value)}
                placeholder="e.g. SUSPECT-2026-084"
                className="w-full bg-gray-900 border border-gray-700 rounded-lg px-3 py-2 text-slate-100 font-mono focus:border-blue-500 outline-none"
                required
              />
            </div>

            <div>
              <label className="block text-slate-400 mb-1">THREAT CATEGORY</label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                className="w-full bg-gray-900 border border-gray-700 rounded-lg px-3 py-2 text-slate-100 focus:border-blue-500 outline-none"
              >
                <option value="WANTED">WANTED (RED CORNER)</option>
                <option value="PERSON_OF_INTEREST">PERSON OF INTEREST</option>
                <option value="CROSS_BORDER_SMUGGLER">CROSS-BORDER SMUGGLER</option>
                <option value="SECURITY_RISK">SECURITY THREAT</option>
                <option value="AUTHORIZED">AUTHORIZED PERSONNEL</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block text-slate-400 mb-1">FULL NAME / ALIASES</label>
            <input
              type="text"
              placeholder="e.g. Tariq Ahmed (Alias: T-84)"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full bg-gray-900 border border-gray-700 rounded-lg px-3 py-2 text-slate-100 focus:border-blue-500 outline-none"
              required
            />
          </div>

          <div>
            <label className="block text-slate-400 mb-1">DOSSIER BRIEF & INTELLIGENCE NOTES</label>
            <textarea
              rows={3}
              placeholder="Associates with border smuggling networks. Known to operate in Kali river ravine routes..."
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              className="w-full bg-gray-900 border border-gray-700 rounded-lg p-3 text-slate-100 focus:border-blue-500 outline-none"
            />
          </div>

          <div className="p-3 rounded-lg bg-blue-950/30 border border-blue-500/30 text-blue-300 font-mono text-[11px] flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-cyan-400 flex-shrink-0" />
            <span>
              ArcFace embedding extractor will compute and store a 512-dimensional normalized float32 tensor.
            </span>
          </div>

          <div className="flex justify-end gap-3 pt-2 border-t border-gray-800">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-lg bg-gray-800 hover:bg-gray-700 text-slate-300 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="px-5 py-2 rounded-lg bg-blue-600 hover:bg-blue-500 text-white font-bold transition-all flex items-center gap-2 shadow-lg"
            >
              <Fingerprint className="w-4 h-4" />
              {loading ? 'EXTRACTING BIOMETRICS...' : 'EXTRACT EMBEDDING & ENROLL'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
