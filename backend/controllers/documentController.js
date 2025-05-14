const Document = require('../models/Document');
const path = require('path');
const fs = require('fs');
const ExcelJS = require('exceljs');

const { uploadFields } = require('../middleware/uploadMiddleware'); // Assuming uploadMiddleware exports as { uploadFields }

// Helper to create month_year string
const getCurrentMonthYear = () => {
  const now = new Date();
  const year = now.getFullYear();
  const month = (now.getMonth() + 1).toString().padStart(2, '0');
  return `${year}-${month}`;
};

exports.addDocument = async (req, res) => {
  // Use uploadFields middleware here (applied in routes)
  // Files will be in req.files, other fields in req.body

  const {
    tipe_surat,
    jenis_surat,
    nomor_surat,
    perihal,
    pengirim,
    isi_disposisi,
    response_keterangan, // New field for response description
    archive_without_response // New flag for archiving unresponded Surat Masuk
  } = req.body;

  const uploader_user_id = req.user.userId; // From authMiddleware

  const originalDocument = req.files && req.files['originalDocument'] ? req.files['originalDocument'][0] : null;
  const responseDocument = req.files && req.files['responseDocument'] ? req.files['responseDocument'][0] : null;

  // --- Validation ---
  if (!originalDocument) {
    return res.status(400).json({ message: 'Lampiran surat wajib diisi.' });
  }

  if (!tipe_surat || !jenis_surat || !nomor_surat || !perihal) {
    // Clean up uploaded files if validation fails early
    if (originalDocument) fs.unlinkSync(originalDocument.path);
    if (responseDocument) fs.unlinkSync(responseDocument.path);
    return res.status(400).json({ message: 'Field Tipe Surat, Jenis Surat, Nomor Surat, dan Perihal wajib diisi.' });
  }

  if (tipe_surat === 'Surat Masuk' && req.body.archive_without_response === undefined && (!pengirim || !isi_disposisi)) {
    // Clean up uploaded files
    if (originalDocument) fs.unlinkSync(originalDocument.path);
    if (responseDocument) fs.unlinkSync(responseDocument.path);
    return res.status(400).json({ message: 'Untuk Surat Masuk, Pengirim dan Isi Disposisi wajib diisi.' });
  }
  // --- End Validation ---

  const original_storage_path = originalDocument.path; // Path provided by multer
  const original_filename = originalDocument.originalname;
  const month_year = getCurrentMonthYear();

  // --- Handle Response Data ---
  let response_storage_path = null;
  let response_original_filename = null;
  let response_upload_timestamp = null;
  let has_responded = false;

  // Check if a response is provided or if archiving without response is requested
  if (tipe_surat === 'Surat Masuk') {
      if (responseDocument) {
          response_storage_path = responseDocument.path;
          response_original_filename = responseDocument.originalname;
          response_upload_timestamp = new Date(); // Set timestamp if response document is uploaded
          has_responded = true;
      }

      // If response_keterangan is provided, consider it responded
      if (response_keterangan && response_keterangan.trim() !== '') {
          has_responded = true;
      }

      // If archive_without_response === true, consider it responded for archiving purposes
      if (archive_without_response === true) { // Ensure it's explicitly true
          has_responded = true;
      }
  } else {
      // For non 'Surat Masuk', it's considered responded by default for archiving purposes
      has_responded = true;
  }
  // --- End Handle Response Data ---


  try {
    const newDocument = await Document.create({
      tipe_surat,
      jenis_surat,
      nomor_surat,
      perihal,
      pengirim: tipe_surat === 'Surat Masuk' ? pengirim : null,
      isi_disposisi: tipe_surat === 'Surat Masuk' ? isi_disposisi : null,
      storage_path: original_storage_path, // Use original_storage_path for the main document
      original_filename,
      uploader_user_id,
      month_year,
      // New fields for response
      response_storage_path,
      response_original_filename,
      response_upload_timestamp,
      response_keterangan: response_keterangan || null, // Save keterangan
      has_responded, // Save the determined status
    });
    console.log('New document after addDocument:', newDocument); // Added logging
    res.status(201).json({ message: 'Dokumen berhasil ditambahkan.', document: newDocument });
  } catch (error) {
    console.error('Error adding document:', error);
    // Clean up uploaded files in case of database error
    if (originalDocument) fs.unlinkSync(originalDocument.path);
    if (responseDocument) fs.unlinkSync(responseDocument.path);
    res.status(500).json({ message: 'Terjadi kesalahan pada server saat menambahkan dokumen.' });
  }
};

exports.listDocuments = async (req, res) => {
  const { searchTerm, month, year, page = 1, limit = 10 } = req.query;
  const userIsAdmin = req.user.isAdmin;
  const offset = (parseInt(page, 10) - 1) * parseInt(limit, 10);

  try {
    const { documents, totalItems } = await Document.findAll({
      searchTerm,
      filterMonth: month,
      filterYear: year,
      userIsAdmin,
      limit: parseInt(limit, 10),
      offset,
    });

    res.status(200).json({
      documents,
      currentPage: parseInt(page, 10),
      totalPages: Math.ceil(totalItems / parseInt(limit, 10)),
      totalItems,
    });
  } catch (error) {
    console.error('Error listing documents:', error);
    res.status(500).json({ message: 'Terjadi kesalahan pada server.' });
  }
};

