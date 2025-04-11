import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { supabase } from '../supabaseClient.ts';
import { isValidEmail, isValidPassword, isValidUsername } from '../utils/validation.ts';
import '../styles/Auth.css';

const SignUp: React.FC = () => {
  const [email, setEmail] = useState<string>('');
  const [password, setPassword] = useState<string>('');
  const [username, setUsername] = useState<string>('');
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

  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Form validation
    if (!email || !isValidEmail(email)) {
      setError('Please enter a valid email address');
      return;
    }
    
    if (!password || !isValidPassword(password)) {
      setError('Password must be at least 8 characters and include a number or special character');
      return;
    }
    
    if (!username || !isValidUsername(username)) {
      setError('Username must be 3-20 characters and can only contain letters, numbers, underscores, and hyphens');
      return;
    }
    
    try {
      setLoading(true);
      setError(null);
      
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            username: username,
          },
          emailRedirectTo: `${window.location.origin}/auth/callback`,
        },
      });
      
      if (error) throw error;
      
      if (data.user) {
        // Also create an entry in the profiles table
        const { error: profileError } = await supabase
          .from('profiles')
          .insert([
            {
              id: data.user.id,
              username: username,
              role: 'user',
              email: email,
            },
          ]);
          
        if (profileError) throw profileError;
        
        // Show success message and redirect to login
        alert('Registration successful! Please check your email to verify your account.');
        navigate('/login');
      }
    } catch (err: any) {
      setError(err.message || 'An error occurred during signup');
    } finally {
      setLoading(false);
    }
  };

  const handleSocialSignUp = async (provider: 'google' | 'facebook' | 'apple' | 'github') => {
    try {
      setLoading(true);
      setError(null);
      
      const { error } = await supabase.auth.signInWithOAuth({
        provider,
        options: {
          redirectTo: `${window.location.origin}/auth/callback`,
          queryParams: {
            access_type: 'offline',
            prompt: 'consent',
          },
        },
      });
      
      if (error) throw error;
      
    } catch (err: any) {
      setError(err.message || `Error signing up with ${provider}`);
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
        
        <h2>Create your account</h2>
        
        {error && <div className="auth-error">{error}</div>}
        
        <form onSubmit={handleSignUp}>
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
            <label htmlFor="username">Username</label>
            <input
              id="username"
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              placeholder="yourname"
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
            <small className="form-hint">
              At least 8 characters with a number or special character
            </small>
          </div>
          
          <button 
            type="submit" 
            className="btn btn-primary btn-full" 
            disabled={loading}
          >
            {loading ? 'Creating account...' : 'Sign Up'}
          </button>
        </form>
        
        <div className="auth-divider">
          <span>OR</span>
        </div>
        
        <div className="social-login">
          <button 
            onClick={() => handleSocialSignUp('google')} 
            className="btn btn-social btn-google"
            disabled={loading}
          >
            <i className="icon-google"></i> Google
          </button>
          <button 
            onClick={() => handleSocialSignUp('facebook')} 
            className="btn btn-social btn-facebook"
            disabled={loading}
          >
            <i className="icon-facebook"></i> Facebook
          </button>
          <button 
            onClick={() => handleSocialSignUp('apple')} 
            className="btn btn-social btn-apple"
            disabled={loading}
          >
            <i className="icon-apple"></i> Apple
          </button>
          <button 
            onClick={() => handleSocialSignUp('github')} 
            className="btn btn-social btn-github"
            disabled={loading}
          >
            <i className="icon-github"></i> GitHub
          </button>
        </div>
        
        <div className="auth-footer">
          Already have an account?{' '}
          <Link to="/login">Log in</Link>
        </div>
        
        <div className="auth-terms">
          By signing up, you agree to our <a href="/terms">Terms of Service</a> and <a href="/privacy">Privacy Policy</a>
        </div>
      </div>
    </div>
  );
};

export default SignUp;
