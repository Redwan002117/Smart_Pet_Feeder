import React, { useState, useEffect, Suspense } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { supabase, checkSystemClock } from './supabaseClient.ts';
import Header from './components/Header.tsx';
import Home from './pages/Home.tsx';
import Login from './pages/Login.tsx';
import SignUp from './pages/SignUp.tsx';
import ProtectedRoute from './components/ProtectedRoute.tsx';
import AdminRoute from './components/AdminRoute.tsx';
import './styles/global.css';
import TimeSkewWarning from './components/TimeSkewWarning.tsx';

// Improved error boundary to handle lazy loading errors
class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    console.error("Component error:", error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="error-container">
          <h2>Something went wrong</h2>
          <p>We're sorry, there was an error loading this page.</p>
          <button onClick={() => window.location.href = '/'}>
            Return to Home
          </button>
        </div>
      );
    }

    return this.props.children;
  }
}

// Lazy load components with smaller chunks for better performance
const Dashboard = React.lazy(() => import('./pages/Dashboard.tsx'));
const Devices = React.lazy(() => import('./pages/Devices.tsx'));
const DeviceSetup = React.lazy(() => import('./pages/DeviceSetup.tsx'));
const Pets = React.lazy(() => import('./pages/Pets.tsx'));
const Schedule = React.lazy(() => import('./pages/Schedule.tsx'));
const History = React.lazy(() => import('./pages/History.tsx'));
const Profile = React.lazy(() => import('./pages/Profile.tsx'));
const Settings = React.lazy(() => import('./pages/Settings.tsx'));
const AdminDashboard = React.lazy(() => import('./pages/AdminDashboard.tsx'));
const UserManagement = React.lazy(() => import('./pages/UserManagement.tsx'));
const AdminSettings = React.lazy(() => import('./pages/AdminSettings.tsx'));
const ForgotPassword = React.lazy(() => import('./pages/ForgotPassword.tsx'));
const AuthCallback = React.lazy(() => import('./pages/AuthCallback.tsx'));

// Custom loading component with timeout detection
const LoadingFallback = ({ message = "Loading..." }) => {
  const [isDelayed, setIsDelayed] = useState(false);
  
  useEffect(() => {
    const timer = setTimeout(() => {
      setIsDelayed(true);
    }, 5000); // Show extended message after 5 seconds
    
    return () => clearTimeout(timer);
  }, []);
  
  return (
    <div className="loading-container">
      <div className="loading-spinner"></div>
      <p>{message}</p>
      {isDelayed && (
        <p className="loading-delayed-message">
          Taking longer than expected. Please wait...
        </p>
      )}
    </div>
  );
};

