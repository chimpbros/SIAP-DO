import React, { useState, useEffect } from 'react';
import Navbar from '../components/Navbar';
// import axios from 'axios';

const ArchiveListPage = () => {
  const [documents, setDocuments] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterMonth, setFilterMonth] = useState('');
  const [filterYear, setFilterYear] = useState(new Date().getFullYear().toString());
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [loading, setLoading] = useState(false);
  // const [user, setUser] = useState(null); // To check if admin for Excel download

  // useEffect(() => {
  //   const currentUser = JSON.parse(localStorage.getItem('user'));
  //   setUser(currentUser);
  // }, []);

  const fetchDocuments = async (page = 1) => {
    setLoading(true);
    console.log(`Fetching documents for page: ${page}, search: ${searchTerm}, month: ${filterMonth}, year: ${filterYear}`);
    // TODO: Implement actual API call to /api/documents
    // try {
    //   const token = localStorage.getItem('token');
    //   const params = { page, limit: 10, searchTerm, month: filterMonth, year: filterYear };
    //   const config = { headers: { Authorization: \`Bearer ${token}\` }, params };
    //   const response = await axios.get('/api/documents', config);
    //   setDocuments(response.data.documents);
    //   setCurrentPage(response.data.currentPage);
    //   setTotalPages(response.data.totalPages);
    // } catch (error) {
    //   console.error("Failed to fetch documents", error);
    //   setDocuments([]); // Clear documents on error
    // } finally {
    //   setLoading(false);
    // }

    // Placeholder data
    setTimeout(() => {
      const mockDocs = [
        { document_id: '1', nomor_surat: 'NS/001/V/2025', tipe_surat: 'Surat Masuk', jenis_surat: 'Biasa', perihal: 'Undangan Rapat Koordinasi', pengirim: 'Instansi X', upload_timestamp: '2025-05-01 10:00:00', uploader_nama: 'User A', original_filename: 'undangan.pdf' },
        { document_id: '2', nomor_surat: 'NS/002/V/2025', tipe_surat: 'Surat Keluar', jenis_surat: 'ST', perihal: 'Pengiriman Laporan Bulanan', pengirim: null, upload_timestamp: '2025-05-02 11:00:00', uploader_nama: 'User B', original_filename: 'laporan_mei.pdf' },
        { document_id: '3', nomor_surat: 'STR/001/IV/2025', tipe_surat: 'Surat Masuk', jenis_surat: 'STR', perihal: 'Informasi Rahasia', pengirim: 'Sumber Y', upload_timestamp: '2025-04-15 09:00:00', uploader_nama: 'Admin', original_filename: 'info_rahasia.pdf' },
      ];
      const user = JSON.parse(localStorage.getItem('user'));
      const filteredDocs = mockDocs.filter(doc => {
        let matches = true;
        if (!user?.is_admin && doc.jenis_surat === 'STR') matches = false;
        if (searchTerm && !(doc.nomor_surat.includes(searchTerm) || doc.perihal.includes(searchTerm) || (doc.pengirim && doc.pengirim.includes(searchTerm)))) matches = false;
        if (filterYear && !doc.upload_timestamp.startsWith(filterYear)) matches = false;
        if (filterMonth && filterYear && !doc.upload_timestamp.startsWith(`${filterYear}-${filterMonth.padStart(2,'0')}`)) matches = false;
        return matches;
      });
      setDocuments(filteredDocs);
      setTotalPages(1); // Simplified for placeholder
      setCurrentPage(1);
      setLoading(false);
    }, 500);
  };
  
  useEffect(() => {
    fetchDocuments(1); // Fetch on initial load and when filters change
  }, [searchTerm, filterMonth, filterYear]);


  const handleSearch = (e) => {
    e.preventDefault();
    fetchDocuments(1); // Reset to page 1 on new search
  };

  const handlePreview = (doc) => {
    // TODO: Implement actual preview logic, e.g., open /api/documents/:id/preview
    alert(`Previewing ${doc.original_filename}. Path: ${doc.storage_path || 'N/A'}`);
    // window.open(`/api/documents/${doc.document_id}/preview?token=${localStorage.getItem('token')}`, '_blank');
  };

  const handleDownload = (doc) => {
    // TODO: Implement actual download logic, e.g., trigger download from /api/documents/:id/download
    alert(`Downloading ${doc.original_filename}. Path: ${doc.storage_path || 'N/A'}`);
    // window.location.href = `/api/documents/${doc.document_id}/download?token=${localStorage.getItem('token')}`;
  };
  
  const handleExcelDownload = () => {
    // TODO: Implement actual Excel download
    alert('Excel download functionality to be implemented.');
    // const params = { searchTerm, month: filterMonth, year: filterYear };
    // const token = localStorage.getItem('token');
    // window.open(`/api/documents/export/excel?${new URLSearchParams(params).toString()}&token=${token}`, '_blank');
  };

  const years = Array.from({ length: 10 }, (_, i) => new Date().getFullYear() - i);
  const months = [
    { value: '', label: 'Semua Bulan' }, { value: '01', label: 'Januari' }, { value: '02', label: 'Februari' },
    { value: '03', label: 'Maret' }, { value: '04', label: 'April' }, { value: '05', label: 'Mei' },
    { value: '06', label: 'Juni' }, { value: '07', label: 'Juli' }, { value: '08', label: 'Agustus' },
    { value: '09', label: 'September' }, { value: '10', label: 'Oktober' }, { value: '11', label: 'November' },
    { value: '12', label: 'Desember' },
  ];


  return (
    <div>
      <Navbar />
      <div className="container mx-auto p-4">
        <h1 className="text-2xl font-bold text-gray-800 mb-6">Daftar Arsip Dokumen</h1>
        
        <form onSubmit={handleSearch} className="bg-white p-4 rounded-lg shadow-md mb-6">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 items-end">
            <div>
              <label htmlFor="searchTerm" className="block text-sm font-medium text-gray-700">Cari Dokumen</label>
              <input type="text" id="searchTerm" value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} className="mt-1 input-field" placeholder="Nomor, Perihal, Pengirim..." />
            </div>
            <div>
              <label htmlFor="filterMonth" className="block text-sm font-medium text-gray-700">Bulan</label>
              <select id="filterMonth" value={filterMonth} onChange={(e) => setFilterMonth(e.target.value)} className="mt-1 input-field">
                {months.map(m => <option key={m.value} value={m.value}>{m.label}</option>)}
              </select>
            </div>
            <div>
              <label htmlFor="filterYear" className="block text-sm font-medium text-gray-700">Tahun</label>
              <select id="filterYear" value={filterYear} onChange={(e) => setFilterYear(e.target.value)} className="mt-1 input-field">
                {years.map(y => <option key={y} value={y}>{y}</option>)}
              </select>
            </div>
            <button type="submit" className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded h-10">Cari</button>
          </div>
        </form>

        {JSON.parse(localStorage.getItem('user'))?.is_admin && (
          <div className="mb-4 text-right">
            <button onClick={handleExcelDownload} className="bg-green-500 hover:bg-green-700 text-white font-bold py-2 px-4 rounded">
              Download Data (Excel)
            </button>
          </div>
        )}

        {loading ? <p className="text-center">Memuat dokumen...</p> : (
          <div className="bg-white shadow-md rounded-lg overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  {['No Surat', 'Tipe', 'Jenis', 'Perihal', 'Pengirim', 'Tgl Upload', 'Uploader', 'Aksi'].map(header => (
                    <th key={header} scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">{header}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {documents.length > 0 ? documents.map(doc => (
                  <tr key={doc.document_id}>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{doc.nomor_surat}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{doc.tipe_surat}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{doc.jenis_surat}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 max-w-xs truncate" title={doc.perihal}>{doc.perihal}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{doc.pengirim || 'N/A'}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{doc.upload_timestamp}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{doc.uploader_nama}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium space-x-2">
                      <button onClick={() => handlePreview(doc)} className="text-indigo-600 hover:text-indigo-900">Preview</button>
                      <button onClick={() => handleDownload(doc)} className="text-green-600 hover:text-green-900">Download</button>
                    </td>
                  </tr>
                )) : (
                  <tr><td colSpan="8" className="px-6 py-4 text-center text-sm text-gray-500">Tidak ada dokumen ditemukan.</td></tr>
                )}
              </tbody>
            </table>
          </div>
        )}
        {/* TODO: Pagination controls */}
        {totalPages > 1 && (
            <div className="mt-4 flex justify-center">
                {Array.from({ length: totalPages }, (_, i) => i + 1).map(pageNumber => (
                    <button
                        key={pageNumber}
                        onClick={() => fetchDocuments(pageNumber)}
                        className={`mx-1 px-3 py-1 border rounded ${currentPage === pageNumber ? 'bg-blue-500 text-white' : 'bg-white text-blue-500'}`}
                    >
                        {pageNumber}
                    </button>
                ))}
            </div>
        )}
      </div>
      <style jsx>{`
        .input-field {
          box-shadow: 0 1px 3px 0 rgba(0, 0, 0, 0.1), 0 1px 2px 0 rgba(0, 0, 0, 0.06);
          appearance: none;
          border-radius: 0.375rem;
          border-width: 1px;
          border-color: #D1D5DB; /* gray-300 */
          width: 100%;
          padding: 0.5rem 0.75rem;
          color: #374151; /* gray-700 */
          line-height: 1.5;
        }
        .input-field:focus {
          outline: none;
          box-shadow: 0 0 0 3px rgba(96, 165, 250, 0.5); /* blue-300 with opacity */
          border-color: #3B82F6; /* blue-500 */
        }
      `}</style>
    </div>
  );
};

export default ArchiveListPage;
