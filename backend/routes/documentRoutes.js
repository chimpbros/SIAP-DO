const express = require('express');
const documentController = require('../controllers/documentController');
const { protect } = require('../middleware/authMiddleware');
const { uploadFields } = require('../middleware/uploadMiddleware'); // Multer middleware

const router = express.Router();

// POST /api/documents - Add a new document (requires file upload)
// POST /api/documents - Add a new document (requires file upload, optional response file)
router.post(
  '/',
  protect,
  uploadFields, // Use the new middleware for multiple fields
  documentController.addDocument
);

// GET /api/documents - List all accessible documents (with filters and pagination)
router.get('/', protect, documentController.listDocuments);

// GET /api/documents/recent - Get recent documents for dashboard
router.get('/recent', protect, documentController.getRecentDocuments);

// GET /api/documents/export/excel - Export documents to Excel
router.get('/export/excel', protect, documentController.exportDocumentsToExcel);

// GET /api/documents/:documentId/preview - Preview a specific document attachment
// Accepts optional query parameter 'fileType' ('original', 'disposition', 'response')
router.get('/:documentId/preview', protect, documentController.previewDocument);

// GET /api/documents/:documentId/download - Download a specific document attachment
router.get('/:documentId/download', protect, documentController.downloadDocument);

// DELETE /api/documents/:documentId - Delete a specific document
router.delete('/:documentId', protect, documentController.deleteDocument);


// GET /api/documents/unresponded - List unresponded Surat Masuk
router.get('/unresponded', protect, documentController.listUnrespondedDocuments); // New route and controller function

// PUT /api/documents/:documentId/respond - Add response to a Surat Masuk
router.put(
  '/:documentId/respond',
  protect,
  uploadFields, // Use the middleware to handle optional response file upload
  documentController.addResponse // New controller function
);

// PUT /api/documents/:documentId/disposition-followup - Update disposition and follow-up
router.put(
  '/:documentId/disposition-followup',
  protect,
  uploadFields, // Handles 'dispositionAttachment' and 'responseDocument'
  documentController.updateDispositionAndFollowUp
);

// DELETE /api/documents/responses/:responseId - Delete a specific response document
router.delete('/responses/:responseId', protect, documentController.deleteResponse);

module.exports = router;
