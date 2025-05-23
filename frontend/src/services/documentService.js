import api from './api';

const DocumentService = {
  addDocument: async (formData) => {
    // formData is expected to be a FormData object
    try {
      const response = await api.post('/documents', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
      return response.data;
    } catch (error) {
      throw error.response?.data || { message: 'Failed to add document due to network error.' };
    }
  },

  listDocuments: async (params) => {
    // params: { searchTerm, month, year, page, limit }
    try {
      const response = await api.get('/documents', { params });
      return response.data; // Expected: { documents, currentPage, totalPages, totalItems }
    } catch (error) {
      throw error.response?.data || { message: 'Failed to fetch documents due to network error.' };
    }
  },

  previewDocumentUrl: (documentId) => {
    // This returns a URL that can be used in an <img> or <embed> or opened in new tab.
    // The actual file serving is handled by the backend, protected by auth middleware.
    // Token is added by axios interceptor.
    // This URL is fine if the backend can also authenticate via session cookie for direct browser access,
    // but for pure token-based auth, we need to fetch via JS.
    // Keeping this for reference or if direct GET is ever needed without JS fetch.
    return `${api.defaults.baseURL}/documents/${documentId}/preview`; 
  },

  getDocumentAsBlob: async (documentId, actionType = 'preview') => { // actionType can be 'preview' or 'download'
    try {
      const response = await api.get(`/documents/${documentId}/${actionType}`, {
        responseType: 'blob', // Important for file data
      });
      return response.data; // This will be a Blob
    } catch (error) {
      console.error(`Error fetching document for ${actionType}:`, error);
      throw error.response?.data || { message: `Failed to fetch document for ${actionType}.` };
    }
  },
  
  // downloadDocumentUrl: (documentId) => { // This will be replaced by getDocumentAsBlob
  //   return `${api.defaults.baseURL}/documents/${documentId}/download`;
  // },

  exportDocumentsToExcelUrl: (params) => {
    // params: { searchTerm, month, year }
    const queryParams = new URLSearchParams(params).toString();
    return `${api.defaults.baseURL}/documents/export/excel?${queryParams}`;
    // Note: Token will be added by interceptor if this URL is fetched via api.get()
    // If used in window.open or <a> tag, token handling might need adjustment or backend session.
    // For simplicity, if backend session is not used, this might require a GET request via axios that handles blob response.
  },

  downloadExcelExport: async (params) => {
    try {
      const response = await api.get('/documents/export/excel', { 
        params,
        responseType: 'blob', // Important for file downloads
      });
      // Create a link and click it to trigger download
      const url = window.URL.createObjectURL(new Blob([response.data], { type: response.headers['content-type'] || 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' }));
      const link = document.createElement('a');
      link.href = url;
      const contentDisposition = response.headers['content-disposition'];
      let fileName = 'exported_documents.xlsx'; // Default filename
      if (contentDisposition) {
          const fileNameMatch = contentDisposition.match(/filename="?(.+)"?/i);
          if (fileNameMatch && fileNameMatch.length === 2) fileName = fileNameMatch[1];
      }
      link.setAttribute('download', fileName);
      document.body.appendChild(link);
      link.click();
      link.remove(); // Clean up the link element
      window.URL.revokeObjectURL(url); // Clean up the blob URL
      return { success: true, message: 'File download initiated.' }; // Or simply return nothing on success
    } catch (error) {
      // Handle error, perhaps by trying to parse error response if it's JSON
      // For blob responses, error might not be easily parsable as JSON if server sends error with wrong content-type
      console.error('Excel download error:', error);
      const errorMessage = error.response?.data?.message || error.message || 'Gagal mengunduh file Excel.';
      // If error.response.data is a Blob, it needs to be read as text
      if (error.response && error.response.data instanceof Blob && error.response.data.type.includes('application/json')) {
        try {
            const errorJson = JSON.parse(await error.response.data.text());
            throw errorJson; // Throw the parsed JSON error object
        } catch (parseError) {
            console.error('Error parsing blob error response:', parseError);
            throw { message: errorMessage };
        }
      }
      throw { message: errorMessage };
    }
  },

  deleteDocument: async (documentId) => {
    try {
      const response = await api.delete(`/documents/${documentId}`);
      return response.data; // Expected: { message: 'Dokumen berhasil dihapus.' }
    } catch (error) {
      console.error('Error deleting document:', error);
      throw error.response?.data || { message: 'Failed to delete document due to network error.' };
    }
  },

  // New function to list unresponded Surat Masuk documents
  listUnrespondedDocuments: async (params) => {
    // params: { searchTerm, month, year, page, limit }
    try {
      const response = await api.get('/documents/unresponded', { params });
      return response.data; // Expected: { documents, currentPage, totalPages, totalItems }
    } catch (error) {
      console.error('Error fetching unresponded documents:', error);
      throw error.response?.data || { message: 'Failed to fetch unresponded documents due to network error.' };
    }
  },

  // New function to add response to a Surat Masuk document
  addResponse: async (documentId, formData) => {
    // formData is expected to be a FormData object containing responseDocument and response_keterangan
    try {
      const response = await api.put(`/documents/${documentId}/respond`, formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
      return response.data; // Expected: { message, document }
    } catch (error) {
      console.error('Error adding response:', error);
      throw error.response?.data || { message: 'Failed to add response due to network error.' };
    }
  },

  // New function to delete a response document
  deleteResponse: async (responseId) => {
    try {
      const response = await api.delete(`/documents/responses/${responseId}`);
      return response.data; // Expected: { message: 'Respon dokumen berhasil dihapus.' }
    } catch (error) {
      console.error('Error deleting response document:', error);
      throw error.response?.data || { message: 'Failed to delete response document due to network error.' };
    }
  },

  getRecentDocuments: async (params) => {
    // params: { limit }
    try {
      const response = await api.get('/documents/recent', { params });
      // Expected: { documents: [...] }
      return response.data;
    } catch (error) {
      console.error('Error fetching recent documents:', error);
      throw error.response?.data || { message: 'Failed to fetch recent documents due to network error.' };
    }
  },

  updateDispositionAndFollowUp: async (documentId, formData) => {
    // formData is expected to be a FormData object
    // It may contain: isi_disposisi, response_keterangan,
    // dispositionAttachment (file), responseDocument (file),
    // deleteDispositionAttachment (boolean string), deleteResponseDocument (boolean string)
    try {
      const response = await api.put(`/documents/${documentId}/disposition-followup`, formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
      return response.data; // Expected: { message, document }
    } catch (error) {
      console.error('Error updating disposition and follow-up:', error);
      throw error.response?.data || { message: 'Failed to update disposition and follow-up due to network error.' };
    }
  }
};

export default DocumentService;
