# ====================================================================================================
# FILE: backend/app/schemas.py
# TUJUAN:
# Mendefinisikan skema validasi tipe data (Data Transfer Objects / DTO) menggunakan Pydantic.
# Berfungsi memvalidasi input JSON yang masuk ke server serta mengatur format data keluar (response).
# Juga mencakup algoritma generator Open Location Code (Plus Code) untuk alamat digital lokasi.
# ====================================================================================================

from pydantic import BaseModel
from typing import Optional, List

# Alfabet standar Open Location Code (Google Plus Code) tanpa karakter ambigu
CODE_ALPHABET = "23456789CFGHJMPQRVWX"

# ====================================================================================================
# FUNGSI: generate_plus_code
# TUJUAN:
# Mengonversi koordinat Latitude dan Longitude menjadi kode lokasi digital 8 karakter (misal: 6PVX+G8).
# Sangat berguna untuk UMKM di pelosok desa Danau Toba yang belum memiliki nomor jalan formal.
# ====================================================================================================
def generate_plus_code(lat: float, lon: float) -> str:
    if lat is None or lon is None:
        return ""
    try:
        lat_c = max(-90.0, min(90.0, float(lat))) + 90.0
        lon_c = max(-180.0, min(180.0, float(lon))) + 180.0
        
        c1 = CODE_ALPHABET[int(lat_c / 20.0)]
        c2 = CODE_ALPHABET[int(lon_c / 20.0)]
        
        lat_rem = (lat_c % 20.0) * 20.0
        lon_rem = (lon_c % 20.0) * 20.0
        
        c3 = CODE_ALPHABET[int(lat_rem / 20.0)]
        c4 = CODE_ALPHABET[int(lon_rem / 20.0)]
        
        lat_rem = (lat_rem % 20.0) * 20.0
        lon_rem = (lon_rem % 20.0) * 20.0
        
        c5 = CODE_ALPHABET[int(lat_rem / 20.0)]
        c6 = CODE_ALPHABET[int(lon_rem / 20.0)]
        
        lat_rem = (lat_rem % 20.0) * 20.0
        lon_rem = (lon_rem % 20.0) * 20.0
        
        c7 = CODE_ALPHABET[int(lat_rem / 20.0)]
        c8 = CODE_ALPHABET[int(lon_rem / 20.0)]
        
        return f"{c1}{c2}{c3}{c4}+{c5}{c6}{c7}{c8}"
    except Exception:
        return ""

# ====================================================================================================
# SKEMA MODEL PYDANTIC (VALIDASI DATA)
# ====================================================================================================

# Base schema properti bersama untuk destinasi
class DestinasiBase(BaseModel):
    nama: str
    kategori: str
    kecamatan: str
    gambar_url: Optional[str] = None
    deskripsi_singkat: str
    deskripsi_lengkap: Optional[str] = None
    nama_jalan: str
    latitude: float
    longitude: float
    rating: float
    jumlah_ulasan: int = 0
    plus_code: Optional[str] = None
    full_address: Optional[str] = None

# Skema saat Admin membuat entitas destinasi baru (Input)
class DestinasiCreate(DestinasiBase):
    pass

# Skema saat Admin mengedit entitas yang sudah ada (Optional Update)
class DestinasiUpdate(BaseModel):
    nama: Optional[str] = None
    kategori: Optional[str] = None
    kecamatan: Optional[str] = None
    gambar_url: Optional[str] = None
    deskripsi_singkat: Optional[str] = None
    deskripsi_lengkap: Optional[str] = None
    nama_jalan: Optional[str] = None
    latitude: Optional[float] = None
    longitude: Optional[float] = None
    rating: Optional[float] = None
    jumlah_ulasan: Optional[int] = None
    plus_code: Optional[str] = None
    full_address: Optional[str] = None

# Skema respons API destinasi ke antarmuka pengguna (Output)
class DestinasiResponse(DestinasiBase):
    id: int

    class Config:
        from_attributes = True

# Skema format respons rekomendasi rute terpadu (Destinasi Utama + UMKM + AI Concierge)
class TobaRouteResponse(BaseModel):
    destinasi_utama: List[DestinasiResponse]
    rekomendasi_umkm_sekitar: List[DestinasiResponse]
    ai_response: Optional[str] = None

# Skema pesan individual untuk riwayat obrolan chatbot
class ChatbotMessage(BaseModel):
    role: str
    text: str

# Skema request obrolan chatbot
class ChatbotRequest(BaseModel):
    message: str
    history: List[ChatbotMessage] = []
