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
      </div>

      {/* Change Password Section */}
      <div className="mt-10 bg-white shadow-xl rounded-lg p-6 md:p-8">
        <h2 className="text-2xl font-bold text-gray-800 mb-6">Ubah Password</h2>
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
              className="input-field-profile" // Using a common style, ensure it's defined or use Tailwind
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
              className="input-field-profile"
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
              className="input-field-profile"
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
      {/* Basic styling for input fields, can be moved to a global CSS or enhanced with Tailwind */}
      <style>{`
        .input-field-profile {
          appearance: none;
          border-radius: 0.375rem; /* rounded-md */
          border-width: 1px;
          border-color: #D1D5DB; /* gray-300 */
          width: 100%;
          padding: 0.75rem 1rem; /* py-3 px-4 */
          color: #374151; /* gray-700 */
          line-height: 1.5;
          box-shadow: 0 1px 2px 0 rgba(0, 0, 0, 0.05);
        }
        .input-field-profile:focus {
          outline: none;
          border-color: #3B82F6; /* blue-500 */
          box-shadow: 0 0 0 0.2rem rgba(59, 130, 246, 0.25); /* focus:ring-blue-500 focus:border-blue-500 like */
        }
      `}</style>
    </div>
  );
};

export default ProfilePage;
