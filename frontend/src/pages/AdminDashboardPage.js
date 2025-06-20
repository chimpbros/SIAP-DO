import React, { useState, useEffect, useRef } from 'react';
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

  const handleDeleteUser = async (userId, userName) => {
    setError('');
    if (window.confirm(`Apakah Anda yakin ingin menghapus permintaan registrasi untuk ${userName}? Tindakan ini tidak dapat diurungkan.`)) {
      try {
        await AdminService.deleteUser(userId);
        alert(`Permintaan registrasi untuk ${userName} berhasil dihapus.`);
        fetchAllUsers(); // Refresh list
      } catch (err) {
        console.error("Failed to delete user registration", err);
        alert(err.message || 'Gagal menghapus permintaan registrasi pengguna.');
      }
    }
  };

  const UserTable = ({ title, userList, showAdminToggle = false, showApprovalActions = false, isPendingTable = false }) => {
    // const tableContainerRef = useRef(null); // Logging removed

    // useEffect(() => { // Logging removed
    //   const logTableWidths = () => {
    //     if (tableContainerRef.current) {
    //       console.log(`AdminDashboardPage UserTable (${title}) container: offsetWidth=${tableContainerRef.current.offsetWidth}, scrollWidth=${tableContainerRef.current.scrollWidth}`);
    //     }
    //   };
    //   logTableWidths();
    //   if (userList.length > 0) {
    //     logTableWidths();
    //   }
    //   window.addEventListener('resize', logTableWidths);
    //   return () => {
    //     window.removeEventListener('resize', logTableWidths);
    //   };
    // }, [userList, title]);

    return (
    <div className="mb-8">
      <h2 className="text-xl font-semibold text-gray-700 mb-3">{title}</h2>
      {loading && isPendingTable && <p>Memuat permintaan...</p>}
      {loading && !isPendingTable && <p>Memuat pengguna...</p>}
      {!loading && error && <p className="text-red-500">{error}</p>}
      {!loading && !error && (
        <div /* ref={tableContainerRef} // Logging removed */ className="bg-white shadow-md rounded-lg overflow-x-auto w-full"> {/* Added w-full */}
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Nama</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Pangkat</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">NRP</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Email</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status Admin</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Aksi</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {userList.length > 0 ? userList.map(user => (
                <tr key={user.user_id}>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 max-w-xs truncate" title={user.nama}>{user.nama}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{user.pangkat}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{user.nrp}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 max-w-xs truncate" title={user.email}>{user.email}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{user.is_admin ? 'Admin' : 'User'}</td>
                  <td className="px-6 py-4 text-sm font-medium"> {/* Removed whitespace-nowrap and space-x-2 */}
                    <div className="flex flex-col space-y-1 sm:flex-row sm:space-y-0 sm:space-x-2 items-start sm:items-center">
                      {isPendingTable && (
                        <>
                          <button onClick={() => handleApprove(user.user_id)} className="text-green-600 hover:text-green-900">Setujui</button>
                          <button onClick={() => handleDeleteUser(user.user_id, user.nama)} className="text-red-600 hover:text-red-900 sm:ml-2">Hapus</button> {/* sm:ml-2 for horizontal */}
                        </>
                      )}
                      {!isPendingTable && user.is_approved && (
                         <>
                          <button onClick={() => handleRevoke(user.user_id)} className="text-red-600 hover:text-red-900">Cabut Akses</button>
                          <button onClick={() => handleToggleAdmin(user.user_id, user.is_admin)} className="text-blue-600 hover:text-blue-900">
                            {user.is_admin ? 'Hapus Admin' : 'Jadikan Admin'}
                          </button>
                         </>
                      )}
                    </div>
                  </td>
                </tr>
              )) : (
                <tr><td colSpan="3" className="px-6 py-4 text-center text-sm text-gray-500 sm:colSpan-4 md:colSpan-6">Tidak ada pengguna dalam kategori ini.</td></tr>
              )}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

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
