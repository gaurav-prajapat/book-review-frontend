import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { BookProvider } from './context/BookContext';
import Layout from './components/Layout/Layout';
import ProtectedRoute from './components/Common/ProtectedRoute';
import AdminRoute from './components/Common/AdminRoute';
import Home from './pages/Home';
import Books from './pages/Books';
import BookDetail from './pages/BookDetail';
import Login from './pages/Login';
import Register from './pages/Register';
import Profile from './pages/Profile';
import MyReviews from './pages/MyReviews';
import AdminPanel from './pages/Admin/AdminPanel';
import AddBook from './pages/Admin/AddBook';
import EditBook from './pages/Admin/EditBook';

function App() {
  return (
    <AuthProvider>
      <BookProvider>
        <Router>
          <Layout>
            <Routes>
              <Route path="/" element={<Home />} />
              <Route path="/books" element={<Books />} />
              <Route path="/books/:id" element={<BookDetail />} />
              <Route path="/login" element={<Login />} />
              <Route path="/register" element={<Register />} />
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
              <Route 
                path="/admin/edit-book/:id" 
                element={
                  <AdminRoute>
                    <EditBook />
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
