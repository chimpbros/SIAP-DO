import React from 'react';
import { BrowserRouter as Router, Route, Routes, Navigate } from 'react-router-dom';
// No App.css import needed
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import DashboardPage from './pages/DashboardPage';
import AddDocumentPage from './pages/AddDocumentPage';
import ArchiveListPage from './pages/ArchiveListPage';
import AdminDashboardPage from './pages/AdminDashboardPage';
import Navbar from './components/Navbar'; // We'll create this
// import ProtectedRoute from './components/ProtectedRoute'; // We'll create this

// Dummy components for now, to be replaced
// const Navbar = () => <div>Navbar Placeholder</div>;
const ProtectedRoute = ({ children }) => {
  // Placeholder logic - replace with actual auth check
  const isAuthenticated = !!localStorage.getItem('token'); // Example: check for token
  const user = JSON.parse(localStorage.getItem('user')); // Example: get user info

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }
  // Add approval check if necessary for most routes
  // if (!user || !user.is_approved) {
  //   // Optional: redirect to a specific page or show a message
  //   // For now, let login handle the "not approved" message.
  //   // If they somehow get a token without approval, this would be a fallback.
  //   return <Navigate to="/login" replace />;
  // }
  return children;
};

const AdminRoute = ({ children }) => {
  // Placeholder logic - replace with actual auth and admin check
  const isAuthenticated = !!localStorage.getItem('token');
  const user = JSON.parse(localStorage.getItem('user'));

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }
  if (!user || !user.is_admin) {
    return <Navigate to="/dashboard" replace />; // Or a "not authorized" page
  }
  return children;
};


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
            localStorage.getItem('token') ? <Navigate to="/dashboard" replace /> : <Navigate to="/login" replace />
          } 
        />
        {/* Add a 404 Not Found Route if desired */}
        {/* <Route path="*" element={<div>404 Not Found</div>} /> */}
      </Routes>
    </Router>
  );
}

export default App;
