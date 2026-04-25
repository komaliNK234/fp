@echo off
echo Starting Smart Wakeup Alarm...

:: Start the backend server in its own minimized window
start "Backend Server" /MIN cmd /c "npm start"

:: Navigate to frontend and start it in the main window
cd frontend
echo Starting Frontend UI...
npm run dev
