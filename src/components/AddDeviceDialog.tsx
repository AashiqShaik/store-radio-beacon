
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
}

interface AddDeviceDialogProps {
  onAddDevice: (device: Device) => void;
}

export const AddDeviceDialog = ({ onAddDevice }: AddDeviceDialogProps) => {
  const [isOpen, setIsOpen] = useState(false);
  const [isScanning, setIsScanning] = useState(false);
  const [hostAddress, setHostAddress] = useState('');
  const [deviceName, setDeviceName] = useState('');

  const handleAddDevice = async () => {
    if (!hostAddress.trim()) {
      toast({
        title: "Error",
        description: "Please enter a hostname or IP address",
        variant: "destructive",
      });
      return;
    }

    setIsScanning(true);
    
    // Simulate device discovery
    setTimeout(() => {
      const newDevice: Device = {
        id: `rpi-${Date.now()}`,
        name: deviceName || `Device at ${hostAddress}`,
        status: 'online' as const,
        isPlaying: false,
        volume: 50,
        currentTrack: null,
        lastSeen: new Date(),
        location: 'New Store',
        ipAddress: hostAddress,
      };

      onAddDevice(newDevice);
      setIsScanning(false);
      setIsOpen(false);
      setHostAddress('');
      setDeviceName('');

      toast({
        title: "Device added successfully",
        description: `${newDevice.name} has been added to your devices`,
      });
    }, 2000);
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
          <DialogTitle className="text-white">Add New Device</DialogTitle>
          <DialogDescription className="text-slate-400">
            Enter the hostname or IP address of your Raspberry Pi to add it to your network.
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
            />
          </div>
        </div>
        <DialogFooter>
          <Button 
            type="submit" 
            onClick={handleAddDevice}
            disabled={isScanning}
            className="bg-blue-600 hover:bg-blue-700 text-white"
          >
            {isScanning ? 'Discovering...' : 'Add Device'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
