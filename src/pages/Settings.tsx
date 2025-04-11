import React, { useState, useEffect } from 'react';
import { supabase } from '../supabaseClient.ts';
import { useNavigate } from 'react-router-dom';
import '../styles/Settings.css';

const Settings: React.FC = () => {
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [userProfile, setUserProfile] = useState<any>(null);
  const [notificationPrefs, setNotificationPrefs] = useState<any>({});
  const [activeTab, setActiveTab] = useState<string>('notifications');
  const [currentPassword, setCurrentPassword] = useState<string>('');
  const [newPassword, setNewPassword] = useState<string>('');
  const [confirmPassword, setConfirmPassword] = useState<string>('');
  const [twoFactorEnabled, setTwoFactorEnabled] = useState<boolean>(false);
  const [showTwoFactorSetup, setShowTwoFactorSetup] = useState<boolean>(false);
  const [twoFactorQRCode, setTwoFactorQRCode] = useState<string | null>(null);
  const [twoFactorSecret, setTwoFactorSecret] = useState<string | null>(null);
  const [twoFactorCode, setTwoFactorCode] = useState<string>('');
  const [sessions, setSessions] = useState<any[]>([]);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState<boolean>(false);
  const navigate = useNavigate();

  useEffect(() => {
    fetchUserProfile();
    fetchNotificationPreferences();
    fetchSessions();
  }, []);

  const fetchUserProfile = async () => {
    try {
      setLoading(true);
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('User not authenticated');
      
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user.id)
        .single();
        
      if (error) throw error;
      
      setUserProfile(data);
      setTwoFactorEnabled(data.two_factor_enabled);
    } catch (err: any) {
      console.error('Error fetching user profile:', err);
      setError(err.message || 'Failed to load user profile');
    } finally {
      setLoading(false);
    }
  };

  const fetchNotificationPreferences = async () => {
    try {
      setLoading(true);
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('User not authenticated');
      
      const { data, error } = await supabase
        .from('notification_preferences')
        .select('*')
        .eq('user_id', user.id)
        .single();
        
      if (error) throw error;
      
      setNotificationPrefs(data);
    } catch (err: any) {
      console.error('Error fetching notification preferences:', err);
      setError(err.message || 'Failed to load notification preferences');
    } finally {
      setLoading(false);
    }
  };

  const fetchSessions = async () => {
    try {
      setLoading(true);
      // In newer Supabase versions, we don't have getSessionList API
      // Instead, we can just get the current session
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) throw new Error('No active session');
      
      // Create a sessions array with just the current session
      setSessions([{
        id: session.access_token,
        created_at: session.created_at,
        browser: navigator.userAgent.match(/chrome|firefox|safari|edge|opera/i)?.[0] || 'Unknown',
        os: navigator.platform || 'Unknown',
        current: true
      }]);
    } catch (err: any) {
      console.error('Error fetching session:', err);
      setError(err.message || 'Failed to load sessions');
    } finally {
      setLoading(false);
    }
  };

  const updateNotificationPreference = async (key: string, value: boolean) => {
    try {
      setLoading(true);
      setError(null);
      
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('User not authenticated');
      
      const { error } = await supabase
        .from('notification_preferences')
        .update({ [key]: value })
        .eq('user_id', user.id);
        
      if (error) throw error;
      
      setNotificationPrefs((prev: any) => ({ ...prev, [key]: value }));
      setSuccess('Notification preferences updated successfully');
    } catch (err: any) {
      console.error('Error updating notification preferences:', err);
      setError(err.message || 'Failed to update notification preferences');
    } finally {
      setLoading(false);
    }
  };

  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (newPassword !== confirmPassword) {
      setError('New password and confirm password do not match');
      return;
    }
    
    try {
      setLoading(true);
      setError(null);
      
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('User not authenticated');
      
      const { error } = await supabase.auth.updateUser({
        password: newPassword
      });
      
      if (error) throw error;
      
      setSuccess('Password updated successfully');
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
    } catch (err: any) {
      console.error('Error changing password:', err);
      setError(err.message || 'Failed to change password');
    } finally {
      setLoading(false);
    }
  };

  const handleSetup2FA = async () => {
    try {
      setLoading(true);
      setError(null);
      
      // Inform user that 2FA setup is not available in the current version
      setError('Two-factor authentication setup is not available in the current version of Supabase.');
      setShowTwoFactorSetup(false);
      
    } catch (err: any) {
      console.error('Error setting up 2FA:', err);
      setError(err.message || 'Failed to set up 2FA');
    } finally {
      setLoading(false);
    }
  };

  const handleEnable2FA = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      setLoading(true);
      setError(null);
      
      // Inform user that 2FA is not available
      setError('Two-factor authentication is not available in the current version of Supabase.');
      setShowTwoFactorSetup(false);
      
    } catch (err: any) {
      console.error('Error enabling 2FA:', err);
      setError(err.message || 'Failed to enable 2FA');
    } finally {
      setLoading(false);
    }
  };

  const handleDisable2FA = async () => {
    try {
      setLoading(true);
      setError(null);
      
      // Inform user that 2FA is not available
      setError('Two-factor authentication is not available in the current version of Supabase.');
      
    } catch (err: any) {
      console.error('Error disabling 2FA:', err);
      setError(err.message || 'Failed to disable 2FA');
    } finally {
      setLoading(false);
    }
  };

  const handleLogoutOtherSessions = async () => {
    try {
      setLoading(true);
      setError(null);
      
      // In newer Supabase, we can't directly log out other sessions
      // Instead, show a message that this feature is unavailable
      setSuccess('This feature is not available in the current version');
      
    } catch (err: any) {
      console.error('Error:', err);
      setError(err.message || 'Feature not available');
    } finally {
      setLoading(false);
    }
  };

  // Delete account
  const handleDeleteAccount = async () => {
    try {
      setLoading(true);
      setError(null);
      
      if (!showDeleteConfirm) {
        setShowDeleteConfirm(true);
        setLoading(false);
        return;
      }
      
      // Delete all user data
      if (!userProfile) return;
      
      // Delete from database
      const { error: devicesError } = await supabase
        .from('devices')
        .delete()
        .eq('user_id', userProfile.id);
        
      if (devicesError) throw devicesError;
      
      const { error: petsError } = await supabase
        .from('pets')
        .delete()
        .eq('user_id', userProfile.id);
        
      if (petsError) throw petsError;
      
      const { error: schedulesError } = await supabase
        .from('schedules')
        .delete()
        .eq('user_id', userProfile.id);
        
      if (schedulesError) throw schedulesError;
      
      const { error: notifError } = await supabase
        .from('notification_preferences')
        .delete()
        .eq('user_id', userProfile.id);
        
      if (notifError) throw notifError;
      
      const { error: profileError } = await supabase
        .from('profiles')
        .delete()
        .eq('id', userProfile.id);
        
      if (profileError) throw profileError;
      
      // Finally, delete the user authentication
      const { error } = await supabase.auth.admin.deleteUser(userProfile.id);
      if (error) throw error;
      
      // Sign out
      await supabase.auth.signOut();
      
      // Navigate to home page
      navigate('/', { replace: true });
    } catch (err: any) {
      console.error('Error deleting account:', err);
      setError(err.message || 'Failed to delete account');
      setShowDeleteConfirm(false);
    } finally {
      setLoading(false);
    }
  };

  // Format date
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString();
  };

  if (loading && !userProfile) {
    return (
      <div className="loading-container">
        <div className="loading-spinner"></div>
        <p>Loading settings...</p>
      </div>
    );
  }

  return (
    <div className="settings-container">
      <div className="settings-header">
        <h1>Settings</h1>
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
        <div className="settings-sidebar">
          <button 
            className={`settings-tab ${activeTab === 'notifications' ? 'active' : ''}`}
            onClick={() => setActiveTab('notifications')}
          >
            <i className="icon-bell"></i>
            <span>Notifications</span>
          </button>
          <button 
            className={`settings-tab ${activeTab === 'security' ? 'active' : ''}`}
            onClick={() => setActiveTab('security')}
          >
            <i className="icon-lock"></i>
            <span>Security</span>
          </button>
          <button 
            className={`settings-tab ${activeTab === 'account' ? 'active' : ''}`}
            onClick={() => setActiveTab('account')}
          >
            <i className="icon-user"></i>
            <span>Account</span>
          </button>
        </div>
        
        <div className="settings-main">
          {activeTab === 'notifications' && (
            <div className="settings-section">
              <h2>Notification Preferences</h2>
              <p className="section-description">
                Choose how and when you receive notifications about your pet feeder.
              </p>
              
              <div className="settings-group">
                <h3>Notification Channels</h3>
                
                <div className="setting-item">
                  <div className="setting-info">
                    <div className="setting-name">Email Notifications</div>
                    <div className="setting-description">Receive notifications about your pet feeder via email</div>
                  </div>
                  <label className="switch">
                    <input 
                      type="checkbox"
                      checked={notificationPrefs.email_notifications}
                      onChange={() => updateNotificationPreference('email_notifications', !notificationPrefs.email_notifications)}
                    />
                    <span className="slider"></span>
                  </label>
                </div>
                
                <div className="setting-item">
                  <div className="setting-info">
                    <div className="setting-name">Push Notifications</div>
                    <div className="setting-description">Receive in-browser push notifications</div>
                  </div>
                  <label className="switch">
                    <input 
                      type="checkbox"
                      checked={notificationPrefs.push_notifications}
                      onChange={() => updateNotificationPreference('push_notifications', !notificationPrefs.push_notifications)}
                    />
                    <span className="slider"></span>
                  </label>
                </div>
              </div>
              
              <div className="settings-group">
                <h3>Notification Types</h3>
                
                <div className="setting-item">
                  <div className="setting-info">
                    <div className="setting-name">Low Food Alert</div>
                    <div className="setting-description">Get notified when food level is running low</div>
                  </div>
                  <label className="switch">
                    <input 
                      type="checkbox"
                      checked={notificationPrefs.low_food_alert}
                      onChange={() => updateNotificationPreference('low_food_alert', !notificationPrefs.low_food_alert)}
                    />
                    <span className="slider"></span>
                  </label>
                </div>
                
                <div className="setting-item">
                  <div className="setting-info">
                    <div className="setting-name">Feeding Complete Alert</div>
                    <div className="setting-description">Get notified when a feeding is completed</div>
                  </div>
                  <label className="switch">
                    <input 
                      type="checkbox"
                      checked={notificationPrefs.feeding_complete_alert}
                      onChange={() => updateNotificationPreference('feeding_complete_alert', !notificationPrefs.feeding_complete_alert)}
                    />
                    <span className="slider"></span>
                  </label>
                </div>
                
                <div className="setting-item">
                  <div className="setting-info">
                    <div className="setting-name">Schedule Reminders</div>
                    <div className="setting-description">Get reminded shortly before scheduled feedings</div>
                  </div>
                  <label className="switch">
                    <input 
                      type="checkbox"
                      checked={notificationPrefs.schedule_reminder}
                      onChange={() => updateNotificationPreference('schedule_reminder', !notificationPrefs.schedule_reminder)}
                    />
                    <span className="slider"></span>
                  </label>
                </div>
              </div>
            </div>
          )}
          
          {activeTab === 'security' && (
            <div className="settings-section">
              <h2>Security Settings</h2>
              <p className="section-description">
                Manage your account security settings and authentication methods.
              </p>
              
              <div className="settings-group">
                <h3>Change Password</h3>
                <form onSubmit={handleChangePassword} className="security-form">
                  <div className="form-group">
                    <label htmlFor="current-password">Current Password</label>
                    <input
                      id="current-password"
                      type="password"
                      value={currentPassword}
                      onChange={(e) => setCurrentPassword(e.target.value)}
                      required
                    />
                  </div>
                  
                  <div className="form-group">
                    <label htmlFor="new-password">New Password</label>
                    <input
                      id="new-password"
                      type="password"
                      value={newPassword}
                      onChange={(e) => setNewPassword(e.target.value)}
                      required
                    />
                  </div>
                  
                  <div className="form-group">
                    <label htmlFor="confirm-password">Confirm Password</label>
                    <input
                      id="confirm-password"
                      type="password"
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      required
                    />
                  </div>
                  
                  <button 
                    type="submit" 
                    className="btn btn-primary"
                    disabled={loading}
                  >
                    Update Password
                  </button>
                </form>
              </div>
              
              <div className="settings-group">
                <h3>Two-Factor Authentication</h3>
                
                <div className="setting-item">
                  <div className="setting-info">
                    <div className="setting-name">Two-Factor Authentication</div>
                    <div className="setting-description">Add an extra layer of security to your account</div>
                  </div>
                  
                  {twoFactorEnabled ? (
                    <button 
                      className="btn btn-outline"
                      onClick={handleDisable2FA}
                      disabled={loading}
                    >
                      Disable 2FA
                    </button>
                  ) : (
                    <button 
                      className="btn btn-primary"
                      onClick={handleSetup2FA}
                      disabled={loading}
                    >
                      Enable 2FA
                    </button>
                  )}
                </div>
                
                {showTwoFactorSetup && (
                  <div className="twofa-setup">
                    <h4>Set up Two-Factor Authentication</h4>
                    <p>
                      Scan the QR code with an authenticator app like Google Authenticator or Authy, 
                      then enter the 6-digit code to enable 2FA.
                    </p>
                    
                    <div className="twofa-qr-container">
                      <img 
                        src={twoFactorQRCode || ''}
                        alt="2FA QR Code"
                        className="twofa-qr"
                      />
                    </div>
                    
                    {twoFactorSecret && (
                      <div className="twofa-secret">
                        <p>Or enter this code manually:</p>
                        <code>{twoFactorSecret}</code>
                      </div>
                    )}
                    
                    <form onSubmit={handleEnable2FA} className="twofa-form">
                      <div className="form-group">
                        <label htmlFor="twofa-code">Verification Code</label>
                        <input
                          id="twofa-code"
                          type="text"
                          value={twoFactorCode}
                          onChange={(e) => setTwoFactorCode(e.target.value)}
                          placeholder="Enter 6-digit code"
                          required
                          maxLength={6}
                          pattern="[0-9]{6}"
                        />
                      </div>
                      
                      <div className="twofa-buttons">
                        <button
                          type="button"
                          className="btn btn-outline"
                          onClick={() => setShowTwoFactorSetup(false)}
                        >
                          Cancel
                        </button>
                        <button
                          type="submit"
                          className="btn btn-primary"
                          disabled={loading || twoFactorCode.length !== 6}
                        >
                          Verify & Enable
                        </button>
                      </div>
                    </form>
                  </div>
                )}
              </div>
              
              <div className="settings-group">
                <h3>Active Sessions</h3>
                
                <div className="sessions-list">
                  {sessions.map((session, index) => (
                    <div key={index} className="session-item">
                      <div className="session-info">
                        <div className="session-name">
                          {session.browser} - {session.os}
                          {session.current && <span className="current-badge">Current</span>}
                        </div>
                        <div className="session-date">
                          Active since: {formatDate(session.created_at)}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
                
                <button 
                  className="btn btn-outline"
                  onClick={handleLogoutOtherSessions}
                  disabled={loading || sessions.length <= 1}
                >
                  Log Out Other Sessions
                </button>
              </div>
            </div>
          )}
          
          {activeTab === 'account' && (
            <div className="settings-section">
              <h2>Account Settings</h2>
              <p className="section-description">
                Manage your account preferences and data.
              </p>
              
              <div className="settings-group">
                <h3>Data Export</h3>
                <p className="setting-description">
                  Export all your data including device history, pet profiles, and account information.
                </p>
                <button className="btn btn-outline">
                  Export My Data
                </button>
              </div>
              
              <div className="settings-group danger-zone">
                <h3>Danger Zone</h3>
                <p className="setting-description danger-text">
                  Permanently delete your account and all associated data. This action cannot be undone.
                </p>
                
                {!showDeleteConfirm ? (
                  <button 
                    className="btn btn-danger"
                    onClick={() => setShowDeleteConfirm(true)}
                  >
                    Delete Account
                  </button>
                ) : (
                  <div className="delete-confirm">
                    <p className="confirm-text">
                      Are you absolutely sure? This will permanently delete your account, 
                      all your devices, pets, and feeding history.
                    </p>
                    <div className="confirm-buttons">
                      <button 
                        className="btn btn-outline"
                        onClick={() => setShowDeleteConfirm(false)}
                      >
                        Cancel
                      </button>
                      <button 
                        className="btn btn-danger"
                        onClick={handleDeleteAccount}
                        disabled={loading}
                      >
                        Yes, Delete My Account
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Settings;