import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { ArrowLeftIcon, PhotoIcon, XMarkIcon } from '@heroicons/react/24/outline';
import { booksAPI } from '../../utils/api';
import LoadingSpinner from '../../components/Common/LoadingSpinner';
import ErrorMessage from '../../components/Common/ErrorMessage';

const EditBook = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [validationErrors, setValidationErrors] = useState({});
  const [imagePreview, setImagePreview] = useState('');
  const [formData, setFormData] = useState({
    title: '',
    author: '',
    isbn: '',
    genre: '',
    published_year: '',
    description: '',
    cover_image: ''
  });

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

  useEffect(() => {
    fetchBook();
  }, [id]);

  const fetchBook = async () => {
    try {
      setLoading(true);
      const response = await booksAPI.getBook(id);
      const book = response.data;
      setFormData({
        title: book.title || '',
        author: book.author || '',
        isbn: book.isbn || '',
        genre: book.genre || '',
        published_year: book.published_year || '',
        description: book.description || '',
        cover_image: book.cover_image || ''
      });
      setImagePreview(book.cover_image || '');
    } catch (err) {
      setError('Failed to fetch book details');
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value
    });

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

    try {
      setSubmitting(true);
      setError('');
      await booksAPI.updateBook(id, formData);
      navigate('/admin/books', {
        state: {
          message: `Book "${formData.title}" has been updated successfully!`,
          type: 'success'
        }
      });
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to update book');
    } finally {
      setSubmitting(false);
    }
  };

  const removeImage = () => {
    setFormData(prev => ({ ...prev, cover_image: '' }));
    setImagePreview('');
  };

  if (loading) {
    return (
      <div className="flex justify-center py-12">
        <LoadingSpinner size="large" />
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-center space-x-4">
        <Link
          to="/admin/books"
          className="p-2 rounded-lg border border-gray-300 hover:bg-gray-50 transition-colors"
        >
          <ArrowLeftIcon className="h-5 w-5" />
        </Link>
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Edit Book</h1>
          <p className="text-gray-600 mt-2">Update book information</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Main Form */}
        <div className="lg:col-span-2">
          <div className="card">
            <ErrorMessage message={error} onClose={() => setError('')} />

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
                      placeholder="Enter ISBN"
                    />
                    {validationErrors.isbn && (
                      <p className="mt-1 text-sm text-red-600">{validationErrors.isbn}</p>
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

                  <div className="md:col-span-2">
                    <label htmlFor="published_year" className="block text-sm font-medium text-gray-700 mb-1">
                      Published Year
                    </label>
                    <input
                      type="number"
                      id="published_year"
                      name="published_year"
                      value={formData.published_year}
                      onChange={handleChange}
                      min="1000"
                      max={currentYear}
                      className={`input-field ${validationErrors.published_year ? 'border-red-300' : ''}`}
                      placeholder="Enter publication year"
                    />
                    {validationErrors.published_year && (
                      <p className="mt-1 text-sm text-red-600">{validationErrors.published_year}</p>
                    )}
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
                  />
                </div>
              </div>

              {/* Cover Image */}
              <div>
                <h3 className="text-lg font-medium text-gray-900 mb-4">Cover Image</h3>
                <div>
                  <label htmlFor="cover_image" className="block text-sm font-medium text-gray-700 mb-1">
                    Cover Image URL
                  </label>
                  <input
                    type="url"
                    id="cover_image"
                    name="cover_image"
                    value={formData.cover_image}
                    onChange={handleChange}
                    className={`input-field ${validationErrors.cover_image ? 'border-red-300' : ''}`}
                    placeholder="Enter image URL (jpg, png, gif, webp, svg)"
                  />
                  {validationErrors.cover_image && (
                    <p className="mt-1 text-sm text-red-600">{validationErrors.cover_image}</p>
                  )}
                  <p className="mt-1 text-sm text-gray-500">
                    Supported formats: JPG, PNG, GIF, WebP, SVG
                  </p>
                </div>
              </div>

              {/* Submit Buttons */}
              <div className="flex items-center space-x-4 pt-6 border-t border-gray-200">
                <button
                  type="submit"
                  disabled={submitting}
                  className="btn-primary disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {submitting ? (
                    <>
                      <LoadingSpinner size="small" color="white" />
                      <span className="ml-2">Updating...</span>
                    </>
                  ) : (
                    'Update Book'
                  )}
                </button>
                <Link
                  to="/admin/books"
                  className="btn-secondary"
                >
                  Cancel
                </Link>
              </div>
            </form>
          </div>
        </div>

        {/* Preview Sidebar */}
        <div className="lg:col-span-1">
          <div className="card sticky top-6">
            <h3 className="text-lg font-medium text-gray-900 mb-4">Preview</h3>
            
            {/* Book Cover Preview */}
            <div className="mb-6">
              <div className="aspect-[3/4] bg-gray-100 rounded-lg overflow-hidden">
                {imagePreview ? (
                  <div className="relative h-full">
                    <img
                      src={imagePreview}
                      alt="Book cover preview"
                      className="w-full h-full object-cover"
                      onError={(e) => {
                        e.target.style.display = 'none';
                        e.target.nextSibling.style.display = 'flex';
                      }}
                    />
                    <div className="hidden w-full h-full flex items-center justify-center bg-gray-200">
                      <div className="text-center text-gray-500">
                        <PhotoIcon className="h-12 w-12 mx-auto mb-2" />
                        <p className="text-sm">Invalid image URL</p>
                      </div>
                    </div>
                    <button
                      type="button"
                      onClick={removeImage}
                      className="absolute top-2 right-2 p-1 bg-red-600 text-white rounded-full hover:bg-red-700"
                    >
                      <XMarkIcon className="h-4 w-4" />
                    </button>
                  </div>
                ) : (
                  <div className="w-full h-full flex items-center justify-center bg-gray-200">
                    <div className="text-center text-gray-500">
                      <PhotoIcon className="h-12 w-12 mx-auto mb-2" />
                      <p className="text-sm">No cover image</p>
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Book Details Preview */}
            <div className="space-y-4">
              <div>
                <h4 className="font-semibold text-gray-900 text-lg">
                  {formData.title || 'Book Title'}
                </h4>
                <p className="text-gray-600">
                  by {formData.author || 'Author Name'}
                </p>
              </div>

              {formData.genre && (
                <div>
                  <span className="inline-block bg-blue-100 text-blue-800 text-xs px-2 py-1 rounded-full">
                    {formData.genre}
                  </span>
                </div>
              )}

              <div className="space-y-2 text-sm">
                {formData.isbn && (
                  <div>
                    <span className="font-medium text-gray-700">ISBN:</span>
                    <span className="ml-2 text-gray-600">{formData.isbn}</span>
                  </div>
                )}
                {formData.published_year && (
                  <div>
                    <span className="font-medium text-gray-700">Published:</span>
                    <span className="ml-2 text-gray-600">{formData.published_year}</span>
                  </div>
                )}
              </div>

              {formData.description && (
                <div>
                  <h5 className="font-medium text-gray-700 mb-2">Description</h5>
                  <p className="text-sm text-gray-600 leading-relaxed">
                    {formData.description.length > 150
                      ? `${formData.description.substring(0, 150)}...`
                      : formData.description}
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default EditBook;

