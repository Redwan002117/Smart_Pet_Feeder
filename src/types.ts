export interface Device {
  device_id: string;
  user_id: string;
  device_name: string;
  created_at: string;
  last_status: DeviceStatus;
}

export interface DeviceStatus {
  food_level: number;
  command?: string;
  battery_level?: number;
  wifi_strength?: number;
  last_update?: string;
  error?: string;
}

export interface Pet {
  pet_id: string;
  user_id: string;
  name: string;
  health_data: PetHealthData;
  created_at?: string;
}

export interface PetHealthData {
  weight: number;
  age: number;
  breed?: string;
  activity_level?: 'low' | 'medium' | 'high';
  dietary_restrictions?: string[];
}

export interface Schedule {
  schedule_id: string;
  device_id: string;
  user_id: string;
  time: string;
  amount: number;
  recurring?: boolean;
  days?: number[]; // 0 = Sunday, 1 = Monday, etc.
  created_at?: string;
}

export interface FeedingHistory {
  feed_id: string;
  device_id: string;
  time: string;
  amount: number;
  manual?: boolean;
  schedule_id?: string;
}

export interface UserProfile {
  id: string;
  username: string;
  full_name?: string;
  avatar_url?: string;
  role: 'user' | 'admin';
  email: string;
  created_at: string;
  notifications_enabled?: boolean;
}

export interface NotificationPreference {
  user_id: string;
  email_notifications: boolean;
  push_notifications: boolean;
  low_food_alert: boolean;
  feeding_complete_alert: boolean;
  schedule_reminder: boolean;
}
