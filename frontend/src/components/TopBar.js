import React, { useState, useEffect } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import AuthService from '../services/authService';

const TopBar = ({ sidebarIsPinned }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [user, setUser] = useState(null);
  const location = useLocation();
  const navigate = useNavigate();

  useEffect(() => {
    const currentUser = AuthService.getCurrentUser();
    setUser(currentUser);
  }, []);

  const handleSearch = (e) => {
    e.preventDefault();
    if (searchTerm.trim()) {
      // Navigate to archive list with search term
      // This assumes your archive list page can handle a search query parameter
      navigate(`/archive?search=${encodeURIComponent(searchTerm.trim())}`);
    }
  };

  const showTopBar = !['/login', '/register'].includes(location.pathname);

  if (!showTopBar || !user) {
    return null; // Don't render top bar on login/register pages or if no user
  }

  // Calculate left margin based on sidebar's pinned state
  const marginLeftClass = sidebarIsPinned ? 'ml-20' : 'ml-64';

  return (
    <div className={`fixed top-0 right-0 bg-content-bg h-16 shadow-md flex items-center justify-between z-30 transition-all duration-300 ease-in-out`} style={{ left: sidebarIsPinned ? '5rem' : '16rem' }}> {/* Use style for dynamic left offset */}
      <div className="flex items-center">
        {/* The logo is now part of the TopBar itself, not dependent on sidebar state for visibility here */}
        <img src={process.env.PUBLIC_URL + '/polri.png'} alt="Logo Polri" className="h-10 w-auto mr-3" />
        <div className="text-base font-semibold text-text-primary hidden md:block leading-tight">
          <span>Sistem Informasi</span><br /><span>Administrasi Pengarsipan</span>
        </div>
      </div>

    </div>
  );
};

export default TopBar;