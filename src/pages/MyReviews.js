import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { reviewsAPI } from '../utils/api';
import LoadingSpinner from '../components/Common/LoadingSpinner';
import ErrorMessage from '../components/Common/ErrorMessage';
import {
  UserIcon, 
  StarIcon, 
  PencilIcon, 
  TrashIcon, 
  EyeIcon,
  BookOpenIcon,
  CalendarIcon,
  ChatBubbleLeftIcon,
  FunnelIcon,
  MagnifyingGlassIcon
} from '@heroicons/react/24/solid';
import { StarIcon as StarOutlineIcon } from '@heroicons/react/24/outline';

const MyReviews = () => {
  const { user, isAuthenticated } = useAuth();
  const navigate = useNavigate();
  
  const [reviews, setReviews] = useState([]); // Ensure it's always an array
  const [filteredReviews, setFilteredReviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [editingReview, setEditingReview] = useState(null);
  const [deleteConfirm, setDeleteConfirm] = useState(null);
  
  // Filter and search states
  const [searchTerm, setSearchTerm] = useState('');
  const [ratingFilter, setRatingFilter] = useState('all');
  const [sortBy, setSortBy] = useState('newest');
  const [showFilters, setShowFilters] = useState(false);
  
  // Edit form state
  const [editForm, setEditForm] = useState({
    rating: 5,
    comment: ''
  });

  // Statistics
  const [stats, setStats] = useState({
    totalReviews: 0,
    averageRating: 0,
    ratingDistribution: { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 }
  });

  useEffect(() => {
    if (!isAuthenticated) {
      navigate('/login');
      return;
    }
    if (user?.id) {
      fetchMyReviews();
    }
  }, [isAuthenticated, navigate, user]);

  useEffect(() => {
    applyFiltersAndSort();
  }, [reviews, searchTerm, ratingFilter, sortBy]);

  const fetchMyReviews = async () => {
    try {
      setLoading(true);
      setError('');
      
      if (!user?.id) {
        throw new Error('User ID not available');
      }
      
      console.log('Fetching reviews for user:', user.id);
      
      // Use the correct API call that matches backend route
      const response = await reviewsAPI.getUserReviews(user.id);
      
      console.log('API Response:', response);
      
      // Handle different response structures and ensure we always get an array
      let reviewsData = [];
      
      if (response && response.data) {
        if (Array.isArray(response.data)) {
          // Direct array response
          reviewsData = response.data;
        } else if (response.data.reviews && Array.isArray(response.data.reviews)) {
          // Nested in reviews property
          reviewsData = response.data.reviews;
        } else if (response.data.data && Array.isArray(response.data.data)) {
          // Nested in data property
          reviewsData = response.data.data;
        } else {
          // Fallback: try to extract any array from the response
          const possibleArrays = Object.values(response.data).filter(Array.isArray);
          if (possibleArrays.length > 0) {
            reviewsData = possibleArrays[0];
          }
        }
      }
      
      // Ensure reviewsData is always an array
      if (!Array.isArray(reviewsData)) {
        console.warn('Reviews data is not an array:', reviewsData);
        reviewsData = [];
      }
      
      console.log('Processed reviews data:', reviewsData);
      
      setReviews(reviewsData);
      calculateStats(reviewsData);
      
    } catch (err) {
      console.error('Error fetching reviews:', err);
      
      // Set reviews to empty array on error
      setReviews([]);
      
      let errorMessage = 'Failed to fetch your reviews';
      
      if (err.response) {
        // Server responded with error status
        errorMessage = err.response.data?.error || 
                      err.response.data?.details || 
                      err.response.data?.message ||
                      `Server error: ${err.response.status}`;
      } else if (err.request) {
        // Network error
        errorMessage = 'Network error. Please check your connection.';
      } else {
        // Other error
        errorMessage = err.message || errorMessage;
      }
      
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const calculateStats = (reviewsData) => {
    // Ensure reviewsData is an array
    if (!Array.isArray(reviewsData) || reviewsData.length === 0) {
      setStats({
        totalReviews: 0,
        averageRating: 0,
        ratingDistribution: { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 }
      });
      return;
    }

    const totalReviews = reviewsData.length;
    const totalRating = reviewsData.reduce((sum, review) => {
      const rating = Number(review.rating) || 0;
      return sum + rating;
    }, 0);
    const averageRating = totalReviews > 0 ? totalRating / totalReviews : 0;
    
    const ratingDistribution = { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 };
    reviewsData.forEach(review => {
      const rating = Number(review.rating);
      if (rating >= 1 && rating <= 5) {
        ratingDistribution[rating]++;
      }
    });

    setStats({
      totalReviews,
      averageRating,
      ratingDistribution
    });
  };

  const applyFiltersAndSort = () => {
    // Ensure reviews is an array before processing
    if (!Array.isArray(reviews)) {
      console.warn('Reviews is not an array in applyFiltersAndSort:', reviews);
      setFilteredReviews([]);
      return;
    }

    let filtered = [...reviews];

    // Apply search filter
    if (searchTerm) {
      filtered = filtered.filter(review =>
        (review.book_title && review.book_title.toLowerCase().includes(searchTerm.toLowerCase())) ||
        (review.comment && review.comment.toLowerCase().includes(searchTerm.toLowerCase()))
      );
    }

    // Apply rating filter
    if (ratingFilter !== 'all') {
      const targetRating = parseInt(ratingFilter);
      filtered = filtered.filter(review => Number(review.rating) === targetRating);
    }

    // Apply sorting
    filtered.sort((a, b) => {
      switch (sortBy) {
        case 'newest':
          return new Date(b.created_at || 0) - new Date(a.created_at || 0);
        case 'oldest':
          return new Date(a.created_at || 0) - new Date(b.created_at || 0);
        case 'rating-high':
          return (Number(b.rating) || 0) - (Number(a.rating) || 0);
        case 'rating-low':
          return (Number(a.rating) || 0) - (Number(b.rating) || 0);
        case 'book-title':
          return (a.book_title || '').localeCompare(b.book_title || '');
        default:
          return new Date(b.created_at || 0) - new Date(a.created_at || 0);
      }
    });

    setFilteredReviews(filtered);
  };

  const handleEditReview = (review) => {
    setEditingReview(review.id);
    setEditForm({
      rating: Number(review.rating) || 5,
      comment: review.comment || ''
    });
  };

  const handleUpdateReview = async (reviewId) => {
    try {
      setError('');
      
      if (!editForm.rating || editForm.rating < 1 || editForm.rating > 5) {
        setError('Please provide a valid rating between 1 and 5');
        return;
      }

      await reviewsAPI.updateReview(reviewId, editForm);
      
      // Update the review in the local state
      setReviews(prevReviews => {
        if (!Array.isArray(prevReviews)) {
          console.warn('Previous reviews is not an array:', prevReviews);
          return [];
        }
        
        return prevReviews.map(review =>
          review.id === reviewId
            ? { 
                ...review, 
                ...editForm,
                updated_at: new Date().toISOString()
              }
            : review
        );
      });
      
      setEditingReview(null);
      setEditForm({ rating: 5, comment: '' });
      
    } catch (err) {
      console.error('Error updating review:', err);
      const errorMessage = err.response?.data?.error || 
                          err.response?.data?.details || 
                          'Failed to update review';
      setError(errorMessage);
    }
  };

  const handleDeleteReview = async (reviewId) => {
    try {
      setError('');
      await reviewsAPI.deleteReview(reviewId);
      
      setReviews(prevReviews => {
        if (!Array.isArray(prevReviews)) {
          console.warn('Previous reviews is not an array:', prevReviews);
          return [];
        }
        
        const updatedReviews = prevReviews.filter(review => review.id !== reviewId);
        calculateStats(updatedReviews);
        return updatedReviews;
      });
      
      setDeleteConfirm(null);
      
    } catch (err) {
      console.error('Error deleting review:', err);
      const errorMessage = err.response?.data?.error || 
                          err.response?.data?.details || 
                          'Failed to delete review';
      setError(errorMessage);
    }
  };

  const handleCancelEdit = () => {
    setEditingReview(null);
    setEditForm({ rating: 5, comment: '' });
  };

  const renderStars = (rating, interactive = false, onRatingChange = null) => {
    const numRating = Number(rating) || 0;
    return [...Array(5)].map((_, index) => {
      const StarComponent = index < numRating ? StarIcon : StarOutlineIcon;
      return (
        <StarComponent
          key={index}
          className={`h-4 w-4 ${
            index < numRating ? 'text-yellow-400' : 'text-gray-300'
          } ${interactive ? 'cursor-pointer hover:text-yellow-300 transition-colors' : ''}`}
          onClick={interactive ? () => onRatingChange(index + 1) : undefined}
        />
      );
    });
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'Unknown date';
    try {
      return new Date(dateString).toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric'
      });
    } catch {
      return 'Invalid date';
    }
  };

  const clearFilters = () => {
    setSearchTerm('');
    setRatingFilter('all');
    setSortBy('newest');
  };

  // Add loading check
  if (loading) return <LoadingSpinner />;

  // Add user check
  if (!user) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-600">Please log in to view your reviews.</p>
        <Link to="/login" className="btn-primary mt-4">
          Go to Login
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">My Reviews</h1>
          <p className="text-gray-600 mt-2">
            Manage and track all your book reviews
          </p>
        </div>
        <Link 
          to="/books" 
          className="btn-primary flex items-center space-x-2"
        >
          <BookOpenIcon className="h-4 w-4" />
          <span>Write New Review</span>
        </Link>
      </div>

      <ErrorMessage message={error} onClose={() => setError('')} />

      {/* Statistics Cards */}
      {Array.isArray(reviews) && reviews.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="card">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Total Reviews</p>
                <p className="text-2xl font-bold text-blue-600">{stats.totalReviews}</p>
              </div>
              <ChatBubbleLeftIcon className="h-8 w-8 text-blue-600" />
            </div>
          </div>
          
          <div className="card">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Average Rating</p>
                <div className="flex items-center space-x-2">
                  <p className="text-2xl font-bold text-yellow-600">
                    {stats.averageRating.toFixed(1)}
                  </p>
                  <div className="flex">
                    {renderStars(Math.round(stats.averageRating))}
                  </div>
                </div>
              </div>
              <StarIcon className="h-8 w-8 text-yellow-600" />
            </div>
          </div>
          
          <div className="card">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Most Common Rating</p>
                <p className="text-2xl font-bold text-green-600">
                  {Object.entries(stats.ratingDistribution)
                    .reduce((a, b) => stats.ratingDistribution[a[0]] > stats.ratingDistribution[b[0]] ? a : b)[0]} ⭐
                </p>
              </div>
              <CalendarIcon className="h-8 w-8 text-green-600" />
            </div>
          </div>
        </div>
              )}

      {/* Filters and Search */}
      <div className="card">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          <div className="flex flex-col sm:flex-row gap-4 flex-1">
            {/* Search */}
            <div className="relative flex-1 max-w-md">
              <MagnifyingGlassIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <input
                type="text"
                placeholder="Search reviews..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="input-field pl-10"
              />
            </div>

            {/* Rating Filter */}
            <select
              value={ratingFilter}
              onChange={(e) => setRatingFilter(e.target.value)}
              className="input-field min-w-[140px]"
            >
              <option value="all">All Ratings</option>
              <option value="5">5 Stars</option>
              <option value="4">4 Stars</option>
              <option value="3">3 Stars</option>
              <option value="2">2 Stars</option>
              <option value="1">1 Star</option>
            </select>

            {/* Sort */}
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="input-field min-w-[140px]"
            >
              <option value="newest">Newest First</option>
              <option value="oldest">Oldest First</option>
              <option value="rating-high">Highest Rating</option>
              <option value="rating-low">Lowest Rating</option>
              <option value="book-title">Book Title A-Z</option>
            </select>
          </div>

          <div className="flex items-center space-x-2">
            <button
              onClick={() => setShowFilters(!showFilters)}
              className="btn-secondary flex items-center space-x-2"
            >
              <FunnelIcon className="h-4 w-4" />
              <span>Filters</span>
            </button>
            
            {(searchTerm || ratingFilter !== 'all' || sortBy !== 'newest') && (
              <button
                onClick={clearFilters}
                className="text-sm text-gray-600 hover:text-gray-800"
              >
                Clear
              </button>
            )}
          </div>
        </div>

        {/* Advanced Filters */}
        {showFilters && (
          <div className="mt-4 pt-4 border-t border-gray-200">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Date Range
                </label>
                <select className="input-field">
                  <option value="all">All Time</option>
                  <option value="week">Last Week</option>
                  <option value="month">Last Month</option>
                  <option value="year">Last Year</option>
                </select>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Review Length
                </label>
                <select className="input-field">
                  <option value="all">Any Length</option>
                  <option value="with-comment">With Comments</option>
                  <option value="no-comment">Rating Only</option>
                </select>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Reviews List */}
      <div className="space-y-4">
        {Array.isArray(filteredReviews) && filteredReviews.length > 0 ? (
          <>
            <div className="flex justify-between items-center">
              <h2 className="text-xl font-semibold text-gray-900">
                Your Reviews ({filteredReviews.length})
              </h2>
            </div>

            <div className="space-y-4">
              {filteredReviews.map((review) => (
                <div key={review.id} className="card hover:shadow-md transition-shadow">
                  {editingReview === review.id ? (
                    // Edit Mode
                    <div className="space-y-4">
                      <div className="flex items-center justify-between">
                        <h3 className="text-lg font-semibold text-gray-900">
                          {review.book_title}
                        </h3>
                        <div className="flex space-x-2">
                          <button
                            onClick={() => handleUpdateReview(review.id)}
                            className="btn-primary text-sm"
                          >
                            Save
                          </button>
                          <button
                            onClick={handleCancelEdit}
                            className="btn-secondary text-sm"
                          >
                            Cancel
                          </button>
                        </div>
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Rating
                        </label>
                        <div className="flex space-x-1">
                          {renderStars(editForm.rating, true, (rating) =>
                            setEditForm({ ...editForm, rating })
                          )}
                        </div>
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Comment
                        </label>
                        <textarea
                          value={editForm.comment}
                          onChange={(e) => setEditForm({ ...editForm, comment: e.target.value })}
                          className="input-field"
                          rows={3}
                          placeholder="Share your thoughts about this book..."
                        />
                      </div>
                    </div>
                  ) : (
                    // Display Mode
                    <div>
                      <div className="flex items-start justify-between mb-3">
                        <div className="flex-1">
                          <div className="flex items-center space-x-3 mb-2">
                            <h3 className="text-lg font-semibold text-gray-900">
                              {review.book_title}
                            </h3>
                            {review.book_id && (
                              <Link
                                to={`/books/${review.book_id}`}
                                className="text-blue-600 hover:text-blue-800 p-1"
                                title="View book details"
                              >
                                <EyeIcon className="h-4 w-4" />
                              </Link>
                            )}
                          </div>
                          
                          <div className="flex items-center space-x-4 mb-3">
                            <div className="flex space-x-1">
                              {renderStars(review.rating)}
                            </div>
                            <span className="text-sm text-gray-600">
                              {formatDate(review.created_at)}
                            </span>
                            {review.updated_at && review.updated_at !== review.created_at && (
                              <span className="text-xs text-gray-500">
                                (edited)
                              </span>
                            )}
                          </div>
                        </div>

                        <div className="flex space-x-2 ml-4">
                          <button
                            onClick={() => handleEditReview(review)}
                            className="text-blue-600 hover:text-blue-800 p-1"
                            title="Edit review"
                          >
                            <PencilIcon className="h-4 w-4" />
                          </button>
                          <button
                            onClick={() => setDeleteConfirm(review.id)}
                            className="text-red-600 hover:text-red-800 p-1"
                            title="Delete review"
                          >
                            <TrashIcon className="h-4 w-4" />
                          </button>
                        </div>
                      </div>

                      {review.comment && (
                        <div className="bg-gray-50 rounded-lg p-3">
                          <p className="text-gray-700 leading-relaxed">
                            {review.comment}
                          </p>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </>
        ) : (
          // Empty State
          <div className="card text-center py-12">
            <div className="text-gray-500">
              {Array.isArray(reviews) && reviews.length === 0 ? (
                <>
                  <BookOpenIcon className="h-12 w-12 mx-auto mb-4 text-gray-400" />
                  <h3 className="text-lg font-medium text-gray-900 mb-2">
                    No reviews yet
                  </h3>
                  <p className="text-gray-600 mb-6">
                    Start by writing your first book review!
                  </p>
                  <Link to="/books" className="btn-primary">
                    Browse Books
                  </Link>
                </>
              ) : (
                <>
                  <MagnifyingGlassIcon className="h-12 w-12 mx-auto mb-4 text-gray-400" />
                  <h3 className="text-lg font-medium text-gray-900 mb-2">
                    No reviews found
                  </h3>
                  <p className="text-gray-600 mb-4">
                    Try adjusting your search or filter criteria.
                  </p>
                  <button
                    onClick={clearFilters}
                    className="btn-secondary"
                  >
                    Clear Filters
                  </button>
                </>
              )}
            </div>
          </div>
        )}
      </div>

      {/* Delete Confirmation Modal */}
      {deleteConfirm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">
              Delete Review
            </h3>
            <p className="text-gray-600 mb-6">
              Are you sure you want to delete this review? This action cannot be undone.
            </p>
            <div className="flex space-x-4">
              <button
                onClick={() => handleDeleteReview(deleteConfirm)}
                className="btn-primary bg-red-600 hover:bg-red-700"
              >
                Delete
              </button>
              <button
                onClick={() => setDeleteConfirm(null)}
                className="btn-secondary"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Rating Distribution Chart (if there are reviews) */}
      {Array.isArray(reviews) && reviews.length > 0 && (
        <div className="card">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">
            Rating Distribution
          </h3>
          <div className="space-y-3">
            {[5, 4, 3, 2, 1].map((rating) => {
              const count = stats.ratingDistribution[rating] || 0;
              const percentage = stats.totalReviews > 0 ? (count / stats.totalReviews) * 100 : 0;
              
              return (
                <div key={rating} className="flex items-center space-x-3">
                  <div className="flex items-center space-x-1 w-16">
                    <span className="text-sm font-medium">{rating}</span>
                    <StarIcon className="h-3 w-3 text-yellow-400" />
                  </div>
                  <div className="flex-1 bg-gray-200 rounded-full h-2">
                    <div
                      className="bg-yellow-400 h-2 rounded-full transition-all duration-300"
                      style={{ width: `${percentage}%` }}
                    />
                  </div>
                  <span className="text-sm text-gray-600 w-12 text-right">
                    {count}
                  </span>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Quick Actions */}
      <div className="card">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">
          Quick Actions
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          <Link
            to="/books"
            className="flex items-center space-x-3 p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
          >
            <BookOpenIcon className="h-6 w-6 text-blue-600" />
            <div>
              <p className="font-medium text-gray-900">Browse Books</p>
              <p className="text-sm text-gray-600">Find new books to review</p>
            </div>
          </Link>
          
          <Link
            to={`/profile/${user?.id}`}
            className="flex items-center space-x-3 p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
          >
            <UserIcon className="h-6 w-6 text-green-600" />
            <div>
              <p className="font-medium text-gray-900">View Profile</p>
              <p className="text-sm text-gray-600">See your public profile</p>
            </div>
          </Link>
          
          <button
            onClick={() => window.print()}
            className="flex items-center space-x-3 p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors text-left"
          >
            <CalendarIcon className="h-6 w-6 text-purple-600" />
            <div>
              <p className="font-medium text-gray-900">Export Reviews</p>
              <p className="text-sm text-gray-600">Print or save your reviews</p>
            </div>
          </button>
        </div>
      </div>
    </div>
  );
};

export default MyReviews;

