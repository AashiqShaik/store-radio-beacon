
import { useState } from 'react';
import { Plus } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
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

interface AddDeviceDialogProps {
  onAddDevice: (device: Device) => void;
}

export const AddDeviceDialog = ({ onAddDevice }: AddDeviceDialogProps) => {
  const [isOpen, setIsOpen] = useState(false);
  const [isConnecting, setIsConnecting] = useState(false);
  const [hostAddress, setHostAddress] = useState('');
  const [deviceName, setDeviceName] = useState('');

  // Function to test connectivity to the Raspberry Pi
  const testConnection = async (address: string): Promise<boolean> => {
    try {
      // Try to ping the device using a simple HTTP request
      // In a real implementation, you'd use a proper API endpoint on the Pi
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 5000); // 5 second timeout

      const response = await fetch(`http://${address}:8080/ping`, {
        method: 'GET',
        signal: controller.signal,
        mode: 'no-cors' // This allows the request even if CORS isn't set up
      });

      clearTimeout(timeoutId);
      return true; // If we get here, the device responded
    } catch (error) {
      console.log(`Connection test to ${address} failed:`, error);
      
      // Try alternative connection methods
      try {
        // Try SSH port (22)
        const img = new Image();
        img.src = `http://${address}:22`;
        await new Promise((resolve, reject) => {
          setTimeout(reject, 2000); // 2 second timeout for fallback
          img.onload = resolve;
          img.onerror = reject;
        });
        return true;
      } catch {
        // If all methods fail, still allow manual addition but warn user
        return false;
      }
    }
  };

  const handleAddDevice = async () => {
    if (!hostAddress.trim()) {
      toast({
        title: "Error",
        description: "Please enter a hostname or IP address",
        variant: "destructive",
      });
      return;
    }

    setIsConnecting(true);
    
    toast({
      title: "Connecting to device...",
      description: `Testing connection to ${hostAddress}`,
    });

    try {
      // Test connection to the device
      const isConnected = await testConnection(hostAddress);
      
      const newDevice: Device = {
        id: `rpi-${Date.now()}`,
        name: deviceName || `Raspberry Pi at ${hostAddress}`,
        status: isConnected ? 'online' : 'offline',
        isPlaying: false,
        volume: 50,
        currentTrack: null,
        lastSeen: new Date(),
        location: 'New Store',
        ipAddress: hostAddress,
        streamUrl: 'https://streamer.radio.co/s0066a9a04/listen',
        isScheduledContent: false,
        storeMode: false
      };

      onAddDevice(newDevice);
      setIsConnecting(false);
      setIsOpen(false);
      setHostAddress('');
      setDeviceName('');

      if (isConnected) {
        toast({
          title: "Device added successfully",
          description: `${newDevice.name} is online and ready to use`,
        });
      } else {
        toast({
          title: "Device added with limited connectivity",
          description: `${newDevice.name} was added but may be offline or unreachable`,
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error('Error adding device:', error);
      setIsConnecting(false);
      
      toast({
        title: "Connection failed",
        description: "Could not connect to the specified device. Please check the address and try again.",
        variant: "destructive",
      });
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button className="bg-green-600 hover:bg-green-700 text-white">
          <Plus className="h-4 w-4 mr-2" />
          Add Device
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px] bg-slate-800 border-slate-700">
        <DialogHeader>
          <DialogTitle className="text-white">Add New Raspberry Pi</DialogTitle>
          <DialogDescription className="text-slate-400">
            Enter the hostname or IP address of your Raspberry Pi. The app will test connectivity before adding the device.
          </DialogDescription>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <div className="grid gap-2">
            <Label htmlFor="hostname" className="text-white">
              Hostname or IP Address *
            </Label>
            <Input
              id="hostname"
              placeholder="192.168.1.100 or raspberrypi.local"
              value={hostAddress}
              onChange={(e) => setHostAddress(e.target.value)}
              className="bg-slate-700 border-slate-600 text-white"
              disabled={isConnecting}
            />
          </div>
          <div className="grid gap-2">
            <Label htmlFor="name" className="text-white">
              Device Name (Optional)
            </Label>
            <Input
              id="name"
              placeholder="Store 5 - Main Counter"
              value={deviceName}
              onChange={(e) => setDeviceName(e.target.value)}
              className="bg-slate-700 border-slate-600 text-white"
              disabled={isConnecting}
            />
          </div>
        </div>
        <DialogFooter>
          <Button 
            type="submit" 
            onClick={handleAddDevice}
            disabled={isConnecting}
            className="bg-blue-600 hover:bg-blue-700 text-white"
          >
            {isConnecting ? 'Connecting...' : 'Connect & Add Device'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
