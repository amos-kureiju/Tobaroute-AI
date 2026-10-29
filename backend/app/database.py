# ====================================================================================================
# FILE: backend/app/database.py
# TUJUAN:
# Mengatur koneksi ke database PostgreSQL dengan auto-fallback cerdas ke SQLite lokal (tobaguide.db)
# jika server PostgreSQL sedang tidak aktif atau koneksi terputus.
# ====================================================================================================

import os
from pathlib import Path
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker, declarative_base
from dotenv import load_dotenv

BASE_DIR = Path(__file__).resolve().parent.parent
dotenv_path = BASE_DIR / ".env"

if dotenv_path.exists():
    load_dotenv(dotenv_path=dotenv_path, override=False)
else:
    load_dotenv(override=False)

DEFAULT_SQLITE_URL = f"sqlite:///{BASE_DIR / 'tobaguide.db'}"
RAW_DATABASE_URL = os.getenv("DATABASE_URL", DEFAULT_SQLITE_URL)

# Uji koneksi ke PostgreSQL; jika gagal, beralih otomatis ke SQLite lokal
def init_engine_with_fallback(db_url):
    if db_url.startswith("sqlite"):
        return create_engine(db_url, connect_args={"check_same_thread": False})
    
    try:
        eng = create_engine(db_url, pool_pre_ping=True)
        # Test koneksi cepat
        with eng.connect() as conn:
            pass
        print(f"[DATABASE] Terhubung ke PostgreSQL: {db_url.split('@')[-1]}")
        return eng
    except Exception as e:
        print(f"[DATABASE WARN] PostgreSQL tidak terjangkau ({e}). Beralih otomatis ke basis data SQLite lokal: {DEFAULT_SQLITE_URL}")
        return create_engine(DEFAULT_SQLITE_URL, connect_args={"check_same_thread": False})

engine = init_engine_with_fallback(RAW_DATABASE_URL)
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)
Base = declarative_base()

def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()