
import { Device } from '@/types/device';
import { supabase } from '@/integrations/supabase/client';

interface HealthCheckResponse {
  status: 'online' | 'offline';
  hostname?: string;
  error?: string;
}

export const pingDevice = async (device: Device): Promise<boolean> => {
  console.log(`Pinging device ${device.name} at ${device.ipAddress}:5000/health via backend...`);
  
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
      console.log(`Health check successful for ${device.name} - Hostname: ${healthResult.hostname}`);
      return true;
    } else {
      console.log(`Health check failed for ${device.name} - Error: ${healthResult.error}`);
      return false;
    }
  } catch (error) {
    console.error(`Health check error for ${device.name}:`, error);
    return false;
  }
};
