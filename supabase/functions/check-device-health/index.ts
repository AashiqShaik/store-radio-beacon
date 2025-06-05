
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface HealthCheckRequest {
  ipAddress: string;
}

interface HealthCheckResponse {
  status: 'online' | 'offline';
  hostname?: string;
  error?: string;
}

serve(async (req: Request): Promise<Response> => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  if (req.method !== 'POST') {
    return new Response(
      JSON.stringify({ error: 'Method not allowed' }),
      { 
        status: 405, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    );
  }

  try {
    const { ipAddress }: HealthCheckRequest = await req.json();

    if (!ipAddress) {
      return new Response(
        JSON.stringify({ error: 'IP address is required' }),
        { 
          status: 400, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      );
    }

    console.log(`Health check request for ${ipAddress}`);

    // Determine connection type and set appropriate timeout
    const isTailscaleIP = ipAddress.startsWith('100.');
    const timeoutMs = isTailscaleIP ? 15000 : 8000; // 15 seconds for Tailscale, 8 for local
    
    console.log(`Using ${timeoutMs/1000}s timeout for ${isTailscaleIP ? 'Tailscale' : 'local'} IP: ${ipAddress}`);

    // Create abort controller for timeout
    const controller = new AbortController();
    const timeoutId = setTimeout(() => {
      console.log(`Timeout reached (${timeoutMs/1000}s) for ${ipAddress}`);
      controller.abort();
    }, timeoutMs);

    try {
      const healthUrl = `http://${ipAddress}:5000/health`;
      console.log(`Making request to: ${healthUrl}`);
      
      const response = await fetch(healthUrl, {
        method: 'GET',
        signal: controller.signal,
        headers: {
          'Accept': 'application/json',
          'User-Agent': 'Lovable-Device-Manager/1.0',
          'Connection': 'close'
        },
      });

      clearTimeout(timeoutId);

      console.log(`Response status for ${ipAddress}: ${response.status}`);

      if (response.ok) {
        const healthData = await response.json();
        console.log(`Health check successful for ${ipAddress}:`, healthData);
        
        const result: HealthCheckResponse = {
          status: 'online',
          hostname: healthData.hostname || 'Unknown'
        };

        return new Response(JSON.stringify(result), {
          status: 200,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      } else {
        console.log(`Health check failed for ${ipAddress} - HTTP Status: ${response.status}`);
        
        const result: HealthCheckResponse = {
          status: 'offline',
          error: `HTTP ${response.status}`
        };

        return new Response(JSON.stringify(result), {
          status: 200,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      }
    } catch (fetchError) {
      clearTimeout(timeoutId);
      
      if (fetchError.name === 'AbortError') {
        console.log(`Health check timeout (${timeoutMs/1000}s) for ${ipAddress}`);
        
        const result: HealthCheckResponse = {
          status: 'offline',
          error: `Timeout after ${timeoutMs/1000}s`
        };

        return new Response(JSON.stringify(result), {
          status: 200,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      } else {
        console.log(`Health check network error for ${ipAddress}:`, fetchError.message);
        
        const result: HealthCheckResponse = {
          status: 'offline',
          error: fetchError.message || 'Connection failed'
        };

        return new Response(JSON.stringify(result), {
          status: 200,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      }
    }
  } catch (error) {
    console.error('Error in check-device-health function:', error);
    
    return new Response(
      JSON.stringify({ 
        status: 'offline',
        error: 'Internal server error' 
      }),
      {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );
  }
});
