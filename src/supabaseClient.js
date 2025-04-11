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

// Add a utility function to check system time against a reliable time server
export const checkSystemClock = async () => {
  try {
    const response = await fetch('https://worldtimeapi.org/api/ip');
    const data = await response.json();
    
    if (data && data.unixtime) {
      const serverTime = data.unixtime;
      const localTime = Math.floor(Date.now() / 1000);
      const skew = Math.abs(serverTime - localTime);
      
      if (skew > 60) { // More than 1 minute difference
        console.warn(`System clock is off by ${skew} seconds. This may cause authentication issues.`);
        return {
          hasSkew: true,
          skewSeconds: skew,
          serverTime,
          localTime
        };
      }
    }
    return { hasSkew: false };
  } catch (error) {
    console.error('Failed to check system clock:', error);
    return { hasSkew: false, error };
  }
};
