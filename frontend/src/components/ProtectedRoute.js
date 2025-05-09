import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import AuthService from '../services/authService';

const ProtectedRoute = ({ children }) => {
  const isAuthenticated = AuthService.isAuthenticated();
  const user = AuthService.getCurrentUser();
  const location = useLocation();

  if (!isAuthenticated) {
    // Redirect them to the /login page, but save the current location they were
    // trying to go to when they were redirected. This allows us to send them
    // along to that page after they login, which is a nicer user experience
    // than dropping them off on the home page.
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  if (!user || !user.is_approved) {
    // If user data is missing or user is not approved, redirect to login.
    // Pass a message to LoginPage to display.
    return <Navigate to="/login" state={{ message: "Akun Anda belum disetujui atau telah dinonaktifkan.", from: location }} replace />;
  }

  return children;
};

export default ProtectedRoute;
