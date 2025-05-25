import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { StarIcon, PencilIcon, TrashIcon } from '@heroicons/react/24/solid';
import { EyeIcon } from '@heroicons/react/24/outline';
import LoadingSpinner from '../components/Common/LoadingSpinner';
import ErrorMessage from '../components/Common/ErrorMessage';
import { userAPI, reviewsAPI } from '../utils/api';

const Profile = () => {
  const { id } = useParams();
  const { user: currentUser, isAuthenticated } = useAuth();
  const [user, setUser] = useState(null);
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isEditing, setIsEditing] = useState(false);
  const [editingReview, setEditingReview] = useState(null);
  const [editForm, setEditForm] = useState({
    username: '',
    email: ''
  });
  const [reviewForm, setReviewForm] = useState({
    rating: 5,
    comment: ''
  });

  const isOwnProfile = isAuthenticated && currentUser?.id === parseInt(id);

  useEffect(() => {
    fetchUserProfile();
    fetchUserReviews();
  }, [id]);

  const fetchUserProfile = async () => {
    try {
      setLoading(true);
      const response = await userAPI.getUser(id);
      setUser(response.data);
      setEditForm({
        username: response.data.username,
        email: response.data.email
      });
    } catch (error) {
      setError(error.response?.data?.error || 'Failed to fetch user profile');
    } finally {
      setLoading(false);
    }
  };

  const fetchUserReviews = async () => {
    try {
      const response = await userAPI.getUserReviews ? 
        await userAPI.getUserReviews(id) : 
        await reviewsAPI.getUserReviews(id);
      setReviews(response.data);
    } catch (error) {
      console.error('Failed to fetch user reviews:', error);
      // Don't set error here as it might be a permission issue for other users
    }
  };

  const handleEditSubmit = async (e) => {
    e.preventDefault();
    try {
      await userAPI.updateProfile ? 
        await userAPI.updateProfile(editForm) :
        await userAPI.updateUser(id, editForm);
      setUser({ ...user, ...editForm });
      setIsEditing(false);
      setError(null);
    } catch (error) {
      setError(error.response?.data?.error || 'Failed to update profile');
    }
  };

  const handleEditReview = (review) => {
    setEditingReview(review.id);
    setReviewForm({
      rating: review.rating,
      comment: review.comment || ''
    });
  };

  const handleUpdateReview = async (reviewId) => {
    try {
      await reviewsAPI.updateReview(reviewId, reviewForm);
      setReviews(reviews.map(review => 
        review.id === reviewId 
          ? { ...review, ...reviewForm }
          : review
      ));
      setEditingReview(null);
      setError(null);
    } catch (error) {
      setError(error.response?.data?.error || 'Failed to update review');
    }
  };

  const handleDeleteReview = async (reviewId) => {
    if (window.confirm('Are you sure you want to delete this review?')) {
      try {
        await reviewsAPI.deleteReview(reviewId);
        setReviews(reviews.filter(review => review.id !== reviewId));
        setError(null);
      } catch (error) {
        setError(error.response?.data?.error || 'Failed to delete review');
      }
    }
  };

  const renderStars = (rating, interactive = false, onRatingChange = null) => {
    const stars = [];
    for (let i = 1; i <= 5; i++) {
      stars.push(
        <StarIcon
          key={i}
          className={`h-4 w-4 ${
            i <= rating ? 'text-yellow-400' : 'text-gray-300'
          } ${interactive ? 'cursor-pointer hover:text-yellow-300' : ''}`}
          onClick={interactive ? () => onRatingChange(i) : undefined}
        />
      );
    }
    return stars;
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  if (loading) {
    return (
      <div className="flex justify-center py-12">
        <LoadingSpinner size="large" />
      </div>
    );
  }

  if (error && !user) {
    return <ErrorMessage message={error} onClose={() => setError(null)} />;
  }

  if (!user) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-600">User not found</p>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      {/* Error Message */}
      {error && <ErrorMessage message={error} onClose={() => setError(null)} />}

      {/* Profile Header */}
      <div className="card">
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-3xl font-bold text-gray-900">
            {isOwnProfile ? 'My Profile' : `${user.username}'s Profile`}
          </h1>
          {isOwnProfile && !isEditing && (
            <button
              onClick={() => setIsEditing(true)}
              className="btn-primary"
            >
              Edit Profile
            </button>
          )}
        </div>

        {isEditing ? (
          <form onSubmit={handleEditSubmit} className="space-y-4">
            <div>
              <label htmlFor="username" className="block text-sm font-medium text-gray-700 mb-1">
                Username
              </label>
              <input
                type="text"
                id="username"
                value={editForm.username}
                onChange={(e) => setEditForm({ ...editForm, username: e.target.value })}
                className="input-field"
                required
              />
            </div>
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
                Email
              </label>
              <input
                type="email"
                id="email"
                value={editForm.email}
                onChange={(e) => setEditForm({ ...editForm, email: e.target.value })}
                className="input-field"
                required
              />
            </div>
            <div className="flex space-x-4">
              <button type="submit" className="btn-primary">
                Save Changes
              </button>
              <button
                type="button"
                onClick={() => {
                  setIsEditing(false);
                  setEditForm({
                    username: user.username,
                    email: user.email
                  });
                }}
                className="btn-secondary"
              >
                Cancel
              </button>
            </div>
          </form>
        ) : (
          <div className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <span className="font-medium text-gray-900">Username:</span>
                <span className="ml-2 text-gray-600">{user.username}</span>
              </div>
              <div>
                <span className="font-medium text-gray-900">Email:</span>
                <span className="ml-2 text-gray-600">{user.email}</span>
              </div>
              <div>
                <span className="font-medium text-gray-900">Member since:</span>
                <span className="ml-2 text-gray-600">{formatDate(user.created_at)}</span>
              </div>
              <div>
                <span className="font-medium text-gray-900">Total Reviews:</span>
                <span className="ml-2 text-gray-600">{reviews.length}</span>
              </div>
              {user.role === 'admin' && (
                <div>
                  <span className="font-medium text-gray-900">Role:</span>
                  <span className="ml-2 inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-orange-100 text-orange-800">
                    Administrator
                  </span>
                </div>
              )}
            </div>
          </div>
        )}
      </div>

      {/* User Reviews */}
      <div className="card">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-bold text-gray-900">
            {isOwnProfile ? 'My Reviews' : 'Reviews'} ({reviews.length})
          </h2>
          {isOwnProfile && (
            <Link to="/books" className="btn-secondary text-sm">
              Write a Review
            </Link>
          )}
        </div>

        {reviews && reviews.length > 0 ? (
          <div className="space-y-6">
            {reviews.map((review) => (
              <div key={review.id} className="border border-gray-200 rounded-lg p-6 hover:shadow-md transition-shadow">
                {editingReview === review.id ? (
                  // Edit Review Form
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <h3 className="font-semibold text-gray-900">{review.book_title}</h3>
                      <div className="flex space-x-2">
                        <button
                          onClick={() => handleUpdateReview(review.id)}
                          className="btn-primary text-sm"
                        >
                          Save
                        </button>
                        <button
                          onClick={() => setEditingReview(null)}
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
                      <div className="flex">
                        {renderStars(reviewForm.rating, true, (rating) => 
                          setReviewForm({ ...reviewForm, rating })
                        )}
                      </div>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Comment
                      </label>
                      <textarea
                        value={reviewForm.comment}
                        onChange={(e) => setReviewForm({ ...reviewForm, comment: e.target.value })}
                        className="input-field"
                        rows={3}
                        placeholder="Share your thoughts about this book..."
                      />
                    </div>
                  </div>
                ) : (
                  // Display Review
                  <div>
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex-1">
                        <div className="flex items-center space-x-3 mb-2">
                          <h3 className="font-semibold text-gray-900">{review.book_title}</h3>
                          {review.book_id && (
                            <Link
                              to={`/books/${review.book_id}`}
                              className="text-blue-600 hover:text-blue-800"
                              title="View book details"
                            >
                              <EyeIcon className="h-4 w-4" />
                            </Link>
                          )}
                        </div>
                        <div className="flex items-center space-x-4">
                          <div className="flex">
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
                      
                      {isOwnProfile && (
                        <div className="flex space-x-2 ml-4">
                          <button
                            onClick={() => handleEditReview(review)}
                            className="text-blue-600 hover:text-blue-800 p-1"
                            title="Edit review"
                          >
                            <PencilIcon className="h-4 w-4" />
                          </button>
                          <button
                            onClick={() => handleDeleteReview(review.id)}
                            className="text-red-600 hover:text-red-800 p-1"
                            title="Delete review"
                          >
                            <TrashIcon className="h-4 w-4" />
                          </button>
                        </div>
                      )}
                    </div>
                    
                    {review.comment && (
                      <div className="mt-3">
                        <p className="text-gray-700 leading-relaxed">{review.comment}</p>
                      </div>
                    )}
                  </div>
                )}
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-12">
            <div className="text-gray-500">
              <p className="text-lg mb-2">
                {isOwnProfile ? "You haven't written any reviews yet." : "This user hasn't written any reviews yet."}
              </p>
              {isOwnProfile && (
                <div>
                  <p className="text-sm mb-4">Start by exploring our book collection!</p>
                  <Link to="/books" className="btn-primary">
                    Browse Books
                  </Link>
                </div>
              )}
            </div>
          </div>
        )}
      </div>

      {/* Quick Stats */}
      {reviews.length > 0 && (
        <div className="card">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Review Statistics</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="text-center">
              <div className="text-2xl font-bold text-blue-600">
                {reviews.length}
              </div>
              <div className="text-sm text-gray-600">Total Reviews</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-green-600">
                {reviews.length > 0 ? 
                  (reviews.reduce((sum, review) => sum + review.rating, 0) / reviews.length).toFixed(1) : 
                                    '0.0'
                }
              </div>
              <div className="text-sm text-gray-600">Average Rating</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-purple-600">
                {reviews.filter(review => review.rating === 5).length}
              </div>
              <div className="text-sm text-gray-600">5-Star Reviews</div>
            </div>
          </div>
          
          {/* Rating Distribution */}
          <div className="mt-6">
            <h4 className="text-sm font-medium text-gray-700 mb-3">Rating Distribution</h4>
            <div className="space-y-2">
              {[5, 4, 3, 2, 1].map((rating) => {
                const count = reviews.filter(review => review.rating === rating).length;
                const percentage = reviews.length > 0 ? (count / reviews.length) * 100 : 0;
                
                return (
                  <div key={rating} className="flex items-center space-x-3">
                    <div className="flex items-center space-x-1 w-16">
                      <span className="text-sm text-gray-600">{rating}</span>
                      <StarIcon className="h-3 w-3 text-yellow-400" />
                    </div>
                    <div className="flex-1 bg-gray-200 rounded-full h-2">
                      <div
                        className="bg-yellow-400 h-2 rounded-full transition-all duration-300"
                        style={{ width: `${percentage}%` }}
                      />
                    </div>
                    <span className="text-sm text-gray-600 w-8 text-right">{count}</span>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {/* Recent Activity */}
      {isOwnProfile && reviews.length > 0 && (
        <div className="card">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Recent Activity</h3>
          <div className="space-y-3">
            {reviews.slice(0, 3).map((review) => (
              <div key={review.id} className="flex items-center space-x-3 p-3 bg-gray-50 rounded-lg">
                <div className="flex">
                  {renderStars(review.rating)}
                </div>
                <div className="flex-1">
                  <p className="text-sm font-medium text-gray-900">
                    Reviewed "{review.book_title}"
                  </p>
                  <p className="text-xs text-gray-500">
                    {formatDate(review.created_at)}
                  </p>
                </div>
                <Link
                  to={`/books/${review.book_id}`}
                  className="text-blue-600 hover:text-blue-800"
                >
                  <EyeIcon className="h-4 w-4" />
                </Link>
              </div>
            ))}
            {reviews.length > 3 && (
              <div className="text-center pt-2">
                <button
                  onClick={() => {
                    document.querySelector('[data-reviews-section]')?.scrollIntoView({ 
                      behavior: 'smooth' 
                    });
                  }}
                  className="text-sm text-blue-600 hover:text-blue-800"
                >
                  View all {reviews.length} reviews
                </button>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Admin Actions */}
      {currentUser?.role === 'admin' && !isOwnProfile && (
        <div className="card border-orange-200 bg-orange-50">
          <h3 className="text-lg font-semibold text-orange-900 mb-4">Admin Actions</h3>
          <div className="flex space-x-4">
            <button
              onClick={() => {
                if (window.confirm(`Are you sure you want to change ${user.username}'s role?`)) {
                  // Handle role change - you'll need to implement this
                  console.log('Change user role');
                }
              }}
              className="btn-secondary text-sm"
            >
              {user.role === 'admin' ? 'Make User' : 'Make Admin'}
            </button>
            <button
              onClick={() => {
                if (window.confirm(`Are you sure you want to delete ${user.username}'s account? This action cannot be undone.`)) {
                  // Handle user deletion - you'll need to implement this
                  console.log('Delete user');
                }
              }}
              className="bg-red-600 text-white px-3 py-1 rounded text-sm hover:bg-red-700"
            >
              Delete User
            </button>
          </div>
          <p className="text-xs text-orange-700 mt-2">
            These actions will affect the user's account and cannot be undone.
          </p>
        </div>
      )}

      {/* Profile Completion Suggestions */}
      {isOwnProfile && reviews.length === 0 && (
        <div className="card bg-blue-50 border-blue-200">
          <h3 className="text-lg font-semibold text-blue-900 mb-4">Get Started</h3>
          <div className="space-y-3">
            <div className="flex items-center space-x-3">
              <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                <span className="text-blue-600 font-semibold text-sm">1</span>
              </div>
              <div>
                <p className="font-medium text-blue-900">Browse our book collection</p>
                <p className="text-sm text-blue-700">Discover new books to read and review</p>
              </div>
              <Link to="/books" className="btn-primary text-sm ml-auto">
                Browse Books
              </Link>
            </div>
            <div className="flex items-center space-x-3">
              <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                <span className="text-blue-600 font-semibold text-sm">2</span>
              </div>
              <div>
                <p className="font-medium text-blue-900">Write your first review</p>
                <p className="text-sm text-blue-700">Share your thoughts and help other readers</p>
              </div>
            </div>
            <div className="flex items-center space-x-3">
              <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                <span className="text-blue-600 font-semibold text-sm">3</span>
              </div>
              <div>
                <p className="font-medium text-blue-900">Build your reading profile</p>
                <p className="text-sm text-blue-700">Track your reading journey and preferences</p>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Profile;

