const db = require('../config/db');

const Document = {
  async create({ tipe_surat, jenis_surat, nomor_surat, perihal, pengirim, isi_disposisi, storage_path, original_filename, uploader_user_id, month_year }) {
    const query = `
      INSERT INTO documents (tipe_surat, jenis_surat, nomor_surat, perihal, pengirim, isi_disposisi, storage_path, original_filename, uploader_user_id, month_year)
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)
      RETURNING *;
    `;
    const values = [tipe_surat, jenis_surat, nomor_surat, perihal, pengirim, isi_disposisi, storage_path, original_filename, uploader_user_id, month_year];
    
    try {
      const { rows } = await db.query(query, values);
      return rows[0];
    } catch (error) {
      console.error('Error creating document:', error);
      throw error;
    }
  },

  async findById(documentId) {
    const query = `
      SELECT d.*, u.nama as uploader_nama, u.nrp as uploader_nrp 
      FROM documents d
      JOIN users u ON d.uploader_user_id = u.user_id
      WHERE d.document_id = $1;
    `;
    try {
      const { rows } = await db.query(query, [documentId]);
      return rows[0];
    } catch (error) {
      console.error('Error finding document by ID:', error);
      throw error;
    }
  },

  async findAll({ searchTerm, filterMonth, filterYear, userIsAdmin, limit, offset }) {
    let mainQuerySelect = `
      SELECT d.document_id, d.tipe_surat, d.jenis_surat, d.nomor_surat, d.perihal, d.pengirim, 
             TO_CHAR(d.upload_timestamp, 'YYYY-MM-DD HH24:MI:SS') as upload_timestamp, 
             u.nama as uploader_nama, u.nrp as uploader_nrp, d.original_filename, d.storage_path
      FROM documents d
      JOIN users u ON d.uploader_user_id = u.user_id
    `;
    const conditions = [];
    const queryParams = []; // Parameters for the WHERE clause
    let paramCount = 1;

    if (!userIsAdmin) {
      conditions.push(`d.jenis_surat != 'STR'`);
    }

    if (searchTerm) {
      conditions.push(`(d.nomor_surat ILIKE $${paramCount} OR d.perihal ILIKE $${paramCount} OR d.pengirim ILIKE $${paramCount})`);
      queryParams.push(`%${searchTerm}%`);
      paramCount++;
    }

    if (filterMonth && filterYear) {
      const monthYear = `${filterYear}-${filterMonth.padStart(2, '0')}`;
      conditions.push(`d.month_year = $${paramCount}`);
      queryParams.push(monthYear);
      paramCount++;
    } else if (filterYear) {
      conditions.push(`SUBSTRING(d.month_year, 1, 4) = $${paramCount}`);
      queryParams.push(filterYear);
      paramCount++;
    }

    const whereClause = conditions.length > 0 ? ' WHERE ' + conditions.join(' AND ') : '';
    
    // Construct Count Query
    const countQueryString = `SELECT COUNT(*) FROM documents d JOIN users u ON d.uploader_user_id = u.user_id ${whereClause}`;
    const { rows: countRows } = await db.query(countQueryString, queryParams);
    const totalItems = parseInt(countRows[0].count, 10);

    // Construct Main Data Query
    let mainQueryString = mainQuerySelect + whereClause + ' ORDER BY d.upload_timestamp DESC';
    const mainQueryParams = [...queryParams]; // Clone queryParams for the main query

    if (limit) {
      mainQueryString += ` LIMIT $${paramCount}`;
      mainQueryParams.push(limit);
      paramCount++;
    }
    if (offset) {
      mainQueryString += ` OFFSET $${paramCount}`;
      mainQueryParams.push(offset);
      paramCount++;
    }
    
    try {
      const { rows } = await db.query(mainQueryString, mainQueryParams);
      return { documents: rows, totalItems };
    } catch (error) {
      console.error('Error finding all documents:', error);
      throw error;
    }
  },
  
  // For Excel export - potentially without pagination, or with specific filters
  async findAllForExport({ searchTerm, filterMonth, filterYear, userIsAdmin }) {
    let baseQuery = `
      SELECT d.nomor_surat, d.tipe_surat, d.jenis_surat, d.perihal, d.pengirim, d.isi_disposisi,
             TO_CHAR(d.upload_timestamp, 'YYYY-MM-DD HH24:MI:SS') as tanggal_upload, 
             u.nama as uploader_nama, u.nrp as uploader_nrp, d.original_filename
      FROM documents d
      JOIN users u ON d.uploader_user_id = u.user_id
    `;
    const conditions = [];
    const values = [];
    let paramCount = 1;

    if (!userIsAdmin) {
      conditions.push(`d.jenis_surat != 'STR'`);
    }
    // Apply filters similar to findAll but without pagination
    if (searchTerm) {
      conditions.push(`(d.nomor_surat ILIKE $${paramCount} OR d.perihal ILIKE $${paramCount} OR d.pengirim ILIKE $${paramCount})`);
      values.push(`%${searchTerm}%`);
      paramCount++;
    }
    if (filterMonth && filterYear) {
      const monthYear = `${filterYear}-${filterMonth.padStart(2, '0')}`;
      conditions.push(`d.month_year = $${paramCount}`);
      values.push(monthYear);
      paramCount++;
    } else if (filterYear) {
      conditions.push(`SUBSTRING(d.month_year, 1, 4) = $${paramCount}`);
      values.push(filterYear);
      paramCount++;
    }

    if (conditions.length > 0) {
      baseQuery += ' WHERE ' + conditions.join(' AND ');
    }
    baseQuery += ' ORDER BY d.upload_timestamp DESC';

    try {
      const { rows } = await db.query(baseQuery, values);
      return rows;
    } catch (error) {
      console.error('Error finding documents for export:', error);
      throw error;
    }
  }
};

module.exports = Document;
