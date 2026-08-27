import React, { useEffect, useState } from 'react';
import { Radio, Wifi, WifiOff, AlertTriangle, RefreshCw } from 'lucide-react';
import { wsClient } from '../../services/websocket';
import { api } from '../../services/api';

export const ConnectionBanner: React.FC = () => {
  const [isWsConnected, setIsWsConnected] = useState<boolean>(false);
  const [isApiOnline, setIsApiOnline] = useState<boolean>(true);

  useEffect(() => {
    const unsub = wsClient.onConnectionChange((status) => {
      setIsWsConnected(status);
    });

    const checkApi = () => {
      setIsApiOnline(api.getIsBackendReachable());
    };
    checkApi();
    const timer = setInterval(checkApi, 5000);

    return () => {
      unsub();
      clearInterval(timer);
    };
  }, []);

  if (isWsConnected && isApiOnline) {
    return null; // All systems nominal, no banner needed
  }

  return (
    <div className="bg-amber-950/80 border-b border-amber-500/40 text-amber-300 px-4 py-1.5 text-xs flex items-center justify-between z-20 font-mono">
      <div className="flex items-center gap-2">
        <AlertTriangle className="w-4 h-4 text-amber-400 animate-pulse" />
        <span>
          {!isApiOnline
            ? 'STANDALONE / OFFLINE MODE: FastAPI backend unreachable. Running on Edge local cache.'
            : 'WEBSOCKET RECONNECTING: Real-time alert push stream temporarily disconnected.'}
        </span>
      </div>
      <div className="flex items-center gap-3">
        <span className="text-[10px] text-amber-400/80">EDGE BUFFER ACTIVE</span>
        <button
          onClick={() => {
            wsClient.connect();
          }}
          className="flex items-center gap-1 px-2 py-0.5 rounded bg-amber-500/20 hover:bg-amber-500/30 text-[10px] text-amber-300 border border-amber-500/40 transition-colors"
        >
          <RefreshCw className="w-3 h-3 animate-spin" />
          RETRY
        </button>
      </div>
    </div>
  );
};
