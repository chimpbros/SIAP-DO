import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import Navbar from '../components/Navbar'; // We'll create this soon
// import axios from 'axios'; // For API calls

const DashboardPage = () => {
  const [docCountThisMonth, setDocCountThisMonth] = useState(0);
  const [monthlyStats, setMonthlyStats] = useState([]); // For chart
  const [userName, setUserName] = useState('');

  useEffect(() => {
    // Fetch user info
    const user = JSON.parse(localStorage.getItem('user'));
    if (user && user.nama) {
      setUserName(user.nama);
    }

    // TODO: Fetch actual dashboard data from backend
    // Example:
    // const fetchDashboardData = async () => {
    //   try {
    //     const token = localStorage.getItem('token');
    //     const config = { headers: { Authorization: \`Bearer ${token}\` } };
    //     const countRes = await axios.get('/api/stats/docs/count-current-month', config);
    //     setDocCountThisMonth(countRes.data.count);
    //     const monthlyRes = await axios.get('/api/stats/docs/monthly-uploads', config);
    //     setMonthlyStats(monthlyRes.data.stats); // Assuming format [{ month: 'YYYY-MM', count: X }]
    //   } catch (error) {
    //     console.error("Failed to fetch dashboard data", error);
    //   }
    // };
    // fetchDashboardData();

    // Placeholder data
    setDocCountThisMonth(25); // Placeholder
    setMonthlyStats([ // Placeholder for chart
      { month: '2025-01', count: 10 },
      { month: '2025-02', count: 15 },
      { month: '2025-03', count: 20 },
      { month: '2025-04', count: 12 },
      { month: '2025-05', count: 25 },
    ]);
  }, []);

  return (
    <div>
      <Navbar />
      <div className="container mx-auto p-4">
        <h1 className="text-3xl font-bold text-gray-800 mb-6">Dashboard</h1>
        <p className="text-lg text-gray-600 mb-8">Selamat datang kembali, {userName || 'Pengguna'}!</p>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
          {/* Card for Documents This Month */}
          <div className="bg-white p-6 rounded-lg shadow-lg">
            <h2 className="text-xl font-semibold text-gray-700 mb-2">Dokumen Bulan Ini</h2>
            <p className="text-4xl font-bold text-blue-500">{docCountThisMonth}</p>
            <p className="text-gray-500">dokumen telah diarsipkan bulan ini.</p>
          </div>

          {/* Card for Add New Document Button */}
          <div className="bg-white p-6 rounded-lg shadow-lg flex flex-col items-center justify-center">
            <h2 className="text-xl font-semibold text-gray-700 mb-4">Aksi Cepat</h2>
            <Link
              to="/add"
              className="bg-green-500 hover:bg-green-700 text-white font-bold py-3 px-6 rounded-lg text-lg shadow-md transition duration-150 ease-in-out"
            >
              Tambah Dokumen Baru
            </Link>
          </div>
        </div>

        {/* Section for Monthly Upload Statistics Chart */}
        <div className="bg-white p-6 rounded-lg shadow-lg">
          <h2 className="text-xl font-semibold text-gray-700 mb-4">Statistik Upload Bulanan</h2>
          <div className="h-64 bg-gray-200 flex items-center justify-center rounded">
            {/* Placeholder for chart - e.g., using Chart.js */}
            <p className="text-gray-500">
              [Chart akan ditampilkan di sini menampilkan data: 
              {monthlyStats.map(s => `(${s.month}: ${s.count})`).join(', ')}]
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DashboardPage;
