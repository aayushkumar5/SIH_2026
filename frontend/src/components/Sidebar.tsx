import React from 'react';
import {
  LayoutDashboard,
  Tv,
  Bell,
  Search,
  Car,
  UserCheck,
  ShieldAlert,
  MapPin,
  BarChart3,
  FileCheck2,
} from 'lucide-react';

export type TabType =
  | 'dashboard'
  | 'live'
  | 'alerts'
  | 'investigation'
  | 'anpr'
  | 'faces'
  | 'zones'
  | 'audit'
  | 'analytics';

interface SidebarProps {
  activeTab: TabType;
  setActiveTab: (tab: TabType) => void;
  activeAlertsCount: number;
}

export const Sidebar: React.FC<SidebarProps> = ({ activeTab, setActiveTab, activeAlertsCount }) => {
  const navItems = [
    { id: 'dashboard', label: 'Command Overview', icon: LayoutDashboard },
    { id: 'live', label: 'Live Video Wall', icon: Tv },
    { id: 'alerts', label: 'Alert Center', icon: Bell, badge: activeAlertsCount },
    { id: 'investigation', label: 'Forensic Search', icon: Search },
    { id: 'anpr', label: 'ANPR & Vehicle ID', icon: Car },
    { id: 'faces', label: 'Face Recognition', icon: UserCheck },
    { id: 'zones', label: 'Zones & Fences', icon: ShieldAlert },
    { id: 'audit', label: 'Tamper Audit Chain', icon: FileCheck2 },
    { id: 'analytics', label: 'Analytics & Trends', icon: BarChart3 },
  ];

  return (
    <aside className="w-64 border-r border-gray-800 bg-tactical-panel/70 backdrop-blur-md flex flex-col justify-between select-none">
      <div className="p-4 space-y-1.5">
        <div className="px-3 py-2 text-[10px] font-bold tracking-widest text-slate-500 uppercase">
          Tactical Operations
        </div>
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = activeTab === item.id;
          return (
            <button
              key={item.id}
              onClick={() => setActiveTab(item.id as TabType)}
              className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-lg text-xs font-medium transition-all duration-150 ${
                isActive
                  ? 'bg-blue-600/20 text-blue-400 border border-blue-500/40 shadow-sm'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-gray-800/50'
              }`}
            >
              <div className="flex items-center gap-3">
                <Icon className={`w-4 h-4 ${isActive ? 'text-blue-400' : 'text-slate-400'}`} />
                <span>{item.label}</span>
              </div>
              {item.badge !== undefined && item.badge > 0 && (
                <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-red-500 text-white animate-pulse">
                  {item.badge}
                </span>
              )}
            </button>
          );
        })}
      </div>

      <div className="p-4 border-t border-gray-800 text-[11px] text-slate-500 font-mono space-y-1">
        <div className="flex justify-between">
          <span>PIPELINE:</span>
          <span className="text-emerald-400">EDGE_RUNNING</span>
        </div>
        <div className="flex justify-between">
          <span>EVIDENTIAL CHAIN:</span>
          <span className="text-cyan-400">SHA-256_ACTIVE</span>
        </div>
        <div className="flex justify-between">
          <span>LATENCY:</span>
          <span className="text-slate-300">18ms</span>
        </div>
      </div>
    </aside>
  );
};
