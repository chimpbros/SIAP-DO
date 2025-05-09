import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import Navbar from '../components/Navbar';
// import axios from 'axios';

const AdminDashboardPage = () => {
  const [users, setUsers] = useState([]);
  const [pendingRequests, setPendingRequests] = useState([]);
  // const [loadingUsers, setLoadingUsers] = useState(false);

  const fetchUsers = async () => {
    // setLoadingUsers(true);
    console.log('Fetching users for admin dashboard...');
    // TODO: Implement actual API call to /api/admin/users (or separate endpoints for all users and pending)
    // try {
    //   const token = localStorage.getItem('token');
    //   const config = { headers: { Authorization: \`Bearer ${token}\` } };
    //   const response = await axios.get('/api/admin/users', config); // Assuming this gets all users
    //   const allUsers = response.data.users || response.data; // Adjust based on API response
    //   setUsers(allUsers.filter(u => u.is_approved));
    //   setPendingRequests(allUsers.filter(u => !u.is_approved));
    // } catch (error) {
    //   console.error("Failed to fetch users", error);
    // } finally {
    //   setLoadingUsers(false);
    // }

    // Placeholder data
    setTimeout(() => {
      const mockUsers = [
        { user_id: 'admin1', nama: 'Admin Utama', pangkat: 'ADM', nrp: '000', email: 'admin@example.com', is_approved: true, is_admin: true },
        { user_id: 'user1', nama: 'User Terdaftar', pangkat: 'USR', nrp: '111', email: 'user@example.com', is_approved: true, is_admin: false },
        { user_id: 'pending1', nama: 'User Pending Satu', pangkat: 'PND', nrp: '222', email: 'pending1@example.com', is_approved: false, is_admin: false },
        { user_id: 'pending2', nama: 'User Pending Dua', pangkat: 'PND', nrp: '333', email: 'pending2@example.com', is_approved: false, is_admin: false },
      ];
      setUsers(mockUsers.filter(u => u.is_approved));
      setPendingRequests(mockUsers.filter(u => !u.is_approved));
      // setLoadingUsers(false);
    }, 300);
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  const handleApprove = async (userId) => {
    console.log(`Approving user ${userId}`);
    // TODO: Implement API call to /api/admin/users/:id/approve
    // try {
    //   const token = localStorage.getItem('token');
    //   const config = { headers: { Authorization: \`Bearer ${token}\` } };
    //   await axios.put(\`/api/admin/users/${userId}/approve\`, {}, config);
    //   fetchUsers(); // Refresh list
    // } catch (error) {
    //   console.error("Failed to approve user", error);
    //   alert('Gagal menyetujui pengguna.');
    // }
    alert(`Simulasi: Menyetujui pengguna ${userId}.`);
    fetchUsers(); // Refresh placeholder list
  };

  const handleRevoke = async (userId) => {
    console.log(`Revoking access for user ${userId}`);
    // TODO: Implement API call to /api/admin/users/:id/revoke
    // try {
    //   const token = localStorage.getItem('token');
    //   const config = { headers: { Authorization: \`Bearer ${token}\` } };
    //   await axios.put(\`/api/admin/users/${userId}/revoke\`, {}, config);
    //   fetchUsers(); // Refresh list
    // } catch (error) {
    //   console.error("Failed to revoke user access", error);
    //   alert('Gagal mencabut akses pengguna.');
    // }
    alert(`Simulasi: Mencabut akses pengguna ${userId}.`);
    fetchUsers(); // Refresh placeholder list
  };
  
  const handleToggleAdmin = async (userId, currentIsAdmin) => {
    console.log(`Toggling admin status for user ${userId} to ${!currentIsAdmin}`);
    // TODO: Implement API call to /api/admin/users/:id/role
    // try {
    //   const token = localStorage.getItem('token');
    //   const config = { headers: { Authorization: \`Bearer ${token}\` } };
    //   await axios.put(\`/api/admin/users/${userId}/role\`, { isAdmin: !currentIsAdmin }, config);
    //   fetchUsers(); // Refresh list
    // } catch (error) {
    //   console.error("Failed to toggle admin status", error);
    //   alert('Gagal mengubah status admin pengguna.');
    // }
    alert(`Simulasi: Mengubah status admin untuk ${userId}.`);
    fetchUsers(); // Refresh placeholder list
  };

  const UserTable = ({ title, userList, showAdminToggle = false, showApprovalActions = false }) => (
    <div className="mb-8">
      <h2 className="text-xl font-semibold text-gray-700 mb-3">{title}</h2>
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
                  {showApprovalActions && !user.is_approved && (
                    <button onClick={() => handleApprove(user.user_id)} className="text-green-600 hover:text-green-900">Setujui</button>
                  )}
                  {showApprovalActions && user.is_approved && (
                     <button onClick={() => handleRevoke(user.user_id)} className="text-red-600 hover:text-red-900">Cabut Akses</button>
                  )}
                  {showAdminToggle && user.is_approved && ( // Only allow admin toggle for approved users
                    <button onClick={() => handleToggleAdmin(user.user_id, user.is_admin)} className="text-blue-600 hover:text-blue-900">
                      {user.is_admin ? 'Hapus Admin' : 'Jadikan Admin'}
                    </button>
                  )}
                </td>
              </tr>
            )) : (
              <tr><td colSpan="6" className="px-6 py-4 text-center text-sm text-gray-500">Tidak ada pengguna.</td></tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );

  return (
    <div>
      <Navbar />
      <div className="container mx-auto p-4">
        <h1 className="text-3xl font-bold text-gray-800 mb-6">Admin Dashboard</h1>
        
        <UserTable title="Permintaan Registrasi Tertunda" userList={pendingRequests} showApprovalActions={true} />
        <UserTable title="Daftar Pengguna Terdaftar" userList={users} showAdminToggle={true} showApprovalActions={true} />

        <div className="mt-8">
          <h2 className="text-xl font-semibold text-gray-700 mb-3">Manajemen Arsip</h2>
          <Link to="/archive" className="text-blue-500 hover:text-blue-700 font-medium">
            Lihat & Kelola Semua Arsip Dokumen (termasuk STR) &rarr;
          </Link>
          {/* The ArchiveListPage will handle STR visibility based on admin status */}
        </div>
      </div>
    </div>
  );
};

export default AdminDashboardPage;
