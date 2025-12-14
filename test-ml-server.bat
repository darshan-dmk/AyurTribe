@echo off
echo ========================================
echo AyurTribe ML Server Quick Test
echo ========================================
echo.

cd /d "d:\AyurTribe\models"

echo Running comprehensive ML test...
echo.
python test_ml_comprehensive.py

echo.
echo ========================================
echo Test Complete!
echo ========================================
echo.
echo If all tests passed, you can now:
echo 1. Run start-servers.bat to start both servers
echo 2. Test from frontend at http://localhost:3000
echo.
pause
