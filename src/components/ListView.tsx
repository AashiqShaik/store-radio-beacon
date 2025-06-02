
import { Wifi, WifiOff, Monitor } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';

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

interface ListViewProps {
  devices: Device[];
  selectedDevice: string | null;
  onSelectDevice: (deviceId: string) => void;
}

export const ListView = ({ devices, selectedDevice, onSelectDevice }: ListViewProps) => {
  return (
    <div className="space-y-4">
      <h2 className="text-xl font-semibold text-white mb-4">Device List</h2>
      
      <div className="space-y-2">
        {devices.map((device) => (
          <Card
            key={device.id}
            className={`cursor-pointer transition-all duration-200 ${
              selectedDevice === device.id
                ? 'ring-2 ring-blue-400 bg-slate-800'
                : 'bg-slate-800/80 hover:bg-slate-800'
            } ${device.status === 'offline' ? 'opacity-60' : ''}`}
            onClick={() => onSelectDevice(device.id)}
          >
            <CardContent className="p-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <Monitor className="h-4 w-4 text-slate-400" />
                  <div>
                    <h3 className="font-medium text-white text-sm">{device.name}</h3>
                    <p className="text-xs text-slate-400">{device.location}</p>
                  </div>
                </div>
                
                <div className="flex items-center space-x-3">
                  <div className="text-xs text-slate-400">
                    {device.ipAddress}
                  </div>
                  
                  <div className="flex items-center space-x-2">
                    {device.status === 'online' ? (
                      <Wifi className="h-4 w-4 text-green-400" />
                    ) : (
                      <WifiOff className="h-4 w-4 text-red-400" />
                    )}
                    <span className={`text-xs px-2 py-1 rounded-full ${
                      device.status === 'online'
                        ? 'bg-green-400/20 text-green-400'
                        : 'bg-red-400/20 text-red-400'
                    }`}>
                      {device.status}
                    </span>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
};
