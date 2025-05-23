const db = require('../config/db'); // Assuming db.js exports a query function or pool

// Helper to get current month in YYYY-MM format
const getCurrentMonthYearString = () => {
  const now = new Date();
  const year = now.getFullYear();
  const month = (now.getMonth() + 1).toString().padStart(2, '0');
  return `${year}-${month}`;
};

// R3.1: Display Count of Documents Entered This Month
exports.countDocumentsThisMonth = async (req, res) => {
  const monthYear = getCurrentMonthYearString();
  // Admin sees all, regular user sees non-STR
  const userIsAdmin = req.user.isAdmin; 
  let queryText = 'SELECT COUNT(*) FROM documents WHERE month_year = $1';
  const queryParams = [monthYear];

  if (!userIsAdmin) {
    queryText += ' AND jenis_surat != $2';
    queryParams.push('STR');
  }

  try {
    const { rows } = await db.query(queryText, queryParams);
    res.status(200).json({ count: parseInt(rows[0].count, 10) });
  } catch (error) {
    console.error('Error counting documents this month:', error);
    res.status(500).json({ message: 'Terjadi kesalahan pada server.' });
  }
};

// R3.2: Display Graphic of Documents Entered on a Monthly Basis (e.g., last 12 months)
exports.getMonthlyUploadStats = async (req, res) => {
  // Admin sees all, regular user sees non-STR
  const userIsAdmin = req.user.isAdmin;
  
  // Get stats for the last 12 months including the current month
  // This query is a bit more complex and might need adjustment based on exact PostgreSQL version/features
  // It aims to generate a series of the last 12 months and LEFT JOIN document counts.
  let queryText = `
    WITH last_12_months AS (
      SELECT TO_CHAR(datum, 'YYYY-MM') AS month_year
      FROM GENERATE_SERIES(
        DATE_TRUNC('month', CURRENT_DATE) - INTERVAL '11 months', 
        DATE_TRUNC('month', CURRENT_DATE), 
        INTERVAL '1 month'
      ) AS datum
    )
    SELECT 
      m.month_year,
      COALESCE(COUNT(d.document_id), 0) AS count
    FROM last_12_months m
    LEFT JOIN documents d ON m.month_year = d.month_year 
  `;
  
  const conditions = [];
  if (!userIsAdmin) {
    conditions.push("d.jenis_surat != 'STR'");
  }

  if (conditions.length > 0) {
    // If there are conditions, they need to be part of the JOIN or a WHERE clause on 'd'
    // For LEFT JOIN, it's better to put conditions on 'd' in the ON clause.
    // However, since 'd' can be NULL due to LEFT JOIN, if we put it in WHERE, it acts like INNER JOIN.
    // So, we adjust the join condition or filter after grouping.
    // A simpler way for this specific case might be to filter within the COUNT
    queryText = `
      WITH last_12_months AS (
        SELECT TO_CHAR(datum, 'YYYY-MM') AS month_year
        FROM GENERATE_SERIES(
          DATE_TRUNC('month', CURRENT_DATE) - INTERVAL '11 months', 
          DATE_TRUNC('month', CURRENT_DATE), 
          INTERVAL '1 month'
        ) AS datum
      )
      SELECT 
        m.month_year,
        COUNT(CASE WHEN TRUE ${!userIsAdmin ? "AND d.jenis_surat != 'STR'" : ""} THEN d.document_id ELSE NULL END) AS count
      FROM last_12_months m
      LEFT JOIN documents d ON m.month_year = d.month_year
      GROUP BY m.month_year
      ORDER BY m.month_year ASC;
    `;
  } else {
     queryText += `
      GROUP BY m.month_year
      ORDER BY m.month_year ASC;
    `;
  }

  try {
    const { rows } = await db.query(queryText);
    res.status(200).json({ stats: rows });
  } catch (error) {
    console.error('Error getting monthly upload stats:', error);
    res.status(500).json({ message: 'Terjadi kesalahan pada server.' });
  }
};

exports.getDashboardSummary = async (req, res) => {
  const userIsAdmin = req.user.isAdmin;
  const userId = req.user.id; // Assuming user ID is available for non-admin queries if needed for specific user data
  const currentMonthYear = getCurrentMonthYearString();

  try {
    let totalDocumentsQuery = 'SELECT COUNT(*) FROM documents';
    let suratMasukQuery = "SELECT COUNT(*) FROM documents WHERE tipe_surat = 'Surat Masuk'";
    let suratKeluarQuery = "SELECT COUNT(*) FROM documents WHERE tipe_surat = 'Surat Keluar'";
    let countThisMonthQuery = 'SELECT COUNT(*) FROM documents WHERE month_year = $1';
    
    const queryParamsThisMonth = [currentMonthYear];
    const nonAdminCondition = "jenis_surat != 'STR'";
    const nonAdminParam = 'STR';

    if (!userIsAdmin) {
      totalDocumentsQuery += ` WHERE ${nonAdminCondition}`;
      suratMasukQuery += ` AND ${nonAdminCondition}`;
      suratKeluarQuery += ` AND ${nonAdminCondition}`;
      countThisMonthQuery += ` AND ${nonAdminCondition}`;
      // queryParamsThisMonth.push(nonAdminParam); // This would be $2 if used directly
                                                // For countThisMonthQuery, it's simpler to append the condition string
                                                // If using parameterized queries for all, adjust accordingly.
    }

    // Execute queries in parallel
    const [
      totalDocumentsResult,
      suratMasukResult,
      suratKeluarResult,
      countThisMonthResult
    ] = await Promise.all([
      db.query(totalDocumentsQuery),
      db.query(suratMasukQuery),
      db.query(suratKeluarQuery),
      db.query(countThisMonthQuery, userIsAdmin ? [currentMonthYear] : [currentMonthYear, nonAdminParam]) // Adjust params for countThisMonth if STR is $2
      // Corrected: if not admin, countThisMonthQuery becomes '... WHERE month_year = $1 AND jenis_surat != $2'
      // So the params should be [currentMonthYear, nonAdminParam]
    ]);
    
    // If not admin, the countThisMonthQuery needs to be adjusted for the parameter index
    let finalCountThisMonthQuery = 'SELECT COUNT(*) FROM documents WHERE month_year = $1';
    const finalCountThisMonthParams = [currentMonthYear];
    if (!userIsAdmin) {
        finalCountThisMonthQuery += ' AND jenis_surat != $2';
        finalCountThisMonthParams.push(nonAdminParam);
    }
    const finalCountThisMonthResult = await db.query(finalCountThisMonthQuery, finalCountThisMonthParams);


    res.status(200).json({
      totalDocuments: parseInt(totalDocumentsResult.rows[0].count, 10),
      suratMasukCount: parseInt(suratMasukResult.rows[0].count, 10),
      suratKeluarCount: parseInt(suratKeluarResult.rows[0].count, 10),
      countThisMonth: parseInt(finalCountThisMonthResult.rows[0].count, 10)
    });

  } catch (error) {
    console.error('Error getting dashboard summary stats:', error);
    res.status(500).json({ message: 'Terjadi kesalahan pada server saat mengambil ringkasan statistik.' });
  }
};
