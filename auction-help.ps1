Write-Host "===================================================" -ForegroundColor Cyan
Write-Host "            AUCTION PLATFORM HELP" -ForegroundColor Cyan
Write-Host "===================================================" -ForegroundColor Cyan
Write-Host ""
Write-Host "Available Tools:" -ForegroundColor Yellow
Write-Host ""
Write-Host "1. start-auction-platform.bat  : " -NoNewline; Write-Host "Start both server and client" -ForegroundColor Green
Write-Host "2. start-auction-platform.ps1  : " -NoNewline; Write-Host "Start both server and client (PowerShell)" -ForegroundColor Green
Write-Host "3. reset-db.bat                : " -NoNewline; Write-Host "Reset local database" -ForegroundColor Red
Write-Host "4. reset-db.ps1                : " -NoNewline; Write-Host "Reset local database (PowerShell)" -ForegroundColor Red
Write-Host "5. seed-db.bat                 : " -NoNewline; Write-Host "Populate database with sample data" -ForegroundColor Blue
Write-Host "6. seed-db.ps1                 : " -NoNewline; Write-Host "Populate database with sample data (PowerShell)" -ForegroundColor Blue
Write-Host ""
Write-Host "Documentation:" -ForegroundColor Yellow
Write-Host "- STARTUP_GUIDE.md             : " -NoNewline; Write-Host "Guide to starting the platform" -ForegroundColor White
Write-Host "- README.md                    : " -NoNewline; Write-Host "Main documentation" -ForegroundColor White
Write-Host ""
Write-Host "Project Structure:" -ForegroundColor Yellow
Write-Host "- /client                      : " -NoNewline; Write-Host "Frontend React application" -ForegroundColor White
Write-Host "- /server                      : " -NoNewline; Write-Host "Backend Node.js server" -ForegroundColor White
Write-Host ""

# Check MongoDB status
Write-Host "MongoDB Status:" -ForegroundColor Yellow
try {
    $mongoStatus = Invoke-Expression "mongod --version" 2>&1
    if ($LASTEXITCODE -eq 0) {
        Write-Host "- MongoDB is installed: " -NoNewline; Write-Host "Yes" -ForegroundColor Green
        $version = $mongoStatus | Select-String -Pattern "db version" | ForEach-Object { $_.ToString().Split(" ")[2] }
        Write-Host "- Version: $version" -ForegroundColor White
    } else {
        Write-Host "- MongoDB is installed: " -NoNewline; Write-Host "No" -ForegroundColor Red
        Write-Host "- Note: The application will use a mock database if MongoDB is not available" -ForegroundColor Yellow
    }
} catch {
    Write-Host "- MongoDB is installed: " -NoNewline; Write-Host "No" -ForegroundColor Red
    Write-Host "- Note: The application will use a mock database if MongoDB is not available" -ForegroundColor Yellow
}

Write-Host ""
Write-Host "===================================================" -ForegroundColor Cyan
Read-Host "Press Enter to continue..." 