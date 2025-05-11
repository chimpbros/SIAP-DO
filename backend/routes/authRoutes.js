const express = require('express');
const authController = require('../controllers/authController');
const { protect } = require('../middleware/authMiddleware'); // We'll create this next

const router = express.Router();

router.post('/register', authController.register);
router.post('/login', authController.login);
router.get('/me', protect, authController.getCurrentUser); // Protected route
router.post('/change-password', protect, authController.changePassword); // Add change password route

module.exports = router;
