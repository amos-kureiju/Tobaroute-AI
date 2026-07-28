@echo off
echo ===================================================
echo   Menjalankan Aplikasi TobaRoute AI (Backend & Frontend)
echo ===================================================

echo [1/2] Menjalankan Server Backend (FastAPI)...
start "TobaRoute Backend (FastAPI)" cmd /k "cd /d c:\PA2\tobaguide\backend && .\venv\Scripts\activate && uvicorn app.main:app --reload --port 8080"

echo [2/2] Menjalankan Server Frontend (Vite React)...
start "TobaRoute Frontend (Vite)" cmd /k "cd /d c:\PA2\tobaguide\frontend && npm run dev"

echo.
echo ===================================================
echo  Semua Server Berhasil Dijalankan!
echo  Membuka browser di http://localhost:5173 ...
echo ===================================================
timeout /t 4
start http://localhost:5173
