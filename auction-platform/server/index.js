const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const morgan = require('morgan');
const dotenv = require('dotenv');
const path = require('path');
const http = require('http');
const socketIo = require('socket.io');
const connectDB = require('./config/db');

// Load environment variables
dotenv.config();

// Initialize express app
const app = express();
const server = http.createServer(app);
const io = socketIo(server, {
  cors: {
    origin: process.env.CLIENT_URL || 'http://localhost:3000',
    methods: ['GET', 'POST'],
    credentials: true
  }
});

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(morgan('dev'));

// Static files
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Define routes
app.use('/api/auth', require('./routes/auth.routes'));
app.use('/api/users', require('./routes/users.routes'));
app.use('/api/products', require('./routes/products.routes'));
app.use('/api/auctions', require('./routes/auctions.routes'));
app.use('/api/bids', require('./routes/bids.routes'));

// Root route
app.get('/', (req, res) => {
  res.send('Auction Platform API is running');
});

// Socket.IO connection
io.on('connection', (socket) => {
  console.log('New client connected');
  
  // Join auction room
  socket.on('join_auction', (auctionId) => {
    socket.join(auctionId);
    console.log(`User joined auction: ${auctionId}`);
  });
  
  // New bid event
  socket.on('new_bid', (bidData) => {
    io.to(bidData.auctionId).emit('bid_update', bidData);
    console.log(`New bid: ${JSON.stringify(bidData)}`);
  });
  
  // Auction status update
  socket.on('auction_update', (data) => {
    io.to(data.auctionId).emit('auction_status', data);
    console.log(`Auction update: ${JSON.stringify(data)}`);
  });
  
  // Disconnect
  socket.on('disconnect', () => {
    console.log('Client disconnected');
  });
});

// Connect to MongoDB and start server
const startServer = async () => {
  try {
    // Connect to the database
    const db = await connectDB();
    
    // Set global flag if using mock database
    global.usingMockDB = !!db.isMockDatabase;
    if (global.usingMockDB) {
      console.log('Using in-memory mock database');
    }
    
    // Start server
    const PORT = process.env.PORT || 5002;
    server.listen(PORT, () => {
      console.log(`Server running in ${process.env.NODE_ENV} mode on port ${PORT}`);
    });
  } catch (error) {
    console.error(`Error: ${error.message}`);
    process.exit(1);
  }
};

startServer(); 