import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
// Navbar is now in MainLayout
import StatsService from '../services/statsService';
import AuthService from '../services/authService';
import { Bar } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
} from 'chart.js';

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend
);

const DashboardPage = () => {
  const [docCountThisMonth, setDocCountThisMonth] = useState(0);
  const [monthlyStats, setMonthlyStats] = useState([]); // For chart
  const [userName, setUserName] = useState('');

  useEffect(() => {
    const user = AuthService.getCurrentUser();
    if (user && user.nama) {
      setUserName(user.nama);
    }

    const fetchDashboardData = async () => {
      try {
        const countData = await StatsService.getCountDocumentsThisMonth();
        setDocCountThisMonth(countData.count);
        
        const monthlyData = await StatsService.getMonthlyUploadStats();
        // Ensure count is a number for the chart
        const formattedMonthlyStats = monthlyData.stats.map(s => ({
            ...s,
            count: parseInt(s.count, 10) 
        }));
        setMonthlyStats(formattedMonthlyStats);
      } catch (error) {
        console.error("Failed to fetch dashboard data", error);
        alert(error.message || "Gagal memuat data dashboard.");
      }
    };

    if (AuthService.isAuthenticated()) { // Only fetch if authenticated
        fetchDashboardData();
    }
  }, []);

  return (
    // Navbar removed, padding is now handled by MainLayout's <main> tag
    <> 
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
            {monthlyStats.length > 0 ? (
              <Bar 
                data={{
                  labels: monthlyStats.map(s => s.month_year),
                  datasets: [
                    {
                      label: 'Jumlah Dokumen Diupload',
                      data: monthlyStats.map(s => s.count),
                      backgroundColor: 'rgba(54, 162, 235, 0.6)',
                      borderColor: 'rgba(54, 162, 235, 1)',
                      borderWidth: 1,
                    },
                  ],
                }}
                options={{
                  responsive: true,
                  maintainAspectRatio: false,
                  plugins: {
                    legend: {
                      position: 'top',
                    },
                    title: {
                      display: true,
                      text: 'Grafik Upload Dokumen per Bulan (12 Bulan Terakhir)',
                    },
                  },
                  scales: {
                    y: {
                      beginAtZero: true,
                      ticks: {
                        stepSize: 1, // Ensure y-axis shows whole numbers for counts
                      }
                    }
                  }
                }} 
              />
            ) : (
              <p className="text-gray-500">Data statistik bulanan tidak tersedia atau sedang dimuat...</p>
            )}
          </div>
        </div>
      {/* Removed redundant closing div, container is in MainLayout */}
    </>
  );
};

export default DashboardPage;
