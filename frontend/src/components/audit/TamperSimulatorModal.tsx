import React, { useState } from 'react';
import { AuditRecord, AuditVerificationResult } from '../../types';
import { X, AlertTriangle, ShieldAlert, CheckCircle2, RefreshCw, Sparkles, Lock } from 'lucide-react';
import { verifyAuditChainClientSide } from '../../utils/hashUtils';

interface TamperSimulatorModalProps {
  chain: AuditRecord[];
  isOpen: boolean;
  onClose: () => void;
}

export const TamperSimulatorModal: React.FC<TamperSimulatorModalProps> = ({
  chain,
  isOpen,
  onClose,
}) => {
  if (!isOpen) return null;

  const [selectedSeq, setSelectedSeq] = useState<number>(chain[1]?.sequence_id || 2);
  const [tamperedAction, setTamperedAction] = useState<string>('DELETED_LOG_ENTRY_BY_INTRUDER');
  const [testResult, setTestResult] = useState<AuditVerificationResult | null>(null);
  const [isVerifying, setIsVerifying] = useState(false);

  const handleSimulateTamper = async () => {
    setIsVerifying(true);
    // Create a modified copy of the chain
    const modifiedChain: AuditRecord[] = chain.map((rec) => {
      if (rec.sequence_id === selectedSeq) {
        return {
          ...rec,
          action: tamperedAction,
          payload_digest: 'tampered_payload_digest_00000000000000000000000000000000',
        };
      }
      return rec;
    });

    const res = await verifyAuditChainClientSide(modifiedChain);
    setTestResult(res);
    setIsVerifying(false);
  };

  const handleResetVerification = async () => {
    setIsVerifying(true);
    const res = await verifyAuditChainClientSide(chain);
    setTestResult(res);
    setIsVerifying(false);
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-4">
      <div className="glass-panel w-full max-w-xl rounded-2xl border border-gray-700 shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="px-5 py-4 bg-gray-900/90 border-b border-gray-800 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-red-600/20 text-red-400 border border-red-500/30">
              <AlertTriangle className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-slate-100 uppercase tracking-wider">
                Audit Chain Tamper Detection Simulator
              </h3>
              <p className="text-xs text-slate-400">
                Simulate adversarial log alteration to test cryptographic break detection
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
        <div className="p-5 space-y-4 overflow-y-auto text-xs font-mono">
          <div className="p-3 rounded-lg bg-gray-900 border border-gray-800 space-y-2">
            <label className="block text-slate-400 text-[11px]">
              SELECT AUDIT BLOCK TO CORRUPT:
            </label>
            <select
              value={selectedSeq}
              onChange={(e) => setSelectedSeq(Number(e.target.value))}
              className="w-full bg-gray-950 border border-gray-700 rounded-lg px-3 py-2 text-cyan-400"
            >
              {chain.map((c) => (
                <option key={c.sequence_id} value={c.sequence_id}>
                  Block #{c.sequence_id} — {c.action} ({c.target_resource})
                </option>
              ))}
            </select>

            <label className="block text-slate-400 text-[11px] mt-2">
              ALTERED PAYLOAD CONTENT (SIMULATED MALICIOUS MODIFICATION):
            </label>
            <input
              type="text"
              value={tamperedAction}
              onChange={(e) => setTamperedAction(e.target.value)}
              className="w-full bg-gray-950 border border-gray-700 rounded-lg px-3 py-2 text-red-300"
            />
          </div>

          {/* Buttons */}
          <div className="grid grid-cols-2 gap-3">
            <button
              onClick={handleSimulateTamper}
              disabled={isVerifying}
              className="py-2.5 px-3 rounded-lg bg-red-600 hover:bg-red-500 text-white font-bold transition-all flex items-center justify-center gap-2 shadow-lg"
            >
              <AlertTriangle className="w-4 h-4" />
              INJECT TAMPER & VERIFY
            </button>

            <button
              onClick={handleResetVerification}
              disabled={isVerifying}
              className="py-2.5 px-3 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white font-bold transition-all flex items-center justify-center gap-2 shadow-lg"
            >
              <CheckCircle2 className="w-4 h-4" />
              VERIFY UNTOUCHED CHAIN
            </button>
          </div>

          {/* Verification Result */}
          {testResult && (
            <div
              className={`p-4 rounded-xl border animate-in fade-in ${
                testResult.is_valid
                  ? 'bg-emerald-950/30 border-emerald-500/50 text-emerald-300'
                  : 'bg-red-950/30 border-red-500/60 text-red-300'
              }`}
            >
              <div className="flex items-start gap-3">
                {testResult.is_valid ? (
                  <CheckCircle2 className="w-5 h-5 text-emerald-400 flex-shrink-0 mt-0.5" />
                ) : (
                  <ShieldAlert className="w-5 h-5 text-red-400 flex-shrink-0 mt-0.5" />
                )}
                <div className="space-y-1">
                  <p className="font-bold text-xs">
                    {testResult.is_valid
                      ? 'INTEGRITY CONFIRMED: VALID CHAIN'
                      : `CORRUPTION FLAGGED AT BLOCK #${testResult.corrupted_sequence_id}`}
                  </p>
                  <p className="text-[11px] leading-relaxed opacity-90">{testResult.message}</p>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
