import React from 'react';
import { AuditRecord } from '../../types';
import { Lock, ArrowRight, ShieldCheck, FileText, CheckCircle2 } from 'lucide-react';
import { formatTimeOnly } from '../../utils/formatters';

interface HashChainVisualizerProps {
  records: AuditRecord[];
}

export const HashChainVisualizer: React.FC<HashChainVisualizerProps> = ({ records }) => {
  const displayRecords = records.slice(0, 5);

  return (
    <div className="glass-panel p-5 rounded-xl border border-gray-800 space-y-4">
      <div className="flex items-center justify-between pb-3 border-b border-gray-800">
        <div className="flex items-center gap-2.5">
          <Lock className="w-5 h-5 text-cyan-400" />
          <div>
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-100">
              Cryptographic SHA-256 Block Linkage Chain
            </h3>
            <p className="text-[11px] text-slate-400">
              Each block mathematically incorporates the previous block's SHA-256 digest: H(n) = SHA256(Record(n) || H(n-1))
            </p>
          </div>
        </div>
        <span className="text-[10px] px-2 py-0.5 rounded bg-cyan-950/80 border border-cyan-800 text-cyan-300 font-mono">
          IMMUTABLE LEDGER
        </span>
      </div>

      {/* Horizontal Flowing Block Chain */}
      <div className="overflow-x-auto pb-2">
        <div className="flex items-center gap-3 min-w-max">
          {displayRecords.map((rec, idx) => (
            <React.Fragment key={rec.sequence_id}>
              {/* Single Block Card */}
              <div className="w-64 glass-card p-3.5 rounded-xl border border-gray-700/80 space-y-2 relative group hover:border-cyan-500/50 transition-all font-mono">
                {/* Header */}
                <div className="flex items-center justify-between border-b border-gray-800 pb-1.5 text-xs">
                  <span className="text-cyan-400 font-bold">BLOCK #{rec.sequence_id}</span>
                  <span className="text-[10px] text-slate-400">{formatTimeOnly(rec.timestamp)}</span>
                </div>

                {/* Body details */}
                <div className="space-y-1 text-[11px]">
                  <div className="flex justify-between text-slate-400">
                    <span>ACTION:</span>
                    <span className="text-slate-200 font-bold truncate max-w-[130px]">{rec.action}</span>
                  </div>
                  <div className="flex justify-between text-slate-400">
                    <span>RESOURCE:</span>
                    <span className="text-slate-200">{rec.target_resource}</span>
                  </div>
                </div>

                {/* Cryptographic Link Hashes */}
                <div className="pt-2 border-t border-gray-800/80 space-y-1 text-[9.5px]">
                  <div className="space-y-0.5">
                    <span className="text-slate-500 block">PREV HASH (Hn-1):</span>
                    <span className="text-slate-400 block truncate" title={rec.previous_hash}>
                      {rec.previous_hash.slice(0, 12)}...{rec.previous_hash.slice(-6)}
                    </span>
                  </div>

                  <div className="space-y-0.5">
                    <span className="text-emerald-500 block font-bold">BLOCK HASH (Hn):</span>
                    <span className="text-emerald-400 block font-bold truncate" title={rec.current_hash}>
                      {rec.current_hash.slice(0, 12)}...{rec.current_hash.slice(-6)}
                    </span>
                  </div>
                </div>
              </div>

              {/* Arrow Connector */}
              {idx < displayRecords.length - 1 && (
                <div className="flex flex-col items-center justify-center text-cyan-400 flex-shrink-0">
                  <ArrowRight className="w-5 h-5 animate-pulse" />
                  <span className="text-[8px] font-mono text-slate-500">SHA-256</span>
                </div>
              )}
            </React.Fragment>
          ))}
        </div>
      </div>
    </div>
  );
};
