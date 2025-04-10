import { supabase } from '../supabaseClient';

// Request permission for browser notifications
export const requestNotificationPermission = async (): Promise<boolean> => {
  if (!('Notification' in window)) {
    console.log('This browser does not support desktop notifications');
    return false;
  }

  let permission = Notification.permission;
  
  if (permission !== 'granted' && permission !== 'denied') {
    permission = await Notification.requestPermission();
  }
  
  return permission === 'granted';
};

// Send a browser notification
export const sendNotification = (title: string, options?: NotificationOptions) => {
  if (Notification.permission === 'granted') {
    return new Notification(title, options);
  }
  return null;
};

// Subscribe to real-time updates for a specific table and send notifications
export const subscribeToTableChanges = (
  table: string,
  event: 'INSERT' | 'UPDATE' | 'DELETE' | '*' = '*',
  callback?: (payload: any) => void,
  filter?: string
) => {
  const subscription = supabase
    .channel(`${table}-changes`)
    .on(
      'postgres_changes',
      { event, schema: 'public', table, filter },
      (payload) => {
        // Optional callback for custom handling
        if (callback) {
          callback(payload);
        }
      }
    )
    .subscribe();

  return subscription;
};

// Subscribe to device status changes and send notifications
export const subscribeToDeviceStatus = (userId: string) => {
  return subscribeToTableChanges(
    'devices',
    'UPDATE',
    (payload) => {
      const { new: newData } = payload;
      
      // Example: Notify when food level is low
      if (newData.last_status && newData.last_status.food_level < 20) {
        sendNotification(
          'Food Level Low',
          {
            body: `Food level for ${newData.device_name} is below 20%! Please refill soon.`,
            icon: '/logo192.png'
          }
        );
      }
    },
    `user_id=eq.${userId}`
  );
};

// Subscribe to feeding events and send notifications
export const subscribeToFeedingEvents = (userId: string) => {
  return subscribeToTableChanges(
    'feeding_history',
    'INSERT',
    async (payload) => {
      const { new: newFeeding } = payload;
      
      // Get device details
      const { data: device } = await supabase
        .from('devices')
        .select('device_name')
        .eq('device_id', newFeeding.device_id)
        .eq('user_id', userId)
        .single();
      
      if (device) {
        sendNotification(
          'Feeding Complete',
          {
            body: `${device.device_name} has dispensed ${newFeeding.amount}g of food at ${new Date(newFeeding.time).toLocaleTimeString()}.`,
            icon: '/logo192.png'
          }
        );
      }
    }
  );
};

// Subscribe to schedule reminders
export const subscribeToScheduleReminders = (userId: string) => {
  // Check every minute if there's a feeding scheduled soon
  const interval = setInterval(async () => {
    const now = new Date();
    const fiveMinutesLater = new Date(now.getTime() + 5 * 60000);
    
    const { data: upcomingSchedules } = await supabase
      .from('schedules')
      .select('schedule_id, time, amount, devices(device_name)')
      .eq('user_id', userId)
      .gte('time', now.toISOString())
      .lt('time', fiveMinutesLater.toISOString());
    
    if (upcomingSchedules && upcomingSchedules.length > 0) {
      for (const schedule of upcomingSchedules) {
        sendNotification(
          'Upcoming Feeding',
          {
            body: `${schedule.devices.device_name} will dispense ${schedule.amount}g of food in about 5 minutes.`,
            icon: '/logo192.png'
          }
        );
      }
    }
  }, 60000); // Check every minute
  
  return () => clearInterval(interval);
};
