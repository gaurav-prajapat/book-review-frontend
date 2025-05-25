import axios from 'axios';

// Set base URL for API calls
const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';

// Create axios instance with default config
const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 30000, // 30 second timeout
});

// Request interceptor to add auth token and handle requests
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    
    // Log requests in development
    if (process.env.NODE_ENV === 'development') {
      console.log(`API Request: ${config.method?.toUpperCase()} ${config.url}`, {
        data: config.data,
        params: config.params
      });
    }
    
    return config;
  },
  (error) => {
    console.error('Request interceptor error:', error);
    return Promise.reject(error);
  }
);

// Response interceptor to handle errors and responses
api.interceptors.response.use(
  (response) => {
    // Log responses in development
    if (process.env.NODE_ENV === 'development') {
      console.log(`API Response: ${response.config.method?.toUpperCase()} ${response.config.url}`, response.data);
    }
    return response;
  },
  (error) => {
    console.error('API Error:', error.response?.data || error.message);
    
    // Handle specific error cases
    if (error.response?.status === 401) {
      // Token expired or invalid
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      
      // Only redirect to login if not already on login/register pages
      const currentPath = window.location.pathname;
      if (!currentPath.includes('/login') && !currentPath.includes('/register')) {
        window.location.href = '/login';
      }
    }
    
    // Handle network errors
    if (!error.response) {
      error.message = 'Network error. Please check your connection.';
    }
    
    return Promise.reject(error);
  }
);

// Helper function to build query parameters
const buildQueryParams = (params = {}) => {
  const searchParams = new URLSearchParams();
  Object.keys(params).forEach(key => {
    if (params[key] !== undefined && params[key] !== null && params[key] !== '') {
      searchParams.append(key, params[key]);
    }
  });
  return searchParams.toString();
};

// Authentication API
export const authAPI = {
  // User registration
  register: (userData) => {
    const cleanData = {
      username: userData.username?.trim(),
      email: userData.email?.trim().toLowerCase(),
      password: userData.password,
      role: userData.role || 'user'
    };
    return api.post('/auth/register', cleanData);
  },

  // User login
  login: (credentials) => {
    const cleanCredentials = {
      email: credentials.email?.trim().toLowerCase(),
      password: credentials.password
    };
    return api.post('/auth/login', cleanCredentials);
  },

  // Demo login
  demoLogin: (userType) => {
    if (!['user', 'admin'].includes(userType)) {
      return Promise.reject(new Error('Invalid user type. Must be "user" or "admin"'));
    }
    return api.post('/auth/demo-login', { userType });
  },

  // Verify token (using user profile endpoint)
  verifyToken: (userId) => api.get(`/users/${userId}`),
};

// Books API
export const booksAPI = {
  // Get all books with advanced filtering and pagination
  getBooks: (params = {}) => {
    const queryString = buildQueryParams(params);
    return api.get(`/books${queryString ? `?${queryString}` : ''}`);
  },

  // Get single book by ID
  getBook: (id) => {
    if (!id) {
      return Promise.reject(new Error('Book ID is required'));
    }
    return api.get(`/books/${id}`);
  },

  // Get featured books
  getFeaturedBooks: (limit = 6) => {
    return api.get(`/books/featured?limit=${limit}`);
  },

  // Get books by genre
  getBooksByGenre: (genre, params = {}) => {
    if (!genre) {
      return Promise.reject(new Error('Genre is required'));
    }
    const queryParams = { genre, ...params };
    const queryString = buildQueryParams(queryParams);
    return api.get(`/books?${queryString}`);
  },

  // Get books by author
  getBooksByAuthor: (author, params = {}) => {
    if (!author) {
      return Promise.reject(new Error('Author is required'));
    }
    const queryString = buildQueryParams(params);
    return api.get(`/books/author/${encodeURIComponent(author)}${queryString ? `?${queryString}` : ''}`);
  },

  // Get available genres
  getGenres: () => api.get('/books/genres'),

  // Get book statistics (admin only)
  getBookStats: () => api.get('/books/stats'),

  // Search books
  searchBooks: (searchTerm, params = {}) => {
    const queryParams = { search: searchTerm, ...params };
    const queryString = buildQueryParams(queryParams);
    return api.get(`/books?${queryString}`);
  },

  // Admin functions
  addBook: (bookData) => {
    // Validate required fields
    if (!bookData.title || !bookData.author) {
      return Promise.reject(new Error('Title and author are required'));
    }
    
    const cleanData = {
      title: bookData.title?.trim(),
      author: bookData.author?.trim(),
      description: bookData.description?.trim() || null,
      isbn: bookData.isbn?.trim() || null,
      published_year: bookData.published_year || null,
      genre: bookData.genre?.trim() || null,
      cover_image: bookData.cover_image?.trim() || null
    };
    
    return api.post('/books', cleanData);
  },

  updateBook: (id, bookData) => {
    if (!id) {
      return Promise.reject(new Error('Book ID is required'));
    }
    if (!bookData.title || !bookData.author) {
      return Promise.reject(new Error('Title and author are required'));
    }
    
    const cleanData = {
      title: bookData.title?.trim(),
      author: bookData.author?.trim(),
      description: bookData.description?.trim() || null,
      isbn: bookData.isbn?.trim() || null,
      published_year: bookData.published_year || null,
      genre: bookData.genre?.trim() || null,
      cover_image: bookData.cover_image?.trim() || null
    };
    
    return api.put(`/books/${id}`, cleanData);
  },

  deleteBook: (id) => {
    if (!id) {
      return Promise.reject(new Error('Book ID is required'));
    }
    return api.delete(`/books/${id}`);
  },

  // Bulk operations
  bulkOperations: (data) => {
    if (!data.action || !data.bookIds || !Array.isArray(data.bookIds)) {
      return Promise.reject(new Error('Action and book IDs array are required'));
    }
    return api.post('/books/bulk', data);
  },
};

