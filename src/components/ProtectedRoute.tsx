import React from 'react';
import { Navigate } from 'react-router-dom';
import { Session } from '@supabase/supabase-js';

interface ProtectedRouteProps {
  children: React.ReactNode;
  session: Session | null;
}

const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ children, session }) => {
  if (!session) {
    return <Navigate to="/login" />;
  }
  
  return <>{children}</>;
};

export default ProtectedRoute;
