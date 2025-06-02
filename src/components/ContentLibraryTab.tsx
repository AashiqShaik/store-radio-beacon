
import { PlaylistSelector } from './PlaylistSelector';

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

interface ContentLibraryTabProps {
  selectedDevice: Device;
  onUpdateDevice: (deviceId: string, updates: Partial<Device>) => void;
}

export const ContentLibraryTab = ({ selectedDevice, onUpdateDevice }: ContentLibraryTabProps) => {
  return (
    <PlaylistSelector 
      selectedDevice={selectedDevice}
      onUpdateDevice={onUpdateDevice}
    />
  );
};
