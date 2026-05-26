# Inicia MongoDB y luego el backend en Windows
$scriptDir = Split-Path -Parent $MyInvocation.MyCommand.Path
$dbPath = Join-Path $scriptDir "mongo-data"

if (-not (Test-Path $dbPath)) {
    New-Item -ItemType Directory -Path $dbPath | Out-Null
}

Write-Host "Iniciando MongoDB en localhost:27017..."
Start-Process -FilePath "mongod" -ArgumentList "--dbpath `"$dbPath`" --bind_ip localhost --port 27017" -NoNewWindow
Start-Sleep -Seconds 2

Write-Host "Iniciando backend..."
Set-Location $scriptDir
node index.js
