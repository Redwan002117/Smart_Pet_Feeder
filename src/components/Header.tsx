import React, { useState, useEffect, useRef } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { supabase } from '../supabaseClient';
import '../styles/Header.css';

interface HeaderProps {
  session: any;
  profile?: any;
  isAdmin?: boolean;
}

const Header: React.FC<HeaderProps> = ({ session, profile, isAdmin = false }) => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [darkMode, setDarkMode] = useState(localStorage.getItem('darkMode') === 'true');
  const [notificationCount, setNotificationCount] = useState(0);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    // Apply dark mode to body if enabled
    if (darkMode) {
      document.body.classList.add('dark-mode');
    } else {
      document.body.classList.remove('dark-mode');
    }
    localStorage.setItem('darkMode', darkMode.toString());
  }, [darkMode]);

  useEffect(() => {
    // Close dropdown when clicking outside
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setDropdownOpen(false);
      }
    }
    
    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  // Close sidebar when route changes
  useEffect(() => {
    setSidebarOpen(false);
  }, [location.pathname]);

  const toggleSidebar = () => {
    setSidebarOpen(!sidebarOpen);
  };

  const toggleDropdown = () => {
    setDropdownOpen(!dropdownOpen);
  };

  const toggleDarkMode = () => {
    setDarkMode(!darkMode);
  };

  const handleLogout = async () => {
    try {
      await supabase.auth.signOut();
      navigate('/login');
    } catch (error) {
      console.error('Error logging out:', error);
    }
  };

  return (
    <header className={`app-header ${sidebarOpen ? 'sidebar-open' : ''}`}>
      <div className="header-container">
        <div className="header-left">
          {session && (
            <button className="sidebar-toggle" onClick={toggleSidebar}>
              <i className={`icon-${sidebarOpen ? 'close' : 'menu'}`}></i>
            </button>
          )}
          <Link to="/" className="logo-container">
            <img src="/logo.svg" alt="Pet Feeder Logo" className="logo" />
            <h1 className="logo-text">Pet Feeder</h1>
          </Link>
        </div>

        <div className="header-right">
          {session ? (
            <>
              <button className="header-icon-btn" onClick={toggleDarkMode}>
                <i className={`icon-${darkMode ? 'sun' : 'moon'}`}></i>
              </button>
              
              <div className="notification-container">
                <button className="header-icon-btn">
                  <i className="icon-bell"></i>
                  {notificationCount > 0 && (
                    <span className="notification-badge">{notificationCount}</span>
                  )}
                </button>
              </div>
              
              <div className="profile-dropdown" ref={dropdownRef}>
                <button className="profile-btn" onClick={toggleDropdown}>
                  {profile?.avatar_url ? (
                    <img src={profile.avatar_url} alt={profile.username || 'User'} />
                  ) : (
                    <div className="avatar-placeholder">
                      {profile?.username?.[0]?.toUpperCase() || 'U'}
                    </div>
                  )}
                </button>
                
                {dropdownOpen && (
                  <div className="dropdown-menu">
                    <div className="dropdown-header">
                      <p className="dropdown-name">{profile?.full_name || profile?.username || 'User'}</p>
                      <p className="dropdown-email">{session.user.email}</p>
                    </div>
                    <div className="dropdown-divider"></div>
                    <Link to="/profile" className="dropdown-item">
                      <i className="icon-user"></i> Profile
                    </Link>
                    <Link to="/settings" className="dropdown-item">
                      <i className="icon-settings"></i> Settings
                    </Link>
                    {isAdmin && (
                      <Link to="/admin" className="dropdown-item">
                        <i className="icon-shield"></i> Admin Dashboard
                      </Link>
                    )}
                    <div className="dropdown-divider"></div>
                    <button className="dropdown-item" onClick={handleLogout}>
                      <i className="icon-logout"></i> Logout
                    </button>
                  </div>
                )}
              </div>
            </>
          ) : (
            <div className="auth-buttons">
              <Link to="/login" className="btn btn-text">Log In</Link>
              <Link to="/signup" className="btn btn-primary">Sign Up</Link>
            </div>
          )}
        </div>
      </div>

      {session && (
        <aside className={`sidebar ${sidebarOpen ? 'open' : ''}`}>
          <nav className="sidebar-nav">
            <Link to="/dashboard" className={location.pathname === '/dashboard' ? 'active' : ''}>
              <i className="icon-dashboard"></i>
              <span>Dashboard</span>
            </Link>
            <Link to="/devices" className={location.pathname.startsWith('/devices') ? 'active' : ''}>
              <i className="icon-device"></i>
              <span>Devices</span>
            </Link>
            <Link to="/pets" className={location.pathname.startsWith('/pets') ? 'active' : ''}>
              <i className="icon-paw"></i>
              <span>Pets</span>
            </Link>
            <Link to="/schedule" className={location.pathname.startsWith('/schedule') ? 'active' : ''}>
              <i className="icon-calendar"></i>
              <span>Schedule</span>
            </Link>
            <Link to="/history" className={location.pathname.startsWith('/history') ? 'active' : ''}>
              <i className="icon-history"></i>
              <span>History</span>
            </Link>
            
            {isAdmin && (
              <div className="sidebar-section">
                <div className="sidebar-heading">Admin</div>
                <Link to="/admin" className={location.pathname === '/admin' ? 'active' : ''}>
                  <i className="icon-dashboard"></i>
                  <span>Admin Dashboard</span>
                </Link>
                <Link to="/admin/users" className={location.pathname === '/admin/users' ? 'active' : ''}>
                  <i className="icon-users"></i>
                  <span>User Management</span>
                </Link>
                <Link to="/admin/settings" className={location.pathname === '/admin/settings' ? 'active' : ''}>
                  <i className="icon-settings"></i>
                  <span>Admin Settings</span>
                </Link>
              </div>
            )}
          </nav>
        </aside>
      )}

      {sidebarOpen && <div className="sidebar-overlay" onClick={toggleSidebar}></div>}
    </header>
  );
};

export default Header;
