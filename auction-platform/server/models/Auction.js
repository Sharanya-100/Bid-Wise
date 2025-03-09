const mongoose = require('mongoose');

const auctionSchema = new mongoose.Schema({
  product: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Product',
    required: true
  },
  startTime: {
    type: Date,
    required: [true, 'Auction start time is required']
  },
  endTime: {
    type: Date,
    required: [true, 'Auction end time is required']
  },
  startingPrice: {
    type: Number,
    required: [true, 'Starting price is required'],
    min: [0, 'Starting price cannot be negative']
  },
  currentPrice: {
    type: Number,
    required: true,
    default: function() {
      return this.startingPrice;
    }
  },
  minBidIncrement: {
    type: Number,
    required: true,
    default: 1,
    min: [0.01, 'Minimum bid increment must be at least 0.01']
  },
  status: {
    type: String,
    enum: ['scheduled', 'active', 'ended', 'cancelled'],
    default: 'scheduled'
  },
  winner: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    default: null
  },
  bids: [{
    bidder: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true
    },
    amount: {
      type: Number,
      required: true
    },
    time: {
      type: Date,
      default: Date.now
    }
  }],
  watchers: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  }],
  autoExtendMinutes: {
    type: Number,
    default: 5,
    min: [1, 'Auto-extend time must be at least 1 minute']
  },
  isExtended: {
    type: Boolean,
    default: false
  },
  reservePrice: {
    type: Number,
    min: [0, 'Reserve price cannot be negative']
  },
  buyNowPrice: {
    type: Number,
    min: [0, 'Buy now price cannot be negative']
  },
  featured: {
    type: Boolean,
    default: false
  },
  location: {
    type: String,
    trim: true
  },
  returnPolicy: {
    type: String,
    trim: true
  },
  shippingOptions: [{
    method: {
      type: String,
      required: true
    },
    cost: {
      type: Number,
      min: 0
    },
    estimatedDelivery: String
  }]
}, {
  timestamps: true
});

// Indexes for better query performance
auctionSchema.index({ status: 1, endTime: 1 });
auctionSchema.index({ product: 1 });
auctionSchema.index({ 'bids.bidder': 1 });

// Virtual field for number of bids
auctionSchema.virtual('bidCount').get(function() {
  return this.bids.length;
});

// Virtual field for time remaining
auctionSchema.virtual('timeRemaining').get(function() {
  return Math.max(0, this.endTime - new Date());
});

// Method to place a bid
auctionSchema.methods.placeBid = async function(userId, bidAmount) {
  if (this.status !== 'active') {
    throw new Error('Auction is not active');
  }
  
  if (bidAmount <= this.currentPrice) {
    throw new Error('Bid amount must be higher than current price');
  }
  
  if (bidAmount < this.currentPrice + this.minBidIncrement) {
    throw new Error(`Minimum bid increment is ${this.minBidIncrement}`);
  }
  
  // Add the new bid
  this.bids.push({
    bidder: userId,
    amount: bidAmount,
    time: new Date()
  });
  
  // Update current price
  this.currentPrice = bidAmount;
  
  // Check if we need to extend the auction
  const timeRemaining = this.endTime - new Date();
  if (timeRemaining < this.autoExtendMinutes * 60 * 1000) {
    this.endTime = new Date(Date.now() + this.autoExtendMinutes * 60 * 1000);
    this.isExtended = true;
  }
  
  return this.save();
};

// Method to end auction
auctionSchema.methods.endAuction = async function() {
  if (this.status !== 'active') {
    throw new Error('Auction is not active');
  }
  
  this.status = 'ended';
  
  // Set winner if there are bids and reserve price is met
  if (this.bids.length > 0 && (!this.reservePrice || this.currentPrice >= this.reservePrice)) {
    const winningBid = this.bids[this.bids.length - 1];
    this.winner = winningBid.bidder;
  }
  
  return this.save();
};

const Auction = mongoose.model('Auction', auctionSchema);

module.exports = Auction; auctionSchema.index({ featured: 1, status: 1 }); // Index for featured auctions
