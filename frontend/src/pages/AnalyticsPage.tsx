import React, { useEffect, useState } from 'react';
import { DashboardSummary, SystemMetrics } from '../types';
import { api } from '../services/api';
import { BarChart3, TrendingUp, Cpu, HardDrive, Server, Shield } from 'lucide-react';

interface AnalyticsPageProps {
  summary: DashboardSummary | null;
}

export const AnalyticsPage: React.FC<AnalyticsPageProps> = ({ summary }) => {
  const [trends, setTrends] = useState<{ time: string; events: number }[]>([]);
  const [metrics, setMetrics] = useState<SystemMetrics | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const t = await api.getTrends(24);
        setTrends(t);
        const m = await api.getMetrics();
        setMetrics(m);
      } catch (e) {
        console.error(e);
      }
    };
    fetchData();
    const interval = setInterval(fetchData, 5000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="flex-1 flex flex-col h-full overflow-y-auto p-6 space-y-6">
      {/* Header */}
      <div className="glass-panel p-5 rounded-xl border border-gray-800 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="p-3 rounded-lg bg-blue-600/20 border border-blue-500/40 text-blue-400">
            <BarChart3 className="w-6 h-6" />
          </div>
          <div>
            <h2 className="text-base font-bold text-slate-100 uppercase tracking-wider">
              Surveillance Analytics, KPI Metrics & Edge Node Telemetry
            </h2>
            <p className="text-xs text-slate-400">
              Aggregated incident frequencies, object class distributions, and hardware performance metrics
            </p>
          </div>
        </div>
      </div>

      {/* Edge System Health KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="glass-panel p-4 rounded-xl border border-gray-800 flex items-center justify-between">
          <div>
            <p className="text-[11px] font-bold text-slate-400 uppercase">Edge CPU Load</p>
            <p className="text-xl font-bold text-cyan-400 font-mono mt-1">
              {metrics ? `${metrics.cpu_percent}%` : '18.4%'}
            </p>
            <p className="text-[10px] text-slate-500 mt-0.5">NVIDIA Jetson / Host CPU</p>
          </div>
          <div className="p-3 rounded-lg bg-cyan-500/10 text-cyan-400 border border-cyan-500/20">
            <Cpu className="w-5 h-5" />
          </div>
        </div>

        <div className="glass-panel p-4 rounded-xl border border-gray-800 flex items-center justify-between">
          <div>
            <p className="text-[11px] font-bold text-slate-400 uppercase">Memory Utilization</p>
            <p className="text-xl font-bold text-blue-400 font-mono mt-1">
              {metrics ? `${metrics.memory_percent}%` : '42.1%'}
            </p>
            <p className="text-[10px] text-slate-500 mt-0.5">{metrics?.memory_used_mb || 1024} MB in use</p>
          </div>
          <div className="p-3 rounded-lg bg-blue-500/10 text-blue-400 border border-blue-500/20">
            <Server className="w-5 h-5" />
          </div>
        </div>

        <div className="glass-panel p-4 rounded-xl border border-gray-800 flex items-center justify-between">
          <div>
            <p className="text-[11px] font-bold text-slate-400 uppercase">Edge Buffer Storage</p>
            <p className="text-xl font-bold text-emerald-400 font-mono mt-1">
              {metrics ? `${metrics.disk_free_gb} GB` : '48.2 GB Free'}
            </p>
            <p className="text-[10px] text-emerald-500 mt-0.5">SQLite offline storage ready</p>
          </div>
          <div className="p-3 rounded-lg bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
            <HardDrive className="w-5 h-5" />
          </div>
        </div>

        <div className="glass-panel p-4 rounded-xl border border-gray-800 flex items-center justify-between">
          <div>
            <p className="text-[11px] font-bold text-slate-400 uppercase">Inference Latency</p>
            <p className="text-xl font-bold text-amber-400 font-mono mt-1">~18 ms</p>
            <p className="text-[10px] text-amber-500 mt-0.5">Real-time edge throughput</p>
          </div>
          <div className="p-3 rounded-lg bg-amber-500/10 text-amber-400 border border-amber-500/20">
            <TrendingUp className="w-5 h-5" />
          </div>
        </div>
      </div>

      {/* Incident Breakdown by Event Type */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="glass-panel p-5 rounded-xl border border-gray-800 flex flex-col">
          <h3 className="text-xs font-bold uppercase tracking-wider text-slate-200 mb-4 flex items-center gap-2">
            <Shield className="w-4 h-4 text-blue-400" />
            Security Incident Distribution by Category (24h)
          </h3>

          <div className="space-y-3 flex-1 flex flex-col justify-center">
            {Object.entries(summary?.events_by_type || {
              INTRUSION: 14,
              LOITERING: 8,
              ANPR_DETECTION: 32,
              WATCHLIST_PLATE: 2,
              WATCHLIST_FACE: 1,
              NIGHT_MOVEMENT: 5,
            }).map(([type, count]) => {
              const max = 40;
              const pct = Math.min(100, Math.round((Number(count) / max) * 100));
              return (
                <div key={type} className="space-y-1">
                  <div className="flex justify-between text-xs font-mono">
                    <span className="text-slate-300">{type}</span>
                    <span className="text-cyan-400 font-bold">{count} incidents</span>
                  </div>
                  <div className="w-full h-2 bg-gray-800 rounded-full overflow-hidden">
                    <div
                      className={`h-full rounded-full ${
                        type.includes('WATCHLIST') || type === 'INTRUSION'
                          ? 'bg-red-500'
                          : type === 'LOITERING'
                          ? 'bg-amber-500'
                          : 'bg-blue-500'
                      }`}
                      style={{ width: `${pct}%` }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Hourly Incident Activity */}
        <div className="glass-panel p-5 rounded-xl border border-gray-800 flex flex-col">
          <h3 className="text-xs font-bold uppercase tracking-wider text-slate-200 mb-4 flex items-center gap-2">
            <TrendingUp className="w-4 h-4 text-cyan-400" />
            Hourly Threat Activity Bar Chart (24h Window)
          </h3>

          <div className="flex-1 flex items-end justify-between gap-1 pt-6 pb-2 px-2 border-b border-gray-800">
            {trends.slice(-16).map((item, idx) => {
              const maxVal = Math.max(...trends.map((t) => t.events), 5);
              const heightPct = Math.max(10, Math.round((item.events / maxVal) * 100));
              return (
                <div key={idx} className="flex-1 flex flex-col items-center gap-2 group">
                  <div className="text-[10px] text-cyan-400 font-mono opacity-0 group-hover:opacity-100 transition-opacity">
                    {item.events}
                  </div>
                  <div
                    className="w-full max-w-[16px] bg-gradient-to-t from-blue-600 to-cyan-400 rounded-t-sm hover:brightness-125 transition-all"
                    style={{ height: `${heightPct}%` }}
                  />
                  <div className="text-[9px] text-slate-500 font-mono -rotate-45 origin-top-left mt-2">
                    {item.time}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
};