// Reviews API
export const reviewsAPI = {
  // Get reviews for a book
  getReviews: (bookId, params = {}) => {
    if (!bookId) {
      return Promise.reject(new Error('Book ID is required'));
    }
    const queryParams = { book_id: bookId, ...params };
    const queryString = buildQueryParams(queryParams);
    return api.get(`/reviews?${queryString}`);
  },

  // Get recent reviews (for admin dashboard)
  getRecentReviews: (limit = 5) => {
    return api.get(`/reviews/recent?limit=${limit}`);
  },

  // Get user reviews - FIXED to match backend route
  getUserReviews: (userId, params = {}) => {
    if (!userId) {
      return Promise.reject(new Error('User ID is required'));
    }
    const queryString = buildQueryParams(params);
    return api.get(`/reviews/user/${userId}${queryString ? `?${queryString}` : ''}`);
  },

  // Get book review summary
  getBookReviewSummary: (bookId) => {
    if (!bookId) {
      return Promise.reject(new Error('Book ID is required'));
    }
    return api.get(`/reviews/book/${bookId}/summary`);
  },

  // Create a review
  createReview: (reviewData) => {
    if (!reviewData.book_id || !reviewData.rating) {
      return Promise.reject(new Error('Book ID and rating are required'));
    }
    if (reviewData.rating < 1 || reviewData.rating > 5) {
      return Promise.reject(new Error('Rating must be between 1 and 5'));
    }
    
    const cleanData = {
      book_id: reviewData.book_id,
      rating: parseInt(reviewData.rating),
      comment: reviewData.comment?.trim() || null
    };
    
    return api.post('/reviews', cleanData);
  },

  // Update a review
  updateReview: (id, reviewData) => {
    if (!id) {
      return Promise.reject(new Error('Review ID is required'));
    }
    if (!reviewData.rating) {
      return Promise.reject(new Error('Rating is required'));
    }
    if (reviewData.rating < 1 || reviewData.rating > 5) {
      return Promise.reject(new Error('Rating must be between 1 and 5'));
    }
    
    const cleanData = {
      rating: parseInt(reviewData.rating),
      comment: reviewData.comment?.trim() || null
    };
    
    return api.put(`/reviews/${id}`, cleanData);
  },

  // Delete a review
  deleteReview: (id) => {
    if (!id) {
      return Promise.reject(new Error('Review ID is required'));
    }
    return api.delete(`/reviews/${id}`);
  },

  // Get review statistics (admin only)
  getReviewStats: () => api.get('/reviews/admin/stats'),
};

