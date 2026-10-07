@echo off
title Contact Management System - Flask Server
color 0A

echo ========================================================
echo    Contact Management System (Python Flask + SQLite)
echo ========================================================
echo.

:: Check if Python is installed
python --version >nul 2>&1
if %errorlevel% neq 0 (
    echo [ERROR] Python is not installed or not in PATH!
    echo Please install Python 3 from https://www.python.org/downloads/
    echo Make sure to check "Add Python to PATH" during installation.
    echo.
    pause
    exit /b
)

echo [1/3] Installing / Checking required dependencies...
pip install -r requirements.txt
if %errorlevel% neq 0 (
    echo [WARNING] Failed to install with standard pip. Trying python -m pip...
    python -m pip install -r requirements.txt
)

echo.
echo [2/3] Initializing SQLite database (contacts.db)...
python init_db.py

echo.
echo [3/3] Starting Flask Application...
echo The app will open in your browser at http://127.0.0.1:5000
echo Press Ctrl+C in this window anytime to stop the server.
echo.

:: Wait 2 seconds and open browser
start "" http://127.0.0.1:5000

:: Run the Flask server
python app.py

pause
