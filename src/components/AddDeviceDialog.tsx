
import { useState } from 'react';
import { Plus, Info } from 'lucide-react';
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
  const [tailscaleIP, setTailscaleIP] = useState('');
  const [deviceName, setDeviceName] = useState('');

  // Validate Tailscale IP format (100.x.x.x range)
  const isTailscaleIP = (ip: string): boolean => {
    const tailscaleRegex = /^100\.\d{1,3}\.\d{1,3}\.\d{1,3}$/;
    return tailscaleRegex.test(ip);
  };

  // Test connection using backend health check with Tailscale IP
  const testConnection = async (address: string): Promise<boolean> => {
    console.log(`Testing Tailscale connection to ${address} via backend...`);
    
    try {
      const { supabase } = await import('@/integrations/supabase/client');
      
      const { data, error } = await supabase.functions.invoke('check-device-health', {
        body: { ipAddress: address }
      });

      if (error) {
        console.error('Backend Tailscale connection test error:', error);
        return false;
      }

      const healthResult = data as { status: 'online' | 'offline'; hostname?: string };
      console.log('Backend Tailscale connection test result:', healthResult);
      
      return healthResult.status === 'online';
    } catch (error) {
      console.error('Tailscale connection test failed:', error);
      return false;
    }
  };

  const handleAddDevice = async () => {
    if (!tailscaleIP.trim()) {
      toast({
        title: "Error",
        description: "Please enter a Tailscale IP address",
        variant: "destructive",
      });
      return;
    }

    if (!isTailscaleIP(tailscaleIP)) {
      toast({
        title: "Invalid Tailscale IP",
        description: "Please enter a valid Tailscale IP (100.x.x.x format)",
        variant: "destructive",
      });
      return;
    }

    setIsConnecting(true);
    
    toast({
      title: "Testing Tailscale connection...",
      description: `Attempting to connect to ${tailscaleIP} via Tailscale network`,
    });

    try {
      const isConnected = await testConnection(tailscaleIP);
      
      const newDevice: Device = {
        id: `rpi-${Date.now()}`,
        name: deviceName || `Raspberry Pi (${tailscaleIP})`,
        status: isConnected ? 'online' : 'offline',
        isPlaying: false,
        volume: 50,
        currentTrack: null,
        lastSeen: new Date(),
        location: 'Remote via Tailscale',
        ipAddress: tailscaleIP,
        streamUrl: 'https://streamer.radio.co/s0066a9a04/listen',
        isScheduledContent: false,
        storeMode: false
      };

      onAddDevice(newDevice);
      setIsConnecting(false);
      setIsOpen(false);
      setTailscaleIP('');
      setDeviceName('');

      if (isConnected) {
        toast({
          title: "Device added successfully",
          description: `${newDevice.name} is online and accessible via Tailscale`,
        });
      } else {
        toast({
          title: "Device added (offline)",
          description: `${newDevice.name} was added but appears to be offline or unreachable via Tailscale`,
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error('Error adding Tailscale device:', error);
      setIsConnecting(false);
      
      toast({
        title: "Connection failed",
        description: "Could not connect to the device via Tailscale. Please check the IP and ensure the device is online.",
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
            Enter the Tailscale IP address of your Raspberry Pi. This enables secure remote access over the internet.
          </DialogDescription>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <div className="grid gap-2">
            <Label htmlFor="tailscale-ip" className="text-white flex items-center gap-2">
              Tailscale IP Address *
              <Info className="h-4 w-4 text-blue-400" />
            </Label>
            <Input
              id="tailscale-ip"
              placeholder="100.64.0.1"
              value={tailscaleIP}
              onChange={(e) => setTailscaleIP(e.target.value)}
              className={`bg-slate-700 border-slate-600 text-white ${
                tailscaleIP && !isTailscaleIP(tailscaleIP) ? 'border-red-500' : ''
              }`}
              disabled={isConnecting}
            />
            <div className="text-xs text-slate-400 space-y-1">
              <div className="flex items-center gap-1">
                <span className="w-2 h-2 bg-blue-400 rounded-full"></span>
                <span>Tailscale IPs start with 100.x.x.x</span>
              </div>
              <div className="flex items-center gap-1">
                <span className="w-2 h-2 bg-green-400 rounded-full"></span>
                <span>Accessible globally via secure VPN</span>
              </div>
            </div>
            {tailscaleIP && !isTailscaleIP(tailscaleIP) && (
              <div className="text-xs text-red-400">
                Please enter a valid Tailscale IP (100.x.x.x format)
              </div>
            )}
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
            disabled={isConnecting || !tailscaleIP || !isTailscaleIP(tailscaleIP)}
            className="bg-blue-600 hover:bg-blue-700 text-white"
          >
            {isConnecting ? 'Testing Tailscale Connection...' : 'Connect via Tailscale'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
