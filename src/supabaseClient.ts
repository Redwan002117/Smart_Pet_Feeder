import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://enxtmrpvfkkwikgiybsx.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImVueHRtcnB2Zmtrd2lrZ2l5YnN4Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDQwNTM3MTksImV4cCI6MjA1OTYyOTcxOX0.MjOsYzLeZcudPH6I8jN3pBiLItjw4rBzcD54sIrtmXk';

export const supabase = createClient(supabaseUrl, supabaseAnonKey);
