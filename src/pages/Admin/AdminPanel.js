import React from 'react';
import { Navigate } from 'react-router-dom';

const AdminPanel = () => {
  // Redirect to admin dashboard as the main admin page
  return <Navigate to="/admin/dashboard" replace />;
};

export default AdminPanel;
