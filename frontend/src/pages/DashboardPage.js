import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import StatsService from '../services/statsService';
import DocumentService from '../services/documentService'; // Added DocumentService
import AuthService from '../services/authService';
import { Line } from 'react-chartjs-2'; // Changed from Bar to Line
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement, // Added for Line chart
  LineElement,  // Added for Line chart
  Title,
  Tooltip,
  Legend,
  Filler, // Import Filler plugin
} from 'chart.js';

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement, // Added for Line chart
  LineElement,  // Added for Line chart
  Title,
  Tooltip,
  Legend,
  Filler // Register Filler plugin
);

const DashboardPage = () => {
  const [docCountThisMonth, setDocCountThisMonth] = useState(0);
  const [totalDocuments, setTotalDocuments] = useState(0);
  const [suratMasukCount, setSuratMasukCount] = useState(0);
  const [suratKeluarCount, setSuratKeluarCount] = useState(0);
  const [monthlyStats, setMonthlyStats] = useState([]); // For chart
  const [yearlyStats, setYearlyStats] = useState([]); // New state for yearly stats
  const [userName, setUserName] = useState('');
  const [loadingStats, setLoadingStats] = useState(true);
  const [recentDocuments, setRecentDocuments] = useState([]);
  const [loadingRecentDocs, setLoadingRecentDocs] = useState(true);

  useEffect(() => {
    const user = AuthService.getCurrentUser();
    if (user && user.nama) {
      setUserName(user.nama);
    }

    const fetchDashboardData = async () => {
      try {
        setLoadingStats(true);
        setLoadingRecentDocs(true);

        const overallStats = await StatsService.getDashboardSummaryStats();
        setDocCountThisMonth(overallStats.countThisMonth || 0);
        setTotalDocuments(overallStats.totalDocuments || 0);
        setSuratMasukCount(overallStats.suratMasukCount || 0);
        setSuratKeluarCount(overallStats.suratKeluarCount || 0);
        setLoadingStats(false);

        const monthlyData = await StatsService.getMonthlyUploadStats();
        const formattedMonthlyStats = monthlyData.stats.map(s => ({
            ...s,
            count: parseInt(s.count, 10)
        }));
        setMonthlyStats(formattedMonthlyStats);

        // Fetch yearly stats
        const yearlyData = await StatsService.getYearlyUploadStats();
        const formattedYearlyStats = yearlyData.stats.map(s => ({
            ...s,
            count: parseInt(s.count, 10)
        }));
        setYearlyStats(formattedYearlyStats);

        const recentDocsData = await DocumentService.getRecentDocuments({ limit: 10 });
        setRecentDocuments(recentDocsData.documents || []);
        setLoadingRecentDocs(false);

      } catch (error) {
        console.error("Failed to fetch dashboard data", error);
        alert(error.message || "Gagal memuat data dashboard.");
        setLoadingStats(false);
        setLoadingRecentDocs(false);
      }
    };

    if (AuthService.isAuthenticated()) {
        fetchDashboardData();
    }
  }, []);

  const StatCard = ({ title, value, iconSrc, bgColorClass = 'bg-content-bg', wrapperClass = '' }) => (
    <div className={`${wrapperClass}`}> {/* Wrapper div for responsive classes */}
      <div className={`${bgColorClass} p-6 rounded-xl shadow-lg flex items-center space-x-4 h-full`}> {/* Added h-full for consistent height if wrapped */}
        <div className="flex-shrink-0">
          <img src={process.env.PUBLIC_URL + iconSrc} alt={title} className="h-12 w-12" />
        </div>
        <div>
          <p className="text-sm text-text-secondary font-medium">{title}</p>
          <p className="text-3xl font-bold text-text-primary">{loadingStats ? '...' : value}</p>
        </div>
      </div>
    </div>
  );

  return (
    <>
      <h1 className="text-2xl font-semibold text-text-primary mb-6">Dashboard</h1>

      {/* Stats Cards Grid */}
      {/* Adjusted grid to be 1 column on mobile, 2 on md, 4 on lg. Total Surat always visible. */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <StatCard title="Total Surat" value={totalDocuments} iconSrc="/messageRed.png" />
        <StatCard title="Surat Masuk" value={suratMasukCount} iconSrc="/messageblue.png" wrapperClass="hidden md:block" />
        <StatCard title="Surat Keluar" value={suratKeluarCount} iconSrc="/messagegreen.png" wrapperClass="hidden md:block" />
        <StatCard title="Bulan Ini" value={docCountThisMonth} iconSrc="/messageYellow.png" wrapperClass="hidden md:block" />
      </div>

      {/* Charts in a two-column layout for larger screens */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8"> {/* Changed to lg:grid-cols-2 */}
        {/* Section for Yearly Upload Statistics Chart */}
        <div className="bg-content-bg p-6 rounded-xl shadow-lg">
          <h2 className="text-xl font-semibold text-text-primary mb-4">Statistik Surat Tahunan</h2>
          <div className="h-72">
            {yearlyStats.length > 0 ? (
              <Line
                data={{
                  labels: yearlyStats.map(s => s.year),
                  datasets: [
                    {
                      label: 'Jumlah Dokumen Diupload Tahunan',
                      data: yearlyStats.map(s => s.count),
                      fill: false, // As per image, yearly chart is not filled
                      borderColor: 'rgba(239, 68, 68, 1)', // Red color from image
                      tension: 0.3, // Smooths the line
                      pointBackgroundColor: 'rgba(239, 68, 68, 1)',
                      pointBorderColor: '#fff',
                      pointHoverBackgroundColor: '#fff',
                      pointHoverBorderColor: 'rgba(239, 68, 68, 1)',
                    },
                  ],
                }}
                options={{
                  responsive: true,
                  maintainAspectRatio: false,
                  plugins: {
                    legend: {
                      position: 'top',
                      labels: {
                        color: '#4B5563' // theme('colors.text-secondary')
                      }
                    },
                    title: {
                      display: true,
                      text: 'Upload Dokumen (Beberapa Tahun Terakhir)',
                      color: '#1F2937' // theme('colors.text-primary')
                    },
                  },
                  scales: {
                    y: {
                      beginAtZero: true,
                      ticks: {
                        stepSize: 5, // Adjust step size as needed for yearly data
                        color: '#4B5563'
                      },
                      grid: {
                        color: '#E5E7EB'
                      }
                    },
                    x: {
                       ticks: {
                        color: '#4B5563'
                      },
                      grid: {
                        display: false
                      }
                    }
                  }
                }}
              />
            ) : (
              <p className="text-text-secondary text-center pt-10">Data statistik tahunan tidak tersedia...</p>
            )}
          </div>
        </div>

        {/* Section for Monthly Upload Statistics Chart (existing) */}
        <div className="bg-content-bg p-6 rounded-xl shadow-lg"> {/* Removed lg:col-span-1 */}
          <h2 className="text-xl font-semibold text-text-primary mb-4">Statistik Surat Bulanan</h2>
          <div className="h-72">
            {monthlyStats.length > 0 ? (
              <Line
                data={{
                  labels: monthlyStats.map(s => s.month_year),
                  datasets: [
                    {
                      label: 'Jumlah Dokumen Diupload',
                      data: monthlyStats.map(s => s.count),
                      fill: true,
                      borderColor: 'rgba(59, 130, 246, 1)',
                      backgroundColor: 'rgba(59, 130, 246, 0.2)',
                      tension: 0.3,
                      pointBackgroundColor: 'rgba(59, 130, 246, 1)',
                      pointBorderColor: '#fff',
                      pointHoverBackgroundColor: '#fff',
                      pointHoverBorderColor: 'rgba(59, 130, 246, 1)',
                    },
                  ],
                }}
                options={{
                  responsive: true,
                  maintainAspectRatio: false,
                  plugins: {
                    legend: {
                      position: 'top',
                      labels: {
                        color: '#4B5563'
                      }
                    },
                    title: {
                      display: true,
                      text: 'Upload Dokumen (12 Bulan Terakhir)',
                      color: '#1F2937'
                    },
                  },
                  scales: {
                    y: {
                      beginAtZero: true,
                      ticks: {
                        stepSize: 1,
                        color: '#4B5563'
                      },
                      grid: {
                        color: '#E5E7EB'
                      }
                    },
                    x: {
                       ticks: {
                        color: '#4B5563'
                      },
                      grid: {
                        display: false
                      }
                    }
                  }
                }}
              />
            ) : (
              <p className="text-text-secondary text-center pt-10">Data statistik bulanan tidak tersedia...</p>
            )}
          </div>
        </div>
      </div>

      {/* Recent Documents Table (existing) */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8"> {/* This section needs to be moved below the charts */}
        <div className="lg:col-span-3 bg-content-bg p-6 rounded-xl shadow-lg"> {/* Adjusted col-span */}
          <h2 className="text-xl font-semibold text-text-primary mb-4">Dokumen Terbaru</h2>
          {loadingRecentDocs ? (
            <p className="text-text-secondary">Memuat dokumen terbaru...</p>
          ) : recentDocuments.length > 0 ? (
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-border-color">
                <thead className="bg-gray-50"> {/* Consider theming this bg too */}<tr>
                    <th scope="col" className="px-4 py-3 text-left text-xs font-medium text-text-secondary uppercase tracking-wider">No. Surat</th>
                    <th scope="col" className="px-4 py-3 text-left text-xs font-medium text-text-secondary uppercase tracking-wider">Tipe</th>
                    <th scope="col" className="px-4 py-3 text-left text-xs font-medium text-text-secondary uppercase tracking-wider">Jenis</th>
                    <th scope="col" className="px-4 py-3 text-left text-xs font-medium text-text-secondary uppercase tracking-wider">Perihal</th>
                    <th scope="col" className="px-4 py-3 text-left text-xs font-medium text-text-secondary uppercase tracking-wider hidden md:table-cell">Pengirim</th>
                  </tr>
                </thead>
                <tbody className="bg-content-bg divide-y divide-border-color">
                  {recentDocuments.map((doc) => (
                    <tr key={doc.document_id}>
                      <td className="px-4 py-3 whitespace-nowrap text-sm text-text-primary">{doc.nomor_surat}</td>
                      <td className="px-4 py-3 whitespace-nowrap text-sm text-text-secondary">{doc.tipe_surat}</td>
                      <td className="px-4 py-3 whitespace-nowrap text-sm text-text-secondary">{doc.jenis_surat}</td>
                      <td className="px-4 py-3 whitespace-nowrap text-sm text-text-secondary truncate max-w-xs" title={doc.perihal}>{doc.perihal}</td>
                      <td className="px-4 py-3 whitespace-nowrap text-sm text-text-secondary hidden md:table-cell">{doc.pengirim || 'N/A'}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <p className="text-text-secondary">Tidak ada dokumen terbaru.</p>
          )}
        </div>
      </div>
    </>
  );
};

export default DashboardPage;
