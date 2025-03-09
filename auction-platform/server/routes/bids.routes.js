const express = require('express');
const router = express.Router();

// This route is just a placeholder to redirect to auctions routes
// Actual bid functionality is implemented in auctions.routes.js
router.get('/', (req, res) => {
  res.status(200).json({
    success: true,
    message: 'Bids API - Please use the auctions endpoints for bid operations'
  });
});

module.exports = router; 