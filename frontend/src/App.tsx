import React, { useEffect, useState } from 'react';
import {
  AlertItem,
  AuditRecord,
  Camera,
  DashboardSummary,
  EventItem,
  TabType,
  Zone,
} from './types';
import { api } from './services/api';
import { wsClient } from './services/websocket';
import { AuthProvider, useAuth } from './app/AuthContext';
import { useAudioAlarm } from './hooks/useAudioAlarm';
import { Navbar } from './components/common/Navbar';
import { Sidebar } from './components/common/Sidebar';
import { ConnectionBanner } from './components/common/ConnectionBanner';

import { DashboardPage } from './pages/DashboardPage';
import { LiveMonitorPage } from './pages/LiveMonitorPage';
import { VideoAnalysisPage } from './pages/VideoAnalysisPage';
import { AlertsPage } from './pages/AlertsPage';
import { InvestigationPage } from './pages/InvestigationPage';
import { ANPRPage } from './pages/ANPRPage';
import { FaceRecognitionPage } from './pages/FaceRecognitionPage';
import { CameraManagementPage } from './pages/CameraManagementPage';
import { ZonesPage } from './pages/ZonesPage';
import { MapPage } from './pages/MapPage';
import { AuditPage } from './pages/AuditPage';
import { AnalyticsPage } from './pages/AnalyticsPage';
import { UsersRolesPage } from './pages/UsersRolesPage';
import { SettingsPage } from './pages/SettingsPage';
import { LoginPage } from './pages/LoginPage';

const MainLayout: React.FC = () => {
  const { isAuthenticated, isLoading } = useAuth();
  const { playCriticalAlert } = useAudioAlarm();

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
          api.getEvents({ limit: 60 }).catch(() => []),
          api.getAuditChain(100).catch(() => []),
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
        if (data.severity === 'CRITICAL') {
          playCriticalAlert();
        }
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
                  data.severity === 'CRITICAL' ? 'CRITICAL' : 'ELEVATED',
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
          snapshot_path: data.snapshot_path || null,
          clip_path: data.clip_path || null,
          metadata_json: data.metadata || {},
        };
        setLastEvent(evtItem);
        setEvents((prev) => [evtItem, ...prev]);
        setSummary((prev) =>
          prev ? { ...prev, events_last_24h: prev.events_last_24h + 1 } : null
        );
      }
    });

    const interval = setInterval(loadData, 12000);
    return () => {
      unsubscribe();
      clearInterval(interval);
    };
  }, []);

  const handleAlertAction = async (
    alertId: string,
    action: 'ACKNOWLEDGE' | 'RESOLVE' | 'DISMISS',
    notes?: string
  ) => {
    try {
      await api.alertAction(alertId, action, notes);
      await loadData();
    } catch (e) {
      console.error(e);
    }
  };

  if (isLoading) {
    return (
      <div className="h-screen w-screen bg-tactical-bg flex items-center justify-center font-mono text-cyan-400 text-xs">
        <span className="animate-pulse">INITIALIZING TACTICAL TERMINAL...</span>
      </div>
    );
  }

  if (!isAuthenticated) {
    return <LoginPage onSuccess={() => loadData()} />;
  }

  const activeAlertsCount = alerts.filter((a) => a.status === 'ACTIVE').length;

  return (
    <div className="flex flex-col h-screen w-screen bg-tactical-bg overflow-hidden text-slate-100 font-sans">
      {/* Top Navbar */}
      <Navbar summary={summary} />

      {/* Connection Status Banner (if offline/reconnecting) */}
      <ConnectionBanner />

      <div className="flex-1 flex overflow-hidden">
        {/* Navigation Sidebar */}
        <Sidebar
          activeTab={activeTab}
          setActiveTab={setActiveTab}
          activeAlertsCount={activeAlertsCount}
        />

        {/* Dynamic Content Pane */}
        <main className="flex-1 flex flex-col overflow-hidden bg-gradient-to-br from-tactical-bg via-[#090D18] to-[#04060C]">
          {activeTab === 'dashboard' && (
            <DashboardPage
              summary={summary}
              cameras={cameras}
              zones={zones}
              alerts={alerts}
              lastEvent={lastEvent}
              onAlertAction={handleAlertAction}
              onRefresh={loadData}
              onNavigateToLive={() => setActiveTab('live')}
              onNavigateToVideoAnalysis={() => setActiveTab('video-analysis')}
            />
          )}

          {activeTab === 'live' && (
            <LiveMonitorPage
              cameras={cameras}
              zones={zones}
              lastEvent={lastEvent}
              onNavigateToVideoAnalysis={() => setActiveTab('video-analysis')}
            />
          )}

          {activeTab === 'video-analysis' && <VideoAnalysisPage />}

          {activeTab === 'alerts' && (
            <AlertsPage alerts={alerts} onAlertAction={handleAlertAction} />
          )}

          {activeTab === 'map' && (
            <MapPage
              cameras={cameras}
              alerts={alerts}
              onSelectCamera={() => setActiveTab('live')}
            />
          )}

          {activeTab === 'investigation' && (
            <InvestigationPage events={events} cameras={cameras} />
          )}

          {activeTab === 'anpr' && <ANPRPage />}

          {activeTab === 'faces' && <FaceRecognitionPage />}

          {activeTab === 'cameras' && (
            <CameraManagementPage
              cameras={cameras}
              onRefreshCameras={loadData}
            />
          )}

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

          {activeTab === 'users' && <UsersRolesPage />}

          {activeTab === 'settings' && <SettingsPage />}
        </main>
      </div>
    </div>
  );
};

export const App: React.FC = () => {
  return (
    <AuthProvider>
      <MainLayout />
    </AuthProvider>
  );
};

export default App;
