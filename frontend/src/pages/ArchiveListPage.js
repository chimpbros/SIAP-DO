import React, { useState, useEffect, useCallback } from 'react';
// Navbar is now in MainLayout
import { useNavigate } from 'react-router-dom'; // Import useNavigate
import DocumentService from '../services/documentService';
import AuthService from '../services/authService'; // To get current user for admin check
import AddResponseModal from '../components/AddResponseModal'; // Import the new modal component

const ArchiveListPage = () => {
  const navigate = useNavigate(); // Initialize useNavigate
  const [documents, setDocuments] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterMonth, setFilterMonth] = useState('');
  const [filterYear, setFilterYear] = useState(new Date().getFullYear().toString());
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [loading, setLoading] = useState(false);
  const [user, setUser] = useState(null);
  const [showAddResponseModal, setShowAddResponseModal] = useState(false); // State for modal visibility
  const [selectedDocument, setSelectedDocument] = useState(null); // State to hold the document for the modal

  useEffect(() => {
    const currentUser = AuthService.getCurrentUser();
    setUser(currentUser);
  }, []);

  const fetchDocuments = useCallback(async (page = 1) => {
    setLoading(true);
    console.log(`Fetching documents for page: ${page}, search: ${searchTerm}, month: ${filterMonth}, year: ${filterYear}`);
    try {
      const params = { 
        page, 
        limit: 10, 
        searchTerm: searchTerm || undefined, 
        month: filterMonth || undefined, 
        year: filterYear || undefined 
      };
      const data = await DocumentService.listDocuments(params);
      console.log("Fetched documents data:", JSON.stringify(data.documents, null, 2)); // Log the fetched data with pretty printing
      setDocuments(data.documents);
      setCurrentPage(data.currentPage); // Ensure currentPage is updated from response
      setTotalPages(data.totalPages);
    } catch (error) {
      console.error("Failed to fetch documents", error);
      alert(error.message || "Gagal memuat dokumen.");
      setDocuments([]); 
    } finally {
      setLoading(false);
    }
  }, [searchTerm, filterMonth, filterYear]); // Dependencies of fetchDocuments
  
  useEffect(() => {
    if (user) { 
        fetchDocuments(currentPage);
    }
  }, [user, currentPage, fetchDocuments]); // Added fetchDocuments to dependency array

  const handleDelete = async (documentId) => {
    if (window.confirm('Apakah Anda yakin ingin menghapus dokumen ini?')) {
      setLoading(true);
      try {
        await DocumentService.deleteDocument(documentId);
        alert('Dokumen berhasil dihapus.');
        // Refresh the document list after deletion
        fetchDocuments(currentPage);
      } catch (error) {
        console.error("Failed to delete document", error);
        alert(error.message || "Gagal menghapus dokumen.");
      } finally {
        setLoading(false);
      }
    }
  };

  const handleDeleteResponse = async (doc) => {
    if (window.confirm('Apakah Anda yakin ingin menghapus dokumen respon ini?')) {
      setLoading(true);
      try {
        // Extract filename from the path
        const responsePath = doc.response_storage_path;
        const responseId = responsePath.split(/[\\/]/).pop(); // Get the last part of the path (filename)

        await DocumentService.deleteResponse(responseId);
        alert('Dokumen respon berhasil dihapus.');

        // Manually update the state to reflect the deletion immediately
        setDocuments(prevDocuments =>
          prevDocuments.map(document => {
            if (document.document_id === doc.document_id) {
              return {
                ...document,
                response_storage_path: null,
                response_original_filename: null,
                response_upload_timestamp: null,
                response_keterangan: null, // Also clear keterangan
                has_responded: false, // Set has_responded to false
              };
            }
            return document;
          })
        );

        // No need to refetch or reset page after manual state update
        // fetchDocuments(currentPage);
        // setCurrentPage(1);

      } catch (error) {
        console.error("Failed to delete response document", error);
        alert(error.message || "Gagal menghapus dokumen respon.");
      } finally {
        setLoading(false);
      }
    }
  };

  const handleSearch = (e) => {
    e.preventDefault();
    setCurrentPage(1);
    fetchDocuments(1);
  };

  const handlePageChange = (newPage) => {
    setCurrentPage(newPage);
  };

  const handlePreview = async (doc) => {
    try {
      const blob = await DocumentService.getDocumentAsBlob(doc.document_id, 'preview');
      const fileURL = URL.createObjectURL(blob);
      window.open(fileURL, '_blank');
    } catch (error) {
      alert(error.message || 'Gagal memuat pratinjau dokumen.');
    }
  };

  const handlePreviewResponse = async (doc) => {
    try {
      // Use the original document's ID to preview the response document
      // The backend's preview endpoint is updated to serve the response file if available
      const blob = await DocumentService.getDocumentAsBlob(doc.document_id, 'preview');
      const fileURL = URL.createObjectURL(blob);
      window.open(fileURL, '_blank');
    } catch (error) {
      console.error("Failed to preview response document", error); // Log the actual error
      alert(error.message || 'Gagal memuat pratinjau dokumen respon.');
    }
  };

  const handleDownload = async (doc) => {
    try {
      const blob = await DocumentService.getDocumentAsBlob(doc.document_id, 'download');
      const fileURL = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = fileURL;
      link.setAttribute('download', doc.original_filename || 'downloaded_file');
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(fileURL);
    } catch (error) {
      alert(error.message || 'Gagal mengunduh dokumen.');
    }
  };

  const handleAddResponse = (doc) => {
    setSelectedDocument(doc); // Set the document for the modal
    setShowAddResponseModal(true); // Show the modal
  };

  const handleCloseAddResponseModal = () => {
    setShowAddResponseModal(false); // Hide the modal
    setSelectedDocument(null); // Clear the selected document
  };

  const handleResponseAdded = () => {
    // This function is called from the modal after a successful response addition
    // Refresh the document list
    fetchDocuments(currentPage);
  };
  
  const handleExcelDownload = async () => { // Make function async
    const params = { 
        searchTerm: searchTerm || undefined, 
        month: filterMonth || undefined, 
        year: filterYear || undefined 
    };
    try {
      // setLoading(true); // Optional: add loading state for download button
      await DocumentService.downloadExcelExport(params);
      // setLoading(false);
      // No need to open window, service handles download
      // alert('Excel export started.'); // Optional: success feedback
    } catch (error) {
      // setLoading(false);
      console.error("Excel export failed", error);
      alert(error.message || "Gagal mengunduh data Excel.");
    }
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
    <>
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

      {user?.is_admin && ( 
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
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">No Surat</th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Tipe</th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Jenis</th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Perihal</th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider hidden md:table-cell">Pengirim</th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider hidden sm:table-cell">Tgl Upload</th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider hidden sm:table-cell">Uploader</th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Dokumen Respon</th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Aksi</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {documents.length > 0 ? documents.map(doc => (
                <tr key={doc.document_id}>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{doc.nomor_surat}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{doc.tipe_surat}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{doc.jenis_surat}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 max-w-xs truncate" title={doc.perihal}>{doc.perihal}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 hidden md:table-cell">{doc.pengirim || 'N/A'}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 hidden sm:table-cell">{doc.upload_timestamp}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 hidden sm:table-cell">{doc.uploader_nama}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {/* Show "Tambah Respon" if it's Surat Masuk and no response document */}
                    {doc.tipe_surat === 'Surat Masuk' && !doc.response_storage_path ? (
                       <button onClick={() => handleAddResponse(doc)} className="text-blue-600 hover:text-blue-900">Tambah Respon</button>
                    ) : (
                      // If there is a response document, show preview and delete options
                      doc.response_storage_path ? (
                        <span className="space-x-2"> {/* Use a span to group buttons */}
                          <button onClick={() => handlePreviewResponse(doc)} className="text-indigo-600 hover:text-indigo-900">Preview Respon</button>
                          {user?.is_admin && ( // Conditionally render delete response button for admins
                            <button
                              onClick={() => handleDeleteResponse(doc)}
                              className="text-red-600 hover:text-red-900"
                            >
                              Delete Respon
                            </button>
                          )}
                        </span>
                      ) : (
                        // If no response document but has_responded is true (due to keterangan), indicate response added
                         doc.has_responded && doc.response_keterangan && <span>Respon Ditambahkan</span> // Only show if keterangan exists
                      )
                    )}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium space-x-2">
                    <button onClick={() => handlePreview(doc)} className="text-indigo-600 hover:text-indigo-900">Preview</button>
                    <button onClick={() => handleDownload(doc)} className="text-green-600 hover:text-green-900">Download</button>
                    {user?.is_admin && ( // Conditionally render delete document button for admins
                      <button
                        onClick={() => handleDelete(doc.document_id)}
                        className="text-red-600 hover:text-red-900"
                      >
                        Delete
                      </button>
                    )}
                  </td>
                </tr>
              )) : (
                <tr><td colSpan={user?.is_admin ? 10 : 9} className="px-6 py-4 text-center text-sm text-gray-500">Tidak ada dokumen ditemukan.</td></tr>
              )}
            </tbody>
          </table>
        </div>
      )}
      {totalPages > 1 && (
          <div className="mt-4 flex justify-center">
              {Array.from({ length: totalPages }, (_, i) => i + 1).map(pageNumber => (
                  <button
                      key={pageNumber}
                      onClick={() => handlePageChange(pageNumber)}
                      className={`mx-1 px-3 py-1 border rounded ${currentPage === pageNumber ? 'bg-blue-500 text-white' : 'bg-white text-blue-500'}`}
                  >
                      {pageNumber}
                  </button>
              ))}
          </div>
      )}
      {/* .input-field styles are now global in index.css */}

      {/* Add the modal component */}
      {showAddResponseModal && (
        <AddResponseModal
          document={selectedDocument}
          onClose={handleCloseAddResponseModal}
          onResponseAdded={handleResponseAdded}
        />
      )}
    </>
  );
};

export default ArchiveListPage;
