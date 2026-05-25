@echo off
chcp 65001 >nul
title KiteLab

echo.
echo  KiteLab - AI for Science
echo  Materials Discovery Agent
echo  ================================
echo.

:: Check Python
python --version >nul 2>&1
if errorlevel 1 (
    echo  [ERROR] Python not found. Please install Python 3.10+
    echo  https://www.python.org/downloads/
    pause
    exit /b 1
)

:: Check Node.js
node --version >nul 2>&1
if errorlevel 1 (
    echo  [ERROR] Node.js not found. Please install Node.js 18+
    echo  https://nodejs.org/
    pause
    exit /b 1
)

:: Get script directory
set ROOT=%~dp0
set BACKEND=%ROOT%backend
set FRONTEND=%ROOT%frontend

echo  Root:     %ROOT%
echo  Backend:  %BACKEND%
echo  Frontend: %FRONTEND%
echo.

:: Check API Key
if not exist "%BACKEND%\.env" (
    if exist "%ROOT%.env.example" (
        copy "%ROOT%.env.example" "%BACKEND%\.env" >nul
        echo  [INFO] Created backend\.env
        echo  Please add your DeepSeek API Key, then press any key...
        notepad "%BACKEND%\.env"
        pause >nul
    )
)

:: Install backend deps (no pinned versions to avoid build errors)
echo  [1/3] Checking backend dependencies...
cd /d "%BACKEND%"
pip install fastapi "uvicorn[standard]" httpx pydantic scikit-learn numpy python-dotenv sse-starlette -q --disable-pip-version-check
if errorlevel 1 (
    echo  [ERROR] Failed to install backend dependencies
    pause
    exit /b 1
)
echo        OK

:: Install frontend deps
echo  [2/3] Checking frontend dependencies...
cd /d "%FRONTEND%"
if not exist "node_modules" (
    echo        First run - installing npm packages...
    npm install --silent
)
echo        OK

:: Start backend
echo  [3/3] Starting services...
start "KiteLab-Backend" /min cmd /c "cd /d "%BACKEND%" && python main.py"
timeout /t 3 /nobreak >nul

:: Start frontend
start "KiteLab-Frontend" /min cmd /c "cd /d "%FRONTEND%" && npm run dev"
timeout /t 5 /nobreak >nul

:: Open browser
start "" "http://localhost:5173"

echo.
echo  ================================
echo   KiteLab is running!
echo.
echo   App:     http://localhost:5173
echo   API:     http://localhost:8000
echo   Docs:    http://localhost:8000/docs
echo  ================================
echo.
echo  Close this window to stop all services.
echo.
pause
