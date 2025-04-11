import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { supabase } from '../supabaseClient.ts';
import { Device } from '../types';
import '../styles/Devices.css';

const Devices: React.FC = () => {
  const [devices, setDevices] = useState<Device[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null);
  const [editingDevice, setEditingDevice] = useState<Device | null>(null);
  const [editName, setEditName] = useState<string>('');

  useEffect(() => {
    fetchDevices();

    // Set up realtime subscription for devices
    const subscription = supabase
      .channel('devices-changes')
      .on('postgres_changes', 
        { event: '*', schema: 'public', table: 'devices' },
        handleDeviceUpdate
      )
      .subscribe();
    
    return () => {
      subscription.unsubscribe();
    };
  }, []);

  const fetchDevices = async () => {
    try {
      setLoading(true);
      
      // Get current user
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('User not authenticated');
      
      // Fetch user's devices
      const { data, error } = await supabase
        .from('devices')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });
        
      if (error) throw error;
      
      setDevices(data || []);
    } catch (err: any) {
      console.error('Error fetching devices:', err);
      setError(err.message || 'Failed to load devices');
    } finally {
      setLoading(false);
    }
  };

  // Handle realtime device updates
  const handleDeviceUpdate = (payload: any) => {
    const { eventType, new: newDevice, old: oldDevice } = payload;
    
    if (eventType === 'INSERT') {
      setDevices(prev => [newDevice, ...prev]);
    } else if (eventType === 'UPDATE') {
      setDevices(prev => 
        prev.map(device => 
          device.device_id === newDevice.device_id ? newDevice : device
        )
      );
    } else if (eventType === 'DELETE') {
      setDevices(prev => 
        prev.filter(device => device.device_id !== oldDevice.device_id)
      );
    }
  };

  // Delete a device
  const handleDelete = async (deviceId: string) => {
    try {
      const { error } = await supabase
        .from('devices')
        .delete()
        .eq('device_id', deviceId);
        
      if (error) throw error;
      
      setDeleteConfirm(null);
    } catch (err: any) {
      console.error('Error deleting device:', err);
      setError(`Failed to delete device: ${err.message}`);
    }
  };

  // Update device name
  const handleUpdateName = async () => {
    if (!editingDevice) return;
    
    try {
      const { error } = await supabase
        .from('devices')
        .update({ device_name: editName })
        .eq('device_id', editingDevice.device_id);
        
      if (error) throw error;
      
      // Close the edit dialog
      setEditingDevice(null);
    } catch (err: any) {
      console.error('Error updating device name:', err);
      setError(`Failed to update device name: ${err.message}`);
    }
  };

  // Dispense food manually
  const handleDispense = async (device: Device, amount: number = 10) => {
    try {
      // Update device status with dispense command
      const { error } = await supabase
        .from('devices')
        .update({
          last_status: {
            ...device.last_status,
            command: 'dispense',
            command_amount: amount
          }
        })
        .eq('device_id', device.device_id);
        
      if (error) throw error;
      
      // Record the feeding in history
      const { error: historyError } = await supabase
        .from('feeding_history')
        .insert([{
          device_id: device.device_id,
          time: new Date().toISOString(),
          amount: amount,
          manual: true
        }]);
        
      if (historyError) throw historyError;
      
      alert(`Dispensing ${amount}g of food from ${device.device_name}!`);
    } catch (err: any) {
      console.error('Error dispensing food:', err);
      setError(`Failed to dispense food: ${err.message}`);
    }
  };

  // Format date for display
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString();
  };

  // Render device status badge
  const renderStatusBadge = (device: Device) => {
    const foodLevel = device.last_status?.food_level || 0;
    const lastUpdate = device.last_status?.last_update;
    
    // Check if device has updated status in the last 5 minutes
    const isActive = lastUpdate && 
      (Date.now() / 1000 - parseInt(lastUpdate)) < 300; // 5 minutes
    
    if (!isActive) {
      return <span className="status-badge offline">Offline</span>;
    }
    
    if (foodLevel < 20) {
      return <span className="status-badge warning">Low Food</span>;
    }
    
    return <span className="status-badge online">Online</span>;
  };

  // Render WiFi strength icon
  const renderWifiStrength = (strength: number = 0) => {
    let bars = 0;
    
    if (strength < -80) bars = 1;
    else if (strength < -70) bars = 2;
    else if (strength < -60) bars = 3;
    else bars = 4;
    
    return (
      <div className="wifi-strength-icon">
        {Array.from({ length: 4 }).map((_, i) => (
          <div 
            key={i}
            className={`wifi-bar ${i < bars ? 'active' : ''}`}
          ></div>
        ))}
      </div>
    );
  };

  if (loading) {
    return (
      <div className="loading-container">
        <div className="loading-spinner"></div>
        <p>Loading devices...</p>
      </div>
    );
  }

  return (
    <div className="devices-container">
      <div className="devices-header">
        <h1>My Devices</h1>
        <Link to="/device-setup" className="btn btn-primary">
          <i className="icon-plus"></i> Add Device
        </Link>
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
      
      {devices.length === 0 ? (
        <div className="no-devices">
          <div className="no-devices-icon">
            <i className="icon-device-off"></i>
          </div>
          <h2>No devices found</h2>
          <p>Get started by adding your first Pet Feeder device.</p>
          <Link to="/device-setup" className="btn btn-primary">
            Set Up New Device
          </Link>
        </div>
      ) : (
        <div className="devices-grid">
          {devices.map((device) => {
            const foodLevel = device.last_status?.food_level || 0;
            const wifiStrength = device.last_status?.wifi_strength || 0;
            const lastUpdate = device.last_status?.last_update 
              ? new Date(parseInt(device.last_status.last_update) * 1000).toLocaleString()
              : 'Never';
            
            return (
              <div key={device.device_id} className="device-card">
                <div className="device-card-header">
                  <h3>{device.device_name}</h3>
                  {renderStatusBadge(device)}
                </div>
                
                <div className="device-card-content">
                  <div className="device-metric">
                    <div className="metric-label">Food Level</div>
                    <div className="progress-bar">
                      <div 
                        className="progress-fill" 
                        style={{ width: `${foodLevel}%` }}
                      ></div>
                      <span className="progress-text">{foodLevel}%</span>
                    </div>
                  </div>
                  
                  <div className="device-metric">
                    <div className="metric-label">WiFi Signal</div>
                    <div className="wifi-container">
                      {renderWifiStrength(wifiStrength)}
                      <span className="wifi-text">{wifiStrength} dBm</span>
                    </div>
                  </div>
                  
                  <div className="device-metric">
                    <div className="metric-label">Last Update</div>
                    <div className="metric-value">{lastUpdate}</div>
                  </div>
                  
                  <div className="device-metric">
                    <div className="metric-label">Added On</div>
                    <div className="metric-value">{formatDate(device.created_at)}</div>
                  </div>
                </div>
                
                <div className="device-card-actions">
                  <button 
                    className="btn btn-icon" 
                    onClick={() => {
                      setEditingDevice(device);
                      setEditName(device.device_name);
                    }}
                    title="Edit Device"
                  >
                    <i className="icon-edit"></i>
                  </button>
                  
                  <button 
                    className="btn btn-icon btn-warning" 
                    onClick={() => handleDispense(device)}
                    title="Dispense Food"
                  >
                    <i className="icon-food"></i>
                  </button>
                  
                  <button 
                    className="btn btn-icon btn-danger" 
                    onClick={() => setDeleteConfirm(device.device_id)}
                    title="Delete Device"
                  >
                    <i className="icon-trash"></i>
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}
      
      {/* Edit Device Modal */}
      {editingDevice && (
        <div className="modal-overlay">
          <div className="modal-content">
            <div className="modal-header">
              <h2>Edit Device</h2>
              <button 
                className="modal-close" 
                onClick={() => setEditingDevice(null)}
              >
                &times;
              </button>
            </div>
            
            <div className="modal-body">
              <div className="form-group">
                <label htmlFor="device-name">Device Name</label>
                <input
                  id="device-name"
                  type="text"
                  value={editName}
                  onChange={(e) => setEditName(e.target.value)}
                  placeholder="Enter device name"
                />
              </div>
            </div>
            
            <div className="modal-footer">
              <button 
                className="btn btn-outline" 
                onClick={() => setEditingDevice(null)}
              >
                Cancel
              </button>
              <button 
                className="btn btn-primary" 
                onClick={handleUpdateName}
              >
                Save Changes
              </button>
            </div>
          </div>
        </div>
      )}
      
      {/* Delete Confirmation Modal */}
      {deleteConfirm && (
        <div className="modal-overlay">
          <div className="modal-content">
            <div className="modal-header">
              <h2>Confirm Deletion</h2>
              <button 
                className="modal-close" 
                onClick={() => setDeleteConfirm(null)}
              >
                &times;
              </button>
            </div>
            
            <div className="modal-body">
              <p className="confirm-message">
                Are you sure you want to delete this device? This action cannot be undone.
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
                onClick={() => handleDelete(deleteConfirm)}
              >
                Delete Device
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Devices;