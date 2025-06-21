const Document = require('../models/Document');
const path = require('path');
const fs = require('fs');
const ExcelJS = require('exceljs');

const { uploadFields } = require('../middleware/uploadMiddleware'); // Assuming uploadMiddleware exports as { uploadFields }

const truncateFilename = (filename, maxLength = 200) => {
  const ext = path.extname(filename);
  const nameWithoutExt = path.basename(filename, ext);
  if (nameWithoutExt.length > maxLength) {
    const truncatedName = nameWithoutExt.substring(0, maxLength);
    return truncatedName + ext;
  }
  return filename;
};

// Helper to create month_year string
const getCurrentMonthYear = (date) => {
  const d = date ? new Date(date) : new Date();
  const year = d.getFullYear();
  const month = (d.getMonth() + 1).toString().padStart(2, '0');
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
    // isi_disposisi, response_keterangan, archive_without_response are removed
    // as they are handled by the modal flow now.
    tanggal_masuk_surat, // New: Date of document entry
  } = req.body;

  const uploader_user_id = req.user.userId; // From authMiddleware

  const originalDocument = req.files && req.files['originalDocument'] ? req.files['originalDocument'][0] : null;
  // const responseDocument = req.files && req.files['responseDocument'] ? req.files['responseDocument'][0] : null; // Response document not handled here anymore

  // --- Validation ---
  if (!originalDocument) {
    return res.status(400).json({ message: 'Lampiran surat wajib diisi.' });
  }

  // Validate required fields, 'pengirim' is optional for 'Surat Keluar'
  if (!tipe_surat || !jenis_surat || !nomor_surat || !perihal || (tipe_surat !== 'Surat Keluar' && !pengirim)) {
    // Clean up uploaded files if validation fails early
    if (originalDocument) fs.unlinkSync(originalDocument.path);
    // if (responseDocument) fs.unlinkSync(responseDocument.path); // No responseDocument here
    return res.status(400).json({ message: 'Field Tipe Surat, Jenis Surat, Nomor Surat, Perihal, dan Pengirim wajib diisi.' });
  }

  // Removed validation for isi_disposisi and response related fields
  // --- End Validation ---

  // Determine month_year based on tanggal_masuk_surat or current date
  let docDate = new Date(); // Default to current date
  if (tanggal_masuk_surat) {
    try {
      docDate = new Date(tanggal_masuk_surat);
      // Basic validation: check if the date is valid
      if (isNaN(docDate.getTime())) {
         // If invalid date string, fall back to current date
         console.warn(`[DEBUG] addDocument - Invalid tanggal_masuk_surat provided: ${tanggal_masuk_surat}. Using current date.`);
         docDate = new Date();
      }
    } catch (e) {
       // Handle potential parsing errors, fall back to current date
       console.error(`[DEBUG] addDocument - Error parsing tanggal_masuk_surat: ${tanggal_masuk_surat}`, e);
       docDate = new Date();
    }
  }

  const year = docDate.getFullYear();
  const month = (docDate.getMonth() + 1).toString().padStart(2, '0');
  const calculated_month_year = `${year}-${month}`;


  console.log(`[DEBUG] addDocument - Original Document Path (Multer): ${originalDocument.path}`);
  console.log(`[DEBUG] addDocument - Original Document Exists: ${fs.existsSync(originalDocument.path)}`);

  // Store paths relative to the expected mount point inside the Docker container
  const original_storage_path = `/uploads/${path.basename(originalDocument.path)}`;
  const original_filename = originalDocument.originalname;

  // --- Default values for disposition/response fields for new documents ---
  // These will be updated later via the modal flow.
  const isi_disposisi = null; // Default to null
  const response_storage_path = null;
  const response_original_filename = null;
  const response_upload_timestamp = null;
  const response_keterangan = null;
  // For a new document, `has_responded` should be false unless it's 'Surat Keluar'.
  // 'Surat Keluar' doesn't have a response flow in the same way.
  // 'isi_disposisi' is also specific to 'Surat Masuk' and handled later.
  const has_responded = tipe_surat === 'Surat Keluar' ? true : false;
  const disposition_attachment_path = null; // For the new disposition attachment field

  try {
    const newDocumentData = {
      tipe_surat,
      jenis_surat,
      nomor_surat,
      perihal,
      pengirim, // Pengirim is now always present
      isi_disposisi, // Will be null initially for Surat Masuk, or always null for Surat Keluar
      tanggal_masuk_surat: tanggal_masuk_surat ? new Date(tanggal_masuk_surat) : new Date(), // Use provided date or current date
      storage_path: original_storage_path,
      original_filename,
      uploader_user_id,
      month_year: calculated_month_year, // Use the derived month_year
      response_storage_path,
      response_original_filename,
      response_upload_timestamp,
      response_keterangan,
      has_responded,
      disposition_attachment_path, // Add new field
    };

    // If it's a 'Surat Keluar', pengirim might represent the recipient,
    // and isi_disposisi is not applicable.
    // The model's create method will handle inserting these values.

    const newDocument = await Document.create(newDocumentData);
    res.status(201).json({ message: 'Dokumen berhasil ditambahkan.', document: newDocument });
  } catch (error) {
    console.error('Error adding document:', error);
    // Clean up uploaded files in case of database error
    if (originalDocument) fs.unlinkSync(originalDocument.path);
    // if (responseDocument) fs.unlinkSync(responseDocument.path); // No responseDocument here
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
    // The Document.findAll method now uses tanggal_masuk_surat for filtering if provided.
    // No change needed here, just ensure the model method is updated.
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

    // Determine which file path to use for preview based on fileType query parameter
    const fileType = req.query.fileType || 'original'; // Default to 'original'

    console.log(`[DEBUG] previewDocument - Received fileType: ${fileType}`);

    let filePathToPreview = null;
    let originalFilename = null; // To set Content-Disposition header if needed

    switch (fileType) {
      case 'disposition':
        filePathToPreview = document.disposition_attachment_path;
        originalFilename = document.disposition_original_filename;
        break;
      case 'response':
        filePathToPreview = document.response_storage_path;
        originalFilename = document.response_original_filename;
        break;
      case 'original':
      default:
        filePathToPreview = document.storage_path;
        originalFilename = document.original_filename;
        break;
    }

    console.log(`[DEBUG] previewDocument - Selected filePathToPreview from DB: ${filePathToPreview}`);
    console.log(`[DEBUG] previewDocument - Selected originalFilename from DB: ${originalFilename}`);


    if (!filePathToPreview) {
        console.error(`[DEBUG] previewDocument - File path is null for fileType: ${fileType}`);
        return res.status(404).json({ message: `File ${fileType} tidak ditemukan untuk dokumen ini.` });
    }

    // Construct the absolute path on the server's filesystem
    // Assuming the paths stored in the DB are relative to /app/uploads
    const absoluteFilePath = path.join('/app/uploads', path.basename(filePathToPreview));

    console.log(`[DEBUG] previewDocument - Constructed absoluteFilePath: ${absoluteFilePath}`);
    console.log(`[DEBUG] previewDocument - File exists at absoluteFilePath: ${fs.existsSync(absoluteFilePath)}`);


    if (fs.existsSync(absoluteFilePath)) {
      // Set Content-Disposition to inline for preview
      res.setHeader('Content-Disposition', `inline; filename="${originalFilename || 'preview'}"`);
      res.sendFile(absoluteFilePath);
    } else {
      console.error(`[DEBUG] previewDocument - File not found on filesystem: ${absoluteFilePath}`);
      res.status(404).json({ message: `File lampiran (${fileType}) tidak ditemukan di server.` });
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

    const filePath = path.join('/app/uploads', path.basename(document.storage_path));
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
      { header: 'Tanggal Masuk Surat', key: 'tanggal_masuk_surat', width: 20 },
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
      res.status(500).json({ message: 'Terjadi kesalahan pada server.' });
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
        // Store paths relative to the expected mount point inside the Docker container
        updateData.response_storage_path = `/uploads/${path.basename(responseDocument.path)}`;
        const truncatedResponseFilename = truncateFilename(responseDocument.originalname);
        updateData.response_original_filename = truncatedResponseFilename;
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
    console.log(`[DEBUG] addResponse - Response Document Path (Multer): ${responseDocument ? responseDocument.path : 'N/A'}`);
    console.log(`[DEBUG] addResponse - Response Document Exists: ${responseDocument ? fs.existsSync(responseDocument.path) : 'N/A'}`);

    res.status(200).json({ message: 'Respon berhasil ditambahkan.', document: updatedDocument });

  } catch (error) {
    console.error('Error adding response:', error);
     // Clean up uploaded file in case of error
    if (responseDocument) fs.unlinkSync(responseDocument.path);
    res.status(500).json({ message: 'Terjadi kesalahan pada server saat menambahkan respon.' });
  }
};

