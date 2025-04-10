import React, { useEffect, useState } from 'react';
import { Navigate } from 'react-router-dom';
import { Session } from '@supabase/supabase-js';
import { supabase } from '../supabaseClient';

interface AdminRouteProps {
  children: React.ReactNode;
  session: Session | null;
}

const AdminRoute: React.FC<AdminRouteProps> = ({ children, session }) => {
  const [isAdmin, setIsAdmin] = useState<boolean | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const checkAdminStatus = async () => {
      if (!session) {
        setIsAdmin(false);
        setLoading(false);
        return;
      }

      try {
        // Check if the user is admin - this depends on your admin identification logic
        const { data, error } = await supabase
          .from('profiles')
          .select('role')
          .eq('id', session.user.id)
          .single();

        if (error) {
          console.error('Error checking admin status:', error);
          setIsAdmin(false);
        } else {
          // Check if this is the admin email or username
          const isAdminUser = 
            session.user.email === 'petfeeder@redwancodes.com' || 
            data?.role === 'admin';
          
          setIsAdmin(isAdminUser);
        }
      } catch (error) {
        console.error('Error:', error);
        setIsAdmin(false);
      } finally {
        setLoading(false);
      }
    };

    checkAdminStatus();
  }, [session]);

  if (loading) {
    return <div className="loading">Loading...</div>;
  }

  if (!isAdmin) {
    return <Navigate to="/dashboard" />;
  }
  
  return <>{children}</>;
};

export default AdminRoute;
