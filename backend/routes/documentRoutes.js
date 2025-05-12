const express = require('express');
const documentController = require('../controllers/documentController');
const { protect } = require('../middleware/authMiddleware');
const upload = require('../middleware/uploadMiddleware'); // Multer middleware

const router = express.Router();

// POST /api/documents - Add a new document (requires file upload)
router.post(
  '/',
  protect,
  upload.single('lampiran_surat'), // 'lampiran_surat' is the field name in the form
  documentController.addDocument
);

// GET /api/documents - List all accessible documents (with filters and pagination)
router.get('/', protect, documentController.listDocuments);

// GET /api/documents/export/excel - Export documents to Excel
router.get('/export/excel', protect, documentController.exportDocumentsToExcel);

// GET /api/documents/:documentId/preview - Preview a specific document attachment
router.get('/:documentId/preview', protect, documentController.previewDocument);

// GET /api/documents/:documentId/download - Download a specific document attachment
router.get('/:documentId/download', protect, documentController.downloadDocument);

// DELETE /api/documents/:documentId - Delete a specific document
router.delete('/:documentId', protect, documentController.deleteDocument);


module.exports = router;
