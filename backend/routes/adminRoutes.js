const express = require('express');
const adminController = require('../controllers/adminController');
const { protect, isAdmin } = require('../middleware/authMiddleware');

const router = express.Router();

// All routes in this file are protected and require admin privileges
router.use(protect, isAdmin);

// GET /api/admin/users - List all users
router.get('/users', adminController.listUsers);

// PUT /api/admin/users/:userId/approve - Approve a user registration
router.put('/users/:userId/approve', adminController.approveUser);

// PUT /api/admin/users/:userId/revoke - Revoke a user's access
router.put('/users/:userId/revoke', adminController.revokeUserAccess);

// PUT /api/admin/users/:userId/role - Set/remove admin privileges for a user
router.put('/users/:userId/role', adminController.setUserAdminStatus);

// Note: Admin access to all documents (including STR) and Excel export for all documents
// will be handled by the existing documentController methods,
// where the `userIsAdmin` flag (derived from req.user.isAdmin) will control data visibility.
// No separate routes are strictly needed here for document listing if the logic is in the controller.

module.exports = router;
