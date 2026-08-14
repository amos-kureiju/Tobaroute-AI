# ====================================================================================================
# FILE: backend/app/database.py
# TUJUAN:
# Mengatur koneksi ke database PostgreSQL menggunakan SQLAlchemy Engine dan Sessionmaker.
# Menyediakan Dependency Injection `get_db()` yang otomatis membuka sesi database saat ada request API
# dan menutupnya kembali setelah request selesai agar memori server tetap aman dan efisien.
# ====================================================================================================

import os
from pathlib import Path
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker, declarative_base
from dotenv import load_dotenv

# Menemukan path absolut ke file .env di folder root backend
BASE_DIR = Path(__file__).resolve().parent.parent
dotenv_path = BASE_DIR / ".env"

# Memuat file .env (tanpa menimpa environment variable bawaan Docker/sistem)
if dotenv_path.exists():
    load_dotenv(dotenv_path=dotenv_path, override=False)
else:
    load_dotenv(override=False)

# Mengambil DATABASE_URL dari .env (PostgreSQL connection string)
SQLALCHEMY_DATABASE_URL = os.getenv(
    "DATABASE_URL", 
    "postgresql://postgres:amos123@localhost:5432/tobaguide_db"
)

# Inisialisasi engine koneksi database PostgreSQL
engine = create_engine(SQLALCHEMY_DATABASE_URL)

# Factory pembuat sesi database per-request
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

# Base class untuk seluruh deklarasi model tabel database
Base = declarative_base()

# ====================================================================================================
# FUNGSI: get_db
# TUJUAN:
# FastAPI Dependency yang menyuntikkan sesi database (db session) ke dalam fungsi endpoint API.
# Menggunakan generator `yield` agar sesi selalu ditutup (db.close()) setelah response dikirim.
# ====================================================================================================
def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()