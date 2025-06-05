
import { Device } from '@/types/device';
import { supabase } from '@/integrations/supabase/client';

interface HealthCheckResponse {
  status: 'online' | 'offline';
  hostname?: string;
  error?: string;
}

// Frontend-based health check for Tailscale IPs
const pingDeviceFrontend = async (device: Device): Promise<boolean> => {
  console.log(`Frontend ping: Testing device ${device.name} at ${device.ipAddress}:5000/health via Tailscale...`);
  
  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => {
      console.log(`Frontend ping timeout (10s) for ${device.name}`);
      controller.abort();
    }, 10000); // 10 second timeout for frontend requests

    const healthUrl = `http://${device.ipAddress}:5000/health`;
    const response = await fetch(healthUrl, {
      method: 'GET',
      signal: controller.signal,
      headers: {
        'Accept': 'application/json',
        'User-Agent': 'Lovable-Device-Manager-Frontend/1.0',
      },
    });

    clearTimeout(timeoutId);

    if (response.ok) {
      const healthData = await response.json();
      console.log(`Frontend ping successful for ${device.name} - Hostname: ${healthData.hostname || 'Unknown'}`);
      return true;
    } else {
      console.log(`Frontend ping failed for ${device.name} - HTTP Status: ${response.status}`);
      return false;
    }
  } catch (error) {
    if (error.name === 'AbortError') {
      console.log(`Frontend ping timeout for ${device.name}`);
    } else {
      console.log(`Frontend ping error for ${device.name}:`, error.message);
    }
    return false;
  }
};

// Backend-based health check for local network IPs
const pingDeviceBackend = async (device: Device): Promise<boolean> => {
  console.log(`Backend ping: Testing device ${device.name} at ${device.ipAddress}:5000/health via local network...`);
  
  try {
    const { data, error } = await supabase.functions.invoke('check-device-health', {
      body: { ipAddress: device.ipAddress }
    });

    if (error) {
      console.error(`Backend health check error for ${device.name}:`, error);
      return false;
    }

    const healthResult = data as HealthCheckResponse;
    
    if (healthResult.status === 'online') {
      console.log(`Backend ping successful for ${device.name} - Hostname: ${healthResult.hostname}`);
      return true;
    } else {
      console.log(`Backend ping failed for ${device.name} - Error: ${healthResult.error}`);
      return false;
    }
  } catch (error) {
    console.error(`Backend health check error for ${device.name}:`, error);
    return false;
  }
};

export const pingDevice = async (device: Device): Promise<boolean> => {
  console.log(`Using frontend-only ping strategy for all devices`);
  return await pingDeviceFrontend(device);
};
