import React, { useState, useEffect } from 'react';
import { StarIcon } from '@heroicons/react/24/solid';
import { StarIcon as StarOutlineIcon } from '@heroicons/react/24/outline';
import { useAuth } from '../../context/AuthContext';
import LoadingSpinner from '../Common/LoadingSpinner';
import ErrorMessage from '../Common/ErrorMessage';
import api from '../../utils/api';

const ReviewForm = ({ bookId, onReviewSubmitted, existingReview = null }) => {
  const { user, isAuthenticated } = useAuth();
  const [formData, setFormData] = useState({
    rating: existingReview?.rating || 5,
    comment: existingReview?.comment || ''
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [hasExistingReview, setHasExistingReview] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [userReviewId, setUserReviewId] = useState(null);

  useEffect(() => {
    if (isAuthenticated && bookId) {
      checkExistingReview();
    }
  }, [isAuthenticated, bookId]);

  useEffect(() => {
    if (existingReview) {
      setFormData({
        rating: existingReview.rating,
        comment: existingReview.comment || ''
      });
      setHasExistingReview(true);
      setIsEditing(true);
      setUserReviewId(existingReview.id);
    }
  }, [existingReview]);

  const checkExistingReview = async () => {
    try {
      const response = await api.get(`/reviews?book_id=${bookId}`);
      
      // Check if response has reviews array (from reviewController.js structure)
      const reviewsData = response.data.reviews || response.data;
      const userReview = reviewsData.find(
        review => review.user_id === user.id
      );
      
      if (userReview) {
        setHasExistingReview(true);
        setUserReviewId(userReview.id);
        setFormData({
          rating: userReview.rating,
          comment: userReview.comment || ''
        });
      }
    } catch (err) {
      // If we can't check, assume no existing review
      console.error('Error checking existing review:', err);
    }
  };

  const handleRatingChange = (rating) => {
    setFormData(prev => ({ ...prev, rating }));
    setError('');
  };

  const handleCommentChange = (e) => {
    setFormData(prev => ({ ...prev, comment: e.target.value }));
    setError('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!isAuthenticated) {
      setError('You must be logged in to submit a review');
      return;
    }

    if (!formData.rating || formData.rating < 1 || formData.rating > 5) {
      setError('Please select a rating between 1 and 5 stars');
      return;
    }

    try {
      setLoading(true);
      setError('');
      setSuccess('');

      const reviewData = {
        book_id: parseInt(bookId),
        rating: formData.rating,
        comment: formData.comment.trim() || null
      };

      let response;
      if (hasExistingReview && isEditing && userReviewId) {
        // Update existing review: PUT /api/reviews/:id
        response = await api.put(`/reviews/${userReviewId}`, {
          rating: reviewData.rating,
          comment: reviewData.comment
        });
        setSuccess('Review updated successfully!');
      } else {
        // Create new review: POST /api/reviews
        response = await api.post('/reviews', reviewData);
        setSuccess('Review submitted successfully!');
        setHasExistingReview(true);
        setUserReviewId(response.data.reviewId);
      }

      // Reset form or keep current values for editing
      if (!isEditing) {
        setFormData({ rating: 5, comment: '' });
      }

      // Notify parent component
      if (onReviewSubmitted) {
        onReviewSubmitted(response.data);
      }

      // Clear success message after 3 seconds
      setTimeout(() => setSuccess(''), 3000);

    } catch (err) {
      const errorMessage = err.response?.data?.error || 'Failed to submit review';
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = () => {
    setIsEditing(true);
    setError('');
    setSuccess('');
  };

  const handleCancelEdit = () => {
    if (existingReview) {
      setFormData({
        rating: existingReview.rating,
        comment: existingReview.comment || ''
      });
    }
    setIsEditing(false);
    setError('');
    setSuccess('');
  };

  const renderStars = (interactive = false) => {
    const stars = [];
    for (let i = 1; i <= 5; i++) {
      const isFilled = i <= formData.rating;
      const StarComponent = isFilled ? StarIcon : StarOutlineIcon;
      
      stars.push(
        <button
          key={i}
          type="button"
          onClick={() => interactive && handleRatingChange(i)}
          className={`${
            interactive 
              ? 'hover:scale-110 transition-transform cursor-pointer' 
              : 'cursor-default'
          } ${isFilled ? 'text-yellow-400' : 'text-gray-300'}`}
          disabled={!interactive || loading}
        >
          <StarComponent className="h-6 w-6" />
        </button>
      );
    }
    return stars;
  };

  if (!isAuthenticated) {
    return (
      <div className="card">
        <div className="text-center py-8">
          <h3 className="text-lg font-semibold text-gray-900 mb-2">
            Write a Review
          </h3>
          <p className="text-gray-600 mb-4">
            Please log in to write a review for this book.
          </p>
          <a href="/login" className="btn-primary">
            Log In
          </a>
        </div>
      </div>
    );
  }

  if (hasExistingReview && !isEditing) {
    return (
      <div className="card">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-gray-900">
            Your Review
          </h3>
          <button
            onClick={handleEdit}
            className="btn-secondary text-sm"
          >
            Edit Review
          </button>
        </div>
        
        <div className="space-y-3">
          <div className="flex items-center space-x-2">
            <span className="text-sm font-medium text-gray-700">Your Rating:</span>
            <div className="flex">
              {renderStars(false)}
            </div>
            <span className="text-sm text-gray-600">
              ({formData.rating} out of 5 stars)
            </span>
          </div>
          
          {formData.comment && (
            <div>
              <span className="text-sm font-medium text-gray-700">Your Comment:</span>
              <p className="mt-1 text-gray-700 bg-gray-50 p-3 rounded-lg">
                {formData.comment}
              </p>
            </div>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="card">
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-lg font-semibold text-gray-900">
          {hasExistingReview ? 'Edit Your Review' : 'Write a Review'}
        </h3>
        {isEditing && hasExistingReview && (
          <button
            onClick={handleCancelEdit}
            className="btn-secondary text-sm"
          >
            Cancel
          </button>
        )}
      </div>

      {error && <ErrorMessage message={error} onClose={() => setError('')} />}
      
      {success && (
        <div className="mb-4 p-3 bg-green-100 border border-green-400 text-green-700 rounded-lg">
          {success}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Rating Section */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-3">
            Rating *
          </label>
          <div className="flex items-center space-x-1">
            {renderStars(true)}
            <span className="ml-3 text-sm text-gray-600">
              ({formData.rating} out of 5 stars)
            </span>
          </div>
          <p className="mt-1 text-xs text-gray-500">
            Click on a star to set your rating
          </p>
        </div>

        {/* Comment Section */}
        <div>
          <label htmlFor="comment" className="block text-sm font-medium text-gray-700 mb-2">
            Your Review (Optional)
          </label>
          <textarea
            id="comment"
            value={formData.comment}
            onChange={handleCommentChange}
            rows={4}
            className="input-field resize-none"
            placeholder="Share your thoughts about this book... What did you like or dislike? Would you recommend it to others?"
            disabled={loading}
            maxLength={1000}
          />
          <div className="mt-1 flex justify-between text-xs text-gray-500">
            <span>Share your honest opinion to help other readers</span>
            <span>{formData.comment.length}/1000</span>
          </div>
        </div>

        {/* Submit Button */}
        <div className="flex items-center justify-end space-x-3">
          <button
            type="submit"
            disabled={loading || !formData.rating}
            className="btn-primary disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? (
              <div className="flex items-center space-x-2">
                <LoadingSpinner size="small" />
                <span>
                  {hasExistingReview ? 'Updating...' : 'Submitting...'}
                </span>
              </div>
            ) : (
              hasExistingReview ? 'Update Review' : 'Submit Review'
            )}
          </button>
        </div>
      </form>

      {/* Review Guidelines */}
      <div className="mt-6 p-4 bg-blue-50 rounded-lg">
        <h4 className="text-sm font-medium text-blue-900 mb-2">
          Review Guidelines
        </h4>
        <ul className="text-xs text-blue-800 space-y-1">
          <li>• Be honest and constructive in your feedback</li>
          <li>• Focus on the book's content, writing style, and your reading experience</li>
          <li>• Avoid spoilers that might ruin the experience for other readers</li>
          <li>• Keep your review respectful and appropriate</li>
        </ul>
      </div>
    </div>
  );
};

export default ReviewForm;
