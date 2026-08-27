import React from 'react';
import {
  LayoutDashboard,
  Tv,
  Bell,
  Search,
  Car,
  UserCheck,
  Camera,
  ShieldAlert,
  MapPin,
  BarChart3,
  FileCheck2,
  Users,
  Settings,
  Activity,
} from 'lucide-react';
import { TabType } from '../../types';
import { useAuth } from '../../hooks/useAuth';

interface SidebarProps {
  activeTab: TabType;
  setActiveTab: (tab: TabType) => void;
  activeAlertsCount: number;
}

export const Sidebar: React.FC<SidebarProps> = ({
  activeTab,
  setActiveTab,
  activeAlertsCount,
}) => {
  const { user } = useAuth();

  const primaryNav = [
    { id: 'dashboard', label: 'Command Overview', icon: LayoutDashboard },
    { id: 'live', label: 'Surveillance Desk', icon: Tv },
    { id: 'alerts', label: 'Incident Center', icon: Bell, badge: activeAlertsCount },
    { id: 'map', label: 'Tactical Border Map', icon: MapPin },
    { id: 'investigation', label: 'Forensic Search', icon: Search },
    { id: 'anpr', label: 'ANPR & Vehicle Hotlist', icon: Car },
    { id: 'faces', label: 'Face Recognition & POI', icon: UserCheck },
    { id: 'cameras', label: 'Camera Fleet', icon: Camera },
    { id: 'zones', label: 'Geofences & Tripwires', icon: ShieldAlert },
    { id: 'audit', label: 'Tamper Audit Chain', icon: FileCheck2 },
    { id: 'analytics', label: 'Analytics & KPIs', icon: BarChart3 },
    { id: 'users', label: 'Personnel & Roles', icon: Users },
    { id: 'settings', label: 'Edge Node & AI Config', icon: Settings },
  ];

  return (
    <aside className="w-64 border-r border-gray-800 bg-tactical-panel/80 backdrop-blur-md flex flex-col justify-between select-none overflow-y-auto">
      <div className="p-3 space-y-1">
        <div className="px-3 py-1.5 text-[10px] font-bold tracking-widest text-slate-500 uppercase flex items-center justify-between">
          <span>Command Navigation</span>
          <span className="text-[9px] px-1.5 py-0.5 rounded bg-gray-800 text-cyan-400 font-mono">
            {user?.role || 'COMMANDER'}
          </span>
        </div>

        {primaryNav.map((item) => {
          const Icon = item.icon;
          const isActive = activeTab === item.id;
          return (
            <button
              key={item.id}
              onClick={() => setActiveTab(item.id as TabType)}
              className={`w-full flex items-center justify-between px-3 py-2 rounded-lg text-xs font-medium transition-all duration-150 ${
                isActive
                  ? 'bg-blue-600/20 text-blue-400 border border-blue-500/40 shadow-sm'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-gray-800/50'
              }`}
            >
              <div className="flex items-center gap-2.5">
                <Icon
                  className={`w-4 h-4 ${
                    isActive ? 'text-blue-400' : 'text-slate-400'
                  }`}
                />
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

      {/* Telemetry Status Bar */}
      <div className="p-3 border-t border-gray-800 text-[10px] text-slate-400 font-mono space-y-1 bg-gray-950/40">
        <div className="flex justify-between items-center">
          <span className="text-slate-500">EDGE INFERENCE:</span>
          <span className="text-emerald-400 font-bold flex items-center gap-1">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-ping"></span>
            YOLOv8 + BTY
          </span>
        </div>
        <div className="flex justify-between">
          <span className="text-slate-500">EVIDENTIAL CHAIN:</span>
          <span className="text-cyan-400">SHA-256_ACTIVE</span>
        </div>
        <div className="flex justify-between">
          <span className="text-slate-500">BOP SYNC:</span>
          <span className="text-slate-300">ONLINE • 14ms</span>
        </div>
      </div>
    </aside>
  );
};
