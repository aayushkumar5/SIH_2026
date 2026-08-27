import React, { useEffect, useState } from 'react';
import { User, UserRole } from '../types';
import { api } from '../services/api';
import { useAuth } from '../hooks/useAuth';
import {
  Users,
  Plus,
  Shield,
  CheckCircle2,
  XCircle,
  Lock,
  UserCheck,
  Sparkles,
  Key,
} from 'lucide-react';
import { formatTimestamp, getRoleBadgeClass } from '../utils/formatters';

export const UsersRolesPage: React.FC = () => {
  const { user: currentUser, switchDemoRole } = useAuth();
  const [users, setUsers] = useState<User[]>([]);
  const [modalOpen, setModalOpen] = useState(false);

  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('ssb@border2026');
  const [fullName, setFullName] = useState('');
  const [role, setRole] = useState<UserRole>('OPERATOR');
  const [loading, setLoading] = useState(false);

  const fetchUsers = async () => {
    try {
      const data = await api.getUsers();
      setUsers(data);
    } catch (e) {
      console.error(e);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!username.trim() || !email.trim() || !password.trim()) return;

    setLoading(true);
    try {
      await api.registerUser({
        username: username.trim(),
        email: email.trim(),
        password,
        full_name: fullName.trim(),
        role,
      });
      setUsername('');
      setEmail('');
      setFullName('');
      setModalOpen(false);
      await fetchUsers();
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const permissionsMatrix = [
    {
      feature: 'View Live CCTV Feeds & Multi-grid Video Wall',
      commander: true,
      operator: true,
      auditor: true,
    },
    {
      feature: 'Triage, Acknowledge & Resolve Security Alerts',
      commander: true,
      operator: true,
      auditor: false,
    },
    {
      feature: 'Deploy QRF Quick Reaction Force Interception',
      commander: true,
      operator: true,
      auditor: false,
    },
    {
      feature: 'Configure Geofence Zones & Tripwire Rules',
      commander: true,
      operator: true,
      auditor: false,
    },
    {
      feature: 'Manage ANPR Hotlist & Face Biometric Watchlist',
      commander: true,
      operator: true,
      auditor: false,
    },
    {
      feature: 'Register & Configure IP CCTV Camera Ingestion',
      commander: true,
      operator: false,
      auditor: false,
    },
    {
      feature: 'Cryptographic SHA-256 Audit Chain Verification',
      commander: true,
      operator: false,
      auditor: true,
    },
    {
      feature: 'System Settings & AI Model Threshold Adjustments',
      commander: true,
      operator: false,
      auditor: false,
    },
    {
      feature: 'Manage Operators & Access Permissions',
      commander: true,
      operator: false,
      auditor: false,
    },
  ];

  return (
    <div className="flex-1 flex flex-col h-full overflow-y-auto p-6 space-y-6">
      {/* Header */}
      <div className="glass-panel p-5 rounded-xl border border-gray-800 flex flex-wrap items-center justify-between gap-4 select-none">
        <div className="flex items-center gap-3">
          <div className="p-3 rounded-lg bg-blue-600/20 border border-blue-500/40 text-blue-400">
            <Users className="w-6 h-6" />
          </div>
          <div>
            <h2 className="text-base font-bold text-slate-100 uppercase tracking-wider">
              Border Out Post Personnel & Role-Based Access Control (RBAC)
            </h2>
            <p className="text-xs text-slate-400">
              Manage military security clearances, operator stations, and cryptographic auditor privileges
            </p>
          </div>
        </div>

        <button
          onClick={() => setModalOpen(true)}
          className="flex items-center gap-2 px-4 py-2.5 rounded-lg bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold font-mono transition-all shadow-lg"
        >
          <Plus className="w-4 h-4" />
          ENROLL STATION OPERATOR
        </button>
      </div>

      {/* Users Table */}
      <div className="glass-panel rounded-xl overflow-hidden border border-gray-800 flex flex-col">
        <div className="px-4 py-3 bg-gray-900/80 border-b border-gray-800 flex items-center justify-between">
          <span className="text-xs font-bold uppercase tracking-wider text-slate-200">
            Registered Station Personnel ({users.length})
          </span>
          <span className="text-xs text-slate-400 font-mono">
            ACTIVE SESSION: {currentUser?.username} ({currentUser?.role})
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-gray-950 text-slate-400 font-mono border-b border-gray-800">
              <tr>
                <th className="p-3">PERSONNEL ID</th>
                <th className="p-3">FULL NAME</th>
                <th className="p-3">USERNAME</th>
                <th className="p-3">OFFICIAL EMAIL</th>
                <th className="p-3">ASSIGNED ROLE</th>
                <th className="p-3">STATUS</th>
                <th className="p-3 text-right">QUICK SWITCH</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-800 font-mono">
              {users.map((u) => (
                <tr key={u.id} className="hover:bg-gray-800/40 transition-colors">
                  <td className="p-3 font-bold text-cyan-400">#{u.id}</td>
                  <td className="p-3 font-bold text-slate-100">{u.full_name || u.username}</td>
                  <td className="p-3 text-slate-300">{u.username}</td>
                  <td className="p-3 text-slate-400">{u.email}</td>
                  <td className="p-3">
                    <span className={`px-2 py-0.5 rounded text-[10px] ${getRoleBadgeClass(u.role)}`}>
                      {u.role}
                    </span>
                  </td>
                  <td className="p-3">
                    <span className="flex items-center gap-1.5 text-emerald-400 text-[11px]">
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse"></span>
                      ACTIVE
                    </span>
                  </td>
                  <td className="p-3 text-right">
                    <button
                      onClick={() => switchDemoRole(u.role)}
                      className="px-2.5 py-1 rounded bg-gray-900 hover:bg-blue-600/30 border border-gray-700 text-blue-300 text-[10px] transition-colors"
                    >
                      Assume Role
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* RBAC Permissions Matrix */}
      <div className="glass-panel p-5 rounded-xl border border-gray-800 space-y-4">
        <div className="flex items-center gap-2 pb-2 border-b border-gray-800">
          <Shield className="w-5 h-5 text-cyan-400" />
          <h3 className="text-xs font-bold uppercase tracking-wider text-slate-200">
            Role-Based Access Control (RBAC) Authority Matrix
          </h3>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs font-mono">
            <thead className="bg-gray-950 text-slate-400 border-b border-gray-800">
              <tr>
                <th className="p-3">OPERATIONAL PLATFORM PRIVILEGE</th>
                <th className="p-3 text-center text-red-400">COMMANDER (HQ)</th>
                <th className="p-3 text-center text-blue-400">DUTY OPERATOR</th>
                <th className="p-3 text-center text-cyan-400">INTEGRITY AUDITOR</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-800">
              {permissionsMatrix.map((row, idx) => (
                <tr key={idx} className="hover:bg-gray-800/30 transition-colors">
                  <td className="p-3 text-slate-300 font-sans text-xs">{row.feature}</td>
                  <td className="p-3 text-center">
                    {row.commander ? (
                      <CheckCircle2 className="w-4 h-4 text-emerald-400 inline" />
                    ) : (
                      <XCircle className="w-4 h-4 text-slate-600 inline" />
                    )}
                  </td>
                  <td className="p-3 text-center">
                    {row.operator ? (
                      <CheckCircle2 className="w-4 h-4 text-emerald-400 inline" />
                    ) : (
                      <XCircle className="w-4 h-4 text-slate-600 inline" />
                    )}
                  </td>
                  <td className="p-3 text-center">
                    {row.auditor ? (
                      <CheckCircle2 className="w-4 h-4 text-emerald-400 inline" />
                    ) : (
                      <XCircle className="w-4 h-4 text-slate-600 inline" />
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* User Registration Modal */}
      {modalOpen && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-4">
          <div className="glass-panel w-full max-w-md rounded-2xl border border-gray-700 shadow-2xl p-6 space-y-4">
            <h3 className="text-sm font-bold text-slate-100 uppercase tracking-wider">
              Enroll Station Personnel
            </h3>

            <form onSubmit={handleRegister} className="space-y-3 text-xs">
              <div>
                <label className="block text-slate-400 mb-1 font-mono">USERNAME</label>
                <input
                  type="text"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  className="w-full bg-gray-950 border border-gray-700 rounded-lg p-2 text-slate-100 font-mono outline-none"
                  required
                />
              </div>

              <div>
                <label className="block text-slate-400 mb-1">FULL NAME & RANK</label>
                <input
                  type="text"
                  placeholder="e.g. Sub-Inspector K. Rawat"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  className="w-full bg-gray-950 border border-gray-700 rounded-lg p-2 text-slate-100 outline-none"
                  required
                />
              </div>

              <div>
                <label className="block text-slate-400 mb-1 font-mono">EMAIL</label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full bg-gray-950 border border-gray-700 rounded-lg p-2 text-slate-100 font-mono outline-none"
                  required
                />
              </div>

              <div>
                <label className="block text-slate-400 mb-1 font-mono">ASSIGNED ROLE</label>
                <select
                  value={role}
                  onChange={(e) => setRole(e.target.value as UserRole)}
                  className="w-full bg-gray-950 border border-gray-700 rounded-lg p-2 text-slate-100 font-mono outline-none"
                >
                  <option value="OPERATOR">DUTY OPERATOR</option>
                  <option value="AUDITOR">INTEGRITY AUDITOR</option>
                  <option value="COMMANDER">SECTOR COMMANDER</option>
                </select>
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t border-gray-800">
                <button
                  type="button"
                  onClick={() => setModalOpen(false)}
                  className="px-3 py-1.5 rounded bg-gray-800 text-slate-300"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={loading}
                  className="px-4 py-1.5 rounded bg-blue-600 text-white font-bold"
                >
                  {loading ? 'ENROLLING...' : 'ENROLL PERSONNEL'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
