const mongoose = require('mongoose');

// Mock in-memory database as fallback
const users = [];
const products = [];
const auctions = [];

// Function to connect to MongoDB
const connectDB = async () => {
  try {
    console.log('Connecting to MongoDB...');
    
    // Check if MongoDB connection string is provided
    if (!process.env.MONGO_URI) {
      console.warn('No MongoDB URI provided in environment variables. Using mock database.');
      return setupMockDatabase();
    }
    
    // Use the MONGO_URI from environment variables with better timeout options
    const conn = await mongoose.connect(process.env.MONGO_URI, {
      serverSelectionTimeoutMS: 10000, // Timeout after 10 seconds instead of 30
      socketTimeoutMS: 45000, // Close sockets after 45 seconds of inactivity
      connectTimeoutMS: 15000, // Give up initial connection after 15 seconds
      family: 4, // Use IPv4, skip trying IPv6
      retryWrites: true, // Enable retryable writes
      writeConcern: {
        w: 'majority' // Write to the majority of nodes
      }
    });
    
    console.log(`MongoDB Connected: ${conn.connection.host}`);
    
    // Setup mongoose connection error handlers to make the system more robust
    mongoose.connection.on('error', err => {
      console.error(`Mongoose connection error: ${err}`);
      
      // Try to reconnect 
      setTimeout(() => {
        try {
          if (mongoose.connection.readyState === 0) {
            console.log('Attempting to reconnect to MongoDB...');
            mongoose.connect(process.env.MONGO_URI).catch(e => 
              console.error('Reconnection attempt failed:', e)
            );
          }
        } catch (reconnectErr) {
          console.error('Error during reconnection attempt:', reconnectErr);
        }
      }, 5000);
    });
    
    mongoose.connection.on('disconnected', () => {
      console.log('Mongoose disconnected');
    });
    
    // Handle application termination
    process.on('SIGINT', async () => {
      await mongoose.connection.close();
      console.log('Mongoose connection closed through app termination');
      process.exit(0);
    });
    
    return conn;
  } catch (error) {
    console.error(`Error connecting to MongoDB: ${error.message}`);
    console.log('Falling back to in-memory mock database');
    
    return setupMockDatabase();
  }
};

// Setup mock database with some initial data
const setupMockDatabase = () => {
  console.log('Setting up mock database');
  
  // Sample categories matching frontend options
  const categories = [
    'Electronics', 'Fashion', 'Home & Garden', 'Sports', 
    'Art', 'Collectibles', 'Vehicles', 'Jewelry', 'Antiques',
    'Books', 'Music', 'Other'
  ];
  
  // Create some sample mock auctions if none exist
  if (auctions.length === 0) {
    for (let i = 1; i <= 12; i++) {
      const startTime = new Date();
      const endTime = new Date();
      endTime.setDate(endTime.getDate() + 7);
      
      // Get a category based on index, ensuring each category is represented
      const category = categories[(i - 1) % categories.length];
      
      // Create descriptive title and description
      const title = `${category} Item ${i}`;
      const description = `This is a sample ${category.toLowerCase()} item with ID ${i}. Perfect for testing filtering.`;
      
      auctions.push({
        _id: `mock-auction-${i}`,
        product: {
          title: title,
          description: description,
          images: [`https://via.placeholder.com/300?text=${category.replace(' ', '+')}+${i}`],
          category: category
        },
        startingPrice: 100 * i,
        currentPrice: 100 * i,
        minBidIncrement: 10,
        startTime,
        endTime,
        status: 'active',
        featured: i <= 2, // First two are featured
        bids: [],
        createdAt: new Date(),
        updatedAt: new Date()
      });
    }
  }
  
  return {
    connection: {
      host: 'mock-memory-db',
      name: 'auction-platform-mock'
    },
    isMockDatabase: true
  };
};

// Export the connection function and mock data for fallback
module.exports = connectDB;
module.exports.mockData = {
  users,
  products,
  auctions
}; 