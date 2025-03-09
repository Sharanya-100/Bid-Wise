/**
 * Seed script for the Auction Platform
 * 
 * This script populates the database with initial data for testing and development
 */

require('dotenv').config();
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const User = require('../models/User');
const Product = require('../models/Product');
const Auction = require('../models/Auction');
const Bid = require('../models/Bid');

// Mock data for users
const users = [
  {
    username: 'admin',
    email: 'admin@example.com',
    password: 'admin123',
    firstName: 'Admin',
    lastName: 'User',
    bio: 'Platform administrator',
    phoneNumber: '1234567890',
    isAdmin: true
  },
  {
    username: 'john_doe',
    email: 'john@example.com',
    password: 'password123',
    firstName: 'John',
    lastName: 'Doe',
    bio: 'Regular auction user',
    phoneNumber: '9876543210'
  },
  {
    username: 'jane_smith',
    email: 'jane@example.com',
    password: 'password123',
    firstName: 'Jane',
    lastName: 'Smith',
    bio: 'Enthusiastic bidder',
    phoneNumber: '5551234567'
  }
];

// Mock data for products
const products = [
  {
    name: 'Vintage Watch',
    description: 'A classic timepiece from the 1960s',
    category: 'Collectibles',
    condition: 'Good',
    images: ['https://i.imgur.com/JQDuTEU.jpg']
  },
  {
    name: 'Smartphone',
    description: 'Latest model with all features',
    category: 'Electronics',
    condition: 'New',
    images: ['https://i.imgur.com/iEqDtfE.jpg']
  },
  {
    name: 'Antique Desk',
    description: 'Wooden desk from the Victorian era',
    category: 'Furniture',
    condition: 'Fair',
    images: ['https://i.imgur.com/rkVtCNZ.jpg']
  },
  {
    name: 'Diamond Ring',
    description: '14k Gold with 1 carat diamond',
    category: 'Jewelry',
    condition: 'Excellent',
    images: ['https://i.imgur.com/Rw8Qm6L.jpg']
  },
  {
    name: 'Sports Car',
    description: 'Low mileage, excellent condition',
    category: 'Vehicles',
    condition: 'Excellent',
    images: ['https://i.imgur.com/Sz8f8TY.jpg']
  }
];

// Connect to MongoDB
async function connectDB() {
  try {
    const MONGO_URI = process.env.MONGO_URI || 'mongodb://localhost:27017/auction-platform';
    await mongoose.connect(MONGO_URI);
    console.log('MongoDB connected successfully');
    return true;
  } catch (error) {
    console.error('MongoDB connection failed:', error.message);
    return false;
  }
}

// Seed the database
async function seedDatabase() {
  try {
    // Connect to MongoDB
    const isConnected = await connectDB();
    if (!isConnected) {
      console.error('Failed to connect to MongoDB. Seeding aborted.');
      process.exit(1);
    }

    // Clear existing data
    console.log('Clearing existing data...');
    await User.deleteMany({});
    await Product.deleteMany({});
    await Auction.deleteMany({});
    await Bid.deleteMany({});
    
    // Create users
    console.log('Creating users...');
    const createdUsers = [];
    for (const user of users) {
      const hashedPassword = await bcrypt.hash(user.password, 10);
      const newUser = new User({
        ...user,
        password: hashedPassword,
        joinDate: new Date()
      });
      const savedUser = await newUser.save();
      createdUsers.push(savedUser);
    }
    
    // Create products and auctions
    console.log('Creating products and auctions...');
    const now = new Date();
    const createdAuctions = [];
    
    for (let i = 0; i < products.length; i++) {
      const seller = createdUsers[i % createdUsers.length];
      
      // Create product
      const product = new Product({
        ...products[i],
        seller: seller._id
      });
      const savedProduct = await product.save();
      
      // Create auction with the product
      const endDate = new Date(now);
      endDate.setDate(now.getDate() + (i + 1) * 3); // Each auction ends 3, 6, 9, etc. days from now
      
      const auction = new Auction({
        product: savedProduct._id,
        seller: seller._id,
        startingPrice: 100 * (i + 1),
        currentPrice: 100 * (i + 1),
        startDate: now,
        endDate: endDate,
        status: 'active'
      });
      const savedAuction = await auction.save();
      createdAuctions.push(savedAuction);
      
      // Create some bids for the auction
      if (i > 0) { // Skip bids for the first auction
        const numBids = Math.floor(Math.random() * 5) + 1; // 1-5 bids
        let currentPrice = auction.startingPrice;
        
        for (let j = 0; j < numBids; j++) {
          const bidder = createdUsers[(j + 1) % createdUsers.length];
          if (bidder._id.toString() === seller._id.toString()) continue; // Skip if bidder is seller
          
          const bidAmount = currentPrice + Math.floor(Math.random() * 50) + 10; // Random increment
          currentPrice = bidAmount;
          
          const bid = new Bid({
            auction: savedAuction._id,
            bidder: bidder._id,
            amount: bidAmount,
            timestamp: new Date(now.getTime() - (numBids - j) * 60000) // Bids placed at 1-minute intervals
          });
          await bid.save();
          
          // Update auction's current price
          savedAuction.currentPrice = bidAmount;
          savedAuction.highestBidder = bidder._id;
          await savedAuction.save();
        }
      }
    }
    
    console.log('Database seeded successfully!');
    console.log(`Created ${createdUsers.length} users`);
    console.log(`Created ${products.length} products`);
    console.log(`Created ${createdAuctions.length} auctions`);
    
    // Disconnect from MongoDB
    await mongoose.disconnect();
    console.log('MongoDB disconnected');
    
  } catch (error) {
    console.error('Error seeding database:', error);
    process.exit(1);
  }
}

// Run the seed function
seedDatabase(); 