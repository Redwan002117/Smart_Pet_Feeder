import React, { useState, useEffect } from 'react';
import { supabase } from '../supabaseClient.ts';
import { Schedule } from '../types';

const SchedulePage: React.FC = () => {
  const [schedules, setSchedules] = useState<Schedule[]>([]);
  const [newSchedule, setNewSchedule] = useState({ time: '', amount: 0, device_id: '' });
  const [showForm, setShowForm] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchSchedules = async () => {
      try {
        // Get the current user using the new Supabase API
        const { data: { user }, error: userError } = await supabase.auth.getUser();
        
        if (userError) {
          throw userError;
        }
        
        if (!user) {
          setLoading(false);
          setError('You need to be logged in to view schedules');
          return;
        }
        
        const { data, error: scheduleError } = await supabase
          .from('schedules')
          .select('*')
          .eq('user_id', user.id);

        if (scheduleError) {
          throw scheduleError;
        } else {
          setSchedules(data || []);
        }
      } catch (err: any) {
        console.error('Error fetching schedules:', err);
        setError(err.message || 'Failed to load schedules');
      } finally {
        setLoading(false);
      }
    };

    fetchSchedules();
  }, []);

  const handleAddSchedule = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      // Get the current user using the new Supabase API
      const { data: { user }, error: userError } = await supabase.auth.getUser();
      
      if (userError) {
        throw userError;
      }
      
      if (!user) {
        setError('You need to be logged in to create schedules');
        return;
      }
      
      const { data, error: insertError } = await supabase
        .from('schedules')
        .insert([{ ...newSchedule, user_id: user.id }])
        .select();

      if (insertError) {
        throw insertError;
      } else {
        if (data && data.length > 0) {
          setSchedules([...schedules, data[0]]);
          setShowForm(false);
          setNewSchedule({ time: '', amount: 0, device_id: '' });
        }
      }
    } catch (err: any) {
      console.error('Error adding schedule:', err);
      setError(err.message || 'Failed to create schedule');
    }
  };

  return (
    <div className="schedule-page">
      <h1>Feeding Schedules</h1>
      
      {error && (
        <div className="error-alert">
          <p>{error}</p>
          <button onClick={() => setError(null)}>×</button>
        </div>
      )}
      
      {loading ? (
        <div className="loading-container">
          <div className="loading-spinner"></div>
          <p>Loading schedules...</p>
        </div>
      ) : (
        <>
          <button className="btn btn-primary" onClick={() => setShowForm(true)}>
            Add Schedule
          </button>
          
          {schedules.length > 0 ? (
            <ul className="schedule-list">
              {schedules.map(schedule => (
                <li key={schedule.schedule_id} className="schedule-item">
                  <div className="schedule-info">
                    <p>Time: {new Date(schedule.time).toLocaleString()}</p>
                    <p>Amount: {schedule.amount}g</p>
                    <p>Device ID: {schedule.device_id}</p>
                  </div>
                </li>
              ))}
            </ul>
          ) : (
            <div className="empty-state">
              <p>No schedules found. Add your first feeding schedule!</p>
            </div>
          )}
        </>
      )}

      {showForm && (
        <div className="modal">
          <div className="modal-content">
            <div className="modal-header">
              <h2>Add Schedule</h2>
            </div>
            <form onSubmit={handleAddSchedule}>
              <div className="modal-body">
                <label>
                  Time:
                  <input
                    type="datetime-local"
                    value={newSchedule.time}
                    onChange={e => setNewSchedule({ ...newSchedule, time: e.target.value })}
                    required
                  />
                </label>
                <label>
                  Amount (grams):
                  <input
                    type="number"
                    value={newSchedule.amount}
                    onChange={e => setNewSchedule({ ...newSchedule, amount: parseInt(e.target.value) })}
                    min="1"
                    required
                  />
                </label>
                <label>
                  Device ID:
                  <input
                    type="text"
                    value={newSchedule.device_id}
                    onChange={e => setNewSchedule({ ...newSchedule, device_id: e.target.value })}
                    required
                  />
                </label>
              </div>
              <div className="modal-footer">
                <button 
                  type="button" 
                  className="btn btn-outline" 
                  onClick={() => setShowForm(false)}
                >
                  Cancel
                </button>
                <button className="btn btn-primary" type="submit">
                  Add Schedule
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default SchedulePage;