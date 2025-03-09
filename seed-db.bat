@echo off
echo ===================================================
echo        AUCTION PLATFORM DATABASE SEEDER
echo ===================================================
echo.
echo This script will populate the database with sample data.
echo.

set /p confirm=Are you sure you want to seed the database? (y/n): 
if /i not "%confirm%"=="y" (
    echo Database seeding cancelled.
    goto :end
)

cd auction-platform\server
echo Running seed script...
call npm run seed

echo.
echo If successful, the database has been populated with:
echo  - Sample users (admin@example.com, john@example.com, jane@example.com)
echo  - Sample products and auctions
echo  - Password for all accounts is: password123 (admin: admin123)
echo.

:end
pause 