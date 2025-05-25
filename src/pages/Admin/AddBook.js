import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { ArrowLeftIcon, PhotoIcon, XMarkIcon, CheckCircleIcon } from '@heroicons/react/24/outline';
import { useBooks } from '../../context/BookContext';
import LoadingSpinner from '../../components/Common/LoadingSpinner';
import ErrorMessage from '../../components/Common/ErrorMessage';

const AddBook = () => {
  const [formData, setFormData] = useState({
    title: '',
    author: '',
    description: '',
    isbn: '',
    published_year: '',
    genre: '',
    cover_image: ''
  });
  const [validationErrors, setValidationErrors] = useState({});
  const [isPreviewMode, setIsPreviewMode] = useState(false);
  const [imagePreview, setImagePreview] = useState('');
  const [isDragOver, setIsDragOver] = useState(false);
  const [showSuccessMessage, setShowSuccessMessage] = useState(false);
  const { addBook, loading, error, clearError } = useBooks();
  const navigate = useNavigate();
  const location = useLocation();

  const genres = [
    'Fiction',
    'Non-Fiction',
    'Mystery',
    'Romance',
    'Science Fiction',
    'Fantasy',
    'Biography',
    'History',
    'Self-Help',
    'Business',
    'Technology',
    'Health',
    'Travel',
    'Children',
    'Young Adult',
    'Poetry',
    'Drama',
    'Horror',
    'Thriller',
    'Adventure',
    'Philosophy',
    'Psychology',
    'Art',
    'Music',
    'Sports',
    'Cooking',
    'Religion',
    'Politics',
    'Science',
    'Education'
  ];

  const currentYear = new Date().getFullYear();
  const years = Array.from({ length: currentYear - 1900 + 1 }, (_, i) => currentYear - i);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    
    // Clear validation error for this field
    if (validationErrors[name]) {
      setValidationErrors(prev => ({
        ...prev,
        [name]: ''
      }));
    }

    // Handle image preview
    if (name === 'cover_image' && value) {
      setImagePreview(value);
    }
  };

  const handleImageDrop = (e) => {
    e.preventDefault();
    setIsDragOver(false);
    
    const files = e.dataTransfer.files;
    if (files.length > 0) {
      const file = files[0];
      if (file.type.startsWith('image/')) {
        const reader = new FileReader();
        reader.onload = (e) => {
          const imageUrl = e.target.result;
          setFormData(prev => ({ ...prev, cover_image: imageUrl }));
          setImagePreview(imageUrl);
        };
        reader.readAsDataURL(file);
      }
    }
  };

  const handleImageDragOver = (e) => {
    e.preventDefault();
    setIsDragOver(true);
  };

  const handleImageDragLeave = (e) => {
    e.preventDefault();
    setIsDragOver(false);
  };

  const validateForm = () => {
    const errors = {};
    
    if (!formData.title.trim()) {
      errors.title = 'Title is required';
    } else if (formData.title.length < 2) {
      errors.title = 'Title must be at least 2 characters long';
    }
    
    if (!formData.author.trim()) {
      errors.author = 'Author is required';
    } else if (formData.author.length < 2) {
      errors.author = 'Author name must be at least 2 characters long';
    }
    
    if (formData.isbn && !/^(?:\d{10}|\d{13}|[\d-]{10,17})$/.test(formData.isbn.replace(/[-\s]/g, ''))) {
      errors.isbn = 'Invalid ISBN format (10 or 13 digits)';
    }
    
    if (formData.published_year && (formData.published_year < 1000 || formData.published_year > currentYear)) {
      errors.published_year = `Published year must be between 1000 and ${currentYear}`;
    }

    if (formData.cover_image && !isValidImageUrl(formData.cover_image)) {
      errors.cover_image = 'Please enter a valid image URL';
    }
    
    setValidationErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const isValidImageUrl = (url) => {
    try {
      new URL(url);
      return /\.(jpg|jpeg|png|gif|webp|svg)$/i.test(url);
    } catch {
      return false;
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    const result = await addBook(formData);
    if (result.success) {
      setShowSuccessMessage(true);
      setTimeout(() => {
        navigate('/admin', { 
          state: { 
            message: `Book "${formData.title}" has been added successfully!`,
            type: 'success'
          }
        });
      }, 2000);
    }
  };

  const handleReset = () => {
    setFormData({
      title: '',
      author: '',
      description: '',
      isbn: '',
      published_year: '',
      genre: '',
      cover_image: ''
    });
    setValidationErrors({});
    setImagePreview('');
    setIsPreviewMode(false);
    setShowSuccessMessage(false);
    clearError();
  };

  const handleImageFileSelect = (e) => {
    const file = e.target.files[0];
    if (file && file.type.startsWith('image/')) {
      const reader = new FileReader();
      reader.onload = (e) => {
        const imageUrl = e.target.result;
        setFormData(prev => ({ ...prev, cover_image: imageUrl }));
        setImagePreview(imageUrl);
      };
      reader.readAsDataURL(file);
    }
  };

  const removeImage = () => {
    setFormData(prev => ({ ...prev, cover_image: '' }));
    setImagePreview('');
  };

  const togglePreview = () => {
    setIsPreviewMode(!isPreviewMode);
  };

  // Check if coming from a successful navigation
  React.useEffect(() => {
    if (location.state?.message) {
      setShowSuccessMessage(true);
      setTimeout(() => setShowSuccessMessage(false), 5000);
    }
  }, [location.state]);

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Success Message */}
      {showSuccessMessage && (
        <div className="fixed top-4 right-4 bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded-lg shadow-lg z-50">
          <div className="flex items-center">
            <CheckCircleIcon className="h-5 w-5 mr-2" />
            <span>Book added successfully! Redirecting...</span>
          </div>
        </div>
      )}

      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <Link
            to="/admin"
            className="p-2 rounded-lg border border-gray-300 hover:bg-gray-50 transition-colors"
          >
            <ArrowLeftIcon className="h-5 w-5" />
          </Link>
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Add New Book</h1>
            <p className="text-gray-600 mt-1">Add a new book to the collection</p>
          </div>
        </div>
        
        <div className="flex space-x-3">
          <button
            type="button"
            onClick={togglePreview}
            className="btn-secondary"
          >
            {isPreviewMode ? 'Edit Mode' : 'Preview'}
          </button>
          <button
            type="button"
            onClick={handleReset}
            className="btn-secondary"
          >
            Reset Form
          </button>
        </div>
      </div>

      {isPreviewMode ? (
        /* Preview Mode */
        <div className="card">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-semibold text-gray-900">Book Preview</h2>
            <button
              onClick={togglePreview}
              className="btn-primary"
            >
              Continue Editing
            </button>
          </div>
          
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Book Cover */}
            <div className="lg:col-span-1">
              <div className="aspect-[3/4] bg-gray-100 rounded-lg overflow-hidden">
                {imagePreview ? (
                  <img
                    src={imagePreview}
                    alt={formData.title || 'Book cover'}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center">
                    <PhotoIcon className="h-16 w-16 text-gray-400" />
                  </div>
                )}
              </div>
            </div>

            {/* Book Details */}
            <div className="lg:col-span-2 space-y-4">
              <div>
                <h3 className="text-2xl font-bold text-gray-900">
                  {formData.title || 'Book Title'}
                </h3>
                <p className="text-lg text-gray-600 mt-1">
                  by {formData.author || 'Author Name'}
                </p>
              </div>

              <div className="flex flex-wrap gap-4 text-sm text-gray-600">
                {formData.genre && (
                  <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                    {formData.genre}
                  </span>
                )}
                {formData.published_year && (
                  <span>Published: {formData.published_year}</span>
                )}
                {formData.isbn && (
                  <span>ISBN: {formData.isbn}</span>
                )}
              </div>

              {formData.description && (
                <div>
                  <h4 className="font-medium text-gray-900 mb-2">Description</h4>
                  <p className="text-gray-700 leading-relaxed">
                    {formData.description}
                  </p>
                </div>
              )}

              <div className="pt-4 border-t">
                <div className="flex items-center space-x-4">
                  <div className="flex items-center">
                    <span className="text-sm text-gray-500">Average Rating:</span>
                    <span className="ml-2 text-sm text-gray-400">No ratings yet</span>
                  </div>
                  <div className="flex items-center">
                    <span className="text-sm text-gray-500">Reviews:</span>
                    <span className="ml-2 text-sm text-gray-400">0 reviews</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      ) : (
        /* Edit Mode */
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Form */}
          <div className="lg:col-span-2">
            <div className="card">
              <ErrorMessage message={error} onClose={clearError} />
              
              <form onSubmit={handleSubmit} className="space-y-6">
                {/* Basic Information */}
                <div>
                  <h3 className="text-lg font-medium text-gray-900 mb-4">Basic Information</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="md:col-span-2">
                      <label htmlFor="title" className="block text-sm font-medium text-gray-700 mb-1">
                        Title *
                      </label>
                      <input
                        type="text"
                        id="title"
                        name="title"
                        value={formData.title}
                        onChange={handleChange}
                        className={`input-field ${validationErrors.title ? 'border-red-300' : ''}`}
                        placeholder="Enter book title"
                      />
                      {validationErrors.title && (
                        <p className="mt-1 text-sm text-red-600">{validationErrors.title}</p>
                      )}
                    </div>

                    <div className="md:col-span-2">
                      <label htmlFor="author" className="block text-sm font-medium text-gray-700 mb-1">
                        Author *
                      </label>
                      <input
                        type="text"
                        id="author"
                        name="author"
                        value={formData.author}
                        onChange={handleChange}
                        className={`input-field ${validationErrors.author ? 'border-red-300' : ''}`}
                        placeholder="Enter author name"
                      />
                      {validationErrors.author && (
                        <p className="mt-1 text-sm text-red-600">{validationErrors.author}</p>
                      )}
                    </div>

                    <div>
                      <label htmlFor="genre" className="block text-sm font-medium text-gray-700 mb-1">
                        Genre
                      </label>
                      <select
                        id="genre"
                        name="genre"
                        value={formData.genre}
                        onChange={handleChange}
                        className="input-field"
                      >
                        <option value="">Select a genre</option>
                        {genres.map(genre => (
                          <option key={genre} value={genre}>{genre}</option>
                        ))}
                      </select>
                    </div>

                    <div>
                      <label htmlFor="published_year" className="block text-sm font-medium text-gray-700 mb-1">
                        Published Year
                      </label>
                      <select
                        id="published_year"
                        name="published_year"
                        value={formData.published_year}
                        onChange={handleChange}
                        className={`input-field ${validationErrors.published_year ? 'border-red-300' : ''}`}
                      >
                        <option value="">Select year</option>
                        {years.map(year => (
                          <option key={year} value={year}>{year}</option>
                        ))}
                      </select>
                                            {validationErrors.published_year && (
                        <p className="mt-1 text-sm text-red-600">{validationErrors.published_year}</p>
                      )}
                    </div>

                    <div className="md:col-span-2">
                      <label htmlFor="isbn" className="block text-sm font-medium text-gray-700 mb-1">
                        ISBN
                      </label>
                      <input
                        type="text"
                        id="isbn"
                        name="isbn"
                        value={formData.isbn}
                        onChange={handleChange}
                        className={`input-field ${validationErrors.isbn ? 'border-red-300' : ''}`}
                        placeholder="Enter ISBN (e.g., 978-0-123456-78-9)"
                      />
                      {validationErrors.isbn && (
                        <p className="mt-1 text-sm text-red-600">{validationErrors.isbn}</p>
                      )}
                      <p className="mt-1 text-xs text-gray-500">
                        Enter 10 or 13 digit ISBN with or without hyphens
                      </p>
                    </div>
                  </div>
                </div>

                {/* Description */}
                <div>
                  <h3 className="text-lg font-medium text-gray-900 mb-4">Description</h3>
                  <div>
                    <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-1">
                      Book Description
                    </label>
                    <textarea
                      id="description"
                      name="description"
                      value={formData.description}
                      onChange={handleChange}
                      rows={6}
                      className="input-field"
                      placeholder="Enter a detailed description of the book..."
                      maxLength={1000}
                    />
                    <p className="mt-1 text-xs text-gray-500">
                      {formData.description.length}/1000 characters
                    </p>
                  </div>
                </div>

                {/* Cover Image URL */}
                <div>
                  <h3 className="text-lg font-medium text-gray-900 mb-4">Cover Image</h3>
                  <div>
                    <label htmlFor="cover_image" className="block text-sm font-medium text-gray-700 mb-1">
                      Image URL
                    </label>
                    <input
                      type="url"
                      id="cover_image"
                      name="cover_image"
                      value={formData.cover_image}
                      onChange={handleChange}
                      className={`input-field ${validationErrors.cover_image ? 'border-red-300' : ''}`}
                      placeholder="https://example.com/book-cover.jpg"
                    />
                    {validationErrors.cover_image && (
                      <p className="mt-1 text-sm text-red-600">{validationErrors.cover_image}</p>
                    )}
                    <p className="mt-1 text-xs text-gray-500">
                      Supported formats: JPG, PNG, GIF, WebP, SVG
                    </p>
                  </div>
                </div>

                {/* Submit Buttons */}
                <div className="flex items-center justify-between pt-6 border-t">
                  <button
                    type="button"
                    onClick={handleReset}
                    className="btn-secondary"
                  >
                    Reset Form
                  </button>
                  
                  <div className="flex space-x-3">
                    <button
                      type="button"
                      onClick={togglePreview}
                      className="btn-secondary"
                    >
                      Preview Book
                    </button>
                    <button
                      type="submit"
                      disabled={loading}
                      className="btn-primary disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      {loading ? (
                        <>
                          <LoadingSpinner size="small" />
                          <span className="ml-2">Adding Book...</span>
                        </>
                      ) : (
                        <>
                          <CheckCircleIcon className="h-4 w-4 mr-2" />
                          Add Book
                        </>
                      )}
                    </button>
                  </div>
                </div>
              </form>
            </div>
          </div>

          {/* Sidebar */}
          <div className="lg:col-span-1 space-y-6">
            {/* Image Preview */}
            <div className="card">
              <h3 className="text-lg font-medium text-gray-900 mb-4">Cover Preview</h3>
              <div className="space-y-4">
                <div className="aspect-[3/4] bg-gray-100 rounded-lg overflow-hidden border-2 border-dashed border-gray-300">
                  {imagePreview ? (
                    <div className="relative w-full h-full">
                      <img
                        src={imagePreview}
                        alt="Book cover preview"
                        className="w-full h-full object-cover"
                        onError={() => setImagePreview('')}
                      />
                      <button
                        type="button"
                        onClick={removeImage}
                        className="absolute top-2 right-2 p-1 bg-red-600 text-white rounded-full hover:bg-red-700"
                      >
                        <XMarkIcon className="h-4 w-4" />
                      </button>
                    </div>
                  ) : (
                    <div
                      className={`w-full h-full flex flex-col items-center justify-center ${
                        isDragOver ? 'border-blue-500 bg-blue-50' : ''
                      }`}
                      onDrop={handleImageDrop}
                      onDragOver={handleImageDragOver}
                      onDragLeave={handleImageDragLeave}
                    >
                      <PhotoIcon className="h-12 w-12 text-gray-400 mb-2" />
                      <p className="text-sm text-gray-500 text-center">
                        {isDragOver ? 'Drop image here' : 'No image selected'}
                      </p>
                      <p className="text-xs text-gray-400 text-center mt-1">
                        Drag & drop or enter URL above
                      </p>
                    </div>
                  )}
                </div>

                {/* File Upload Option */}
                <div>
                  <label className="block">
                    <span className="sr-only">Choose image file</span>
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleImageFileSelect}
                      className="block w-full text-sm text-gray-500
                        file:mr-4 file:py-2 file:px-4
                        file:rounded-full file:border-0
                        file:text-sm file:font-semibold
                        file:bg-blue-50 file:text-blue-700
                        hover:file:bg-blue-100"
                    />
                  </label>
                  <p className="text-xs text-gray-500 mt-1">
                    Or upload from your computer
                  </p>
                </div>
              </div>
            </div>

            {/* Form Progress */}
            <div className="card">
              <h3 className="text-lg font-medium text-gray-900 mb-4">Form Progress</h3>
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">Title</span>
                  <span className={`text-xs px-2 py-1 rounded-full ${
                    formData.title ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-600'
                  }`}>
                    {formData.title ? 'Complete' : 'Required'}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">Author</span>
                  <span className={`text-xs px-2 py-1 rounded-full ${
                    formData.author ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-600'
                  }`}>
                    {formData.author ? 'Complete' : 'Required'}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">Genre</span>
                  <span className={`text-xs px-2 py-1 rounded-full ${
                    formData.genre ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'
                  }`}>
                    {formData.genre ? 'Complete' : 'Optional'}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">Description</span>
                  <span className={`text-xs px-2 py-1 rounded-full ${
                    formData.description ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'
                  }`}>
                    {formData.description ? 'Complete' : 'Optional'}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">Cover Image</span>
                  <span className={`text-xs px-2 py-1 rounded-full ${
                    formData.cover_image ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'
                  }`}>
                    {formData.cover_image ? 'Complete' : 'Optional'}
                  </span>
                </div>
              </div>
              
              <div className="mt-4 pt-4 border-t">
                <div className="flex items-center justify-between text-sm">
                  <span className="font-medium text-gray-900">Ready to submit:</span>
                  <span className={`font-medium ${
                    formData.title && formData.author ? 'text-green-600' : 'text-red-600'
                  }`}>
                    {formData.title && formData.author ? 'Yes' : 'No'}
                  </span>
                </div>
              </div>
            </div>

            {/* Quick Tips */}
            <div className="card bg-blue-50 border-blue-200">
              <h3 className="text-lg font-medium text-blue-900 mb-4">Quick Tips</h3>
              <div className="space-y-3 text-sm text-blue-800">
                <div className="flex items-start space-x-2">
                  <span className="font-bold">•</span>
                  <p>Use descriptive titles that readers can easily search for</p>
                </div>
                <div className="flex items-start space-x-2">
                  <span className="font-bold">•</span>
                  <p>Include the full author name as it appears on the book</p>
                </div>
                <div className="flex items-start space-x-2">
                  <span className="font-bold">•</span>
                  <p>Write engaging descriptions that highlight key themes</p>
                </div>
                <div className="flex items-start space-x-2">
                  <span className="font-bold">•</span>
                  <p>High-quality cover images improve user engagement</p>
                </div>
                <div className="flex items-start space-x-2">
                  <span className="font-bold">•</span>
                  <p>Double-check ISBN for accuracy if provided</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AddBook;

