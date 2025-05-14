import React, { useState } from 'react';
import DocumentService from '../services/documentService';

const AddResponseModal = ({ document, onClose, onResponseAdded }) => {
  const [responseFile, setResponseFile] = useState(null);
  const [responseKeterangan, setResponseKeterangan] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const handleFileChange = (e) => {
    const selectedFile = e.target.files[0];
    if (selectedFile) {
      const maxSize = 1024 * 1024 * 2; // 2 MB
      if (selectedFile.size > maxSize) {
        setError(`Ukuran file tidak boleh melebihi 2 MB. Ukuran file Anda: ${(selectedFile.size / 1024).toFixed(2)} KB`);
        setResponseFile(null);
        e.target.value = null;
        return;
      }
      setResponseFile(selectedFile);
      setError('');
    } else {
      setResponseFile(null);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    setLoading(true);

    if (!responseFile && responseKeterangan.trim() === '') {
      setError('Mohon unggah dokumen respon atau isi keterangan respon.');
      setLoading(false);
      return;
    }

    const formData = new FormData();
    if (responseFile) {
      formData.append('responseDocument', responseFile);
    }
    formData.append('response_keterangan', responseKeterangan);

    try {
      await DocumentService.addResponse(document.document_id, formData);
      setSuccess('Respon berhasil ditambahkan!');
      // Clear form by resetting state
      setResponseFile(null);
      setResponseKeterangan('');
      // Removing direct DOM manipulation: document.getElementById
      
      // Notify parent component (ArchiveListPage) that response was added
      if (onResponseAdded) {
        onResponseAdded();
      }

      // Close modal after a short delay
      setTimeout(() => {
        onClose();
      }, 1500);

    } catch (err) {
      setError(err.message || 'Gagal menambahkan respon. Silakan coba lagi.');
    } finally {
      setLoading(false);
    }
  };

  if (!document) {
    return null; // Don't render if no document is provided
  }

  return (
    <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
      <div className="relative top-20 mx-auto p-5 border w-96 shadow-lg rounded-md bg-white">
        <div className="mt-3 text-center">
          <h3 className="text-lg leading-6 font-medium text-gray-900">Tambah Respon untuk Surat: {document.nomor_surat}</h3>
          <div className="mt-2 px-7 py-3">
            <form onSubmit={handleSubmit}>
              {error && <p className="text-red-500 text-sm mb-4 text-center">{error}</p>}
              {success && <p className="text-green-500 text-sm mb-4 text-center">{success}</p>}

              <div className="mb-4">
                <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="response_document_modal">Lampiran Respons (PDF, JPG, PNG)</label>
                <input
                  type="file"
                  id="response_document_modal"
                  onChange={handleFileChange}
                  className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
                  accept=".pdf,.jpg,.jpeg,.png"
                />
              </div>
              <div className="mb-4">
                <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="response_keterangan_modal">Keterangan Respons</label>
                <textarea
                  id="response_keterangan_modal"
                  value={responseKeterangan}
                  onChange={(e) => setResponseKeterangan(e.target.value)}
                  className="input-field h-20"
                  placeholder="Keterangan untuk respons surat"
                ></textarea>
              </div>

              <div className="items-center px-4 py-3">
                <button
                  type="submit"
                  className="px-4 py-2 bg-blue-500 text-white text-base font-medium rounded-md w-full shadow-sm hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  disabled={loading}
                >
                  {loading ? 'Menyimpan...' : 'Simpan Respon'}
                </button>
                <button
                  type="button"
                  onClick={onClose}
                  className="mt-3 px-4 py-2 bg-gray-300 text-gray-800 text-base font-medium rounded-md w-full shadow-sm hover:bg-gray-400 focus:outline-none focus:ring-2 focus:ring-gray-300"
                  disabled={loading}
                >
                  Batal
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AddResponseModal;
