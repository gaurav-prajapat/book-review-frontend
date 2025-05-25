import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../../src/context/AuthContext';
import { 
  BookOpenIcon, 
  UserIcon, 
  Bars3Icon, 
  XMarkIcon,
  HomeIcon,
  BookmarkIcon,
  UserGroupIcon,
  Cog6ToothIcon,
  PlusIcon
} from '@heroicons/react/24/outline';

const Header = () => {
  const { user, isAuthenticated, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const handleLogout = () => {
    logout();
    navigate('/');
    setIsMobileMenuOpen(false);
  };

  const isActive = (path) => {
    return location.pathname === path;
  };

  const closeMobileMenu = () => {
    setIsMobileMenuOpen(false);
  };

  const NavLink = ({ to, children, icon: Icon, onClick }) => (
    <Link
      to={to}
      onClick={onClick || closeMobileMenu}
      className={`flex items-center space-x-2 px-3 py-2 rounded-md text-sm font-medium transition duration-200 ${
        isActive(to)
          ? 'bg-blue-100 text-blue-700'
          : 'text-gray-700 hover:text-blue-600 hover:bg-gray-50'
      }`}
    >
      {Icon && <Icon className="h-4 w-4" />}
      <span>{children}</span>
    </Link>
  );

  return (
    <header className="bg-white shadow-sm border-b sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <div className="flex items-center">
            <Link to="/" className="flex items-center space-x-2" onClick={closeMobileMenu}>
              <BookOpenIcon className="h-8 w-8 text-blue-600" />
              <span className="text-xl font-bold text-gray-900">BookReview</span>
            </Link>
          </div>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center space-x-1">
            <NavLink to="/" icon={HomeIcon}>
              Home
            </NavLink>
            <NavLink to="/books" icon={BookmarkIcon}>
              Books
            </NavLink>
            
            {isAuthenticated && (
              <>
                <NavLink to="/my-reviews" icon={BookOpenIcon}>
                  My Reviews
                </NavLink>
                
                {user?.role === 'admin' && (
                  <>
                    <NavLink to="/admin/dashboard" icon={Cog6ToothIcon}>
                      Dashboard
                    </NavLink>
                    <NavLink to="/admin/books" icon={PlusIcon}>
                      Manage Books
                    </NavLink>
                    <NavLink to="/admin/users" icon={UserGroupIcon}>
                      Users
                    </NavLink>
                  </>
                )}
              </>
            )}
          </nav>

          {/* Desktop User Menu */}
          <div className="hidden md:flex items-center space-x-4">
            {isAuthenticated ? (
              <div className="flex items-center space-x-4">
                <Link
                  to={`/profile/${user?.id}`}
                  className="flex items-center space-x-2 px-3 py-2 rounded-md text-sm font-medium text-gray-700 hover:text-blue-600 hover:bg-gray-50 transition duration-200"
                >
                  <UserIcon className="h-4 w-4" />
                  <span>{user?.username}</span>
                  {user?.role === 'admin' && (
                    <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-orange-100 text-orange-800">
                      Admin
                    </span>
                  )}
                </Link>
                <button
                  onClick={handleLogout}
                  className="btn-secondary text-sm"
                >
                  Logout
                </button>
              </div>
            ) : (
              <div className="flex items-center space-x-4">
                <Link 
                  to="/login" 
                  className="text-gray-700 hover:text-blue-600 transition duration-200 font-medium"
                >
                  Login
                </Link>
                <Link to="/register" className="btn-primary text-sm">
                  Register
                </Link>
              </div>
            )}
          </div>

          {/* Mobile menu button */}
          <div className="md:hidden">
            <button
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="inline-flex items-center justify-center p-2 rounded-md text-gray-700 hover:text-blue-600 hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-blue-500"
            >
              {isMobileMenuOpen ? (
                <XMarkIcon className="h-6 w-6" />
              ) : (
                <Bars3Icon className="h-6 w-6" />
              )}
            </button>
          </div>
        </div>

        {/* Mobile Navigation Menu */}
        {isMobileMenuOpen && (
          <div className="md:hidden border-t border-gray-200">
            <div className="px-2 pt-2 pb-3 space-y-1">
              <NavLink to="/" icon={HomeIcon}>
                Home
              </NavLink>
              <NavLink to="/books" icon={BookmarkIcon}>
                Books
              </NavLink>
              
              {isAuthenticated && (
                <>
                  <NavLink to="/my-reviews" icon={BookOpenIcon}>
                    My Reviews
                  </NavLink>
                  
                  {user?.role === 'admin' && (
                    <>
                      <div className="border-t border-gray-200 my-2"></div>
                      <div className="px-3 py-2">
                        <span className="text-xs font-semibold text-gray-500 uppercase tracking-wider">
                          Admin Panel
                        </span>
                      </div>
                      <NavLink to="/admin/dashboard" icon={Cog6ToothIcon}>
                        Dashboard
                      </NavLink>
                      <NavLink to="/admin/books" icon={PlusIcon}>
                        Manage Books
                      </NavLink>
                      <NavLink to="/admin/users" icon={UserGroupIcon}>
                        Users
                      </NavLink>
                    </>
                  )}
                </>
              )}
            </div>
            
            {/* Mobile User Section */}
            <div className="pt-4 pb-3 border-t border-gray-200">
              {isAuthenticated ? (
                <div className="px-2 space-y-1">
                  <Link
                    to={`/profile/${user?.id}`}
                    onClick={closeMobileMenu}
                    className="flex items-center px-3 py-2 rounded-md text-base font-medium text-gray-700 hover:text-blue-600 hover:bg-gray-50"
                  >
                    <UserIcon className="h-5 w-5 mr-3" />
                    <div className="flex flex-col">
                      <span>{user?.username}</span>
                      {user?.role === 'admin' && (
                        <span className="text-xs text-orange-600">Administrator</span>
                      )}
                    </div>
                  </Link>
                  <button
                    onClick={handleLogout}
                    className="w-full text-left px-3 py-2 rounded-md text-base font-medium text-gray-700 hover:text-red-600 hover:bg-gray-50"
                  >
                    Logout
                  </button>
                </div>
              ) : (
                <div className="px-2 space-y-1">
                  <Link
                    to="/login"
                    onClick={closeMobileMenu}
                    className="block px-3 py-2 rounded-md text-base font-medium text-gray-700 hover:text-blue-600 hover:bg-gray-50"
                  >
                    Login
                  </Link>
                  <Link
                    to="/register"
                    onClick={closeMobileMenu}
                    className="block px-3 py-2 rounded-md text-base font-medium bg-blue-600 text-white hover:bg-blue-700"
                  >
                    Register
                  </Link>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </header>
  );
};

export default Header;
