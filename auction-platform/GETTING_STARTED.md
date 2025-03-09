# Getting Started with Auction Platform

This guide will help you set up and run the Online Auction Platform on your local machine.

## Prerequisites

- Node.js (v14 or higher)
- npm or yarn
- MongoDB (or a MongoDB Atlas account)

## Setup Steps

### 1. Clone the Repository

```bash
git clone <repository-url>
cd auction-platform
```

### 2. Environment Configuration

1. Set up backend environment variables:
   - Navigate to `server/.env`
   - Modify the MongoDB connection string if needed
   - Update the JWT secret for security

### 3. Installation Options

#### Option 1: Automatic Installation (Windows)

Simply run the `run.bat` file by double-clicking it or executing it from the terminal:

```bash
./run.bat
```

This will:
- Install all dependencies (for root, client, and server)
- Start both the frontend and backend concurrently

#### Option 2: Manual Installation

1. Install root dependencies:
   ```bash
   npm install
   ```

2. Install server dependencies:
   ```bash
   cd server
   npm install
   cd ..
   ```

3. Install client dependencies:
   ```bash
   cd client
   npm install
   cd ..
   ```

4. Start both frontend and backend:
   ```bash
   npm start
   ```

## Accessing the Application

- Frontend: http://localhost:3000
- Backend API: http://localhost:5000

## Mock Database

For demonstration purposes, the application uses a mock database connection. In a production environment, you would need to:

1. Set up a real MongoDB database
2. Update the connection string in `server/.env`
3. Remove the mock implementation in `server/config/db.js`

## Testing the Application

### Demo User Accounts

For testing purposes, you can register new accounts or modify the authentication controller to include sample users.

### Example Auctions

The system is configured to display mock auctions. In a production environment, you would:

1. Create real auctions through the API
2. Upload product images 
3. Set auction start and end times

## Troubleshooting

If you encounter any issues:

1. Ensure MongoDB is running (if using local installation)
2. Check the console for specific error messages
3. Verify all dependencies are installed correctly
4. Ensure all required ports (3000, 5000) are available

## Next Steps

1. Add payment gateway integration
2. Implement email notifications
3. Enhance user profiles
4. Add admin dashboard functionality 