import React, { useState } from 'react';
import { Link } from 'react-router-dom'; // useNavigate removed
// Navbar is now in MainLayout
import DocumentService from '../services/documentService';

const AddDocumentPage = () => {
  const [formData, setFormData] = useState({
    tipe_surat: 'Surat Masuk', // Default value
    jenis_surat: 'Biasa',    // Default value
    nomor_surat: '',
    perihal: '',
    pengirim: '',
    isi_disposisi: '',
    response_document: null,
    response_keterangan: '',
  });
  const [file, setFile] = useState(null);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [archiveWithoutResponse, setArchiveWithoutResponse] = useState(false);
  // const navigate = useNavigate(); // Removed

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.id]: e.target.value });
  };

  const handleResponseFileChange = (e) => {
    const selectedFile = e.target.files[0];
    if (selectedFile) {
      const maxSize = 512 * 1024; // 512 KB
      if (selectedFile.size > maxSize) {
        setError(`Ukuran file tidak boleh melebihi 512 KB. Ukuran file Anda: ${(selectedFile.size / 1024).toFixed(2)} KB`);
        setFormData({ ...formData, response_document: null });
        e.target.value = null;
        return;
      }
      setFormData({ ...formData, response_document: selectedFile });
      setError('');
    } else {
      setFormData({ ...formData, response_document: null });
    }
  };

  const handleFileChange = (e) => {
    const selectedFile = e.target.files[0];
    if (selectedFile) {
      const maxSize = 512 * 1024; // 512 KB
      if (selectedFile.size > maxSize) {
        setError(`Ukuran file tidak boleh melebihi 512 KB. Ukuran file Anda: ${(selectedFile.size / 1024).toFixed(2)} KB`);
        setFile(null);
        e.target.value = null; // Clear the file input
        return;
      }
      setFile(selectedFile);
      setError(''); // Clear any previous file errors
    } else {
      setFile(null);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    // Reset response fields if archiveWithoutResponse is true
    if (archiveWithoutResponse) {
      setFormData({ 
        ...formData, 
        response_document: null,
        response_keterangan: ''
      });
    }

    if (!file) {
      setError('Lampiran surat wajib diisi.');
      return;
    }
    if (!formData.tipe_surat || !formData.jenis_surat || !formData.nomor_surat || !formData.perihal) {
      setError('Tipe Surat, Jenis Surat, Nomor Surat, dan Perihal wajib diisi.');
      return;
    }
    if (formData.tipe_surat === 'Surat Masuk' && (!archiveWithoutResponse) && (!formData.pengirim || !formData.isi_disposisi)) {
      setError('Untuk Surat Masuk, Pengirim dan Isi Disposisi wajib diisi.');
      return;
    }
    if (formData.tipe_surat === 'Surat Masuk' && (!archiveWithoutResponse) && (!formData.response_document || !formData.response_keterangan)) {
      setError('Untuk Surat Masuk yang memerlukan respons, Lampiran Respons dan Keterangan Respons wajib diisi.');
      return;
    }

    const data = new FormData();
    data.append('originalDocument', file);
    data.append('tipe_surat', formData.tipe_surat);
    data.append('jenis_surat', formData.jenis_surat);
    data.append('nomor_surat', formData.nomor_surat);
    data.append('perihal', formData.perihal);
    if (formData.tipe_surat === 'Surat Masuk' && !archiveWithoutResponse) {
      data.append('pengirim', formData.pengirim);
      data.append('isi_disposisi', formData.isi_disposisi);
      data.append('responseDocument', formData.response_document);
      data.append('response_keterangan', formData.response_keterangan);
      data.append('archive_without_response', archiveWithoutResponse);
    }
    
    console.log('Add document attempt with:', Object.fromEntries(data.entries()));
    try {
      const response = await DocumentService.addDocument(data);
      setSuccess(response.message || 'Dokumen berhasil ditambahkan!');
      // Reset form
      setFormData({ tipe_surat: 'Surat Masuk', jenis_surat: 'Biasa', nomor_surat: '', perihal: '', pengirim: '', isi_disposisi: '' });
      setFile(null);
      if (document.getElementById('lampiran_surat')) { // Check if element exists before trying to clear
        document.getElementById('lampiran_surat').value = null; 
      }
      setTimeout(() => {
        setSuccess('');
        // Optionally navigate or stay on page
        // navigate('/archive'); // If navigation is desired, re-add useNavigate and uncomment
      }, 3000);
    } catch (err) {
      setError(err.message || 'Gagal menambahkan dokumen. Silakan coba lagi.');
    }
  };

  return (
    // Navbar removed, container and padding are now handled by MainLayout's <main> tag
    <>
      <h1 className="text-2xl font-bold text-gray-800 mb-6">Tambah Dokumen Baru</h1>
      <div className="bg-white p-8 rounded-lg shadow-md w-full max-w-2xl mx-auto">
        <form onSubmit={handleSubmit}>
          {error && <p className="text-red-500 text-sm mb-4 text-center">{error}</p>}
          {success && <p className="text-green-500 text-sm mb-4 text-center">{success}</p>}

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="tipe_surat">Tipe Surat</label>
              <select id="tipe_surat" value={formData.tipe_surat} onChange={handleChange} className="input-field">
                <option value="Surat Masuk">Surat Masuk</option>
                <option value="Surat Keluar">Surat Keluar</option>
              </select>
            </div>
            <div>
              <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="jenis_surat">Jenis Surat</label>
              <select id="jenis_surat" value={formData.jenis_surat} onChange={handleChange} className="input-field">
                <option value="ST">ST (Surat Telegram)</option>
                <option value="STR">STR (Surat Telegram Rahasia)</option>
                <option value="Biasa">Biasa</option>
                <option value="Sprin">Sprin (Surat Perintah)</option>
                <option value="Nota Dinas">Nota Dinas</option>
              </select>
            </div>
          </div>

          <div className="mt-4">
            <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="nomor_surat">Nomor Surat</label>
            <input type="text" id="nomor_surat" value={formData.nomor_surat} onChange={handleChange} className="input-field" placeholder="Nomor Surat" />
          </div>

          <div className="mt-4">
            <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="perihal">Perihal</label>
            <textarea id="perihal" value={formData.perihal} onChange={handleChange} className="input-field h-24" placeholder="Perihal Dokumen"></textarea>
          </div>

          {formData.tipe_surat === 'Surat Masuk' && (
            <>
              <div className="mt-4">
                <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="pengirim">Pengirim</label>
                <input type="text" id="pengirim" value={formData.pengirim} onChange={handleChange} className="input-field" placeholder="Nama Pengirim" />
              </div>
              <div className="mt-4">
                <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="isi_disposisi">Isi Disposisi</label>
                <textarea id="isi_disposisi" value={formData.isi_disposisi} onChange={handleChange} className="input-field h-20" placeholder="Isi Disposisi"></textarea>
              </div>
              
              <div className="mt-4 flex items-center">
                <input 
                  type="checkbox" 
                  id="archiveWithoutResponse" 
                  checked={archiveWithoutResponse}
                  onChange={(e) => setArchiveWithoutResponse(e.target.checked)}
                  className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                />
                <label htmlFor="archiveWithoutResponse" className="ml-2 block text-sm text-gray-700">
                  Arsipkan tanpa respons
                </label>
              </div>

              {!archiveWithoutResponse && (
                <>
                  <div className="mt-4">
                    <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="response_document">Lampiran Respons (PDF, JPG, PNG)</label>
                    <input 
                      type="file" 
                      id="response_document" 
                      onChange={handleResponseFileChange}
                      className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
                      accept=".pdf,.jpg,.jpeg,.png"
                    />
                  </div>
                  <div className="mt-4">
                    <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="response_keterangan">Keterangan Respons</label>
                    <textarea 
                      id="response_keterangan" 
                      value={formData.response_keterangan} 
                      onChange={handleChange} 
                      className="input-field h-20" 
                      placeholder="Keterangan untuk respons surat"
                    ></textarea>
                  </div>
                </>
              )}
            </>
          )}

          <div className="mt-6">
            <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="lampiran_surat">Lampiran Surat (PDF, JPG, PNG)</label>
            <input type="file" id="lampiran_surat" onChange={handleFileChange} className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100" accept=".pdf,.jpg,.jpeg,.png" />
          </div>
          
          <div className="mt-8 flex justify-end space-x-4">
            <Link to="/archive" className="bg-gray-500 hover:bg-gray-600 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline">
              Kembali ke Daftar Arsip
            </Link>
            <button type="submit" className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline">
              Simpan Dokumen
            </button>
          </div>
        </form>
      </div>
      <style>{`
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
    </>
  );
};

export default AddDocumentPage;
