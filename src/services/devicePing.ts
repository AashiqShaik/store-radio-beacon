
import { Device } from '@/types/device';
import { supabase } from '@/integrations/supabase/client';

interface HealthCheckResponse {
  status: 'online' | 'offline';
  hostname?: string;
  error?: string;
}

// Frontend-based health check for Tailscale IPs
const pingDeviceFrontend = async (device: Device): Promise<boolean> => {
  const isTailscaleIP = device.ipAddress.startsWith('100.');
  const connectionType = isTailscaleIP ? 'Tailscale' : 'local network';
  const timeoutMs = isTailscaleIP ? 15000 : 10000; // 15s for Tailscale, 10s for local
  
  console.log(`Frontend ping: Testing device ${device.name} at ${device.ipAddress}:5000/health via ${connectionType} (${timeoutMs/1000}s timeout)...`);
  
  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => {
      console.log(`Frontend ping timeout (${timeoutMs/1000}s) for ${device.name}`);
      controller.abort();
    }, timeoutMs);

    const healthUrl = `http://${device.ipAddress}:5000/health`;
    console.log(`Making frontend request to: ${healthUrl}`);
    
    const response = await fetch(healthUrl, {
      method: 'GET',
      signal: controller.signal,
      headers: {
        'Accept': 'application/json',
        'User-Agent': 'Lovable-Device-Manager-Frontend/1.0',
      },
      // Add mode for CORS handling
      mode: 'cors',
    });

    clearTimeout(timeoutId);

    console.log(`Frontend response status for ${device.name}: ${response.status}`);

    if (response.ok) {
      const healthData = await response.json();
      console.log(`Frontend ping successful for ${device.name} - Response:`, healthData);
      return true;
    } else {
      console.log(`Frontend ping failed for ${device.name} - HTTP Status: ${response.status}, StatusText: ${response.statusText}`);
      return false;
    }
  } catch (error) {
    if (error.name === 'AbortError') {
      console.log(`Frontend ping timeout (${timeoutMs/1000}s) for ${device.name}`);
    } else if (error.name === 'TypeError' && error.message.includes('Failed to fetch')) {
      console.log(`Frontend ping network error for ${device.name}: Likely CORS or network connectivity issue - ${error.message}`);
    } else {
      console.log(`Frontend ping error for ${device.name}:`, error.name, error.message);
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
