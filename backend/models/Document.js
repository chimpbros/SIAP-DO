const db = require('../config/db');

const Document = {
  async create({
    tipe_surat,
    jenis_surat,
    nomor_surat,
    perihal,
    pengirim,
    isi_disposisi,
    storage_path, // Original document path
    original_filename, // Original document filename
    uploader_user_id,
    month_year,
    response_storage_path, // New: Response document path
    response_original_filename, // New: Response document filename
    response_upload_timestamp, // New: Response upload timestamp
    response_keterangan, // New: Response description
    has_responded // New: Has responded flag
  }) {
    const query = `
      INSERT INTO documents (
        tipe_surat, jenis_surat, nomor_surat, perihal, pengirim, isi_disposisi,
        storage_path, original_filename, uploader_user_id, month_year,
        response_storage_path, response_original_filename, response_upload_timestamp, response_keterangan, has_responded
      )
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15)
      RETURNING *;
    `;
    const values = [
      tipe_surat,
      jenis_surat,
      nomor_surat,
      perihal,
      pengirim,
      isi_disposisi,
      storage_path,
      original_filename,
      uploader_user_id,
      month_year,
      response_storage_path,
      response_original_filename,
      response_upload_timestamp,
      response_keterangan,
      has_responded
    ];

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
             u.nama as uploader_nama, u.nrp as uploader_nrp, d.original_filename, d.storage_path,
             d.response_document_id, d.response_storage_path, d.response_original_filename, d.response_upload_timestamp, d.response_keterangan, d.has_responded
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
  },

  // New method to find unresponded Surat Masuk documents
  async findUnresponded({ searchTerm, filterMonth, filterYear, limit, offset }) {
    let baseQuery = `
      SELECT d.document_id, d.tipe_surat, d.jenis_surat, d.nomor_surat, d.perihal, d.pengirim,
             TO_CHAR(d.upload_timestamp, 'YYYY-MM-DD HH24:MI:SS') as upload_timestamp,
             u.nama as uploader_nama, u.nrp as uploader_nrp, d.original_filename, d.storage_path
      FROM documents d
      JOIN users u ON d.uploader_user_id = u.user_id
    `;
    const conditions = ["d.tipe_surat = 'Surat Masuk'", "d.has_responded = FALSE"];
    const queryParams = []; // Parameters for the WHERE clause
    let paramCount = 1;

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

    const whereClause = ' WHERE ' + conditions.join(' AND ');

    // Construct Count Query
    const countQueryString = `SELECT COUNT(*) FROM documents d JOIN users u ON d.uploader_user_id = u.user_id ${whereClause}`;
    const { rows: countRows } = await db.query(countQueryString, queryParams);
    const totalItems = parseInt(countRows[0].count, 10);

    // Construct Main Data Query
    let mainQueryString = baseQuery + whereClause + ' ORDER BY d.upload_timestamp DESC';
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

  // New method to update a document by ID
  async updateById(documentId, updateData) {
    const updates = [];
    const values = [];
    let paramCount = 1;

    // Build the SET clause and values array dynamically
    for (const key in updateData) {
      if (updateData.hasOwnProperty(key)) {
        updates.push(`${key} = $${paramCount}`);
        values.push(updateData[key]);
        paramCount++;
      }
    }

    if (updates.length === 0) {
      // No fields to update
      return null;
    }

    values.push(documentId); // Add documentId as the last parameter

    const query = `
      UPDATE documents
      SET ${updates.join(', ')}
      WHERE document_id = $${paramCount}
      RETURNING *;
    `;

    try {
      const { rows } = await db.query(query, values);
      return rows[0]; // Return the updated document
    } catch (error) {
      console.error('Error updating document by ID:', error);
      throw error;
    }
  },

  async deleteById(documentId) {
    const query = 'DELETE FROM documents WHERE document_id = $1 RETURNING document_id;';
    try {
      const { rowCount } = await db.query(query, [documentId]);
      return rowCount; // Returns 1 if deleted, 0 if not found
    } catch (error) {
      console.error('Error deleting document by ID:', error);
      throw error;
    }
  },

  async findByResponseFilePathPartial(partialPath) {
    const query = `
      SELECT d.*, u.nama as uploader_nama, u.nrp as uploader_nrp
      FROM documents d
      JOIN users u ON d.uploader_user_id = u.user_id
      WHERE d.response_storage_path LIKE $1;
    `;
    // Use a wildcard at the beginning to match any path ending with partialPath
    const value = `%${partialPath}`;
    try {
      const { rows } = await db.query(query, [value]);
      return rows[0]; // Return the first matching document
    } catch (error) {
      console.error('Error finding document by response file path partial:', error);
      throw error;
    }
  }
};

module.exports = Document;
