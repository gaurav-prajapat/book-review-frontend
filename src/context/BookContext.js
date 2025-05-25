import React, { createContext, useContext, useState, useEffect } from 'react';
import api from '../utils/api';

const BookContext = createContext();

export const useBooks = () => {
  const context = useContext(BookContext);
  if (!context) {
    throw new Error('useBooks must be used within a BookProvider');
  }
  return context;
};

export const BookProvider = ({ children }) => {
  const [books, setBooks] = useState([]);
  const [currentBook, setCurrentBook] = useState(null);
  const [featuredBooks, setFeaturedBooks] = useState([]);
  const [genres, setGenres] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 12,
    total: 0,
    totalPages: 0,
    hasNext: false,
    hasPrev: false
  });

  const clearError = () => {
    setError(null);
  };

  const fetchBooks = async (params = {}) => {
    try {
      setLoading(true);
      setError(null);
      
      const queryParams = new URLSearchParams({
        page: params.page || pagination.page,
        limit: params.limit || pagination.limit,
        ...(params.search && { search: params.search }),
        ...(params.genre && { genre: params.genre }),
        ...(params.sortBy && { sortBy: params.sortBy }),
        ...(params.sortOrder && { sortOrder: params.sortOrder })
      });

      const response = await api.get(`/books?${queryParams}`);
      
      setBooks(response.data.books || []);
      setPagination(response.data.pagination || {
        page: 1,
        limit: 12,
        total: 0,
        totalPages: 0,
        hasNext: false,
        hasPrev: false
      });

      return { success: true, data: response.data };
    } catch (err) {
      const errorMessage = err.response?.data?.error || 'Failed to fetch books';
      setError(errorMessage);
      return { success: false, error: errorMessage };
    } finally {
      setLoading(false);
    }
  };

  const getBook = async (id) => {
    try {
      setLoading(true);
      setError(null);
      
      const response = await api.get(`/books/${id}`);
      setCurrentBook(response.data);
      return { success: true, data: response.data };
    } catch (err) {
      const errorMessage = err.response?.data?.error || 'Failed to fetch book details';
      setError(errorMessage);
      setCurrentBook(null);
      return { success: false, error: errorMessage };
    } finally {
      setLoading(false);
    }
  };

  const searchBooks = async (searchTerm, filters = {}) => {
    return await fetchBooks({
      search: searchTerm,
      ...filters
    });
  };

  const getBooksByGenre = async (genre, params = {}) => {
    return await fetchBooks({ 
      genre, 
      ...params 
    });
  };

  const getFeaturedBooks = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const response = await api.get('/books/featured');
      setFeaturedBooks(response.data.books || response.data);
      return { success: true, data: response.data };
    } catch (err) {
      // Fallback to regular books if featured endpoint doesn't exist
      const result = await fetchBooks({ 
        limit: 6, 
        sortBy: 'average_rating', 
        sortOrder: 'desc' 
      });
      if (result.success) {
        setFeaturedBooks(result.data.books?.slice(0, 6) || []);
      }
      return result;
    } finally {
      setLoading(false);
    }
  };

  const getGenres = async () => {
    try {
      const response = await api.get('/books/genres');
      setGenres(response.data.genres || []);
      return { success: true, data: response.data };
    } catch (err) {
      // Fallback to hardcoded genres
      const fallbackGenres = [
        'Fiction', 'Non-Fiction', 'Mystery', 'Romance', 'Science Fiction',
        'Fantasy', 'Biography', 'History', 'Self-Help', 'Business',
        'Technology', 'Health', 'Travel', 'Children', 'Young Adult',
        'Poetry', 'Drama', 'Horror', 'Thriller', 'Adventure'
      ];
      setGenres(fallbackGenres);
      return { success: true, data: { genres: fallbackGenres } };
    }
  };

  const getRelatedBooks = async (bookId) => {
    try {
      const response = await api.get(`/books/${bookId}/related`);
      return { success: true, data: response.data };
    } catch (err) {
      const errorMessage = err.response?.data?.error || 'Failed to fetch related books';
      return { success: false, error: errorMessage };
    }
  };

  const addBook = async (bookData) => {
    try {
      setLoading(true);
      setError(null);

      // Prepare the data to match backend expectations
      const formattedData = {
        title: bookData.title.trim(),
        author: bookData.author.trim(),
        description: bookData.description?.trim() || '',
        isbn: bookData.isbn?.trim() || null,
        published_date: bookData.published_year ? `${bookData.published_year}-01-01` : null,
        genre: bookData.genre || null,
        cover_image: bookData.cover_image?.trim() || null
      };

      const response = await api.post('/books', formattedData);
      
      // Refresh books list
      await fetchBooks();
      
      return { 
        success: true, 
        data: response.data
      };
    } catch (err) {
      const errorMessage = err.response?.data?.error || 'Failed to add book';
      setError(errorMessage);
      return { success: false, error: errorMessage };
    } finally {
      setLoading(false);
    }
  };

  const updateBook = async (id, bookData) => {
    try {
      setLoading(true);
      setError(null);

      // Prepare the data to match backend expectations
      const formattedData = {
        title: bookData.title.trim(),
        author: bookData.author.trim(),
        description: bookData.description?.trim() || '',
        isbn: bookData.isbn?.trim() || null,
        published_date: bookData.published_year ? `${bookData.published_year}-01-01` : null,
        genre: bookData.genre || null,
        cover_image: bookData.cover_image?.trim() || null
      };

      const response = await api.put(`/books/${id}`, formattedData);
      
      // Update current book if it's the one being edited
      if (currentBook && currentBook.id === parseInt(id)) {
        setCurrentBook({ ...currentBook, ...formattedData });
      }
      
      // Update book in the books list
      setBooks(prevBooks => 
        prevBooks.map(book => 
          book.id === parseInt(id) 
            ? { ...book, ...formattedData }
            : book
        )
      );
      
      return { success: true, data: response.data };
    } catch (err) {
      const errorMessage = err.response?.data?.error || 'Failed to update book';
      setError(errorMessage);
      return { success: false, error: errorMessage };
    } finally {
      setLoading(false);
    }
  };

  const deleteBook = async (id) => {
    try {
      setLoading(true);
      setError(null);

      await api.delete(`/books/${id}`);
      
      // Remove the book from the current books list
      setBooks(prevBooks => prevBooks.filter(book => book.id !== parseInt(id)));
      
      // Clear current book if it's the one being deleted
      if (currentBook && currentBook.id === parseInt(id)) {
        setCurrentBook(null);
      }
      
      return { success: true };
    } catch (err) {
      const errorMessage = err.response?.data?.error || 'Failed to delete book';
      setError(errorMessage);
      return { success: false, error: errorMessage };
    } finally {
      setLoading(false);
    }
  };

  const getRecentBooks = async (limit = 10) => {
    return await fetchBooks({ 
      limit, 
      sortBy: 'created_at', 
      sortOrder: 'desc' 
    });
  };

  const getPopularBooks = async (limit = 10) => {
    return await fetchBooks({ 
      limit, 
      sortBy: 'review_count', 
      sortOrder: 'desc' 
    });
  };

  const getTopRatedBooks = async (limit = 10) => {
    return await fetchBooks({ 
      limit, 
      sortBy: 'average_rating', 
      sortOrder: 'desc' 
    });
  };

  // Initialize data on mount
  useEffect(() => {
    fetchBooks();
    getGenres();
  }, []);

  const value = {
    // State
    books,
    currentBook,
    featuredBooks,
    genres,
    loading,
    error,
    pagination,
    
    // Actions
    fetchBooks,
    getBook,
    searchBooks,
    getBooksByGenre,
    getFeaturedBooks,
    getGenres,
    getRelatedBooks,
    addBook,
    updateBook,
    deleteBook,
    getRecentBooks,
    getPopularBooks,
    getTopRatedBooks,
    clearError,
    setCurrentBook
  };

  return (
    <BookContext.Provider value={value}>
      {children}
    </BookContext.Provider>
  );
};
