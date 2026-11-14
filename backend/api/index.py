import sys
from pathlib import Path

# Tambahkan root folder backend ke sys.path agar package `app` terbaca oleh Vercel
BACKEND_ROOT = Path(__file__).resolve().parent.parent
if str(BACKEND_ROOT) not in sys.path:
    sys.path.insert(0, str(BACKEND_ROOT))

from app.main import app

