import os
import sys
import pandas as pd
import requests
import json
import time
import random
from geopy.geocoders import Nominatim

# Impor modul database lokal untuk fallback offline
from pathlib import Path
BASE_DIR = Path(__file__).resolve().parent
sys.path.append(str(BASE_DIR))
from app.database import SessionLocal, Base, engine
from app import models

# Buat tabel jika belum ada
Base.metadata.create_all(bind=engine)

# Hindari error encoding Unicode pada konsol Windows
sys.stdout.reconfigure(encoding='utf-8')

# 1. Tentukan path file Excel di dalam folder proyek (relative path)
EXCEL_FILE = "dataset/Dataset HackathonTourism - IT DEL.xlsx"

if not os.path.exists(EXCEL_FILE):
    raise FileNotFoundError("Berkas 'dataset/Dataset HackathonTourism - IT DEL.xlsx' tidak ditemukan. Pastikan Anda sudah melakukan git pull.")

# 2. URL Endpoint FastAPI
API_URL = "http://127.0.0.1:8080/api/admin/destinasi"

# Buka file excel untuk membaca sheet-sheetnya
xl = pd.ExcelFile(EXCEL_FILE)
print(f"Berhasil membuka file Excel: {EXCEL_FILE}")
print(f"Sheet yang tersedia: {xl.sheet_names}\n")

# Fungsi pembantu ekstraksi kecamatan
def ekstrak_kecamatan(alamat_teks):
    alamat_lengkap = str(alamat_teks)
    for kec in ["Balige", "Pangururan", "Laguboti", "Muara", "Porsea", "Silaen"]:
        if kec.lower() in alamat_lengkap.lower():
            return kec
    return "Toba"

# Geolocator Nominatim (OpenStreetMap) dengan timeout 5 detik
geolocator = Nominatim(user_agent="tobaroute_data_agent_amos", timeout=5)

def ambil_koordinat_default(kecamatan):
    # Titik acuan utama per kecamatan sebagai cadangan keamanan data (Kelompok C / Fallback)
    koordinat_pusat = {
        "Balige": (2.3333, 99.0667),
        "Pangururan": (2.6000, 98.7000),
        "Laguboti": (2.3833, 99.1333),
        "Muara": (2.3167, 98.9333),
        "Porsea": (2.4500, 99.1333),
        "Silaen": (2.3167, 99.1833),
        "Toba": (2.3300, 99.0600)
    }
    
    # Ambil koordinat pusat kecamatan, fallback ke Toba jika tidak terdaftar
    kecamatan_clean = str(kecamatan).strip().title()
    base_coords = koordinat_pusat.get(kecamatan_clean, koordinat_pusat["Toba"])
    
    # Tambahkan jitter acak kecil agar pin tidak bertumpuk di koordinat yang sama persis
    lat_jitter = base_coords[0] + random.uniform(-0.005, 0.005)
    lon_jitter = base_coords[1] + random.uniform(-0.005, 0.005)
    return lat_jitter, lon_jitter

def dapatkan_koordinat(alamat, kecamatan_default):
    alamat_str = str(alamat).strip()
    
    # Deteksi alamat kosong, Plus Code Google (misal: 828R+Q2), atau area luar Toba
    if pd.isna(alamat) or len(alamat_str) < 5 or "+" in alamat_str or "Humbang Hasundutan".lower() in alamat_str.lower():
        return ambil_koordinat_default(kecamatan_default)
    
    try:
        # Batasi query agar ramah OSM rate limit
        time.sleep(0.5)
        lokasi = geolocator.geocode(f"{alamat_str}, Toba, Sumatera Utara")
        if lokasi:
            return lokasi.latitude, lokasi.longitude
    except Exception:
        pass
        
    return ambil_koordinat_default(kecamatan_default)

