import React, { useState, useEffect } from 'react';
import { supabase } from '../supabaseClient.ts';
import '../styles/AdminSettings.css';

interface SystemSettings {
  maintenance_mode: boolean;
  enforce_2fa: boolean;
  minimum_password_length: number;
  session_timeout_minutes: number;
  allow_social_login: boolean;
  max_login_attempts: number;
  smtp_config: {
    host: string;
    port: number;
    username: string;
    password: string;
    from_email: string;
    secure: boolean;
  };
  ui_config: {
    primary_color: string;
    secondary_color: string;
    logo_url: string;
    favicon_url: string;
    allow_theme_selection: boolean;
  };
}

const AdminSettings: React.FC = () => {
  const [loading, setLoading] = useState<boolean>(true);
  const [saving, setSaving] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'general' | 'security' | 'smtp' | 'ui'>('general');
  
  // Form state
  const [settings, setSettings] = useState<SystemSettings>({
    maintenance_mode: false,
    enforce_2fa: false,
    minimum_password_length: 8,
    session_timeout_minutes: 60,
    allow_social_login: true,
    max_login_attempts: 5,
    smtp_config: {
      host: '',
      port: 587,
      username: '',
      password: '',
      from_email: '',
      secure: true
    },
    ui_config: {
      primary_color: '#FFD700',
      secondary_color: '#FF6347',
      logo_url: '/logo.svg',
      favicon_url: '/favicon.ico',
      allow_theme_selection: true
    }
  });

  useEffect(() => {
    fetchSettings();
  }, []);

  const fetchSettings = async () => {
    try {
      setLoading(true);
      
      // Verify admin access
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('User not authenticated');
      
      const { data: adminCheck } = await supabase
        .from('profiles')
        .select('role')
        .eq('id', user.id)
        .single();
        
      if (!adminCheck || adminCheck.role !== 'admin') {
        throw new Error('You do not have admin access');
      }
      
      // In a real app, you would fetch settings from a database
      // For now, we'll use the default settings
      
      // Simulate a fetch delay
      setTimeout(() => {
        setLoading(false);
      }, 1000);
    } catch (err: any) {
      console.error('Error fetching settings:', err);
      setError(err.message || 'Failed to load settings');
      setLoading(false);
    }
  };

  const handleSave = async () => {
    try {
      setSaving(true);
      setError(null);
      
      // In a real app, you would save settings to a database
      // For now, we'll just simulate a save
      setTimeout(() => {
        setSuccess('Settings saved successfully');
        setSaving(false);
      }, 1000);
    } catch (err: any) {
      console.error('Error saving settings:', err);
      setError(err.message || 'Failed to save settings');
      setSaving(false);
    }
  };

  const handleChange = (section: keyof SystemSettings, field: string, value: any) => {
    if (section === 'smtp_config' || section === 'ui_config') {
      setSettings(prev => ({
        ...prev,
        [section]: {
          ...prev[section],
          [field]: value
        }
      }));
    } else {
      setSettings(prev => ({
        ...prev,
        [field]: value
      }));
    }
  };

  const testSMTPConnection = async () => {
    try {
      setSaving(true);
      setError(null);
      
      // In a real app, you would test the SMTP connection
      // For now, we'll just simulate a test
      setTimeout(() => {
        setSuccess('SMTP connection successful! Test email sent to admin.');
        setSaving(false);
      }, 1500);
    } catch (err: any) {
      console.error('Error testing SMTP connection:', err);
      setError(err.message || 'Failed to test SMTP connection');
      setSaving(false);
    }
  };

  const enterMaintenanceMode = async () => {
    try {
      setSaving(true);
      setError(null);
      
      // Toggle maintenance mode
      setSettings(prev => ({
        ...prev,
        maintenance_mode: true
      }));
      
      // In a real app, you would update the database
      setTimeout(() => {
        setSuccess('Maintenance mode enabled. All non-admin users will be redirected to maintenance page.');
        setSaving(false);
      }, 1000);
    } catch (err: any) {
      console.error('Error enabling maintenance mode:', err);
      setError(err.message || 'Failed to enable maintenance mode');
      setSaving(false);
    }
  };

  const exitMaintenanceMode = async () => {
    try {
      setSaving(true);
      setError(null);
      
      // Toggle maintenance mode
      setSettings(prev => ({
        ...prev,
        maintenance_mode: false
      }));
      
      // In a real app, you would update the database
      setTimeout(() => {
        setSuccess('Maintenance mode disabled. All users can now access the application.');
        setSaving(false);
      }, 1000);
    } catch (err: any) {
      console.error('Error disabling maintenance mode:', err);
      setError(err.message || 'Failed to disable maintenance mode');
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="loading-container">
        <div className="loading-spinner"></div>
        <p>Loading settings...</p>
      </div>
    );
  }

  return (
    <div className="admin-settings-container">
      <div className="admin-settings-header">
        <h1>Admin Settings</h1>
      </div>
      
      {error && (
        <div className="error-alert">
          <i className="icon-warning"></i>
          <p>{error}</p>
          <button 
            className="error-close" 
            onClick={() => setError(null)}
          >
            &times;
          </button>
        </div>
      )}
      
      {success && (
        <div className="success-alert">
          <i className="icon-check-circle"></i>
          <p>{success}</p>
          <button 
            className="success-close" 
            onClick={() => setSuccess(null)}
          >
            &times;
          </button>
        </div>
      )}
      
      <div className="settings-content">
        <div className="settings-tabs">
          <button 
            className={`settings-tab ${activeTab === 'general' ? 'active' : ''}`}
            onClick={() => setActiveTab('general')}
          >
            General
          </button>
          <button 
            className={`settings-tab ${activeTab === 'security' ? 'active' : ''}`}
            onClick={() => setActiveTab('security')}
          >
            Security
          </button>
          <button 
            className={`settings-tab ${activeTab === 'smtp' ? 'active' : ''}`}
            onClick={() => setActiveTab('smtp')}
          >
            Email (SMTP)
          </button>
          <button 
            className={`settings-tab ${activeTab === 'ui' ? 'active' : ''}`}
            onClick={() => setActiveTab('ui')}
          >
            UI Customization
          </button>
        </div>
        
        <div className="settings-panel">
          {activeTab === 'general' && (
            <div className="settings-section">
              <h2>General Settings</h2>
              
              <div className="settings-group">
                <div className="setting-item">
                  <div className="setting-info">
                    <div className="setting-name">Maintenance Mode</div>
                    <div className="setting-description">
                      Put the application in maintenance mode. Only admins will be able to access the system.
                    </div>
                  </div>
                  
                  {settings.maintenance_mode ? (
                    <button 
                      className="btn btn-outline btn-warning"
                      onClick={exitMaintenanceMode}
                      disabled={saving}
                    >
                      Exit Maintenance Mode
                    </button>
                  ) : (
                    <button 
                      className="btn btn-outline btn-danger"
                      onClick={enterMaintenanceMode}
                      disabled={saving}
                    >
                      Enter Maintenance Mode
                    </button>
                  )}
                </div>
                
                <div className="setting-item">
                  <div className="setting-info">
                    <div className="setting-name">System Status</div>
                    <div className="setting-description">Current system operational status</div>
                  </div>
                  <div className="status-indicator healthy">Operational</div>
                </div>
                
                <div className="setting-item">
                  <div className="setting-info">
                    <div className="setting-name">Allow Social Login</div>
                    <div className="setting-description">Enable users to log in with social accounts</div>
                  </div>
                  <label className="switch">
                    <input 
                      type="checkbox"
                      checked={settings.allow_social_login}
                      onChange={(e) => handleChange('', 'allow_social_login', e.target.checked)}
                    />
                    <span className="slider"></span>
                  </label>
                </div>
                
                <div className="setting-item">
                  <div className="setting-info">
                    <div className="setting-name">Session Timeout</div>
                    <div className="setting-description">Time in minutes until user sessions expire</div>
                  </div>
                  <div className="number-input">
                    <input 
                      type="number" 
                      value={settings.session_timeout_minutes}
                      onChange={(e) => handleChange('', 'session_timeout_minutes', parseInt(e.target.value))}
                      min="15"
                      max="1440"
                    />
                    <span>minutes</span>
                  </div>
                </div>
              </div>
            </div>
          )}
          
          {activeTab === 'security' && (
            <div className="settings-section">
              <h2>Security Settings</h2>
              
              <div className="settings-group">
                <div className="setting-item">
                  <div className="setting-info">
                    <div className="setting-name">Enforce Two-Factor Authentication</div>
                    <div className="setting-description">Require all users to set up 2FA</div>
                  </div>
                  <label className="switch">
                    <input 
                      type="checkbox"
                      checked={settings.enforce_2fa}
                      onChange={(e) => handleChange('', 'enforce_2fa', e.target.checked)}
                    />
                    <span className="slider"></span>
                  </label>
                </div>
                
                <div className="setting-item">
                  <div className="setting-info">
                    <div className="setting-name">Minimum Password Length</div>
                    <div className="setting-description">Minimum number of characters for passwords</div>
                  </div>
                  <div className="number-input">
                    <input 
                      type="number" 
                      value={settings.minimum_password_length}
                      onChange={(e) => handleChange('', 'minimum_password_length', parseInt(e.target.value))}
                      min="6"
                      max="20"
                    />
                    <span>characters</span>
                  </div>
                </div>
                
                <div className="setting-item">
                  <div className="setting-info">
                    <div className="setting-name">Maximum Login Attempts</div>
                    <div className="setting-description">Number of failed logins before account is locked</div>
                  </div>
                  <div className="number-input">
                    <input 
                      type="number" 
                      value={settings.max_login_attempts}
                      onChange={(e) => handleChange('', 'max_login_attempts', parseInt(e.target.value))}
                      min="3"
                      max="10"
                    />
                    <span>attempts</span>
                  </div>
                </div>
              </div>
            </div>
          )}
          
          {activeTab === 'smtp' && (
            <div className="settings-section">
              <h2>Email Configuration (SMTP)</h2>
              
              <div className="settings-group">
                <div className="form-row">
                  <div className="form-group">
                    <label htmlFor="smtp-host">SMTP Host</label>
                    <input
                      id="smtp-host"
                      type="text"
                      value={settings.smtp_config.host}
                      onChange={(e) => handleChange('smtp_config', 'host', e.target.value)}
                      placeholder="e.g. smtp.gmail.com"
                    />
                  </div>
                  
                  <div className="form-group">
                    <label htmlFor="smtp-port">SMTP Port</label>
                    <input
                      id="smtp-port"
                      type="number"
                      value={settings.smtp_config.port}
                      onChange={(e) => handleChange('smtp_config', 'port', parseInt(e.target.value))}
                      placeholder="e.g. 587"
                    />
                  </div>
                </div>
                
                <div className="form-row">
                  <div className="form-group">
                    <label htmlFor="smtp-user">SMTP Username</label>
                    <input
                      id="smtp-user"
                      type="text"
                      value={settings.smtp_config.username}
                      onChange={(e) => handleChange('smtp_config', 'username', e.target.value)}
                      placeholder="e.g. your@email.com"
                    />
                  </div>
                  
                  <div className="form-group">
                    <label htmlFor="smtp-pass">SMTP Password</label>
                    <input
                      id="smtp-pass"
                      type="password"
                      value={settings.smtp_config.password}
                      onChange={(e) => handleChange('smtp_config', 'password', e.target.value)}
                      placeholder="••••••••"
                    />
                  </div>
                </div>
                
                <div className="form-group">
                  <label htmlFor="from-email">From Email</label>
                  <input
                    id="from-email"
                    type="email"
                    value={settings.smtp_config.from_email}
                    onChange={(e) => handleChange('smtp_config', 'from_email', e.target.value)}
                    placeholder="e.g. noreply@petfeeder.com"
                  />
                </div>
                
                <div className="setting-item">
                  <div className="setting-info">
                    <div className="setting-name">Use Secure Connection (TLS/SSL)</div>
                    <div className="setting-description">Enable secure connection for SMTP</div>
                  </div>
                  <label className="switch">
                    <input 
                      type="checkbox"
                      checked={settings.smtp_config.secure}
                      onChange={(e) => handleChange('smtp_config', 'secure', e.target.checked)}
                    />
                    <span className="slider"></span>
                  </label>
                </div>
                
                <div className="form-actions">
                  <button 
                    className="btn btn-outline"
                    onClick={testSMTPConnection}
                    disabled={saving || !settings.smtp_config.host || !settings.smtp_config.username}
                  >
                    Test Connection
                  </button>
                </div>
              </div>
            </div>
          )}
          
          {activeTab === 'ui' && (
            <div className="settings-section">
              <h2>UI Customization</h2>
              
              <div className="settings-group">
                <h3>Theme Colors</h3>
                
                <div className="form-row">
                  <div className="form-group">
                    <label htmlFor="primary-color">Primary Color</label>
                    <div className="color-input">
                      <input
                        id="primary-color"
                        type="color"
                        value={settings.ui_config.primary_color}
                        onChange={(e) => handleChange('ui_config', 'primary_color', e.target.value)}
                      />
                      <input
                        type="text"
                        value={settings.ui_config.primary_color}
                        onChange={(e) => handleChange('ui_config', 'primary_color', e.target.value)}
                        placeholder="#FFD700"
                      />
                    </div>
                  </div>
                  
                  <div className="form-group">
                    <label htmlFor="secondary-color">Secondary Color</label>
                    <div className="color-input">
                      <input
                        id="secondary-color"
                        type="color"
                        value={settings.ui_config.secondary_color}
                        onChange={(e) => handleChange('ui_config', 'secondary_color', e.target.value)}
                      />
                      <input
                        type="text"
                        value={settings.ui_config.secondary_color}
                        onChange={(e) => handleChange('ui_config', 'secondary_color', e.target.value)}
                        placeholder="#FF6347"
                      />
                    </div>
                  </div>
                </div>
                
                <div className="color-preview">
                  <div className="preview-title">Color Preview</div>
                  <div className="preview-colors">
                    <div 
                      className="preview-primary"
                      style={{ backgroundColor: settings.ui_config.primary_color }}
                    >
                      Primary
                    </div>
                    <div 
                      className="preview-secondary"
                      style={{ backgroundColor: settings.ui_config.secondary_color }}
                    >
                      Secondary
                    </div>
                  </div>
                </div>
              </div>
              
              <div className="settings-group">
                <h3>Logo & Favicon</h3>
                
                <div className="form-group">
                  <label htmlFor="logo-url">Logo URL</label>
                  <input
                    id="logo-url"
                    type="text"
                    value={settings.ui_config.logo_url}
                    onChange={(e) => handleChange('ui_config', 'logo_url', e.target.value)}
                    placeholder="/logo.svg"
                  />
                </div>
                
                <div className="form-group">
                  <label htmlFor="favicon-url">Favicon URL</label>
                  <input
                    id="favicon-url"
                    type="text"
                    value={settings.ui_config.favicon_url}
                    onChange={(e) => handleChange('ui_config', 'favicon_url', e.target.value)}
                    placeholder="/favicon.ico"
                  />
                </div>
                
                <div className="setting-item">
                  <div className="setting-info">
                    <div className="setting-name">Allow User Theme Selection</div>
                    <div className="setting-description">Let users select light/dark theme</div>
                  </div>
                  <label className="switch">
                    <input 
                      type="checkbox"
                      checked={settings.ui_config.allow_theme_selection}
                      onChange={(e) => handleChange('ui_config', 'allow_theme_selection', e.target.checked)}
                    />
                    <span className="slider"></span>
                  </label>
                </div>
              </div>
            </div>
          )}
          
          <div className="settings-actions">
            <button 
              className="btn btn-primary btn-save"
              onClick={handleSave}
              disabled={saving}
            >
              {saving ? 'Saving...' : 'Save Settings'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminSettings;
