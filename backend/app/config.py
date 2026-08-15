# ====================================================================================================
# FILE: backend/app/config.py
# TUJUAN & PENJELASAN:
# Modul konfigurasi terpusat (Central Settings) untuk server backend FastAPI.
# Menggunakan 'pydantic_settings.BaseSettings' untuk membaca konfigurasi dari file '.env'.
#
# KEUNTUNGAN BASE_SETTINGS:
# 1. Type-Safe: Mengonversi variabel lingkungan (string) secara otomatis ke tipe data yang sesuai (int, bool, dsb).
# 2. Nilai Default Aman: Jika environment variable belum disetel, sistem menggunakan nilai fallback yang aman.
# 3. Isolasi Rahasia: Menjaga kunci API (Gemini, Pinecone, Cohere, PostgreSQL) tetap privat di file '.env'.
# ====================================================================================================

from pydantic_settings import BaseSettings, SettingsConfigDict
from typing import Optional

class Settings(BaseSettings):
    # Nama aplikasi dan versi awalan rute API
    PROJECT_NAME: str = "TobaGuide Backend API"
    API_V1_STR: str = "/api/v1"
    
    # URL Koneksi Database Relasional PostgreSQL
    DATABASE_URL: str = "postgresql://postgres:postgres@localhost:5432/tobaguide"

    # Pengaturan Keamanan & Enkripsi Token JWT (JSON Web Token)
    SECRET_KEY: str = "your-secret-key-change-this-in-production"
    ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 60 * 24 * 7  # Masa berlaku sesi token login (7 hari)

    # Pengaturan Database Vektor Pinecone & Model Embedding
    PINECONE_API_KEY: Optional[str] = None
    PINECONE_INDEX_NAME: str = "tobaguide-index"
    OPENAI_API_KEY: Optional[str] = None
    COHERE_API_KEY: Optional[str] = None
    GEMINI_API_KEY: Optional[str] = None

    # Konfigurasi Pydantic Settings untuk membaca file .env di root backend
    model_config = SettingsConfigDict(
        env_file=".env",
        env_file_encoding="utf-8",
        case_sensitive=True,
        extra="ignore"
    )

# Instance singleton yang dapat langsung diimpor dan digunakan di modul lain (from app.config import settings)
settings = Settings()
