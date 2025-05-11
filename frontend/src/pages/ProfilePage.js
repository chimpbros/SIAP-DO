import React, { useState, useEffect } from 'react';
import AuthService from '../services/authService';

const ProfilePage = () => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  // State for password change form
  const [oldPassword, setOldPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmNewPassword, setConfirmNewPassword] = useState('');
  const [passwordChangeError, setPasswordChangeError] = useState('');
  const [passwordChangeSuccess, setPasswordChangeSuccess] = useState('');
  const [showChangePasswordForm, setShowChangePasswordForm] = useState(false); // State for form visibility

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

  // Submit handler for password change - defined inside the component
  const handlePasswordChangeSubmit = async (e) => {
    e.preventDefault();
    setPasswordChangeError('');
    setPasswordChangeSuccess('');

    if (newPassword !== confirmNewPassword) {
      setPasswordChangeError('Password baru dan konfirmasi password tidak cocok.');
      return;
    }
    if (newPassword.length < 6) { // Example: Basic length validation
      setPasswordChangeError('Password baru minimal 6 karakter.');
      return;
    }

    try {
      // This call will be to AuthService.changePassword once that's defined
      const response = await AuthService.changePassword({ oldPassword, newPassword, confirmNewPassword }); // Pass as an object
      setPasswordChangeSuccess(response.message || 'Password berhasil diubah!');
      setOldPassword('');
      setNewPassword('');
      setConfirmNewPassword('');
      setTimeout(() => setPasswordChangeSuccess(''), 3000);
    } catch (err) {
      setPasswordChangeError(err.response?.data?.message || err.message || 'Gagal mengubah password.');
    }
  };

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
        <div className="mt-6 text-right">
          <button
            onClick={() => {
              setShowChangePasswordForm(true);
              setPasswordChangeError(''); // Clear previous errors when opening
              setPasswordChangeSuccess(''); // Clear previous success messages
            }}
            className="bg-indigo-500 hover:bg-indigo-600 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline"
          >
            Ubah Password
          </button>
        </div>
      </div>

      {/* Change Password Section - Conditionally Rendered */}
      {showChangePasswordForm && (
        <div className="mt-10 bg-white shadow-xl rounded-lg p-6 md:p-8">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-2xl font-bold text-gray-800">Formulir Ubah Password</h2>
            <button 
              onClick={() => setShowChangePasswordForm(false)} 
              className="text-gray-500 hover:text-gray-700 text-2xl font-bold"
              aria-label="Close change password form"
            >
              &times;
            </button>
          </div>
          <form onSubmit={handlePasswordChangeSubmit}>
            {passwordChangeError && <p className="text-red-500 text-sm mb-4 text-center">{passwordChangeError}</p>}
            {passwordChangeSuccess && <p className="text-green-500 text-sm mb-4 text-center">{passwordChangeSuccess}</p>}

            <div className="mb-4">
            <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="oldPassword">
              Password Lama
            </label>
            <input
              type="password"
              id="oldPassword"
              value={oldPassword}
              onChange={(e) => setOldPassword(e.target.value)}
              className="shadow-sm appearance-none rounded-md border border-gray-300 w-full py-2 px-3 text-gray-700 leading-normal focus:outline-none focus:ring-2 focus:ring-sky-500 focus:border-sky-500"
              required
            />
          </div>
          <div className="mb-4">
            <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="newPassword">
              Password Baru
            </label>
            <input
              type="password"
              id="newPassword"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              className="shadow-sm appearance-none rounded-md border border-gray-300 w-full py-2 px-3 text-gray-700 leading-normal focus:outline-none focus:ring-2 focus:ring-sky-500 focus:border-sky-500"
              required
            />
          </div>
          <div className="mb-6">
            <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="confirmNewPassword">
              Konfirmasi Password Baru
            </label>
            <input
              type="password"
              id="confirmNewPassword"
              value={confirmNewPassword}
              onChange={(e) => setConfirmNewPassword(e.target.value)}
              className="shadow-sm appearance-none rounded-md border border-gray-300 w-full py-2 px-3 text-gray-700 leading-normal focus:outline-none focus:ring-2 focus:ring-sky-500 focus:border-sky-500"
              required
            />
          </div>
          <div className="flex items-center justify-end">
            <button
              type="submit"
              className="bg-sky-500 hover:bg-sky-600 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline"
            >
              Ubah Password
            </button>
          </div>
        </form>
      </div>
      )} {/* Closing for showChangePasswordForm conditional rendering */}
    </div>
  );
};

export default ProfilePage;
