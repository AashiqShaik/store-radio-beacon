
import { Play, Pause, Volume2, Wifi, WifiOff, Monitor, Trash2, RefreshCw } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Slider } from '@/components/ui/slider';
import { toast } from '@/hooks/use-toast';

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
  storeMode?: boolean;
}

interface DeviceCardProps {
  device: Device;
  isSelected: boolean;
  onSelect: () => void;
  onUpdate: (updates: Partial<Device>) => void;
  onDelete: () => void;
  onPing: () => void;
}

export const DeviceCard = ({ device, isSelected, onSelect, onUpdate, onDelete, onPing }: DeviceCardProps) => {
  const handlePlayPause = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (device.status === 'offline') return;
    
    const newPlayingState = !device.isPlaying;
    onUpdate({ isPlaying: newPlayingState });
    
    toast({
      title: newPlayingState ? "Playback started" : "Playback paused",
      description: `${device.name} is now ${newPlayingState ? 'playing' : 'paused'}`,
    });
  };

  const handleVolumeChange = (value: number[]) => {
    if (device.status === 'offline') return;
    onUpdate({ volume: value[0] });
  };

  const handleDelete = (e: React.MouseEvent) => {
    e.stopPropagation();
    onDelete();
  };

  const handlePing = (e: React.MouseEvent) => {
    e.stopPropagation();
    onPing();
  };

  const formatLastSeen = (date: Date) => {
    const now = new Date();
    const diff = Math.floor((now.getTime() - date.getTime()) / 1000);
    
    if (diff < 60) return 'Just now';
    if (diff < 3600) return `${Math.floor(diff / 60)}m ago`;
    return `${Math.floor(diff / 3600)}h ago`;
  };

  return (
    <Card 
      className={`cursor-pointer transition-all duration-200 ${
        isSelected 
          ? 'ring-2 ring-blue-400 bg-slate-800' 
          : 'bg-slate-800/80 hover:bg-slate-800'
      } ${device.status === 'offline' ? 'opacity-60' : ''}`}
      onClick={onSelect}
    >
      <CardContent className="p-4">
        <div className="flex items-start justify-between mb-3">
          <div className="flex items-center space-x-2">
            <Monitor className="h-5 w-5 text-slate-400" />
            <h3 className="font-medium text-white text-sm">{device.name}</h3>
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

        <div className="space-y-3">
          <div className="text-xs text-slate-400">
            <div>{device.location}</div>
            <div>{device.ipAddress}</div>
            <div>Last seen: {formatLastSeen(device.lastSeen)}</div>
            <div className="flex items-center space-x-1">
              <span>Mode:</span>
              <span className={device.storeMode ? 'text-blue-400' : 'text-green-400'}>
                {device.storeMode ? 'Store Mode' : 'Live Stream'}
              </span>
            </div>
          </div>

          {device.currentTrack && (
            <div className="text-sm text-slate-300">
              Playing: <span className="text-blue-400">{device.currentTrack}</span>
            </div>
          )}

          <div className="flex items-center space-x-2">
            <Button
              size="sm"
              variant="outline"
              onClick={handlePlayPause}
              disabled={device.status === 'offline'}
              className="flex-shrink-0 bg-slate-700 hover:bg-slate-600 border-slate-600"
            >
              {device.isPlaying ? (
                <Pause className="h-4 w-4" />
              ) : (
                <Play className="h-4 w-4" />
              )}
            </Button>

            <div className="flex items-center space-x-2 flex-1">
              <Volume2 className="h-4 w-4 text-slate-400 flex-shrink-0" />
              <Slider
                value={[device.volume]}
                onValueChange={handleVolumeChange}
                max={100}
                step={1}
                disabled={device.status === 'offline'}
                className="flex-1"
              />
              <span className="text-xs text-slate-400 w-8 text-right">
                {device.volume}%
              </span>
            </div>
          </div>

          <div className="flex items-center justify-between pt-2">
            {device.status === 'offline' && (
              <Button
                size="sm"
                variant="outline"
                onClick={handlePing}
                className="bg-orange-600 hover:bg-orange-700 border-orange-600 text-white"
              >
                <RefreshCw className="h-3 w-3 mr-1" />
                Ping
              </Button>
            )}
            
            <Button
              size="sm"
              variant="outline"
              onClick={handleDelete}
              className="bg-red-600 hover:bg-red-700 border-red-600 text-white ml-auto"
            >
              <Trash2 className="h-3 w-3 mr-1" />
              Delete
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
