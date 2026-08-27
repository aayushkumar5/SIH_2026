import React from 'react';
import { Camera, AlertItem } from '../types';
import { TacticalMap } from '../components/maps/TacticalMap';
import { Compass, Radio, Shield, MapPin } from 'lucide-react';

interface MapPageProps {
  cameras: Camera[];
  alerts: AlertItem[];
  onSelectCamera?: (cameraId: string) => void;
}

export const MapPage: React.FC<MapPageProps> = ({
  cameras,
  alerts,
  onSelectCamera,
}) => {
  return (
    <div className="flex-1 flex flex-col h-full overflow-hidden p-6 space-y-4">
      <TacticalMap
        cameras={cameras}
        alerts={alerts}
        onSelectCamera={onSelectCamera}
      />
    </div>
  );
};
