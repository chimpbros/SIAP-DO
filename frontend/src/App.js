import React from 'react';
import { BrowserRouter as Router, Route, Routes, Navigate } from 'react-router-dom';
// No App.css import needed
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import DashboardPage from './pages/DashboardPage';
import AddDocumentPage from './pages/AddDocumentPage';
import ArchiveListPage from './pages/ArchiveListPage';
import AdminDashboardPage from './pages/AdminDashboardPage';
import ProfilePage from './pages/ProfilePage'; // Import ProfilePage
// Navbar is now part of MainLayout
import AuthService from './services/authService'; // Import AuthService
import ProtectedRoute from './components/ProtectedRoute'; // Import ProtectedRoute
import AdminRoute from './components/AdminRoute'; // Import AdminRoute
import MainLayout from './components/MainLayout'; // Import MainLayout

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/login" element={<LoginPage />} />
        <Route path="/register" element={<RegisterPage />} />
        
        {/* Routes that use MainLayout (includes Navbar) */}
        <Route element={<ProtectedRoute><MainLayout /></ProtectedRoute>}>
          <Route path="/dashboard" element={<DashboardPage />} />
          <Route path="/add" element={<AddDocumentPage />} />
          <Route path="/archive" element={<ArchiveListPage />} />
          <Route path="/profile" element={<ProfilePage />} /> {/* Add ProfilePage route */}
        </Route>
        
        <Route element={<AdminRoute><MainLayout /></AdminRoute>}>
          <Route path="/admin" element={<AdminDashboardPage />} />
          {/* If admin also needs access to regular user pages via MainLayout, 
              ensure AdminRoute allows this or structure routes differently.
              For now, /admin is distinct. If admin should also see /dashboard, /add, /archive
              through the same layout, ProtectedRoute should handle admin role or AdminRoute
              should wrap those specific routes as well if they have admin-specific variations.
              Current setup: AdminRoute protects /admin. ProtectedRoute protects others.
              If an admin logs in, they can access /dashboard, /add, /archive via ProtectedRoute,
              and /admin via AdminRoute. This seems fine.
          */}
        </Route>

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
