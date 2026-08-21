@echo off
echo ===================================================
echo   Menjalankan Aplikasi TobaRoute AI (Backend & Frontend)
echo ===================================================

echo [1/2] Menjalankan Server Backend (FastAPI)...
start "TobaRoute Backend (FastAPI)" cmd /k "cd /d "%~dp0backend" && (if exist venv\Scripts\activate.bat (call venv\Scripts\activate.bat) else if exist ..\venv\Scripts\activate.bat (call ..\venv\Scripts\activate.bat)) && python -m uvicorn app.main:app --reload --host 0.0.0.0 --port 8000"

echo [2/2] Menjalankan Server Frontend (Vite React)...
start "TobaRoute Frontend (Vite)" cmd /k "cd /d "%~dp0frontend" && npm run dev"


echo.
echo ===================================================
echo  Semua Server Berhasil Dijalankan!
echo  Membuka browser di http://localhost:3000 ...
echo ===================================================
timeout /t 3
start http://localhost:3000

