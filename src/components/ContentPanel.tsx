
import { useState } from 'react';
import { Play, Music, Upload } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { toast } from '@/hooks/use-toast';
import { ContentUpload } from './ContentUpload';
import { StreamModeSelector } from './StreamModeSelector';

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

const playlists = [
  { id: 'summer-vibes', name: 'Summer Vibes', duration: '2h 15m', tracks: 45 },
  { id: 'chill-background', name: 'Chill Background', duration: '3h 30m', tracks: 62 },
  { id: 'corporate-ambient', name: 'Corporate Ambient', duration: '1h 45m', tracks: 28 },
  { id: 'upbeat-retail', name: 'Upbeat Retail', duration: '2h 45m', tracks: 52 },
  { id: 'jazz-lounge', name: 'Jazz Lounge', duration: '4h 10m', tracks: 78 },
  { id: 'morning-energy', name: 'Morning Energy', duration: '1h 30m', tracks: 35 },
];

export const ContentPanel = ({ selectedDevice, onUpdateDevice }: ContentPanelProps) => {
  const [selectedPlaylist, setSelectedPlaylist] = useState<string>('');

  const handlePlaylistChange = (playlistId: string) => {
    if (!selectedDevice || selectedDevice.status === 'offline') return;
    
    const playlist = playlists.find(p => p.id === playlistId);
    if (playlist) {
      onUpdateDevice(selectedDevice.id, {
        currentTrack: playlist.name,
        isPlaying: true,
        isScheduledContent: false
      });
      
      toast({
        title: "Playlist changed",
        description: `Now playing "${playlist.name}" on ${selectedDevice.name}`,
      });
    }
    setSelectedPlaylist(playlistId);
  };

  const handleReturnToStream = () => {
    if (!selectedDevice) return;
    
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

      {selectedDevice.status === 'online' && selectedDevice.isScheduledContent && (
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
      )}

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
            <Card className="bg-slate-800/80">
              <CardHeader>
                <CardTitle className="text-white flex items-center space-x-2">
                  <Music className="h-5 w-5" />
                  <span>Stream Content</span>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <label className="text-sm font-medium text-slate-300 mb-2 block">
                    Select Playlist
                  </label>
                  <Select 
                    value={selectedPlaylist} 
                    onValueChange={handlePlaylistChange}
                    disabled={selectedDevice.status === 'offline'}
                  >
                    <SelectTrigger className="bg-slate-700 border-slate-600 text-white">
                      <SelectValue placeholder="Choose a playlist" />
                    </SelectTrigger>
                    <SelectContent className="bg-slate-700 border-slate-600">
                      {playlists.map((playlist) => (
                        <SelectItem 
                          key={playlist.id} 
                          value={playlist.id}
                          className="text-white hover:bg-slate-600"
                        >
                          <div>
                            <div className="font-medium">{playlist.name}</div>
                            <div className="text-xs text-slate-400">
                              {playlist.tracks} tracks • {playlist.duration}
                            </div>
                          </div>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <Button 
                  className="w-full bg-blue-600 hover:bg-blue-700"
                  disabled={selectedDevice.status === 'offline' || !selectedPlaylist}
                  onClick={() => handlePlaylistChange(selectedPlaylist)}
                >
                  <Play className="h-4 w-4 mr-2" />
                  Play Selected Content
                </Button>
              </CardContent>
            </Card>
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
        <Card className="bg-slate-800/80">
          <CardHeader>
            <CardTitle className="text-white flex items-center space-x-2">
              <Music className="h-5 w-5" />
              <span>Live Stream Mode</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-slate-400 text-sm">
              Device is in Live Stream mode. Enable Store Mode to access content scheduling and upload features.
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  );
};
