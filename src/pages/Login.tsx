import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { supabase } from '../supabaseClient.ts';
import { isValidEmail } from '../utils/validation.ts';
import '../styles/Auth.css';

const Login: React.FC = () => {
  const [email, setEmail] = useState<string>('');
  const [password, setPassword] = useState<string>('');
  const [rememberMe, setRememberMe] = useState<boolean>(false);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const navigate = useNavigate();

  useEffect(() => {
    // Check if user is already logged in
    const checkSession = async () => {
      const { data } = await supabase.auth.getSession();
      if (data.session) {
        navigate('/dashboard');
      }
    };
    checkSession();
  }, [navigate]);

  const handleEmailLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Form validation
    if (!email || !isValidEmail(email)) {
      setError('Please enter a valid email address');
      return;
    }
    
    if (!password || password.length < 6) {
      setError('Password must be at least 6 characters');
      return;
    }
    
    try {
      setLoading(true);
      setError(null);
      
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });
      
      if (error) throw error;
      
      if (data.session) {
        // Set session persistence based on rememberMe
        if (rememberMe) {
          // Session will persist for extended period
          await supabase.auth.setSession({
            access_token: data.session.access_token,
            refresh_token: data.session.refresh_token,
          });
        }
        navigate('/dashboard');
      }
    } catch (err: any) {
      setError(err.message || 'An error occurred during login');
    } finally {
      setLoading(false);
    }
  };

  const handleSocialLogin = async (provider: 'google' | 'facebook' | 'apple' | 'github') => {
    try {
      setLoading(true);
      setError(null);
      
      const { error } = await supabase.auth.signInWithOAuth({
        provider,
        options: {
          redirectTo: `${window.location.origin}/auth/callback`,
        },
      });
      
      if (error) throw error;
      
    } catch (err: any) {
      setError(err.message || `Error signing in with ${provider}`);
      setLoading(false);
    }
  };

  const handleMagicLinkLogin = async () => {
    if (!email || !isValidEmail(email)) {
      setError('Please enter a valid email address');
      return;
    }
    
    try {
      setLoading(true);
      setError(null);
      
      const { error } = await supabase.auth.signInWithOtp({
        email,
        options: {
          emailRedirectTo: `${window.location.origin}/auth/callback`,
        },
      });
      
      if (error) throw error;
      
      alert('Check your email for the magic link!');
    } catch (err: any) {
      setError(err.message || 'Error sending magic link');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-container fade-in">
      <div className="auth-card">
        <div className="auth-logo">
          <img src="/logo.svg" alt="Pet Feeder Logo" />
          <h1>Pet Feeder</h1>
        </div>
        
        <h2>Log in to your account</h2>
        
        {error && <div className="auth-error">{error}</div>}
        
        <form onSubmit={handleEmailLogin}>
          <div className="form-group">
            <label htmlFor="email">Email</label>
            <input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="your@email.com"
              required
            />
          </div>
          
          <div className="form-group">
            <label htmlFor="password">Password</label>
            <input
              id="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              required
            />
            <div className="auth-meta">
              <div className="remember-me">
                <input
                  id="remember-me"
                  type="checkbox"
                  checked={rememberMe}
                  onChange={(e) => setRememberMe(e.target.checked)}
                />
                <label htmlFor="remember-me">Remember me</label>
              </div>
              <Link to="/forgot-password" className="forgot-password">
                Forgot password?
              </Link>
            </div>
          </div>
          
          <button 
            type="submit" 
            className="btn btn-primary btn-full" 
            disabled={loading}
          >
            {loading ? 'Logging in...' : 'Log In'}
          </button>
        </form>
        
        <div className="auth-divider">
          <span>OR</span>
        </div>
        
        <div className="social-login">
          <button 
            onClick={() => handleSocialLogin('google')} 
            className="btn btn-social btn-google"
            disabled={loading}
          >
            <i className="icon-google"></i> Google
          </button>
          <button 
            onClick={() => handleSocialLogin('facebook')} 
            className="btn btn-social btn-facebook"
            disabled={loading}
          >
            <i className="icon-facebook"></i> Facebook
          </button>
          <button 
            onClick={() => handleSocialLogin('apple')} 
            className="btn btn-social btn-apple"
            disabled={loading}
          >
            <i className="icon-apple"></i> Apple
          </button>
          <button 
            onClick={() => handleSocialLogin('github')} 
            className="btn btn-social btn-github"
            disabled={loading}
          >
            <i className="icon-github"></i> GitHub
          </button>
        </div>
        
        <button 
          onClick={handleMagicLinkLogin} 
          className="btn btn-outline btn-full"
          disabled={loading || !email}
        >
          Send Magic Link
        </button>
        
        <div className="auth-footer">
          Don't have an account?{' '}
          <Link to="/signup">Create an account</Link>
        </div>
      </div>
    </div>
  );
};

export default Login;
