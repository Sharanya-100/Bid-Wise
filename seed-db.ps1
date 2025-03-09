Write-Host "===================================================" -ForegroundColor Cyan
Write-Host "        AUCTION PLATFORM DATABASE SEEDER" -ForegroundColor Cyan
Write-Host "===================================================" -ForegroundColor Cyan
Write-Host ""
Write-Host "This script will populate the database with sample data." -ForegroundColor White
Write-Host ""

$confirm = Read-Host "Are you sure you want to seed the database? (y/n)"
if ($confirm.ToLower() -ne "y") {
    Write-Host "Database seeding cancelled." -ForegroundColor Yellow
    exit
}

Write-Host "Running seed script..." -ForegroundColor Green
Set-Location -Path "auction-platform\server"
npm run seed

Write-Host ""
Write-Host "If successful, the database has been populated with:" -ForegroundColor Green
Write-Host "  - Sample users (admin@example.com, john@example.com, jane@example.com)" -ForegroundColor White
Write-Host "  - Sample products and auctions" -ForegroundColor White
Write-Host "  - Password for all accounts is: password123 (admin: admin123)" -ForegroundColor White
Write-Host ""

Read-Host "Press Enter to continue..." 