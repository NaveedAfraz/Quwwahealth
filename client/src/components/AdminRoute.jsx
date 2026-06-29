import { useAuth } from '@/contexts/AuthContext';
import React, { useEffect, useState } from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import axios from 'axios';
import { config } from '@/config/config';

const AdminRoute = ({ children }) => {
  const { isAuthenticated, user, loading, setUser, setIsAuthenticated } = useAuth();
  const location = useLocation();
  const [isCheckingAuth, setIsCheckingAuth] = useState(true);
  const [authChecked, setAuthChecked] = useState(false);

  useEffect(() => {
    let isMounted = true;
    console.log('AdminRoute: Starting auth check', { isAuthenticated, loading, authChecked });

    const checkAuth = async () => {
      console.log('AdminRoute: Checking auth with backend...');
      try {
        // First check session with backend
        const response = await axios.get(
          `${config.API_BASE_URL}/auth/check`, 
          { 
            withCredentials: true,
            headers: {
              'Cache-Control': 'no-cache',
              'Pragma': 'no-cache',
              'Expires': '0'
            }
          }
        );
        console.log('AdminRoute: Auth check response:', response.data);

        if (isMounted) {
          if (response.data.authenticated) {
            console.log('AdminRoute: User authenticated, setting user data');
            setUser(response.data.user);
            setIsAuthenticated(true);
          } else {
            console.log('AdminRoute: User not authenticated');
            setIsAuthenticated(false);
          }
          setAuthChecked(true);
        }
      } catch (error) {
        console.error('Session check error:', error);
        if (isMounted) {
          setIsAuthenticated(false);
          setAuthChecked(true);
        }
      } finally {
        if (isMounted) {
          setIsCheckingAuth(false);
        }
      }
    };

    // Only check auth if we're not already authenticated and haven't checked yet
    if (!isAuthenticated && !authChecked) {
      checkAuth();
    } else {
      setIsCheckingAuth(false);
    }

    return () => {
      isMounted = false;
    };
  }, [isAuthenticated, setUser, setIsAuthenticated, authChecked]);

  // Show loading state while checking authentication
  if (loading || isCheckingAuth) {
    console.log('AdminRoute: Showing loading state', { loading, isCheckingAuth });
    return (
      <div className="flex flex-col items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-[#54BD95] mb-4"></div>
        <p className="text-gray-600">Checking authentication...</p>
        {/* <div className="mt-4 p-2 bg-gray-100 rounded text-xs">
          <p>Auth State: {isAuthenticated ? 'Authenticated' : 'Not Authenticated'}</p>
          <p>Loading: {loading ? 'Yes' : 'No'}</p>
          <p>Checking Auth: {isCheckingAuth ? 'Yes' : 'No'}</p>
        </div> */}
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/auth/login" state={{ from: location }} replace />;
  }

  if (user?.role !== 'admin') {
    return <Navigate to="/" />;
  }
  
  return children;
};

export default AdminRoute; 