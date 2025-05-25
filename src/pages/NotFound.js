import React from 'react';
import { Link } from 'react-router-dom';
import { HomeIcon, BookOpenIcon, ArrowLeftIcon } from '@heroicons/react/24/outline';

const NotFound = () => {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="max-w-md w-full text-center">
        <div className="mb-8">
          <div className="mx-auto w-24 h-24 bg-gray-200 rounded-full flex items-center justify-center mb-6">
            <span className="text-4xl font-bold text-gray-400">404</span>
          </div>
          <h1 className="text-3xl font-bold text-gray-900 mb-4">
            Page Not Found
          </h1>
          <p className="text-gray-600 mb-8">
            Sorry, we couldn't find the page you're looking for. The page might have been moved, deleted, or you entered the wrong URL.
          </p>
        </div>

        <div className="space-y-4">
          <Link
            to="/"
            className="btn-primary w-full flex items-center justify-center space-x-2"
          >
            <HomeIcon className="h-5 w-5" />
            <span>Go to Homepage</span>
          </Link>
          
          <Link
            to="/books"
            className="btn-secondary w-full flex items-center justify-center space-x-2"
          >
            <BookOpenIcon className="h-5 w-5" />
            <span>Browse Books</span>
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
          <p className="text-sm text-gray-500">
            If you believe this is an error, please{' '}
            <a href="mailto:support@bookreviews.com" className="text-blue-600 hover:text-blue-700">
              contact support
            </a>
          </p>
        </div>
      </div>
    </div>
  );
};

export default NotFound;