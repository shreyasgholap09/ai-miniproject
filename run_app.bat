@echo off
title AI Lost and Found Items Matcher
echo ========================================================
echo   Launching AI Lost and Found Items Matcher
echo ========================================================

echo [1/3] Starting FastAPI Backend on http://127.0.0.1:8000 ...
start "AI Matcher - Backend" cmd /k "cd /d %~dp0\backend && ..\.venv\Scripts\python -m uvicorn app.main:app --host 127.0.0.1 --port 8000 --reload"

echo [2/3] Starting React Frontend on http://127.0.0.1:5173 ...
start "AI Matcher - Frontend" cmd /k "cd /d %~dp0\frontend && npm run dev -- --host 127.0.0.1 --port 5173"

timeout /t 3 /nobreak > nul

echo [3/3] Opening Browser...
start http://127.0.0.1:5173

echo.
echo Application is running!
echo - Web App: http://127.0.0.1:5173
echo - API Docs: http://127.0.0.1:8000/docs
echo.
pause
