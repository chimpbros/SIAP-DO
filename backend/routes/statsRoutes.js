const express = require('express');
const statsController = require('../controllers/statsController');
const { protect } = require('../middleware/authMiddleware');

const router = express.Router();

// All routes in this file are protected
router.use(protect);

// GET /api/stats/docs/count-current-month - Count of documents this month
router.get('/docs/count-current-month', statsController.countDocumentsThisMonth);

// GET /api/stats/docs/monthly-uploads - Monthly upload statistics for chart
router.get('/docs/monthly-uploads', statsController.getMonthlyUploadStats);

// GET /api/stats/summary - Dashboard summary statistics
router.get('/summary', statsController.getDashboardSummary);

module.exports = router;
