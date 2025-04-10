import React, { useState, useEffect } from 'react';
import { supabase } from '../subabaseClient';
import { UserProfile } from '../types';
import '../styles/UserManagement.css';

const UserManagement: React.FC = () => {
  const [loading, setLoading] = useState<boolean>(true);
  const [users, setUsers] = useState<UserProfile[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  
  // Search and filter state
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [roleFilter, setRoleFilter] = useState<string>('');
  
  // Pagination
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [totalPages, setTotalPages] = useState<number>(1);
  const usersPerPage = 10;
  
  // Delete confirmation
  const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null);

  useEffect(() => {
    fetchUsers();
  }, [currentPage, roleFilter, searchTerm]);

  const fetchUsers = async () => {
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
      
      // Build query
      let query = supabase.from('profiles').select('*', { count: 'exact' });
      
      // Apply filters
      if (roleFilter) {
        query = query.eq('role', roleFilter);
      }
      
      if (searchTerm) {
        query = query.or(`username.ilike.%${searchTerm}%,email.ilike.%${searchTerm}%,full_name.ilike.%${searchTerm}%`);
      }
      
      // Get total count
      const { count } = await query;
      setTotalPages(Math.ceil((count || 0) / usersPerPage));
      
      // Apply pagination
      const from = (currentPage - 1) * usersPerPage;
      const to = from + usersPerPage - 1;
      
      const { data, error } = await query
        .range(from, to)
        .order('created_at', { ascending: false });
        
      if (error) throw error;
      
      setUsers(data || []);
    } catch (err: any) {
      console.error('Error fetching users:', err);
      setError(err.message || 'Failed to load users');
    } finally {
      setLoading(false);
    }
  };

  const handleRoleChange = async (userId: string, newRole: 'user' | 'admin') => {
    try {
      setLoading(true);
      setError(null);
      
      const { error } = await supabase
        .from('profiles')
        .update({ role: newRole })
        .eq('id', userId);
        
      if (error) throw error;
      
      setUsers(users.map(user => 
        user.id === userId ? { ...user, role: newRole } : user
      ));
      
      setSuccess(`User role updated to ${newRole} successfully`);
    } catch (err: any) {
      console.error('Error updating user role:', err);
      setError(err.message || 'Failed to update user role');
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteUser = async (userId: string) => {
    try {
      setLoading(true);
      setError(null);
      
      // Delete user's data
      const { error: devicesError } = await supabase
        .from('devices')
        .delete()
        .eq('user_id', userId);
        
      if (devicesError) throw devicesError;
      
      const { error: petsError } = await supabase
        .from('pets')
        .delete()
        .eq('user_id', userId);
        
      if (petsError) throw petsError;
      
      const { error: schedulesError } = await supabase
        .from('schedules')
        .delete()
        .eq('user_id', userId);
        
      if (schedulesError) throw schedulesError;
      
      const { error: profileError } = await supabase
        .from('profiles')
        .delete()
        .eq('id', userId);
        
      if (profileError) throw profileError;
      
      // Attempt to delete the user auth record
      // Note: This may require additional Supabase admin privileges
      const { error } = await supabase.auth.admin.deleteUser(userId);
      if (error) throw error;
      
      setUsers(users.filter(user => user.id !== userId));
      setDeleteConfirm(null);
      setSuccess('User deleted successfully');
    } catch (err: any) {
      console.error('Error deleting user:', err);
      setError(err.message || 'Failed to delete user');
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setCurrentPage(1);  // Reset to first page on new search
    fetchUsers();
  };

  const handleRoleFilterChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setRoleFilter(e.target.value);
    setCurrentPage(1);  // Reset to first page on filter change
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString();
  };

  if (loading && users.length === 0) {
    return (
      <div className="loading-container">
        <div className="loading-spinner"></div>
        <p>Loading users...</p>
      </div>
    );
  }

  return (
    <div className="user-management-container">
      <div className="user-management-header">
        <h1>User Management</h1>
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
      
      <div className="user-controls">
        <form className="search-form" onSubmit={handleSearch}>
          <div className="search-input">
            <i className="icon-search"></i>
            <input
              type="text"
              placeholder="Search users..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <button type="submit" className="btn btn-primary">Search</button>
        </form>
        
        <div className="filter-controls">
          <label htmlFor="role-filter">Filter by Role:</label>
          <select
            id="role-filter"
            value={roleFilter}
            onChange={handleRoleFilterChange}
          >
            <option value="">All Roles</option>
            <option value="user">User</option>
            <option value="admin">Admin</option>
          </select>
        </div>
      </div>
      
      <div className="user-list-container">
        <table className="user-table">
          <thead>
            <tr>
              <th>User</th>
              <th>Email</th>
              <th>Username</th>
              <th>Joined</th>
              <th>Role</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {users.map((user) => (
              <tr key={user.id}>
                <td>
                  <div className="user-info">
                    {user.avatar_url ? (
                      <img src={user.avatar_url} alt={user.username} className="user-avatar" />
                    ) : (
                      <div className="avatar-placeholder">
                        {user.username?.[0]?.toUpperCase() || 'U'}
                      </div>
                    )}
                    <div className="user-name">
                      {user.full_name || 'No Name'}
                    </div>
                  </div>
                </td>
                <td>{user.email}</td>
                <td>@{user.username}</td>
                <td>{formatDate(user.created_at)}</td>
                <td>
                  <select
                    value={user.role}
                    onChange={(e) => handleRoleChange(user.id, e.target.value as 'user' | 'admin')}
                    className={`role-select ${user.role}`}
                    disabled={loading}
                  >
                    <option value="user">User</option>
                    <option value="admin">Admin</option>
                  </select>
                </td>
                <td>
                  <div className="user-actions">
                    <button 
                      className="btn btn-icon btn-danger" 
                      onClick={() => setDeleteConfirm(user.id)}
                      title="Delete User"
                      disabled={loading}
                    >
                      <i className="icon-trash"></i>
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      
      <div className="pagination">
        <button 
          className="btn btn-sm" 
          disabled={currentPage === 1}
          onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
        >
          Previous
        </button>
        <span className="page-info">Page {currentPage} of {totalPages}</span>
        <button 
          className="btn btn-sm" 
          disabled={currentPage === totalPages}
          onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
        >
          Next
        </button>
      </div>
      
      {/* Delete Confirmation Modal */}
      {deleteConfirm && (
        <div className="modal-overlay">
          <div className="modal-content">
            <div className="modal-header">
              <h2>Delete User</h2>
              <button 
                className="modal-close" 
                onClick={() => setDeleteConfirm(null)}
              >
                &times;
              </button>
            </div>
            
            <div className="modal-body">
              <p className="confirm-message">
                Are you sure you want to delete this user? This will also delete all associated data
                including devices, pets, and feeding history. This action cannot be undone.
              </p>
            </div>
            
            <div className="modal-footer">
              <button 
                className="btn btn-outline" 
                onClick={() => setDeleteConfirm(null)}
              >
                Cancel
              </button>
              <button 
                className="btn btn-danger" 
                onClick={() => handleDeleteUser(deleteConfirm)}
                disabled={loading}
              >
                Delete User
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default UserManagement;
