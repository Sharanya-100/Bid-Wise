const express = require('express');
const router = express.Router();
const { register, login } = require('../controllers/auth.controller');

// @route   POST /api/auth/register
// @desc    Register a new user
// @access  Public
router.post('/register', register);

// @route   POST /api/auth/login
// @desc    Login user
// @access  Public
router.post('/login', login);

// @route   GET /api/auth/users
// @desc    Get all users (for demonstration only)
// @access  Public
router.get('/users', (req, res) => {
  const { users } = require('../controllers/auth.controller');
  // Don't send passwords in the response
  const sanitizedUsers = users.map(user => ({
    id: user._id,
    name: user.name,
    email: user.email,
    role: user.role,
    createdAt: user.createdAt
  }));
  res.json(sanitizedUsers);
});

// Add test route for server status
router.get('/status', (req, res) => {
  res.status(200).json({
    success: true,
    message: 'Auth API is working',
    usingMockDB: global.usingMockDB || false,
    serverTime: new Date().toISOString()
  });
});

module.exports = router; 