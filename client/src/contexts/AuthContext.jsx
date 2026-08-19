import React, { createContext, useContext, useEffect, useState } from 'react';
import { auth } from '../firebase';
import { onAuthStateChanged } from 'firebase/auth';
import axios from 'axios';
import { config } from '../config/config';
export const AuthContext = createContext();

export const useAuth = () => {
  return useContext(AuthContext);
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [loading, setLoading] = useState(true);
  const [isLinkingPassword, setLinkingPassword] = useState(false);

  const checkAuth = async () => {
    try {
      setLoading(true);
      const response = await axios.get(
        `${config.API_BASE_URL}/auth/check`,
        { 
          withCredentials: true,
          headers: {
            'Cache-Control': 'no-cache',
            'Pragma': 'no-cache'
          }
        }
      );
      
      console.log('AuthContext: Session check response:', response.data);

      if (response.data.authenticated && response.data.user) {
        console.log('AuthContext: Session active for:', response.data.user);
        setUser(response.data.user);
        setIsAuthenticated(true);
        setLoading(false);
        return response.data.user;
      } else {
        setUser(null);
        setIsAuthenticated(false);
        setLoading(false);
        return null;
      }
    } catch (error) {
      console.error('AuthContext: Check auth failed:', error);
      setUser(null);
      setIsAuthenticated(false);
      setLoading(false);
      return null;
    }
  };

  // This effect handles keeping the user logged in on page refresh.
  useEffect(() => {
    let isMounted = true;
    console.log('AuthContext: Initializing authentication');

    const initializeAuth = async () => {
      try {
        console.log('AuthContext: Checking for existing session...');
        // First check if we have a valid session
        const response = await axios.get(
          `${config.API_BASE_URL}/auth/check`,
          { 
            withCredentials: true,
            headers: {
              'Cache-Control': 'no-cache',
              'Pragma': 'no-cache'
            }
          }
        );
        
        console.log('AuthContext: Session check response:', response.data);

        if (response.data.authenticated && isMounted) {
          console.log('AuthContext: Existing session found:', response.data.user);
          setUser(response.data.user);
          setIsAuthenticated(true);
          setLoading(false);
          return;
        } else if (isMounted) {
          console.log('AuthContext: No valid session found');
        }

        // If no valid session, check Firebase auth state
        const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
          if (!isMounted) return;
          
          console.log("Auth state changed:", firebaseUser);
          if (firebaseUser) {
            try {
              // Get fresh token and set up session with backend
              const idToken = await firebaseUser.getIdToken(true);
              const res = await axios.post(
                `${config.API_BASE_URL}/auth/session`,
                { idToken },
                { withCredentials: true }
              );
              
              if (isMounted) {
                console.log('Auth context session set up successfully', res.data);
                const backendUser = res.data.user || {};
                setUser({
                  ...backendUser,
                  uid: firebaseUser.uid,
                  email: firebaseUser.email || backendUser.email,
                  displayName: firebaseUser.displayName || backendUser.school_name,
                  photoURL: firebaseUser.photoURL
                });
                setIsAuthenticated(true);
                setLoading(false);
              }
            } catch (error) {
              console.error('Auth context session error:', error);
              if (isMounted) {
                setUser(null);
                setIsAuthenticated(false);
              }
            }
          } else if (isMounted) {
            setUser(null);
            setIsAuthenticated(false);
          }
          
          if (isMounted) {
            setLoading(false);
          }
        });

        return () => {
          unsubscribe();
        };
      } catch (error) {
        console.error('Initial auth check failed:', error);
        if (isMounted) {
          setUser(null);
          setIsAuthenticated(false);
          setLoading(false);
        }
      }
    };

    initializeAuth();

    return () => {
      isMounted = false;
    };
  }, []);

  const logout = async () => {
    try {
      const response = await axios.post(`${config.API_BASE_URL}/auth/logout`,
        {},
        { withCredentials: true }
      );
      console.log('Logout successful:', response.data);
      await auth.signOut();
    } catch (error) {
      console.error('Logout failed:', error);
    } finally {
      setUser(null);
      setIsAuthenticated(false);
    }
  };

  const value = React.useMemo(() => ({
    loading,
    isAuthenticated,
    user,
    setUser,
    setIsAuthenticated,
    logout,
    isLinkingPassword,
    setLinkingPassword,
    checkAuth
  }), [loading, isAuthenticated, user, isLinkingPassword]);

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};

export default AuthContext;
