const express = require('express');
const router = express.Router();
const {
  createAuction,
  getAuctions,
  getAuction,
  updateAuction,
  deleteAuction,
  placeBid,
  getAuctionBids
} = require('../controllers/auction.controller');
const { protect } = require('../middleware/auth');

// Public routes
// @route   GET /api/auctions
// @desc    Get all auctions
// @access  Public
router.get('/', getAuctions);

// @route   GET /api/auctions/:id
// @desc    Get a single auction
// @access  Public
router.get('/:id', getAuction);

// @route   GET /api/auctions/:id/bids
// @desc    Get all bids for an auction
// @access  Public
router.get('/:id/bids', getAuctionBids);

// Protected routes
router.use(protect);

// @route   POST /api/auctions
// @desc    Create a new auction
// @access  Private
router.post('/', createAuction);

// @route   PUT /api/auctions/:id
// @desc    Update an auction
// @access  Private
router.put('/:id', updateAuction);

// @route   DELETE /api/auctions/:id
// @desc    Delete an auction
// @access  Private
router.delete('/:id', deleteAuction);

// @route   POST /api/auctions/:id/bids
// @desc    Place a bid on an auction
// @access  Private
router.post('/:id/bids', placeBid);

module.exports = router; 