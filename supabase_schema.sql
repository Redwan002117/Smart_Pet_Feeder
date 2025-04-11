-- Supabase Schema for Smart Pet Feeder
-- This script sets up the database tables, relationships, and RLS policies

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Create a profiles table to store additional user data
CREATE TABLE public.profiles (
  id UUID REFERENCES auth.users(id) PRIMARY KEY,
  username TEXT UNIQUE,
  full_name TEXT,
  avatar_url TEXT,
  email TEXT,
  role TEXT DEFAULT 'user' CHECK (role IN ('user', 'admin')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create devices table
CREATE TABLE public.devices (
  device_id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES auth.users(id) NOT NULL,
  device_name TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  last_status JSONB DEFAULT '{"food_level": 100, "wifi_strength": 0}'::jsonb,
  is_active BOOLEAN DEFAULT TRUE
);

-- Create pets table
CREATE TABLE public.pets (
  pet_id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES auth.users(id) NOT NULL,
  name TEXT NOT NULL,
  health_data JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create schedules table
CREATE TABLE public.schedules (
  schedule_id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  device_id UUID REFERENCES public.devices(device_id) NOT NULL,
  user_id UUID REFERENCES auth.users(id) NOT NULL,
  time TIMESTAMP WITH TIME ZONE NOT NULL,
  amount INTEGER NOT NULL CHECK (amount > 0),
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create feeding history table
CREATE TABLE public.feeding_history (
  feed_id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  device_id UUID REFERENCES public.devices(device_id) NOT NULL,
  time TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  amount INTEGER NOT NULL CHECK (amount > 0),
  manual BOOLEAN DEFAULT FALSE,
  schedule_id UUID REFERENCES public.schedules(schedule_id),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create user preferences table
CREATE TABLE public.user_preferences (
  id UUID REFERENCES auth.users(id) PRIMARY KEY,
  theme TEXT DEFAULT 'orange' CHECK (theme IN ('blue', 'purple', 'orange')),
  dark_mode BOOLEAN DEFAULT FALSE,
  notification_email BOOLEAN DEFAULT TRUE,
  notification_push BOOLEAN DEFAULT TRUE,
  language TEXT DEFAULT 'en',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable Row Level Security (RLS)
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.devices ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.pets ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.schedules ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.feeding_history ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_preferences ENABLE ROW LEVEL SECURITY;

-- Create RLS policies
-- Profiles: Users can read/update only their own profile
CREATE POLICY "Users can view their own profile" 
  ON public.profiles 
  FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Users can update their own profile" 
  ON public.profiles 
  FOR UPDATE USING (auth.uid() = id);

-- Special policy for admin emails - this avoids the recursion
CREATE POLICY "Admin email access"
  ON public.profiles
  FOR SELECT 
  USING (auth.jwt() ->> 'email' = 'petfeeder@redwancodes.com');

-- Enable admin users after initial setup
CREATE POLICY "Admins can view all profiles" 
  ON public.profiles 
  FOR SELECT USING (
    (auth.jwt() ->> 'email' = 'petfeeder@redwancodes.com') OR
    (SELECT role FROM public.profiles WHERE id = auth.uid()) = 'admin'
  );

-- Devices: Users can CRUD only their own devices
CREATE POLICY "Users can view their own devices" 
  ON public.devices 
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can create devices" 
  ON public.devices 
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own devices" 
  ON public.devices 
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own devices" 
  ON public.devices 
  FOR DELETE USING (auth.uid() = user_id);

-- Pets: Users can CRUD only their own pets
CREATE POLICY "Users can view their own pets" 
  ON public.pets 
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can create pets" 
  ON public.pets 
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own pets" 
  ON public.pets 
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own pets" 
  ON public.pets 
  FOR DELETE USING (auth.uid() = user_id);

-- Schedules: Users can CRUD only their own schedules
CREATE POLICY "Users can view their own schedules" 
  ON public.schedules 
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can create schedules" 
  ON public.schedules 
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own schedules" 
  ON public.schedules 
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own schedules" 
  ON public.schedules 
  FOR DELETE USING (auth.uid() = user_id);

-- Feeding History: Users can read histories of their own devices, insert on their devices
CREATE POLICY "Users can view feeding history of their own devices" 
  ON public.feeding_history 
  FOR SELECT USING (
    device_id IN (
      SELECT device_id FROM public.devices WHERE user_id = auth.uid()
    )
  );

CREATE POLICY "Users can create feeding history for their own devices" 
  ON public.feeding_history 
  FOR INSERT WITH CHECK (
    device_id IN (
      SELECT device_id FROM public.devices WHERE user_id = auth.uid()
    )
  );

-- User Preferences: Users can read/update only their own preferences
CREATE POLICY "Users can view their own preferences" 
  ON public.user_preferences 
  FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Users can update their own preferences" 
  ON public.user_preferences 
  FOR UPDATE USING (auth.uid() = id);

-- Admins can access all data
CREATE POLICY "Admins can view all devices" 
  ON public.devices 
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.profiles 
      WHERE id = auth.uid() AND role = 'admin'
    )
  );

CREATE POLICY "Admins can view all pets" 
  ON public.pets 
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.profiles 
      WHERE id = auth.uid() AND role = 'admin'
    )
  );

CREATE POLICY "Admins can view all schedules" 
  ON public.schedules 
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.profiles 
      WHERE id = auth.uid() AND role = 'admin'
    )
  );

