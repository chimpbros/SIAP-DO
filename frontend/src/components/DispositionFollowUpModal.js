import React, { useState, useEffect } from 'react';
import DocumentService from '../services/documentService'; // Assuming DocumentService will handle updates

const DispositionFollowUpModal = ({ document, onClose, onActionComplete }) => {
  const [dispositionKeterangan, setDispositionKeterangan] = useState('');
  const [dispositionFile, setDispositionFile] = useState(null);
  const [dispositionFilePreview, setDispositionFilePreview] = useState('');

  const [followUpKeterangan, setFollowUpKeterangan] = useState('');
  const [followUpFile, setFollowUpFile] = useState(null);
  const [followUpFilePreview, setFollowUpFilePreview] = useState('');

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  useEffect(() => {
    if (document) {
      setDispositionKeterangan(document.isi_disposisi || '');
      // Assuming document.disposition_attachment_path holds the URL or identifier
      setDispositionFilePreview(document.disposition_attachment_path || ''); 

      setFollowUpKeterangan(document.response_keterangan || '');
      setFollowUpFilePreview(document.response_storage_path || '');
    } else {
      // Reset fields if no document is passed (e.g., modal closed and reopened)
      setDispositionKeterangan('');
      setDispositionFile(null);
      setDispositionFilePreview('');
      setFollowUpKeterangan('');
      setFollowUpFile(null);
      setFollowUpFilePreview('');
    }
  }, [document]);

  const handleFileChange = (e, type) => {
    const file = e.target.files[0];
    if (file) {
      const maxSize = 2 * 1024 * 1024; // 2MB
      if (file.size > maxSize) {
        setError(`Ukuran file tidak boleh melebihi 2MB. File Anda: ${(file.size / (1024 * 1024)).toFixed(2)}MB`);
        if (type === 'disposition') setDispositionFile(null);
        if (type === 'followUp') setFollowUpFile(null);
        e.target.value = null; // Clear the input
        return;
      }
      setError('');
      if (type === 'disposition') {
        setDispositionFile(file);
        setDispositionFilePreview(URL.createObjectURL(file)); // Show client-side preview
      }
      if (type === 'followUp') {
        setFollowUpFile(file);
        setFollowUpFilePreview(URL.createObjectURL(file)); // Show client-side preview
      }
    }
  };

  const handleRemoveFile = (type) => {
    if (type === 'disposition') {
      setDispositionFile(null);
      setDispositionFilePreview(''); // Also clear preview if it was from an existing file
      // If there was an existing file on the document, mark for deletion on submit
      // This requires more complex state or a specific API call.
      // For now, just clears client-side selection.
    }
    if (type === 'followUp') {
      setFollowUpFile(null);
      setFollowUpFilePreview('');
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setSuccess('');

    const formData = new FormData();
    formData.append('document_id', document.document_id);

    // Disposition
    formData.append('isi_disposisi', dispositionKeterangan);
    if (dispositionFile) {
      formData.append('dispositionAttachment', dispositionFile);
    } else if (dispositionFilePreview === '' && document.disposition_attachment_path) {
      // If preview is cleared and there was an existing file, signal deletion
      formData.append('deleteDispositionAttachment', 'true');
    }

    // Follow-up (Tindak Lanjut)
    formData.append('response_keterangan', followUpKeterangan);
    if (followUpFile) {
      formData.append('responseDocument', followUpFile); // Matches existing backend field name
    } else if (followUpFilePreview === '' && document.response_storage_path) {
      formData.append('deleteResponseDocument', 'true');
    }
    
    try {
      await DocumentService.updateDispositionAndFollowUp(document.document_id, formData);
      
      setSuccess('Disposisi / Tindak Lanjut berhasil diperbarui.');
      if (onActionComplete) {
        onActionComplete(); // Refresh data in parent component
      }
      // Keep modal open for a bit to show success, then close
      setTimeout(() => {
        setSuccess(''); // Clear success message before closing
        onClose();
      }, 2000);

    } catch (err) {
      console.error("Error updating disposition/follow-up:", err);
      setError(err.message || 'Gagal memperbarui data.');
    } finally {
      setLoading(false);
    }
  };

  if (!document) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 overflow-y-auto h-full w-full z-50 flex items-center justify-center p-4">
      <div className="relative bg-content-bg p-6 sm:p-8 rounded-xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-text-secondary hover:text-text-primary transition-colors"
          aria-label="Close modal"
        >
          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-7 h-7">
            <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>

        <h2 className="text-xl sm:text-2xl font-semibold text-text-primary mb-6 text-center">
          Tambahkan Disposisi / Tindak Lanjut
        </h2>
        <p className="text-sm text-text-secondary mb-1 text-center">Untuk Surat: <span className="font-medium">{document.nomor_surat}</span></p>
        <p className="text-xs text-text-light mb-6 text-center">Perihal: {document.perihal}</p>


        <form onSubmit={handleSubmit} className="space-y-6">
          {error && <p className="text-danger text-sm text-center py-2 bg-red-50 rounded-md">{error}</p>}
          {success && <p className="text-success text-sm text-center py-2 bg-green-50 rounded-md">{success}</p>}

          {/* Disposisi Section */}
          <div className="p-4 border border-border-color rounded-lg">
            <h3 className="text-lg font-medium text-text-primary mb-3 flex items-center">
              <img src={process.env.PUBLIC_URL + '/apps.svg'} alt="Disposisi" className="w-5 h-5 mr-2 opacity-70" /> {/* Placeholder icon */}
              Disposisi
            </h3>
            <div>
              <label htmlFor="dispositionKeterangan" className="block text-sm font-medium text-text-secondary mb-1">Keterangan Disposisi:</label>
              <textarea
                id="dispositionKeterangan"
                value={dispositionKeterangan}
                onChange={(e) => setDispositionKeterangan(e.target.value)}
                className="input-field min-h-[80px]"
                placeholder="Isi keterangan disposisi..."
              />
            </div>
            <div className="mt-3">
              <label htmlFor="dispositionFile" className="block text-sm font-medium text-text-secondary mb-1">Lampiran Disposisi (PDF, JPG, PNG - Max 2MB):</label>
              <div className="flex items-center space-x-3">
                <input
                  type="file"
                  id="dispositionFile"
                  onChange={(e) => handleFileChange(e, 'disposition')}
                  className="block w-full text-sm text-text-secondary file:mr-3 file:py-2 file:px-3 file:rounded-lg file:border-0 file:text-sm file:font-semibold file:bg-primary file:text-white hover:file:bg-primary-dark cursor-pointer"
                  accept=".pdf,.jpg,.jpeg,.png"
                />
                {dispositionFilePreview && (
                  <button type="button" onClick={() => handleRemoveFile('disposition')} className="text-danger hover:text-red-700 p-1">
                     <img src={process.env.PUBLIC_URL + '/binArchive.png'} alt="Remove" className="w-5 h-5" />
                  </button>
                )}
              </div>
              {dispositionFilePreview && !dispositionFile && <p className="text-xs text-text-light mt-1">File terlampir: <a href={dispositionFilePreview} target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">{document.disposition_attachment_filename || 'Lihat File'}</a></p>}
              {dispositionFile && <p className="text-xs text-text-light mt-1">File baru: {dispositionFile.name}</p>}
            </div>
          </div>

          {/* Tindak Lanjut Section */}
          <div className="p-4 border border-border-color rounded-lg">
            <h3 className="text-lg font-medium text-text-primary mb-3 flex items-center">
              <img src={process.env.PUBLIC_URL + '/list.svg'} alt="Tindak Lanjut" className="w-5 h-5 mr-2 opacity-70" /> {/* Placeholder icon */}
              Tindak Lanjut
            </h3>
            <div>
              <label htmlFor="followUpKeterangan" className="block text-sm font-medium text-text-secondary mb-1">Keterangan Tindak Lanjut:</label>
              <textarea
                id="followUpKeterangan"
                value={followUpKeterangan}
                onChange={(e) => setFollowUpKeterangan(e.target.value)}
                className="input-field min-h-[80px]"
                placeholder="Isi keterangan tindak lanjut..."
              />
            </div>
            <div className="mt-3">
              <label htmlFor="followUpFile" className="block text-sm font-medium text-text-secondary mb-1">Lampiran Tindak Lanjut (PDF, JPG, PNG - Max 2MB):</label>
               <div className="flex items-center space-x-3">
                <input
                  type="file"
                  id="followUpFile"
                  onChange={(e) => handleFileChange(e, 'followUp')}
                  className="block w-full text-sm text-text-secondary file:mr-3 file:py-2 file:px-3 file:rounded-lg file:border-0 file:text-sm file:font-semibold file:bg-primary file:text-white hover:file:bg-primary-dark cursor-pointer"
                  accept=".pdf,.jpg,.jpeg,.png"
                />
                 {followUpFilePreview && (
                  <button type="button" onClick={() => handleRemoveFile('followUp')} className="text-danger hover:text-red-700 p-1">
                     <img src={process.env.PUBLIC_URL + '/binArchive.png'} alt="Remove" className="w-5 h-5" />
                  </button>
                )}
              </div>
              {followUpFilePreview && !followUpFile && <p className="text-xs text-text-light mt-1">File terlampir: <a href={followUpFilePreview} target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">{document.response_original_filename || 'Lihat File'}</a></p>}
              {followUpFile && <p className="text-xs text-text-light mt-1">File baru: {followUpFile.name}</p>}
            </div>
          </div>

          <div className="flex justify-end space-x-3 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="px-6 py-2.5 border border-border-color text-text-secondary rounded-lg hover:bg-gray-100 transition-colors duration-150 text-sm font-medium"
              disabled={loading}
            >
              Batal
            </button>
            <button
              type="submit"
              className="px-6 py-2.5 bg-primary hover:bg-primary-dark text-white font-medium rounded-lg focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary transition-colors duration-150 text-sm"
              disabled={loading}
            >
              {loading ? 'Menyimpan...' : 'Simpan Perubahan'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default DispositionFollowUpModal;