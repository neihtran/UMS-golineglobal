# start-mock.ps1
# Khởi động Mock API Server cho UMS Frontend Development
# Chạy: .\start-mock.ps1

param(
    [int]$Port = 5001,
    [switch]$SkipNpmInstall
)

$ErrorActionPreference = "Stop"

Write-Host ""
Write-Host "=======================================" -ForegroundColor Cyan
Write-Host "  UMS Mock API Server" -ForegroundColor Cyan
Write-Host "=======================================" -ForegroundColor Cyan
Write-Host ""

$ServerDir = Join-Path $PSScriptRoot "server"

if (-not $SkipNpmInstall) {
    Write-Host "[1/3] Kiểm tra dependencies..." -ForegroundColor Yellow
    Push-Location $ServerDir
    try {
        if (-not (Test-Path "node_modules")) {
            Write-Host "   Cài đặt npm packages..." -ForegroundColor Gray
            npm install
        }
    }
    finally {
        Pop-Location
    }
}

Write-Host "[2/3] Khởi động mock server trên port $Port..." -ForegroundColor Yellow
Write-Host ""

# Use cmd /c to properly start node/npx process on Windows
$MockProcess = Start-Process -FilePath "cmd.exe" `
    -ArgumentList "/c", "cd /d `"$ServerDir`" && npx tsx src/mock/server.ts" `
    -WorkingDirectory $ServerDir `
    -PassThru `
    -WindowStyle Normal

Start-Sleep -Seconds 4

if ($MockProcess.HasExited) {
    Write-Host "[LỖI] Mock server không khởi động được! Exit code: $($MockProcess.ExitCode)" -ForegroundColor Red
    exit 1
}

Write-Host "   Mock server PID: $($MockProcess.Id)" -ForegroundColor Green
Write-Host "   Health check: http://localhost:$Port/health" -ForegroundColor Green
Write-Host ""

Write-Host "[3/3] Khởi động Vite dev server trên port 3000..." -ForegroundColor Yellow
Write-Host ""

$ViteProcess = Start-Process -FilePath "cmd.exe" `
    -ArgumentList "/c", "npm run dev" `
    -WorkingDirectory $PSScriptRoot `
    -PassThru `
    -WindowStyle Normal

Start-Sleep -Seconds 3

if ($ViteProcess.HasExited) {
    Write-Host "[LỖI] Vite dev server không khởi động được! Exit code: $($ViteProcess.ExitCode)" -ForegroundColor Red
    exit 1
}

Write-Host ""
Write-Host "=======================================" -ForegroundColor Cyan
Write-Host "  Đã khởi động thành công!" -ForegroundColor Green
Write-Host "=======================================" -ForegroundColor Cyan
Write-Host "   Mock API:  http://localhost:$Port" -ForegroundColor Green
Write-Host "   Frontend:  http://localhost:3000" -ForegroundColor Green
Write-Host ""
Write-Host "Nhấn Ctrl+C trong cửa sổ này để dừng server."
Write-Host ""

# Wait for both processes
try {
    $handles = Wait-Process -Id $MockProcess.Id, $ViteProcess.Id -PassThru -ErrorAction SilentlyContinue
}
catch {
    Write-Host "Đang dừng server..." -ForegroundColor Yellow
    Stop-Process $MockProcess.Id -Force -ErrorAction SilentlyContinue
    Stop-Process $ViteProcess.Id -Force -ErrorAction SilentlyContinue
}