CREATE POLICY "Admins can view all feeding history" 
  ON public.feeding_history 
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.profiles 
      WHERE id = auth.uid() AND role = 'admin'
    )
  );

-- Create indexes for better performance
CREATE INDEX idx_devices_user_id ON public.devices(user_id);
CREATE INDEX idx_pets_user_id ON public.pets(user_id);
CREATE INDEX idx_schedules_device_id ON public.schedules(device_id);
CREATE INDEX idx_schedules_user_id ON public.schedules(user_id);
CREATE INDEX idx_schedules_time ON public.schedules(time);
CREATE INDEX idx_feeding_history_device_id ON public.feeding_history(device_id);
CREATE INDEX idx_feeding_history_time ON public.feeding_history(time);

-- Setup auth hooks to create a profile when a new user signs up
CREATE OR REPLACE FUNCTION public.handle_new_user() 
RETURNS TRIGGER AS $$
BEGIN
  -- Create profile
  INSERT INTO public.profiles (id, username, full_name, avatar_url, email)
  VALUES (
    NEW.id, 
    COALESCE(NEW.raw_user_meta_data->>'username', 'user' || substr(gen_random_uuid()::text, 1, 8)),
    COALESCE(NEW.raw_user_meta_data->>'full_name', NEW.raw_user_meta_data->>'name'),
    COALESCE(NEW.raw_user_meta_data->>'avatar_url', NEW.raw_user_meta_data->>'picture'),
    NEW.email
  );
  
  -- Create user preferences
  INSERT INTO public.user_preferences (id)
  VALUES (NEW.id);
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger the function every time a new user is created
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE PROCEDURE public.handle_new_user();

-- Enable realtime subscriptions for these tables
ALTER PUBLICATION supabase_realtime ADD TABLE public.devices;
ALTER PUBLICATION supabase_realtime ADD TABLE public.schedules;
ALTER PUBLICATION supabase_realtime ADD TABLE public.feeding_history;
ALTER PUBLICATION supabase_realtime ADD TABLE public.user_preferences;

-- Create admin user (to be run manually with actual values)
-- Replace 'admin-user-uuid' with the actual UUID from auth.users
-- INSERT INTO public.profiles (id, username, email, role)
-- VALUES (
--   'admin-user-uuid',
--   '@GamerNo002117',
--   'petfeeder@redwancodes.com',
--   'admin'
-- );