exports.previewDocument = async (req, res) => {
  const { documentId } = req.params;
  const userIsAdmin = req.user.isAdmin;

  try {
    const document = await Document.findById(documentId);
    if (!document) {
      return res.status(404).json({ message: 'Dokumen tidak ditemukan.' });
    }

    if (document.jenis_surat === 'STR' && !userIsAdmin) {
      return res.status(403).json({ message: 'Anda tidak memiliki izin untuk melihat dokumen STR.' });
    }

    const filePath = path.resolve(document.storage_path);

    if (fs.existsSync(filePath)) {
      res.sendFile(filePath);
    } else {
      res.status(404).json({ message: 'File lampiran tidak ditemukan di server.' });
    }
  } catch (error) {
    console.error('Error previewing document:', error);
    res.status(500).json({ message: 'Terjadi kesalahan pada server.' });
  }
};

exports.downloadDocument = async (req, res) => {
  const { documentId } = req.params;
  const userIsAdmin = req.user.isAdmin;

  try {
    const document = await Document.findById(documentId);
    if (!document) {
      return res.status(404).json({ message: 'Dokumen tidak ditemukan.' });
    }

    if (document.jenis_surat === 'STR' && !userIsAdmin) {
      return res.status(403).json({ message: 'Anda tidak memiliki izin untuk mengunduh dokumen STR.' });
    }

    const filePath = path.resolve(document.storage_path);
    if (fs.existsSync(filePath)) {
      res.download(filePath, document.original_filename, (err) => {
        if (err) {
          console.error('Error during file download:', err);
          // Check if headers were already sent
          if (!res.headersSent) {
            res.status(500).json({ message: 'Gagal mengunduh file.' });
          }
        }
      });
    } else {
      res.status(404).json({ message: 'File lampiran tidak ditemukan di server.' });
    }
  } catch (error) {
    console.error('Error downloading document:', error);
    if (!res.headersSent) {
      res.status(500).json({ message: 'Terjadi kesalahan pada server.' });
    }
  }
};

exports.deleteDocument = async (req, res) => {
  const { documentId } = req.params;
  const userIsAdmin = req.user.isAdmin; // From authMiddleware

  // Optional: Add check here if only admin can delete
  if (!userIsAdmin) {
     return res.status(403).json({ message: 'Anda tidak memiliki izin untuk menghapus dokumen.' });
  }

  try {
    // Find the document first to get the storage path
    const document = await Document.findById(documentId);
    if (!document) {
      return res.status(404).json({ message: 'Dokumen tidak ditemukan.' });
    }

    // Delete the file from the filesystem
    const filePath = path.resolve(document.storage_path);
    if (fs.existsSync(filePath)) {
      fs.unlinkSync(filePath);
      console.log(`Deleted file: ${filePath}`);
    } else {
      console.warn(`File not found for deletion: ${filePath}`);
      // Continue with database deletion even if file is missing
    }

    // Delete the document record from the database
    const deletedCount = await Document.deleteById(documentId);

    if (deletedCount === 0) {
       // This case should ideally not happen if findById found the document,
       // but it's a safeguard.
       return res.status(404).json({ message: 'Dokumen tidak ditemukan atau sudah dihapus.' });
    }

    res.status(200).json({ message: 'Dokumen berhasil dihapus.' });

  } catch (error) {
    console.error('Error deleting document:', error);
    res.status(500).json({ message: 'Terjadi kesalahan pada server saat menghapus dokumen.' });
  }
};


