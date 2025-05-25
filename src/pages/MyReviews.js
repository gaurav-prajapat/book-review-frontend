import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { reviewsAPI } from '../utils/api';
import LoadingSpinner from '../components/Common/LoadingSpinner';
import ErrorMessage from '../components/Common/ErrorMessage';
import { StarIcon, PencilIcon, TrashIcon } from '@heroicons/react/24/solid';
import { StarIcon as StarOutlineIcon } from '@heroicons/react/24/outline';

const MyReviews = () => {
  const { user } = useAuth();
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchMyReviews();
  }, []);

  const fetchMyReviews = async () => {
    try {
      setLoading(true);
      const response = await reviewsAPI.getUserReviews(user.id);
      setReviews(response.data);
    } catch (err) {
      setError('Failed to fetch your reviews');
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteReview = async (reviewId) => {
    if (window.confirm('Are you sure you want to delete this review?')) {
      try {
        await reviewsAPI.deleteReview(reviewId);
        setReviews(reviews.filter(review => review.id !== reviewId));
      } catch (err) {
        setError('Failed to delete review');
      }
    }
  };

  const renderStars = (rating) => {
    return [...Array(5)].map((_, index) => {
      const StarComponent = index < rating ? StarIcon : StarOutlineIcon;
      return (
        <StarComponent
          key={index}
          className={`h-4 w-4 ${index < rating ? 'text-yellow-400' : 'text-gray-300'}`}
        />
      );
    });
  };

  if (loading) return <LoadingSpinner />;

  return (
    <div className="max-w-4xl mx-auto">
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-gray-900">My Reviews</h1>
        <p className="text-gray-600 mt-2">Manage all your book reviews</p>
      </div>

      <ErrorMessage message={error} onClose={() => setError('')} />

      {reviews.length === 0 ? (
        <div className="text-center py-12">
          <div className="text-gray-500 mb-4">
            <StarOutlineIcon className="h-16 w-16 mx-auto mb-4" />
            <p className="text-lg">You haven't written any reviews yet</p>
            <p className="text-sm">Start by browsing books and sharing your thoughts!</p>
          </div>
          <Link to="/books" className="btn-primary">
            Browse Books
          </Link>
        </div>
      ) : (
        <div className="space-y-6">
          {reviews.map((review) => (
            <div key={review.id} className="card">
              <div className="flex justify-between items-start mb-4">
                <div className="flex-1">
                  <Link
                    to={`/books/${review.book_id}`}
                    className="text-xl font-semibold text-gray-900 hover:text-blue-600"
                  >
                    {review.book_title}
                  </Link>
                  <div className="flex items-center mt-2">
                    <div className="flex items-center">
                      {renderStars(review.rating)}
                    </div>
                    <span className="ml-2 text-sm text-gray-600">
                      {review.rating}/5 stars
                    </span>
                  </div>
                </div>
                <div className="flex items-center space-x-2">
                  <button
                    onClick={() => {/* Handle edit */}}
                    className="p-2 text-gray-400 hover:text-blue-600"
                    title="Edit review"
                  >
                    <PencilIcon className="h-4 w-4" />
                  </button>
                  <button
                    onClick={() => handleDeleteReview(review.id)}
                    className="p-2 text-gray-400 hover:text-red-600"
                    title="Delete review"
                  >
                    <TrashIcon className="h-4 w-4" />
                  </button>
                </div>
              </div>
              
              <p className="text-gray-700 mb-4">{review.comment}</p>
              
              <div className="text-sm text-gray-500">
                Reviewed on {new Date(review.created_at).toLocaleDateString()}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default MyReviews;