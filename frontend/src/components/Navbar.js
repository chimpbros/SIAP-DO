import React, { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';

const Navbar = () => {
  const [user, setUser] = useState(null);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
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
              <span className="text-sm text-slate-300">
                {user.nama} ({user.pangkat} - {user.nrp}) 
                <span className={`ml-1 px-2 py-0.5 rounded-full text-xs ${user.is_admin ? 'bg-sky-500 text-white' : 'bg-slate-500 text-slate-100'}`}>
                  {user.is_admin ? 'Admin' : 'User'}
                </span>
              </span>
              <Link to="/dashboard" className="px-3 py-2 rounded-md text-sm font-medium hover:bg-slate-600 transition-colors">Dashboard</Link>
              <Link to="/archive" className="px-3 py-2 rounded-md text-sm font-medium hover:bg-slate-600 transition-colors">Daftar Arsip</Link>
              <Link to="/add" className="px-3 py-2 rounded-md text-sm font-medium hover:bg-slate-600 transition-colors">Tambah Dokumen</Link>
              {user.is_admin && (
                <Link to="/admin" className="px-3 py-2 rounded-md text-sm font-medium hover:bg-slate-600 transition-colors">Admin</Link>
              )}
              <button 
                onClick={handleLogout} 
                className="bg-rose-500 hover:bg-rose-600 text-white font-medium py-2 px-3 rounded-md text-sm transition-colors"
              >
                Logout
              </button>
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
                <span className="px-3 py-2 text-sm text-slate-300 w-full text-left">
                  {user.nama} ({user.pangkat} - {user.nrp})
                  <span className={`ml-1 px-2 py-0.5 rounded-full text-xs ${user.is_admin ? 'bg-sky-500 text-white' : 'bg-slate-500 text-slate-100'}`}>
                    {user.is_admin ? 'Admin' : 'User'}
                  </span>
                </span>
                <Link to="/dashboard" onClick={() => setIsMobileMenuOpen(false)} className="block px-3 py-2 rounded-md text-base font-medium hover:bg-slate-600 transition-colors w-full text-left">Dashboard</Link>
                <Link to="/archive" onClick={() => setIsMobileMenuOpen(false)} className="block px-3 py-2 rounded-md text-base font-medium hover:bg-slate-600 transition-colors w-full text-left">Daftar Arsip</Link>
                <Link to="/add" onClick={() => setIsMobileMenuOpen(false)} className="block px-3 py-2 rounded-md text-base font-medium hover:bg-slate-600 transition-colors w-full text-left">Tambah Dokumen</Link>
                {user.is_admin && (
                  <Link to="/admin" onClick={() => setIsMobileMenuOpen(false)} className="block px-3 py-2 rounded-md text-base font-medium hover:bg-slate-600 transition-colors w-full text-left">Admin</Link>
                )}
                <button 
                  onClick={() => { handleLogout(); setIsMobileMenuOpen(false); }}
                  className="bg-rose-500 hover:bg-rose-600 text-white font-medium py-2 px-3 rounded-md text-base transition-colors w-full text-left"
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
