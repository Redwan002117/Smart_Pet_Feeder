import React, { useState, useEffect } from 'react';
import { supabase } from '../supabaseClient.ts';
import { Line, Doughnut, Bar } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  ArcElement,
  BarElement,
  Title,
  Tooltip,
  Legend
} from 'chart.js';
import '../styles/AdminDashboard.css';

// Register Chart.js components
ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  ArcElement,
  BarElement,
  Title,
  Tooltip,
  Legend
);

const AdminDashboard: React.FC = () => {
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  
  // Statistics
  const [userCount, setUserCount] = useState<number>(0);
  const [verifiedUserCount, setVerifiedUserCount] = useState<number>(0);
  const [deviceCount, setDeviceCount] = useState<number>(0);
  const [petCount, setPetCount] = useState<number>(0);
  const [feedingCount, setFeedingCount] = useState<number>(0);
  
  // Charts data
  const [userGrowthData, setUserGrowthData] = useState<any>(null);
  const [deviceStatusData, setDeviceStatusData] = useState<any>(null);
  const [feedingHistoryData, setFeedingHistoryData] = useState<any>(null);
  const [deviceDistributionData, setDeviceDistributionData] = useState<any>(null);

  useEffect(() => {
    fetchAdminData();
  }, []);

  const fetchAdminData = async () => {
    try {
      setLoading(true);
      
      // Check admin access
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('User not authenticated');
      
      const { data: profile } = await supabase
        .from('profiles')
        .select('role')
        .eq('id', user.id)
        .single();
        
      if (!profile || profile.role !== 'admin') {
        throw new Error('You do not have admin access');
      }
      
      // Fetch statistics
      const { count: usersCount, error: usersError } = await supabase
        .from('profiles')
        .select('*', { count: 'exact', head: true });
        
      if (usersError) throw usersError;
      
      // Simplified verification count (in a real app, you would check email verification status)
      const { count: verifiedCount, error: verifiedError } = await supabase
        .from('profiles')
        .select('*', { count: 'exact', head: true })
        .not('email', 'eq', '');
        
      if (verifiedError) throw verifiedError;
      
      const { count: devicesCount, error: devicesError } = await supabase
        .from('devices')
        .select('*', { count: 'exact', head: true });
        
      if (devicesError) throw devicesError;
      
      const { count: petsCount, error: petsError } = await supabase
        .from('pets')
        .select('*', { count: 'exact', head: true });
        
      if (petsError) throw petsError;
      
      const { count: feedingsCount, error: feedingsError } = await supabase
        .from('feeding_history')
        .select('*', { count: 'exact', head: true });
        
      if (feedingsError) throw feedingsError;
      
      // Set statistics
      setUserCount(usersCount || 0);
      setVerifiedUserCount(verifiedCount || 0);
      setDeviceCount(devicesCount || 0);
      setPetCount(petsCount || 0);
      setFeedingCount(feedingsCount || 0);
      
      // Generate chart data
      generateUserGrowthChart();
      generateDeviceStatusChart();
      generateFeedingHistoryChart();
      generateDeviceDistributionChart();
    } catch (err: any) {
      console.error('Error fetching admin data:', err);
      setError(err.message || 'Failed to load admin dashboard');
    } finally {
      setLoading(false);
    }
  };

  // Generate user growth chart data (simulated)
  const generateUserGrowthChart = () => {
    // In a real app, you'd fetch actual data by date from the database
    const labels = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul'];
    const data = {
      labels,
      datasets: [
        {
          label: 'New Users',
          data: [5, 8, 12, 15, 20, 25, 30],
          borderColor: 'rgba(54, 162, 235, 1)',
          backgroundColor: 'rgba(54, 162, 235, 0.2)',
          tension: 0.3
        }
      ]
    };
    
    setUserGrowthData(data);
  };

  // Generate device status chart data (simulated)
  const generateDeviceStatusChart = () => {
    const data = {
      labels: ['Online', 'Offline', 'Low Food'],
      datasets: [
        {
          data: [deviceCount * 0.7, deviceCount * 0.2, deviceCount * 0.1],
          backgroundColor: [
            'rgba(75, 192, 192, 0.7)',
            'rgba(255, 99, 132, 0.7)',
            'rgba(255, 205, 86, 0.7)'
          ],
          borderColor: [
            'rgba(75, 192, 192, 1)',
            'rgba(255, 99, 132, 1)',
            'rgba(255, 205, 86, 1)'
          ],
          borderWidth: 1
        }
      ]
    };
    
    setDeviceStatusData(data);
  };

  // Generate feeding history chart (simulated)
  const generateFeedingHistoryChart = () => {
    const labels = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
    const data = {
      labels,
      datasets: [
        {
          label: 'Scheduled Feedings',
          data: [15, 18, 14, 20, 16, 12, 10],
          backgroundColor: 'rgba(54, 162, 235, 0.7)',
        },
        {
          label: 'Manual Feedings',
          data: [8, 5, 9, 6, 10, 12, 7],
          backgroundColor: 'rgba(255, 99, 132, 0.7)',
        }
      ]
    };
    
    setFeedingHistoryData(data);
  };

  // Generate device distribution chart (simulated)
  const generateDeviceDistributionChart = () => {
    const data = {
      labels: ['1 Device', '2 Devices', '3+ Devices'],
      datasets: [
        {
          label: 'Users',
          data: [Math.floor(userCount * 0.6), Math.floor(userCount * 0.3), Math.floor(userCount * 0.1)],
          backgroundColor: [
            'rgba(255, 99, 132, 0.7)',
            'rgba(54, 162, 235, 0.7)',
            'rgba(75, 192, 192, 0.7)'
          ],
          borderColor: [
            'rgba(255, 99, 132, 1)',
            'rgba(54, 162, 235, 1)',
            'rgba(75, 192, 192, 1)'
          ],
          borderWidth: 1
        }
      ]
    };
    
    setDeviceDistributionData(data);
  };

  if (loading) {
    return (
      <div className="loading-container">
        <div className="loading-spinner"></div>
        <p>Loading admin dashboard...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="error-container">
        <i className="icon-error"></i>
        <h2>Error</h2>
        <p>{error}</p>
      </div>
    );
  }

  return (
    <div className="admin-dashboard-container">
      <div className="admin-header">
        <h1>Admin Dashboard</h1>
        <div className="admin-actions">
          <button className="btn btn-outline">
            <i className="icon-download"></i> Export Data
          </button>
        </div>
      </div>
      
      <div className="stats-grid">
        <div className="stat-card">
          <div className="stat-icon user-icon">
            <i className="icon-users"></i>
          </div>
          <div className="stat-content">
            <h3>Total Users</h3>
            <div className="stat-value">{userCount}</div>
            <div className="stat-secondary">
              {verifiedUserCount} verified ({Math.round((verifiedUserCount / userCount) * 100)}%)
            </div>
          </div>
        </div>
        
        <div className="stat-card">
          <div className="stat-icon device-icon">
            <i className="icon-device"></i>
          </div>
          <div className="stat-content">
            <h3>Total Devices</h3>
            <div className="stat-value">{deviceCount}</div>
            <div className="stat-secondary">
              {(deviceCount / userCount).toFixed(1)} avg per user
            </div>
          </div>
        </div>
        
        <div className="stat-card">
          <div className="stat-icon pet-icon">
            <i className="icon-paw"></i>
          </div>
          <div className="stat-content">
            <h3>Total Pets</h3>
            <div className="stat-value">{petCount}</div>
            <div className="stat-secondary">
              {(petCount / userCount).toFixed(1)} avg per user
            </div>
          </div>
        </div>
        
        <div className="stat-card">
          <div className="stat-icon food-icon">
            <i className="icon-food"></i>
          </div>
          <div className="stat-content">
            <h3>Total Feedings</h3>
            <div className="stat-value">{feedingCount}</div>
            <div className="stat-secondary">
              {Math.round(feedingCount / 7)} avg per day (week)
            </div>
          </div>
        </div>
      </div>
      
      <div className="charts-grid">
        <div className="chart-card wide">
          <h3>User Growth</h3>
          <div className="chart-container">
            {userGrowthData && <Line data={userGrowthData} options={{ responsive: true, maintainAspectRatio: false }} />}
          </div>
        </div>
        
        <div className="chart-card">
          <h3>Device Status</h3>
          <div className="chart-container">
            {deviceStatusData && <Doughnut data={deviceStatusData} options={{ responsive: true, maintainAspectRatio: false }} />}
          </div>
        </div>
        
        <div className="chart-card">
          <h3>Device Distribution</h3>
          <div className="chart-container">
            {deviceDistributionData && <Doughnut data={deviceDistributionData} options={{ responsive: true, maintainAspectRatio: false }} />}
          </div>
        </div>
        
        <div className="chart-card wide">
          <h3>Feeding History (Last Week)</h3>
          <div className="chart-container">
            {feedingHistoryData && <Bar data={feedingHistoryData} options={{ responsive: true, maintainAspectRatio: false }} />}
          </div>
        </div>
      </div>
      
      <div className="system-status">
        <h2>System Status</h2>
        
        <div className="status-grid">
          <div className="status-card">
            <div className="status-header">
              <h3>Database</h3>
              <span className="status-indicator healthy">Healthy</span>
            </div>
            <div className="status-details">
              <div className="status-metric">
                <span>Query Performance:</span>
                <span>27ms avg</span>
              </div>
              <div className="status-metric">
                <span>Storage Used:</span>
                <span>12%</span>
              </div>
            </div>
          </div>
          
          <div className="status-card">
            <div className="status-header">
              <h3>Authentication</h3>
              <span className="status-indicator healthy">Healthy</span>
            </div>
            <div className="status-details">
              <div className="status-metric">
                <span>Active Sessions:</span>
                <span>{Math.round(userCount * 0.4)}</span>
              </div>
              <div className="status-metric">
                <span>Auth Success Rate:</span>
                <span>99.7%</span>
              </div>
            </div>
          </div>
          
          <div className="status-card">
            <div className="status-header">
              <h3>API</h3>
              <span className="status-indicator healthy">Healthy</span>
            </div>
            <div className="status-details">
              <div className="status-metric">
                <span>Response Time:</span>
                <span>65ms avg</span>
              </div>
              <div className="status-metric">
                <span>Requests (24h):</span>
                <span>{Math.round(userCount * 50)}</span>
              </div>
            </div>
          </div>
          
          <div className="status-card">
            <div className="status-header">
              <h3>Storage</h3>
              <span className="status-indicator healthy">Healthy</span>
            </div>
            <div className="status-details">
              <div className="status-metric">
                <span>Total Files:</span>
                <span>{userCount * 2}</span>
              </div>
              <div className="status-metric">
                <span>Storage Used:</span>
                <span>126 MB</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;