// New controller function to delete a response document
exports.deleteResponse = async (req, res) => {
  const { responseId } = req.params;
  const userIsAdmin = req.user.isAdmin; // From authMiddleware

  // Optional: Add check here if only admin can delete responses
  if (!userIsAdmin) {
     return res.status(403).json({ message: 'Anda tidak memiliki izin untuk menghapus respon dokumen.' });
  }

  try {
    console.log(`Attempting to delete response with responseId: ${responseId}`);
    // Find the document that has this response file path
    // Assuming responseId in the URL is the filename part of the path
    const document = await Document.findByResponseFilePathPartial(responseId); // Need to add this method to Document model

    if (!document) {
      console.warn(`Document not found for responseId: ${responseId}`);
      return res.status(404).json({ message: 'Respon dokumen tidak ditemukan.' });
    }

    console.log(`Found document with response_storage_path: ${document.response_storage_path}`);

    // Construct the file path relative to the expected mount point inside the Docker container
    const responseFilePath = path.join('/app/uploads', path.basename(document.response_storage_path));

    // Delete the file from the filesystem
    if (fs.existsSync(responseFilePath)) {
      fs.unlinkSync(responseFilePath);
    } else {
      console.warn(`Response file not found for deletion: ${responseFilePath}`);
      // Continue with database update even if file is missing
    }

    // Update the document in the database to remove response details
    const updateData = {
        response_storage_path: null,
        response_original_filename: null,
        response_upload_timestamp: null,
        // Set has_responded to false when the response document is deleted
        has_responded: false,
        response_keterangan: document.response_keterangan || null, // Keep keterangan if it exists
    };

    console.log('Attempting to update document with data:', updateData);
    // Use document.document_id as the primary key is likely named document_id in the database
    const updatedDocument = await Document.updateById(document.document_id, updateData);
    console.log('Document update result:', updatedDocument);

    res.status(200).json({ message: 'Respon dokumen berhasil dihapus.', document: updatedDocument });

  } catch (error) {
    console.error('Error deleting response document:', error);
    // In development, send the actual error message for easier debugging
    const errorMessage = process.env.NODE_ENV === 'development' ? error.message : 'Terjadi kesalahan pada server saat menghapus respon dokumen.';
    res.status(500).json({ message: errorMessage });
  }
};

