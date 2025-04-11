import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://enxtmrpvfkkwikgiybsx.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImVueHRtcnB2Zmtrd2lrZ2l5YnN4Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDQwNTM3MTksImV4cCI6MjA1OTYyOTcxOX0.MjOsYzLeZcudPH6I8jN3pBiLItjw4rBzcD54sIrtmXk';

// Create the Supabase client with custom options for handling clock skew
export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: true,
    // Add tolerance for time skew between client and server (3600 seconds = 1 hour)
    flowType: 'implicit',
    clockSkewTolerance: 3600
  }
});

interface ClockCheckResult {
  hasSkew: boolean;
  skewSeconds?: number;
  serverTime?: number;
  localTime?: number;
  error?: Error;
}

// Add a listener for auth state changes to handle and log any issues
supabase.auth.onAuthStateChange((event, session) => {
  if (event === 'TOKEN_REFRESHED') {
    console.log('Token was refreshed successfully');
  } else if (event === 'SIGNED_IN' && session) {
    // Log successful sign in but check for time issues
    const now = Math.floor(Date.now() / 1000);
    const expiresAt = session.expires_at;
    
    if (expiresAt && now > expiresAt) {
      console.warn('Session expiration time is in the past. Check system clock.');
    }
    if (expiresAt && expiresAt - now > 3600 * 24) {
      console.warn('Session expiration time is far in the future. Potential clock skew.');
    }
  }
});

// Add a utility function to check system time against reliable time servers
export const checkSystemClock = async (): Promise<ClockCheckResult> => {
  // Array of time API endpoints to try in order
  const timeApis = [
    {
      url: 'https://worldtimeapi.org/api/ip',
      extractTime: (data: any) => data.unixtime
    },
    {
      url: 'https://timeapi.io/api/Time/current/zone?timeZone=UTC',
      extractTime: (data: any) => Math.floor(new Date(data.dateTime).getTime() / 1000)
    },
    {
      url: 'https://showcase.api.linx.twenty57.net/UnixTime/tounix?date=now',
      extractTime: (data: any) => parseInt(data)
    }
  ];

  // Try each API in sequence until one succeeds
  for (const api of timeApis) {
    try {
      console.log(`Attempting to fetch time from ${api.url}`);
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 3000); // 3 second timeout
      
      const response = await fetch(api.url, { 
        signal: controller.signal,
        cache: 'no-cache' 
      });
      clearTimeout(timeoutId);
      
      if (!response.ok) {
        console.warn(`Time API returned ${response.status}: ${response.statusText}`);
        continue; // Try next API
      }
      
      const data = await response.json();
      const serverTime = api.extractTime(data);
      
      if (!serverTime) {
        console.warn("Could not extract time from API response");
        continue; // Try next API
      }
      
      const localTime = Math.floor(Date.now() / 1000);
      const skew = Math.abs(serverTime - localTime);
      
      console.log(`Time check successful. Server: ${serverTime}, Local: ${localTime}, Skew: ${skew}s`);
      
      if (skew > 60) { // More than 1 minute difference
        console.warn(`System clock is off by ${skew} seconds. This may cause authentication issues.`);
        return {
          hasSkew: true,
          skewSeconds: skew,
          serverTime,
          localTime
        };
      }
      
      return { hasSkew: false };
    } catch (error) {
      console.warn(`Failed to check time with ${api.url}:`, error);
      // Continue to next API
    }
  }
  
  // If all APIs fail, handle gracefully
  console.log("All time API checks failed. Assuming clock is correct.");
  return { 
    hasSkew: false, 
    error: new Error("Could not verify system time - all time APIs failed") 
  };
};
