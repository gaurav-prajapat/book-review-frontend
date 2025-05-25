import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import LoadingSpinner from '../components/Common/LoadingSpinner';
import ErrorMessage from '../components/Common/ErrorMessage';
import { EyeIcon, EyeSlashIcon, UserIcon, ShieldCheckIcon } from '@heroicons/react/24/outline';

const Login = () => {
  const [formData, setFormData] = useState({
    email: '',
    password: ''
  });
  const [showPassword, setShowPassword] = useState(false);
  const [loginType, setLoginType] = useState('user');
  const [rememberMe, setRememberMe] = useState(false);
  const [formErrors, setFormErrors] = useState({});
  
  const { login, adminLogin, demoLogin, loading, error, clearError, isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const from = location.state?.from?.pathname || '/';

  useEffect(() => {
    if (isAuthenticated) {
      navigate(from, { replace: true });
    }
  }, [isAuthenticated, navigate, from]);

  useEffect(() => {
    clearError();
    setFormErrors({});
  }, [loginType, clearError]);

  const validateForm = () => {
    const errors = {};
    
    if (!formData.email.trim()) {
      errors.email = 'Email is required';
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      errors.email = 'Please enter a valid email address';
    }
    
    if (!formData.password.trim()) {
      errors.password = 'Password is required';
    } else if (formData.password.length < 6) {
      errors.password = 'Password must be at least 6 characters';
    }
    
    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    
    if (formErrors[name]) {
      setFormErrors(prev => ({
        ...prev,
        [name]: ''
      }));
    }
    
    if (error) {
      clearError();
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }
    
    try {
      let result;
      
      // Ensure we're sending clean data
      const loginData = {
        email: formData.email.trim(),
        password: formData.password
      };
      
      if (loginType === 'admin') {
        result = await adminLogin(loginData.email, loginData.password);
      } else {
        result = await login(loginData.email, loginData.password);
      }
      
      if (result.success) {
        if (rememberMe) {
          localStorage.setItem('rememberLogin', 'true');
        } else {
          localStorage.removeItem('rememberLogin');
        }
        
        navigate(from, { replace: true });
      }
    } catch (err) {
      console.error('Login submission error:', err);
    }
  };

  const handleDemoLogin = async (userType) => {
    try {
      const result = await demoLogin(userType);
      if (result.success) {
        navigate(from, { replace: true });
      }
    } catch (err) {
      console.error('Demo login error:', err);
    }
  };

  const togglePasswordVisibility = () => {
    setShowPassword(!showPassword);
  };

  const handleLoginTypeChange = (type) => {
    setLoginType(type);
    setFormData({ email: '', password: '' });
    setFormErrors({});
    clearError();
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        {/* Header */}
        <div className="text-center">
          <div className="mx-auto h-12 w-12 flex items-center justify-center rounded-full bg-blue-100">
            {loginType === 'admin' ? (
              <ShieldCheckIcon className="h-6 w-6 text-blue-600" />
            ) : (
              <UserIcon className="h-6 w-6 text-blue-600" />
            )}
          </div>
          <h2 className="mt-6 text-3xl font-extrabold text-gray-900">
            {loginType === 'admin' ? 'Admin Sign In' : 'Sign In'}
          </h2>
          <p className="mt-2 text-sm text-gray-600">
            {loginType === 'admin' 
              ? 'Access the admin dashboard' 
              : 'Access your book review account'
            }
          </p>
        </div>

        {/* Login Type Toggle */}
        <div className="flex rounded-lg bg-gray-100 p-1">
          <button
            type="button"
            onClick={() => handleLoginTypeChange('user')}
            className={`flex-1 py-2 px-4 rounded-md text-sm font-medium transition-colors ${
              loginType === 'user'
                ? 'bg-white text-blue-600 shadow-sm'
                : 'text-gray-500 hover:text-gray-700'
            }`}
          >
            <UserIcon className="h-4 w-4 inline mr-2" />
            User Login
          </button>
          <button
            type="button"
            onClick={() => handleLoginTypeChange('admin')}
            className={`flex-1 py-2 px-4 rounded-md text-sm font-medium transition-colors ${
              loginType === 'admin'
                ? 'bg-white text-orange-600 shadow-sm'
                : 'text-gray-500 hover:text-gray-700'
            }`}
          >
            <ShieldCheckIcon className="h-4 w-4 inline mr-2" />
            Admin Login
          </button>
        </div>

        <div className="card">
          <ErrorMessage message={error} onClose={clearError} />

          {/* Demo Login Buttons */}
          <div className="mb-6">
            <p className="text-sm text-gray-600 mb-3">Quick demo access:</p>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <button
                type="button"
                onClick={() => handleDemoLogin('user')}
                disabled={loading}
                className="btn-secondary text-sm disabled:opacity-50"
              >
                Demo User
              </button>
              <button
                type="button"
                onClick={() => handleDemoLogin('admin')}
                disabled={loading}
                className="btn-secondary text-sm disabled:opacity-50"
              >
                Demo Admin
              </button>
            </div>
            <div className="mt-2 text-center">
              <span className="text-xs text-gray-500">or sign in with your account</span>
            </div>
          </div>

          {/* Login Form */}
          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
                Email Address
              </label>
              <input
                type="email"
                id="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                required
                autoComplete="email"
                className={`input-field ${formErrors.email ? 'border-red-300 focus:border-red-500 focus:ring-red-500' : ''}`}
                placeholder="Enter your email"
                disabled={loading}
              />
              {formErrors.email && (
                <p className="mt-1 text-sm text-red-600">{formErrors.email}</p>
              )}
            </div>

            <div>
              <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-1">
                Password
              </label>
              <div className="relative">
                <input
                  type={showPassword ? 'text' : 'password'}
                  id="password"
                  name="password"
                  value={formData.password}
                  onChange={handleChange}
                  required
                  autoComplete="current-password"
                  className={`input-field pr-10 ${formErrors.password ? 'border-red-300 focus:border-red-500 focus:ring-red-500' : ''}`}
                  placeholder="Enter your password"
                  disabled={loading}
                />
                <button
                  type="button"
                  onClick={togglePasswordVisibility}
                  className="absolute inset-y-0 right-0 pr-3 flex items-center"
                  disabled={loading}
                >
                  {showPassword ? (
                    <EyeSlashIcon className="h-5 w-5 text-gray-400 hover:text-gray-600" />
                  ) : (
                    <EyeIcon className="h-5 w-5 text-gray-400 hover:text-gray-600" />
                  )}
                </button>
              </div>
              {formErrors.password && (
                <p className="mt-1 text-sm text-red-600">{formErrors.password}</p>
              )}
            </div>

            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <input
                  id="remember-me"
                  name="remember-me"
                  type="checkbox"
                  checked={rememberMe}
                  onChange={(e) => setRememberMe(e.target.checked)}
                  className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                  disabled={loading}
                />
                <label htmlFor="remember-me" className="ml-2 block text-sm text-gray-700">
                  Remember me
                </label>
              </div>

              <div className="text-sm">
                <a href="#" className="text-blue-600 hover:text-blue-700 font-medium">
                  Forgot password?
                </a>
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className={`w-full btn-primary disabled:opacity-50 disabled:cursor-not-allowed ${
                loginType === 'admin' ? 'bg-orange-600 hover:bg-orange-700' : ''
              }`}
            >
              {loading ? (
                <div className="flex items-center justify-center space-x-2">
                  <LoadingSpinner size="small" />
                  <span>Signing in...</span>
                </div>
              ) : (
                `Sign In${loginType === 'admin' ? ' as Admin' : ''}`
              )}
            </button>
          </form>

          <div className="mt-6 text-center">
            <p className="text-gray-600">
              Don't have an account?{' '}
              <Link 
                to="/register" 
                className="text-blue-600 hover:text-blue-700 font-medium"
                onClick={clearError}
              >
                Sign up here
              </Link>
            </p>
          </div>

          {process.env.NODE_ENV === 'development' && (
            <div className="mt-6 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
              <h4 className="text-sm font-medium text-yellow-800 mb-2">
                Demo Credentials (Development)
              </h4>
              <div className="text-xs text-yellow-700 space-y-1">
                <div>
                  <strong>Demo User:</strong> user@demo.com / user123
                </div>
                                <div>
                  <strong>Demo Admin:</strong> admin@demo.com / admin123
                </div>
              </div>
            </div>
          )}

          {loginType === 'admin' && (
            <div className="mt-4 p-3 bg-orange-50 border border-orange-200 rounded-lg">
              <div className="flex items-center">
                <ShieldCheckIcon className="h-5 w-5 text-orange-600 mr-2" />
                <p className="text-sm text-orange-800">
                  Admin access provides additional features like book management and user administration.
                </p>
              </div>
            </div>
          )}
        </div>

        <div className="text-center space-y-2">
          <Link 
            to="/" 
            className="text-sm text-gray-600 hover:text-gray-800"
            onClick={clearError}
          >
            ← Back to Home
          </Link>
          <div className="text-xs text-gray-500">
            By signing in, you agree to our Terms of Service and Privacy Policy
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;

