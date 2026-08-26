import React, { useEffect, useState } from 'react';
import {
  AlertItem,
  AuditRecord,
  Camera,
  DashboardSummary,
  EventItem,
  Zone,
} from './types';
import { api } from './services/api';
import { wsClient } from './services/websocket';
import { Navbar } from './components/Navbar';
import { Sidebar, TabType } from './components/Sidebar';

import { DashboardPage } from './pages/DashboardPage';
import { LiveMonitorPage } from './pages/LiveMonitorPage';
import { AlertsPage } from './pages/AlertsPage';
import { InvestigationPage } from './pages/InvestigationPage';
import { ANPRPage } from './pages/ANPRPage';
import { FaceRecognitionPage } from './pages/FaceRecognitionPage';
import { ZonesPage } from './pages/ZonesPage';
import { AuditPage } from './pages/AuditPage';
import { AnalyticsPage } from './pages/AnalyticsPage';

export const App: React.FC = () => {
  const [activeTab, setActiveTab] = useState<TabType>('dashboard');
  const [summary, setSummary] = useState<DashboardSummary | null>(null);
  const [cameras, setCameras] = useState<Camera[]>([]);
  const [zones, setZones] = useState<Zone[]>([]);
  const [alerts, setAlerts] = useState<AlertItem[]>([]);
  const [events, setEvents] = useState<EventItem[]>([]);
  const [auditChain, setAuditChain] = useState<AuditRecord[]>([]);
  const [lastEvent, setLastEvent] = useState<EventItem | null>(null);

  // Initial Data Fetch
  const loadData = async () => {
    try {
      const [sumData, camData, zoneData, alertData, eventData, auditData] =
        await Promise.all([
          api.getSummary().catch(() => null),
          api.getCameras().catch(() => []),
          api.getZones().catch(() => []),
          api.getAlerts().catch(() => []),
          api.getEvents({ limit: 50 }).catch(() => []),
          api.getAuditChain(50).catch(() => []),
        ]);

      if (sumData) setSummary(sumData);
      setCameras(camData);
      setZones(zoneData);
      setAlerts(alertData);
      setEvents(eventData);
      setAuditChain(auditData);
    } catch (e) {
      console.error('Data load error:', e);
    }
  };

  useEffect(() => {
    loadData();
    wsClient.connect();

    // WebSocket real-time event & alert subscriptions
    const unsubscribe = wsClient.subscribe((type, data) => {
      if (type === 'NEW_ALERT') {
        setAlerts((prev) => [data, ...prev]);
        setSummary((prev) =>
          prev
            ? {
                ...prev,
                active_alerts: prev.active_alerts + 1,
                critical_alerts:
                  data.severity === 'CRITICAL'
                    ? prev.critical_alerts + 1
                    : prev.critical_alerts,
                threat_level:
                  data.severity === 'CRITICAL'
                    ? 'ELEVATED'
                    : prev.threat_level,
              }
            : null
        );
      } else if (type === 'NEW_EVENT') {
        const evtItem: EventItem = {
          id: data.id,
          camera_id: data.camera_id,
          timestamp: data.timestamp,
          event_type: data.event_type,
          severity: data.severity,
          track_id: data.track_id,
          object_class: data.object_class,
          confidence: data.confidence,
          zone_id: data.zone_id,
          snapshot_path: null,
          clip_path: null,
          metadata_json: data.metadata || {},
        };
        setLastEvent(evtItem);
        setEvents((prev) => [evtItem, ...prev]);
        setSummary((prev) =>
          prev ? { ...prev, events_last_24h: prev.events_last_24h + 1 } : null
        );
      }
    });

    const interval = setInterval(loadData, 10000);
    return () => {
      unsubscribe();
      clearInterval(interval);
    };
  }, []);

  const handleAlertAction = async (
    alertId: string,
    action: 'ACKNOWLEDGE' | 'RESOLVE' | 'DISMISS'
  ) => {
    try {
      await api.alertAction(alertId, action);
      loadData();
    } catch (e) {
      console.error(e);
    }
  };

  const activeAlertsCount = alerts.filter((a) => a.status === 'ACTIVE').length;

  return (
    <div className="flex flex-col h-screen w-screen bg-tactical-bg overflow-hidden text-slate-100">
      {/* Tactical Navbar */}
      <Navbar summary={summary} />

      <div className="flex-1 flex overflow-hidden">
        {/* Tactical Navigation Sidebar */}
        <Sidebar
          activeTab={activeTab}
          setActiveTab={setActiveTab}
          activeAlertsCount={activeAlertsCount}
        />

        {/* Content Pane */}
        <main className="flex-1 flex flex-col overflow-hidden bg-gradient-to-br from-tactical-bg to-[#060911]">
          {activeTab === 'dashboard' && (
            <DashboardPage
              summary={summary}
              cameras={cameras}
              zones={zones}
              alerts={alerts}
              lastEvent={lastEvent}
              onAlertAction={handleAlertAction}
            />
          )}

          {activeTab === 'live' && (
            <LiveMonitorPage
              cameras={cameras}
              zones={zones}
              lastEvent={lastEvent}
            />
          )}

          {activeTab === 'alerts' && (
            <AlertsPage alerts={alerts} onAlertAction={handleAlertAction} />
          )}

          {activeTab === 'investigation' && (
            <InvestigationPage events={events} cameras={cameras} />
          )}

          {activeTab === 'anpr' && <ANPRPage />}

          {activeTab === 'faces' && <FaceRecognitionPage />}

          {activeTab === 'zones' && (
            <ZonesPage
              zones={zones}
              cameras={cameras}
              onRefreshZones={loadData}
            />
          )}

          {activeTab === 'audit' && (
            <AuditPage chain={auditChain} onRefresh={loadData} />
          )}

          {activeTab === 'analytics' && <AnalyticsPage summary={summary} />}
        </main>
      </div>
    </div>
  );
};
