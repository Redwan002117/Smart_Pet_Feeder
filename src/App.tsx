import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { supabase } from './supabaseClient.ts';
import Header from './components/Header.tsx';
import Home from './pages/Home.tsx';
import Login from './pages/Login.tsx';
import SignUp from './pages/SignUp.tsx';
import ProtectedRoute from './components/ProtectedRoute.tsx';
import AdminRoute from './components/AdminRoute.tsx';
import './styles/global.css';

// Lazy load components for better performance
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

const App: React.FC = () => {
  const [session, setSession] = useState<any>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [userProfile, setUserProfile] = useState<any>(null);
  const [userPreferences, setUserPreferences] = useState<any>(null);
  const [isAdmin, setIsAdmin] = useState<boolean>(false);

  useEffect(() => {
    // Set up auth state listener
    const { data: authListener } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        setSession(session);
        
        // If session exists, fetch user profile and preferences
        if (session) {
          await fetchUserData(session);
        } else {
          setUserProfile(null);
          setUserPreferences(null);
          setIsAdmin(false);
        }
        
        setLoading(false);
      }
    );

    // Initial session check
    const checkSession = async () => {
      const { data } = await supabase.auth.getSession();
      setSession(data.session);
      
      if (data.session) {
        await fetchUserData(data.session);
      }
      
      setLoading(false);
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
      authListener.subscription.unsubscribe();
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
        
      if (profileError) throw profileError;
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
    }
  };
  
  const handleThemeChange = (theme: string) => {
    // Theme changes will be handled by the Header component directly
    // since it updates both localStorage and user preferences in the database
  };
  
  const handleDarkModeToggle = () => {
    // Dark mode toggle will be handled by the Header component directly
    // since it updates both localStorage and user preferences in the database
  };

  if (loading) {
    return (
      <div className="loading-container">
        <div className="loading-spinner"></div>
        <p>Loading Smart Pet Feeder...</p>
      </div>
    );
  }

  return (
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
        <React.Suspense fallback={
          <div className="loading-container">
            <div className="loading-spinner"></div>
            <p>Loading...</p>
          </div>
        }>
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
        </React.Suspense>
      </main>
    </Router>
  );
};

export default App;
