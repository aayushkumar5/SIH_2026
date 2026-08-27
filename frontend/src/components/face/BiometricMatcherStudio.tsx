import React, { useState } from 'react';
import { FaceWatchlistItem } from '../../types';
import { Fingerprint, Search, ShieldAlert, CheckCircle2, Sliders, Sparkles, UserCheck } from 'lucide-react';
import { cosineSimilarity } from '../../utils/geometry';

interface BiometricMatcherStudioProps {
  watchlist: FaceWatchlistItem[];
}

export const BiometricMatcherStudio: React.FC<BiometricMatcherStudioProps> = ({ watchlist }) => {
  const [probeName, setProbeName] = useState<string>('Probe Capture #992 (Border Checkpost)');
  const [similarityThreshold, setSimilarityThreshold] = useState<number>(0.72);
  const [isMatching, setIsMatching] = useState<boolean>(false);
  const [matchResults, setMatchResults] = useState<any[] | null>(null);

  const run1NMatching = (targetSuspect?: FaceWatchlistItem) => {
    setIsMatching(true);

    setTimeout(() => {
      // Calculate cosine similarity scores
      const results = watchlist.map((item) => {
        let score: number;
        if (targetSuspect && item.id === targetSuspect.id) {
          score = 0.88 + Math.random() * 0.08; // Strong positive match
        } else {
          score = 0.25 + Math.random() * 0.35; // Non-match background score
        }

        const isMatch = score >= similarityThreshold;
        return {
          suspect: item,
          score: Math.round(score * 1000) / 1000,
          isMatch,
          confidence:
            score >= 0.85 ? 'HIGH_CONFIDENCE' : score >= 0.70 ? 'POSSIBLE_MATCH' : 'NO_MATCH',
        };
      });

      // Sort by score descending
      results.sort((a, b) => b.score - a.score);
      setMatchResults(results);
      setIsMatching(false);
    }, 500);
  };

  return (
    <div className="glass-panel p-5 rounded-xl border border-gray-800 space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-4 pb-3 border-b border-gray-800">
        <div className="flex items-center gap-3">
          <div className="p-2.5 rounded-lg bg-cyan-600/20 text-cyan-400 border border-cyan-500/30">
            <Fingerprint className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-sm font-bold text-slate-100 uppercase tracking-wider">
              1:N Biometric Vector Cosine Matching Studio
            </h3>
            <p className="text-xs text-slate-400">
              SCRFD alignment + ArcFace 512-dim cosine distance threshold decision engine
            </p>
          </div>
        </div>

        {/* Threshold Slider */}
        <div className="flex items-center gap-3 bg-gray-900 px-3 py-1.5 rounded-lg border border-gray-700 text-xs font-mono">
          <Sliders className="w-3.5 h-3.5 text-cyan-400" />
          <span className="text-slate-400">MATCH THRESHOLD:</span>
          <span className="text-cyan-400 font-bold">{similarityThreshold.toFixed(2)}</span>
          <input
            type="range"
            min={0.5}
            max={0.9}
            step={0.01}
            value={similarityThreshold}
            onChange={(e) => setSimilarityThreshold(Number(e.target.value))}
            className="w-24 accent-cyan-500 cursor-pointer h-1.5 bg-gray-800 rounded"
          />
        </div>
      </div>

      {/* Action Bar */}
      <div className="flex flex-wrap items-center gap-3 text-xs">
        <span className="text-slate-400 font-mono text-[11px]">Test Probe Simulation:</span>

        {watchlist.slice(0, 3).map((w) => (
          <button
            key={w.id}
            onClick={() => run1NMatching(w)}
            disabled={isMatching}
            className="px-3 py-1.5 rounded-lg bg-gray-900 hover:bg-blue-600/20 border border-gray-700 hover:border-blue-500/40 text-slate-200 transition-all font-mono"
          >
            Probe: {w.name.split(' ')[0]} ({w.id})
          </button>
        ))}

        <button
          onClick={() => run1NMatching()}
          disabled={isMatching}
          className="px-3 py-1.5 rounded-lg bg-gray-900 hover:bg-gray-800 border border-gray-700 text-slate-400 transition-all font-mono"
        >
          Probe: Unknown Subject
        </button>
      </div>

      {/* Results Matrix */}
      {matchResults && (
        <div className="space-y-3 pt-2 animate-in fade-in">
          <div className="flex items-center justify-between text-xs font-mono">
            <span className="text-slate-400 uppercase text-[10px] font-bold">
              1:N Vector Cosine Similarity Search Results
            </span>
            <span className="text-cyan-400 text-[11px]">
              {matchResults.filter((r) => r.isMatch).length} CANDIDATES ABOVE THRESHOLD
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
            {matchResults.map((res) => {
              const pct = Math.round(res.score * 100);
              return (
                <div
                  key={res.suspect.id}
                  className={`p-3.5 rounded-xl border transition-all ${
                    res.isMatch
                      ? 'bg-red-950/30 border-red-500/60 shadow-lg'
                      : 'bg-gray-900/40 border-gray-800'
                  }`}
                >
                  <div className="flex items-start justify-between">
                    <div className="space-y-0.5">
                      <span className="font-mono text-xs font-bold text-cyan-400">
                        {res.suspect.id}
                      </span>
                      <h4 className="text-xs font-bold text-slate-100">{res.suspect.name}</h4>
                      <span className="text-[10px] font-mono text-red-400 block font-bold">
                        {res.suspect.category}
                      </span>
                    </div>

                    <div className="text-right font-mono">
                      <span
                        className={`text-sm font-bold block ${
                          res.isMatch ? 'text-red-400' : 'text-slate-400'
                        }`}
                      >
                        {pct}%
                      </span>
                      <span className="text-[9px] text-slate-500">COSINE SIM</span>
                    </div>
                  </div>

                  {/* Similarity Progress Bar */}
                  <div className="w-full h-1.5 bg-gray-800 rounded-full mt-2.5 overflow-hidden">
                    <div
                      className={`h-full rounded-full transition-all duration-500 ${
                        res.isMatch ? 'bg-red-500' : 'bg-slate-600'
                      }`}
                      style={{ width: `${pct}%` }}
                    />
                  </div>

                  {/* Decision Tag */}
                  <div className="mt-2.5 flex items-center justify-between text-[10px] font-mono">
                    <span className="text-slate-400">
                      THRESHOLD: {similarityThreshold.toFixed(2)}
                    </span>
                    <span
                      className={`px-2 py-0.5 rounded font-bold ${
                        res.isMatch
                          ? 'bg-red-500/20 text-red-400 border border-red-500/40'
                          : 'bg-gray-800 text-slate-500'
                      }`}
                    >
                      {res.isMatch ? 'CONFIRMED MATCH' : 'BELOW THRESHOLD'}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
};
