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
    <nav className="bg-gray-800 text-white p-4 shadow-lg">
      <div className="container mx-auto flex justify-between items-center">
        <Link to="/dashboard" className="text-xl font-bold hover:text-gray-300">
          SIAP (Sistem Informasi Administrasi dan Pengarsipan)
        </Link>
        <div className="space-x-4 flex items-center">
          {user && (
            <>
              <span className="text-sm">
                {user.nama} ({user.pangkat} - {user.nrp}) {user.is_admin ? '[Admin]' : '[User]'}
              </span>
              <Link to="/dashboard" className="hover:text-gray-300">Dashboard</Link>
              <Link to="/archive" className="hover:text-gray-300">Daftar Arsip</Link>
              <Link to="/add" className="hover:text-gray-300">Tambah Dokumen</Link>
              {user.is_admin && (
                <Link to="/admin" className="hover:text-gray-300">Admin Dashboard</Link>
              )}
              <button 
                onClick={handleLogout} 
                className="bg-red-500 hover:bg-red-700 text-white font-bold py-2 px-3 rounded text-sm"
              >
                Logout
              </button>
            </>
          )}
          {!user && (
            <>
              <Link to="/login" className="hover:text-gray-300">Login</Link>
              <Link to="/register" className="hover:text-gray-300">Register</Link>
            </>
          )}
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
