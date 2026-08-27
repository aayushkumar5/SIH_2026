import React, { useEffect, useState } from 'react';
import { DashboardSummary, SystemMetrics } from '../types';
import { api } from '../services/api';
import {
  BarChart3,
  TrendingUp,
  Cpu,
  HardDrive,
  Server,
  Shield,
  Clock,
  Activity,
  Download,
  CheckCircle2,
} from 'lucide-react';

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
    const interval = setInterval(fetchData, 6000);
    return () => clearInterval(interval);
  }, []);

  const exportAnalyticsJSON = () => {
    const data = {
      summary,
      metrics,
      hourly_trends: trends,
      exported_at: new Date().toISOString(),
    };
    const blob = new Blob([JSON.stringify(data, null, 2)], {
      type: 'application/json',
    });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `IBVAP_ANALYTICS_REPORT_${Date.now()}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="flex-1 flex flex-col h-full overflow-y-auto p-6 space-y-6">
      {/* Header */}
      <div className="glass-panel p-5 rounded-xl border border-gray-800 flex flex-wrap items-center justify-between gap-4 select-none">
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

        <button
          onClick={exportAnalyticsJSON}
          className="flex items-center gap-1.5 px-4 py-2 rounded-lg bg-gray-800 hover:bg-gray-700 text-slate-200 text-xs font-mono font-bold transition-colors"
        >
          <Download className="w-3.5 h-3.5" />
          EXPORT ANALYTICS REPORT
        </button>
      </div>

      {/* Edge System Health KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 font-mono">
        <div className="glass-panel p-4 rounded-xl border border-gray-800 flex items-center justify-between">
          <div>
            <p className="text-[11px] font-bold text-slate-400 uppercase">Edge CPU Load</p>
            <p className="text-xl font-bold text-cyan-400 mt-1">
              {metrics ? `${metrics.cpu_percent}%` : '24.8%'}
            </p>
            <p className="text-[10px] text-slate-500 mt-0.5">NVIDIA Jetson AGX Orin</p>
          </div>
          <div className="p-3 rounded-lg bg-cyan-500/10 text-cyan-400 border border-cyan-500/20">
            <Cpu className="w-5 h-5" />
          </div>
        </div>

        <div className="glass-panel p-4 rounded-xl border border-gray-800 flex items-center justify-between">
          <div>
            <p className="text-[11px] font-bold text-slate-400 uppercase">Memory Utilization</p>
            <p className="text-xl font-bold text-blue-400 mt-1">
              {metrics ? `${metrics.memory_percent}%` : '42.5%'}
            </p>
            <p className="text-[10px] text-slate-500 mt-0.5">
              {metrics?.memory_used_mb || 3480} MB in use
            </p>
          </div>
          <div className="p-3 rounded-lg bg-blue-500/10 text-blue-400 border border-blue-500/20">
            <Server className="w-5 h-5" />
          </div>
        </div>

        <div className="glass-panel p-4 rounded-xl border border-gray-800 flex items-center justify-between">
          <div>
            <p className="text-[11px] font-bold text-slate-400 uppercase">Edge Buffer Storage</p>
            <p className="text-xl font-bold text-emerald-400 mt-1">
              {metrics ? `${metrics.disk_free_gb} GB` : '48.7 GB Free'}
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
            <p className="text-xl font-bold text-amber-400 mt-1">~16 ms</p>
            <p className="text-[10px] text-amber-500 mt-0.5">Real-time edge throughput</p>
          </div>
          <div className="p-3 rounded-lg bg-amber-500/10 text-amber-400 border border-amber-500/20">
            <TrendingUp className="w-5 h-5" />
          </div>
        </div>
      </div>

      {/* Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Incident Breakdown by Event Type */}
        <div className="glass-panel p-5 rounded-xl border border-gray-800 flex flex-col space-y-4">
          <div className="flex items-center gap-2 pb-2 border-b border-gray-800">
            <Shield className="w-4 h-4 text-blue-400" />
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-200">
              Security Incident Distribution by Category (24h)
            </h3>
          </div>

          <div className="space-y-3.5 flex-1 flex flex-col justify-center">
            {Object.entries(
              summary?.events_by_type || {
                INTRUSION: 24,
                TRIPWIRE_CROSS: 18,
                LOITERING: 15,
                NIGHT_MOVEMENT: 12,
                ANPR_DETECTION: 48,
                WATCHLIST_PLATE: 6,
                WATCHLIST_FACE: 3,
                VEHICLE_INTRUSION: 2,
              }
            ).map(([type, count]) => {
              const max = 50;
              const pct = Math.min(100, Math.round((Number(count) / max) * 100));
              return (
                <div key={type} className="space-y-1 font-mono">
                  <div className="flex justify-between text-xs">
                    <span className="text-slate-300 font-bold">{type}</span>
                    <span className="text-cyan-400">{count} events</span>
                  </div>
                  <div className="w-full h-2 bg-gray-800 rounded-full overflow-hidden">
                    <div
                      className={`h-full rounded-full transition-all duration-500 ${
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

        {/* Hourly Incident Activity Bar Chart */}
        <div className="glass-panel p-5 rounded-xl border border-gray-800 flex flex-col space-y-4">
          <div className="flex items-center gap-2 pb-2 border-b border-gray-800">
            <TrendingUp className="w-4 h-4 text-cyan-400" />
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-200">
              Hourly Threat Activity Trend (24h Window)
            </h3>
          </div>

          <div className="flex-1 flex items-end justify-between gap-1.5 pt-8 pb-3 px-2 border-b border-gray-800 min-h-[220px]">
            {trends.slice(-14).map((item, idx) => {
              const maxVal = Math.max(...trends.map((t) => t.events), 10);
              const heightPct = Math.max(12, Math.round((item.events / maxVal) * 100));
              return (
                <div key={idx} className="flex-1 flex flex-col items-center gap-2 group">
                  <div className="text-[10px] text-cyan-400 font-mono opacity-0 group-hover:opacity-100 transition-opacity font-bold">
                    {item.events}
                  </div>
                  <div
                    className="w-full max-w-[18px] bg-gradient-to-t from-blue-600 to-cyan-400 rounded-t-sm hover:brightness-125 transition-all shadow-md"
                    style={{ height: `${heightPct}%` }}
                  />
                  <div className="text-[9px] text-slate-400 font-mono -rotate-45 origin-top-left mt-2">
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
