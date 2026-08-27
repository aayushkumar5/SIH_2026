import React, { useEffect, useState } from 'react';
import {
  Shield,
  Radio,
  Clock,
  Volume2,
  VolumeX,
  User as UserIcon,
  LogOut,
  ChevronDown,
  Sparkles,
  Server,
  Zap,
} from 'lucide-react';
import { DashboardSummary, UserRole } from '../../types';
import { useAuth } from '../../hooks/useAuth';
import { useAudioAlarm } from '../../hooks/useAudioAlarm';
import { getRoleBadgeClass } from '../../utils/formatters';

interface NavbarProps {
  summary: DashboardSummary | null;
  onOpenLoginModal?: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({ summary, onOpenLoginModal }) => {
  const { user, logout, switchDemoRole } = useAuth();
  const { isSoundEnabled, toggleSound } = useAudioAlarm();
  const [timeStr, setTimeStr] = useState<string>('');
  const [showRoleMenu, setShowRoleMenu] = useState<boolean>(false);

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
    if (level === 'CRITICAL') {
      return (
        <span className="flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-red-500/20 text-red-400 border border-red-500/50 animate-pulse-fast">
          <span className="w-2 h-2 rounded-full bg-red-500"></span>
          THREAT: CRITICAL
        </span>
      );
    }
    if (level === 'ELEVATED') {
      return (
        <span className="flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-red-500/20 text-red-400 border border-red-500/40">
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
    <header className="h-16 border-b border-gray-800 bg-tactical-panel/90 backdrop-blur-md flex items-center justify-between px-6 z-30 select-none">
      {/* Brand & Sector info */}
      <div className="flex items-center gap-4">
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-lg bg-blue-600/20 border border-blue-500/40 text-blue-400">
            <Shield className="w-6 h-6" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-lg font-bold tracking-wider text-slate-100 uppercase">IBVAP</h1>
              <span className="text-[10px] px-2 py-0.5 rounded bg-blue-950 border border-blue-800 text-cyan-300 font-mono font-bold">
                SSB • SIH-2026
              </span>
            </div>
            <p className="text-[11px] text-slate-400">
              Intelligent Border Video Analytics Platform • Sashastra Seema Bal
            </p>
          </div>
        </div>

        <div className="h-6 w-px bg-gray-800 mx-2 hidden md:block" />

        <div className="hidden lg:flex items-center gap-2 px-3 py-1 rounded-md bg-gray-900 border border-gray-800 text-xs">
          <Radio className="w-3.5 h-3.5 text-cyan-400 animate-pulse" />
          <span className="text-slate-400">SECTOR:</span>
          <span className="font-mono text-slate-200 font-semibold">BOP-DHARCHULA-01 (IN-NP BORDER)</span>
        </div>
      </div>

      {/* Right Controls */}
      <div className="flex items-center gap-4">
        {/* Threat Level */}
        {getThreatBadge()}

        {/* Tactical Sound Toggle */}
        <button
          onClick={toggleSound}
          title={isSoundEnabled ? 'Audio Alert Chime Enabled' : 'Audio Alert Chime Muted'}
          className={`p-2 rounded-lg border transition-all ${
            isSoundEnabled
              ? 'bg-blue-600/20 border-blue-500/40 text-blue-400 hover:bg-blue-600/30'
              : 'bg-gray-800 border-gray-700 text-slate-500 hover:bg-gray-700'
          }`}
        >
          {isSoundEnabled ? <Volume2 className="w-4 h-4" /> : <VolumeX className="w-4 h-4" />}
        </button>

        {/* Live Clock */}
        <div className="hidden sm:flex items-center gap-2 px-3 py-1 rounded-md bg-gray-900 border border-gray-800 text-xs text-slate-300 font-mono">
          <Clock className="w-3.5 h-3.5 text-slate-400" />
          <span>{timeStr || 'SYNCING UTC...'}</span>
        </div>

        {/* User Profile & Demo Switcher */}
        <div className="relative pl-2 border-l border-gray-800">
          <button
            onClick={() => setShowRoleMenu(!showRoleMenu)}
            className="flex items-center gap-2.5 p-1 rounded-lg hover:bg-gray-800/60 transition-colors"
          >
            <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-blue-600 to-cyan-500 flex items-center justify-center text-xs font-bold text-white shadow-md">
              {user?.role ? user.role.slice(0, 2) : 'HQ'}
            </div>
            <div className="hidden xl:block text-left">
              <p className="text-xs font-semibold text-slate-200 leading-none">
                {user?.full_name || 'BOP Commander'}
              </p>
              <div className="flex items-center gap-1.5 mt-0.5">
                <span className={`text-[9px] px-1.5 py-0.2 rounded font-mono ${getRoleBadgeClass(user?.role || 'COMMANDER')}`}>
                  {user?.role || 'COMMANDER'}
                </span>
              </div>
            </div>
            <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
          </button>

          {/* Role Switcher Menu */}
          {showRoleMenu && (
            <div className="absolute right-0 mt-2 w-64 glass-panel rounded-xl border border-gray-700 shadow-2xl p-2 z-50 text-xs font-sans animate-in fade-in slide-in-from-top-2 duration-150">
              <div className="px-3 py-2 border-b border-gray-800">
                <p className="text-[10px] uppercase font-bold text-slate-500 tracking-wider">
                  Active Operator Profile
                </p>
                <p className="text-xs font-bold text-slate-200 mt-0.5">{user?.full_name}</p>
                <p className="text-[11px] text-slate-400 font-mono">{user?.email}</p>
              </div>

              <div className="py-1">
                <p className="px-3 py-1.5 text-[10px] uppercase font-bold text-slate-500 tracking-wider">
                  Switch Demo Role
                </p>
                <button
                  onClick={() => {
                    switchDemoRole('COMMANDER');
                    setShowRoleMenu(false);
                  }}
                  className={`w-full text-left px-3 py-2 rounded-lg flex items-center justify-between hover:bg-gray-800 transition-colors ${
                    user?.role === 'COMMANDER' ? 'text-blue-400 font-bold bg-blue-950/40' : 'text-slate-300'
                  }`}
                >
                  <span>Commander (Full Control)</span>
                  <span className="text-[10px] px-1.5 py-0.5 rounded bg-red-950 text-red-400 font-mono">HQ</span>
                </button>
                <button
                  onClick={() => {
                    switchDemoRole('OPERATOR');
                    setShowRoleMenu(false);
                  }}
                  className={`w-full text-left px-3 py-2 rounded-lg flex items-center justify-between hover:bg-gray-800 transition-colors ${
                    user?.role === 'OPERATOR' ? 'text-blue-400 font-bold bg-blue-950/40' : 'text-slate-300'
                  }`}
                >
                  <span>Operator (Live Triage)</span>
                  <span className="text-[10px] px-1.5 py-0.5 rounded bg-blue-950 text-blue-400 font-mono">OPS</span>
                </button>
                <button
                  onClick={() => {
                    switchDemoRole('AUDITOR');
                    setShowRoleMenu(false);
                  }}
                  className={`w-full text-left px-3 py-2 rounded-lg flex items-center justify-between hover:bg-gray-800 transition-colors ${
                    user?.role === 'AUDITOR' ? 'text-blue-400 font-bold bg-blue-950/40' : 'text-slate-300'
                  }`}
                >
                  <span>Auditor (Read & Chain Verify)</span>
                  <span className="text-[10px] px-1.5 py-0.5 rounded bg-cyan-950 text-cyan-400 font-mono">AUD</span>
                </button>
              </div>

              <div className="pt-1 border-t border-gray-800">
                <button
                  onClick={() => {
                    logout();
                    setShowRoleMenu(false);
                    if (onOpenLoginModal) onOpenLoginModal();
                  }}
                  className="w-full text-left px-3 py-2 rounded-lg flex items-center gap-2 text-red-400 hover:bg-red-950/30 transition-colors"
                >
                  <LogOut className="w-3.5 h-3.5" />
                  <span>Log Out / Switch Session</span>
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </header>
  );
};
