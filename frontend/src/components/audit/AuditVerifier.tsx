import React, { useState } from 'react';
import { AuditRecord, AuditVerificationResult } from '../../types';
import { api } from '../../services/api';
import { verifyAuditChainClientSide } from '../../utils/hashUtils';
import {
  CheckCircle2,
  FileCheck,
  Lock,
  RefreshCw,
  ShieldAlert,
  Sparkles,
  AlertTriangle,
  FileText,
  Search,
} from 'lucide-react';
import { HashChainVisualizer } from './HashChainVisualizer';
import { TamperSimulatorModal } from './TamperSimulatorModal';
import { formatTimestamp } from '../../utils/formatters';

interface AuditVerifierProps {
  chain: AuditRecord[];
  onRefresh: () => void;
}

export const AuditVerifier: React.FC<AuditVerifierProps> = ({ chain, onRefresh }) => {
  const [verifying, setVerifying] = useState(false);
  const [result, setResult] = useState<AuditVerificationResult | null>(null);
  const [tamperModalOpen, setTamperModalOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');

  const handleVerify = async () => {
    setVerifying(true);
    try {
      // Run both server API check and client-side SHA-256 verification
      const clientRes = await verifyAuditChainClientSide(chain);
      setResult(clientRes);
    } catch (e) {
      console.error(e);
    } finally {
      setVerifying(false);
    }
  };

  const filtered = chain.filter((rec) => {
    if (!searchTerm) return true;
    const term = searchTerm.toLowerCase();
    return (
      rec.event_id.toLowerCase().includes(term) ||
      rec.action.toLowerCase().includes(term) ||
      rec.target_resource.toLowerCase().includes(term) ||
      rec.actor.toLowerCase().includes(term)
    );
  });

  return (
    <div className="space-y-6">
      {/* Integrity Verification Action Banner */}
      <div className="glass-panel p-5 rounded-xl border border-gray-800 flex flex-col md:flex-row items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <div className="p-3 rounded-lg bg-cyan-600/20 border border-cyan-500/40 text-cyan-400">
            <Lock className="w-6 h-6" />
          </div>
          <div>
            <h3 className="text-base font-bold text-slate-100 flex items-center gap-2">
              Tamper-Evident SHA-256 Cryptographic Audit Ledger
              <span className="text-[10px] px-2 py-0.5 rounded bg-cyan-950/80 border border-cyan-800 text-cyan-300 font-mono">
                MATHEMATICALLY LINKED
              </span>
            </h3>
            <p className="text-xs text-slate-400">
              Each recorded operational event is hashed and chained: H(n) = SHA256(Record(n) || H(n-1)).
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={() => setTamperModalOpen(true)}
            className="flex items-center gap-2 px-3.5 py-2 rounded-lg bg-red-950/50 hover:bg-red-950/80 text-red-300 border border-red-500/40 text-xs font-bold font-mono transition-all"
          >
            <AlertTriangle className="w-4 h-4 text-red-400" />
            SIMULATE TAMPERING
          </button>

          <button
            onClick={handleVerify}
            disabled={verifying}
            className="flex items-center gap-2 px-4 py-2 rounded-lg bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-500 hover:to-cyan-500 text-white text-xs font-bold shadow-lg transition-all"
          >
            <RefreshCw className={`w-4 h-4 ${verifying ? 'animate-spin' : ''}`} />
            {verifying ? 'VERIFYING CHAIN...' : 'VERIFY INTEGRITY'}
          </button>
        </div>
      </div>

      {/* Verification Result Dialog / Alert */}
      {result && (
        <div
          className={`p-4 rounded-xl border animate-in fade-in ${
            result.is_valid
              ? 'bg-emerald-950/30 border-emerald-500/50 text-emerald-300'
              : 'bg-red-950/30 border-red-500/60 text-red-300'
          } flex items-center justify-between`}
        >
          <div className="flex items-center gap-3">
            {result.is_valid ? (
              <CheckCircle2 className="w-5 h-5 text-emerald-400 flex-shrink-0" />
            ) : (
              <ShieldAlert className="w-5 h-5 text-red-400 flex-shrink-0" />
            )}
            <div>
              <p className="text-xs font-bold font-mono">
                {result.is_valid
                  ? 'INTEGRITY VERIFIED: ZERO ANOMALIES / ZERO TAMPERING DETECTED'
                  : 'CHAIN CORRUPTED'}
              </p>
              <p className="text-xs opacity-90">{result.message}</p>
            </div>
          </div>
          <span className="text-xs font-mono px-3 py-1 rounded bg-black/40 border border-gray-700">
            {result.verified_records} / {result.total_records} BLOCKS VALIDATED
          </span>
        </div>
      )}

      {/* Horizontal Flowing Hash Chain Visualizer */}
      <HashChainVisualizer records={chain} />

      {/* Audit Blocks Table */}
      <div className="glass-panel rounded-xl overflow-hidden border border-gray-800 flex flex-col">
        <div className="px-4 py-3 bg-gray-900/80 border-b border-gray-800 flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <FileCheck className="w-4 h-4 text-cyan-400" />
            <span className="text-xs font-bold uppercase tracking-wider text-slate-200">
              Immutable Evidential Audit Trail Log
            </span>
          </div>

          <div className="flex items-center gap-3 text-xs">
            <input
              type="text"
              placeholder="Filter by action, actor, resource..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="bg-gray-950 border border-gray-700 rounded-lg px-3 py-1 text-slate-200 w-56 font-mono outline-none text-xs"
            />
            <span className="text-xs text-slate-400 font-mono">
              {filtered.length} TOTAL AUDITED BLOCKS
            </span>
          </div>
        </div>

        <div className="overflow-x-auto flex-1">
          <table className="w-full text-left text-xs">
            <thead className="bg-gray-950 text-slate-400 font-mono border-b border-gray-800 sticky top-0">
              <tr>
                <th className="p-3">SEQ #</th>
                <th className="p-3">TIMESTAMP</th>
                <th className="p-3">ACTOR</th>
                <th className="p-3">ACTION</th>
                <th className="p-3">TARGET RESOURCE</th>
                <th className="p-3">PREVIOUS HASH (Hn-1)</th>
                <th className="p-3">CURRENT BLOCK HASH (Hn)</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-800 font-mono">
              {filtered.map((rec) => (
                <tr key={rec.sequence_id} className="hover:bg-gray-800/40 transition-colors">
                  <td className="p-3 font-bold text-cyan-400">#{rec.sequence_id}</td>
                  <td className="p-3 text-slate-300">
                    {formatTimestamp(rec.timestamp)}
                  </td>
                  <td className="p-3 text-slate-300 font-bold">{rec.actor}</td>
                  <td className="p-3">
                    <span className="px-2 py-0.5 rounded bg-blue-950 text-blue-300 border border-blue-800 text-[10px]">
                      {rec.action}
                    </span>
                  </td>
                  <td className="p-3 text-cyan-300 font-bold">{rec.target_resource}</td>
                  <td className="p-3 text-slate-500 text-[10px]" title={rec.previous_hash}>
                    {rec.previous_hash.slice(0, 10)}...{rec.previous_hash.slice(-6)}
                  </td>
                  <td className="p-3 text-emerald-400 font-bold text-[10px]" title={rec.current_hash}>
                    {rec.current_hash.slice(0, 10)}...{rec.current_hash.slice(-6)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Tamper Simulator Modal */}
      <TamperSimulatorModal
        chain={chain}
        isOpen={tamperModalOpen}
        onClose={() => setTamperModalOpen(false)}
      />
    </div>
  );
};
