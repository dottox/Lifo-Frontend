import { useState, useEffect } from 'react';
import { AuthContext } from './AuthContextDefinition.js';

export function AuthProvider({ children }) {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [user, setUser] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const LIFO_API_URL = "https://lifo-api-fd466ebf5a8b.herokuapp.com";

  // Check for existing authentication on mount
  useEffect(() => {
    const checkAuth = async () => {
      try {
        const response = await fetch(`${LIFO_API_URL}/api/auth/verify`, {
          credentials: 'include',
        });
        
        if (response.ok) {
          const userData = await response.json();
          setUser(userData);
          setIsLoggedIn(true);
        }
      } catch (error) {
        console.log('Auth check failed:', error);
      } finally {
        setIsLoading(false);
      }
    };

    checkAuth();
  }, []);

  const login = async (username, password) => {
    try {
      const response = await fetch(`${LIFO_API_URL}/api/auth/signin`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include', // Include cookies for auth
        body: JSON.stringify({ username, password }),
      });

      if (response.ok) {
        const userData = await response.json();
        setUser(userData);
        setIsLoggedIn(true);
        setIsLoading(false);
        return { success: true, data: userData };
      } else {
        const errorData = await response.json();
        return { success: false, error: errorData.message || 'Login failed' };
      }
    } catch {
      return { success: false, error: 'Network error occurred' };
    }
  };

  const logout = async () => {
    try {
      // Call logout endpoint to clear server-side session/cookie
      await fetch(`${LIFO_API_URL}/api/auth/signout`, {
        method: 'POST',
        credentials: 'include',
      });
    } catch (error) {
      // Even if logout API fails, we should clear local state
      console.warn('Logout API call failed:', error);
    } finally {
      // Always clear local state
      setIsLoggedIn(false);
      setUser(null);
    }
  };

  // Utility function for making authenticated API calls with 401 handling
  const authenticatedFetch = async (url, options = {}) => {
    const response = await fetch(url, {
      ...options,
      credentials: 'include', // Always include cookies
    });

    // If we get a 401, the user's session has expired
    if (response.status === 401) {
      setIsLoggedIn(false);
      setUser(null);
      // You could also redirect to login page here if using a router
    }

    return response;
  };

  const value = {
    isLoggedIn,
    user,
    isLoading,
    login,
    logout,
    authenticatedFetch,
    LIFO_API_URL
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}