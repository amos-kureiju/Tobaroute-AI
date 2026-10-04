# ====================================================================================================
# FILE: backend/app/schemas.py
# TUJUAN:
# Modul ini mendefinisikan skema validasi tipe data (Data Transfer Objects / DTO) menggunakan Pydantic.
# Mengatur kontrak data yang masuk dari pengguna (Request Body) dan data yang dikirimkan kembali (Response).
# Di dalamnya juga terdapat algoritma pembangkit kode lokasi digital "Plus Code" (Open Location Code).
# ====================================================================================================

from pydantic import BaseModel
from typing import Optional, List

# ====================================================================================================
# PENJELASAN KONSTANTA: CODE_ALPHABET
# Google Open Location Code (Plus Code) menggunakan sistem bilangan basis-20 (Base-20).
# Mengapa hanya 20 karakter ini?
# 1. Huruf vokal (A, E, I, O, U) sengaja dihilangkan agar kode tidak sengaja membentuk kata-kata kasar.
# 2. Angka '0' (nol), '1' (satu), huruf 'L', dan 'I' dihilangkan untuk mencegah salah baca/ketik.
# ====================================================================================================
CODE_ALPHABET = "23456789CFGHJMPQRVWX"

# ====================================================================================================
# FUNGSI: generate_plus_code
# PENJELASAN CARA KERJA & RUMUS MATEMATIKA:
# Fungsi ini membagi permukaan bumi ke dalam petak grid bertingkat 20x20:
# 1. Mengubah rentang Latitude (-90 s/d +90) menjadi rentang positif (0 s/d 180) dengan menambah +90.
# 2. Mengubah rentang Longitude (-180 s/d +180) menjadi rentang positif (0 s/d 360) dengan menambah +180.
# 3. Baris 'c1' dan 'c2' menentukan petak grid tingkat 1 (skala global 20 derajat).
# 4. Sisa pembagian (modulo % 20.0) dikalikan kembali dengan 20.0 untuk mencari petak grid tingkat berikutnya.
# 5. 'c3' & 'c4' menentukan petak tingkat 2 (skala 1 derajat).
# 6. 'c5' & 'c6' menentukan petak tingkat 3 (skala 0.05 derajat / ~5.5 km).
# 7. 'c7' & 'c8' menentukan petak tingkat 4 (skala presisi bangunan / ~275 meter).
# Hasil akhirnya digabungkan dengan tanda '+' (misal: "6PVX+FP7") sebagai alamat digital presisi.
# ====================================================================================================
def generate_plus_code(lat: float, lon: float) -> str:
    # Jika koordinat kosong, kembalikan string kosong
    if lat is None or lon is None:
        return ""
    try:
        # Batasi latitude dalam batas wajar (-90 s/d 90) lalu geser ke nilai positif
        lat_c = max(-90.0, min(90.0, float(lat))) + 90.0
        # Batasi longitude dalam batas wajar (-180 s/d 180) lalu geser ke nilai positif
        lon_c = max(-180.0, min(180.0, float(lon))) + 180.0
        
        # Karakter ke-1 & ke-2 (Grid Besar)
        c1 = CODE_ALPHABET[int(lat_c / 20.0)]
        c2 = CODE_ALPHABET[int(lon_c / 20.0)]
        
        # Ambil sisa pembagian untuk sub-grid berikutnya
        lat_rem = (lat_c % 20.0) * 20.0
        lon_rem = (lon_c % 20.0) * 20.0
        
        # Karakter ke-3 & ke-4 (Grid Menengah)
        c3 = CODE_ALPHABET[int(lat_rem / 20.0)]
        c4 = CODE_ALPHABET[int(lon_rem / 20.0)]
        
        lat_rem = (lat_rem % 20.0) * 20.0
        lon_rem = (lon_rem % 20.0) * 20.0
        
        # Karakter ke-5 & ke-6 (Grid Kota / Kecamatan)
        c5 = CODE_ALPHABET[int(lat_rem / 20.0)]
        c6 = CODE_ALPHABET[int(lon_rem / 20.0)]
        
        lat_rem = (lat_rem % 20.0) * 20.0
        lon_rem = (lon_rem % 20.0) * 20.0
        
        # Karakter ke-7 & ke-8 (Grid Presisi Jalan / Tempat)
        c7 = CODE_ALPHABET[int(lat_rem / 20.0)]
        c8 = CODE_ALPHABET[int(lon_rem / 20.0)]
        
        # Format resmi Plus Code: 4 karakter pertama + '+' + 4 karakter penutup
        return f"{c1}{c2}{c3}{c4}+{c5}{c6}{c7}{c8}"
    except Exception:
        # Fallback jika terjadi error parsing koordinat
        return ""

