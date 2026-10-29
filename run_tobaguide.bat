@echo off
echo ===================================================
echo   Menjalankan Aplikasi TobaRoute AI (Backend & Frontend)
echo ===================================================

echo [1/2] Menjalankan Server Backend (FastAPI)...
start "TobaRoute Backend (FastAPI)" cmd /k "cd /d "%~dp0backend" && .\venv\Scripts\python.exe -m uvicorn app.main:app --host 127.0.0.1 --port 8000 --reload"

echo [2/2] Menjalankan Server Frontend (Vite React)...
start "TobaRoute Frontend (Vite)" cmd /k "cd /d "%~dp0frontend" && npm run dev"

echo.
echo ===================================================
echo  Semua Server Berhasil Dijalankan!
echo  Membuka browser di http://localhost:3000 ...
echo ===================================================
timeout /t 3
start http://localhost:3000

