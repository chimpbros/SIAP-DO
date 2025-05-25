import React, { useState, useEffect, useCallback, useRef } from 'react';
// Navbar is now in MainLayout
import { useNavigate } from 'react-router-dom'; // Import useNavigate
import DocumentService from '../services/documentService';
import AuthService from '../services/authService'; // To get current user for admin check
import DispositionFollowUpModal from '../components/DispositionFollowUpModal'; // Import the new modal

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
  // const [showAddResponseModal, setShowAddResponseModal] = useState(false); // Old modal state
  // const [selectedDocument, setSelectedDocument] = useState(null); // Old selected doc state

  const [showDispositionModal, setShowDispositionModal] = useState(false);
  const [selectedDocumentForDisposition, setSelectedDocumentForDisposition] = useState(null);
  // const tableContainerRef = useRef(null); // Logging removed


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
      return data.documents; // Return the fetched documents
    } catch (error) {
      console.error("Failed to fetch documents", error);
      alert(error.message || "Gagal memuat dokumen.");
      setDocuments([]);
      return []; // Return empty array on error
    } finally {
      setLoading(false);
    }
  }, [searchTerm, filterMonth, filterYear]); // Dependencies of fetchDocuments
  
  useEffect(() => {
    if (user) { 
        fetchDocuments(currentPage);
    }
  }, [user, currentPage, fetchDocuments]); // Added fetchDocuments to dependency array

  // useEffect(() => { // Logging removed
  //   const logTableWidths = () => {
  //     if (tableContainerRef.current) {
  //       console.log(`ArchiveListPage Table container: offsetWidth=${tableContainerRef.current.offsetWidth}, scrollWidth=${tableContainerRef.current.scrollWidth}`);
  //     }
  //   };
  //   logTableWidths();
  //   if (documents.length > 0) {
  //       logTableWidths();
  //   }
  //   window.addEventListener('resize', logTableWidths);
  //   return () => {
  //     window.removeEventListener('resize', logTableWidths);
  //   };
  // }, [documents]);

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

  const openDispositionModal = (doc) => {
    setSelectedDocumentForDisposition(doc);
    setShowDispositionModal(true);
  };

  const closeDispositionModal = () => {
    setSelectedDocumentForDisposition(null);
    setShowDispositionModal(false);
  };

  const handleDispositionActionComplete = async () => { // Make it async
    const updatedDocuments = await fetchDocuments(currentPage); // Fetch and await
    if (updatedDocuments && selectedDocumentForDisposition) {
      const freshDocument = updatedDocuments.find(
        doc => doc.document_id === selectedDocumentForDisposition.document_id
      );
      if (freshDocument) {
        setSelectedDocumentForDisposition(freshDocument); // Update with fresh data
      }
    }
    closeDispositionModal();
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
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-2xl font-semibold text-text-primary">Arsip Surat</h1>
          <p className="text-sm text-text-secondary">Lihat dan atur seluruh surat, tambahkan disposisi atau tindak lanjut.</p>
        </div>
        <div className="flex space-x-3">
          {user?.is_admin && (
            <button
              onClick={handleExcelDownload}
              className="bg-content-bg hover:bg-gray-100 text-text-primary border border-border-color font-medium py-2 px-4 rounded-lg flex items-center whitespace-nowrap" /* Added whitespace-nowrap */
            >
               <img src={process.env.PUBLIC_URL + '/file-export.svg'} alt="Export" className="w-5 h-5 mr-2 flex-shrink-0" /> {/* Added flex-shrink-0 to icon */}
              Export
            </button>
          )}
        </div>
      </div>
      
      {/* Filters section - can be refined later, for now keeping existing logic with new styling */}
      <form onSubmit={handleSearch} className="bg-content-bg p-4 rounded-xl shadow-lg mb-6">
        {/* Responsive grid: 1 col on xs, 2 on sm, 4 on lg */}
        {/* Responsive grid: 1 col on xs, 2 on md, 4 on lg */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 items-end">
          {/* Search Term Input - Takes full width on xs, 2 cols on md, 1 on lg */}
          <div className="md:col-span-2 lg:col-span-1">
            <label htmlFor="searchTerm" className="block text-sm font-medium text-text-secondary mb-1">Cari Dokumen</label>
            <input type="text" id="searchTerm" value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} className="input-field w-full" placeholder="Nomor, Perihal, Pengirim..." />
          </div>
          <div>
            <label htmlFor="filterMonth" className="block text-sm font-medium text-text-secondary mb-1">Bulan</label>
            <select id="filterMonth" value={filterMonth} onChange={(e) => setFilterMonth(e.target.value)} className="input-field w-full">
              {months.map(m => <option key={m.value} value={m.value}>{m.label}</option>)}
            </select>
          </div>
          <div>
            <label htmlFor="filterYear" className="block text-sm font-medium text-text-secondary mb-1">Tahun</label>
            <select id="filterYear" value={filterYear} onChange={(e) => setFilterYear(e.target.value)} className="input-field w-full">
              {years.map(y => <option key={y} value={y}>{y}</option>)}
            </select>
          </div>
          {/* Search Button - Takes full width on xs, auto on md+ */}
          <button
            type="submit"
            className="bg-primary hover:bg-primary-dark text-white font-medium py-2.5 px-4 rounded-lg h-10 w-full md:w-auto self-end"
          >
            Cari
          </button>
        </div>
      </form>

      {/* Removed old admin-only Excel download button location */}

      {loading ? <p className="text-center text-text-secondary py-10">Memuat dokumen...</p> : (
        <div /* ref={tableContainerRef} // Logging removed */ className="bg-content-bg shadow-xl rounded-xl overflow-x-auto w-full"> {/* Added w-full */}
          <table className="min-w-full divide-y divide-border-color">
            <thead className="bg-gray-50">
              <tr>
                <th scope="col" className="px-4 py-3 text-center text-xs font-medium text-text-secondary uppercase tracking-wider">No Surat</th>
                <th scope="col" className="px-4 py-3 text-center text-xs font-medium text-text-secondary uppercase tracking-wider">Tipe</th>
                <th scope="col" className="px-4 py-3 text-center text-xs font-medium text-text-secondary uppercase tracking-wider">Jenis</th>
                <th scope="col" className="px-4 py-3 text-center text-xs font-medium text-text-secondary uppercase tracking-wider">Perihal</th>
                <th scope="col" className="px-4 py-3 text-center text-xs font-medium text-text-secondary uppercase tracking-wider">Pengirim</th>
                <th scope="col" className="px-4 py-3 text-center text-xs font-medium text-text-secondary uppercase tracking-wider">Uploader</th>
                <th scope="col" className="px-4 py-3 text-center text-xs font-medium text-text-secondary uppercase tracking-wider">Disposisi / Tindak Lanjut</th>
                <th scope="col" className="px-4 py-3 text-center text-xs font-medium text-text-secondary uppercase tracking-wider">Aksi</th>
              </tr>
            </thead>
            <tbody className="bg-content-bg divide-y divide-border-color">
              {documents.length > 0 ? documents.map(doc => (
                <tr key={doc.document_id} className="hover:bg-page-bg transition-colors duration-150">
                  <td className="px-4 py-3 whitespace-nowrap text-sm text-text-primary text-center">{doc.nomor_surat}</td>
                  <td className="px-4 py-3 whitespace-nowrap text-sm text-text-secondary text-center">{doc.tipe_surat}</td>
                  <td className="px-4 py-3 whitespace-nowrap text-sm text-text-secondary text-center">{doc.jenis_surat}</td>
                  <td className="px-4 py-3 whitespace-nowrap text-sm text-text-secondary max-w-xs truncate text-center" title={doc.perihal}>{doc.perihal}</td>
                  <td className="px-4 py-3 whitespace-nowrap text-sm text-text-secondary text-center">{doc.pengirim || 'N/A'}</td>
                  <td className="px-4 py-3 whitespace-nowrap text-sm text-text-secondary text-center">{doc.uploader_nama}</td>
                  <td className="px-4 py-3 text-sm text-center"> {/* Removed whitespace-nowrap */}
                    { doc.tipe_surat === 'Surat Masuk' ? (
                      <button onClick={() => openDispositionModal(doc)} className="p-1 hover:bg-gray-200 rounded-full">
                        {(doc.isi_disposisi || doc.disposition_attachment_path || doc.response_keterangan || doc.response_storage_path) ? (
                          <img src={process.env.PUBLIC_URL + '/menu-dots-archive.svg'} alt="Edit Disposisi/Tindak Lanjut" className="w-5 h-5 text-text-secondary" />
                        ) : (
                          <img src={process.env.PUBLIC_URL + '/addArchive.png'} alt="Tambah Disposisi/Tindak Lanjut" className="w-5 h-5 text-green-500" />
                        )}
                      </button>
                    ) : (
                      <span className="text-text-light">-</span>
                    )}
                  </td>
                  <td className="px-4 py-3 text-sm font-medium text-center"> {/* Removed whitespace-nowrap */}
                    <div className="flex flex-wrap justify-center items-center space-x-1"> {/* Added flex-wrap and space-x-1 for better spacing */}
                      <button onClick={() => handlePreview(doc)} className="p-1 hover:bg-gray-200 rounded-full" title="Preview"> {/* Removed mx-1 */}
                         <img src={process.env.PUBLIC_URL + '/viewArchive.png'} alt="Preview" className="w-5 h-5" />
                      </button>
                      {user?.is_admin && (
                        <button
                          onClick={() => handleDelete(doc.document_id)}
                          className="p-1 hover:bg-gray-200 rounded-full" /* Removed mx-1 */
                          title="Delete"
                        >
                          <img src={process.env.PUBLIC_URL + '/binArchive.png'} alt="Delete" className="w-5 h-5" />
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              )) : (
                <tr><td colSpan={8} className="px-6 py-10 text-center text-sm text-text-secondary">Tidak ada dokumen ditemukan.</td></tr>
              )}
            </tbody>
          </table>
        </div>
      )}
      {totalPages > 1 && (
          <div className="mt-6 flex justify-center">
              {Array.from({ length: totalPages }, (_, i) => i + 1).map(pageNumber => (
                  <button
                      key={pageNumber}
                      onClick={() => handlePageChange(pageNumber)}
                      className={`mx-1 px-4 py-2 border rounded-lg text-sm font-medium ${currentPage === pageNumber ? 'bg-primary text-white border-primary' : 'bg-content-bg text-primary border-border-color hover:bg-page-bg'}`}
                  >
                      {pageNumber}
                  </button>
              ))}
          </div>
      )}
      
      {showDispositionModal && selectedDocumentForDisposition && (
        <DispositionFollowUpModal
          document={selectedDocumentForDisposition}
          onClose={closeDispositionModal}
          onActionComplete={handleDispositionActionComplete}
        />
      )}
    </>
  );
};

export default ArchiveListPage;
