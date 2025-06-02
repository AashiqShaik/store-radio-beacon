
import { Monitor, Wifi, WifiOff, MapPin, Globe } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';

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
  streamUrl?: string;
  isScheduledContent?: boolean;
  storeMode?: boolean;
}

interface DeviceDetailsPanelProps {
  device: Device;
}

export const DeviceDetailsPanel = ({ device }: DeviceDetailsPanelProps) => {
  const formatLastSeen = (date: Date) => {
    const now = new Date();
    const diffInMinutes = Math.floor((now.getTime() - date.getTime()) / 60000);
    
    if (diffInMinutes < 1) return 'Just now';
    if (diffInMinutes < 60) return `${diffInMinutes}m ago`;
    if (diffInMinutes < 1440) return `${Math.floor(diffInMinutes / 60)}h ago`;
    return date.toLocaleDateString();
  };

  return (
    <Card className="bg-slate-800/80">
      <CardHeader>
        <CardTitle className="text-white flex items-center space-x-2">
          <Monitor className="h-5 w-5" />
          <span>Device Details</span>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-lg font-semibold text-white">{device.name}</h3>
            <div className="flex items-center space-x-2 text-sm text-slate-400">
              <MapPin className="h-3 w-3" />
              <span>{device.location}</span>
            </div>
          </div>
          
          <div className="flex items-center space-x-2">
            {device.status === 'online' ? (
              <Wifi className="h-4 w-4 text-green-400" />
            ) : (
              <WifiOff className="h-4 w-4 text-red-400" />
            )}
            <Badge variant={device.status === 'online' ? 'default' : 'destructive'}>
              {device.status}
            </Badge>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4 text-sm">
          <div className="space-y-2">
            <div>
              <span className="text-slate-400">IP Address:</span>
              <div className="flex items-center space-x-1 text-white">
                <Globe className="h-3 w-3" />
                <span className="font-mono">{device.ipAddress}</span>
              </div>
            </div>
            
            <div>
              <span className="text-slate-400">Volume:</span>
              <div className="text-white font-medium">{device.volume}%</div>
            </div>
          </div>

          <div className="space-y-2">
            <div>
              <span className="text-slate-400">Mode:</span>
              <div className="text-white font-medium">
                {device.storeMode ? 'Store Mode' : 'Live Stream'}
              </div>
            </div>
            
            <div>
              <span className="text-slate-400">Last Seen:</span>
              <div className="text-white font-medium">{formatLastSeen(device.lastSeen)}</div>
            </div>
          </div>
        </div>

        {device.currentTrack && (
          <div className="border-t border-slate-700 pt-4">
            <span className="text-slate-400 text-sm">Currently Playing:</span>
            <div className="text-white font-medium">{device.currentTrack}</div>
            <div className="text-xs text-slate-500 mt-1">
              {device.isPlaying ? '🎵 Playing' : '⏸️ Paused'}
              {device.isScheduledContent && ' • Scheduled Content'}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
};
