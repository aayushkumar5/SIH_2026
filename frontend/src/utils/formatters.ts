/**
 * Tactical UI Formatters
 */

import { Severity, UserRole } from '../types';

export function formatTimestamp(isoString: string | undefined): string {
  if (!isoString) return '—';
  try {
    const d = new Date(isoString);
    return d.toLocaleString('en-IN', {
      year: 'numeric',
      month: 'short',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
      hour12: false,
    });
  } catch {
    return isoString;
  }
}

export function formatTimeOnly(isoString: string | undefined): string {
  if (!isoString) return '—';
  try {
    const d = new Date(isoString);
    return d.toLocaleTimeString('en-IN', {
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
      hour12: false,
    });
  } catch {
    return isoString;
  }
}

export function getSeverityBadgeClass(severity: Severity): string {
  switch (severity) {
    case 'CRITICAL':
      return 'bg-red-500/20 text-red-400 border border-red-500/50 shadow-sm animate-pulse-fast';
    case 'HIGH':
      return 'bg-amber-500/20 text-amber-400 border border-amber-500/40 shadow-sm';
    case 'MEDIUM':
      return 'bg-yellow-500/20 text-yellow-300 border border-yellow-500/30';
    case 'LOW':
      return 'bg-blue-500/20 text-blue-300 border border-blue-500/30';
    default:
      return 'bg-slate-700/40 text-slate-300 border border-slate-600/40';
  }
}

export function getStatusBadgeClass(status: string): string {
  switch (status) {
    case 'ACTIVE':
      return 'bg-red-950/60 text-red-400 border border-red-800 font-bold';
    case 'ACKNOWLEDGED':
      return 'bg-amber-950/60 text-amber-400 border border-amber-800 font-bold';
    case 'RESOLVED':
      return 'bg-emerald-950/60 text-emerald-400 border border-emerald-800 font-bold';
    case 'DISMISSED':
      return 'bg-slate-900/60 text-slate-400 border border-slate-700 font-bold';
    default:
      return 'bg-gray-800 text-slate-300';
  }
}

export function getRoleBadgeClass(role: UserRole | string): string {
  switch (role) {
    case 'COMMANDER':
      return 'bg-gradient-to-r from-red-600 to-amber-600 text-white font-bold';
    case 'ADMIN':
      return 'bg-purple-600/30 text-purple-300 border border-purple-500/40 font-bold';
    case 'OPERATOR':
      return 'bg-blue-600/30 text-blue-300 border border-blue-500/40 font-bold';
    case 'AUDITOR':
      return 'bg-cyan-600/30 text-cyan-300 border border-cyan-500/40 font-bold';
    default:
      return 'bg-gray-800 text-slate-300';
  }
}
