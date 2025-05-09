import React, { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';

const Navbar = () => {
  const [user, setUser] = useState(null);
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
        <div className="space-x-3 md:space-x-4 flex items-center">
          {user && (
            <>
              <span className="hidden md:inline text-sm text-slate-300">
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
          {!user && ( // Should not typically be visible if MainLayout is used for authenticated routes
            <>
              <Link to="/login" className="px-3 py-2 rounded-md text-sm font-medium hover:bg-slate-600 transition-colors">Login</Link>
              <Link to="/register" className="px-3 py-2 rounded-md text-sm font-medium hover:bg-slate-600 transition-colors">Register</Link>
            </>
          )}
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
