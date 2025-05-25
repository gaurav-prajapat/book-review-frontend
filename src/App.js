import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { BookProvider } from './context/BookContext';
import Layout from './components/Layout/Layout';
import ProtectedRoute from './components/Common/ProtectedRoute';
import AdminRoute from './components/Common/AdminRoute';

// Public Pages
import Home from './pages/Home';
import Books from './pages/Books';
import BookDetail from './pages/BookDetail';
import Login from './pages/Login';
import Register from './pages/Register';

// Protected User Pages
import Profile from './pages/Profile';
import MyReviews from './pages/MyReviews';

// Admin Pages
import AdminDashboard from './pages/Admin/AdminDashboard';
import AdminBooks from './pages/Admin/AdminBooks';
import AdminUsers from './pages/Admin/AdminUsers';
import AddBook from './pages/Admin/AddBook';
import EditBook from './pages/Admin/EditBook';

// Legacy Admin Panel (keeping for backward compatibility)
import AdminPanel from './pages/Admin/AdminPanel';

function App() {
  return (
    <AuthProvider>
      <BookProvider>
        <Router>
          <Layout>
            <Routes>
              {/* Public Routes */}
              <Route path="/" element={<Home />} />
              <Route path="/books" element={<Books />} />
              <Route path="/books/:id" element={<BookDetail />} />
              <Route path="/login" element={<Login />} />
              <Route path="/register" element={<Register />} />
              
              {/* Protected User Routes */}
              <Route 
                path="/profile/:id" 
                element={
                  <ProtectedRoute>
                    <Profile />
                  </ProtectedRoute>
                } 
              />
              <Route 
                path="/my-reviews" 
                element={
                  <ProtectedRoute>
                    <MyReviews />
                  </ProtectedRoute>
                } 
              />
              
              {/* Admin Routes */}
              <Route 
                path="/admin/dashboard" 
                element={
                  <AdminRoute>
                    <AdminDashboard />
                  </AdminRoute>
                } 
              />
              <Route 
                path="/admin/books" 
                element={
                  <AdminRoute>
                    <AdminBooks />
                  </AdminRoute>
                } 
              />
              <Route 
                path="/admin/books/add" 
                element={
                  <AdminRoute>
                    <AddBook />
                  </AdminRoute>
                } 
              />
              <Route 
                path="/admin/books/edit/:id" 
                element={
                  <AdminRoute>
                    <EditBook />
                  </AdminRoute>
                } 
              />
              <Route 
                path="/admin/users" 
                element={
                  <AdminRoute>
                    <AdminUsers />
                  </AdminRoute>
                } 
              />
              
              {/* Legacy Admin Routes */}
              <Route 
                path="/admin" 
                element={
                  <AdminRoute>
                    <AdminPanel />
                  </AdminRoute>
                } 
              />
              <Route 
                path="/admin/add-book" 
                element={
                  <AdminRoute>
                    <AddBook />
                  </AdminRoute>
                } 
              />
            </Routes>
          </Layout>
        </Router>
      </BookProvider>
    </AuthProvider>
  );
}

export default App;
