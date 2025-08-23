import { useState, useEffect } from 'react';
import { AuthContext } from './AuthContextDefinition.js';

export function AuthProvider({ children }) {
  const [isLoggedIn, setIsLoggedIn] = useState(true); // Temporarily set to true for testing
  const [user, setUser] = useState({ username: 'testuser', id: 1 }); // Mock user
  const [isLoading, setIsLoading] = useState(false); // No loading for mock
  const LIFO_API_URL = "https://lifo-api-fd466ebf5a8b.herokuapp.com";

  // Check for existing authentication on mount
  useEffect(() => {
    // Skip auth check for testing
    setIsLoading(false);
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

  // Mock authenticated fetch for testing
  const authenticatedFetch = async (url, options = {}) => {
    console.log('Mock fetch called with URL:', url, 'Options:', options);
    
    // Mock different responses based on the URL for testing
    if (url.includes('/api/jobs') && !url.includes('/work') && !url.includes('/stop') && !url.includes('/claim')) {
      // Mock jobs list - simulate different states based on user actions
      const currentState = sessionStorage.getItem('jobState') || 'none';
      const currentJobId = sessionStorage.getItem('currentJobId');
      
      let jobs = [
        {
          id: 1,
          title: "Deliver Package",
          description: "Deliver a package to the merchant district",
          payment: "50 gold coins",
          status: "available"
        },
        {
          id: 2,
          title: "Guard Duty",
          description: "Guard the city gates for 2 hours",
          payment: "75 gold coins",
          status: "available"
        },
        {
          id: 3,
          title: "Collect Herbs",
          description: "Collect rare herbs from the forest",
          payment: "30 gold coins",
          status: "available"
        }
      ];
      
      if (currentState === 'working' && currentJobId) {
        jobs = jobs.map(job => 
          job.id == currentJobId 
            ? { ...job, status: 'working', isWorking: true }
            : job
        );
      } else if (currentState === 'ended' && currentJobId) {
        jobs = jobs.map(job => 
          job.id == currentJobId 
            ? { ...job, status: 'ended', isEnded: true }
            : job
        );
      }
      
      return {
        ok: true,
        json: async () => jobs
      };
    }
    
    if (url.includes('/work')) {
      // Mock start job response
      const jobId = url.split('/')[4]; // Extract job ID from URL
      sessionStorage.setItem('jobState', 'working');
      sessionStorage.setItem('currentJobId', jobId);
      return {
        ok: true,
        json: async () => ({ message: "Job started successfully" })
      };
    }
    
    if (url.includes('/stop')) {
      // Mock stop job response
      sessionStorage.setItem('jobState', 'ended');
      return {
        ok: true,
        json: async () => ({ message: "Job stopped successfully" })
      };
    }
    
    if (url.includes('/claim')) {
      // Mock claim payment response
      sessionStorage.removeItem('jobState');
      sessionStorage.removeItem('currentJobId');
      return {
        ok: true,
        json: async () => ({ message: "Payment claimed successfully" })
      };
    }

    // Default mock response
    return {
      ok: false,
      status: 404,
      json: async () => ({ message: "Not found" })
    };
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