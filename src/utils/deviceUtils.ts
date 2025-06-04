
import { Device } from '@/types/device';

export const updateDeviceInList = (
  devices: Device[], 
  deviceId: string, 
  updates: Partial<Device>
): Device[] => {
  return devices.map(device => 
    device.id === deviceId ? { ...device, ...updates, lastSeen: new Date() } : device
  );
};

export const removeDeviceFromList = (devices: Device[], deviceId: string): Device[] => {
  return devices.filter(d => d.id !== deviceId);
};

export const addDeviceToList = (devices: Device[], newDevice: Device): Device[] => {
  return [...devices, newDevice];
};

export const findDeviceById = (devices: Device[], deviceId: string): Device | undefined => {
  return devices.find(d => d.id === deviceId);
};
