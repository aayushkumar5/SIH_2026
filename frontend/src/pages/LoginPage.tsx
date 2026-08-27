import React, { useState } from 'react';
import { Shield, Lock, User as UserIcon, LogIn, Sparkles, CheckCircle2, AlertCircle } from 'lucide-react';
import { useAuth } from '../hooks/useAuth';
import { UserRole } from '../types';

interface LoginPageProps {
  onSuccess?: () => void;
}

export const LoginPage: React.FC<LoginPageProps> = ({ onSuccess }) => {
  const { login, switchDemoRole } = useAuth();
  const [username, setUsername] = useState('commander');
  const [password, setPassword] = useState('ssb@border2026');
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!username.trim()) return;

    setLoading(true);
    setErrorMsg('');
    try {
      const success = await login(username.trim(), password);
      if (success) {
        if (onSuccess) onSuccess();
      } else {
        setErrorMsg('Invalid military credentials or unauthorized station login.');
      }
    } catch {
      setErrorMsg('Login failed. Please check network or use quick access roles.');
    } finally {
      setLoading(false);
    }
  };

  const handleQuickRole = (role: UserRole) => {
    switchDemoRole(role);
    if (onSuccess) onSuccess();
  };

  return (
    <div className="min-h-screen w-full bg-tactical-bg bg-[radial-gradient(ellipse_80%_80%_at_50%_-20%,rgba(59,130,246,0.15),rgba(255,255,255,0))] flex flex-col items-center justify-center p-4 select-none">
      <div className="w-full max-w-md glass-panel rounded-2xl border border-gray-700 shadow-2xl p-8 space-y-6 relative overflow-hidden">
        {/* Top Glow Bar */}
        <div className="absolute top-0 inset-x-0 h-1 bg-gradient-to-r from-blue-600 via-cyan-400 to-indigo-600" />

        {/* Branding */}
        <div className="text-center space-y-2">
          <div className="inline-flex p-3 rounded-xl bg-blue-600/20 text-blue-400 border border-blue-500/30 mb-1 shadow-lg">
            <Shield className="w-8 h-8" />
          </div>
          <h1 className="text-xl font-bold tracking-wider text-slate-100 uppercase">
            IBVAP Terminal Access
          </h1>
          <p className="text-xs text-slate-400 font-mono">
            Sashastra Seema Bal (SSB) • Intelligent Border Video Analytics Platform
          </p>
          <span className="inline-block text-[10px] px-2 py-0.5 rounded bg-gray-900 border border-gray-700 text-cyan-400 font-mono">
            SECTOR: BOP-DHARCHULA-01 (IN-NP)
          </span>
        </div>

        {/* Error Notification */}
        {errorMsg && (
          <div className="p-3 rounded-lg bg-red-950/60 border border-red-500/60 text-red-300 text-xs flex items-center gap-2">
            <AlertCircle className="w-4 h-4 flex-shrink-0" />
            <span>{errorMsg}</span>
          </div>
        )}

        {/* Login Form */}
        <form onSubmit={handleLogin} className="space-y-4 text-xs">
          <div>
            <label className="block text-slate-400 mb-1 font-mono">OPERATOR USERNAME</label>
            <div className="relative">
              <UserIcon className="w-4 h-4 text-slate-500 absolute left-3 top-2.5" />
              <input
                type="text"
                placeholder="commander / operator1"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                className="w-full bg-gray-950 border border-gray-700 rounded-lg pl-9 pr-3 py-2 text-slate-100 focus:border-blue-500 outline-none font-mono"
                required
              />
            </div>
          </div>

          <div>
            <label className="block text-slate-400 mb-1 font-mono">STATION PASSPHRASE</label>
            <div className="relative">
              <Lock className="w-4 h-4 text-slate-500 absolute left-3 top-2.5" />
              <input
                type="password"
                placeholder="••••••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full bg-gray-950 border border-gray-700 rounded-lg pl-9 pr-3 py-2 text-slate-100 focus:border-blue-500 outline-none font-mono"
                required
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-2.5 rounded-lg bg-blue-600 hover:bg-blue-500 text-white font-bold transition-all flex items-center justify-center gap-2 shadow-lg shadow-blue-600/30"
          >
            <LogIn className="w-4 h-4" />
            {loading ? 'AUTHENTICATING MILITARY SESSION...' : 'ACCESS TACTICAL CONSOLE'}
          </button>
        </form>

        {/* Quick Role Selectors for instant demonstration */}
        <div className="space-y-2 pt-2 border-t border-gray-800">
          <p className="text-[10px] uppercase font-bold text-slate-500 text-center tracking-wider">
            Quick Evaluation Access Roles
          </p>
          <div className="grid grid-cols-3 gap-2">
            <button
              onClick={() => handleQuickRole('COMMANDER')}
              className="py-2 px-1 rounded-lg bg-gray-900 hover:bg-red-950/40 border border-gray-800 hover:border-red-500/40 text-[11px] font-mono text-red-400 transition-all font-bold"
            >
              Commander
            </button>
            <button
              onClick={() => handleQuickRole('OPERATOR')}
              className="py-2 px-1 rounded-lg bg-gray-900 hover:bg-blue-950/40 border border-gray-800 hover:border-blue-500/40 text-[11px] font-mono text-blue-400 transition-all font-bold"
            >
              Operator
            </button>
            <button
              onClick={() => handleQuickRole('AUDITOR')}
              className="py-2 px-1 rounded-lg bg-gray-900 hover:bg-cyan-950/40 border border-gray-800 hover:border-cyan-500/40 text-[11px] font-mono text-cyan-400 transition-all font-bold"
            >
              Auditor
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