// User API - Remove getUserReviews since it's handled by reviewsAPI
export const userAPI = {
  // Get user profile
  getUser: (id) => {
    if (!id) {
      return Promise.reject(new Error('User ID is required'));
    }
    return api.get(`/users/${id}`);
  },

  // Get current user profile
  getUserProfile: () => api.get('/users/profile'),

  // Get all users (admin only)
  getUsers: (params = {}) => {
    const queryString = buildQueryParams(params);
    return api.get(`/users${queryString ? `?${queryString}` : ''}`);
  },

  // Update user profile
  updateUser: (id, userData) => {
    if (!id) {
      return Promise.reject(new Error('User ID is required'));
    }
    
    const cleanData = {
      username: userData.username?.trim(),
      email: userData.email?.trim().toLowerCase()
    };
    
    // Remove empty fields
    Object.keys(cleanData).forEach(key => {
      if (!cleanData[key]) {
        delete cleanData[key];
      }
    });
    
    return api.put(`/users/${id}`, cleanData);
  },

  // Update current user profile
  updateUserProfile: (userData) => {
    const cleanData = {
      username: userData.username?.trim(),
      email: userData.email?.trim().toLowerCase()
    };
    
    // Remove empty fields
    Object.keys(cleanData).forEach(key => {
      if (!cleanData[key]) {
        delete cleanData[key];
      }
    });
    
    return api.put('/users/profile', cleanData);
  },

  // Change password
  changePassword: (userId, passwordData) => {
    if (!userId) {
      return Promise.reject(new Error('User ID is required'));
    }
    if (!passwordData.currentPassword || !passwordData.newPassword) {
      return Promise.reject(new Error('Current password and new password are required'));
    }
    if (passwordData.newPassword.length < 6) {
      return Promise.reject(new Error('New password must be at least 6 characters'));
    }
    
    return api.put(`/users/${userId}/password`, {
      currentPassword: passwordData.currentPassword,
      newPassword: passwordData.newPassword
    });
  },

  // Update user role (admin only)
  updateUserRole: (id, role) => {
    if (!id) {
      return Promise.reject(new Error('User ID is required'));
    }
    if (!['user', 'admin'].includes(role)) {
      return Promise.reject(new Error('Invalid role. Must be "user" or "admin"'));
    }
    return api.put(`/users/${id}/role`, { role });
  },

  // Delete user (admin only)
  deleteUser: (id) => {
    if (!id) {
      return Promise.reject(new Error('User ID is required'));
    }
    return api.delete(`/users/${id}`);
  },

  // Get user statistics (admin only)
  getUserStats: () => api.get('/users/admin/stats'),
};


// Admin API
export const adminAPI = {
  // Get dashboard statistics
  getStats: () => api.get('/admin/stats'),

  // Get comprehensive admin dashboard data
  getDashboardData: async () => {
    try {
      const [stats, recentBooks, recentReviews, bookStats, userStats] = await Promise.all([
        adminAPI.getStats(),
                booksAPI.getBooks({ limit: 5, sortBy: 'created_at', sortOrder: 'DESC' }),
        reviewsAPI.getRecentReviews(5),
        booksAPI.getBookStats().catch(() => ({ data: {} })), // Optional, might not exist
        userAPI.getUserStats().catch(() => ({ data: {} })) // Optional, might not exist
      ]);

      return {
        data: {
          stats: stats.data,
          recentBooks: recentBooks.data.books || recentBooks.data,
          recentReviews: recentReviews.data,
          bookStats: bookStats.data,
          userStats: userStats.data
        }
      };
    } catch (error) {
      console.error('Error fetching admin dashboard data:', error);
      throw error;
    }
  },

  // Get system health
  getSystemHealth: () => api.get('/health'),

  // Bulk user operations
  bulkUserOperations: (data) => {
    if (!data.action || !data.userIds || !Array.isArray(data.userIds)) {
      return Promise.reject(new Error('Action and user IDs array are required'));
    }
    return api.post('/admin/users/bulk', data);
  },

  // Get audit logs (if implemented)
  getAuditLogs: (params = {}) => {
    const queryString = buildQueryParams(params);
    return api.get(`/admin/audit-logs${queryString ? `?${queryString}` : ''}`);
  },

  // System maintenance operations
  maintenance: {
    // Clear cache
    clearCache: () => api.post('/admin/maintenance/clear-cache'),
    
    // Database cleanup
    cleanupDatabase: () => api.post('/admin/maintenance/cleanup-db'),
    
    // Generate reports
    generateReport: (reportType, params = {}) => {
      const queryString = buildQueryParams(params);
      return api.post(`/admin/reports/${reportType}${queryString ? `?${queryString}` : ''}`);
    }
  }
};

