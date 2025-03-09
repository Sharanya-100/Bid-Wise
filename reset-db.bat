@echo off
echo ===================================================
echo        AUCTION PLATFORM DATABASE RESET
echo ===================================================
echo.
echo This script will reset the local database storage for the Auction Platform.
echo.

powershell -ExecutionPolicy Bypass -File "%~dp0reset-db.ps1"

pause 