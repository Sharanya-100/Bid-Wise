Write-Host "===================================================" -ForegroundColor Red
Write-Host "        AUCTION PLATFORM DATABASE RESET" -ForegroundColor Red
Write-Host "===================================================" -ForegroundColor Red
Write-Host ""
Write-Host "This script will reset the local database storage for the Auction Platform." -ForegroundColor White
Write-Host ""

$confirmation = Read-Host "Are you sure you want to reset the database? (y/n)"
if ($confirmation -ne 'y') {
    Write-Host "Reset cancelled." -ForegroundColor Yellow
    exit
}

# Generate a script to clear localStorage
$resetScript = @"
javascript:(function() {
    // Clear auction-related localStorage items
    const keysToRemove = [];
    for (let i = 0; i < localStorage.length; i++) {
        const key = localStorage.key(i);
        if (key.includes('auction') || key.includes('product') || key.includes('bid')) {
            keysToRemove.push(key);
        }
    }
    keysToRemove.forEach(key => localStorage.removeItem(key));
    
    alert('Local auction database has been reset!');
})();
"@

# Save the script to a temporary HTML file
$htmlContent = @"
<!DOCTYPE html>
<html>
<head>
    <title>Auction Platform Database Reset</title>
    <style>
        body { font-family: Arial, sans-serif; margin: 40px; line-height: 1.6; }
        .container { max-width: 800px; margin: 0 auto; padding: 20px; border: 1px solid #ccc; border-radius: 5px; }
        h1 { color: #d32f2f; }
        button { padding: 10px 20px; background-color: #d32f2f; color: white; border: none; border-radius: 4px; cursor: pointer; font-size: 16px; }
        button:hover { background-color: #b71c1c; }
        .instructions { margin-top: 30px; padding: 15px; background-color: #f5f5f5; border-radius: 4px; }
    </style>
</head>
<body>
    <div class="container">
        <h1>Auction Platform Database Reset</h1>
        <p>Click the button below to reset the local database storage for the Auction Platform.</p>
        <p>This will clear all locally stored auction data.</p>
        
        <button onclick="resetDatabase()">Reset Database</button>
        
        <div class="instructions">
            <h3>Instructions:</h3>
            <ol>
                <li>Make sure the Auction Platform client is running at <a href="http://localhost:3000" target="_blank">http://localhost:3000</a></li>
                <li>Click the "Reset Database" button above</li>
                <li>Refresh the Auction Platform web page</li>
            </ol>
        </div>
    </div>

    <script>
        function resetDatabase() {
            $resetScript
        }
    </script>
</body>
</html>
"@

$tempFile = [System.IO.Path]::GetTempFileName() + ".html"
Set-Content -Path $tempFile -Value $htmlContent -Encoding UTF8

# Open the HTML file in the default browser
Write-Host "Opening database reset tool in your browser..." -ForegroundColor Green
Start-Process $tempFile

Write-Host ""
Write-Host "===================================================" -ForegroundColor Cyan
Write-Host "Instructions:" -ForegroundColor White
Write-Host "1. A web page has been opened in your browser" -ForegroundColor White
Write-Host "2. Click the 'Reset Database' button on that page" -ForegroundColor White
Write-Host "3. Refresh the Auction Platform web page" -ForegroundColor White
Write-Host "===================================================" -ForegroundColor Cyan 