def kirim_atau_simpan(payload, tag):
    try:
        response = requests.post(API_URL, json=payload, timeout=1)
        if response.status_code == 200:
            print(f" [{tag}] Successfully Ingested (via API): {payload['nama']}")
            return
    except Exception:
        pass
    
    # Fallback simpan langsung ke Database jika API server offline
    db = SessionLocal()
    try:
        destinasi = models.Destinasi(**payload)
        db.add(destinasi)
        db.commit()
        print(f" [{tag}] Successfully Ingested (via Direct DB): {payload['nama']}")
    except Exception as e:
        db.rollback()
        print(f"❌ [{tag}] Failed to save {payload['nama']}: {e}")
    finally:
        db.close()

# ==============================================================================
# FUNGSI 1: INGEST TEMPAT WISATA
# ==============================================================================
def ingest_wisata():
    if "tempat-wisata-v1" not in xl.sheet_names:
        print("Sheet 'tempat-wisata-v1' tidak ditemukan.")
        return
        
    df = pd.read_excel(EXCEL_FILE, sheet_name="tempat-wisata-v1")
    print(f"Memproses Sheet Wisata ({len(df)} baris)...")
    
    for index, row in df.iterrows():
        kecamatan = ekstrak_kecamatan(row.get('add', 'Toba'))
        
        rating_raw = str(row.get('rating', '0.0')).replace(',', '.')
        try:
            rating_clean = float(rating_raw)
        except ValueError:
            rating_clean = 0.0

        deskripsi_gabungan = f"Fasilitas: {row.get('addons', '-')}. Ulasan Awal: {row.get('review', '-')}"
        nama_tempat = str(row.get('place', 'Destinasi Wisata'))
        
        # Koordinat riil dengan Geopy & Fallback
        latitude, longitude = dapatkan_koordinat(row.get('add', 'Kawasan Danau Toba'), kecamatan)

        payload = {
            "nama": nama_tempat,
            "kategori": "wisata",
            "kecamatan": kecamatan,
            "gambar_url": str(row.get('gambar_url')) if pd.notna(row.get('gambar_url')) else "https://images.unsplash.com/photo-1572252009286-268acec5ca0a",
            "deskripsi_singkat": f"Destinasi tipe {row.get('type', 'Umum')} dengan tarif masuk {row.get('entry-fee', 'Gratis')}.",
            "deskripsi_lengkap": deskripsi_gabungan,
            "nama_jalan": str(row.get('add', 'Kawasan Danau Toba')),
            "latitude": latitude,
            "longitude": longitude,
            "rating": rating_clean,
            "jumlah_ulasan": 15 + index # Angka ulasan bervariasi
        }

        kirim_atau_simpan(payload, "WISATA")

