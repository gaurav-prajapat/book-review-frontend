import React, { useState, useEffect } from 'react';
import { MagnifyingGlassIcon, XMarkIcon } from '@heroicons/react/24/outline';

const SearchBar = ({ 
  onSearch, 
  placeholder = "Search books by title, author, or ISBN...",
  initialValue = "",
  showClearButton = true,
  autoFocus = false,
  className = ""
}) => {
  const [searchTerm, setSearchTerm] = useState(initialValue);
  const [isSearching, setIsSearching] = useState(false);

  useEffect(() => {
    setSearchTerm(initialValue);
  }, [initialValue]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (searchTerm.trim() === '') return;
    
    setIsSearching(true);
    try {
      await onSearch(searchTerm.trim());
    } finally {
      setIsSearching(false);
    }
  };

  const handleClear = () => {
    setSearchTerm('');
    onSearch('');
  };

  const handleKeyDown = (e) => {
        if (e.key === 'Escape') {
      handleClear();
    }
  };

  return (
    <form onSubmit={handleSubmit} className={`relative ${className}`}>
      <div className="relative">
        <MagnifyingGlassIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
        <input
          type="text"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder={placeholder}
          autoFocus={autoFocus}
          className="input-field pl-10 pr-20"
          disabled={isSearching}
        />
        
        {/* Clear Button */}
        {showClearButton && searchTerm && (
          <button
            type="button"
            onClick={handleClear}
            className="absolute right-16 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
            title="Clear search"
          >
            <XMarkIcon className="h-4 w-4" />
          </button>
        )}
        
        {/* Search Button */}
        <button
          type="submit"
          disabled={isSearching || searchTerm.trim() === ''}
          className="absolute right-2 top-1/2 transform -translate-y-1/2 btn-primary text-sm px-3 py-1 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isSearching ? (
            <div className="flex items-center space-x-1">
              <div className="animate-spin rounded-full h-3 w-3 border-b-2 border-white"></div>
              <span>Searching...</span>
            </div>
          ) : (
            'Search'
          )}
        </button>
      </div>
      
      {/* Search suggestions or recent searches could go here */}
    </form>
  );
};

export default SearchBar;

