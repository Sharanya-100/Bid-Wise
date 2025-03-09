const jwt = require('jsonwebtoken');
const User = require('../models/User');
const { mockData } = require('../config/db');

exports.protect = async (req, res, next) => {
  try {
    let token;
    
    // Get token from Authorization header
    if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
      token = req.headers.authorization.split(' ')[1];
    }
    
    // Check if token exists
    if (!token) {
      return res.status(401).json({
        success: false,
        message: 'Not authorized to access this route'
      });
    }
    
    try {
      // Verify token
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      
      // Check if using mock database
      if (global.usingMockDB) {
        // Get user from mock database
        const mockUser = mockData.users.find(user => user._id === decoded.id);
        
        if (!mockUser) {
          return res.status(401).json({
            success: false,
            message: 'User not found'
          });
        }
        
        // Create a user object without the password
        req.user = { ...mockUser };
        delete req.user.password;
        
        next();
        return;
      }
      
      // Get user from MongoDB
      req.user = await User.findById(decoded.id).select('-password');
      
      if (!req.user) {
        return res.status(401).json({
          success: false,
          message: 'User not found'
        });
      }
      
      next();
    } catch (err) {
      return res.status(401).json({
        success: false,
        message: 'Not authorized to access this route'
      });
    }
  } catch (err) {
    next(err);
  }
};

// Middleware to check user role
exports.authorize = (...roles) => {
  return (req, res, next) => {
    if (!roles.includes(req.user.role)) {
      return res.status(403).json({
        success: false,
        message: `User role ${req.user.role} is not authorized to access this route`
      });
    }
    next();
  };
}; 