// Utility functions
export const apiUtils = {
  // Test API connection
  testConnection: async () => {
    try {
      const response = await api.get('/health');
      return { success: true, data: response.data };
    } catch (error) {
      return { success: false, error: error.message };
    }
  },

  // Upload file (if file upload is implemented)
  uploadFile: (file, type = 'image') => {
    if (!file) {
      return Promise.reject(new Error('File is required'));
    }

    const formData = new FormData();
    formData.append('file', file);
    formData.append('type', type);

    return api.post('/upload', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
      timeout: 60000, // 60 seconds for file uploads
    });
  },

  // Validate image URL
  validateImageUrl: async (url) => {
    if (!url) return false;
    
    try {
      new URL(url); // Basic URL validation
      
      // Optional: Check if image is accessible
      const response = await fetch(url, { method: 'HEAD' });
      return response.ok && response.headers.get('content-type')?.startsWith('image/');
    } catch {
      return false;
    }
  },

  // Format API errors for display
  formatError: (error) => {
    if (!error) return 'An unknown error occurred';
    
    // Handle different error structures
    if (error.response?.data) {
      const { error: errorMsg, details, message } = error.response.data;
      return errorMsg || details || message || 'Server error occurred';
    }
    
    if (error.message) {
      return error.message;
    }
    
    return 'An unexpected error occurred';
  },

  // Retry failed requests
  retryRequest: async (requestFn, maxRetries = 3, delay = 1000) => {
    let lastError;
    
    for (let i = 0; i < maxRetries; i++) {
      try {
        return await requestFn();
      } catch (error) {
        lastError = error;
        
        // Don't retry on client errors (4xx)
        if (error.response?.status >= 400 && error.response?.status < 500) {
          throw error;
        }
        
        // Wait before retrying
        if (i < maxRetries - 1) {
          await new Promise(resolve => setTimeout(resolve, delay * (i + 1)));
        }
      }
    }
    
    throw lastError;
  },

  // Batch requests with rate limiting
  batchRequests: async (requests, batchSize = 5, delay = 100) => {
    const results = [];
    
    for (let i = 0; i < requests.length; i += batchSize) {
      const batch = requests.slice(i, i + batchSize);
      const batchResults = await Promise.allSettled(batch.map(req => req()));
      results.push(...batchResults);
      
      // Add delay between batches
      if (i + batchSize < requests.length) {
        await new Promise(resolve => setTimeout(resolve, delay));
      }
    }
    
    return results;
  },

  // Cancel request token
  createCancelToken: () => {
    const source = axios.CancelToken.source();
    return {
      token: source.token,
      cancel: source.cancel
    };
  }
};

// Search API (if you have dedicated search endpoints)
export const searchAPI = {
  // Global search across books, authors, and reviews
  globalSearch: (query, params = {}) => {
    if (!query || query.trim().length === 0) {
      return Promise.reject(new Error('Search query is required'));
    }
    
    const queryParams = { q: query.trim(), ...params };
    const queryString = buildQueryParams(queryParams);
    return api.get(`/search?${queryString}`);
  },

  // Search suggestions/autocomplete
  getSuggestions: (query, type = 'all') => {
    if (!query || query.trim().length < 2) {
      return Promise.resolve({ data: [] });
    }
    
    const queryParams = { q: query.trim(), type };
    const queryString = buildQueryParams(queryParams);
    return api.get(`/search/suggestions?${queryString}`);
  },

  // Advanced search with filters
  advancedSearch: (filters) => {
    const queryString = buildQueryParams(filters);
    return api.get(`/search/advanced?${queryString}`);
  }
};

// Analytics API (if implemented)
export const analyticsAPI = {
  // Track user actions
  trackEvent: (eventData) => {
    if (!eventData.event || !eventData.category) {
      return Promise.reject(new Error('Event name and category are required'));
    }
    
    return api.post('/analytics/events', {
      event: eventData.event,
      category: eventData.category,
      label: eventData.label || null,
      value: eventData.value || null,
      timestamp: new Date().toISOString()
    });
  },

  // Get analytics data (admin only)
  getAnalytics: (params = {}) => {
    const queryString = buildQueryParams(params);
    return api.get(`/analytics${queryString ? `?${queryString}` : ''}`);
  },

  // Get popular content
  getPopularContent: (type = 'books', period = '7d') => {
    return api.get(`/analytics/popular/${type}?period=${period}`);
  }
};

// Export the main axios instance for custom requests
export default api;

// Legacy exports for backward compatibility
export const booksApi = booksAPI;
export const reviewsApi = reviewsAPI;
export const userApi = userAPI;
export const authApi = authAPI;

// API configuration
export const apiConfig = {
  baseURL: API_BASE_URL,
  timeout: 30000,
  retryAttempts: 3,
  retryDelay: 1000
};

// Helper function to check if user is authenticated
export const isAuthenticated = () => {
  const token = localStorage.getItem('token');
  const user = localStorage.getItem('user');
  return !!(token && user);
};

// Helper function to get current user
export const getCurrentUser = () => {
  try {
    const user = localStorage.getItem('user');
    return user ? JSON.parse(user) : null;
  } catch {
    return null;
  }
};

// Helper function to check if current user is admin
export const isCurrentUserAdmin = () => {
  const user = getCurrentUser();
  return user?.role === 'admin';
};

// Helper function to clear auth data
export const clearAuthData = () => {
  localStorage.removeItem('token');
  localStorage.removeItem('user');
};

// Development helpers
if (process.env.NODE_ENV === 'development') {
  // Expose API to window for debugging
  window.bookReviewAPI = {
    auth: authAPI,
    books: booksAPI,
    reviews: reviewsAPI,
    users: userAPI,
    admin: adminAPI,
    utils: apiUtils,
    search: searchAPI,
    analytics: analyticsAPI,
    config: apiConfig
  };
  
}
