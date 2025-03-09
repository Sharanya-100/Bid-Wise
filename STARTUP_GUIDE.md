# Auction Platform - Startup Guide

This guide will help you get the Auction Platform up and running quickly using the provided startup scripts.

## Prerequisites

Before starting the application, make sure you have:

1. Node.js installed (version 14.x or higher)
2. npm installed (comes with Node.js)
3. MongoDB installed (optional - the application will use a mock database if MongoDB is not available)

## Quick Start

We've provided two simple scripts to start both the server and client applications:

### Using PowerShell (Recommended for Windows 10)

1. Open PowerShell
2. Navigate to the project root directory
3. Run the PowerShell script:

```powershell
.\start-auction-platform.ps1
```

### Using Command Prompt / Batch File

1. Open Command Prompt
2. Navigate to the project root directory
3. Run the batch script:

```cmd
start-auction-platform.bat
```

## What the Scripts Do

The startup scripts will:

1. Start the server (backend) on port 5002
2. Start the client (frontend) on port 3000
3. Automatically check for MongoDB connection
4. Use a mock database if MongoDB is not available

## Manual Startup (Alternative)

If you prefer to start the components manually:

### Start the Server
```
cd server
npm run dev
```

### Start the Client
```
cd client
npm start
```

## MongoDB Connection

The application is configured to work with or without MongoDB. If MongoDB is:

- **Available**: All data will be saved to and retrieved from MongoDB
- **Unavailable**: A mock in-memory database will be used automatically

## Troubleshooting

If you encounter issues starting the application:

1. Make sure all dependencies are installed:
   ```
   cd server && npm install
   cd ../client && npm install
   ```

2. Check MongoDB connection (if using):
   - Ensure MongoDB is running
   - Check the connection string in `server/.env`

3. Port conflicts:
   - Make sure ports 5002 (server) and 3000 (client) are available
   - If they're in use, you can modify the ports in the respective configuration files

For further assistance, please check the main README.md file or contact the development team. 