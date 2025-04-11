import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../supabaseClient.ts';

const AuthCallback: React.FC = () => {
  const [error, setError] = useState<string | null>(null);
  const navigate = useNavigate();

  useEffect(() => {
    // Handle the OAuth or magic link callback
    const handleAuthCallback = async () => {
      try {
        // Get the auth code and session from URL
        const hashParams = new URLSearchParams(window.location.hash.substring(1));
        const queryParams = new URLSearchParams(window.location.search);

        // For OAuth flows, handle the session
        if (hashParams.get('access_token')) {
          // Supabase will automatically handle this through getSession()
          const { data, error } = await supabase.auth.getSession();
          
          if (error) throw error;
          
          if (data?.session?.user) {
            // Check if profile exists, if not create one
            const { data: profile, error: profileError } = await supabase
              .from('profiles')
              .select('*')
              .eq('id', data.session.user.id)
              .single();
            
            if (profileError && profileError.message.includes('No rows found')) {
              // Create a profile for the user
              const { error: insertError } = await supabase
                .from('profiles')
                .insert([
                  {
                    id: data.session.user.id,
                    username: data.session.user.user_metadata.username || `user${Date.now().toString().slice(-6)}`,
                    email: data.session.user.email,
                    role: 'user',
                  }
                ]);
                
              if (insertError) console.error('Error creating profile:', insertError);
            }
            
            // Redirect to dashboard
            navigate('/dashboard');
          }
        }
        // For email link (OTP) flow
        else if (queryParams.get('type') === 'recovery' || queryParams.get('type') === 'signup') {
          // Get token from query params
          const token = queryParams.get('token');
          
          if (!token) throw new Error('No token found in URL');
          
          // Handle password recovery flow
          if (queryParams.get('type') === 'recovery') {
            navigate('/reset-password', { state: { token } });
          } 
          // Handle signup confirmation
          else if (queryParams.get('type') === 'signup') {
            // Confirm the signup if needed
            const { error } = await supabase.auth.verifyOtp({
              token_hash: token,
              type: 'signup',
            });
            
            if (error) throw error;
            
            // Redirect to login after successful confirmation
            navigate('/login', { 
              state: { message: 'Email confirmed! You can now log in.' } 
            });
          }
        } else {
          // Fallback - go to dashboard if logged in, otherwise to login
          const { data } = await supabase.auth.getSession();
          navigate(data.session ? '/dashboard' : '/login');
        }
      } catch (err: any) {
        console.error('Auth callback error:', err);
        setError(err.message || 'An error occurred during authentication');
      }
    };

    handleAuthCallback();
  }, [navigate]);

  if (error) {
    return (
      <div className="auth-callback-container">
        <div className="auth-callback-error">
          <i className="icon-error"></i>
          <h2>Authentication Error</h2>
          <p>{error}</p>
          <button className="btn btn-primary" onClick={() => navigate('/login')}>
            Back to Login
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="auth-callback-container">
      <div className="auth-callback-loading">
        <div className="loading-spinner"></div>
        <p>Completing authentication...</p>
      </div>
    </div>
  );
};

export default AuthCallback;
