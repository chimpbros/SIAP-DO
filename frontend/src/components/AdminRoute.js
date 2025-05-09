import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import AuthService from '../services/authService';

const AdminRoute = ({ children }) => {
  const isAuthenticated = AuthService.isAuthenticated();
  const user = AuthService.getCurrentUser();
  const location = useLocation();

  if (!isAuthenticated) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  if (!user || !user.is_approved) {
     // Admins must also be approved
    return <Navigate to="/login" state={{ message: "Akun admin Anda belum disetujui atau dinonaktifkan.", from: location }} replace />;
  }

  if (!user.is_admin) {
    // If authenticated and approved, but not an admin, redirect to regular dashboard
    return <Navigate to="/dashboard" state={{ message: "Anda tidak memiliki izin untuk mengakses halaman ini." }} replace />;
  }

  return children;
};

export default AdminRoute;
