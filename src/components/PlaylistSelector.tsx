
import { useState } from 'react';
import { Play, Music } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
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

interface PlaylistSelectorProps {
  selectedDevice: Device;
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

export const PlaylistSelector = ({ selectedDevice, onUpdateDevice }: PlaylistSelectorProps) => {
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

  return (
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
  );
};
