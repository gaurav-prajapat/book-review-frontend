import React, { useState, useEffect } from 'react';
import { 
  FunnelIcon, 
  XMarkIcon, 
  ChevronDownIcon,
  AdjustmentsHorizontalIcon
} from '@heroicons/react/24/outline';
import { useBooks } from '../../context/BookContext';

const BookFilter = ({ 
  onFilterChange, 
  initialFilters = {},
  showAdvanced = false,
  className = ""
}) => {
  const { genres } = useBooks();
  const [filters, setFilters] = useState({
    genre: '',
    sortBy: 'created_at',
    sortOrder: 'desc',
    minRating: '',
    hasReviews: false,
    ...initialFilters
  });
  const [isExpanded, setIsExpanded] = useState(false);

  const sortOptions = [
    { value: 'created_at', label: 'Recently Added', order: 'desc' },
    { value: 'title', label: 'Title A-Z', order: 'asc' },
    { value: 'title', label: 'Title Z-A', order: 'desc' },
    { value: 'author', label: 'Author A-Z', order: 'asc' },
    { value: 'author', label: 'Author Z-A', order: 'desc' },
    { value: 'average_rating', label: 'Highest Rated', order: 'desc' },
    { value: 'average_rating', label: 'Lowest Rated', order: 'asc' },
    { value: 'review_count', label: 'Most Reviewed', order: 'desc' },
    { value: 'published_date', label: 'Newest Published', order: 'desc' },
    { value: 'published_date', label: 'Oldest Published', order: 'asc' }
  ];

  const ratingOptions = [
    { value: '', label: 'Any Rating' },
    { value: '4', label: '4+ Stars' },
    { value: '3', label: '3+ Stars' },
    { value: '2', label: '2+ Stars' },
    { value: '1', label: '1+ Stars' }
  ];

  useEffect(() => {
    onFilterChange(filters);
  }, [filters]);

  const handleFilterChange = (key, value) => {
    setFilters(prev => ({
      ...prev,
      [key]: value
    }));
  };

  const handleSortChange = (sortString) => {
    const option = sortOptions.find(opt => 
      `${opt.value}-${opt.order}` === sortString
    );
    if (option) {
      setFilters(prev => ({
        ...prev,
        sortBy: option.value,
        sortOrder: option.order
      }));
    }
  };

  const clearFilters = () => {
    const clearedFilters = {
      genre: '',
      sortBy: 'created_at',
      sortOrder: 'desc',
      minRating: '',
      hasReviews: false
    };
    setFilters(clearedFilters);
  };

  const hasActiveFilters = () => {
    return filters.genre || 
           filters.minRating || 
           filters.hasReviews ||
           filters.sortBy !== 'created_at' ||
           filters.sortOrder !== 'desc';
  };

  return (
    <div className={`bg-white rounded-lg shadow-sm border border-gray-200 ${className}`}>
      {/* Filter Header */}
      <div className="flex items-center justify-between p-4 border-b border-gray-200">
        <div className="flex items-center space-x-2">
          <FunnelIcon className="h-5 w-5 text-gray-500" />
          <span className="font-medium text-gray-900">Filters</span>
          {hasActiveFilters() && (
            <span className="bg-blue-100 text-blue-800 text-xs px-2 py-1 rounded-full">
              Active
            </span>
          )}
        </div>
        
        <div className="flex items-center space-x-2">
          {hasActiveFilters() && (
            <button
              onClick={clearFilters}
              className="text-sm text-gray-500 hover:text-gray-700 transition-colors"
            >
              Clear All
            </button>
          )}
          
          {showAdvanced && (
            <button
              onClick={() => setIsExpanded(!isExpanded)}
              className="flex items-center text-sm text-gray-500 hover:text-gray-700 transition-colors"
            >
              <AdjustmentsHorizontalIcon className="h-4 w-4 mr-1" />
              Advanced
              <ChevronDownIcon 
                className={`h-4 w-4 ml-1 transform transition-transform ${
                  isExpanded ? 'rotate-180' : ''
                }`} 
              />
            </button>
          )}
        </div>
      </div>

      {/* Filter Content */}
      <div className="p-4 space-y-4">
        {/* Basic Filters */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {/* Genre Filter */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Genre
            </label>
            <select
              value={filters.genre}
              onChange={(e) => handleFilterChange('genre', e.target.value)}
              className="input-field text-sm"
            >
              <option value="">All Genres</option>
              {genres.map((genre) => (
                <option key={genre} value={genre}>
                  {genre}
                </option>
              ))}
            </select>
          </div>

          {/* Sort By */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Sort By
            </label>
            <select
              value={`${filters.sortBy}-${filters.sortOrder}`}
              onChange={(e) => handleSortChange(e.target.value)}
              className="input-field text-sm"
            >
              {sortOptions.map((option) => (
                <option 
                  key={`${option.value}-${option.order}`} 
                  value={`${option.value}-${option.order}`}
                >
                  {option.label}
                </option>
              ))}
            </select>
          </div>

          {/* Rating Filter */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Minimum Rating
            </label>
            <select
              value={filters.minRating}
              onChange={(e) => handleFilterChange('minRating', e.target.value)}
              className="input-field text-sm"
            >
              {ratingOptions.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Advanced Filters */}
        {showAdvanced && isExpanded && (
          <div className="border-t border-gray-200 pt-4 mt-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Has Reviews Filter */}
              <div className="flex items-center">
                <input
                  type="checkbox"
                  id="hasReviews"
                  checked={filters.hasReviews}
                  onChange={(e) => handleFilterChange('hasReviews', e.target.checked)}
                  className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                />
                <label htmlFor="hasReviews" className="ml-2 text-sm text-gray-700">
                  Only books with reviews
                </label>
              </div>

              {/* Additional filters can be added here */}
              <div className="text-sm text-gray-500">
                More filters coming soon...
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Active Filters Display */}
      {hasActiveFilters() && (
        <div className="px-4 pb-4">
          <div className="flex flex-wrap gap-2">
            {filters.genre && (
              <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                Genre: {filters.genre}
                <button
                  onClick={() => handleFilterChange('genre', '')}
                  className="ml-1 text-blue-600 hover:text-blue-800"
                >
                  <XMarkIcon className="h-3 w-3" />
                </button>
              </span>
            )}
            
            {filters.minRating && (
              <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">
                {filters.minRating}+ Stars
                <button
                  onClick={() => handleFilterChange('minRating', '')}
                  className="ml-1 text-yellow-600 hover:text-yellow-800"
                >
                  <XMarkIcon className="h-3 w-3" />
                </button>
              </span>
            )}
            
            {filters.hasReviews && (
              <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
                Has Reviews
                <button
                  onClick={() => handleFilterChange('hasReviews', false)}
                  className="ml-1 text-green-600 hover:text-green-800"
                >
                  <XMarkIcon className="h-3 w-3" />
                </button>
              </span>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default BookFilter;
