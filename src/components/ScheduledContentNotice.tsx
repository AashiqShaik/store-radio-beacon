
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
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

interface ScheduledContentNoticeProps {
  selectedDevice: Device;
  onUpdateDevice: (deviceId: string, updates: Partial<Device>) => void;
}

export const ScheduledContentNotice = ({ selectedDevice, onUpdateDevice }: ScheduledContentNoticeProps) => {
  const handleReturnToStream = () => {
    onUpdateDevice(selectedDevice.id, {
      currentTrack: 'Live Stream',
      isPlaying: true,
      isScheduledContent: false
    });
    
    toast({
      title: "Returned to stream",
      description: `${selectedDevice.name} is now playing the live stream`,
    });
  };

  if (selectedDevice.status !== 'online' || !selectedDevice.isScheduledContent) {
    return null;
  }

  return (
    <Card className="bg-slate-800/80">
      <CardContent className="p-4">
        <div className="bg-blue-400/20 text-blue-400 p-3 rounded-lg text-sm">
          Currently playing scheduled content. 
          <Button 
            variant="link" 
            className="text-blue-400 p-0 h-auto ml-2"
            onClick={handleReturnToStream}
          >
            Return to stream
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};
