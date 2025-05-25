import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import LoadingSpinner from './LoadingSpinner';
import ErrorMessage from './ErrorMessage';

const AdminRoute = ({ children }) => {
  const { isAuthenticated, user, loading, error } = useAuth();
  const location = useLocation();

  // Show loading spinner while authentication is being checked
  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="text-center">
          <LoadingSpinner size="large" />
          <p className="mt-4 text-gray-600">Verifying admin access...</p>
        </div>
      </div>
    );
  }

  // Show error if there's an authentication error
  if (error) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="max-w-md w-full">
          <ErrorMessage 
            message={`Authentication Error: ${error}`}
            onClose={() => window.location.reload()}
          />
          <div className="text-center mt-4">
            <button 
              onClick={() => window.location.href = '/login'}
              className="btn-primary"
            >
              Go to Login
            </button>
          </div>
        </div>
      </div>
    );
  }

  // Redirect to login if not authenticated
  if (!isAuthenticated) {
    return (
      <Navigate 
        to="/login" 
        state={{ 
          from: location,
          message: 'Please log in to access the admin panel.'
        }} 
        replace 
      />
    );
  }

  // Check if user exists and has admin role
  if (!user) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="text-center">
          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-6">
            <div className="flex items-center justify-center w-12 h-12 mx-auto mb-4 bg-yellow-100 rounded-full">
              <svg className="w-6 h-6 text-yellow-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.732-.833-2.5 0L4.268 19.5c-.77.833.192 2.5 1.732 2.5z" />
              </svg>
            </div>
            <h3 className="text-lg font-medium text-yellow-800 mb-2">
              User Information Unavailable
            </h3>
            <p className="text-yellow-700 mb-4">
              Unable to verify user permissions. Please try logging in again.
            </p>
            <button 
              onClick={() => window.location.href = '/login'}
              className="btn-primary"
            >
              Login Again
            </button>
          </div>
        </div>
      </div>
    );
  }

  // Redirect to unauthorized page if user is not admin
  if (user.role !== 'admin') {
    return (
      <Navigate 
        to="/unauthorized" 
        state={{ 
          from: location,
          message: 'Admin access required to view this page.',
          userRole: user.role
        }} 
        replace 
      />
    );
  }

  // User is authenticated and is admin, render the protected component
  return (
    <div className="admin-route">
      {/* Optional: Add admin header/banner */}
      <div className="bg-gradient-to-r from-blue-600 to-blue-700 text-white px-4 py-2">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
            </svg>
            <span className="text-sm font-medium">Admin Panel</span>
          </div>
          <div className="flex items-center space-x-4">
            <span className="text-sm">
              Welcome, {user.username}
            </span>
            <div className="w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center">
              <span className="text-sm font-medium">
                {user.username?.charAt(0).toUpperCase() || 'A'}
              </span>
            </div>
          </div>
        </div>
      </div>
      
      {/* Render the protected admin component */}
      <div className="admin-content">
        {children}
      </div>
    </div>
  );
};

export default AdminRoute;
