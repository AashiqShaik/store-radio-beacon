
import { DeviceCard } from './DeviceCard';

interface Device {
  id: string;
  name: string;
  status: 'online' | 'offline';
  isPlaying: boolean;
  volume: number;
  currentTrack: string | null;
  lastSeen: Date;
  location: string;
  ipAddress: string;
}

interface DeviceGridProps {
  devices: Device[];
  selectedDevice: string | null;
  onSelectDevice: (deviceId: string) => void;
  onUpdateDevice: (deviceId: string, updates: Partial<Device>) => void;
}

export const DeviceGrid = ({ devices, selectedDevice, onSelectDevice, onUpdateDevice }: DeviceGridProps) => {
  return (
    <div className="space-y-4">
      <h2 className="text-xl font-semibold text-white mb-4">Connected Devices</h2>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {devices.map((device) => (
          <DeviceCard
            key={device.id}
            device={device}
            isSelected={selectedDevice === device.id}
            onSelect={() => onSelectDevice(device.id)}
            onUpdate={(updates) => onUpdateDevice(device.id, updates)}
          />
        ))}
      </div>
    </div>
  );
};
