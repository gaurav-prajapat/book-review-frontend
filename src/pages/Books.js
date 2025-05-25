import React, { useEffect, useState } from 'react';
import { useBooks } from '../context/BookContext';
import BookCard from '../components/Books/BookCard';
import SearchBar from '../components/Books/SearchBar';
import Pagination from '../components/Books/Pagination';
import LoadingSpinner from '../components/Common/LoadingSpinner';
import ErrorMessage from '../components/Common/ErrorMessage';

const Books = () => {
  const { books, pagination, loading, error, fetchBooks, clearError } = useBooks();
  const [currentPage, setCurrentPage] = useState(1);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    fetchBooks(currentPage, searchTerm);
  }, [currentPage]);

  const handleSearch = (term) => {
    setSearchTerm(term);
    setCurrentPage(1);
    fetchBooks(1, term);
  };

  const handlePageChange = (page) => {
    setCurrentPage(page);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <div className="space-y-8">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <h1 className="text-3xl font-bold text-gray-900">All Books</h1>
        <div className="w-full md:w-96">
          <SearchBar onSearch={handleSearch} />
        </div>
      </div>

      <ErrorMessage message={error} onClose={clearError} />

      {loading ? (
        <div className="flex justify-center py-12">
          <LoadingSpinner size="large" />
        </div>
      ) : (
        <>
          {books.length > 0 ? (
            <>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {books.map((book) => (
                  <BookCard key={book.id} book={book} />
                ))}
              </div>

              {pagination && pagination.pages > 1 && (
                <Pagination
                  currentPage={pagination.page}
                  totalPages={pagination.pages}
                  onPageChange={handlePageChange}
                />
              )}
            </>
          ) : (
            <div className="text-center py-12">
              <p className="text-gray-600">
                {searchTerm ? `No books found for "${searchTerm}"` : 'No books available'}
              </p>
            </div>
          )}
        </>
      )}
    </div>
  );
};

export default Books;