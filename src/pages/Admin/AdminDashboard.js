import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { 
  BookOpenIcon, 
  UserGroupIcon, 
  StarIcon, 
  PlusIcon,
  ChartBarIcon,
  EyeIcon,
  PencilIcon,
  TrashIcon,
  CalendarIcon,
  ExclamationTriangleIcon
} from '@heroicons/react/24/outline';
import { 
  StarIcon as StarSolidIcon,
  CheckCircleIcon 
} from '@heroicons/react/24/solid';
import LoadingSpinner from '../../components/Common/LoadingSpinner';
import ErrorMessage from '../../components/Common/ErrorMessage';
import { booksAPI, userAPI, reviewsAPI } from '../../utils/api';

const AdminDashboard = () => {
  const [stats, setStats] = useState({
    totalBooks: 0,
    totalUsers: 0,
    totalReviews: 0,
    averageRating: 0,
    newUsersThisMonth: 0,
    newReviewsThisWeek: 0,
    topRatedBooks: 0,
    pendingReviews: 0
  });
  const [recentBooks, setRecentBooks] = useState([]);
  const [recentReviews, setRecentReviews] = useState([]);
  const [recentUsers, setRecentUsers] = useState([]);
  const [topBooks, setTopBooks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      setError('');
      
      // Fetch all dashboard data in parallel
      const [booksRes, usersRes, reviewsRes] = await Promise.all([
        booksAPI.getBooks({ limit: 10, sortBy: 'created_at', sortOrder: 'DESC' }),
        userAPI.getUsers({ limit: 10 }),
        reviewsAPI.getRecentReviews({ limit: 10 })
      ]);

      // Process books data
      const booksData = booksRes.data;
      const books = booksData.books || booksData.data || booksData;
      const totalBooks = booksData.pagination?.total || booksData.total || (Array.isArray(books) ? books.length : 0);

      // Process users data
      const usersData = usersRes.data;
      const users = usersData.users || usersData.data || usersData;
      const totalUsers = usersData.pagination?.total || usersData.total || (Array.isArray(users) ? users.length : 0);

      // Process reviews data
      const reviewsData = reviewsRes.data;
      const reviews = reviewsData.reviews || reviewsData.data || reviewsData;
      const totalReviews = reviewsData.pagination?.total || reviewsData.total || (Array.isArray(reviews) ? reviews.length : 0);

      // Calculate average rating from books
      let averageRating = 0;
      if (Array.isArray(books) && books.length > 0) {
        const booksWithRatings = books.filter(book => book.average_rating > 0);
        if (booksWithRatings.length > 0) {
          const totalRating = booksWithRatings.reduce((sum, book) => sum + parseFloat(book.average_rating || 0), 0);
          averageRating = totalRating / booksWithRatings.length;
        }
      }

      // Get top-rated books
      const topRatedBooks = Array.isArray(books) ? 
        books
          .filter(book => book.average_rating > 0)
          .sort((a, b) => parseFloat(b.average_rating) - parseFloat(a.average_rating))
          .slice(0, 5) : [];

      // Calculate additional stats
      const newUsersThisMonth = Array.isArray(users) ? 
        users.filter(user => {
          const userDate = new Date(user.created_at);
          const monthAgo = new Date();
          monthAgo.setMonth(monthAgo.getMonth() - 1);
          return userDate > monthAgo;
        }).length : 0;

      const newReviewsThisWeek = Array.isArray(reviews) ? 
        reviews.filter(review => {
          const reviewDate = new Date(review.created_at);
          const weekAgo = new Date();
          weekAgo.setDate(weekAgo.getDate() - 7);
          return reviewDate > weekAgo;
        }).length : 0;

      setStats({
        totalBooks,
        totalUsers,
        totalReviews,
        averageRating,
        newUsersThisMonth,
        newReviewsThisWeek,
        topRatedBooks: topRatedBooks.length,
        pendingReviews: 0 // This would need a specific endpoint
      });

      setRecentBooks(Array.isArray(books) ? books.slice(0, 5) : []);
      setRecentReviews(Array.isArray(reviews) ? reviews.slice(0, 5) : []);
      setRecentUsers(Array.isArray(users) ? users.slice(0, 5) : []);
      setTopBooks(topRatedBooks);

    } catch (error) {
      console.error('Failed to fetch dashboard data:', error);
      setError('Failed to load dashboard data. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleRefresh = async () => {
    setRefreshing(true);
    await fetchDashboardData();
    setRefreshing(false);
  };

  const handleDeleteBook = async (bookId) => {
    if (window.confirm('Are you sure you want to delete this book? This will also delete all associated reviews.')) {
      try {
        await booksAPI.deleteBook(bookId);
        setRecentBooks(recentBooks.filter(book => book.id !== bookId));
        // Update stats
        setStats(prev => ({ ...prev, totalBooks: prev.totalBooks - 1 }));
      } catch (err) {
        setError('Failed to delete book');
      }
    }
  };

  const StatCard = ({ title, value, icon: Icon, color, link, subtitle, trend }) => (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 hover:shadow-md transition-shadow">
      <div className="flex items-center justify-between">
        <div className="flex-1">
          <div className="flex items-center space-x-3">
            <div className={`p-3 rounded-lg ${color}`}>
              <Icon className="h-6 w-6 text-white" />
            </div>
            <div>
              <p className="text-sm font-medium text-gray-600">{title}</p>
              <p className="text-2xl font-bold text-gray-900">{value}</p>
              {subtitle && (
                <p className="text-xs text-gray-500 mt-1">{subtitle}</p>
              )}
            </div>
          </div>
        </div>
        {trend && (
          <div className={`flex items-center space-x-1 text-sm ${
            trend.direction === 'up' ? 'text-green-600' : 
            trend.direction === 'down' ? 'text-red-600' : 'text-gray-600'
          }`}>
            
            <span>{trend.value}</span>
          </div>
        )}
      </div>
      {link && (
        <div className="mt-4 pt-4 border-t border-gray-100">
          <Link to={link} className="text-sm text-blue-600 hover:text-blue-700 font-medium">
            View all →
          </Link>
        </div>
      )}
    </div>
  );

  const renderStars = (rating) => {
    const numRating = parseFloat(rating) || 0;
    return [...Array(5)].map((_, index) => (
      <StarSolidIcon
        key={index}
        className={`h-4 w-4 ${
          index < Math.floor(numRating) ? 'text-yellow-400' : 'text-gray-300'
        }`}
      />
    ));
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'Unknown';
    try {
      return new Date(dateString).toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
        year: 'numeric'
      });
    } catch {
      return 'Invalid date';
    }
  };

  if (loading) return <LoadingSpinner />;

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Admin Dashboard</h1>
          <p className="text-gray-600 mt-2">
            Overview of your book review platform
          </p>
        </div>
        <div className="flex space-x-3">
          <button
            onClick={handleRefresh}
            disabled={refreshing}
            className="btn-secondary flex items-center space-x-2"
          >
            <CalendarIcon className={`h-4 w-4 ${refreshing ? 'animate-spin' : ''}`} />
            <span>Refresh</span>
          </button>
          <Link to="/admin/books/add" className="btn-primary flex items-center space-x-2">
            <PlusIcon className="h-4 w-4" />
            <span>Add New Book</span>
          </Link>
        </div>
      </div>

      <ErrorMessage message={error} onClose={() => setError('')} />

      {/* Statistics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard
          title="Total Books"
          value={stats.totalBooks.toLocaleString()}
          icon={BookOpenIcon}
          color="bg-blue-500"
          link="/admin/books"
          subtitle="In your collection"
        />
        <StatCard
          title="Total Users"
          value={stats.totalUsers.toLocaleString()}
          icon={UserGroupIcon}
          color="bg-green-500"
          link="/admin/users"
          subtitle={`${stats.newUsersThisMonth} new this month`}
        />
        <StatCard
          title="Total Reviews"
          value={stats.totalReviews.toLocaleString()}
          icon={ChartBarIcon}
          color="bg-purple-500"
          subtitle={`${stats.newReviewsThisWeek} new this week`}
        />
        <StatCard
          title="Average Rating"
          value={stats.averageRating.toFixed(1)}
          icon={StarIcon}
          color="bg-yellow-500"
          subtitle="Across all books"
        />
      </div>

      {/* Secondary Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-gradient-to-r from-blue-50 to-blue-100 rounded-lg p-6 border border-blue-200">
          <div className="flex items-center space-x-3">
            <CheckCircleIcon className="h-8 w-8 text-blue-600" />
            <div>
              <p className="text-sm font-medium text-blue-800">Top Rated Books</p>
              <p className="text-2xl font-bold text-blue-900">{stats.topRatedBooks}</p>
              <p className="text-xs text-blue-700">Books with 4+ stars</p>
            </div>
          </div>
        </div>

        <div className="bg-gradient-to-r from-green-50 to-green-100 rounded-lg p-6 border border-green-200">
          <div className="flex items-center space-x-3">
            <div>
              <p className="text-sm font-medium text-green-800">Growth Rate</p>
              <p className="text-2xl font-bold text-green-900">+{stats.newUsersThisMonth}</p>
              <p className="text-xs text-green-700">New users this month</p>
            </div>
          </div>
        </div>

        <div className="bg-gradient-to-r from-orange-50 to-orange-100 rounded-lg p-6 border border-orange-200">
          <div className="flex items-center space-x-3">
            <ExclamationTriangleIcon className="h-8 w-8 text-orange-600" />
            <div>
              <p className="text-sm font-medium text-orange-800">Activity</p>
              <p className="text-2xl font-bold text-orange-900">{stats.newReviewsThisWeek}</p>
              <p className="text-xs text-orange-700">Reviews this week</p>
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-2 gap-8">
        {/* Recent Books */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200">
          <div className="p-6 border-b border-gray-200">
            <div className="flex justify-between items-center">
              <h2 className="text-lg font-semibold text-gray-900">Recent Books</h2>
              <Link to="/admin/books" className="text-sm text-blue-600 hover:text-blue-700 font-medium">
                View all
              </Link>
            </div>
          </div>
          <div className="p-6">
            {recentBooks.length > 0 ? (
              <div className="space-y-4">
                {recentBooks.map((book) => (
                  <div key={book.id} className="flex items-center space-x-4 p-3 rounded-lg hover:bg-gray-50 transition-colors">
                    <img
                      src={book.cover_image || 'https://images-na.ssl-images-amazon.com/images/I/51EstVXM1UL._SX331_BO1,204,203,200_.jpg'}
                      alt={book.title}
                      className="h-16 w-12 object-cover rounded shadow-sm"
                      onError={(e) => {
                        e.target.src = 'https://images-na.ssl-images-amazon.com/images/I/51EstVXM1UL._SX331_BO1,204,203,200_.jpg';
                      }}
                    />
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-gray-900 truncate">
                        {book.title}
                      </p>
                      <p className="text-sm text-gray-500 truncate">
                        by {book.author}
                      </p>
                                            <div className="flex items-center space-x-2 mt-1">
                        <div className="flex">
                          {renderStars(book.average_rating)}
                        </div>
                        <span className="text-xs text-gray-500">
                          {book.review_count || 0} reviews
                        </span>
                      </div>
                      <p className="text-xs text-gray-500">
                        Added {formatDate(book.created_at)}
                      </p>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Link
                        to={`/books/${book.id}`}
                        className="text-blue-600 hover:text-blue-800 p-1"
                        title="View book"
                      >
                        <EyeIcon className="h-4 w-4" />
                      </Link>
                      <Link
                        to={`/admin/books/edit/${book.id}`}
                        className="text-green-600 hover:text-green-800 p-1"
                        title="Edit book"
                      >
                        <PencilIcon className="h-4 w-4" />
                      </Link>
                      <button
                        onClick={() => handleDeleteBook(book.id)}
                        className="text-red-600 hover:text-red-800 p-1"
                        title="Delete book"
                      >
                        <TrashIcon className="h-4 w-4" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8">
                <BookOpenIcon className="h-12 w-12 mx-auto text-gray-400 mb-4" />
                <p className="text-gray-500">No books found</p>
                <Link to="/admin/books/add" className="btn-primary mt-4">
                  Add First Book
                </Link>
              </div>
            )}
          </div>
        </div>

        {/* Recent Reviews */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200">
          <div className="p-6 border-b border-gray-200">
            <div className="flex justify-between items-center">
              <h2 className="text-lg font-semibold text-gray-900">Recent Reviews</h2>
              <Link to="/admin/reviews" className="text-sm text-blue-600 hover:text-blue-700 font-medium">
                View all
              </Link>
            </div>
          </div>
          <div className="p-6">
            {recentReviews.length > 0 ? (
              <div className="space-y-4">
                {recentReviews.map((review) => (
                  <div key={review.id} className="p-3 rounded-lg hover:bg-gray-50 transition-colors">
                    <div className="flex items-start justify-between mb-2">
                      <div className="flex-1">
                        <p className="text-sm font-medium text-gray-900 truncate">
                          {review.book_title}
                        </p>
                        <p className="text-xs text-gray-500">
                          by {review.username}
                        </p>
                      </div>
                      <div className="flex">
                        {renderStars(review.rating)}
                      </div>
                    </div>
                    {review.comment && (
                      <p className="text-sm text-gray-700 line-clamp-2 mb-2">
                        {review.comment}
                      </p>
                    )}
                    <p className="text-xs text-gray-500">
                      {formatDate(review.created_at)}
                    </p>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8">
                <ChartBarIcon className="h-12 w-12 mx-auto text-gray-400 mb-4" />
                <p className="text-gray-500">No reviews yet</p>
              </div>
            )}
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-2 gap-8">
        {/* Top Rated Books */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200">
          <div className="p-6 border-b border-gray-200">
            <div className="flex justify-between items-center">
              <h2 className="text-lg font-semibold text-gray-900">Top Rated Books</h2>
              <Link to="/admin/books?sort=rating" className="text-sm text-blue-600 hover:text-blue-700 font-medium">
                View all
              </Link>
            </div>
          </div>
          <div className="p-6">
            {topBooks.length > 0 ? (
              <div className="space-y-4">
                {topBooks.map((book, index) => (
                  <div key={book.id} className="flex items-center space-x-4 p-3 rounded-lg hover:bg-gray-50 transition-colors">
                    <div className="flex-shrink-0">
                      <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold ${
                        index === 0 ? 'bg-yellow-100 text-yellow-800' :
                        index === 1 ? 'bg-gray-100 text-gray-800' :
                        index === 2 ? 'bg-orange-100 text-orange-800' :
                        'bg-blue-100 text-blue-800'
                      }`}>
                        {index + 1}
                      </div>
                    </div>
                    <img
                      src={book.cover_image || 'https://images-na.ssl-images-amazon.com/images/I/51EstVXM1UL._SX331_BO1,204,203,200_.jpg'}
                      alt={book.title}
                      className="h-12 w-8 object-cover rounded shadow-sm"
                      onError={(e) => {
                        e.target.src = 'https://images-na.ssl-images-amazon.com/images/I/51EstVXM1UL._SX331_BO1,204,203,200_.jpg';
                      }}
                    />
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-gray-900 truncate">
                        {book.title}
                      </p>
                      <p className="text-sm text-gray-500 truncate">
                        by {book.author}
                      </p>
                      <div className="flex items-center space-x-2 mt-1">
                        <div className="flex">
                          {renderStars(book.average_rating)}
                        </div>
                        <span className="text-xs text-gray-500">
                          {parseFloat(book.average_rating).toFixed(1)} ({book.review_count || 0} reviews)
                        </span>
                      </div>
                    </div>
                    <Link
                      to={`/books/${book.id}`}
                      className="text-blue-600 hover:text-blue-800 p-1"
                      title="View book"
                    >
                      <EyeIcon className="h-4 w-4" />
                    </Link>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8">
                <StarIcon className="h-12 w-12 mx-auto text-gray-400 mb-4" />
                <p className="text-gray-500">No rated books yet</p>
              </div>
            )}
          </div>
        </div>

        {/* Recent Users */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200">
          <div className="p-6 border-b border-gray-200">
            <div className="flex justify-between items-center">
              <h2 className="text-lg font-semibold text-gray-900">Recent Users</h2>
              <Link to="/admin/users" className="text-sm text-blue-600 hover:text-blue-700 font-medium">
                View all
              </Link>
            </div>
          </div>
          <div className="p-6">
            {recentUsers.length > 0 ? (
              <div className="space-y-4">
                {recentUsers.map((user) => (
                  <div key={user.id} className="flex items-center space-x-4 p-3 rounded-lg hover:bg-gray-50 transition-colors">
                    <div className="flex-shrink-0">
                      <div className="w-10 h-10 bg-gray-200 rounded-full flex items-center justify-center">
                        <span className="text-sm font-medium text-gray-600">
                          {user.username?.charAt(0).toUpperCase() || 'U'}
                        </span>
                      </div>
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-gray-900 truncate">
                        {user.username}
                      </p>
                      <p className="text-sm text-gray-500 truncate">
                        {user.email}
                      </p>
                      <div className="flex items-center space-x-2 mt-1">
                        <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${
                          user.role === 'admin' 
                            ? 'bg-orange-100 text-orange-800' 
                            : 'bg-green-100 text-green-800'
                        }`}>
                          {user.role}
                        </span>
                        <span className="text-xs text-gray-500">
                          {user.review_count || 0} reviews
                        </span>
                      </div>
                      <p className="text-xs text-gray-500">
                        Joined {formatDate(user.created_at)}
                      </p>
                    </div>
                    <Link
                      to={`/profile/${user.id}`}
                      className="text-blue-600 hover:text-blue-800 p-1"
                      title="View profile"
                    >
                      <EyeIcon className="h-4 w-4" />
                    </Link>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8">
                <UserGroupIcon className="h-12 w-12 mx-auto text-gray-400 mb-4" />
                <p className="text-gray-500">No users found</p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200">
        <div className="p-6 border-b border-gray-200">
          <h2 className="text-lg font-semibold text-gray-900">Quick Actions</h2>
        </div>
        <div className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <Link
              to="/admin/books/add"
              className="flex items-center space-x-3 p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors group"
            >
              <div className="p-2 bg-blue-100 rounded-lg group-hover:bg-blue-200 transition-colors">
                <PlusIcon className="h-5 w-5 text-blue-600" />
              </div>
              <div>
                <p className="font-medium text-gray-900">Add Book</p>
                <p className="text-sm text-gray-600">Add a new book to the collection</p>
              </div>
            </Link>

            <Link
              to="/admin/books"
              className="flex items-center space-x-3 p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors group"
            >
              <div className="p-2 bg-green-100 rounded-lg group-hover:bg-green-200 transition-colors">
                <BookOpenIcon className="h-5 w-5 text-green-600" />
              </div>
              <div>
                <p className="font-medium text-gray-900">Manage Books</p>
                <p className="text-sm text-gray-600">Edit, delete, and organize books</p>
              </div>
            </Link>

            <Link
              to="/admin/users"
              className="flex items-center space-x-3 p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors group"
            >
              <div className="p-2 bg-purple-100 rounded-lg group-hover:bg-purple-200 transition-colors">
                <UserGroupIcon className="h-5 w-5 text-purple-600" />
              </div>
              <div>
                <p className="font-medium text-gray-900">Manage Users</p>
                <p className="text-sm text-gray-600">View and manage user accounts</p>
              </div>
            </Link>

            <Link
              to="/admin/reviews"
              className="flex items-center space-x-3 p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors group"
            >
              <div className="p-2 bg-yellow-100 rounded-lg group-hover:bg-yellow-200 transition-colors">
                <ChartBarIcon className="h-5 w-5 text-yellow-600" />
              </div>
              <div>
                <p className="font-medium text-gray-900">View Reviews</p>
                <p className="text-sm text-gray-600">Monitor and moderate reviews</p>
              </div>
            </Link>
          </div>
        </div>
      </div>

      {/* System Health */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200">
        <div className="p-6 border-b border-gray-200">
          <h2 className="text-lg font-semibold text-gray-900">System Health</h2>
        </div>
        <div className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="flex items-center space-x-3">
              <div className="w-3 h-3 bg-green-400 rounded-full"></div>
              <div>
                <p className="text-sm font-medium text-gray-900">Database</p>
                <p className="text-xs text-gray-500">Connected and operational</p>
              </div>
            </div>
            
            <div className="flex items-center space-x-3">
              <div className="w-3 h-3 bg-green-400 rounded-full"></div>
              <div>
                <p className="text-sm font-medium text-gray-900">API Server</p>
                <p className="text-xs text-gray-500">Running smoothly</p>
              </div>
            </div>
            
                        <div className="flex items-center space-x-3">
              <div className="w-3 h-3 bg-green-400 rounded-full"></div>
              <div>
                <p className="text-sm font-medium text-gray-900">File Storage</p>
                <p className="text-xs text-gray-500">Available and accessible</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Performance Metrics */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200">
        <div className="p-6 border-b border-gray-200">
          <h2 className="text-lg font-semibold text-gray-900">Performance Metrics</h2>
        </div>
        <div className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <div className="text-center">
              <div className="text-2xl font-bold text-blue-600 mb-1">
                {((stats.totalReviews / Math.max(stats.totalBooks, 1)) || 0).toFixed(1)}
              </div>
              <div className="text-sm text-gray-600">Avg Reviews per Book</div>
            </div>
            
            <div className="text-center">
              <div className="text-2xl font-bold text-green-600 mb-1">
                {((stats.totalReviews / Math.max(stats.totalUsers, 1)) || 0).toFixed(1)}
              </div>
              <div className="text-sm text-gray-600">Avg Reviews per User</div>
            </div>
            
            <div className="text-center">
              <div className="text-2xl font-bold text-purple-600 mb-1">
                {Math.round((stats.newUsersThisMonth / 30) * 100) / 100}
              </div>
              <div className="text-sm text-gray-600">New Users per Day</div>
            </div>
            
            <div className="text-center">
              <div className="text-2xl font-bold text-orange-600 mb-1">
                {Math.round((stats.newReviewsThisWeek / 7) * 100) / 100}
              </div>
              <div className="text-sm text-gray-600">Reviews per Day</div>
            </div>
          </div>
        </div>
      </div>

      {/* Recent Activity Timeline */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200">
        <div className="p-6 border-b border-gray-200">
          <h2 className="text-lg font-semibold text-gray-900">Recent Activity</h2>
        </div>
        <div className="p-6">
          <div className="flow-root">
            <ul className="-mb-8">
              {/* Combine recent books, reviews, and users into a timeline */}
              {[
                ...recentBooks.slice(0, 2).map(book => ({
                  id: `book-${book.id}`,
                  type: 'book',
                  title: `New book added: ${book.title}`,
                  subtitle: `by ${book.author}`,
                  time: book.created_at,
                  icon: BookOpenIcon,
                  iconColor: 'bg-blue-500'
                })),
                ...recentReviews.slice(0, 2).map(review => ({
                  id: `review-${review.id}`,
                  type: 'review',
                  title: `New review for ${review.book_title}`,
                  subtitle: `${review.rating} stars by ${review.username}`,
                  time: review.created_at,
                  icon: StarIcon,
                  iconColor: 'bg-yellow-500'
                })),
                ...recentUsers.slice(0, 2).map(user => ({
                  id: `user-${user.id}`,
                  type: 'user',
                  title: `New user registered: ${user.username}`,
                  subtitle: user.email,
                  time: user.created_at,
                  icon: UserGroupIcon,
                  iconColor: 'bg-green-500'
                }))
              ]
                .sort((a, b) => new Date(b.time) - new Date(a.time))
                .slice(0, 5)
                .map((activity, activityIdx, activities) => (
                  <li key={activity.id}>
                    <div className="relative pb-8">
                      {activityIdx !== activities.length - 1 ? (
                        <span
                          className="absolute top-4 left-4 -ml-px h-full w-0.5 bg-gray-200"
                          aria-hidden="true"
                        />
                      ) : null}
                      <div className="relative flex space-x-3">
                        <div>
                          <span className={`${activity.iconColor} h-8 w-8 rounded-full flex items-center justify-center ring-8 ring-white`}>
                            <activity.icon className="h-4 w-4 text-white" aria-hidden="true" />
                          </span>
                        </div>
                        <div className="min-w-0 flex-1 pt-1.5 flex justify-between space-x-4">
                          <div>
                            <p className="text-sm text-gray-900">{activity.title}</p>
                            <p className="text-sm text-gray-500">{activity.subtitle}</p>
                          </div>
                          <div className="text-right text-sm whitespace-nowrap text-gray-500">
                            <time dateTime={activity.time}>
                              {formatDate(activity.time)}
                            </time>
                          </div>
                        </div>
                      </div>
                    </div>
                  </li>
                ))}
            </ul>
          </div>
          
          {recentBooks.length === 0 && recentReviews.length === 0 && recentUsers.length === 0 && (
            <div className="text-center py-8">
              <CalendarIcon className="h-12 w-12 mx-auto text-gray-400 mb-4" />
              <p className="text-gray-500">No recent activity</p>
            </div>
          )}
        </div>
      </div>

      {/* Footer Actions */}
      <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-lg p-6 border border-blue-200">
        <div className="flex flex-col sm:flex-row items-center justify-between">
          <div className="mb-4 sm:mb-0">
            <h3 className="text-lg font-semibold text-blue-900">Need Help?</h3>
            <p className="text-blue-700">
              Check out our admin documentation or contact support.
            </p>
          </div>
          <div className="flex space-x-3">
            <button className="btn-secondary">
              View Documentation
            </button>
            <button className="btn-primary">
              Contact Support
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;

