#!/usr/bin/env bash
# Contact Management System - Run Script for Linux & macOS

echo "========================================================"
echo "   Contact Management System (Python Flask + SQLite)"
echo "========================================================"
echo ""

# Check Python 3
if ! command -v python3 &> /dev/null; then
    echo "[ERROR] Python 3 is not installed!"
    echo "Please install Python 3 (e.g. brew install python3 or sudo apt install python3 python3-pip)"
    exit 1
fi

echo "[1/3] Installing dependencies..."
python3 -m pip install -r requirements.txt

echo ""
echo "[2/3] Initializing SQLite database (contacts.db)..."
python3 init_db.py

echo ""
echo "[3/3] Starting Flask Application on http://127.0.0.1:5000 ..."
echo "Press Ctrl+C to stop the server anytime."
echo ""

# Attempt to open browser
if [[ "$OSTYPE" == "darwin"* ]]; then
    open http://127.0.0.1:5000 &
elif [[ "$OSTYPE" == "linux-gnu"* ]]; then
    xdg-open http://127.0.0.1:5000 &> /dev/null &
fi

python3 app.py
