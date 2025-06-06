
import { Radio, Scan, Wifi, WifiOff } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { ViewSwitcher } from './ViewSwitcher';
import { AddDeviceDialog } from './AddDeviceDialog';

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

interface HeaderProps {
  onScan: () => void;
  isScanning: boolean;
  deviceCount: number;
  onlineCount: number;
  view: 'list' | 'detailed';
  onViewChange: (view: 'list' | 'detailed') => void;
  onAddDevice: (device: Device) => void;
}

export const Header = ({ 
  onScan, 
  isScanning, 
  deviceCount, 
  onlineCount, 
  view, 
  onViewChange, 
  onAddDevice 
}: HeaderProps) => {
  return (
    <header className="bg-slate-800/50 backdrop-blur-sm border-b border-slate-700">
      <div className="container mx-auto px-4 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <div className="flex items-center space-x-2">
              <Radio className="h-8 w-8 text-blue-400" />
              <h1 className="text-2xl font-bold text-white">Radio Control Center</h1>
            </div>
            
            <div className="hidden md:flex items-center space-x-6 ml-8">
              <div className="flex items-center space-x-2">
                <Wifi className="h-5 w-5 text-green-400" />
                <span className="text-sm text-slate-300">
                  {onlineCount} online
                </span>
              </div>
              
              <div className="flex items-center space-x-2">
                <WifiOff className="h-5 w-5 text-slate-400" />
                <span className="text-sm text-slate-300">
                  {deviceCount - onlineCount} offline
                </span>
              </div>
            </div>
          </div>
          
          <div className="flex items-center space-x-4">
            <ViewSwitcher view={view} onViewChange={onViewChange} />
            
            <AddDeviceDialog onAddDevice={onAddDevice} />
            
            <Button 
              onClick={onScan}
              disabled={isScanning}
              className="bg-blue-600 hover:bg-blue-700 text-white"
            >
              <Scan className={`h-4 w-4 mr-2 ${isScanning ? 'animate-spin' : ''}`} />
              {isScanning ? 'Scanning...' : 'Scan Devices'}
            </Button>
          </div>
        </div>
      </div>
    </header>
  );
};
