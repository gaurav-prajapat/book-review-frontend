import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { StarIcon } from '@heroicons/react/24/solid';
import { useBooks } from '../context/BookContext';
import ReviewForm from '../components/Reviews/ReviewForm';
import ReviewList from '../components/Reviews/ReviewList';
import LoadingSpinner from '../components/Common/LoadingSpinner';
import ErrorMessage from '../components/Common/ErrorMessage';
import { booksAPI } from '../utils/api';

const BookDetail = () => {
  const { id } = useParams();
  const { loading, error, clearError } = useBooks();
  const [currentBook, setCurrentBook] = useState(null);
  const [bookLoading, setBookLoading] = useState(true);
  const [bookError, setBookError] = useState('');
  const [refreshTrigger, setRefreshTrigger] = useState(0);

  useEffect(() => {
    if (id) {
      fetchBookData();
    }
  }, [id]);

  const fetchBookData = async () => {
    try {
      setBookLoading(true);
      setBookError('');
      const response = await booksAPI.getBook(id);
      setCurrentBook(response.data);
    } catch (err) {
      const errorMessage = err.response?.data?.error || 'Failed to load book details';
      setBookError(errorMessage);
    } finally {
      setBookLoading(false);
    }
  };

  const handleReviewSubmitted = () => {
    // Trigger refresh of reviews and book data
    setRefreshTrigger(prev => prev + 1);
    fetchBookData(); // Refresh book data to update average rating
  };

  const renderStars = (rating) => {
    const stars = [];
    const fullStars = Math.floor(rating || 0);
    
    for (let i = 0; i < 5; i++) {
      stars.push(
        <StarIcon
          key={i}
          className={`h-5 w-5 ${
            i < fullStars ? 'text-yellow-400' : 'text-gray-300'
          }`}
        />
      );
    }
    return stars;
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'Unknown';
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  if (bookLoading && !currentBook) {
    return (
      <div className="flex justify-center py-12">
        <LoadingSpinner size="large" />
      </div>
    );
  }

  if (bookError && !currentBook) {
    return <ErrorMessage message={bookError} onClose={() => setBookError('')} />;
  }

  if (!currentBook) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-600">Book not found</p>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      {/* Book Details */}
      <div className="card">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-1">
            <div className="aspect-[3/4] rounded-lg overflow-hidden bg-gray-200 flex items-center justify-center">
              {currentBook.cover_image ? (
                <img
                  src={currentBook.cover_image}
                  alt={currentBook.title}
                  className="w-full h-full object-cover"
                  onError={(e) => {
                    e.target.style.display = 'none';
                    e.target.nextSibling.style.display = 'flex';
                  }}
                />
              ) : null}
              <div className="flex items-center justify-center text-gray-500">
                <span>Book Cover</span>
              </div>
            </div>
          </div>
          
          <div className="lg:col-span-2 space-y-4">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 mb-2">
                {currentBook.title}
              </h1>
              <p className="text-xl text-gray-600 mb-4">by {currentBook.author}</p>
              
              <div className="flex items-center space-x-4 mb-4">
                <div className="flex items-center space-x-2">
                  <div className="flex">
                    {renderStars(currentBook.average_rating)}
                  </div>
                  <span className="text-sm text-gray-600">
                    {currentBook.average_rating ? 
                      `${parseFloat(currentBook.average_rating).toFixed(1)} out of 5` : 
                      'No ratings yet'
                    }
                  </span>
                </div>
                <span className="text-sm text-gray-600">
                  ({currentBook.review_count || 0} reviews)
                </span>
              </div>

              {currentBook.genre && (
                <div className="mb-4">
                  <span className="inline-block bg-blue-100 text-blue-800 text-sm px-3 py-1 rounded-full">
                    {currentBook.genre}
                  </span>
                </div>
              )}
            </div>

            <div className="space-y-4">
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">Description</h3>
                <p className="text-gray-700 leading-relaxed">
                  {currentBook.description || 'No description available.'}
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                {currentBook.isbn && (
                  <div>
                    <span className="font-medium text-gray-900">ISBN:</span>
                    <span className="ml-2 text-gray-600">{currentBook.isbn}</span>
                  </div>
                )}
                {currentBook.published_year && (
                  <div>
                    <span className="font-medium text-gray-900">Published Year:</span>
                    <span className="ml-2 text-gray-600">{currentBook.published_year}</span>
                  </div>
                )}
                {currentBook.published_date && (
                  <div>
                    <span className="font-medium text-gray-900">Published Date:</span>
                    <span className="ml-2 text-gray-600">{formatDate(currentBook.published_date)}</span>
                  </div>
                )}
                <div>
                  <span className="font-medium text-gray-900">Added:</span>
                  <span className="ml-2 text-gray-600">{formatDate(currentBook.created_at)}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Review Form */}
      <ReviewForm 
        bookId={id} 
        onReviewSubmitted={handleReviewSubmitted} 
      />

      {/* Reviews List */}
      <ReviewList 
        bookId={id} 
        refreshTrigger={refreshTrigger}
      />
    </div>
  );
};

export default BookDetail;
