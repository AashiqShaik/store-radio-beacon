import { useState, useEffect } from 'react';
import { toast } from '@/hooks/use-toast';
import { Device } from '@/types/device';
import { pingDevice } from '@/services/devicePing';
import { 
  updateDeviceInList, 
  removeDeviceFromList, 
  addDeviceToList, 
  findDeviceById 
} from '@/utils/deviceUtils';

export const useDeviceManager = () => {
  const [devices, setDevices] = useState<Device[]>([]);
  const [selectedDevice, setSelectedDevice] = useState<string | null>(null);
  const [isScanning, setIsScanning] = useState(false);

  // Enhanced device scanning for both local and Tailscale devices
  const scanForDevices = async () => {
    if (devices.length === 0) {
      toast({
        title: "No devices to scan",
        description: "Add some devices first using the 'Add Device' button",
      });
      return;
    }

    setIsScanning(true);
    const tailscaleCount = devices.filter(d => d.ipAddress.startsWith('100.')).length;
    const localCount = devices.length - tailscaleCount;
    
    console.log(`Starting scan for ${devices.length} devices (${tailscaleCount} Tailscale, ${localCount} local)...`);
    
    toast({
      title: "Scanning devices...",
      description: `Testing connectivity for ${devices.length} device(s) via Tailscale and local networks`,
    });
    
    try {
      // Ping all devices concurrently with proper error handling
      const pingPromises = devices.map(async (device) => {
        try {
          const connectionType = device.ipAddress.startsWith('100.') ? 'Tailscale' : 'local network';
          console.log(`Scanning device: ${device.name} (${device.ipAddress}) via ${connectionType}`);
          const isOnline = await pingDevice(device);
          console.log(`Scan result for ${device.name} via ${connectionType}: ${isOnline ? 'ONLINE' : 'OFFLINE'}`);
          
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

  // Ping a single device (works with both Tailscale and local IPs)
  const pingSingleDevice = async (deviceId: string) => {
    const device = findDeviceById(devices, deviceId);
    if (!device) {
      console.error(`Device with ID ${deviceId} not found`);
      return;
    }

    const connectionType = device.ipAddress.startsWith('100.') ? 'Tailscale' : 'local network';
    console.log(`Starting single ping for device: ${device.name} (${device.ipAddress}) via ${connectionType}`);

    toast({
      title: "Pinging device...",
      description: `Testing connectivity for ${device.name} via ${connectionType}`,
    });

    try {
      const isOnline = await pingDevice(device);
      console.log(`Single ping result for ${device.name} via ${connectionType}: ${isOnline ? 'ONLINE' : 'OFFLINE'}`);
      
      updateDevice(deviceId, {
        status: (isOnline ? 'online' : 'offline') as 'online' | 'offline',
        lastSeen: isOnline ? new Date() : device.lastSeen,
      });

      toast({
        title: isOnline ? "Device is online" : "Device is offline",
        description: `${device.name} ${isOnline ? 'responded successfully' : 'did not respond'} via ${connectionType}`,
        variant: isOnline ? "default" : "destructive",
      });
    } catch (error) {
      console.error('Single ping error:', error);
      toast({
        title: "Ping failed",
        description: `Could not ping ${device.name} via ${connectionType}`,
        variant: "destructive",
      });
    }
  };

  // Add new device
  const addDevice = (newDevice: Device) => {
    const connectionType = newDevice.ipAddress.startsWith('100.') ? 'Tailscale' : 'local network';
    console.log(`Adding new device: ${newDevice.name} (${newDevice.ipAddress}) via ${connectionType}`);
    setDevices(prev => addDeviceToList(prev, newDevice));
    toast({
      title: "Device added",
      description: `${newDevice.name} has been added to your device list via ${connectionType}`,
    });
  };

  // Delete device
  const deleteDevice = (deviceId: string) => {
    const device = findDeviceById(devices, deviceId);
    if (!device) return;

    const connectionType = device.ipAddress.startsWith('100.') ? 'Tailscale' : 'local network';
    console.log(`Deleting device: ${device.name} (${device.ipAddress}) via ${connectionType}`);
    setDevices(prev => removeDeviceFromList(prev, deviceId));
    
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
    setDevices(prev => updateDeviceInList(prev, deviceId, updates));
  };

  // Handle device selection with auto-play
  const handleSelectDevice = (deviceId: string) => {
    setSelectedDevice(deviceId);
    const device = findDeviceById(devices, deviceId);
    
    if (device && device.status === 'online') {
      // Auto-play the live stream when selecting an online device
      updateDevice(deviceId, {
        isPlaying: true,
        currentTrack: 'Live Stream'
      });
      
      const connectionType = device.ipAddress.startsWith('100.') ? 'via Tailscale' : 'on local network';
      toast({
        title: "Device selected",
        description: `${device.name} is now playing the live stream ${connectionType}`,
      });
    }
  };

  // Auto-refresh device status every 60 seconds for both Tailscale and local devices
  useEffect(() => {
    const interval = setInterval(async () => {
      if (devices.length > 0) {
        console.log('Auto-refreshing device status for all devices...');
        
        // Auto-refresh one device at a time to reduce network load
        for (const device of devices) {
          try {
            const connectionType = device.ipAddress.startsWith('100.') ? 'Tailscale' : 'local network';
            const isOnline = await pingDevice(device);
            const newStatus = isOnline ? 'online' : 'offline';
            
            if (device.status !== newStatus) {
              console.log(`Status change detected for ${device.name} via ${connectionType}: ${device.status} -> ${newStatus}`);
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
    }, 60000); // 60 seconds

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
