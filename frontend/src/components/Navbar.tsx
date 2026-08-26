import React, { useEffect, useState } from 'react';
import { Shield, AlertTriangle, Radio, Activity, Clock, Lock } from 'lucide-react';
import { DashboardSummary } from '../types';

interface NavbarProps {
  summary: DashboardSummary | null;
}

export const Navbar: React.FC<NavbarProps> = ({ summary }) => {
  const [timeStr, setTimeStr] = useState<string>('');

  useEffect(() => {
    const update = () => {
      const now = new Date();
      setTimeStr(now.toUTCString().replace('GMT', 'UTC'));
    };
    update();
    const timer = setInterval(update, 1000);
    return () => clearInterval(timer);
  }, []);

  const getThreatBadge = () => {
    const level = summary?.threat_level || 'NORMAL';
    if (level === 'ELEVATED') {
      return (
        <span className="flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-red-500/20 text-red-400 border border-red-500/40 animate-pulse-fast">
          <span className="w-2 h-2 rounded-full bg-red-500"></span>
          THREAT: ELEVATED
        </span>
      );
    }
    if (level === 'MODERATE') {
      return (
        <span className="flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-amber-500/20 text-amber-400 border border-amber-500/40">
          <span className="w-2 h-2 rounded-full bg-amber-500"></span>
          THREAT: MODERATE
        </span>
      );
    }
    return (
      <span className="flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-emerald-500/20 text-emerald-400 border border-emerald-500/40">
        <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
        THREAT: NORMAL
      </span>
    );
  };

  return (
    <header className="h-16 border-b border-gray-800 bg-tactical-panel/90 backdrop-blur-md flex items-center justify-between px-6 z-20 select-none">
      <div className="flex items-center gap-4">
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-lg bg-blue-600/20 border border-blue-500/40 text-blue-400">
            <Shield className="w-6 h-6" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-lg font-bold tracking-wider text-slate-100 uppercase">IBVAP</h1>
              <span className="text-xs px-2 py-0.5 rounded bg-gray-800 border border-gray-700 text-cyan-400 font-mono">
                SIH26187
              </span>
            </div>
            <p className="text-[11px] text-slate-400">Intelligent Border Video Analytics Platform • SSB</p>
          </div>
        </div>

        <div className="h-6 w-px bg-gray-800 mx-2 hidden md:block" />

        <div className="hidden lg:flex items-center gap-2 px-3 py-1 rounded-md bg-gray-900 border border-gray-800 text-xs">
          <Radio className="w-3.5 h-3.5 text-cyan-400 animate-pulse" />
          <span className="text-slate-400">SECTOR:</span>
          <span className="font-mono text-slate-200 font-semibold">BOP-DHARCHULA-01 (IN-NP)</span>
        </div>
      </div>

      <div className="flex items-center gap-4">
        {getThreatBadge()}

        <div className="hidden sm:flex items-center gap-2 px-3 py-1 rounded-md bg-gray-900 border border-gray-800 text-xs text-slate-300 font-mono">
          <Clock className="w-3.5 h-3.5 text-slate-400" />
          <span>{timeStr || 'SYNCING...'}</span>
        </div>

        <div className="flex items-center gap-2 pl-2 border-l border-gray-800">
          <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-blue-600 to-cyan-500 flex items-center justify-center text-xs font-bold text-white shadow-lg">
            HQ
          </div>
          <div className="hidden xl:block text-left">
            <p className="text-xs font-semibold text-slate-200 leading-none">Commander</p>
            <p className="text-[10px] text-emerald-400 font-mono">AUTHENTICATED</p>
          </div>
        </div>
      </div>
    </header>
  );
};
