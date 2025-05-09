import React, { useState, useEffect } from 'react';
import Navbar from '../components/Navbar';
import DocumentService from '../services/documentService';
import AuthService from '../services/authService'; // To get current user for admin check

const ArchiveListPage = () => {
  const [documents, setDocuments] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterMonth, setFilterMonth] = useState('');
  const [filterYear, setFilterYear] = useState(new Date().getFullYear().toString());
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [loading, setLoading] = useState(false);
  const [user, setUser] = useState(null);

  useEffect(() => {
    const currentUser = AuthService.getCurrentUser();
    setUser(currentUser);
  }, []);

  const fetchDocuments = async (page = 1) => {
    setLoading(true);
    console.log(`Fetching documents for page: ${page}, search: ${searchTerm}, month: ${filterMonth}, year: ${filterYear}`);
    try {
      const params = { 
        page, 
        limit: 10, 
        searchTerm: searchTerm || undefined, // Send undefined if empty to avoid empty query param
        month: filterMonth || undefined, 
        year: filterYear || undefined 
      };
      const data = await DocumentService.listDocuments(params);
      setDocuments(data.documents);
      setCurrentPage(data.currentPage);
      setTotalPages(data.totalPages);
    } catch (error) {
      console.error("Failed to fetch documents", error);
      alert(error.message || "Gagal memuat dokumen.");
      setDocuments([]); 
    } finally {
      setLoading(false);
    }
  };
  
  // Fetch documents when component mounts or filters/page change
  useEffect(() => {
    if (user) { // Ensure user context is loaded before fetching, as it might affect STR visibility
        fetchDocuments(currentPage);
    }
  }, [user, currentPage]); // Removed searchTerm, filterMonth, filterYear to avoid multiple calls, handle via handleSearch

  const handleSearch = (e) => {
    e.preventDefault();
    setCurrentPage(1); // Reset to page 1 on new search/filter
    fetchDocuments(1); 
  };

  const handlePreview = (doc) => {
    const previewUrl = DocumentService.previewDocumentUrl(doc.document_id);
    window.open(previewUrl, '_blank');
  };

  const handleDownload = (doc) => {
    const downloadUrl = DocumentService.downloadDocumentUrl(doc.document_id);
    // Forcing download by creating a temporary link, as direct window.location.href might open in browser for some types
    const link = document.createElement('a');
    link.href = downloadUrl;
    link.setAttribute('download', doc.original_filename || 'download'); // Or use a default filename
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };
  
  const handleExcelDownload = () => {
    const params = { 
        searchTerm: searchTerm || undefined, 
        month: filterMonth || undefined, 
        year: filterYear || undefined 
    };
    // This will open the URL, and the browser will handle the download based on Content-Disposition
    // The token is handled by the axios interceptor if this URL were fetched by axios.
    // For direct window.open, if the backend /export/excel route is protected,
    // it needs to handle auth via session/cookie or this approach won't pass the token.
    // A more robust way for token-based auth is to fetch as blob and create object URL.
    // For now, we assume the backend route might allow GET with query params if session is used,
    // or we use the commented out downloadExcelExport from DocumentService.
    const excelUrl = DocumentService.exportDocumentsToExcelUrl(params);
    window.open(excelUrl, '_blank'); 
    // alert('Excel download functionality to be implemented via DocumentService.downloadExcelExport if direct URL fails due to auth.');
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
