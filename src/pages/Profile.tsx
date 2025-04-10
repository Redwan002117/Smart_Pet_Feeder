import React, { useState, useEffect } from 'react';
import { supabase } from '../subabaseClient';
import { UserProfile } from '../types';
import '../styles/Profile.css';

const Profile: React.FC = () => {
  const [loading, setLoading] = useState<boolean>(true);
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  
  // Edit profile form state
  const [isEditing, setIsEditing] = useState<boolean>(false);
  const [fullName, setFullName] = useState<string>('');
  const [username, setUsername] = useState<string>('');
  
  // Avatar upload state
  const [avatarUrl, setAvatarUrl] = useState<string | null>(null);
  const [avatarFile, setAvatarFile] = useState<File | null>(null);
  const [uploadProgress, setUploadProgress] = useState<number>(0);
  const [uploading, setUploading] = useState<boolean>(false);
  
  // Admin request state
  const [showAdminRequest, setShowAdminRequest] = useState<boolean>(false);
  const [adminRequestReason, setAdminRequestReason] = useState<string>('');

  useEffect(() => {
    fetchProfile();
  }, []);

  // Fetch user profile
  const fetchProfile = async () => {
    try {
      setLoading(true);
      
      // Get current user
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('User not authenticated');
      
      // Fetch profile data
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user.id)
        .single();
        
      if (error) throw error;
      
      if (data) {
        setUserProfile(data);
        setFullName(data.full_name || '');
        setUsername(data.username || '');
        setAvatarUrl(data.avatar_url || null);
      }
    } catch (err: any) {
      console.error('Error fetching profile:', err);
      setError('Failed to load profile. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  // Update profile
  const handleUpdateProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!userProfile) return;
    
    try {
      setLoading(true);
      setError(null);
      
      // Validate username
      if (!username.trim()) {
        setError('Username cannot be empty');
        setLoading(false);
        return;
      }
      
      // Check if username already exists (excluding current user)
      const { data: usernameCheck, error: usernameError } = await supabase
        .from('profiles')
        .select('id')
        .eq('username', username)
        .neq('id', userProfile.id);
        
      if (usernameError) throw usernameError;
      
      if (usernameCheck && usernameCheck.length > 0) {
        setError('This username is already taken');
        setLoading(false);
        return;
      }
      
      // Update profile
      const updates = {
        username,
        full_name: fullName,
        updated_at: new Date().toISOString()
      };
      
      const { error } = await supabase
        .from('profiles')
        .update(updates)
        .eq('id', userProfile.id);
        
      if (error) throw error;
      
      // Upload avatar if changed
      if (avatarFile) {
        await uploadAvatar();
      }
      
      setSuccess('Profile updated successfully');
      
      // Refresh profile data
      await fetchProfile();
      setIsEditing(false);
    } catch (err: any) {
      console.error('Error updating profile:', err);
      setError(err.message || 'Failed to update profile');
    } finally {
      setLoading(false);
    }
  };

  // Handle avatar selection
  const handleAvatarChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files || e.target.files.length === 0) {
      return;
    }
    
    const file = e.target.files[0];
    if (file.size > 2 * 1024 * 1024) { // 2MB max
      setError('Image is too large. Please select an image under 2MB.');
      return;
    }
    
    // Preview image
    const reader = new FileReader();
    reader.onload = (e) => {
      if (e.target?.result) {
        setAvatarUrl(e.target.result as string);
      }
    };
    reader.readAsDataURL(file);
    
    setAvatarFile(file);
  };

  // Upload avatar to storage
  const uploadAvatar = async () => {
    if (!avatarFile || !userProfile) return;
    
    try {
      setUploading(true);
      
      // Generate a unique file name
      const fileExt = avatarFile.name.split('.').pop();
      const fileName = `${userProfile.id}-${Math.random().toString(36).substring(2)}.${fileExt}`;
      const filePath = `avatars/${fileName}`;
      
      // Upload file
      const { error: uploadError } = await supabase.storage
        .from('user-avatars')
        .upload(filePath, avatarFile, {
          cacheControl: '3600',
          upsert: true
        });
        
      if (uploadError) throw uploadError;
      
      // Get public URL
      const { data } = supabase.storage
        .from('user-avatars')
        .getPublicUrl(filePath);
        
      // Update profile with new avatar URL
      const { error: updateError } = await supabase
        .from('profiles')
        .update({
          avatar_url: data.publicUrl
        })
        .eq('id', userProfile.id);
        
      if (updateError) throw updateError;
      
      setAvatarUrl(data.publicUrl);
    } catch (err: any) {
      console.error('Error uploading avatar:', err);
      setError('Failed to upload avatar. Please try again.');
    } finally {
      setUploading(false);
      setAvatarFile(null);
    }
  };

  // Send request for admin role
  const handleAdminRequest = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!userProfile) return;
    
    try {
      setLoading(true);
      setError(null);
      
      if (!adminRequestReason.trim()) {
        setError('Please provide a reason for your request');
        return;
      }
      
      // In a real app, this would send an email or create a support ticket
      // Here we'll simulate it with a console log and a success message
      console.log('Admin request submitted:', {
        userId: userProfile.id,
        username: userProfile.username,
        email: userProfile.email,
        reason: adminRequestReason
      });
      
      setSuccess('Admin role request submitted successfully. You will be contacted soon.');
      setShowAdminRequest(false);
      setAdminRequestReason('');
    } catch (err: any) {
      console.error('Error submitting admin request:', err);
      setError(err.message || 'Failed to submit admin request');
    } finally {
      setLoading(false);
    }
  };

  // Format date for display
  const formatDate = (dateString: string | undefined) => {
    if (!dateString) return 'Unknown';
    return new Date(dateString).toLocaleDateString();
  };

  if (loading && !userProfile) {
    return (
      <div className="loading-container">
        <div className="loading-spinner"></div>
        <p>Loading profile...</p>
      </div>
    );
  }

  return (
    <div className="profile-container">
      <div className="profile-header">
        <h1>My Profile</h1>
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
      
      <div className="profile-content">
        <div className="profile-card">
          <div className="profile-sidebar">
            <div className="avatar-container">
              {avatarUrl ? (
                <img 
                  src={avatarUrl} 
                  alt={userProfile?.username || 'User'}
                  className="avatar-image" 
                />
              ) : (
                <div className="avatar-placeholder">
                  {userProfile?.username?.[0]?.toUpperCase() || 'U'}
                </div>
              )}
              
              {isEditing && (
                <div className="avatar-upload">
                  <label htmlFor="avatar-input" className="upload-label">
                    <i className="icon-camera"></i>
                    <span>Change</span>
                  </label>
                  <input 
                    id="avatar-input" 
                    type="file"
                    accept="image/*"
                    onChange={handleAvatarChange}
                    className="upload-input" 
                  />
                </div>
              )}
            </div>
            
            {!isEditing && (
              <>
                <h2 className="profile-name">
                  {userProfile?.full_name || userProfile?.username || 'User'}
                </h2>
                
                <div className="profile-meta">
                  <div className="meta-item">
                    <i className="icon-calendar"></i>
                    Joined {formatDate(userProfile?.created_at)}
                  </div>
                  
                  <div className="meta-item">
                    <i className="icon-user"></i>
                    @{userProfile?.username}
                  </div>
                </div>
                
                <button 
                  className="btn btn-primary btn-edit-profile"
                  onClick={() => setIsEditing(true)}
                >
                  Edit Profile
                </button>
              </>
            )}
          </div>
          
          <div className="profile-details">
            {isEditing ? (
              <form className="edit-profile-form" onSubmit={handleUpdateProfile}>
                <h2>Edit Profile</h2>
                
                <div className="form-group">
                  <label htmlFor="username">Username</label>
                  <input
                    id="username"
                    type="text"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    maxLength={20}
                    required
                  />
                  <small className="form-hint">This will be your public @username</small>
                </div>
                
                <div className="form-group">
                  <label htmlFor="full-name">Full Name (Optional)</label>
                  <input
                    id="full-name"
                    type="text"
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    maxLength={50}
                  />
                </div>
                
                <div className="form-group">
                  <label htmlFor="email">Email</label>
                  <input
                    id="email"
                    type="email"
                    value={userProfile?.email || ''}
                    disabled
                    className="readonly-input"
                  />
                  <small className="form-hint">Email cannot be changed</small>
                </div>
                
                <div className="form-actions">
                  <button 
                    type="button"
                    className="btn btn-outline" 
                    onClick={() => {
                      setIsEditing(false);
                      setFullName(userProfile?.full_name || '');
                      setUsername(userProfile?.username || '');
                      setAvatarUrl(userProfile?.avatar_url || null);
                      setAvatarFile(null);
                      setError(null);
                    }}
                    disabled={loading}
                  >
                    Cancel
                  </button>
                  <button 
                    type="submit"
                    className="btn btn-primary" 
                    disabled={loading}
                  >
                    {loading ? 'Saving...' : 'Save Changes'}
                  </button>
                </div>
              </form>
            ) : (
              <>
                <h2>Account Information</h2>
                
                <div className="info-group">
                  <div className="info-label">Email</div>
                  <div className="info-value">{userProfile?.email}</div>
                </div>
                
                <div className="info-group">
                  <div className="info-label">Username</div>
                  <div className="info-value">@{userProfile?.username}</div>
                </div>
                
                {userProfile?.full_name && (
                  <div className="info-group">
                    <div className="info-label">Full Name</div>
                    <div className="info-value">{userProfile.full_name}</div>
                  </div>
                )}
                
                <div className="info-group">
                  <div className="info-label">Account Type</div>
                  <div className="info-value account-type">
                    <span className={`role-badge ${userProfile?.role}`}>
                      {userProfile?.role === 'admin' ? 'Administrator' : 'Standard User'}
                    </span>
                    
                    {userProfile?.role !== 'admin' && (
                      <button 
                        className="btn btn-text"
                        onClick={() => setShowAdminRequest(true)}
                      >
                        Request Admin Access
                      </button>
                    )}
                  </div>
                </div>
                
                <div className="info-group">
                  <div className="info-label">Joined</div>
                  <div className="info-value">{formatDate(userProfile?.created_at)}</div>
                </div>
                
                <h3>Account Security</h3>
                <div className="security-links">
                  <a href="/settings" className="security-link">
                    <i className="icon-lock"></i>
                    <div className="link-content">
                      <span className="link-title">Security Settings</span>
                      <span className="link-description">Change password, enable 2FA, manage sessions</span>
                    </div>
                    <i className="icon-arrow-right"></i>
                  </a>
                  
                  <a href="/settings#notifications" className="security-link">
                    <i className="icon-bell"></i>
                    <div className="link-content">
                      <span className="link-title">Notification Preferences</span>
                      <span className="link-description">Manage your notification settings</span>
                    </div>
                    <i className="icon-arrow-right"></i>
                  </a>
                </div>
              </>
            )}
          </div>
        </div>
      </div>
      
      {/* Admin Request Modal */}
      {showAdminRequest && (
        <div className="modal-overlay">
          <div className="modal-content">
            <div className="modal-header">
              <h2>Request Admin Access</h2>
              <button 
                className="modal-close" 
                onClick={() => setShowAdminRequest(false)}
              >
                &times;
              </button>
            </div>
            
            <form onSubmit={handleAdminRequest}>
              <div className="modal-body">
                <p className="admin-request-info">
                  Admin access provides additional privileges to manage users, 
                  system settings, and access to advanced features. Please explain 
                  why you need admin access:
                </p>
                
                <div className="form-group">
                  <label htmlFor="admin-reason">Reason for Request</label>
                  <textarea
                    id="admin-reason"
                    value={adminRequestReason}
                    onChange={(e) => setAdminRequestReason(e.target.value)}
                    rows={5}
                    placeholder="Please explain why you need admin access..."
                    required
                  ></textarea>
                </div>
              </div>
              
              <div className="modal-footer">
                <button 
                  type="button" 
                  className="btn btn-outline" 
                  onClick={() => setShowAdminRequest(false)}
                >
                  Cancel
                </button>
                <button 
                  type="submit" 
                  className="btn btn-primary"
                  disabled={loading}
                >
                  Submit Request
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Profile;