// Placeholder for Excel export - to be implemented fully later
exports.exportDocumentsToExcel = async (req, res) => {
  const { searchTerm, month, year } = req.query;
  const userIsAdmin = req.user.isAdmin; // Assuming admin can export all, others based on their view

  try {
    const documents = await Document.findAllForExport({
      searchTerm,
      filterMonth: month,
      filterYear: year,
      userIsAdmin, // This will apply STR filtering if user is not admin
    });

    if (!documents || documents.length === 0) {
      return res.status(404).json({ message: 'Tidak ada dokumen untuk diekspor berdasarkan filter yang diberikan.' });
    }

    const workbook = new ExcelJS.Workbook();
    const worksheet = workbook.addWorksheet('Dokumen Arsip');

    // Define columns
    worksheet.columns = [
      { header: 'Nomor Surat', key: 'nomor_surat', width: 30 },
      { header: 'Tipe Surat', key: 'tipe_surat', width: 15 },
      { header: 'Jenis Surat', key: 'jenis_surat', width: 15 },
      { header: 'Perihal', key: 'perihal', width: 50 },
      { header: 'Pengirim', key: 'pengirim', width: 30 },
      { header: 'Isi Disposisi', key: 'isi_disposisi', width: 50 },
      { header: 'Tanggal Upload', key: 'tanggal_upload', width: 20 },
      { header: 'Uploader Nama', key: 'uploader_nama', width: 25 },
      { header: 'Uploader NRP', key: 'uploader_nrp', width: 15 },
      { header: 'Nama File Asli', key: 'original_filename', width: 30 },
    ];

    // Add rows
    documents.forEach(doc => {
      worksheet.addRow({
        ...doc,
        pengirim: doc.pengirim || 'N/A', // Handle null pengirim
        isi_disposisi: doc.isi_disposisi || 'N/A' // Handle null isi_disposisi
      });
    });

    // Set response headers for Excel download
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
    const fileName = `arsip_dokumen_${timestamp}.xlsx`;
    res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
    res.setHeader('Content-Disposition', `attachment; filename=${fileName}`);

    await workbook.xlsx.write(res);
    res.end();

  } catch (error) {
    console.error('Error exporting documents to Excel:', error);
    if (!res.headersSent) {
      res.status(500).json({ message: 'Terjadi kesalahan pada server saat mengekspor dokumen.' });
    }
  }
};

// New controller function to list unresponded Surat Masuk
exports.listUnrespondedDocuments = async (req, res) => {
  const { searchTerm, month, year, page = 1, limit = 10 } = req.query;
  const userIsAdmin = req.user.isAdmin; // Assuming only admin can see unresponded list

  if (!userIsAdmin) {
    return res.status(403).json({ message: 'Anda tidak memiliki izin untuk melihat daftar surat yang belum direspon.' });
  }

  const offset = (parseInt(page, 10) - 1) * parseInt(limit, 10);

  try {
    // Need to add a method in Document model to find unresponded documents
    const { documents, totalItems } = await Document.findUnresponded({
      searchTerm,
      filterMonth: month,
      filterYear: year,
      limit: parseInt(limit, 10),
      offset,
    });

    res.status(200).json({
      documents,
      currentPage: parseInt(page, 10),
      totalPages: Math.ceil(totalItems / parseInt(limit, 10)),
      totalItems,
    });
  } catch (error) {
    console.error('Error listing unresponded documents:', error);
    res.status(500).json({ message: 'Terjadi kesalahan pada server.' });
  }
};

// New controller function to add response to a Surat Masuk
exports.addResponse = async (req, res) => {
  const { documentId } = req.params;
  const { response_keterangan } = req.body;
  const uploader_user_id = req.user.userId; // User adding the response

  const responseDocument = req.files && req.files['responseDocument'] ? req.files['responseDocument'][0] : null;

  try {
    const document = await Document.findById(documentId);
    if (!document) {
      // Clean up uploaded file if document not found
      if (responseDocument) fs.unlinkSync(responseDocument.path);
      return res.status(404).json({ message: 'Dokumen tidak ditemukan.' });
    }

    // Ensure the document is a Surat Masuk and hasn't been responded to yet
    if (document.tipe_surat !== 'Surat Masuk' || document.has_responded) {
         // Clean up uploaded file
        if (responseDocument) fs.unlinkSync(responseDocument.path);
        return res.status(400).json({ message: 'Dokumen ini bukan Surat Masuk atau sudah memiliki respon.' });
    }

    // Prepare update data
    const updateData = {
        has_responded: true,
        response_keterangan: response_keterangan || null,
    };

    // Add response document details if uploaded
    if (responseDocument) {
        updateData.response_storage_path = responseDocument.path;
        updateData.response_original_filename = responseDocument.originalname;
        updateData.response_upload_timestamp = new Date();
    } else if (!response_keterangan || response_keterangan.trim() === '') {
        // If no file and no keterangan, maybe don't mark as responded?
        // Based on plan, if response is blank, it can still be archived.
        // The 'archive_without_response' flag in addDocument handles the initial archive.
        // This endpoint is specifically for ADDING a response later.
        // If no file and no keterangan are provided here, it means no response is being added.
        // We should probably return an error or just do nothing if no response data is provided.
        // Let's return an error if no response data is provided when using this endpoint.
         if (responseDocument) fs.unlinkSync(responseDocument.path); // Clean up if only file was missing
         return res.status(400).json({ message: 'Mohon unggah dokumen respon atau isi keterangan respon.' });
    }


    // Update the document in the database
    const updatedDocument = await Document.updateById(documentId, updateData);
    console.log('Updated document after addResponse:', updatedDocument); // Added logging

    res.status(200).json({ message: 'Respon berhasil ditambahkan.', document: updatedDocument });

  } catch (error) {
    console.error('Error adding response:', error);
     // Clean up uploaded file in case of error
    if (responseDocument) fs.unlinkSync(responseDocument.path);
    res.status(500).json({ message: 'Terjadi kesalahan pada server saat menambahkan respon.' });
  }
};
