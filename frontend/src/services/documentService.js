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
    return `${api.defaults.baseURL}/documents/${documentId}/preview`;
  },
  
  downloadDocumentUrl: (documentId) => {
    // Similar to preview, returns a URL for download.
    return `${api.defaults.baseURL}/documents/${documentId}/download`;
  },

  exportDocumentsToExcelUrl: (params) => {
    // params: { searchTerm, month, year }
    const queryParams = new URLSearchParams(params).toString();
    return `${api.defaults.baseURL}/documents/export/excel?${queryParams}`;
    // Note: Token will be added by interceptor if this URL is fetched via api.get()
    // If used in window.open or <a> tag, token handling might need adjustment or backend session.
    // For simplicity, if backend session is not used, this might require a GET request via axios that handles blob response.
  },

  // Placeholder for actual Excel download if direct URL with token is problematic
  // downloadExcelExport: async (params) => {
  //   try {
  //     const response = await api.get('/documents/export/excel', { 
  //       params,
  //       responseType: 'blob', // Important for file downloads
  //     });
  //     // Create a link and click it to trigger download
  //     const url = window.URL.createObjectURL(new Blob([response.data]));
  //     const link = document.createElement('a');
  //     link.href = url;
  //     const contentDisposition = response.headers['content-disposition'];
  //     let fileName = 'exported_documents.xlsx';
  //     if (contentDisposition) {
  //         const fileNameMatch = contentDisposition.match(/filename="?(.+)"?/i);
  //         if (fileNameMatch.length === 2) fileName = fileNameMatch[1];
  //     }
  //     link.setAttribute('download', fileName);
  //     document.body.appendChild(link);
  //     link.click();
  //     link.remove();
  //     window.URL.revokeObjectURL(url);
  //     return { success: true, message: 'File downloaded.' };
  //   } catch (error) {
  //     throw error.response?.data || { message: 'Failed to download Excel file.' };
  //   }
  // }
};

export default DocumentService;
