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
    <div className={`fixed top-0 right-0 bg-content-bg h-16 shadow-md flex items-center justify-between px-6 z-30 ${marginLeftClass} transition-all duration-300 ease-in-out`} style={{ left: sidebarIsPinned ? '5rem' : '16rem' }}> {/* Use style for dynamic left offset */}
      <div className="flex items-center">
        {/* The logo is now part of the TopBar itself, not dependent on sidebar state for visibility here */}
        <img src={process.env.PUBLIC_URL + '/polri.png'} alt="Logo Polri" className="h-10 w-auto mr-3" />
        <h1 className="text-xl font-semibold text-text-primary hidden md:block">
          Sistem Informasi Administrasi Pengarsipan
        </h1>
      </div>

      <div className="flex items-center">
        <form onSubmit={handleSearch} className="relative">
          <input
            type="text"
            placeholder="Search..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="py-2 px-4 rounded-md border border-border-color focus:ring-2 focus:ring-primary focus:border-primary transition-all text-sm w-64"
          />
          <button type="submit" className="absolute right-0 top-0 mt-1 mr-1 bg-primary text-white p-2 rounded-md hover:bg-primary-dark transition-colors">
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5">
              <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 5.196a7.5 7.5 0 0010.607 10.607z" />
            </svg>
          </button>
        </form>
        {/* User profile icon/dropdown could go here if needed in top bar */}
      </div>
    </div>
  );
};

export default TopBar;