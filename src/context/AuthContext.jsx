import { createContext, useContext, useState, useEffect } from 'react';

const AuthContext = createContext();

export function AuthProvider({ children }) {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [user, setUser] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const LIFO_API_URL = "https://lifo-api-fd466ebf5a8b.herokuapp.com";

  // Check for existing auth on mount
  useEffect(() => {
    checkAuthStatus();
  }, []);

  const checkAuthStatus = async () => {
    try {
      const response = await fetch(`${LIFO_API_URL}/api/auth/verify`, {
        method: 'GET',
        credentials: 'include', // Include cookies in the request
      });

      if (response.ok) {
        const userData = await response.json();
        setUser(userData);
        setIsLoggedIn(true);
      } else {
        // If verification fails, ensure we're logged out
        setIsLoggedIn(false);
        setUser(null);
      }
    } catch {
      // If there's an error, assume not logged in
      setIsLoggedIn(false);
      setUser(null);
    } finally {
      setIsLoading(false);
    }
  };

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

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}