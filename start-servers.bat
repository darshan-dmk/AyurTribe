@echo off
echo ========================================
echo Starting AyurTribe Services
echo ========================================
echo.

REM Kill any existing Python and Node processes
echo Cleaning up existing processes...
taskkill /F /IM python.exe /T 2>nul
taskkill /F /IM node.exe /T 2>nul
timeout /t 2 /nobreak >nul

REM Start ML Server
echo.
echo ========================================
echo Starting ML Server (Port 8000)
echo ========================================
cd /d "d:\AyurTribe\models"
start "ML Server" cmd /k "python main.py"
timeout /t 3 /nobreak >nul

REM Start API Server
echo.
echo ========================================
echo Starting API Server (Port 4000)
echo ========================================
cd /d "d:\AyurTribe\packages\api"
start "API Server" cmd /k "npm run dev"
timeout /t 3 /nobreak >nul

echo.
echo ========================================
echo Services Started Successfully!
echo ========================================
echo ML Server: http://localhost:8000
echo API Server: http://localhost:4000
echo.
echo Press any key to exit this window...
pause >nul
