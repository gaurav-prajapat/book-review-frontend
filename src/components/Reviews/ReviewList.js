import React, { useState, useEffect } from 'react';
import {
  StarIcon,
  UserIcon,
  CalendarIcon,
  ChevronDownIcon,
  ChevronUpIcon,
  FunnelIcon
} from '@heroicons/react/24/solid';
import { StarIcon as StarOutlineIcon } from '@heroicons/react/24/outline';
import { useAuth } from '../../context/AuthContext';
import LoadingSpinner from '../Common/LoadingSpinner';
import ErrorMessage from '../Common/ErrorMessage';
import api from '../../utils/api';

const ReviewList = ({ bookId, refreshTrigger = 0 }) => {
  const { user, isAuthenticated } = useAuth();
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 10,
    total: 0,
    totalPages: 0
  });
  const [sortBy, setSortBy] = useState('newest');
  const [filterRating, setFilterRating] = useState('all');
  const [expandedReviews, setExpandedReviews] = useState(new Set());

  useEffect(() => {
    if (bookId) {
      fetchReviews();
    }
  }, [bookId, pagination.page, sortBy, filterRating, refreshTrigger]);

  const fetchReviews = async () => {
    try {
      setLoading(true);
      setError('');

      // Use the correct API endpoint: GET /api/reviews?book_id=:id&page=:page&limit=:limit
      const params = new URLSearchParams({
        book_id: bookId,
        page: pagination.page,
        limit: pagination.limit
      });

      const response = await api.get(`/reviews?${params}`);

      // Handle response structure from reviewController.js
      if (response.data.reviews) {
        // Paginated response
        setReviews(response.data.reviews);
        setPagination(prev => ({
          ...prev,
          total: response.data.pagination.total,
          totalPages: response.data.pagination.totalPages
        }));
      } else {
        // Simple array response (fallback)
        let reviewsData = response.data || [];
        
        // Apply client-side filtering if needed
        if (filterRating !== 'all') {
          reviewsData = reviewsData.filter(review => review.rating === parseInt(filterRating));
        }

        // Apply client-side sorting if needed
        reviewsData.sort((a, b) => {
          switch (sortBy) {
            case 'oldest':
              return new Date(a.created_at) - new Date(b.created_at);
            case 'highest':
              return b.rating - a.rating;
            case 'lowest':
              return a.rating - b.rating;
            case 'newest':
            default:
              return new Date(b.created_at) - new Date(a.created_at);
          }
        });

        setReviews(reviewsData);
        setPagination(prev => ({
          ...prev,
          total: reviewsData.length,
          totalPages: 1
        }));
      }
    } catch (err) {
      const errorMessage = err.response?.data?.error || 'Failed to load reviews';
      setError(errorMessage);
      setReviews([]);
    } finally {
      setLoading(false);
    }
  };
  const handlePageChange = (newPage) => {
    setPagination(prev => ({ ...prev, page: newPage }));
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const toggleExpandReview = (reviewId) => {
    setExpandedReviews(prev => {
      const newSet = new Set(prev);
      if (newSet.has(reviewId)) {
        newSet.delete(reviewId);
      } else {
        newSet.add(reviewId);
      }
      return newSet;
    });
  };

  const handleDeleteReview = async (reviewId) => {
    if (!window.confirm('Are you sure you want to delete this review?')) {
      return;
    }

    try {
      // Use DELETE /api/reviews/:id endpoint
      await api.delete(`/reviews/${reviewId}`);
      
      // Remove review from local state
      setReviews(prev => prev.filter(review => review.id !== reviewId));
      
      // Update pagination total
      setPagination(prev => ({
        ...prev,
        total: prev.total - 1
      }));

      // Refresh the list to get updated data
      if (refreshTrigger !== undefined) {
        fetchReviews();
      }
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to delete review');
    }
  };

  const renderStars = (rating, size = "h-4 w-4") => {
    const stars = [];
    for (let i = 1; i <= 5; i++) {
      const StarComponent = i <= rating ? StarIcon : StarOutlineIcon;
      stars.push(
        <StarComponent 
          key={i} 
          className={`${size} ${i <= rating ? 'text-yellow-400' : 'text-gray-300'}`} 
        />
      );
    }
    return stars;
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffTime = Math.abs(now - date);
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

    if (diffDays === 1) return 'Yesterday';
    if (diffDays < 7) return `${diffDays} days ago`;
    if (diffDays < 30) return `${Math.ceil(diffDays / 7)} weeks ago`;
    if (diffDays < 365) return `${Math.ceil(diffDays / 30)} months ago`;
    
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const truncateText = (text, maxLength = 300) => {
    if (!text || text.length <= maxLength) return text;
    return text.substring(0, maxLength).trim() + '...';
  };

  const sortOptions = [
    { value: 'newest', label: 'Newest First' },
    { value: 'oldest', label: 'Oldest First' },
    { value: 'highest', label: 'Highest Rated' },
    { value: 'lowest', label: 'Lowest Rated' }
  ];

  const ratingFilterOptions = [
    { value: 'all', label: 'All Ratings' },
    { value: '5', label: '5 Stars' },
    { value: '4', label: '4 Stars' },
    { value: '3', label: '3 Stars' },
    { value: '2', label: '2 Stars' },
    { value: '1', label: '1 Star' }
  ];

  if (loading && reviews.length === 0) {
    return (
      <div className="card">
        <div className="flex justify-center py-8">
          <LoadingSpinner size="large" />
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Reviews Header */}
      <div className="card">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h2 className="text-2xl font-bold text-gray-900">
              Reviews ({pagination.total})
            </h2>
            <p className="text-gray-600 mt-1">
              See what other readers think about this book
            </p>
          </div>

          {/* Filters and Sorting */}
          {reviews.length > 0 && (
            <div className="flex flex-col sm:flex-row gap-3">
              <div className="flex items-center space-x-2">
                <FunnelIcon className="h-4 w-4 text-gray-500" />
                <select
                  value={filterRating}
                  onChange={(e) => setFilterRating(e.target.value)}
                  className="text-sm border border-gray-300 rounded-md px-2 py-1 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                >
                  {ratingFilterOptions.map(option => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </select>
              </div>

              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="text-sm border border-gray-300 rounded-md px-2 py-1 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              >
                {sortOptions.map(option => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
            </div>
          )}
        </div>
      </div>

      {/* Error Message */}
      {error && <ErrorMessage message={error} onClose={() => setError('')} />}

      {/* Reviews List */}
      {reviews.length === 0 ? (
        <div className="card">
          <div className="text-center py-12">
            <StarOutlineIcon className="h-16 w-16 text-gray-300 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              No Reviews Yet
            </h3>
            <p className="text-gray-600 mb-4">
              Be the first to share your thoughts about this book!
            </p>
            {isAuthenticated && (
              <p className="text-sm text-gray-500">
                Scroll up to write your review
              </p>
            )}
          </div>
        </div>
      ) : (
        <div className="space-y-4">
          {reviews.map((review) => {
            const isExpanded = expandedReviews.has(review.id);
            const shouldTruncate = review.comment && review.comment.length > 300;
            const displayComment = isExpanded ? review.comment : truncateText(review.comment);
            const isOwnReview = isAuthenticated && user && review.user_id === user.id;

            return (
              <div 
                key={review.id} 
                className={`card hover:shadow-md transition-shadow ${
                  isOwnReview ? 'ring-2 ring-blue-200 bg-blue-50' : ''
                }`}
              >
                {/* Review Header */}
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center space-x-3">
                    <div className="bg-gray-200 rounded-full p-2">
                      <UserIcon className="h-6 w-6 text-gray-600" />
                    </div>
                    <div>
                      <div className="flex items-center space-x-2">
                        <h4 className="font-semibold text-gray-900">
                          {review.username}
                        </h4>
                        {isOwnReview && (
                          <span className="bg-blue-100 text-blue-800 text-xs px-2 py-1 rounded-full">
                            Your Review
                          </span>
                        )}
                      </div>
                      <div className="flex items-center space-x-2 mt-1">
                        <div className="flex">
                          {renderStars(review.rating)}
                        </div>
                        <span className="text-sm text-gray-600">
                          {review.rating} out of 5 stars
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center space-x-2">
                    <div className="flex items-center text-sm text-gray-500">
                      <CalendarIcon className="h-4 w-4 mr-1" />
                      <span>{formatDate(review.created_at)}</span>
                    </div>
                    
                    {/* Delete button for own reviews or admin */}
                    {isOwnReview && (
                      <button
                        onClick={() => handleDeleteReview(review.id)}
                        className="text-red-600 hover:text-red-800 text-sm px-2 py-1 rounded transition-colors"
                        title="Delete review"
                      >
                        Delete
                      </button>
                    )}
                  </div>
                </div>

                {/* Review Content */}
                {review.comment && (
                  <div className="mb-4">
                    <p className="text-gray-700 leading-relaxed whitespace-pre-wrap">
                      {displayComment}
                    </p>
                    
                    {shouldTruncate && (
                      <button
                        onClick={() => toggleExpandReview(review.id)}
                        className="mt-2 flex items-center text-sm text-blue-600 hover:text-blue-800 transition-colors"
                      >
                        {isExpanded ? (
                          <>
                            <ChevronUpIcon className="h-4 w-4 mr-1" />
                            Show Less
                          </>
                        ) : (
                          <>
                            <ChevronDownIcon className="h-4 w-4 mr-1" />
                            Read More
                          </>
                        )}
                      </button>
                    )}
                  </div>
                )}

                {/* Review Footer */}
                <div className="flex items-center justify-between pt-3 border-t border-gray-200">
                  <div className="text-xs text-gray-500">
                    {review.updated_at && review.updated_at !== review.created_at && (
                      <span>Edited {formatDate(review.updated_at)}</span>
                    )}
                  </div>
                  
                  {/* Review Actions */}
                  <div className="flex items-center space-x-2">
                    {/* Add helpful/unhelpful buttons here if needed */}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Pagination */}
      {pagination.totalPages > 1 && (
        <div className="card">
          <div className="flex items-center justify-between">
            <div className="text-sm text-gray-600">
              Showing {((pagination.page - 1) * pagination.limit) + 1} to{' '}
              {Math.min(pagination.page * pagination.limit, pagination.total)} of{' '}
              {pagination.total} reviews
            </div>
            
            <div className="flex items-center space-x-2">
              <button
                onClick={() => handlePageChange(pagination.page - 1)}
                disabled={pagination.page === 1}
                className="btn-secondary text-sm disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Previous
              </button>
              
              <div className="flex items-center space-x-1">
                {Array.from({ length: Math.min(5, pagination.totalPages) }, (_, i) => {
                  let pageNum;
                  if (pagination.totalPages <= 5) {
                    pageNum = i + 1;
                  } else if (pagination.page <= 3) {
                    pageNum = i + 1;
                  } else if (pagination.page >= pagination.totalPages - 2) {
                    pageNum = pagination.totalPages - 4 + i;
                  } else {
                    pageNum = pagination.page - 2 + i;
                  }

                  return (
                    <button
                      key={pageNum}
                      onClick={() => handlePageChange(pageNum)}
                      className={`px-3 py-1 text-sm rounded-md transition-colors ${
                        pageNum === pagination.page
                          ? 'bg-blue-600 text-white'
                          : 'text-gray-600 hover:bg-gray-100'
                      }`}
                    >
                      {pageNum}
                    </button>
                  );
                })}
              </div>
              
              <button
                onClick={() => handlePageChange(pagination.page + 1)}
                disabled={pagination.page === pagination.totalPages}
                className="btn-secondary text-sm disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Next
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Loading More Reviews */}
      {loading && reviews.length > 0 && (
        <div className="flex justify-center py-4">
          <LoadingSpinner size="medium" />
        </div>
      )}
    </div>
  );
};

export default ReviewList;
