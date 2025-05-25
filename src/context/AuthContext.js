import React, { createContext, useContext, useState, useEffect } from 'react';
import { authAPI, userAPI } from '../utils/api';

const AuthContext = createContext();

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  // Check for existing session on app load
  useEffect(() => {
    checkExistingSession();
  }, []);

  const checkExistingSession = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('token');
      const userData = localStorage.getItem('user');
      
      if (token && userData) {
        try {
          const parsedUser = JSON.parse(userData);
          
          // Verify token is still valid by making a test API call to get user profile
          const response = await userAPI.getUser(parsedUser.id);
          
          if (response.data) {
            // Update user data with fresh data from server
            const freshUserData = {
              id: response.data.id,
              username: response.data.username,
              email: response.data.email,
              role: response.data.role
            };
            
            localStorage.setItem('user', JSON.stringify(freshUserData));
            setUser(freshUserData);
            setIsAuthenticated(true);
          } else {
            throw new Error('Invalid user data received');
          }
        } catch (apiError) {
          console.error('Token validation failed:', apiError);
          // Token is invalid or expired, clear storage
          localStorage.removeItem('token');
          localStorage.removeItem('user');
          setUser(null);
          setIsAuthenticated(false);
        }
      }
    } catch (error) {
      console.error('Error checking existing session:', error);
      // Clear potentially corrupted data
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      setUser(null);
      setIsAuthenticated(false);
    } finally {
      setLoading(false);
    }
  };

  const login = async (email, password) => {
    try {
      setLoading(true);
      setError('');
      
      const response = await authAPI.login({ email, password });
      const { token, user: userData, message } = response.data;
      
      if (!token || !userData) {
        throw new Error('Invalid response from server');
      }

      // Store auth data
      localStorage.setItem('token', token);
      localStorage.setItem('user', JSON.stringify(userData));
      
      // Update state
      setUser(userData);
      setIsAuthenticated(true);
      
      console.log('Login successful:', message);
      return { success: true, user: userData, message };
    } catch (err) {
      console.error('Login error:', err);
      const errorMessage = err.response?.data?.error || 
                          err.response?.data?.details || 
                          err.message || 
                          'Login failed';
      setError(errorMessage);
      return { success: false, error: errorMessage };
    } finally {
      setLoading(false);
    }
  };

  const adminLogin = async (email, password) => {
    try {
      setLoading(true);
      setError('');
      
      // Use the same login endpoint but check for admin role
      const response = await authAPI.login({ email, password });
      const { token, user: userData, message } = response.data;
      
      if (!token || !userData) {
        throw new Error('Invalid response from server');
      }

      // Check if user has admin role
      if (userData.role !== 'admin') {
        throw new Error('Admin access required. Please use an admin account.');
      }

      // Store auth data
      localStorage.setItem('token', token);
      localStorage.setItem('user', JSON.stringify(userData));
      
      // Update state
      setUser(userData);
      setIsAuthenticated(true);
      
      console.log('Admin login successful:', message);
      return { success: true, user: userData, message };
    } catch (err) {
      console.error('Admin login error:', err);
      const errorMessage = err.response?.data?.error || 
                          err.response?.data?.details || 
                          err.message || 
                          'Admin login failed';
      setError(errorMessage);
      return { success: false, error: errorMessage };
    } finally {
      setLoading(false);
    }
  };

  const demoLogin = async (userType) => {
    try {
      setLoading(true);
      setError('');
      
      if (!['user', 'admin'].includes(userType)) {
        throw new Error('Invalid demo user type');
      }
      
      const response = await authAPI.demoLogin(userType);
      const { token, user: userData, message } = response.data;
      
      if (!token || !userData) {
        throw new Error('Invalid response from server');
      }

      // Store auth data
      localStorage.setItem('token', token);
      localStorage.setItem('user', JSON.stringify(userData));
      
      // Update state
      setUser(userData);
      setIsAuthenticated(true);
      
      console.log('Demo login successful:', message);
      return { success: true, user: userData, message };
    } catch (err) {
      console.error('Demo login error:', err);
      const errorMessage = err.response?.data?.error || 
                          err.response?.data?.details || 
                          err.message || 
                          'Demo login failed';
      setError(errorMessage);
      return { success: false, error: errorMessage };
    } finally {
      setLoading(false);
    }
  };

  const register = async (userData) => {
    try {
      setLoading(true);
      setError('');
      
      // Validate required fields
      if (!userData.username || !userData.email || !userData.password) {
        throw new Error('Username, email, and password are required');
      }

      // Prepare registration data
      const registrationData = {
        username: userData.username.trim(),
        email: userData.email.trim().toLowerCase(),
        password: userData.password,
        role: userData.role || 'user'
      };
      
      const response = await authAPI.register(registrationData);
      const { token, user: newUser, message } = response.data;
      
      if (!token || !newUser) {
        throw new Error('Invalid response from server');
      }

      // Store auth data
      localStorage.setItem('token', token);
      localStorage.setItem('user', JSON.stringify(newUser));
      
      // Update state
      setUser(newUser);
      setIsAuthenticated(true);
      
      console.log('Registration successful:', message);
      return { success: true, user: newUser, message };
    } catch (err) {
      console.error('Registration error:', err);
      const errorMessage = err.response?.data?.error || 
                          err.response?.data?.details || 
                          err.message || 
                          'Registration failed';
      setError(errorMessage);
      return { success: false, error: errorMessage };
    } finally {
      setLoading(false);
    }
  };

  const logout = () => {
    try {
      // Clear storage
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      localStorage.removeItem('rememberLogin');
      
      // Reset state
      setUser(null);
      setIsAuthenticated(false);
      setError('');
      setLoading(false);
      
      console.log('Logout successful');
      return { success: true, message: 'Logged out successfully' };
    } catch (error) {
      console.error('Logout error:', error);
      return { success: false, error: 'Logout failed' };
    }
  };

  const updateUser = async (updatedUserData) => {
    try {
      if (!user || !user.id) {
        throw new Error('No user logged in');
      }

      // Update user profile via API
      const response = await userAPI.updateUser(user.id, updatedUserData);
      const { user: updatedUser, message } = response.data;
      
      if (updatedUser) {
        // Update local storage and state with fresh data
        localStorage.setItem('user', JSON.stringify(updatedUser));
        setUser(updatedUser);
        console.log('User profile updated:', message);
        return { success: true, user: updatedUser, message };
      } else {
        // Fallback to local update if server doesn't return user data
        const mergedUser = { ...user, ...updatedUserData };
        localStorage.setItem('user', JSON.stringify(mergedUser));
        setUser(mergedUser);
        return { success: true, user: mergedUser, message: message || 'Profile updated successfully' };
      }
    } catch (error) {
      console.error('Update user error:', error);
      const errorMessage = error.response?.data?.error || 
                          error.response?.data?.details || 
                          error.message || 
                          'Failed to update user profile';
      setError(errorMessage);
      return { success: false, error: errorMessage };
    }
  };

  const changePassword = async (currentPassword, newPassword) => {
    try {
      setLoading(true);
      setError('');
      
      if (!user || !user.id) {
        throw new Error('No user logged in');
      }

      if (!currentPassword || !newPassword) {
        throw new Error('Current password and new password are required');
      }

      if (newPassword.length < 6) {
        throw new Error('New password must be at least 6 characters long');
      }

      // Call the change password endpoint
      const response = await userAPI.changePassword(user.id, {
        currentPassword,
        newPassword
      });

      const { message } = response.data;
      console.log('Password changed successfully:', message);
      return { success: true, message: message || 'Password changed successfully' };
    } catch (error) {
      console.error('Change password error:', error);
      const errorMessage = error.response?.data?.error || 
                          error.response?.data?.details || 
                          error.message || 
                          'Failed to change password';
      setError(errorMessage);
      return { success: false, error: errorMessage };
    } finally {
      setLoading(false);
    }
  };

  const clearError = () => {
    setError('');
  };

  const refreshToken = async () => {
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        throw new Error('No token available');
      }

      const userData = localStorage.getItem('user');
      if (userData) {
        const parsedUser = JSON.parse(userData);
        
        // Validate token by making an API call
        const response = await userAPI.getUser(parsedUser.id);
        
        if (response.data) {
          // Update user data with fresh data from server
          const freshUserData = {
            id: response.data.id,
            username: response.data.username,
            email: response.data.email,
            role: response.data.role
          };
          
          localStorage.setItem('user', JSON.stringify(freshUserData));
          setUser(freshUserData);
          setIsAuthenticated(true);
          return { success: true, message: 'Token refreshed successfully' };
        } else {
          throw new Error('Invalid user data received');
        }
      }
      
      throw new Error('No user data available');
    } catch (error) {
      console.error('Token refresh error:', error);
      logout(); // Force logout on token refresh failure
      return { success: false, error: error.message };
    }
  };

  const getUserProfile = async (userId = null) => {
    try {
      const targetUserId = userId || user?.id;
      if (!targetUserId) {
        throw new Error('No user ID provided');
      }

      const response = await userAPI.getUser(targetUserId);
      return { success: true, user: response.data };
    } catch (error) {
      console.error('Get user profile error:', error);
      const errorMessage = error.response?.data?.error || 
                          error.response?.data?.details || 
                          error.message || 
                          'Failed to fetch user profile';
      return { success: false, error: errorMessage };
    }
  };

  const isAdmin = () => {
    return user && user.role === 'admin';
  };

  const isOwner = (resourceUserId) => {
    return user && user.id === resourceUserId;
  };

  const canEdit = (resourceUserId) => {
    return isAdmin() || isOwner(resourceUserId);
  };

  // Debug function for development
  const getAuthDebugInfo = () => {
    if (process.env.NODE_ENV !== 'development') {
      return null;
    }
    
    return {
      isAuthenticated,
      user,
      token: localStorage.getItem('token'),
      loading,
      error,
      isAdmin: isAdmin(),
      timestamp: new Date().toISOString()
    };
  };

  const value = {
    // State
    user,
    loading,
    error,
    isAuthenticated,
    
    // Auth methods
    login,
    adminLogin,
    demoLogin,
    register,
    logout,
    
    // User management
    updateUser,
    changePassword,
    getUserProfile,
    
    // Utility methods
    clearError,
    refreshToken,
    checkExistingSession,
    
    // Permission helpers
    isAdmin,
    isOwner,
    canEdit,
    
    // Debug (development only)
    getAuthDebugInfo
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};

export default AuthContext;
