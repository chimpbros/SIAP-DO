import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
// Navbar is now in MainLayout
import AdminService from '../services/adminService';

const AdminDashboardPage = () => {
  const [users, setUsers] = useState([]); // Approved users
  const [pendingRequests, setPendingRequests] = useState([]); // Not yet approved users
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const fetchAllUsers = async () => {
    setLoading(true);
    setError('');
    try {
      const allUsers = await AdminService.listUsers();
      setUsers(allUsers.filter(u => u.is_approved));
      setPendingRequests(allUsers.filter(u => !u.is_approved));
    } catch (err) {
      console.error("Failed to fetch users", err);
      setError(err.message || 'Gagal memuat daftar pengguna.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAllUsers();
  }, []);

  const handleApprove = async (userId) => {
    setError('');
    try {
      await AdminService.approveUser(userId);
      alert('Pengguna berhasil disetujui.');
      fetchAllUsers(); // Refresh list
    } catch (err) {
      console.error("Failed to approve user", err);
      alert(err.message || 'Gagal menyetujui pengguna.');
    }
  };

  const handleRevoke = async (userId) => {
    setError('');
    // Optional: Add confirmation dialog
    if (window.confirm('Apakah Anda yakin ingin mencabut akses pengguna ini?')) {
      try {
        await AdminService.revokeUserAccess(userId);
        alert('Akses pengguna berhasil dicabut.');
        fetchAllUsers(); // Refresh list
      } catch (err) {
        console.error("Failed to revoke user access", err);
        alert(err.message || 'Gagal mencabut akses pengguna.');
      }
    }
  };
  
  const handleToggleAdmin = async (userId, currentIsAdmin) => {
    setError('');
    const action = currentIsAdmin ? 'menghapus status admin dari' : 'menjadikan';
    if (window.confirm(`Apakah Anda yakin ingin ${action} pengguna ini sebagai admin?`)) {
      try {
        await AdminService.setUserAdminStatus(userId, !currentIsAdmin);
        alert(`Status admin pengguna berhasil diubah.`);
        fetchAllUsers(); // Refresh list
      } catch (err) {
        console.error("Failed to toggle admin status", err);
        alert(err.message || 'Gagal mengubah status admin pengguna.');
      }
    }
  };

  const UserTable = ({ title, userList, showAdminToggle = false, showApprovalActions = false, isPendingTable = false }) => (
    <div className="mb-8">
      <h2 className="text-xl font-semibold text-gray-700 mb-3">{title}</h2>
      {loading && isPendingTable && <p>Memuat permintaan...</p>}
      {loading && !isPendingTable && <p>Memuat pengguna...</p>}
      {!loading && error && <p className="text-red-500">{error}</p>}
      {!loading && !error && (
        <div className="bg-white shadow-md rounded-lg overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                {['Nama', 'Pangkat', 'NRP', 'Email', 'Status Admin', 'Aksi'].map(h => <th key={h} className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">{h}</th>)}
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {userList.length > 0 ? userList.map(user => (
                <tr key={user.user_id}>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{user.nama}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{user.pangkat}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{user.nrp}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{user.email}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{user.is_admin ? 'Admin' : 'User'}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium space-x-2">
                    {isPendingTable && ( // Only show Approve for pending table
                      <button onClick={() => handleApprove(user.user_id)} className="text-green-600 hover:text-green-900">Setujui</button>
                    )}
                    {!isPendingTable && user.is_approved && ( // Show Revoke and Admin toggle for approved users table
                       <>
                        <button onClick={() => handleRevoke(user.user_id)} className="text-red-600 hover:text-red-900">Cabut Akses</button>
                        <button onClick={() => handleToggleAdmin(user.user_id, user.is_admin)} className="text-blue-600 hover:text-blue-900">
                          {user.is_admin ? 'Hapus Admin' : 'Jadikan Admin'}
                        </button>
                       </>
                    )}
                  </td>
                </tr>
              )) : (
                <tr><td colSpan="6" className="px-6 py-4 text-center text-sm text-gray-500">Tidak ada pengguna dalam kategori ini.</td></tr>
              )}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );

  return (
    // Navbar removed, container and padding are now handled by MainLayout's <main> tag
    <>
      <h1 className="text-3xl font-bold text-gray-800 mb-6">Admin Dashboard</h1>
        
        <UserTable title="Permintaan Registrasi Tertunda" userList={pendingRequests} isPendingTable={true} />
        <UserTable title="Daftar Pengguna Terdaftar" userList={users} showAdminToggle={true} />

        <div className="mt-8">
          <h2 className="text-xl font-semibold text-gray-700 mb-3">Manajemen Arsip</h2>
          <Link to="/archive" className="text-blue-500 hover:text-blue-700 font-medium">
            Lihat & Kelola Semua Arsip Dokumen (termasuk STR) &rarr;
          </Link>
          {/* The ArchiveListPage will handle STR visibility based on admin status */}
        </div>
      {/* Removed redundant closing div for container */}
    </>
  );
};

export default AdminDashboardPage;
