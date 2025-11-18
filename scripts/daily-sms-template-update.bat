@echo off
REM Daily SMS Template Update Script for Windows
REM This script runs the daily SMS template update for FeeFlow

echo ========================================
echo FeeFlow Daily SMS Template Update
echo ========================================
echo.

REM Set the project directory (adjust this path as needed)
set PROJECT_DIR=%~dp0..

REM Change to project directory
cd /d "%PROJECT_DIR%"

REM Check if node is available
where node >nul 2>nul
if %errorlevel% neq 0 (
    echo ERROR: Node.js is not installed or not in PATH
    echo Please install Node.js from https://nodejs.org/
    exit /b 1
)

echo Starting SMS template update...
echo Project directory: %PROJECT_DIR%
echo.

REM Run the update script
node scripts\daily-sms-template-update.js

REM Check the exit code
if %errorlevel% equ 0 (
    echo.
    echo ========================================
    echo SUCCESS: SMS templates updated successfully!
    echo ========================================
) else (
    echo.
    echo ========================================
    echo ERROR: SMS template update failed!
    echo Exit code: %errorlevel%
    echo ========================================
)

echo.
echo Update completed at %date% %time%
echo.

REM Pause if running manually (remove this for scheduled tasks)
REM pause