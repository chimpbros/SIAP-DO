import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom'; // Added useNavigate
// Navbar is now in MainLayout
import DocumentService from '../services/documentService';

const AddDocumentPage = () => {
  const [formData, setFormData] = useState({
    tipe_surat: 'Surat Masuk', // Default value
    jenis_surat: 'Biasa',    // Default value
    nomor_surat: '',
    perihal: '',
    pengirim: '',
    tanggal_masuk_surat: '', // New: Date of document entry
    // Removed: isi_disposisi, response_document, response_keterangan
  });
  const [file, setFile] = useState(null);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  // const [archiveWithoutResponse, setArchiveWithoutResponse] = useState(false); // This logic will be removed or re-evaluated
  const navigate = useNavigate(); // Initialized navigate

  const handleChange = (e) => {
    const { id, value } = e.target;
    setFormData(prevFormData => {
      const newFormData = { ...prevFormData, [id]: value };
      // If tipe_surat changes to 'Surat Keluar', clear pengirim
      if (id === 'tipe_surat' && value === 'Surat Keluar') {
        newFormData.pengirim = '';
      }
      return newFormData;
    });
  };

  // Removed handleResponseFileChange as response fields are removed from this form

  const handleFileChange = (e) => {
    const selectedFile = e.target.files[0];
    if (selectedFile) {
      const maxSize = 1024 * 1024 * 2; // 2 MB
      if (selectedFile.size > maxSize) {
        setError(`Ukuran file tidak boleh melebihi 2 MB. Ukuran file Anda: ${(selectedFile.size / 1024).toFixed(2)} KB`);
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

    if (!file) {
      setError('Lampiran surat wajib diisi.');
      return;
    }
    if (!formData.tipe_surat || !formData.jenis_surat || !formData.nomor_surat || !formData.perihal) {
      setError('Tipe Surat, Jenis Surat, Nomor Surat, dan Perihal wajib diisi.');
      return;
    }
    // Pengirim is required only if tipe_surat is not 'Surat Keluar'
    if (formData.tipe_surat !== 'Surat Keluar' && !formData.pengirim) {
        setError('Pengirim wajib diisi untuk Surat Masuk.');
        return;
    }
    // Removed validation for isi_disposisi, response_document, response_keterangan

    const data = new FormData();
    data.append('originalDocument', file);
    data.append('tipe_surat', formData.tipe_surat);
    data.append('jenis_surat', formData.jenis_surat);
    data.append('nomor_surat', formData.nomor_surat);
    data.append('perihal', formData.perihal);
    data.append('pengirim', formData.pengirim); // Pengirim is now always sent
    if (formData.tanggal_masuk_surat) {
      data.append('tanggal_masuk_surat', formData.tanggal_masuk_surat);
    }

    // Backend will need to be adjusted to not expect isi_disposisi, responseDocument, etc.,
    // or handle their absence gracefully for this simplified form.
    // For now, we assume the backend's addDocument will be updated.
    
    console.log('Add document attempt with:', Object.fromEntries(data.entries()));
    try {
      const response = await DocumentService.addDocument(data);
      setSuccess(response.message || 'Dokumen berhasil ditambahkan!');
      // Reset form to initial state
      setFormData({
        tipe_surat: 'Surat Masuk',
        jenis_surat: 'Biasa',
        nomor_surat: '',
        perihal: '',
        pengirim: '',
        tanggal_masuk_surat: '', // Reset date field
      });
      setFile(null);
      // Clear the file input visually
      const fileInput = document.getElementById('lampiran_surat');
      if (fileInput) {
        fileInput.value = null;
      }
      setTimeout(() => {
        setSuccess('');
      }, 3000);
    } catch (err) {
      setError(err.message || 'Gagal menambahkan dokumen. Silakan coba lagi.');
    }
  };

  return (
    <>
      <h1 className="text-2xl font-semibold text-text-primary mb-6 text-center">Tambah Surat</h1>
      <div className="bg-content-bg p-8 rounded-xl shadow-lg w-full max-w-xl mx-auto"> {/* Adjusted max-width for a slightly narrower form like design */}
        <form onSubmit={handleSubmit} className="space-y-6">
          {error && <p className="text-danger text-sm text-center py-2 bg-red-50 rounded-md">{error}</p>}
          {success && <p className="text-success text-sm text-center py-2 bg-green-50 rounded-md">{success}</p>}

          <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-4"> {/* Adjusted gap */}
            <div>
              <label className="block text-sm font-medium text-text-primary mb-1" htmlFor="tipe_surat">Tipe Surat</label>
              <select id="tipe_surat" value={formData.tipe_surat} onChange={handleChange} className="input-field bg-gray-100 border-gray-100 focus:bg-white focus:border-primary">
                <option value="Surat Masuk">Surat Masuk</option>
                <option value="Surat Keluar">Surat Keluar</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-text-primary mb-1" htmlFor="jenis_surat">Jenis Surat</label>
              <select id="jenis_surat" value={formData.jenis_surat} onChange={handleChange} className="input-field bg-gray-100 border-gray-100 focus:bg-white focus:border-primary">
                <option value="ST">ST (Surat Telegram)</option>
                <option value="STR">STR (Surat Telegram Rahasia)</option>
                <option value="Biasa">Biasa</option>
                <option value="Sprin">Sprin (Surat Perintah)</option>
                <option value="Nota Dinas">Nota Dinas</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-text-primary mb-1" htmlFor="tanggal_masuk_surat">Tanggal Masuk Surat</label>
            <input type="date" id="tanggal_masuk_surat" value={formData.tanggal_masuk_surat} onChange={handleChange} className="input-field bg-gray-100 border-gray-100 focus:bg-white focus:border-primary" />
          </div>

          <div>
            <label className="block text-sm font-medium text-text-primary mb-1" htmlFor="nomor_surat">Nomor Surat</label>
            <input type="text" id="nomor_surat" value={formData.nomor_surat} onChange={handleChange} className="input-field bg-gray-100 border-gray-100 focus:bg-white focus:border-primary" placeholder="" />
          </div>

          <div>
            <label className="block text-sm font-medium text-text-primary mb-1" htmlFor="perihal">Perihal</label>
            <textarea id="perihal" value={formData.perihal} onChange={handleChange} className="input-field bg-gray-100 border-gray-100 focus:bg-white focus:border-primary min-h-[80px]" placeholder=""></textarea>
          </div>
          
          {formData.tipe_surat !== 'Surat Keluar' && (
            <div>
              <label className="block text-sm font-medium text-text-primary mb-1" htmlFor="pengirim">Pengirim</label>
              <input type="text" id="pengirim" value={formData.pengirim} onChange={handleChange} className="input-field bg-gray-100 border-gray-100 focus:bg-white focus:border-primary" placeholder="" />
            </div>
          )}

          <div>
            <label className="block text-sm font-medium text-text-primary mb-1" htmlFor="lampiran_surat">Lampiran (PDF, PNG, JPG)</label>
            <div className="mt-1">
              <label htmlFor="lampiran_surat" className="cursor-pointer bg-gray-100 hover:bg-gray-200 text-text-secondary font-medium py-2 px-4 rounded-lg inline-block border border-gray-100">
                Choose file
              </label>
              <input
                type="file"
                id="lampiran_surat"
                onChange={handleFileChange}
                className="hidden" // Hide the default input
                accept=".pdf,.jpg,.jpeg,.png"
              />
              {file && <span className="ml-3 text-sm text-text-light">{file.name}</span>}
            </div>
          </div>
          
          <div className="flex justify-end space-x-4 pt-4">
            <button
              type="button"
              onClick={() => navigate('/archive')} // Use navigate for Batal
              className="px-8 py-2.5 bg-gray-200 hover:bg-gray-300 text-text-primary font-medium rounded-lg transition-colors duration-150 text-sm"
            >
              Batal
            </button>
            <button
              type="submit"
              className="px-8 py-2.5 bg-primary hover:bg-primary-dark text-white font-medium rounded-lg focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary transition-colors duration-150 text-sm"
            >
              Simpan
            </button>
          </div>
        </form>
      </div>
    </>
  );
};

export default AddDocumentPage;
