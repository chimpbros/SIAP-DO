import React from 'react';
import { BrowserRouter as Router, Route, Routes, Navigate } from 'react-router-dom';
// No App.css import needed
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import DashboardPage from './pages/DashboardPage';
import AddDocumentPage from './pages/AddDocumentPage';
import ArchiveListPage from './pages/ArchiveListPage';
import AdminDashboardPage from './pages/AdminDashboardPage';
import Navbar from './components/Navbar'; 
import AuthService from './services/authService'; // Import AuthService
import ProtectedRoute from './components/ProtectedRoute'; // Import ProtectedRoute
import AdminRoute from './components/AdminRoute'; // Import AdminRoute

function App() {
  return (
    <Router>
      {/* Navbar might be conditional or part of a layout component */}
      {/* <Navbar /> */} 
      <Routes>
        <Route path="/login" element={<LoginPage />} />
        <Route path="/register" element={<RegisterPage />} />
        
        <Route 
          path="/dashboard" 
          element={<ProtectedRoute><DashboardPage /></ProtectedRoute>} 
        />
        <Route 
          path="/add" 
          element={<ProtectedRoute><AddDocumentPage /></ProtectedRoute>} 
        />
        <Route 
          path="/archive" 
          element={<ProtectedRoute><ArchiveListPage /></ProtectedRoute>} 
        />
        <Route 
          path="/admin" 
          element={<AdminRoute><AdminDashboardPage /></AdminRoute>} 
        />

        {/* Redirect root to login or dashboard based on auth */}
        <Route 
          path="/" 
          element={
            AuthService.isAuthenticated() ? <Navigate to="/dashboard" replace /> : <Navigate to="/login" replace />
          } 
        />
        {/* Add a 404 Not Found Route if desired */}
        {/* <Route path="*" element={<div>404 Not Found</div>} /> */}
      </Routes>
    </Router>
  );
}

export default App;
