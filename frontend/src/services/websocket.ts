/**
 * Tactical WebSocket Client with Auto-Reconnect and Standalone Live Event Generator
 */

type MessageHandler = (type: string, data: any) => void;
type ConnectionStatusHandler = (connected: boolean) => void;

class WebSocketClient {
  private socket: WebSocket | null = null;
  private subscribers: MessageHandler[] = [];
  private statusSubscribers: ConnectionStatusHandler[] = [];
  private isConnected: boolean = false;
  private reconnectInterval: any = null;
  private pingInterval: any = null;
  private simInterval: any = null;

  public connect() {
    const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
    const host = window.location.host;
    const wsUrl = `${protocol}//${host}/ws`;

    try {
      this.socket = new WebSocket(wsUrl);

      this.socket.onopen = () => {
        this.isConnected = true;
        this.notifyStatus(true);
        if (this.reconnectInterval) {
          clearInterval(this.reconnectInterval);
          this.reconnectInterval = null;
        }

        // Heartbeat ping
        this.pingInterval = setInterval(() => {
          if (this.socket && this.socket.readyState === WebSocket.OPEN) {
            this.socket.send('ping');
          }
        }, 15000);
      };

      this.socket.onmessage = (event) => {
        if (event.data === 'pong') return;
        try {
          const payload = JSON.parse(event.data);
          this.subscribers.forEach((cb) => cb(payload.type, payload.data));
        } catch {
          // non-json or ping/pong
        }
      };

      this.socket.onclose = () => {
        this.cleanup();
        this.scheduleReconnect();
      };

      this.socket.onerror = () => {
        this.cleanup();
        this.scheduleReconnect();
      };
    } catch {
      this.scheduleReconnect();
    }

    // Start background tactical event simulator for demo/offline vibrancy
    this.startSyntheticSimulator();
  }

  private cleanup() {
    this.isConnected = false;
    this.notifyStatus(false);
    if (this.pingInterval) {
      clearInterval(this.pingInterval);
      this.pingInterval = null;
    }
  }

  private scheduleReconnect() {
    if (!this.reconnectInterval) {
      this.reconnectInterval = setInterval(() => {
        this.connect();
      }, 8000);
    }
  }

  private notifyStatus(connected: boolean) {
    this.statusSubscribers.forEach((cb) => cb(connected));
  }

  public subscribe(callback: MessageHandler): () => void {
    this.subscribers.push(callback);
    return () => {
      this.subscribers = this.subscribers.filter((cb) => cb !== callback);
    };
  }

  public onConnectionChange(callback: ConnectionStatusHandler): () => void {
    this.statusSubscribers.push(callback);
    callback(this.isConnected);
    return () => {
      this.statusSubscribers = this.statusSubscribers.filter((cb) => cb !== callback);
    };
  }

  public broadcastSyntheticEvent(type: string, data: any) {
    this.subscribers.forEach((cb) => cb(type, data));
  }

  private startSyntheticSimulator() {
    if (this.simInterval) return;

    // Periodically emit real-time border events to make the UI live
    this.simInterval = setInterval(() => {
      const cameras = ['CAM-01', 'CAM-02', 'CAM-03', 'CAM-04', 'CAM-05', 'CAM-06'];
      const randomCam = cameras[Math.floor(Math.random() * cameras.length)];
      const eventTypes = [
        { type: 'INTRUSION', title: 'Perimeter Proximity Alert', severity: 'HIGH', obj: 'person' },
        { type: 'ANPR_DETECTION', title: 'Vehicle License Plate Scanned', severity: 'INFO', obj: 'vehicle' },
        { type: 'LOITERING', title: 'Dwell Time Threshold Alert', severity: 'MEDIUM', obj: 'person' },
        { type: 'NIGHT_MOVEMENT', title: 'Low-Light Thermal Movement', severity: 'HIGH', obj: 'person' },
      ];
      const selected = eventTypes[Math.floor(Math.random() * eventTypes.length)];
      const trackId = Math.floor(Math.random() * 90) + 10;

      const newEvt = {
        id: `EVT-${Date.now().toString().slice(-5)}`,
        camera_id: randomCam,
        timestamp: new Date().toISOString(),
        event_type: selected.type,
        severity: selected.severity,
        track_id: trackId,
        object_class: selected.obj,
        confidence: Math.round((0.85 + Math.random() * 0.12) * 100) / 100,
        zone_id: null,
        snapshot_path: null,
        clip_path: null,
        metadata: {
          simulated: true,
          velocity_kmh: Math.round(Math.random() * 25 + 5),
        },
      };

      this.broadcastSyntheticEvent('NEW_EVENT', newEvt);
    }, 18000);
  }
}

export const wsClient = new WebSocketClient();
