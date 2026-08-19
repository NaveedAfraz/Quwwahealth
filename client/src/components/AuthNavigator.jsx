import React, { useEffect, useRef } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

const AuthNavigator = () => {
  const { isAuthenticated, isLinkingPassword } = useAuth();
  const navigate = useNavigate();
  const hasNavigated = useRef(false);
  const location = useLocation();
  useEffect(() => { 
    // Only navigate to home if the user is authenticated AND not in the middle of linking a password.
    if (isAuthenticated && !isLinkingPassword && !hasNavigated.current && location.pathname.startsWith("/auth")) {
      hasNavigated.current = true;
      navigate('/');
    }
    // Reset if the user logs out, allowing for navigation on next login.
    if (!isAuthenticated) {
      hasNavigated.current = false;
    }
  }, [isAuthenticated, isLinkingPassword, navigate, location.pathname]);

  return null; // This component renders nothing
};

export default AuthNavigator;
