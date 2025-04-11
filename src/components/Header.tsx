import React, { useState, useEffect, useRef } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { supabase } from '../supabaseClient.ts';
import '../styles/Header.css';
import '../styles/Navigation.css';

interface HeaderProps {
  session: any;
  profile?: any;
  isAdmin?: boolean;
  userPreferences?: any;
  onThemeChange?: (theme: string) => void;
  onDarkModeToggle?: () => void;
}

const Header: React.FC<HeaderProps> = ({ 
  session, 
  profile, 
  isAdmin = false,
  userPreferences = { theme: 'orange', dark_mode: false },
  onThemeChange, 
  onDarkModeToggle
}) => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [themeDropdownOpen, setThemeDropdownOpen] = useState(false);
  const [darkMode, setDarkMode] = useState(userPreferences?.dark_mode || localStorage.getItem('darkMode') === 'true');
  const [theme, setTheme] = useState(userPreferences?.theme || localStorage.getItem('theme') || 'orange');
  const [notificationCount, setNotificationCount] = useState(0);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const themeDropdownRef = useRef<HTMLDivElement>(null);
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
    
    // If callback provided, notify parent
    if (onDarkModeToggle) {
      onDarkModeToggle();
    }
  }, [darkMode, onDarkModeToggle]);
  
  useEffect(() => {
    // Apply theme
    document.body.classList.remove('theme-orange', 'theme-blue', 'theme-purple');
    document.body.classList.add(`theme-${theme}`);
    localStorage.setItem('theme', theme);
    
    // If callback provided, notify parent
    if (onThemeChange) {
      onThemeChange(theme);
    }
    
    // Update theme in database if user is logged in
    if (session?.user?.id) {
      updateUserTheme(theme, darkMode);
    }
  }, [theme, darkMode, session, onThemeChange]);

  useEffect(() => {
    // Close dropdowns when clicking outside
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setDropdownOpen(false);
      }
      
      if (themeDropdownRef.current && !themeDropdownRef.current.contains(event.target as Node)) {
        setThemeDropdownOpen(false);
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

  const updateUserTheme = async (selectedTheme: string, isDarkMode: boolean) => {
    try {
      const { error } = await supabase
        .from('user_preferences')
        .upsert({ 
          id: session.user.id,
          theme: selectedTheme,
          dark_mode: isDarkMode,
          updated_at: new Date().toISOString()
        });
        
      if (error) {
        console.error("Error updating theme preferences:", error);
      }
    } catch (err) {
      console.error("Failed to save user preferences:", err);
    }
  };

  const toggleSidebar = () => {
    setSidebarOpen(!sidebarOpen);
  };

  const toggleDropdown = () => {
    setDropdownOpen(!dropdownOpen);
  };

  const toggleThemeDropdown = () => {
    setThemeDropdownOpen(!themeDropdownOpen);
  };

  const toggleDarkMode = () => {
    setDarkMode(!darkMode);
  };
  
  const changeTheme = (newTheme: string) => {
    setTheme(newTheme);
    setThemeDropdownOpen(false);
  };

  const handleLogout = async () => {
    try {
      await supabase.auth.signOut();
      navigate('/login');
    } catch (error) {
      console.error('Error logging out:', error);
    }
  };

  const NavLinks = () => (
    <>
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
    </>
  );

  return (
    <>
      <header className={`app-header ${sidebarOpen ? 'sidebar-open' : ''}`}>
        <div className="header-container">
          <div className="header-left">
            {session && (
              <button 
                className={`hamburger-menu ${sidebarOpen ? 'open' : ''}`} 
                onClick={toggleSidebar}
                aria-label="Toggle navigation"
              >
                <div></div>
                <div></div>
                <div></div>
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
                <div className="theme-switcher" ref={themeDropdownRef}>
                  <button className="header-icon-btn" onClick={toggleThemeDropdown}>
                    {theme === 'orange' && <i className="icon-palette" style={{color: '#FF9800'}}></i>}
                    {theme === 'blue' && <i className="icon-palette" style={{color: '#2196F3'}}></i>}
                    {theme === 'purple' && <i className="icon-palette" style={{color: '#9C27B0'}}></i>}
                  </button>
                  
                  {themeDropdownOpen && (
                    <div className="dropdown-menu theme-dropdown">
                      <div className="dropdown-header">
                        <p className="dropdown-name">Choose Theme</p>
                      </div>
                      <div className="dropdown-divider"></div>
                      <button 
                        className={`dropdown-item ${theme === 'orange' ? 'active' : ''}`} 
                        onClick={() => changeTheme('orange')}
                      >
                        <i className="icon-circle" style={{color: '#FF9800'}}></i> Orange
                      </button>
                      <button 
                        className={`dropdown-item ${theme === 'blue' ? 'active' : ''}`} 
                        onClick={() => changeTheme('blue')}
                      >
                        <i className="icon-circle" style={{color: '#2196F3'}}></i> Blue
                      </button>
                      <button 
                        className={`dropdown-item ${theme === 'purple' ? 'active' : ''}`} 
                        onClick={() => changeTheme('purple')}
                      >
                        <i className="icon-circle" style={{color: '#9C27B0'}}></i> Purple
                      </button>
                    </div>
                  )}
                </div>
                
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
              <NavLinks />
            </nav>
          </aside>
        )}

        {sidebarOpen && <div className="sidebar-overlay" onClick={toggleSidebar}></div>}
      </header>
      
      {session && (
        <nav className="mobile-nav">
          <div className="mobile-nav-menu">
            <Link 
              to="/dashboard" 
              className={`mobile-nav-item ${location.pathname === '/dashboard' ? 'active' : ''}`}
            >
              <i className="mobile-nav-icon icon-dashboard"></i>
              <span>Dashboard</span>
            </Link>
            <Link 
              to="/devices" 
              className={`mobile-nav-item ${location.pathname.startsWith('/devices') ? 'active' : ''}`}
            >
              <i className="mobile-nav-icon icon-device"></i>
              <span>Devices</span>
            </Link>
            <Link 
              to="/pets" 
              className={`mobile-nav-item ${location.pathname.startsWith('/pets') ? 'active' : ''}`}
            >
              <i className="mobile-nav-icon icon-paw"></i>
              <span>Pets</span>
            </Link>
            <Link 
              to="/schedule" 
              className={`mobile-nav-item ${location.pathname.startsWith('/schedule') ? 'active' : ''}`}
            >
              <i className="mobile-nav-icon icon-calendar"></i>
              <span>Schedule</span>
            </Link>
            <Link 
              to="/profile" 
              className={`mobile-nav-item ${location.pathname === '/profile' ? 'active' : ''}`}
            >
              <i className="mobile-nav-icon icon-user"></i>
              <span>Profile</span>
            </Link>
          </div>
        </nav>
      )}
    </>
  );
};

export default Header;
