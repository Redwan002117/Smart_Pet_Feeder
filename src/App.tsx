import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { supabase } from './supabaseClient';
import Header from './components/Header';
import Home from './pages/Home';
import Login from './pages/Login';
import SignUp from './pages/SignUp';
import ProtectedRoute from './components/ProtectedRoute';
import AdminRoute from './components/AdminRoute';
import './styles/global.css';

// Lazy load components for better performance
const Dashboard = React.lazy(() => import('./pages/Dashboard'));
const Devices = React.lazy(() => import('./pages/Devices'));
const DeviceSetup = React.lazy(() => import('./pages/DeviceSetup'));
const Pets = React.lazy(() => import('./pages/Pets'));
const Schedule = React.lazy(() => import('./pages/Schedule'));
const History = React.lazy(() => import('./pages/History'));
const Profile = React.lazy(() => import('./pages/Profile'));
const Settings = React.lazy(() => import('./pages/Settings'));
const AdminDashboard = React.lazy(() => import('./pages/AdminDashboard'));
const UserManagement = React.lazy(() => import('./pages/UserManagement'));
const AdminSettings = React.lazy(() => import('./pages/AdminSettings'));
const ForgotPassword = React.lazy(() => import('./pages/ForgotPassword'));
const AuthCallback = React.lazy(() => import('./pages/AuthCallback'));

const App: React.FC = () => {
  const [session, setSession] = useState<any>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [userProfile, setUserProfile] = useState<any>(null);
  const [isAdmin, setIsAdmin] = useState<boolean>(false);

  useEffect(() => {
    // Set up auth state listener
    const { data: authListener } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        setSession(session);
        setLoading(false);
        
        // If session exists, fetch user profile
        if (session) {
          const { data: profile } = await supabase
            .from('profiles')
            .select('*')
            .eq('id', session.user.id)
            .single();
            
          setUserProfile(profile);
          
          // Check if user is admin
          const isAdminUser = 
            session.user.email === 'petfeeder@redwancodes.com' || 
            (profile && profile.role === 'admin');
            
          setIsAdmin(isAdminUser);
        } else {
          setUserProfile(null);
          setIsAdmin(false);
        }
      }
    );

    // Initial session check
    const checkSession = async () => {
      const { data } = await supabase.auth.getSession();
      setSession(data.session);
      
      if (data.session) {
        const { data: profile } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', data.session.user.id)
          .single();
          
        setUserProfile(profile);
        
        // Check if user is admin
        const isAdminUser = 
          data.session.user.email === 'petfeeder@redwancodes.com' || 
          (profile && profile.role === 'admin');
          
        setIsAdmin(isAdminUser);
      }
      
      setLoading(false);
    };
    
    checkSession();

    // Cleanup
    return () => {
      authListener.subscription.unsubscribe();
    };
  }, []);

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
      <Header session={session} profile={userProfile} isAdmin={isAdmin} />
      <main className={session ? 'authenticated' : ''}>
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
                <Settings />
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