# ====================================================================================================
# SKEMA MODEL PYDANTIC (VALIDASI DATA REST API)
# ====================================================================================================

# SKEMA: DestinasiBase
# TUJUAN:
# Kerangka dasar (blueprint) yang memuat semua field umum yang harus dimiliki oleh sebuah tempat/destinasi.
# Digunakan sebagai dasar pewarisan (inheritance) untuk skema Create, Update, dan Response.
class DestinasiBase(BaseModel):
    nama: str                               # Nama destinasi / toko UMKM (Wajib)
    kategori: str                           # Kategori: 'wisata', 'kuliner', 'umkm', 'penginapan', 'transportasi'
    kecamatan: str                          # Wilayah kecamatan di lingkar Danau Toba (misal: 'Balige', 'Laguboti')
    gambar_url: Optional[str] = None        # URL gambar banner (Boleh kosong / opsional)
    deskripsi_singkat: str                  # Ringkasan cepat yang tampil di kartu utama
    deskripsi_lengkap: Optional[str] = None # Rincian fasilitas, jam operasional, harga tiket, dan cerita budaya
    nama_jalan: str                         # Alamat jalan nyata hasil kalibrasi
    latitude: float                         # Koordinat garis lintang GPS
    longitude: float                        # Koordinat garis bujur GPS
    rating: float                           # Nilai ulasan (contoh: 4.8)
    jumlah_ulasan: int = 0                  # Banyaknya ulasan (digunakan algoritma keadilan untuk deteksi UMKM)
    plus_code: Optional[str] = None         # Kode alamat digital (contoh: "6PVX+FP7")
    full_address: Optional[str] = None      # Gabungan alamat plus code dan nama jalan lengkap
    akses_transportasi: Optional[dict] = None # Panduan akses transportasi (bandara, angkot, feri, rental, estimasi biaya)

# SKEMA: DestinasiCreate
# TUJUAN:
# Digunakan saat form Admin mengirimkan data destinasi baru.
# Memastikan semua field wajib pada DestinasiBase terpenuhi sebelum disimpan ke database.
class DestinasiCreate(DestinasiBase):
    pass

# SKEMA: DestinasiUpdate
# TUJUAN:
# Digunakan saat form Admin memperbarui data destinasi yang sudah ada (PUT request).
# Semua field dibuat 'Optional' sehingga admin bisa memilih untuk mengupdate sebagian data saja.
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
    akses_transportasi: Optional[dict] = None

# SKEMA: DestinasiResponse
# TUJUAN:
# Format data JSON yang dikirimkan oleh backend ke antarmuka pengguna frontend.
# Menambahkan field 'id' (Primary Key unik dari database).
class DestinasiResponse(DestinasiBase):
    id: int

    # Konfigurasi ORM Mode:
    # 'from_attributes = True' (sebelumnya bernama 'orm_mode' pada Pydantic v1)
    # Memungkinkan Pydantic membaca data langsung dari objek SQLAlchemy Model (misal: 'destinasi.nama')
    # tanpa harus diubah manual menjadi dictionary biasa ('destinasi["nama"]').
    class Config:
        from_attributes = True

# SKEMA: TobaRouteResponse
# TUJUAN:
# Format JSON lengkap yang dihasilkan oleh algoritma Keadilan Data & RAG:
# 1. 'destinasi_utama': Daftar tempat wisata primer yang dicari user.
# 2. 'rekomendasi_umkm_sekitar': Daftar warung/pengrajin UMKM di sekitar tempat utama tersebut.
# 3. 'ai_response': Teks narasi kurasi perjalanan yang ditulis oleh model Gemini AI.
class TobaRouteResponse(BaseModel):
    destinasi_utama: List[DestinasiResponse]
    rekomendasi_umkm_sekitar: List[DestinasiResponse]
    ai_response: Optional[str] = None

# SKEMA: ChatbotMessage
# TUJUAN: Mewakili satu baris pesan obrolan (siapa yang mengirim ('role') dan apa isi teksnya ('text')).
class ChatbotMessage(BaseModel):
    role: str   # 'user' (wisatawan) atau 'model' / 'assistant' (TobaRoute AI)
    text: str   # Isi percakapan

# SKEMA: ChatbotRequest
# TUJUAN: Format payload JSON yang dikirim frontend saat pengguna mengetik pertanyaan di fitur chat.
class ChatbotRequest(BaseModel):
    message: str                        # Pertanyaan terbaru yang diajukan wisatawan
    history: List[ChatbotMessage] = []  # Riwayat pesan sebelumnya agar AI mengingat konteks obrolan
