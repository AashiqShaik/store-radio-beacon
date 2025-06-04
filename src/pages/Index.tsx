
import { useState } from 'react';
import { Header } from '@/components/Header';
import { EmptyDeviceState } from '@/components/EmptyDeviceState';
import { DeviceLayout } from '@/components/DeviceLayout';
import { useDeviceManager } from '@/hooks/useDeviceManager';

const Index = () => {
  const [view, setView] = useState<'list' | 'detailed'>('detailed');
  
  const {
    devices,
    selectedDevice,
    isScanning,
    scanForDevices,
    pingSingleDevice,
    addDevice,
    deleteDevice,
    updateDevice,
    handleSelectDevice,
  } = useDeviceManager();

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
          <EmptyDeviceState />
        ) : (
          <DeviceLayout
            devices={devices}
            selectedDevice={selectedDevice}
            view={view}
            onSelectDevice={handleSelectDevice}
            onUpdateDevice={updateDevice}
            onDeleteDevice={deleteDevice}
            onPingDevice={pingSingleDevice}
          />
        )}
      </div>
    </div>
  );
};

export default Index;
