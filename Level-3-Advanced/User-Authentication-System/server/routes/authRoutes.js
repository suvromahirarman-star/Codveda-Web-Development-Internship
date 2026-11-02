const express = require('express');
const router = express.Router();

const {
  registerUser,
  loginUser,
  getCurrentUser,
  updateUserProfile,
  changePassword,
  getAdminData
} = require('../controllers/authController');

const { protect, authorize } = require('../middleware/authMiddleware');

const {
  validateRegister,
  validateLogin,
  validateProfileUpdate,
  validatePasswordChange
} = require('../middleware/validateAuth');

// Public endpoints
router.post('/register', validateRegister, registerUser);
router.post('/login', validateLogin, loginUser);

// Protected endpoints (JWT required)
router.get('/me', protect, getCurrentUser);
router.put('/profile', protect, validateProfileUpdate, updateUserProfile);
router.put('/change-password', protect, validatePasswordChange, changePassword);

// Role-based protected endpoint (Admin only)
router.get('/admin', protect, authorize('admin'), getAdminData);
router.get('/admin-only', protect, authorize('admin'), getAdminData);

module.exports = router;

