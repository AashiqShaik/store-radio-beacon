import { useState, useEffect } from 'react';
import { DeviceGrid } from '@/components/DeviceGrid';
import { ContentPanel } from '@/components/ContentPanel';
import { DeviceDetailsPanel } from '@/components/DeviceDetailsPanel';
import { Header } from '@/components/Header';
import { MasterClock } from '@/components/MasterClock';
import { DeviceSearch } from '@/components/DeviceSearch';
import { toast } from '@/hooks/use-toast';

// Mock data for Raspberry Pi devices
const mockDevices = [
  {
    id: 'rpi-001',
    name: 'Store 1 - Main Floor',
    status: 'online' as const,
    isPlaying: true,
    volume: 75,
    currentTrack: 'Live Stream',
    lastSeen: new Date(),
    location: 'Downtown Store',
    ipAddress: '192.168.1.101',
    streamUrl: 'https://stream.radio.co/your-stream',
    isScheduledContent: false,
    storeMode: false
  },
  {
    id: 'rpi-002',
    name: 'Store 2 - Customer Area',
    status: 'online' as const,
    isPlaying: false,
    volume: 60,
    currentTrack: 'Live Stream',
    lastSeen: new Date(),
    location: 'Mall Location',
    ipAddress: '192.168.1.102',
    streamUrl: 'https://stream.radio.co/your-stream',
    isScheduledContent: false,
    storeMode: false
  },
  {
    id: 'rpi-003',
    name: 'Store 3 - Entrance',
    status: 'offline' as const,
    isPlaying: false,
    volume: 0,
    currentTrack: null,
    lastSeen: new Date(Date.now() - 300000), // 5 minutes ago
    location: 'Suburban Store',
    ipAddress: '192.168.1.103',
    streamUrl: 'https://stream.radio.co/your-stream',
    isScheduledContent: false,
    storeMode: false
  },
  {
    id: 'rpi-004',
    name: 'Store 4 - Back Office',
    status: 'online' as const,
    isPlaying: true,
    volume: 45,
    currentTrack: 'Store Announcement.mp3',
    lastSeen: new Date(),
    location: 'Headquarters',
    ipAddress: '192.168.1.104',
    streamUrl: 'https://stream.radio.co/your-stream',
    isScheduledContent: true,
    storeMode: true
  }
];

const Index = () => {
  const [devices, setDevices] = useState(mockDevices);
  const [selectedDevice, setSelectedDevice] = useState<string | null>(null);
  const [isScanning, setIsScanning] = useState(false);
  const [view, setView] = useState<'list' | 'detailed'>('detailed');
  const [searchQuery, setSearchQuery] = useState('');

  // Simulate device scanning
  const scanForDevices = async () => {
    setIsScanning(true);
    toast({
      title: "Scanning for devices...",
      description: "Looking for Raspberry Pi devices on the network",
    });
    
    // Simulate network scan
    setTimeout(() => {
      setIsScanning(false);
      toast({
        title: "Scan complete",
        description: `Found ${devices.filter(d => d.status === 'online').length} online devices`,
      });
    }, 3000);
  };

  // Add new device
  const addDevice = (newDevice: typeof mockDevices[0]) => {
    setDevices(prev => [...prev, newDevice]);
  };

  // Update device status
  const updateDevice = (deviceId: string, updates: Partial<typeof mockDevices[0]>) => {
    setDevices(prev => prev.map(device => 
      device.id === deviceId ? { ...device, ...updates, lastSeen: new Date() } : device
    ));
  };

  // Auto-refresh device status every 30 seconds
  useEffect(() => {
    const interval = setInterval(() => {
      // In a real app, this would fetch from your API
      console.log('Refreshing device status...');
    }, 30000);

    return () => clearInterval(interval);
  }, []);

  const selectedDeviceData = selectedDevice ? devices.find(d => d.id === selectedDevice) : null;

  // Filter devices based on search query
  const filteredDevices = devices.filter(device =>
    device.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    device.location.toLowerCase().includes(searchQuery.toLowerCase()) ||
    device.ipAddress.includes(searchQuery)
  );

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900">
      <Header 
        onScan={scanForDevices} 
        isScanning={isScanning}
        deviceCount={devices.length}
        onlineCount={devices.filter(d => d.status === 'online').length}
        view={view}
        onViewChange={setView}
        onAddDevice={addDevice}
      />
      
      <div className="container mx-auto px-4 py-6">
        {selectedDeviceData ? (
          <div className="grid grid-cols-1 xl:grid-cols-4 gap-6">
            {/* Left Panel - Device List with Clock and Search */}
            <div className="xl:col-span-2 space-y-4">
              <MasterClock />
              <DeviceSearch searchQuery={searchQuery} onSearchChange={setSearchQuery} />
              <DeviceGrid 
                devices={filteredDevices}
                selectedDevice={selectedDevice}
                onSelectDevice={setSelectedDevice}
                onUpdateDevice={updateDevice}
                view={view}
              />
            </div>
            
            {/* Right Panel - Device Details and Content Control */}
            <div className="xl:col-span-2 space-y-6">
              <DeviceDetailsPanel device={selectedDeviceData} />
              <ContentPanel 
                selectedDevice={selectedDeviceData}
                onUpdateDevice={updateDevice}
              />
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2 space-y-4">
              <MasterClock />
              <DeviceSearch searchQuery={searchQuery} onSearchChange={setSearchQuery} />
              <DeviceGrid 
                devices={filteredDevices}
                selectedDevice={selectedDevice}
                onSelectDevice={setSelectedDevice}
                onUpdateDevice={updateDevice}
                view={view}
              />
            </div>
            
            <div className="lg:col-span-1">
              <ContentPanel 
                selectedDevice={null}
                onUpdateDevice={updateDevice}
              />
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Index;
