@echo off
setlocal enabledelayedexpansion

echo.
echo =============================================
echo Starting Polymarket Development Environment
echo =============================================
echo.

REM Check if uv is installed
where uv >nul 2>nul
if errorlevel 1 (
    echo Error: uv is not installed or not in PATH
    echo Please install uv from: https://github.com/astral-sh/uv
    echo Or run: pip install uv
    pause
    exit /b 1
)

REM Check if node/npm is installed
where npm >nul 2>nul
if errorlevel 1 (
    echo Error: npm is not installed or not in PATH
    echo Please install Node.js from: https://nodejs.org/
    pause
    exit /b 1
)

REM Sync Python dependencies with uv
echo [1/4] Syncing Python dependencies with uv...
uv sync
if errorlevel 1 (
    echo Error: Failed to sync Python dependencies
    pause
    exit /b 1
)
echo [1/4] Done!
echo.

REM Install frontend dependencies
echo [2/4] Installing frontend dependencies...
cd polymarket-dashboard
if not exist "node_modules" (
    call npm install
    if errorlevel 1 (
        echo Error: Failed to install frontend dependencies
        cd ..
        pause
        exit /b 1
    )
)
cd ..
echo [2/4] Done!
echo.

REM Start backend in a new window
echo [3/4] Starting backend API on http://localhost:8000
start "Polymarket Backend" cmd /k "title Polymarket Backend && uv run python -m uvicorn backend.app:app --reload --host 0.0.0.0 --port 8000"

REM Wait for backend to start
echo Waiting for backend to start...
timeout /t 3 /nobreak

REM Start frontend in a new window
echo [4/4] Starting frontend on http://localhost:3000
start "Polymarket Frontend" cmd /k "title Polymarket Frontend && cd polymarket-dashboard && npm run dev"

echo.
echo =============================================
echo Polymarket is starting!
echo =============================================
echo Frontend  : http://localhost:3000
echo Backend   : http://localhost:8000
echo API Docs  : http://localhost:8000/docs
echo Health    : http://localhost:8000/api/health
echo.
echo Both services are opening in separate windows.
echo Close the windows to stop the services.
echo.
pause
