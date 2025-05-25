import axios from 'axios';

// Set base URL for API calls
const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';

// Create axios instance with default config
const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor to add auth token
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor to handle errors
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('token');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

// API functions for different endpoints
export const booksAPI = {
  // Get all books with pagination and filters
  getBooks: (params = {}) => {
    const searchParams = new URLSearchParams();
    Object.keys(params).forEach(key => {
      if (params[key] !== undefined && params[key] !== '') {
        searchParams.append(key, params[key]);
      }
    });
    return api.get(`/books?${searchParams}`);
  },

  // Get single book by ID
  getBook: (id) => api.get(`/books/${id}`),

  // Get featured books
  getFeaturedBooks: (limit = 6) => api.get(`/books/featured?limit=${limit}`),

  // Get books by genre
  getBooksByGenre: (genre, params = {}) => {
    const searchParams = new URLSearchParams({ genre, ...params });
    return api.get(`/books?${searchParams}`);
  },

  // Get books by author
  getBooksByAuthor: (author, params = {}) => {
    const searchParams = new URLSearchParams({ ...params });
    return api.get(`/books/author/${encodeURIComponent(author)}?${searchParams}`);
  },

  // Get available genres
  getGenres: () => api.get('/books/genres'),

  // Get book statistics (admin only)
  getBookStats: () => api.get('/books/stats'),

  // Admin functions
  addBook: (bookData) => api.post('/books', bookData),
  updateBook: (id, bookData) => api.put(`/books/${id}`, bookData),
  deleteBook: (id) => api.delete(`/books/${id}`),
  bulkOperations: (data) => api.post('/books/bulk', data),
};

export const reviewsAPI = {
  // Get reviews for a book
  getReviews: (bookId, params = {}) => {
    const searchParams = new URLSearchParams({ book_id: bookId, ...params });
    return api.get(`/reviews?${searchParams}`);
  },

  // Get recent reviews (admin dashboard)
  getRecentReviews: (limit = 5) => api.get(`/reviews/recent?limit=${limit}`),

  // Get user reviews
  getUserReviews: (userId, params = {}) => {
    const searchParams = new URLSearchParams(params);
    return api.get(`/users/${userId}/reviews?${searchParams}`);
  },

  // Create a review
  createReview: (reviewData) => api.post('/reviews', reviewData),

  // Update a review
  updateReview: (id, reviewData) => api.put(`/reviews/${id}`, reviewData),

  // Delete a review
  deleteReview: (id) => api.delete(`/reviews/${id}`),
};

export const userAPI = {
  // Get user profile
  getUser: (id) => api.get(`/users/${id}`),

  // Get all users (admin only)
  getUsers: (params = {}) => {
    const searchParams = new URLSearchParams(params);
    return api.get(`/users?${searchParams}`);
  },

  // Update user profile
  updateUser: (id, userData) => api.put(`/users/${id}`, userData),

  // Update user role (admin only)
  updateUserRole: (id, role) => api.put(`/users/${id}/role`, { role }),

  // Delete user (admin only)
  deleteUser: (id) => api.delete(`/users/${id}`),

  // Get user reviews
  getUserReviews: (userId, params = {}) => {
    const searchParams = new URLSearchParams(params);
    return api.get(`/users/${userId}/reviews?${searchParams}`);
  },
};

export const authAPI = {
  // Login
  login: (credentials) => api.post('/auth/login', credentials),

  // Register
  register: (userData) => api.post('/auth/register', userData),

  // Demo login
  demoLogin: (userType) => api.post('/auth/demo-login', { userType }),
};

export const adminAPI = {
  // Get dashboard statistics
  getStats: () => api.get('/admin/stats'),
};

// Health check
export const healthCheck = () => api.get('/health');

export default api;
