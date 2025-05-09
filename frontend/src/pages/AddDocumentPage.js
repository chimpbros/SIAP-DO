import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
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
  });
  const [file, setFile] = useState(null);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const navigate = useNavigate();

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.id]: e.target.value });
  };

  const handleFileChange = (e) => {
    setFile(e.target.files[0]);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    if (!file) {
      setError('Lampiran surat wajib diisi.');
      return;
    }
    if (!formData.tipe_surat || !formData.jenis_surat || !formData.nomor_surat || !formData.perihal) {
      setError('Tipe Surat, Jenis Surat, Nomor Surat, dan Perihal wajib diisi.');
      return;
    }
    if (formData.tipe_surat === 'Surat Masuk' && (!formData.pengirim || !formData.isi_disposisi)) {
      setError('Untuk Surat Masuk, Pengirim dan Isi Disposisi wajib diisi.');
      return;
    }

    const data = new FormData();
    data.append('lampiran_surat', file);
    data.append('tipe_surat', formData.tipe_surat);
    data.append('jenis_surat', formData.jenis_surat);
    data.append('nomor_surat', formData.nomor_surat);
    data.append('perihal', formData.perihal);
    if (formData.tipe_surat === 'Surat Masuk') {
      data.append('pengirim', formData.pengirim);
      data.append('isi_disposisi', formData.isi_disposisi);
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
        // navigate('/archive'); 
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
    </>
  );
};

export default AddDocumentPage;
