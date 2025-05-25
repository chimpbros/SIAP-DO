import React, { useState, useEffect } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import AuthService from '../services/authService';

const TopBar = ({ sidebarIsPinned, toggleMobileMenu }) => { // Added toggleMobileMenu prop
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

  // Calculate left style based on sidebar's pinned state for desktop, 0 for mobile
  const topBarLeftStyle = {
    // On medium screens and up, adjust 'left' based on sidebar. On smaller screens, 'left' is 0.
    left: window.innerWidth >= 768 ? (sidebarIsPinned ? '5rem' : '16rem') : '0px'
  };


  return (
    <div
      className={`fixed top-0 right-0 bg-content-bg h-16 shadow-md flex items-center justify-between z-30 transition-all duration-300 ease-in-out px-4`} // Added px-4 for padding
      style={topBarLeftStyle} // Use dynamic style for left offset
    >
      {/* Left side: Logo and Title */}
      <div className="flex items-center">
        <img src={process.env.PUBLIC_URL + '/polri.png'} alt="Logo Polri" className="h-10 w-auto mr-3" />
        <div className="text-base font-semibold text-text-primary hidden md:block leading-tight">
          <span>Sistem Informasi</span><br /><span>Administrasi Pengarsipan</span>
        </div>
      </div>

      {/* Right side: Hamburger Menu for Mobile */}
      <div className="md:hidden"> {/* Hidden on medium screens and up */}
        <button
          onClick={toggleMobileMenu}
          className="text-text-primary hover:text-primary focus:outline-none"
          aria-label="Toggle menu"
        >
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 12h16m-7 6h7"></path>
          </svg>
        </button>
      </div>
    </div>
  );
};

export default TopBar;