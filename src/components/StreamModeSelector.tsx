
import { Radio } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
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
  streamUrl?: string;
  isScheduledContent?: boolean;
  storeMode?: boolean;
}

interface StreamModeSelectorProps {
  selectedDevice: Device | null;
  onUpdateDevice: (deviceId: string, updates: Partial<Device>) => void;
}

export const StreamModeSelector = ({ selectedDevice, onUpdateDevice }: StreamModeSelectorProps) => {
  if (!selectedDevice || selectedDevice.status === 'offline') {
    return null;
  }

  const handleModeChange = (storeMode: boolean) => {
    onUpdateDevice(selectedDevice.id, { 
      storeMode,
      currentTrack: storeMode ? 'Store Mode - Live Stream with Scheduled Content' : 'Live Stream',
      isScheduledContent: false
    });
    
    toast({
      title: `${storeMode ? 'Store Mode' : 'Live Stream Mode'} activated`,
      description: `${selectedDevice.name} is now in ${storeMode ? 'Store Mode (Live Stream + Scheduled Content)' : 'Live Stream only mode'}`,
    });
  };

  return (
    <Card className="bg-slate-800/80">
      <CardHeader>
        <CardTitle className="text-white flex items-center space-x-2">
          <Radio className="h-5 w-5" />
          <span>Stream Mode</span>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <Radio className="h-4 w-4 text-slate-400" />
            <div>
              <Label className="text-slate-300">Store Mode</Label>
              <div className="text-xs text-slate-400">
                Play live stream + scheduled content
              </div>
            </div>
          </div>
          <Switch
            checked={selectedDevice.storeMode || false}
            onCheckedChange={handleModeChange}
          />
        </div>

        <div className="text-xs text-slate-400 p-3 bg-slate-700/50 rounded">
          <div className="font-medium text-slate-300 mb-1">Current Mode:</div>
          {selectedDevice.storeMode ? (
            <div>
              <span className="text-blue-400">Store Mode:</span> Playing live stream with scheduled content overlay. 
              Raspberry Pi will switch to scheduled content at designated times and return to live stream when complete.
            </div>
          ) : (
            <div>
              <span className="text-green-400">Live Stream Mode:</span> Playing continuous live stream content only.
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
};
