import React, { useState, useEffect } from 'react';
import AuthService from '../services/authService';

const ProfilePage = () => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const currentUser = AuthService.getCurrentUser();
    if (currentUser) {
      setUser(currentUser);
    }
    setLoading(false);
  }, []);

  if (loading) {
    return <p className="text-center text-gray-700">Loading profile...</p>;
  }

  if (!user) {
    return <p className="text-center text-red-500">Could not load user profile. Please try logging in again.</p>;
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold text-gray-800 mb-6">Profil Pengguna</h1>
      <div className="bg-white shadow-xl rounded-lg p-6 md:p-8">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <h2 className="text-xl font-semibold text-gray-700 mb-1">Nama Lengkap:</h2>
            <p className="text-gray-900 text-lg">{user.nama || 'N/A'}</p>
          </div>
          <div>
            <h2 className="text-xl font-semibold text-gray-700 mb-1">Email:</h2>
            <p className="text-gray-900 text-lg">{user.email || 'N/A'}</p>
          </div>
          <div>
            <h2 className="text-xl font-semibold text-gray-700 mb-1">Pangkat:</h2>
            <p className="text-gray-900 text-lg">{user.pangkat || 'N/A'}</p>
          </div>
          <div>
            <h2 className="text-xl font-semibold text-gray-700 mb-1">NRP:</h2>
            <p className="text-gray-900 text-lg">{user.nrp || 'N/A'}</p>
          </div>
          <div>
            <h2 className="text-xl font-semibold text-gray-700 mb-1">Status Akun:</h2>
            <p className={`text-lg ${user.is_approved ? 'text-green-600' : 'text-red-600'}`}>
              {user.is_approved ? 'Disetujui' : 'Menunggu Persetujuan'}
            </p>
          </div>
          <div>
            <h2 className="text-xl font-semibold text-gray-700 mb-1">Peran:</h2>
            <p className={`text-lg font-medium ${user.is_admin ? 'text-sky-600' : 'text-slate-600'}`}>
              {user.is_admin ? 'Administrator' : 'Pengguna Biasa'}
            </p>
          </div>
        </div>
        {/* Add more details or edit functionality here in the future if needed */}
      </div>
    </div>
  );
};

export default ProfilePage;
