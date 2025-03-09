Write-Host "===================================================" -ForegroundColor Cyan
Write-Host "        AUCTION PLATFORM STARTUP SCRIPT" -ForegroundColor Cyan
Write-Host "===================================================" -ForegroundColor Cyan
Write-Host ""
Write-Host "This script will start both the server and client for the auction platform." -ForegroundColor White
Write-Host ""
Write-Host "Checking MongoDB connection..." -ForegroundColor Yellow
Write-Host ""

Set-Location -Path "server"
Write-Host "Starting the server..." -ForegroundColor Green
Start-Process powershell -ArgumentList "-Command", "npm run dev"
Write-Host "Server started in a new window." -ForegroundColor Green
Write-Host ""

Set-Location -Path ".."
Set-Location -Path "client"
Write-Host "Starting the client..." -ForegroundColor Green
Start-Process powershell -ArgumentList "-Command", "npm start"
Write-Host "Client started in a new window." -ForegroundColor Green
Write-Host ""

Write-Host "===================================================" -ForegroundColor Cyan
Write-Host "    AUCTION PLATFORM IS NOW RUNNING!" -ForegroundColor Green
Write-Host ""
Write-Host "    * Server is running on http://localhost:5002" -ForegroundColor White
Write-Host "    * Client is running on http://localhost:3000" -ForegroundColor White
Write-Host ""
Write-Host "    * If MongoDB connection fails, the system will" -ForegroundColor Yellow
Write-Host "      use a mock database automatically." -ForegroundColor Yellow
Write-Host ""
Write-Host "    * Close the server and client windows to stop" -ForegroundColor White
Write-Host "      the application." -ForegroundColor White
Write-Host "===================================================" -ForegroundColor Cyan
Write-Host "" 