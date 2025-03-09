const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const User = require('../models/User');
const { mockData } = require('../config/db');

// Helper to check if we're using the mock database
let usingMockDB = false;

// @desc    Register a new user
// @route   POST /api/auth/register
// @access  Public
exports.register = async (req, res) => {
  try {
    const { name, email, password, phoneNumber, address } = req.body;

    console.log('Registration attempt:', { name, email, phoneNumber });

    // Check if we need to use mock database
    if (global.usingMockDB) {
      return handleMockRegister(req, res);
    }

    try {
      // Check if user already exists
      const userExists = await User.findOne({ email });
      if (userExists) {
        return res.status(400).json({ 
          success: false, 
          message: 'User with this email already exists' 
        });
      }

      // Create new user
      const user = await User.create({
        name,
        email,
        password, // Password will be hashed by the User model pre-save hook
        phoneNumber,
        address,
        avatar: '',
        isVerified: false
      });

      console.log('User registered:', user.email);

      // Generate token
      const token = jwt.sign(
        { id: user._id },
        process.env.JWT_SECRET,
        { expiresIn: '30d' }
      );

      res.status(201).json({
        success: true,
        message: 'User registered successfully',
        user: {
          id: user._id,
          name: user.name,
          email: user.email,
          role: user.role,
          avatar: user.avatar
        },
        token
      });
    } catch (mongoError) {
      console.error('MongoDB registration error:', mongoError);
      // Fall back to mock registration if MongoDB fails
      return handleMockRegister(req, res);
    }
  } catch (error) {
    console.error('Registration error:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'An error occurred during registration'
    });
  }
};

// @desc    Login user
// @route   POST /api/auth/login
// @access  Public
exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;

    // Check if email and password are provided
    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message: 'Please provide email and password'
      });
    }

    console.log('Login attempt:', { email });

    // Check if we need to use mock database
    if (global.usingMockDB) {
      return handleMockLogin(req, res);
    }

    try {
      // Find user by email and include the password field for verification
      const user = await User.findOne({ email }).select('+password');
      if (!user) {
        return res.status(401).json({
          success: false,
          message: 'Invalid credentials'
        });
      }

      // Check if password matches using the method defined in the User model
      const isMatch = await user.comparePassword(password);
      if (!isMatch) {
        return res.status(401).json({
          success: false,
          message: 'Invalid credentials'
        });
      }

      // Generate token
      const token = jwt.sign(
        { id: user._id },
        process.env.JWT_SECRET,
        { expiresIn: '30d' }
      );

      res.status(200).json({
        success: true,
        message: 'Login successful',
        user: {
          id: user._id,
          name: user.name,
          email: user.email,
          role: user.role,
          avatar: user.avatar
        },
        token
      });
    } catch (mongoError) {
      console.error('MongoDB login error:', mongoError);
      // Fall back to mock login if MongoDB fails
      return handleMockLogin(req, res);
    }
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'An error occurred during login'
    });
  }
};

// Mock database handlers
const handleMockRegister = async (req, res) => {
  const { name, email, password, phoneNumber, address } = req.body;
  
  // Check if user already exists in mock database
  const userExists = mockData.users.find(user => user.email === email);
  if (userExists) {
    return res.status(400).json({ 
      success: false, 
      message: 'User with this email already exists' 
    });
  }
  
  // Hash password for mock database
  const salt = await bcrypt.genSalt(10);
  const hashedPassword = await bcrypt.hash(password, salt);
  
  // Create user in mock database
  const user = {
    _id: `user_${Date.now()}`,
    name,
    email,
    password: hashedPassword, // Store hashed password
    phoneNumber,
    address,
    role: 'user',
    avatar: '',
    isVerified: false,
    createdAt: new Date(),
    updatedAt: new Date()
  };
  
  mockData.users.push(user);
  console.log('Mock user registered:', user.email);
  
  // Generate token
  const token = jwt.sign(
    { id: user._id },
    process.env.JWT_SECRET,
    { expiresIn: '30d' }
  );
  
  return res.status(201).json({
    success: true,
    message: 'User registered successfully',
    user: {
      id: user._id,
      name: user.name,
      email: user.email,
      role: user.role,
      avatar: user.avatar
    },
    token
  });
};

const handleMockLogin = async (req, res) => {
  const { email, password } = req.body;
  
  // Find user in mock database
  const user = mockData.users.find(u => u.email === email);
  if (!user) {
    return res.status(401).json({
      success: false,
      message: 'Invalid credentials'
    });
  }
  
  // Compare password with hashed password in mock database
  const isMatch = await bcrypt.compare(password, user.password);
  if (!isMatch) {
    return res.status(401).json({
      success: false,
      message: 'Invalid credentials'
    });
  }
  
  // Generate token
  const token = jwt.sign(
    { id: user._id },
    process.env.JWT_SECRET,
    { expiresIn: '30d' }
  );
  
  return res.status(200).json({
    success: true,
    message: 'Login successful',
    user: {
      id: user._id,
      name: user.name,
      email: user.email,
      role: user.role,
      avatar: user.avatar
    },
    token
  });
};