const App: React.FC = () => {
  const [session, setSession] = useState<any>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [userProfile, setUserProfile] = useState<any>(null);
  const [userPreferences, setUserPreferences] = useState<any>(null);
  const [isAdmin, setIsAdmin] = useState<boolean>(false);
  const [timeSkewData, setTimeSkewData] = useState<{
    hasSkew: boolean;
    skewSeconds?: number;
    serverTime?: number;
    localTime?: number;
  }>({ hasSkew: false });

  useEffect(() => {
    // Check for system clock issues on app load, but with debouncing
    const verifySystemClock = async () => {
      try {
        const clockCheck = await checkSystemClock();
        if (clockCheck.hasSkew) {
          console.warn(`System clock is off by ${clockCheck.skewSeconds} seconds. Adjust your system time for proper authentication.`);
          setTimeSkewData(clockCheck);
        }
      } catch (error) {
        console.error("Failed to check system clock:", error);
      }
    };
    
    // Only check once per session
    const hasCheckedClock = sessionStorage.getItem('clockChecked');
    if (!hasCheckedClock) {
      verifySystemClock();
      sessionStorage.setItem('clockChecked', 'true');
    }

    // Set up auth state listener with improved error handling
    const { data: authListener } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        console.log("Auth state changed:", event);
        setSession(session);
        
        // If session exists, fetch user profile and preferences
        if (session) {
          try {
            await fetchUserData(session);
          } catch (error) {
            console.error("Error in auth state change handler:", error);
          }
        } else {
          setUserProfile(null);
          setUserPreferences(null);
          setIsAdmin(false);
        }
        
        setLoading(false);
      }
    );

    // Initial session check with improved error handling
    const checkSession = async () => {
      try {
        const { data: { session }, error } = await supabase.auth.getSession();
        if (error) {
          if (error.message.includes('future') || error.message.includes('clock skew')) {
            setTimeSkewData({ hasSkew: true });
            console.error("Authentication error likely due to clock skew:", error.message);
          } else {
            console.error("Authentication error:", error.message);
          }
          setSession(null);
          setLoading(false);
          return;
        }
        
        setSession(session);
        
        if (session) {
          try {
            await fetchUserData(session);
          } catch (error) {
            console.error("Error fetching user data during session check:", error);
          }
        }
      } catch (err) {
        console.error("Error checking session:", err);
      } finally {
        // Always set loading to false, even if there are errors
        setLoading(false);
      }
    };
    
    checkSession();

    // Apply theme and dark mode from localStorage for initial render
    const storedTheme = localStorage.getItem('theme') || 'orange';
    const storedDarkMode = localStorage.getItem('darkMode') === 'true';
    
    document.body.classList.add(`theme-${storedTheme}`);
    if (storedDarkMode) {
      document.body.classList.add('dark-mode');
    }

    // Cleanup
    return () => {
      if (authListener && authListener.subscription) {
        authListener.subscription.unsubscribe();
      }
    };
  }, []);

  const fetchUserData = async (session: any) => {
    try {
      // Fetch user profile
      const { data: profile, error: profileError } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', session.user.id)
        .single();
        
      if (profileError) {
        console.error("Error fetching profile:", profileError);
        return;
      }
      
      setUserProfile(profile);
      
      // Fetch user preferences
      const { data: preferences, error: prefError } = await supabase
        .from('user_preferences')
        .select('*')
        .eq('id', session.user.id)
        .single();
      
      if (preferences) {
        setUserPreferences(preferences);
        
        // Apply theme and dark mode from preferences
        document.body.classList.remove('theme-orange', 'theme-blue', 'theme-purple');
        document.body.classList.add(`theme-${preferences.theme}`);
        
        if (preferences.dark_mode) {
          document.body.classList.add('dark-mode');
        } else {
          document.body.classList.remove('dark-mode');
        }
        
        // Save to localStorage as well
        localStorage.setItem('theme', preferences.theme);
        localStorage.setItem('darkMode', preferences.dark_mode.toString());
      } else if (prefError && prefError.code !== 'PGRST116') {
        // If error is not "no rows returned" error
        console.error("Error fetching user preferences:", prefError);
      }
      
      // Check if user is admin
      const isAdminUser = 
        session.user.email === 'petfeeder@redwancodes.com' || 
        (profile && profile.role === 'admin');
        
      setIsAdmin(isAdminUser);
    } catch (error) {
      console.error("Error fetching user data:", error);
      throw error; // Rethrow for proper error handling upstream
    }
  };
  
  const handleThemeChange = (theme: string) => {
    // Theme changes will be handled by the Header component directly
  };
  
  const handleDarkModeToggle = () => {
    // Dark mode toggle will be handled by the Header component directly
  };

  if (loading) {
    return <LoadingFallback message="Loading Smart Pet Feeder..." />;
  }

  // Handle dismissing the time skew warning
  const dismissTimeSkewWarning = () => {
    setTimeSkewData({ hasSkew: false });
    // Store dismissal for 6 hours to avoid repeated warnings
    const sixHoursFromNow = new Date().getTime() + (6 * 60 * 60 * 1000);
    localStorage.setItem('timeSkewDismissed', sixHoursFromNow.toString());
  };

  return (
    <>
      {timeSkewData.hasSkew && (
        <TimeSkewWarning 
          skewSeconds={timeSkewData.skewSeconds || 0} 
          onDismiss={dismissTimeSkewWarning}
          localTime={timeSkewData.localTime}
          serverTime={timeSkewData.serverTime}
        />
      )}
      
      <Router>
        <Header 
          session={session} 
          profile={userProfile} 
          isAdmin={isAdmin} 
          userPreferences={userPreferences}
          onThemeChange={handleThemeChange}
          onDarkModeToggle={handleDarkModeToggle}
        />
        <main className={`main-content ${session ? 'authenticated' : ''}`}>
          <ErrorBoundary>
            <Suspense fallback={<LoadingFallback message="Loading page..." />}>
              <Routes>
                {/* Public routes */}
                <Route path="/" element={<Home />} />
                <Route path="/login" element={<Login />} />
                <Route path="/signup" element={<SignUp />} />
                <Route path="/forgot-password" element={<ForgotPassword />} />
                <Route path="/auth/callback" element={<AuthCallback />} />
                
                {/* Protected routes */}
                <Route path="/dashboard" element={
                  <ProtectedRoute session={session}>
                    <Dashboard />
                  </ProtectedRoute>
                } />
                <Route path="/devices" element={
                  <ProtectedRoute session={session}>
                    <Devices />
                  </ProtectedRoute>
                } />
                <Route path="/device-setup" element={
                  <ProtectedRoute session={session}>
                    <DeviceSetup />
                  </ProtectedRoute>
                } />
                <Route path="/pets" element={
                  <ProtectedRoute session={session}>
                    <Pets />
                  </ProtectedRoute>
                } />
                <Route path="/schedule" element={
                  <ProtectedRoute session={session}>
                    <Schedule />
                  </ProtectedRoute>
                } />
                <Route path="/history" element={
                  <ProtectedRoute session={session}>
                    <History />
                  </ProtectedRoute>
                } />
                <Route path="/profile" element={
                  <ProtectedRoute session={session}>
                    <Profile />
                  </ProtectedRoute>
                } />
                <Route path="/settings" element={
                  <ProtectedRoute session={session}>
                    <Settings userPreferences={userPreferences} />
                  </ProtectedRoute>
                } />
                
                {/* Admin routes */}
                <Route path="/admin" element={
                  <AdminRoute session={session}>
                    <AdminDashboard />
                  </AdminRoute>
                } />
                <Route path="/admin/users" element={
                  <AdminRoute session={session}>
                    <UserManagement />
                  </AdminRoute>
                } />
                <Route path="/admin/settings" element={
                  <AdminRoute session={session}>
                    <AdminSettings />
                  </AdminRoute>
                } />
                
                {/* Fallback route */}
                <Route path="*" element={<Navigate to="/" />} />
              </Routes>
            </Suspense>
          </ErrorBoundary>
        </main>
      </Router>
    </>
  );
};

export default App;
