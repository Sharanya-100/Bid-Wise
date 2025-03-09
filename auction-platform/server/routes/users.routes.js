const express = require('express');
const router = express.Router();
const { getProfile, updateProfile } = require('../controllers/user.controller');
const { protect } = require('../middleware/auth');

// Protect all routes in this router
router.use(protect);

// @route   GET /api/users/me
// @desc    Get current user profile
// @access  Private
router.get('/me', getProfile);

// @route   PUT /api/users/me
// @desc    Update user profile
// @access  Private
router.put('/me', updateProfile);

module.exports = router; 