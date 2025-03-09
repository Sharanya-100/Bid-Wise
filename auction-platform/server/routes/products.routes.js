const express = require('express');
const router = express.Router();
const {
  createProduct,
  getProducts,
  getProduct,
  updateProduct,
  deleteProduct
} = require('../controllers/product.controller');
const { protect } = require('../middleware/auth');

// @route   GET /api/products
// @desc    Get all products
// @access  Public
router.get('/', getProducts);

// @route   GET /api/products/:id
// @desc    Get a single product
// @access  Public
router.get('/:id', getProduct);

// Protect routes below
router.use(protect);

// @route   POST /api/products
// @desc    Create a new product
// @access  Private
router.post('/', createProduct);

// @route   PUT /api/products/:id
// @desc    Update a product
// @access  Private
router.put('/:id', updateProduct);

// @route   DELETE /api/products/:id
// @desc    Delete a product
// @access  Private
router.delete('/:id', deleteProduct);

module.exports = router; 