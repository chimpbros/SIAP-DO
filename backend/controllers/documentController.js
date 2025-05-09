const Document = require('../models/Document');
const path = require('path');
const fs = require('fs');
const ExcelJS = require('exceljs');

// Helper to create month_year string
const getCurrentMonthYear = () => {
  const now = new Date();
  const year = now.getFullYear();
  const month = (now.getMonth() + 1).toString().padStart(2, '0');
  return `${year}-${month}`;
};

exports.addDocument = async (req, res) => {
  const { tipe_surat, jenis_surat, nomor_surat, perihal, pengirim, isi_disposisi } = req.body;
  const uploader_user_id = req.user.userId; // From authMiddleware

  if (!req.file) {
    return res.status(400).json({ message: 'Lampiran surat wajib diisi.' });
  }

  if (!tipe_surat || !jenis_surat || !nomor_surat || !perihal) {
    // Clean up uploaded file if validation fails early
    fs.unlinkSync(req.file.path);
    return res.status(400).json({ message: 'Field Tipe Surat, Jenis Surat, Nomor Surat, dan Perihal wajib diisi.' });
  }

  if (tipe_surat === 'Surat Masuk' && (!pengirim || !isi_disposisi)) {
    // Clean up uploaded file
    fs.unlinkSync(req.file.path);
    return res.status(400).json({ message: 'Untuk Surat Masuk, Pengirim dan Isi Disposisi wajib diisi.' });
  }
  
  const storage_path = req.file.path; // Path provided by multer
  const original_filename = req.file.originalname;
  const month_year = getCurrentMonthYear();

  try {
    const newDocument = await Document.create({
      tipe_surat,
      jenis_surat,
      nomor_surat,
      perihal,
      pengirim: tipe_surat === 'Surat Masuk' ? pengirim : null,
      isi_disposisi: tipe_surat === 'Surat Masuk' ? isi_disposisi : null,
      storage_path,
      original_filename,
      uploader_user_id,
      month_year,
    });
    res.status(201).json({ message: 'Dokumen berhasil ditambahkan.', document: newDocument });
  } catch (error) {
    console.error('Error adding document:', error);
    // Clean up uploaded file in case of database error
    fs.unlinkSync(req.file.path); 
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
