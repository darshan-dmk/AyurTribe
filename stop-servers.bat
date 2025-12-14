@echo off
echo ========================================
echo Stopping AyurTribe Services
echo ========================================
echo.

echo Killing Python processes (ML Server)...
taskkill /F /IM python.exe /T 2>nul
if %errorlevel% equ 0 (
    echo ✅ Python processes stopped
) else (
    echo ℹ️  No Python processes running
)

echo.
echo Killing Node processes (API Server)...
taskkill /F /IM node.exe /T 2>nul
if %errorlevel% equ 0 (
    echo ✅ Node processes stopped
) else (
    echo ℹ️  No Node processes running
)

echo.
echo ========================================
echo All Services Stopped
echo ========================================
echo.
pause
