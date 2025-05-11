import React, { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';

const Navbar = () => {
  const [user, setUser] = useState(null);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isProfileDropdownOpen, setIsProfileDropdownOpen] = useState(false); // New state for profile dropdown
  const navigate = useNavigate();

  useEffect(() => {
    const storedUser = localStorage.getItem('user');
    if (storedUser) {
      setUser(JSON.parse(storedUser));
    }
  }, []);

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    setUser(null);
    navigate('/login');
  };

  return (
    <nav className="bg-slate-700 text-slate-100 p-4 shadow-md sticky top-0 z-50">
      <div className="container mx-auto flex justify-between items-center">
        <Link to="/dashboard" className="text-2xl font-semibold hover:text-slate-300 transition-colors">
          SIAP
        </Link>

        {/* Mobile Menu Button */}
        <div className="md:hidden">
          <button onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)} className="text-slate-100 hover:text-slate-300 focus:outline-none">
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
              {isMobileMenuOpen ? (
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path>
              ) : (
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 12h16m-7 6h7"></path>
              )}
            </svg>
          </button>
        </div>

        {/* Desktop Menu */}
        <div className="hidden md:flex space-x-3 md:space-x-4 items-center">
          {user && (
            <>
              {/* Main Navigation Links */}
              <Link to="/dashboard" className="px-3 py-2 rounded-md text-sm font-medium hover:bg-slate-600 transition-colors">Dashboard</Link>
              <Link to="/archive" className="px-3 py-2 rounded-md text-sm font-medium hover:bg-slate-600 transition-colors">Daftar Arsip</Link>
              <Link to="/add" className="px-3 py-2 rounded-md text-sm font-medium hover:bg-slate-600 transition-colors">Tambah Dokumen</Link>
              {user.is_admin && (
                <Link to="/admin" className="px-3 py-2 rounded-md text-sm font-medium hover:bg-slate-600 transition-colors">Admin</Link>
              )}

              {/* Profile Dropdown */}
              <div className="relative">
                <button 
                  onClick={() => setIsProfileDropdownOpen(!isProfileDropdownOpen)}
                  className="flex items-center space-x-2 text-sm text-slate-100 hover:text-slate-300 focus:outline-none p-2 rounded-md hover:bg-slate-600"
                >
                  {/* Avatar Icon (simple one for now) */}
                  <svg className="w-8 h-8 text-slate-400" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" clipRule="evenodd"></path>
                  </svg>
                  <span>{user.nama || 'User'}</span>
                  {/* Dropdown Arrow */}
                  <svg className={`w-4 h-4 transition-transform duration-200 ${isProfileDropdownOpen ? 'transform rotate-180' : ''}`} fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clipRule="evenodd"></path>
                  </svg>
                </button>
                {isProfileDropdownOpen && (
                  <div 
                    onMouseLeave={() => setIsProfileDropdownOpen(false)} // Optional: close on mouse leave
                    className="absolute right-0 mt-2 w-56 bg-white rounded-md shadow-lg py-1 z-50 text-slate-700 ring-1 ring-black ring-opacity-5">
                    <div className="px-4 py-3">
                      <p className="text-sm">Welcome !</p>
                      <p className="text-sm font-medium truncate">{user.email}</p>
                    </div>
                    <Link 
                      to="/profile" 
                      onClick={() => setIsProfileDropdownOpen(false)}
                      className="block px-4 py-2 text-sm hover:bg-slate-100"
                    >
                      My Account
                    </Link>
                    <button 
                      onClick={() => { handleLogout(); setIsProfileDropdownOpen(false); }}
                      className="block w-full text-left px-4 py-2 text-sm hover:bg-slate-100 text-rose-600"
                    >
                      Logout
                    </button>
                  </div>
                )}
              </div>
            </>
          )}
          {!user && (
            <>
              <Link to="/login" className="px-3 py-2 rounded-md text-sm font-medium hover:bg-slate-600 transition-colors">Login</Link>
              <Link to="/register" className="px-3 py-2 rounded-md text-sm font-medium hover:bg-slate-600 transition-colors">Register</Link>
            </>
          )}
        </div>
      </div>

      {/* Mobile Menu */}
      {isMobileMenuOpen && (
        <div className="md:hidden mt-3">
          <div className="flex flex-col space-y-2 items-start">
            {user && (
              <>
                {/* Mobile menu: User Info, then links, then Profile, then Logout */}
                <div className="px-3 py-2">
                  <p className="text-sm font-medium text-slate-100">{user.nama}</p>
                  <p className="text-xs text-slate-300">{user.email}</p>
                  <p className={`mt-1 px-2 py-0.5 rounded-full text-xs inline-block ${user.is_admin ? 'bg-sky-500 text-white' : 'bg-slate-500 text-slate-100'}`}>
                    {user.is_admin ? 'Admin' : 'User'}
                  </p>
                </div>
                <Link to="/dashboard" onClick={() => setIsMobileMenuOpen(false)} className="block px-3 py-2 rounded-md text-base font-medium hover:bg-slate-600 transition-colors w-full text-left">Dashboard</Link>
                <Link to="/archive" onClick={() => setIsMobileMenuOpen(false)} className="block px-3 py-2 rounded-md text-base font-medium hover:bg-slate-600 transition-colors w-full text-left">Daftar Arsip</Link>
                <Link to="/add" onClick={() => setIsMobileMenuOpen(false)} className="block px-3 py-2 rounded-md text-base font-medium hover:bg-slate-600 transition-colors w-full text-left">Tambah Dokumen</Link>
                {user.is_admin && (
                  <Link to="/admin" onClick={() => setIsMobileMenuOpen(false)} className="block px-3 py-2 rounded-md text-base font-medium hover:bg-slate-600 transition-colors w-full text-left">Admin</Link>
                )}
                <Link to="/profile" onClick={() => setIsMobileMenuOpen(false)} className="block px-3 py-2 rounded-md text-base font-medium hover:bg-slate-600 transition-colors w-full text-left">My Account</Link>
                <button 
                  onClick={() => { handleLogout(); setIsMobileMenuOpen(false); }}
                  className="block w-full text-left px-3 py-2 rounded-md text-base font-medium hover:bg-slate-600 transition-colors text-rose-400"
                >
                  Logout
                </button>
              </>
            )}
            {!user && (
              <>
                <Link to="/login" onClick={() => setIsMobileMenuOpen(false)} className="block px-3 py-2 rounded-md text-base font-medium hover:bg-slate-600 transition-colors w-full text-left">Login</Link>
                <Link to="/register" onClick={() => setIsMobileMenuOpen(false)} className="block px-3 py-2 rounded-md text-base font-medium hover:bg-slate-600 transition-colors w-full text-left">Register</Link>
              </>
            )}
          </div>
        </div>
      )}
    </nav>
  );
};

export default Navbar;