# ==============================================================================
# FUNGSI 2: INGEST KULINER
# ==============================================================================
def ingest_kuliner():
    # Coba gunakan sheet 'kuliner' jika ada, atau fallback ke 'hotel-resto-v1'
    if "kuliner" in xl.sheet_names:
        df = pd.read_excel(EXCEL_FILE, sheet_name="kuliner")
        print(f"\nMemproses Sheet Kuliner ({len(df)} baris)...")
        for index, row in df.iterrows():
            desc = str(row.get('description', 'Makanan khas lokal Danau Toba'))
            kecamatan = ekstrak_kecamatan(desc)
            
            # Koordinat riil dengan Geopy & Fallback
            nama_kuliner = str(row.get('kuliner-name', 'Kuliner Lokal'))
            latitude, longitude = dapatkan_koordinat(row.get('description', 'Kawasan Toba'), kecamatan)
            rating = 4.2 if (index % 2 == 0) else 4.5
            jumlah_ulasan = 5 if (index % 2 == 0) else 8 # Di bawah 15 ulasan

            payload = {
                "nama": nama_kuliner,
                "kategori": "kuliner",
                "kecamatan": kecamatan,
                "gambar_url": "https://images.unsplash.com/photo-1504674900247-0877df9cc836",
                "deskripsi_singkat": desc[:150] + "..." if len(desc) > 150 else desc,
                "deskripsi_lengkap": desc,
                "nama_jalan": f"Sentra Kuliner Kecamatan {kecamatan}",
                "latitude": latitude,
                "longitude": longitude,
                "rating": rating,
                "jumlah_ulasan": jumlah_ulasan
            }
            kirim_atau_simpan(payload, "KULINER")

    # Tambahan: Ingest data dari hotel-resto-v1 yang berkategori Restoran/Warung
    if "hotel-resto-v1" in xl.sheet_names:
        df_resto = pd.read_excel(EXCEL_FILE, sheet_name="hotel-resto-v1")
        print(f"\nMemproses Sheet Resto dari hotel-resto-v1...")
        for index, row in df_resto.iterrows():
            tipe = str(row.get('type', '')).lower()
            # Hanya ambil yang bertipe kuliner/restoran/cafe
            if 'hotel' not in tipe and 'penginapan' not in tipe:
                kecamatan = ekstrak_kecamatan(row.get('add', 'Toba'))
                rating_raw = str(row.get('rating', '0.0')).replace(',', '.')
                try:
                    rating_clean = float(rating_raw)
                except ValueError:
                    rating_clean = 4.0
                
                # Simulasi ulasan sedikit untuk Fairness test (ulasan < 15)
                jumlah_ulasan = 6 if (index % 2 == 0) else 12

                nama_resto = str(row.get('place', 'Resto Lokal'))
                latitude, longitude = dapatkan_koordinat(row.get('add', 'Kawasan Toba'), kecamatan)

                payload = {
                    "nama": nama_resto,
                    "kategori": "kuliner",
                    "kecamatan": kecamatan,
                    "gambar_url": "https://images.unsplash.com/photo-1555396273-367ea4eb4db5",
                    "deskripsi_singkat": f"Tempat kuliner tipe {row.get('type', 'Rumah Makan')} dengan menu khas Danau Toba.",
                    "deskripsi_lengkap": f"Fasilitas: {row.get('facilitates', '-')}. Ulasan: {row.get('review', '-')}",
                    "nama_jalan": str(row.get('add', 'Kawasan Toba')),
                    "latitude": latitude,
                    "longitude": longitude,
                    "rating": rating_clean,
                    "jumlah_ulasan": jumlah_ulasan
                }
                kirim_atau_simpan(payload, "RESTO")

# ==============================================================================
# FUNGSI 3: INGEST TRANSPORTASI (UMKM / Akomodasi Pendukung)
# ==============================================================================
def ingest_transportasi():
    if "transportasi" not in xl.sheet_names:
        print("Sheet 'transportasi' tidak ditemukan.")
        return
        
    df = pd.read_excel(EXCEL_FILE, sheet_name="transportasi")
    print(f"\nMemproses Sheet Transportasi ({len(df)} baris)...")
    
    for index, row in df.iterrows():
        arah = str(row.get('direction', 'Toba'))
        kecamatan = ekstrak_kecamatan(arah)
        
        desc = f"Jenis Mobil: {row.get('jenis-mobil', 'Umum')}. Jam Operasional: {row.get('operational-hour', '-')}. Detail: {row.get('description', '-')}"
        nama_transport = str(row.get('transport-name', 'Transportasi Lokal'))
        
        # Koordinat riil dengan Geopy & Fallback
        latitude, longitude = dapatkan_koordinat(arah, kecamatan)

        payload = {
            "nama": nama_transport,
            "kategori": "umkm", # Kita masukkan ke kategori 'umkm' agar adil bagi pengemudi lokal
            "kecamatan": kecamatan,
            "gambar_url": "https://images.unsplash.com/photo-1549317661-bd32c8ce0db2",
            "deskripsi_singkat": f"Layanan transportasi rute {row.get('direction', 'Lokal')} dengan tarif {row.get('price', '-')}.",
            "deskripsi_lengkap": desc,
            "nama_jalan": f"Terminal / Pool {kecamatan}",
            "latitude": latitude,
            "longitude": longitude,
            "rating": 4.6,
            "jumlah_ulasan": 7 # Ulasan sedikit, potensial masuk Fairness Recommendation!
        }
        
        kirim_atau_simpan(payload, "TRANSPORTASI")


if __name__ == "__main__":
    ingest_wisata()
    ingest_kuliner()
    ingest_transportasi()
    print("\nSemua proses ingestion data selesai!")
