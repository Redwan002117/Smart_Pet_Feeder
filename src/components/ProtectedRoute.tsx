import React, { useEffect, useState } from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { Session } from '@supabase/supabase-js';

interface ProtectedRouteProps {
  children: React.ReactNode;
  session: Session | null;
}

const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ children, session }) => {
  const [isVerifying, setIsVerifying] = useState(true);
  const location = useLocation();

  useEffect(() => {
    // Brief delay to ensure proper session state is used for navigation
    // This helps prevent immediate redirects that may be incorrect
    const timer = setTimeout(() => {
      setIsVerifying(false);
    }, 300);
    
    return () => clearTimeout(timer);
  }, []);

  if (isVerifying) {
    return (
      <div className="loading-container">
        <div className="loading-spinner"></div>
        <p>Verifying session...</p>
      </div>
    );
  }
  
  if (!session) {
    // Save the attempted URL for redirecting back after login
    sessionStorage.setItem('redirectAfterLogin', location.pathname);
    return <Navigate to="/login" />;
  }
  
  return <>{children}</>;
};

export default ProtectedRoute;
