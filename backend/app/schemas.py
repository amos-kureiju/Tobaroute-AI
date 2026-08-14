from pydantic import BaseModel
from typing import Optional, List

CODE_ALPHABET = "23456789CFGHJMPQRVWX"

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

# Base schema untuk struktur data destinasi
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

# Digunakan saat Admin menginput data baru (Data masuk)
class DestinasiCreate(DestinasiBase):
    pass

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

# Digunakan saat API merespons permintaan User/Admin (Data keluar)
class DestinasiResponse(DestinasiBase):
    id: int

    class Config:
        from_attributes = True

# Skema permintaan untuk AI Chatbot
class ChatRequest(BaseModel):
    user_query: str
    fair_route_data: dict


# Skema khusus untuk merespons rute pintar yang adil
class TobaRouteResponse(BaseModel):
    destinasi_utama: List[DestinasiResponse]
    rekomendasi_umkm_sekitar: List[DestinasiResponse]
    ai_response: Optional[str] = None

class ChatbotMessage(BaseModel):
    role: str
    text: str

class ChatbotRequest(BaseModel):
    message: str
    history: List[ChatbotMessage] = []
