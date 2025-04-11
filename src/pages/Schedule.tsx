import React, { useState, useEffect } from 'react';
import { supabase } from '../supabaseClient.ts';
import { Schedule } from '../types';

const SchedulePage: React.FC = () => {
  const [schedules, setSchedules] = useState<Schedule[]>([]);
  const [newSchedule, setNewSchedule] = useState({ time: '', amount: 0, device_id: '' });
  const [showForm, setShowForm] = useState(false);

  useEffect(() => {
    const fetchSchedules = async () => {
      const { data, error } = await supabase
        .from('schedules')
        .select('*')
        .eq('user_id', supabase.auth.user()?.id);

      if (error) {
        console.error('Error fetching schedules:', error);
      } else {
        setSchedules(data);
      }
    };

    fetchSchedules();
  }, []);

  const handleAddSchedule = async (e: React.FormEvent) => {
    e.preventDefault();
    const { data, error } = await supabase
      .from('schedules')
      .insert([{ ...newSchedule, user_id: supabase.auth.user()?.id }]);

    if (error) {
      console.error('Error adding schedule:', error);
    } else {
      setSchedules([...schedules, data[0]]);
      setShowForm(false);
      setNewSchedule({ time: '', amount: 0, device_id: '' });
    }
  };

  return (
    <div className="schedule-page">
      <h1>Schedules</h1>
      <button className="btn btn-primary" onClick={() => setShowForm(true)}>
        Add Schedule
      </button>
      <ul className="schedule-list">
        {schedules.map(schedule => (
          <li key={schedule.schedule_id} className="schedule-item">
            <div className="schedule-info">
              <p>Time: {schedule.time}</p>
              <p>Amount: {schedule.amount}</p>
              <p>Device ID: {schedule.device_id}</p>
            </div>
          </li>
        ))}
      </ul>

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
                  Amount:
                  <input
                    type="number"
                    value={newSchedule.amount}
                    onChange={e => setNewSchedule({ ...newSchedule, amount: parseInt(e.target.value) })}
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
                <button className="btn btn-outline" onClick={() => setShowForm(false)}>
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