exports.getRecentDocuments = async (req, res) => {
  const { limit = 10 } = req.query;
  const userIsAdmin = req.user.isAdmin;

  try {
    const documents = await Document.findRecent({
      limit: parseInt(limit, 10),
      userIsAdmin,
    });
    res.status(200).json({ documents });
  } catch (error) {
    console.error('Error fetching recent documents:', error);
    res.status(500).json({ message: 'Terjadi kesalahan pada server saat mengambil dokumen terbaru.' });
  }
};

exports.updateDispositionAndFollowUp = async (req, res) => {
  const { documentId } = req.params;
  const {
    isi_disposisi,
    response_keterangan,
    deleteDispositionAttachment,
    deleteResponseDocument
  } = req.body;
  
  const uploader_user_id = req.user.userId; // Or admin if only admin can do this

  // Files from multer; 'dispositionAttachment' is new, 'responseDocument' is existing for follow-up
  const dispositionAttachmentFile = req.files && req.files['dispositionAttachment'] ? req.files['dispositionAttachment'][0] : null;
  const followUpAttachmentFile = req.files && req.files['responseDocument'] ? req.files['responseDocument'][0] : null;

  console.log(`[DEBUG] updateDispositionAndFollowUp - Document ID: ${documentId}`);
  console.log('[DEBUG] updateDispositionAndFollowUp - Request Body:', JSON.stringify(req.body, null, 2));
  console.log('[DEBUG] updateDispositionAndFollowUp - Request Files:', JSON.stringify(req.files, null, 2));

  try {
    const document = await Document.findById(documentId);
    if (!document) {
      // Clean up any newly uploaded files if document not found
      if (dispositionAttachmentFile) fs.unlinkSync(dispositionAttachmentFile.path);
      if (followUpAttachmentFile) fs.unlinkSync(followUpAttachmentFile.path);
      return res.status(404).json({ message: 'Dokumen tidak ditemukan.' });
    }

    // Authorization: Ensure user has permission (e.g., is admin or uploader, or part of specific group)
    // For now, assuming 'protect' middleware handles basic auth, further role checks can be added.

    const updateData = {};

    // Handle Disposition
    if (isi_disposisi !== undefined) { // Allow clearing the text
      updateData.isi_disposisi = isi_disposisi;
    }

    if (dispositionAttachmentFile) {
      // If there's an old disposition attachment, delete it
      if (document.disposition_attachment_path) {
        const oldDispPath = path.join('/app/uploads', path.basename(document.disposition_attachment_path));
        if (fs.existsSync(oldDispPath)) fs.unlinkSync(oldDispPath);
      }
      updateData.disposition_attachment_path = `/uploads/${path.basename(dispositionAttachmentFile.path)}`;
      updateData.disposition_original_filename = truncateFilename(dispositionAttachmentFile.originalname);
    } else if (deleteDispositionAttachment === 'true' && document.disposition_attachment_path) {
      const oldDispPath = path.join('/app/uploads', path.basename(document.disposition_attachment_path));
      if (fs.existsSync(oldDispPath)) fs.unlinkSync(oldDispPath);
      updateData.disposition_attachment_path = null;
      updateData.disposition_original_filename = null;
    }

    // Handle Follow-up (Tindak Lanjut - uses response fields)
    if (response_keterangan !== undefined) { // Allow clearing the text
      updateData.response_keterangan = response_keterangan;
    }

    if (followUpAttachmentFile) {
      // If there's an old follow-up attachment, delete it
      if (document.response_storage_path) {
        const oldFollowUpPath = path.join('/app/uploads', path.basename(document.response_storage_path));
        if (fs.existsSync(oldFollowUpPath)) fs.unlinkSync(oldFollowUpPath);
      }
      updateData.response_storage_path = `/uploads/${path.basename(followUpAttachmentFile.path)}`;
      updateData.response_original_filename = truncateFilename(followUpAttachmentFile.originalname);
      updateData.response_upload_timestamp = new Date();
    } else if (deleteResponseDocument === 'true' && document.response_storage_path) {
      const oldFollowUpPath = path.join('/app/uploads', path.basename(document.response_storage_path));
      if (fs.existsSync(oldFollowUpPath)) fs.unlinkSync(oldFollowUpPath);
      updateData.response_storage_path = null;
      updateData.response_original_filename = null;
      updateData.response_upload_timestamp = null; // Or keep if only text is cleared? For now, nullify.
    }
    
    // Update has_responded logic based on new data
    // If any follow-up data exists (keterangan or file), it's considered responded.
    // Disposition alone doesn't mark it as "responded" in the context of a follow-up document.
    if (updateData.response_keterangan || updateData.response_storage_path) {
        updateData.has_responded = true;
    } else if (deleteResponseDocument === 'true' && !response_keterangan && !followUpAttachmentFile) {
        // If response doc is deleted and no new keterangan/file, mark as not responded
        updateData.has_responded = false;
    } else if (document.response_storage_path && !updateData.response_storage_path && !updateData.response_keterangan) {
        // If existing response file is kept but keterangan is cleared, and no new file, it might still be considered responded if file exists.
        // This logic might need refinement based on exact business rules.
        // For now, if response_storage_path becomes null and response_keterangan is empty, has_responded = false.
        if(!updateData.response_keterangan && !updateData.response_storage_path) {
            updateData.has_responded = document.tipe_surat === 'Surat Keluar' ? true : false;
        }
    }


    if (Object.keys(updateData).length === 0 && !dispositionAttachmentFile && !followUpAttachmentFile) {
      return res.status(200).json({ message: 'Tidak ada perubahan data.', document });
    }
    
    console.log('[DEBUG] updateDispositionAndFollowUp - Update Data Prepared:', JSON.stringify(updateData, null, 2));
    const updatedDocument = await Document.updateById(documentId, updateData);
    console.log('[DEBUG] updateDispositionAndFollowUp - Updated Document from DB:', JSON.stringify(updatedDocument, null, 2));
    res.status(200).json({ message: 'Disposisi dan Tindak Lanjut berhasil diperbarui.', document: updatedDocument });
    console.log(`[DEBUG] updateDispositionAndFollowUp - Disposition Attachment Path (Multer): ${dispositionAttachmentFile ? dispositionAttachmentFile.path : 'N/A'}`);
    console.log(`[DEBUG] updateDispositionAndFollowUp - Disposition Attachment Exists: ${dispositionAttachmentFile ? fs.existsSync(dispositionAttachmentFile.path) : 'N/A'}`);
    console.log(`[DEBUG] updateDispositionAndFollowUp - Follow-up Attachment Path (Multer): ${followUpAttachmentFile ? followUpAttachmentFile.path : 'N/A'}`);
    console.log(`[DEBUG] updateDispositionAndFollowUp - Follow-up Attachment Exists: ${followUpAttachmentFile ? fs.existsSync(followUpAttachmentFile.path) : 'N/A'}`);

  } catch (error) {
    console.error('Error updating disposition and follow-up:', error);
    // Clean up any newly uploaded files in case of error during DB update
    if (dispositionAttachmentFile) fs.unlinkSync(dispositionAttachmentFile.path);
    if (followUpAttachmentFile) fs.unlinkSync(followUpAttachmentFile.path);
    res.status(500).json({ message: 'Terjadi kesalahan pada server.' });
  }
};
