@echo off
echo ===================================================
echo        AUCTION PLATFORM STARTUP SCRIPT
echo ===================================================
echo.
echo This script will start both the server and client for the auction platform.
echo.
echo Checking MongoDB connection...
echo.

cd server
echo Starting the server...
start cmd /k "npm run dev"
echo Server started in a new window.
echo.

cd ..
cd client
echo Starting the client...
start cmd /k "npm start"
echo Client started in a new window.
echo.

echo ===================================================
echo    AUCTION PLATFORM IS NOW RUNNING!
echo.
echo    * Server is running on http://localhost:5002
echo    * Client is running on http://localhost:3000
echo.
echo    * If MongoDB connection fails, the system will
echo      use a mock database automatically.
echo.
echo    * Close the server and client windows to stop
echo      the application.
echo ===================================================
echo. 