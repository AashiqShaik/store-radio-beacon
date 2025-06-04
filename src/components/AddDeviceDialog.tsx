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

  // Updated connection testing using backend health check
  const testConnection = async (address: string): Promise<boolean> => {
    console.log(`Testing connection to ${address} via backend...`);
    
    try {
      const { supabase } = await import('@/integrations/supabase/client');
      
      const { data, error } = await supabase.functions.invoke('check-device-health', {
        body: { ipAddress: address }
      });

      if (error) {
        console.error('Backend connection test error:', error);
        return false;
      }

      const healthResult = data as { status: 'online' | 'offline'; hostname?: string };
      console.log('Backend connection test result:', healthResult);
      
      return healthResult.status === 'online';
    } catch (error) {
      console.error('Connection test failed:', error);
      return false;
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
      title: "Testing connection...",
      description: `Attempting to connect to ${hostAddress}`,
    });

    try {
      const isConnected = await testConnection(hostAddress);
      
      const newDevice: Device = {
        id: `rpi-${Date.now()}`,
        name: deviceName || `Raspberry Pi (${hostAddress})`,
        status: isConnected ? 'online' : 'offline',
        isPlaying: false,
        volume: 50,
        currentTrack: null,
        lastSeen: new Date(),
        location: 'Unknown Location',
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
          title: "Device added (connection limited)",
          description: `${newDevice.name} was added but appears to be offline or unreachable`,
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
            {isConnecting ? 'Testing Connection...' : 'Connect & Add Device'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
