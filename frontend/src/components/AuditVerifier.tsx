import React, { useState } from 'react';
import { AuditRecord, AuditVerificationResult } from '../types';
import { api } from '../services/api';
import { CheckCircle2, FileCheck, Lock, RefreshCw, ShieldAlert, Sparkles } from 'lucide-react';

interface AuditVerifierProps {
  chain: AuditRecord[];
  onRefresh: () => void;
}

export const AuditVerifier: React.FC<AuditVerifierProps> = ({ chain, onRefresh }) => {
  const [verifying, setVerifying] = useState(false);
  const [result, setResult] = useState<AuditVerificationResult | null>(null);

  const handleVerify = async () => {
    setVerifying(true);
    try {
      const res = await api.verifyAuditIntegrity();
      setResult(res);
    } catch (e) {
      console.error(e);
    } finally {
      setVerifying(false);
    }
  };

  return (
    <div className="space-y-4">
      {/* Integrity Verification Action Banner */}
      <div className="glass-panel p-5 rounded-xl border border-gray-800 flex flex-col md:flex-row items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <div className="p-3 rounded-lg bg-cyan-600/20 border border-cyan-500/40 text-cyan-400">
            <Lock className="w-6 h-6" />
          </div>
          <div>
            <h3 className="text-base font-bold text-slate-100 flex items-center gap-2">
              Cryptographic SHA-256 Tamper-Evident Audit Ledger
              <span className="text-[10px] px-2 py-0.5 rounded bg-cyan-950/80 border border-cyan-800 text-cyan-300 font-mono">
                BLOCKCHAIN & CYBERSECURITY THEME
              </span>
            </h3>
            <p className="text-xs text-slate-400">
              Each recorded security event is mathematically hashed and linked: H(n) = SHA256(Record(n) || H(n-1)).
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={handleVerify}
            disabled={verifying}
            className="flex items-center gap-2 px-4 py-2.5 rounded-lg bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-500 hover:to-cyan-500 text-white text-xs font-bold shadow-lg transition-all"
          >
            <RefreshCw className={`w-4 h-4 ${verifying ? 'animate-spin' : ''}`} />
            {verifying ? 'VERIFYING HASH CHAIN...' : 'VERIFY FULL CHAIN INTEGRITY'}
          </button>
        </div>
      </div>

      {/* Verification Result Dialog / Alert */}
      {result && (
        <div
          className={`p-4 rounded-xl border ${
            result.is_valid
              ? 'bg-emerald-950/20 border-emerald-500/40 text-emerald-300'
              : 'bg-red-950/20 border-red-500/40 text-red-300'
          } flex items-center justify-between`}
        >
          <div className="flex items-center gap-3">
            {result.is_valid ? (
              <CheckCircle2 className="w-5 h-5 text-emerald-400" />
            ) : (
              <ShieldAlert className="w-5 h-5 text-red-400" />
            )}
            <div>
              <p className="text-xs font-bold font-mono">
                {result.is_valid ? 'INTEGRITY VERIFIED: ZERO TAMPERING DETECTED' : 'INTEGRITY CORRUPTED'}
              </p>
              <p className="text-xs opacity-90">{result.message}</p>
            </div>
          </div>
          <span className="text-xs font-mono px-3 py-1 rounded bg-black/40 border border-gray-700">
            {result.verified_records} / {result.total_records} BLOCKS VALIDATED
          </span>
        </div>
      )}

      {/* Audit Blocks Table */}
      <div className="glass-panel rounded-xl overflow-hidden border border-gray-800">
        <div className="px-4 py-3 bg-gray-900/80 border-b border-gray-800 flex items-center justify-between">
          <span className="text-xs font-bold uppercase tracking-wider text-slate-200">
            Immutable Audit Trail Log
          </span>
          <span className="text-xs text-slate-400 font-mono">
            {chain.length} TOTAL AUDITED EVENTS
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-gray-950 text-slate-400 font-mono border-b border-gray-800">
              <tr>
                <th className="p-3">SEQ #</th>
                <th className="p-3">TIMESTAMP</th>
                <th className="p-3">ACTOR</th>
                <th className="p-3">ACTION</th>
                <th className="p-3">RESOURCE</th>
                <th className="p-3">PREVIOUS HASH (Hn-1)</th>
                <th className="p-3">BLOCK HASH (Hn)</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-800 font-mono">
              {chain.map((rec) => (
                <tr key={rec.sequence_id} className="hover:bg-gray-800/40 transition-colors">
                  <td className="p-3 font-bold text-cyan-400">#{rec.sequence_id}</td>
                  <td className="p-3 text-slate-300">
                    {new Date(rec.timestamp).toLocaleTimeString()}
                  </td>
                  <td className="p-3 text-slate-400">{rec.actor}</td>
                  <td className="p-3">
                    <span className="px-2 py-0.5 rounded bg-blue-900/40 text-blue-300 border border-blue-800 text-[10px]">
                      {rec.action}
                    </span>
                  </td>
                  <td className="p-3 text-slate-400">{rec.target_resource}</td>
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
    </div>
  );
};
