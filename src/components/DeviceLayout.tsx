
import { useState } from 'react';
import { DeviceGrid } from '@/components/DeviceGrid';
import { ContentPanel } from '@/components/ContentPanel';
import { DeviceDetailsPanel } from '@/components/DeviceDetailsPanel';
import { MasterClock } from '@/components/MasterClock';
import { DeviceSearch } from '@/components/DeviceSearch';

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
  streamUrl: string;
  isScheduledContent: boolean;
  storeMode: boolean;
}

interface DeviceLayoutProps {
  devices: Device[];
  selectedDevice: string | null;
  view: 'list' | 'detailed';
  onSelectDevice: (deviceId: string) => void;
  onUpdateDevice: (deviceId: string, updates: Partial<Device>) => void;
}

export const DeviceLayout = ({
  devices,
  selectedDevice,
  view,
  onSelectDevice,
  onUpdateDevice,
}: DeviceLayoutProps) => {
  const [searchQuery, setSearchQuery] = useState('');

  const selectedDeviceData = selectedDevice ? devices.find(d => d.id === selectedDevice) : null;

  // Filter devices based on search query
  const filteredDevices = devices.filter(device =>
    device.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    device.location.toLowerCase().includes(searchQuery.toLowerCase()) ||
    device.ipAddress.includes(searchQuery)
  );

  if (selectedDeviceData) {
    return (
      <div className="grid grid-cols-1 xl:grid-cols-4 gap-6">
        {/* Left Panel - Device List with Clock and Search */}
        <div className="xl:col-span-2 space-y-4">
          <MasterClock />
          <DeviceSearch searchQuery={searchQuery} onSearchChange={setSearchQuery} />
          <DeviceGrid 
            devices={filteredDevices}
            selectedDevice={selectedDevice}
            onSelectDevice={onSelectDevice}
            onUpdateDevice={onUpdateDevice}
            view={view}
          />
        </div>
        
        {/* Right Panel - Device Details and Content Control */}
        <div className="xl:col-span-2 space-y-6">
          <DeviceDetailsPanel device={selectedDeviceData} />
          <ContentPanel 
            selectedDevice={selectedDeviceData}
            onUpdateDevice={onUpdateDevice}
          />
        </div>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      <div className="lg:col-span-2 space-y-4">
        <MasterClock />
        <DeviceSearch searchQuery={searchQuery} onSearchChange={setSearchQuery} />
        <DeviceGrid 
          devices={filteredDevices}
          selectedDevice={selectedDevice}
          onSelectDevice={onSelectDevice}
          onUpdateDevice={onUpdateDevice}
          view={view}
        />
      </div>
      
      <div className="lg:col-span-1">
        <ContentPanel 
          selectedDevice={null}
          onUpdateDevice={onUpdateDevice}
        />
      </div>
    </div>
  );
};
