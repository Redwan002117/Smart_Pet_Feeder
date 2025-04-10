import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { supabase } from '../supabaseClient';
import { Line, Bar } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  Title,
  Tooltip,
  Legend,
} from 'chart.js';
import { Device, FeedingHistory, Schedule } from '../types';
import '../styles/Dashboard.css';

// Register Chart.js components
ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  Title,
  Tooltip,
  Legend
);

const Dashboard: React.FC = () => {
  const [devices, setDevices] = useState<Device[]>([]);
  const [selectedDevice, setSelectedDevice] = useState<Device | null>(null);
  const [feedingHistory, setFeedingHistory] = useState<FeedingHistory[]>([]);
  const [upcomingSchedules, setUpcomingSchedules] = useState<Schedule[]>([]);
  const [feedingAmount, setFeedingAmount] = useState<number>(10);
  const [activeTab, setActiveTab] = useState<'manual' | 'scheduled'>('manual');
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isDispensing, setIsDispensing] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [totalPages, setTotalPages] = useState<number>(1);
  const [chartData, setChartData] = useState<any>(null);

  const itemsPerPage = 5;

  useEffect(() => {
    const fetchInitialData = async () => {
      setIsLoading(true);
      try {
        // Get current user
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) throw new Error('User not found');
        
        // Fetch devices
        const { data: devicesData, error: devicesError } = await supabase
          .from('devices')
          .select('*')
          .eq('user_id', user.id);
          
        if (devicesError) throw devicesError;
        
        if (devicesData && devicesData.length > 0) {
          setDevices(devicesData);
          setSelectedDevice(devicesData[0]);
          
          // Fetch feeding history for the first device
          await fetchFeedingHistory(devicesData[0].device_id);
          
          // Fetch upcoming schedules for the first device
          await fetchUpcomingSchedules(devicesData[0].device_id, user.id);
        } else {
          // No devices found
          setDevices([]);
          setSelectedDevice(null);
        }
      } catch (error: any) {
        console.error('Error fetching data:', error);
        setError(error.message);
      } finally {
        setIsLoading(false);
      }
    };

    fetchInitialData();
    
    // Set up realtime subscriptions
    const devicesSubscription = supabase
      .channel('devices-changes')
      .on('postgres_changes', 
        { event: '*', schema: 'public', table: 'devices' },
        handleDeviceUpdate
      )
      .subscribe();
      
    const historySubscription = supabase
      .channel('history-changes')
      .on('postgres_changes',
        { event: 'INSERT', schema: 'public', table: 'feeding_history' },
        handleHistoryUpdate
      )
      .subscribe();
      
    const schedulesSubscription = supabase
      .channel('schedules-changes')
      .on('postgres_changes',
        { event: '*', schema: 'public', table: 'schedules' },
        handleScheduleUpdate
      )
      .subscribe();
    
    // Cleanup subscriptions
    return () => {
      devicesSubscription.unsubscribe();
      historySubscription.unsubscribe();
      schedulesSubscription.unsubscribe();
    };
  }, []);

  // Handle realtime device updates
  const handleDeviceUpdate = async (payload: any) => {
    const { eventType, new: newDevice, old: oldDevice } = payload;
    
    // Update the devices list
    if (eventType === 'INSERT') {
      setDevices(prev => [...prev, newDevice]);
    } else if (eventType === 'UPDATE') {
      setDevices(prev => 
        prev.map(device => 
          device.device_id === newDevice.device_id ? newDevice : device
        )
      );
      
      // If this is the selected device, update it
      if (selectedDevice && selectedDevice.device_id === newDevice.device_id) {
        setSelectedDevice(newDevice);
      }
    } else if (eventType === 'DELETE') {
      setDevices(prev => 
        prev.filter(device => device.device_id !== oldDevice.device_id)
      );
      
      // If this was the selected device, select another one or null
      if (selectedDevice && selectedDevice.device_id === oldDevice.device_id) {
        const { data: { user } } = await supabase.auth.getUser();
        const { data } = await supabase
          .from('devices')
          .select('*')
          .eq('user_id', user?.id)
          .limit(1);
          
        setSelectedDevice(data && data.length > 0 ? data[0] : null);
      }
    }
  };
  
  // Handle realtime feeding history updates
  const handleHistoryUpdate = (payload: any) => {
    const { new: newFeeding } = payload;
    
    // Only update if it's for the selected device
    if (selectedDevice && newFeeding.device_id === selectedDevice.device_id) {
      setFeedingHistory(prev => [newFeeding, ...prev.slice(0, itemsPerPage - 1)]);
      
      // Update chart data
      updateChartData([newFeeding, ...feedingHistory]);
    }
  };
  
  // Handle realtime schedule updates
  const handleScheduleUpdate = (payload: any) => {
    const { eventType, new: newSchedule, old: oldSchedule } = payload;
    
    // Only update if it's for the selected device
    if (!selectedDevice) return;
    
    if (eventType === 'INSERT' && newSchedule.device_id === selectedDevice.device_id) {
      setUpcomingSchedules(prev => {
        const updated = [...prev, newSchedule]
          .sort((a, b) => new Date(a.time).getTime() - new Date(b.time).getTime())
          .filter(schedule => new Date(schedule.time) > new Date())
          .slice(0, 2);
        return updated;
      });
    } else if (eventType === 'UPDATE' && newSchedule.device_id === selectedDevice.device_id) {
      setUpcomingSchedules(prev => {
        const updated = prev
          .map(schedule => schedule.schedule_id === newSchedule.schedule_id ? newSchedule : schedule)
          .sort((a, b) => new Date(a.time).getTime() - new Date(b.time).getTime())
          .filter(schedule => new Date(schedule.time) > new Date())
          .slice(0, 2);
        return updated;
      });
    } else if (eventType === 'DELETE') {
      setUpcomingSchedules(prev => 
        prev.filter(schedule => schedule.schedule_id !== oldSchedule.schedule_id)
      );
    }
  };

  // Fetch feeding history for a specific device
  const fetchFeedingHistory = async (deviceId: string, page: number = 1) => {
    try {
      // Calculate pagination
      const from = (page - 1) * itemsPerPage;
      const to = from + itemsPerPage - 1;
      
      // Get total count first
      const { count, error: countError } = await supabase
        .from('feeding_history')
        .select('*', { count: 'exact', head: true })
        .eq('device_id', deviceId);
        
      if (countError) throw countError;
      
      setTotalPages(Math.ceil((count || 0) / itemsPerPage));
      
      // Fetch the actual data
      const { data, error } = await supabase
        .from('feeding_history')
        .select('*')
        .eq('device_id', deviceId)
        .order('time', { ascending: false })
        .range(from, to);
        
      if (error) throw error;
      
      setFeedingHistory(data || []);
      setCurrentPage(page);
      
      // Update chart data
      updateChartData(data || []);
    } catch (error: any) {
      console.error('Error fetching feeding history:', error);
      setError('Failed to load feeding history');
    }
  };

  // Fetch upcoming schedules for a specific device
  const fetchUpcomingSchedules = async (deviceId: string, userId: string) => {
    try {
      const now = new Date().toISOString();
      
      const { data, error } = await supabase
        .from('schedules')
        .select('*')
        .eq('device_id', deviceId)
        .eq('user_id', userId)
        .gt('time', now)
        .order('time')
        .limit(2);
        
      if (error) throw error;
      
      setUpcomingSchedules(data || []);
    } catch (error: any) {
      console.error('Error fetching upcoming schedules:', error);
      setError('Failed to load upcoming schedules');
    }
  };

  // Update chart data based on feeding history
  const updateChartData = (history: FeedingHistory[]) => {
    // Group by date and calculate total amounts
    const dailyData = history.reduce((acc: {[key: string]: number}, item) => {
      const date = new Date(item.time).toLocaleDateString();
      acc[date] = (acc[date] || 0) + item.amount;
      return acc;
    }, {});
    
    // Prepare chart data
    const labels = Object.keys(dailyData).sort((a, b) => 
      new Date(a).getTime() - new Date(b).getTime()
    ).slice(-7); // Last 7 days
    
    const amounts = labels.map(date => dailyData[date] || 0);
    
    setChartData({
      labels,
      datasets: [
        {
          label: 'Food Dispensed (g)',
          data: amounts,
          fill: false,
          backgroundColor: 'rgba(255, 206, 86, 0.2)',
          borderColor: 'rgba(255, 206, 86, 1)',
          tension: 0.1
        }
      ]
    });
  };

  // Handle device selection change
  const handleDeviceChange = async (deviceId: string) => {
    const device = devices.find(d => d.device_id === deviceId);
    if (device) {
      setSelectedDevice(device);
      
      // Reset pagination
      setCurrentPage(1);
      
      // Fetch data for the selected device
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        await fetchFeedingHistory(deviceId);
        await fetchUpcomingSchedules(deviceId, user.id);
      }
    }
  };

  // Dispense food manually
  const handleDispense = async () => {
    if (!selectedDevice) return;
    
    try {
      setIsDispensing(true);
      
      // Update device status with dispense command
      const { error } = await supabase
        .from('devices')
        .update({
          last_status: {
            ...selectedDevice.last_status,
            command: 'dispense',
            command_amount: feedingAmount
          }
        })
        .eq('device_id', selectedDevice.device_id);
        
      if (error) throw error;
      
      // Record the feeding in history
      const { error: historyError } = await supabase
        .from('feeding_history')
        .insert([{
          device_id: selectedDevice.device_id,
          time: new Date().toISOString(),
          amount: feedingAmount,
          manual: true
        }]);
        
      if (historyError) throw historyError;
      
      // Show success message
      alert(`Dispensing ${feedingAmount}g of food!`);
    } catch (error: any) {
      console.error('Error dispensing food:', error);
      setError('Failed to dispense food');
    } finally {
      setIsDispensing(false);
    }
  };

  // Format date and time for display
  const formatDateTime = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleString();
  };

  // Handle pagination
  const handlePageChange = (page: number) => {
    if (selectedDevice) {
      fetchFeedingHistory(selectedDevice.device_id, page);
    }
  };

  // Render device status
  const renderDeviceStatus = () => {
    if (!selectedDevice) {
      return (
        <div className="no-devices-message">
          <i className="icon-device-off"></i>
          <h3>No devices found</h3>
          <p>Connect your first Pet Feeder device to get started!</p>
          <Link to="/device-setup" className="btn btn-primary">Add Device</Link>
        </div>
      );
    }

    const { last_status } = selectedDevice;
    const foodLevel = last_status?.food_level || 0;
    const wifiStrength = last_status?.wifi_strength || 0;
    const lastUpdate = last_status?.last_update 
      ? new Date(parseInt(last_status.last_update) * 1000).toLocaleString()
      : 'Unknown';

    return (
      <div className="device-status-card">
        <div className="device-status-header">
          <h3>{selectedDevice.device_name}</h3>
          <span className={`device-status ${foodLevel > 0 ? 'online' : 'offline'}`}>
            {foodLevel > 0 ? 'Online' : 'Offline'}
          </span>
        </div>
        
        <div className="device-status-grid">
          <div className="status-item">
            <div className="status-icon">
              <i className="icon-food"></i>
            </div>
            <div className="status-info">
              <h4>Food Level</h4>
              <div className="progress-bar">
                <div 
                  className="progress-fill" 
                  style={{ width: `${foodLevel}%` }}
                  data-level={`${foodLevel}%`}
                ></div>
              </div>
            </div>
          </div>
          
          <div className="status-item">
            <div className="status-icon">
              <i className="icon-wifi"></i>
            </div>
            <div className="status-info">
              <h4>WiFi Signal</h4>
              <div className="wifi-strength">
                {Array.from({ length: 4 }).map((_, i) => (
                  <div 
                    key={i}
                    className={`wifi-bar ${i < Math.ceil(wifiStrength / 25) ? 'active' : ''}`}
                  ></div>
                ))}
              </div>
            </div>
          </div>
          
          <div className="status-item">
            <div className="status-icon">
              <i className="icon-clock"></i>
            </div>
            <div className="status-info">
              <h4>Last Update</h4>
              <p>{lastUpdate}</p>
            </div>
          </div>
        </div>
      </div>
    );
  };

  // Render device selector
  const renderDeviceSelector = () => {
    if (devices.length <= 1) return null;
    
    return (
      <div className="device-selector">
        <label htmlFor="device-select">Select Device:</label>
        <select 
          id="device-select"
          value={selectedDevice?.device_id || ''}
          onChange={(e) => handleDeviceChange(e.target.value)}
        >
          {devices.map((device) => (
            <option key={device.device_id} value={device.device_id}>
              {device.device_name}
            </option>
          ))}
        </select>
      </div>
    );
  };

  // Render feeding controls
  const renderFeedingControls = () => {
    if (!selectedDevice) return null;
    
    return (
      <div className="feeding-controls-card">
        <div className="tab-navigation">
          <button 
            className={`tab-button ${activeTab === 'manual' ? 'active' : ''}`}
            onClick={() => setActiveTab('manual')}
          >
            <i className="icon-hand"></i> Manual Feeding
          </button>
          <button 
            className={`tab-button ${activeTab === 'scheduled' ? 'active' : ''}`}
            onClick={() => setActiveTab('scheduled')}
          >
            <i className="icon-calendar"></i> Scheduled Feeding
          </button>
        </div>
        
        <div className="tab-content">
          {activeTab === 'manual' ? (
            <div className="manual-feeding">
              <div className="amount-selector">
                <h4>Amount to dispense (grams):</h4>
                <div className="amount-controls">
                  <button 
                    className="btn btn-circle" 
                    onClick={() => setFeedingAmount(prev => Math.max(5, prev - 5))}
                    disabled={isDispensing}
                  >
                    -
                  </button>
                  <input 
                    type="number" 
                    value={feedingAmount} 
                    onChange={(e) => setFeedingAmount(Math.max(5, Math.min(100, parseInt(e.target.value) || 5)))}
                    min="5"
                    max="100"
                    disabled={isDispensing}
                  />
                  <button 
                    className="btn btn-circle" 
                    onClick={() => setFeedingAmount(prev => Math.min(100, prev + 5))}
                    disabled={isDispensing}
                  >
                    +
                  </button>
                </div>
              </div>
              
              <button 
                className="btn btn-primary btn-dispense" 
                onClick={handleDispense}
                disabled={isDispensing}
              >
                {isDispensing ? 'Dispensing...' : 'Dispense Now'}
              </button>
            </div>
          ) : (
            <div className="scheduled-feeding">
              <h4>Upcoming Feedings</h4>
              {upcomingSchedules.length > 0 ? (
                <ul className="schedule-list">
                  {upcomingSchedules.map((schedule) => (
                    <li key={schedule.schedule_id} className="schedule-item">
                      <div className="schedule-time">
                        <i className="icon-clock"></i>
                        {formatDateTime(schedule.time)}
                      </div>
                      <div className="schedule-amount">
                        <i className="icon-food"></i>
                        {schedule.amount}g
                      </div>
                    </li>
                  ))}
                </ul>
              ) : (
                <p className="no-schedules-message">No upcoming feedings scheduled.</p>
              )}
              <Link to="/schedule" className="btn btn-outline">
                Manage Schedules
              </Link>
            </div>
          )}
        </div>
      </div>
    );
  };

  // Render feeding history
  const renderFeedingHistory = () => {
    if (!selectedDevice) return null;
    
    return (
      <div className="feeding-history-card">
        <h3>Recent Feedings</h3>
        
        {feedingHistory.length > 0 ? (
          <>
            <div className="feeding-table">
              <div className="feeding-table-header">
                <div className="table-cell">Time</div>
                <div className="table-cell">Amount</div>
                <div className="table-cell">Type</div>
              </div>
              
              {feedingHistory.map((feeding) => (
                <div key={feeding.feed_id} className="feeding-table-row">
                  <div className="table-cell">{formatDateTime(feeding.time)}</div>
                  <div className="table-cell">{feeding.amount}g</div>
                  <div className="table-cell">{feeding.manual ? 'Manual' : 'Scheduled'}</div>
                </div>
              ))}
            </div>
            
            <div className="pagination">
              <button 
                className="btn btn-sm" 
                disabled={currentPage === 1}
                onClick={() => handlePageChange(currentPage - 1)}
              >
                Previous
              </button>
              <span className="page-info">Page {currentPage} of {totalPages}</span>
              <button 
                className="btn btn-sm" 
                disabled={currentPage === totalPages}
                onClick={() => handlePageChange(currentPage + 1)}
              >
                Next
              </button>
            </div>
          </>
        ) : (
          <p className="no-history-message">No feeding history available yet.</p>
        )}
        
        <Link to="/history" className="btn btn-text">View Full History</Link>
      </div>
    );
  };

  // Render feeding chart
  const renderFeedingChart = () => {
    if (!selectedDevice || !chartData) return null;
    
    const chartOptions = {
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: {
          position: 'top' as const,
        },
        title: {
          display: true,
          text: '7-Day Feeding Trend',
        },
      },
      scales: {
        y: {
          beginAtZero: true,
          title: {
            display: true,
            text: 'Food Amount (g)'
          }
        }
      }
    };
    
    return (
      <div className="chart-card">
        <h3>Feeding Analysis</h3>
        
        <div className="chart-container">
          <Line data={chartData} options={chartOptions} />
        </div>
      </div>
    );
  };

  if (isLoading) {
    return (
      <div className="loading-container">
        <div className="loading-spinner"></div>
        <p>Loading dashboard...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="error-container">
        <i className="icon-warning"></i>
        <h2>Something went wrong</h2>
        <p>{error}</p>
        <button className="btn btn-primary" onClick={() => window.location.reload()}>
          Try Again
        </button>
      </div>
    );
  }

  return (
    <div className="dashboard-container">
      <div className="dashboard-header">
        <h1>Dashboard</h1>
        {renderDeviceSelector()}
      </div>
      
      <div className="dashboard-grid">
        <div className="grid-item status">{renderDeviceStatus()}</div>
        <div className="grid-item controls">{renderFeedingControls()}</div>
        <div className="grid-item history">{renderFeedingHistory()}</div>
        <div className="grid-item chart">{renderFeedingChart()}</div>
      </div>
    </div>
  );
};

export default Dashboard;
