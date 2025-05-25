import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { 
  BookOpenIcon, 
  UserGroupIcon, 
  StarIcon, 
  PlusIcon,
  ChartBarIcon,
  EyeIcon
} from '@heroicons/react/24/outline';
import LoadingSpinner from '../../components/Common/LoadingSpinner';
import { booksAPI, userAPI, reviewsAPI } from '../../utils/api';

const AdminDashboard = () => {
  const [stats, setStats] = useState({
    totalBooks: 0,
    totalUsers: 0,
    totalReviews: 0,
    averageRating: 0
  });
  const [recentBooks, setRecentBooks] = useState([]);
  const [recentReviews, setRecentReviews] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      // Fetch dashboard statistics and recent data
      const [booksRes, usersRes, reviewsRes] = await Promise.all([
        booksAPI.getBooks({ limit: 5 }),
        userAPI.getUsers({ limit: 5 }),
        reviewsAPI.getRecentReviews({ limit: 5 })
      ]);

      setStats({
        totalBooks: booksRes.data.total || booksRes.data.length,
        totalUsers: usersRes.data.total || usersRes.data.length,
        totalReviews: reviewsRes.data.total || reviewsRes.data.length,
        averageRating: 4.2 // Calculate from actual data
      });

      setRecentBooks(booksRes.data.books || booksRes.data);
      setRecentReviews(reviewsRes.data.reviews || reviewsRes.data);
    } catch (error) {
      console.error('Failed to fetch dashboard data:', error);
    } finally {
      setLoading(false);
    }
  };

  const StatCard = ({ title, value, icon: Icon, color, link }) => (
    <div className="bg-white rounded-lg shadow p-6">
      <div className="flex items-center">
        <div className={`p-3 rounded-md ${color}`}>
          <Icon className="h-6 w-6 text-white" />
        </div>
        <div className="ml-4">
          <p className="text-sm font-medium text-gray-600">{title}</p>
          <p className="text-2xl font-semibold text-gray-900">{value}</p>
        </div>
      </div>
      {link && (
        <div className="mt-4">
          <Link to={link} className="text-sm text-blue-600 hover:text-blue-700">
            View all →
          </Link>
        </div>
      )}
    </div>
  );

  if (loading) return <LoadingSpinner />;

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold text-gray-900">Admin Dashboard</h1>
        <Link to="/admin/books/add" className="btn-primary">
          <PlusIcon className="h-4 w-4 mr-2" />
          Add New Book
        </Link>
      </div>

      {/* Statistics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard
          title="Total Books"
          value={stats.totalBooks}
          icon={BookOpenIcon}
          color="bg-blue-500"
          link="/admin/books"
        />
        <StatCard
          title="Total Users"
          value={stats.totalUsers}
          icon={UserGroupIcon}
          color="bg-green-500"
          link="/admin/users"
        />
        <StatCard
          title="Total Reviews"
          value={stats.totalReviews}
          icon={ChartBarIcon}
          color="bg-purple-500"
        />
        <StatCard
          title="Average Rating"
          value={stats.averageRating.toFixed(1)}
          icon={StarIcon}
          color="bg-yellow-500"
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Books */}
        <div className="bg-white rounded-lg shadow">
          <div className="p-6 border-b border-gray-200">
            <div className="flex justify-between items-center">
              <h2 className="text-lg font-semibold text-gray-900">Recent Books</h2>
              <Link to="/admin/books" className="text-sm text-blue-600 hover:text-blue-700">
                View all
              </Link>
            </div>
          </div>
          <div className="p-6">
            <div className="space-y-4">
              {recentBooks.map((book) => (
                <div key={book.id} className="flex items-center space-x-4">
                  <img
                    src={book.cover_image || '/placeholder-book.jpg'}
                    alt={book.title}
                    className="h-12 w-8 object-cover rounded"
                  />
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-gray-900 truncate">
                      {book.title}
                    </p>
                    <p className="text-sm text-gray-500 truncate">
                      by {book.author}
                    </p>
                  </div>
                  <Link
                    to={`/books/${book.id}`}
                    className="text-blue-600 hover:text-blue-700"
                  >
                    <EyeIcon className="h-4 w-4" />
                  </Link>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Recent Reviews */}
        <div className="bg-white rounded-lg shadow">
          <div className="p-6 border-b border-gray-200">
            <h2 className="text-lg font-semibold text-gray-900">Recent Reviews</h2>
          </div>
          <div className="p-6">
            <div className="space-y-4">
                            {recentReviews.map((review) => (
                <div key={review.id} className="border-b border-gray-100 pb-4 last:border-b-0">
                  <div className="flex items-start space-x-3">
                    <div className="flex-1">
                      <div className="flex items-center space-x-2">
                        <p className="text-sm font-medium text-gray-900">
                          {review.username}
                        </p>
                        <div className="flex items-center">
                          {[...Array(5)].map((_, i) => (
                            <StarIcon
                              key={i}
                              className={`h-3 w-3 ${
                                i < review.rating ? 'text-yellow-400' : 'text-gray-300'
                              }`}
                            />
                          ))}
                        </div>
                      </div>
                      <p className="text-sm text-gray-600 mt-1">
                        {review.book_title}
                      </p>
                      <p className="text-sm text-gray-700 mt-2 line-clamp-2">
                        {review.comment}
                      </p>
                      <p className="text-xs text-gray-500 mt-2">
                        {new Date(review.created_at).toLocaleDateString()}
                      </p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="bg-white rounded-lg shadow p-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">Quick Actions</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Link
            to="/admin/books/add"
            className="flex items-center p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition duration-200"
          >
            <PlusIcon className="h-8 w-8 text-blue-600 mr-3" />
            <div>
              <p className="font-medium text-gray-900">Add New Book</p>
              <p className="text-sm text-gray-600">Add a new book to the collection</p>
            </div>
          </Link>
          
          <Link
            to="/admin/books"
            className="flex items-center p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition duration-200"
          >
            <BookOpenIcon className="h-8 w-8 text-green-600 mr-3" />
            <div>
              <p className="font-medium text-gray-900">Manage Books</p>
              <p className="text-sm text-gray-600">Edit or remove existing books</p>
            </div>
          </Link>
          
          <Link
            to="/admin/users"
            className="flex items-center p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition duration-200"
          >
            <UserGroupIcon className="h-8 w-8 text-purple-600 mr-3" />
            <div>
              <p className="font-medium text-gray-900">Manage Users</p>
              <p className="text-sm text-gray-600">View and manage user accounts</p>
            </div>
          </Link>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;
