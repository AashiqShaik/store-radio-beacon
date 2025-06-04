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

  // More realistic ping function using WebSocket connection test
  const pingDevice = async (device: Device): Promise<boolean> => {
    console.log(`Pinging device ${device.name} at ${device.ipAddress}...`);
    
    try {
      // Try WebSocket connection as a more reliable ping method
      return await new Promise((resolve) => {
        const timeout = setTimeout(() => {
          resolve(false);
        }, 3000);

        try {
          // Try WebSocket connection (common for IoT devices)
          const ws = new WebSocket(`ws://${device.ipAddress}:8080`);
          
          ws.onopen = () => {
            console.log(`WebSocket connection successful to ${device.name}`);
            clearTimeout(timeout);
            ws.close();
            resolve(true);
          };
          
          ws.onerror = () => {
            console.log(`WebSocket failed for ${device.name}, trying alternative methods...`);
            
            // Fallback: Try image loading method
            const img = new Image();
            const imgTimeout = setTimeout(() => {
              img.src = '';
              clearTimeout(timeout);
              resolve(false);
            }, 2000);
            
            img.onload = () => {
              console.log(`Image ping successful for ${device.name}`);
              clearTimeout(imgTimeout);
              clearTimeout(timeout);
              resolve(true);
            };
            
            img.onerror = () => {
              console.log(`All ping methods failed for ${device.name}`);
              clearTimeout(imgTimeout);
              clearTimeout(timeout);
              resolve(false);
            };
            
            // Try loading a common file that might exist
            img.src = `http://${device.ipAddress}/favicon.ico?${Date.now()}`;
          };
          
          ws.onclose = () => {
            // Connection was established but closed immediately - still counts as online
            if (!timeout) return; // Already resolved
            console.log(`WebSocket closed immediately for ${device.name} - treating as offline`);
            clearTimeout(timeout);
            resolve(false);
          };
          
        } catch (error) {
          console.log(`WebSocket creation failed for ${device.name}:`, error);
          clearTimeout(timeout);
          resolve(false);
        }
      });
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
    console.log(`Starting scan for ${devices.length} devices...`);
    
    toast({
      title: "Scanning devices...",
      description: `Testing connectivity for ${devices.length} device(s)`,
    });
    
    try {
      // Ping all devices concurrently with proper error handling
      const pingPromises = devices.map(async (device) => {
        try {
          console.log(`Scanning device: ${device.name} (${device.ipAddress})`);
          const isOnline = await pingDevice(device);
          console.log(`Scan result for ${device.name}: ${isOnline ? 'ONLINE' : 'OFFLINE'}`);
          
          return {
            ...device,
            status: (isOnline ? 'online' : 'offline') as 'online' | 'offline',
            lastSeen: isOnline ? new Date() : device.lastSeen,
          };
        } catch (error) {
          console.error(`Error scanning ${device.name}:`, error);
          return {
            ...device,
            status: 'offline' as 'online' | 'offline',
          };
        }
      });

      const updatedDevices = await Promise.all(pingPromises);
      setDevices(updatedDevices);

      const onlineCount = updatedDevices.filter(d => d.status === 'online').length;
      const offlineCount = updatedDevices.length - onlineCount;

      console.log(`Scan complete: ${onlineCount} online, ${offlineCount} offline`);

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

  // Ping a single device
  const pingSingleDevice = async (deviceId: string) => {
    const device = devices.find(d => d.id === deviceId);
    if (!device) {
      console.error(`Device with ID ${deviceId} not found`);
      return;
    }

    console.log(`Starting single ping for device: ${device.name} (${device.ipAddress})`);

    toast({
      title: "Pinging device...",
      description: `Testing connectivity for ${device.name}`,
    });

    try {
      const isOnline = await pingDevice(device);
      console.log(`Single ping result for ${device.name}: ${isOnline ? 'ONLINE' : 'OFFLINE'}`);
      
      updateDevice(deviceId, {
        status: (isOnline ? 'online' : 'offline') as 'online' | 'offline',
        lastSeen: isOnline ? new Date() : device.lastSeen,
      });

      toast({
        title: isOnline ? "Device is online" : "Device is offline",
        description: `${device.name} ${isOnline ? 'responded successfully' : 'did not respond'}`,
        variant: isOnline ? "default" : "destructive",
      });
    } catch (error) {
      console.error('Single ping error:', error);
      toast({
        title: "Ping failed",
        description: `Could not ping ${device.name}`,
        variant: "destructive",
      });
    }
  };

  // Add new device
  const addDevice = (newDevice: Device) => {
    console.log(`Adding new device: ${newDevice.name} (${newDevice.ipAddress})`);
    setDevices(prev => [...prev, newDevice]);
    toast({
      title: "Device added",
      description: `${newDevice.name} has been added to your device list`,
    });
  };

  // Delete device
  const deleteDevice = (deviceId: string) => {
    const device = devices.find(d => d.id === deviceId);
    if (!device) return;

    console.log(`Deleting device: ${device.name} (${device.ipAddress})`);
    setDevices(prev => prev.filter(d => d.id !== deviceId));
    
    if (selectedDevice === deviceId) {
      setSelectedDevice(null);
    }

    toast({
      title: "Device removed",
      description: `${device.name} has been removed from your device list`,
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

  // Auto-refresh device status every 30 seconds (but less aggressively)
  useEffect(() => {
    const interval = setInterval(async () => {
      if (devices.length > 0) {
        console.log('Auto-refreshing device status...');
        
        // Auto-refresh one device at a time to reduce network load
        for (const device of devices) {
          try {
            const isOnline = await pingDevice(device);
            const newStatus = isOnline ? 'online' : 'offline';
            
            if (device.status !== newStatus) {
              console.log(`Status change detected for ${device.name}: ${device.status} -> ${newStatus}`);
              updateDevice(device.id, {
                status: newStatus as 'online' | 'offline',
                lastSeen: isOnline ? new Date() : device.lastSeen,
              });
            }
          } catch (error) {
            console.error(`Auto-refresh error for ${device.name}:`, error);
          }
          
          // Add small delay between device pings
          await new Promise(resolve => setTimeout(resolve, 500));
        }
      }
    }, 60000); // Changed to 60 seconds to be less aggressive

    return () => clearInterval(interval);
  }, [devices]);

  return {
    devices,
    selectedDevice,
    isScanning,
    scanForDevices,
    pingSingleDevice,
    addDevice,
    deleteDevice,
    updateDevice,
    handleSelectDevice,
  };
};
