@echo off
:: Batch script to start Windows Firewall Controller Backend with Administrator privileges
title Windows Firewall Controller Backend (Admin)
cd /d "%~dp0"

echo ========================================================
echo   Starting Windows Firewall Controller Backend (Admin)
echo ========================================================
echo.

net session >nul 2>&1
if %errorLevel% == 0 (
    echo [OK] Running with Administrator privileges!
    echo [OK] Windows Firewall read and write operations are enabled.
    echo.
    node server\index.js
) else (
    echo [!] Requesting Administrator privileges...
    powershell -Command "Start-Process cmd -ArgumentList '/c cd /d \"%~dp0\" && node server\\index.js' -Verb RunAs"
)
pause
