
import { Music, Upload } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ContentUpload } from './ContentUpload';
import { StreamModeSelector } from './StreamModeSelector';
import { ScheduledContentNotice } from './ScheduledContentNotice';
import { ContentLibraryTab } from './ContentLibraryTab';
import { LiveStreamModeCard } from './LiveStreamModeCard';

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

interface ContentPanelProps {
  selectedDevice: Device | null;
  onUpdateDevice: (deviceId: string, updates: Partial<Device>) => void;
}

export const ContentPanel = ({ selectedDevice, onUpdateDevice }: ContentPanelProps) => {
  if (!selectedDevice) {
    return (
      <Card className="bg-slate-800/80">
        <CardContent className="p-6">
          <div className="text-center text-slate-400">
            <Music className="h-12 w-12 mx-auto mb-4 opacity-50" />
            <p>Select a device to control content</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      <StreamModeSelector 
        selectedDevice={selectedDevice}
        onUpdateDevice={onUpdateDevice}
      />

      <ScheduledContentNotice 
        selectedDevice={selectedDevice}
        onUpdateDevice={onUpdateDevice}
      />

      {selectedDevice.storeMode ? (
        <Tabs defaultValue="library" className="w-full">
          <TabsList className="grid w-full grid-cols-2 bg-slate-800/50">
            <TabsTrigger value="library" className="text-slate-300 data-[state=active]:text-white data-[state=active]:bg-slate-700">
              Content Library
            </TabsTrigger>
            <TabsTrigger value="upload" className="text-slate-300 data-[state=active]:text-white data-[state=active]:bg-slate-700">
              Upload & Schedule
            </TabsTrigger>
          </TabsList>

          <TabsContent value="library">
            <ContentLibraryTab 
              selectedDevice={selectedDevice}
              onUpdateDevice={onUpdateDevice}
            />
          </TabsContent>

          <TabsContent value="upload">
            {selectedDevice.status === 'online' ? (
              <ContentUpload 
                deviceId={selectedDevice.id} 
                deviceName={selectedDevice.name} 
              />
            ) : (
              <Card className="bg-slate-800/80">
                <CardContent className="p-6">
                  <div className="text-center text-slate-400">
                    <Upload className="h-12 w-12 mx-auto mb-4 opacity-50" />
                    <p>Device must be online to upload and schedule content</p>
                  </div>
                </CardContent>
              </Card>
            )}
          </TabsContent>
        </Tabs>
      ) : (
        <LiveStreamModeCard />
      )}
    </div>
  );
};
