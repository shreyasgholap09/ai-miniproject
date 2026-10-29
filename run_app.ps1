Write-Host "========================================================" -ForegroundColor Cyan
Write-Host "  Launching AI Lost and Found Items Matcher" -ForegroundColor Cyan
Write-Host "========================================================" -ForegroundColor Cyan

$scriptDir = Split-Path -Parent $MyInvocation.MyCommand.Path

# 1. Start Backend in new process
Write-Host "[1/3] Starting FastAPI Backend on http://127.0.0.1:8000 ..." -ForegroundColor Yellow
Start-Process powershell -ArgumentList "-NoExit", "-Command", "cd '$scriptDir\backend'; ..\.venv\Scripts\python -m uvicorn app.main:app --host 127.0.0.1 --port 8000 --reload"

# 2. Start Frontend in new process
Write-Host "[2/3] Starting React Frontend on http://127.0.0.1:5173 ..." -ForegroundColor Yellow
Start-Process powershell -ArgumentList "-NoExit", "-Command", "cd '$scriptDir\frontend'; npm run dev -- --host 127.0.0.1 --port 5173"

Start-Sleep -Seconds 3

# 3. Open browser
Write-Host "[3/3] Opening Browser at http://127.0.0.1:5173 ..." -ForegroundColor Green
Start-Process "http://127.0.0.1:5173"

Write-Host "`nApplication is live!" -ForegroundColor Green
Write-Host "  -> Frontend: http://127.0.0.1:5173"
Write-Host "  -> API Docs: http://127.0.0.1:8000/docs`n"
