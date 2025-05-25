import React from 'react';
import { Link } from 'react-router-dom';
import { 
  StarIcon, 
  BookOpenIcon, 
  CalendarIcon,
  UserIcon,
  EyeIcon
} from '@heroicons/react/24/solid';
import { StarIcon as StarOutlineIcon } from '@heroicons/react/24/outline';

const BookCard = ({ book, showStats = true, className = "" }) => {
  const renderStars = (rating, size = "h-4 w-4") => {
    const stars = [];
    const fullStars = Math.floor(rating || 0);
    const hasHalfStar = (rating || 0) % 1 >= 0.5;

    for (let i = 0; i < 5; i++) {
      if (i < fullStars) {
        stars.push(
          <StarIcon key={i} className={`${size} text-yellow-400`} />
        );
      } else if (i === fullStars && hasHalfStar) {
        stars.push(
          <div key={i} className="relative">
            <StarOutlineIcon className={`${size} text-gray-300`} />
            <div className="absolute inset-0 overflow-hidden w-1/2">
              <StarIcon className={`${size} text-yellow-400`} />
            </div>
          </div>
        );
      } else {
        stars.push(
          <StarOutlineIcon key={i} className={`${size} text-gray-300`} />
        );
      }
    }
    return stars;
  };

  const formatDate = (dateString) => {
    if (!dateString) return null;
    return new Date(dateString).getFullYear();
  };

  const truncateText = (text, maxLength = 120) => {
    if (!text) return '';
    if (text.length <= maxLength) return text;
    return text.substring(0, maxLength).trim() + '...';
  };

  return (
    <div className={`card group hover:shadow-lg transition-all duration-300 ${className}`}>
      <div className="flex flex-col h-full">
        {/* Book Cover */}
        <div className="relative mb-4">
          <div className="aspect-[3/4] bg-gray-200 rounded-lg overflow-hidden">
            {book.cover_image ? (
              <img
                src={book.cover_image}
                alt={`${book.title} cover`}
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                onError={(e) => {
                  e.target.style.display = 'none';
                  e.target.nextSibling.style.display = 'flex';
                }}
              />
            ) : null}
            <div 
              className="w-full h-full flex items-center justify-center bg-gradient-to-br from-gray-100 to-gray-200" 
              style={{ display: book.cover_image ? 'none' : 'flex' }}
            >
              <div className="text-center">
                <BookOpenIcon className="h-12 w-12 text-gray-400 mx-auto mb-2" />
                <span className="text-gray-500 text-xs">No Cover</span>
              </div>
            </div>
          </div>
          
          {/* Genre Badge */}
          {book.genre && (
            <div className="absolute top-2 left-2">
              <span className="inline-block bg-blue-600 text-white text-xs px-2 py-1 rounded-full font-medium">
                {book.genre}
              </span>
            </div>
          )}

          {/* Quick View Button */}
          <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity">
            <Link
              to={`/books/${book.id}`}
              className="bg-white bg-opacity-90 hover:bg-opacity-100 text-gray-700 p-2 rounded-full shadow-md transition-all"
              title="Quick view"
            >
              <EyeIcon className="h-4 w-4" />
            </Link>
          </div>
        </div>

        {/* Book Info */}
        <div className="flex-1 flex flex-col">
          <div className="flex-1">
            <h3 className="text-lg font-semibold text-gray-900 mb-2 line-clamp-2 group-hover:text-blue-600 transition-colors">
              {book.title}
            </h3>
            
            <div className="flex items-center text-gray-600 mb-2">
              <UserIcon className="h-4 w-4 mr-1" />
              <p className="text-sm truncate">by {book.author}</p>
            </div>

            {book.published_date && (
              <div className="flex items-center text-gray-500 mb-3">
                <CalendarIcon className="h-4 w-4 mr-1" />
                <span className="text-xs">{formatDate(book.published_date)}</span>
              </div>
                          )}

            {book.description && (
              <p className="text-gray-700 text-sm mb-4 line-clamp-3">
                {truncateText(book.description)}
              </p>
            )}
          </div>

          {/* Rating and Stats */}
          {showStats && (
            <div className="mt-auto">
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center space-x-2">
                  <div className="flex">
                    {renderStars(book.average_rating)}
                  </div>
                  <span className="text-sm text-gray-600">
                    {book.average_rating ? 
                      `${parseFloat(book.average_rating).toFixed(1)}` : 
                      '0.0'
                    }
                  </span>
                </div>
                <span className="text-xs text-gray-500">
                  {book.review_count || 0} review{(book.review_count || 0) !== 1 ? 's' : ''}
                </span>
              </div>
            </div>
          )}

          {/* Action Button */}
          <div className="mt-auto">
            <Link
              to={`/books/${book.id}`}
              className="btn-primary w-full text-center text-sm py-2 group-hover:bg-blue-700 transition-colors"
            >
              View Details
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default BookCard;

