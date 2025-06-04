
import { Device } from '@/types/device';

export const pingDevice = async (device: Device): Promise<boolean> => {
  console.log(`Pinging device ${device.name} at ${device.ipAddress}:5000/health...`);
  
  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 5000); // 5 second timeout

    const response = await fetch(`http://${device.ipAddress}:5000/health`, {
      method: 'GET',
      signal: controller.signal,
      mode: 'cors',
      headers: {
        'Accept': 'application/json',
      },
    });

    clearTimeout(timeoutId);

    if (response.ok) {
      console.log(`Health check successful for ${device.name} - Status: ${response.status}`);
      return true;
    } else {
      console.log(`Health check failed for ${device.name} - Status: ${response.status}`);
      return false;
    }
  } catch (error) {
    if (error.name === 'AbortError') {
      console.log(`Health check timeout for ${device.name}`);
    } else {
      console.log(`Health check error for ${device.name}:`, error);
    }
    return false;
  }
};
