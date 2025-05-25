import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { 
  ShieldExclamationIcon, 
  HomeIcon, 
  UserIcon, 
  ArrowLeftIcon 
} from '@heroicons/react/24/outline';
import { useAuth } from '../context/AuthContext';

const Unauthorized = () => {
  const location = useLocation();
  const { user, isAuthenticated } = useAuth();
  
  const message = location.state?.message || 'You do not have permission to access this page.';
  const userRole = location.state?.userRole || user?.role || 'guest';
  const fromPath = location.state?.from?.pathname || '/admin';

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="max-w-md w-full text-center">
        <div className="mb-8">
          <div className="mx-auto w-24 h-24 bg-red-100 rounded-full flex items-center justify-center mb-6">
            <ShieldExclamationIcon className="h-12 w-12 text-red-600" />
          </div>
          <h1 className="text-3xl font-bold text-gray-900 mb-4">
            Access Denied
          </h1>
          <p className="text-gray-600 mb-6">
            {message}
          </p>
          
          {isAuthenticated && (
            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-6">
              <div className="flex items-center space-x-2 text-yellow-800">
                <UserIcon className="h-5 w-5" />
                <span className="text-sm">
                  Current role: <span className="font-medium capitalize">{userRole}</span>
                </span>
              </div>
              {userRole !== 'admin' && (
                <p className="text-sm text-yellow-700 mt-2">
                  Administrator privileges are required to access {fromPath}.
                </p>
              )}
            </div>
          )}
        </div>

        <div className="space-y-4">
          {!isAuthenticated ? (
            <Link
              to="/login"
              state={{ from: location.state?.from }}
              className="btn-primary w-full flex items-center justify-center space-x-2"
            >
              <UserIcon className="h-5 w-5" />
              <span>Login</span>
            </Link>
          ) : (
            <Link
              to={`/profile/${user?.id}`}
              className="btn-primary w-full flex items-center justify-center space-x-2"
            >
              <UserIcon className="h-5 w-5" />
              <span>Go to Profile</span>
            </Link>
          )}
          
          <Link
            to="/"
            className="btn-secondary w-full flex items-center justify-center space-x-2"
          >
            <HomeIcon className="h-5 w-5" />
            <span>Go to Homepage</span>
          </Link>
          
                    <button
            onClick={() => window.history.back()}
            className="w-full text-gray-600 hover:text-gray-800 flex items-center justify-center space-x-2 py-2"
          >
            <ArrowLeftIcon className="h-4 w-4" />
            <span>Go Back</span>
          </button>
        </div>

        <div className="mt-8 pt-8 border-t border-gray-200">
          <div className="text-sm text-gray-500">
            <p className="mb-2">Need admin access?</p>
            <p>
              Contact your administrator or{' '}
              <a href="mailto:admin@bookreviews.com" className="text-blue-600 hover:text-blue-700">
                request permissions
              </a>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Unauthorized;
