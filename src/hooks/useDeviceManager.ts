
import { useState, useEffect } from 'react';
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
  streamUrl: string;
  isScheduledContent: boolean;
  storeMode: boolean;
}

export const useDeviceManager = () => {
  const [devices, setDevices] = useState<Device[]>([]);
  const [selectedDevice, setSelectedDevice] = useState<string | null>(null);
  const [isScanning, setIsScanning] = useState(false);

  // Function to ping a device and check its status
  const pingDevice = async (device: Device): Promise<boolean> => {
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
  const addDevice = (newDevice: Device) => {
    setDevices(prev => [...prev, newDevice]);
    toast({
      title: "Device added",
      description: `${newDevice.name} has been added to your device list`,
    });
  };

  // Update device status
  const updateDevice = (deviceId: string, updates: Partial<Device>) => {
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

  return {
    devices,
    selectedDevice,
    isScanning,
    scanForDevices,
    addDevice,
    updateDevice,
    handleSelectDevice,
  };
};
