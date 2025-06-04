
import { useState, useEffect } from 'react';
import { DeviceGrid } from '@/components/DeviceGrid';
import { ContentPanel } from '@/components/ContentPanel';
import { DeviceDetailsPanel } from '@/components/DeviceDetailsPanel';
import { Header } from '@/components/Header';
import { MasterClock } from '@/components/MasterClock';
import { DeviceSearch } from '@/components/DeviceSearch';
import { toast } from '@/hooks/use-toast';

// Start with empty device list - real devices will be added manually
const mockDevices: any[] = [];

const Index = () => {
  const [devices, setDevices] = useState(mockDevices);
  const [selectedDevice, setSelectedDevice] = useState<string | null>(null);
  const [isScanning, setIsScanning] = useState(false);
  const [view, setView] = useState<'list' | 'detailed'>('detailed');
  const [searchQuery, setSearchQuery] = useState('');

  // Function to ping a device and check its status
  const pingDevice = async (device: any): Promise<boolean> => {
    console.log(`Pinging device ${device.name} at ${device.ipAddress}...`);
    
    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 3000);

      // Try multiple methods to check if device is reachable
      const testMethods = [
        { port: 80, protocol: 'http' },
        { port: 8080, protocol: 'http' },
        { port: 3000, protocol: 'http' },
        { port: 22, protocol: 'ssh' },
      ];

      for (const method of testMethods) {
        try {
          await fetch(`http://${device.ipAddress}:${method.port}/`, {
            method: 'HEAD',
            signal: controller.signal,
            mode: 'no-cors',
          });
          
          clearTimeout(timeoutId);
          console.log(`Device ${device.name} is online (port ${method.port})`);
          return true;
        } catch (error) {
          continue;
        }
      }
      
      clearTimeout(timeoutId);
      console.log(`Device ${device.name} appears offline`);
      return false;
    } catch (error) {
      console.log(`Ping failed for ${device.name}:`, error);
      return false;
    }
  };

  // Enhanced device scanning that actually pings devices
  const scanForDevices = async () => {
    if (devices.length === 0) {
      toast({
        title: "No devices to scan",
        description: "Add some devices first using the 'Add Device' button",
      });
      return;
    }

    setIsScanning(true);
    toast({
      title: "Scanning devices...",
      description: `Testing connectivity for ${devices.length} device(s)`,
    });
    
    try {
      // Ping all devices concurrently
      const pingPromises = devices.map(async (device) => {
        const isOnline = await pingDevice(device);
        return {
          ...device,
          status: isOnline ? 'online' : 'offline',
          lastSeen: isOnline ? new Date() : device.lastSeen,
        };
      });

      const updatedDevices = await Promise.all(pingPromises);
      setDevices(updatedDevices);

      const onlineCount = updatedDevices.filter(d => d.status === 'online').length;
      const offlineCount = updatedDevices.length - onlineCount;

      setIsScanning(false);
      toast({
        title: "Scan complete",
        description: `Found ${onlineCount} online and ${offlineCount} offline device(s)`,
      });
    } catch (error) {
      console.error('Scan error:', error);
      setIsScanning(false);
      toast({
        title: "Scan failed",
        description: "Error occurred while scanning devices",
        variant: "destructive",
      });
    }
  };

  // Add new device
  const addDevice = (newDevice: typeof mockDevices[0]) => {
    setDevices(prev => [...prev, newDevice]);
    toast({
      title: "Device added",
      description: `${newDevice.name} has been added to your device list`,
    });
  };

  // Update device status
  const updateDevice = (deviceId: string, updates: Partial<typeof mockDevices[0]>) => {
    setDevices(prev => prev.map(device => 
      device.id === deviceId ? { ...device, ...updates, lastSeen: new Date() } : device
    ));
  };

  // Handle device selection with auto-play
  const handleSelectDevice = (deviceId: string) => {
    setSelectedDevice(deviceId);
    const device = devices.find(d => d.id === deviceId);
    
    if (device && device.status === 'online') {
      // Auto-play the live stream when selecting an online device
      updateDevice(deviceId, {
        isPlaying: true,
        currentTrack: 'Live Stream'
      });
      
      toast({
        title: "Device selected",
        description: `${device.name} is now playing the live stream`,
      });
    }
  };

  // Auto-refresh device status every 30 seconds
  useEffect(() => {
    const interval = setInterval(() => {
      if (devices.length > 0) {
        console.log('Auto-refreshing device status...');
        // Silently update device status without showing scan toast
        devices.forEach(async (device) => {
          const isOnline = await pingDevice(device);
          if (device.status !== (isOnline ? 'online' : 'offline')) {
            updateDevice(device.id, {
              status: isOnline ? 'online' : 'offline',
              lastSeen: isOnline ? new Date() : device.lastSeen,
            });
          }
        });
      }
    }, 30000);

    return () => clearInterval(interval);
  }, [devices]);

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
        {devices.length === 0 ? (
          <div className="flex flex-col items-center justify-center min-h-[400px] text-center">
            <h2 className="text-2xl font-bold text-white mb-4">No Devices Added</h2>
            <p className="text-slate-400 mb-6">
              Start by adding your Raspberry Pi devices using the "Add Device" button above.
            </p>
          </div>
        ) : selectedDeviceData ? (
          <div className="grid grid-cols-1 xl:grid-cols-4 gap-6">
            {/* Left Panel - Device List with Clock and Search */}
            <div className="xl:col-span-2 space-y-4">
              <MasterClock />
              <DeviceSearch searchQuery={searchQuery} onSearchChange={setSearchQuery} />
              <DeviceGrid 
                devices={filteredDevices}
                selectedDevice={selectedDevice}
                onSelectDevice={handleSelectDevice}
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
                onSelectDevice={handleSelectDevice}
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
