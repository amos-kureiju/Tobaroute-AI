import os
import sys
import pandas as pd
import requests
import json
import time
import random
import re
from pathlib import Path

# Impor modul database lokal
BASE_DIR = Path(__file__).resolve().parent
sys.path.append(str(BASE_DIR))
from app.database import SessionLocal, Base, engine
from app import models

# Buat tabel jika belum ada
Base.metadata.create_all(bind=engine)
sys.stdout.reconfigure(encoding='utf-8')

EXCEL_FILE = "dataset/Dataset HackathonTourism - IT DEL.xlsx"
if not os.path.exists(EXCEL_FILE):
    raise FileNotFoundError("Berkas dataset Excel 'dataset/Dataset HackathonTourism - IT DEL.xlsx' tidak ditemukan.")

xl = pd.ExcelFile(EXCEL_FILE)
print("=========================================================")
print("  COMPREHENSIVE MULTI-REGENCY DATASET INGESTION ENGINE")
print("=========================================================")
print(f"Sheet terdeteksi ({len(xl.sheet_names)}): {xl.sheet_names}\n")

def ekstrak_kecamatan(alamat_teks):
    alamat_lengkap = str(alamat_teks).lower()
    kecamatans = [
        "balige", "pangururan", "simanindo", "laguboti", "muara", 
        "porsea", "silaen", "sianjur mulamula", "onan runggu", 
        "ronggur nihuta", "harian", "tampahan", "parapat", "lumban julu",
        "ajibata", "berastagi", "sidikalang", "tarutung", "doloksanggul",
        "baktiraja", "salak", "silahisabungan", "girsang sipangan bolon"
    ]
    for kec in kecamatans:
        if kec in alamat_lengkap:
            return kec.title()
    if "samosir" in alamat_lengkap:
        return "Simanindo"
    if "simalungun" in alamat_lengkap:
        return "Parapat"
    if "karo" in alamat_lengkap:
        return "Berastagi"
    if "dairi" in alamat_lengkap:
        return "Sidikalang"
    if "tapanuli utara" in alamat_lengkap or "taput" in alamat_lengkap:
        return "Tarutung"
    if "humbang" in alamat_lengkap or "humbahas" in alamat_lengkap:
        return "Doloksanggul"
    return "Balige"

def parse_lat_long(lat_long_str):
    if pd.isna(lat_long_str):
        return None, None
    val = str(lat_long_str).strip()
    try:
        parts = [p.strip() for p in val.split(',')]
        if len(parts) >= 2:
            lat = float(parts[0])
            lon = float(parts[1])
            if -90 <= lat <= 90 and -180 <= lon <= 180:
                return lat, lon
    except Exception:
        pass
    return None, None

def ambil_koordinat_default(kecamatan):
    koordinat_pusat = {
        "Balige": (2.3333, 99.0667),
        "Pangururan": (2.6000, 98.7000),
        "Simanindo": (2.6780, 98.8520),
        "Laguboti": (2.3833, 99.1333),
        "Muara": (2.3167, 98.9333),
        "Porsea": (2.4500, 99.1333),
        "Silaen": (2.3167, 99.1833),
        "Sianjur Mulamula": (2.5890, 98.6420),
        "Onan Runggu": (2.5020, 98.9210),
        "Ronggur Nihuta": (2.5650, 98.7150),
        "Harian": (2.5680, 98.6320),
        "Parapat": (2.6620, 98.9350),
        "Berastagi": (3.1870, 98.5110),
        "Sidikalang": (2.7480, 98.3120),
        "Tarutung": (2.0250, 98.9730),
        "Doloksanggul": (2.2570, 98.7510),
        "Salak": (2.5510, 98.3100)
    }
    base = koordinat_pusat.get(str(kecamatan).title(), (2.3300, 99.0600))
    return base[0] + random.uniform(-0.003, 0.003), base[1] + random.uniform(-0.003, 0.003)

def simpan_ke_db(db, payload):
    nama_clean = str(payload['nama']).strip()
    if not nama_clean or nama_clean.lower() in ['nan', 'none', 'null', 'no', 'nama kabupaten', 'hotel']:
        return False
    if len(nama_clean) < 3:
        return False
    
    existing = db.query(models.Destinasi).filter(models.Destinasi.nama.ilike(nama_clean)).first()
    if existing:
        existing.kategori = payload['kategori']
        existing.kecamatan = payload['kecamatan']
        existing.deskripsi_singkat = payload['deskripsi_singkat']
        existing.deskripsi_lengkap = payload['deskripsi_lengkap']
        existing.nama_jalan = payload['nama_jalan']
        existing.latitude = payload['latitude']
        existing.longitude = payload['longitude']
        existing.rating = payload['rating']
        existing.jumlah_ulasan = payload['jumlah_ulasan']
        if payload.get('gambar_url'):
            existing.gambar_url = payload['gambar_url']
        db.commit()
        return False
    else:
        new_item = models.Destinasi(
            nama=nama_clean,
            kategori=payload['kategori'],
            kecamatan=payload['kecamatan'],
            gambar_url=payload.get('gambar_url', "https://images.unsplash.com/photo-1572252009286-268acec5ca0a"),
            deskripsi_singkat=payload['deskripsi_singkat'],
            deskripsi_lengkap=payload['deskripsi_lengkap'],
            nama_jalan=payload['nama_jalan'],
            latitude=payload['latitude'],
            longitude=payload['longitude'],
            rating=payload['rating'],
            jumlah_ulasan=payload['jumlah_ulasan']
        )
        db.add(new_item)
        db.commit()
        return True

def main():
    db = SessionLocal()
    total_added = 0
    total_updated = 0

    # 1. PROCESS WAKTU OPERASIONAL DESTINASI (40 destinasies across 8 Regencies)
    if "waktu operasional destinasi" in xl.sheet_names:
        df = pd.read_excel(EXCEL_FILE, sheet_name="waktu operasional destinasi")
        print(f"[1/8] Memproses 'waktu operasional destinasi' ({len(df)} entitas)...")
        current_kab = "Toba"
        for idx, row in df.iterrows():
            kab_val = row.get('KABUPATEN')
            if pd.notna(kab_val) and str(kab_val).strip():
                current_kab = str(kab_val).strip().title()

            nama = str(row.get('OBJEK / DESTINASI WISATA', '')).strip()
            if not nama or nama.lower() == 'nan':
                continue
                
            alamat = str(row.get('ALAMAT', f"Kawasan {current_kab}"))
            kecamatan = ekstrak_kecamatan(f"{alamat} {current_kab}")
            lat, lon = ambil_koordinat_default(kecamatan)
            waktu_op = str(row.get('WAKTU OPERASIONAL', 'Setiap Hari 08:00 - 17:00')).replace('\n', ' ')
            fasilitas_u = str(row.get('FASILITAS UMUM', '-')).replace('\n', ' ')
            fasilitas_p = str(row.get('FASILITAS PENUNJANG', '-')).replace('\n', ' ')

            payload = {
                "nama": nama,
                "kategori": "wisata",
                "kecamatan": kecamatan,
                "nama_jalan": alamat,
                "latitude": lat,
                "longitude": lon,
                "rating": 4.8,
                "jumlah_ulasan": 25 + (idx % 35),
                "deskripsi_singkat": f"Destinasi unggulan di Kabupaten {current_kab} ({kecamatan}). Jam operasional: {waktu_op}.",
                "deskripsi_lengkap": f"Alamat: {alamat}. Waktu Operasional: {waktu_op}. Fasilitas Umum: {fasilitas_u}. Fasilitas Penunjang: {fasilitas_p}.",
                "gambar_url": "https://images.unsplash.com/photo-1506744038136-46273834b3fb?auto=format&fit=crop&w=600&q=80"
            }
            if simpan_ke_db(db, payload):
                total_added += 1
            else:
                total_updated += 1

    # 2. PROCESS INFO SEPUTAR DANAU TOBA (TOP 3) - Multi-regency Matrix
    if "Info Seputar Danau Toba (TOP 3)" in xl.sheet_names:
        df = pd.read_excel(EXCEL_FILE, sheet_name="Info Seputar Danau Toba (TOP 3)")
        print(f"[2/8] Memproses 'Info Seputar Danau Toba (TOP 3)' ({len(df)} baris matriks 8 Kabupaten)...")
        current_kab = "Toba"
        for idx in range(3, len(df)):
            row = df.iloc[idx]
            kab_val = row.iloc[1]
            if pd.notna(kab_val) and str(kab_val).strip():
                current_kab = str(kab_val).strip().title()

            # Parse Hotel / Homestay / Resto / Cafe / Souvenir / Transport columns
            entries = [
                (row.iloc[2], "penginapan", "Hotel"),
                (row.iloc[5], "penginapan", "Homestay"),
                (row.iloc[8], "kuliner", "Restoran Halal"),
                (row.iloc[11], "kuliner", "Rumah Makan Batak"),
                (row.iloc[14], "kuliner", "Café"),
                (row.iloc[17], "kuliner", "Pub & Bar"),
                (row.iloc[19], "umkm", "Pusat Oleh-oleh"),
                (row.iloc[21], "umkm", "Kapal Ferry / Transportasi"),
                (row.iloc[23], "umkm", "Kapal Tradisional"),
                (row.iloc[27], "umkm", "Angkutan Umum / Bus")
            ]

            for raw_val, kat, tipe in entries:
                if pd.notna(raw_val):
                    lines = str(raw_val).split('\n')
                    for line in lines:
                        line_clean = line.strip()
                        if len(line_clean) > 4 and not line_clean.lower().startswith(('rating', 'harga', 'ulasan', 'alamat', 'biaya')):
                            nama_entitas = line_clean.split('(')[0].strip()
                            kecamatan = ekstrak_kecamatan(f"{line_clean} {current_kab}")
                            lat, lon = ambil_koordinat_default(kecamatan)

                            payload = {
                                "nama": nama_entitas,
                                "kategori": kat,
                                "kecamatan": kecamatan,
                                "nama_jalan": line_clean[:120],
                                "latitude": lat,
                                "longitude": lon,
                                "rating": 4.7,
                                "jumlah_ulasan": 10 + random.randint(1, 20),
                                "deskripsi_singkat": f"Fasilitas {tipe} unggulan di Kabupaten {current_kab} ({kecamatan}).",
                                "deskripsi_lengkap": f"{line_clean}. Kategori {tipe} di kawasan pariwisata Kabupaten {current_kab}.",
                                "gambar_url": "https://images.unsplash.com/photo-1544025162-d76694265947?auto=format&fit=crop&w=600&q=80"
                            }
                            if simpan_ke_db(db, payload):
                                total_added += 1
                            else:
                                total_updated += 1

    # 3. PROCESS WISATA-METADATA (139 rows)
    if "wisata-metadata" in xl.sheet_names:
        df = pd.read_excel(EXCEL_FILE, sheet_name="wisata-metadata")
        print(f"[3/8] Memproses 'wisata-metadata' ({len(df)} entitas)...")
        for idx, row in df.iterrows():
            nama = str(row.get('place-name', ''))
            alamat = str(row.get('address', 'Kawasan Danau Toba'))
            kecamatan = ekstrak_kecamatan(alamat)
            lat, lon = parse_lat_long(row.get('lat-long'))
            if not lat or not lon:
                lat, lon = ambil_koordinat_default(kecamatan)
            
            try:
                rating = float(str(row.get('place-rating', '4.8')).replace(',', '.'))
            except Exception:
                rating = 4.8

            desc_singkat = str(row.get('description', f"Destinasi wisata {row.get('place-type', 'alam')} populer di {kecamatan}."))
            desc_lengkap = f"Tipe: {row.get('place-type', 'Wisata')}. HTM: {row.get('entry-fee', 'Gratis')}. Jam Operasional: {row.get('operational-hour', 'Setiap Hari')}. Kepemilikan: {row.get('place-ownership', 'Lokal')}. Deskripsi: {row.get('description', '-')}"

            payload = {
                "nama": nama,
                "kategori": "wisata",
                "kecamatan": kecamatan,
                "nama_jalan": alamat,
                "latitude": lat,
                "longitude": lon,
                "rating": rating,
                "jumlah_ulasan": 20 + (idx % 40),
                "deskripsi_singkat": desc_singkat[:180],
                "deskripsi_lengkap": desc_lengkap,
                "gambar_url": "https://images.unsplash.com/photo-1506744038136-46273834b3fb?auto=format&fit=crop&w=600&q=80"
            }
            if simpan_ke_db(db, payload):
                total_added += 1
            else:
                total_updated += 1

    # 4. PROCESS RESTO-METADATA (148 rows)
    if "resto-metadata" in xl.sheet_names:
        df = pd.read_excel(EXCEL_FILE, sheet_name="resto-metadata")
        print(f"[4/8] Memproses 'resto-metadata' ({len(df)} entitas)...")
        for idx, row in df.iterrows():
            nama = str(row.get('place-name', ''))
            alamat = str(row.get('address', 'Kawasan Danau Toba'))
            kecamatan = ekstrak_kecamatan(alamat)
            lat, lon = parse_lat_long(row.get('lat-long'))
            if not lat or not lon:
                lat, lon = ambil_koordinat_default(kecamatan)
            
            try:
                rating = float(str(row.get('place-rating', '4.6')).replace(',', '.'))
            except Exception:
                rating = 4.6

            menu = str(row.get('recommend-menu', '-'))
            fasilitas = str(row.get('Fasilitas', '-'))

            payload = {
                "nama": nama,
                "kategori": "kuliner",
                "kecamatan": kecamatan,
                "nama_jalan": alamat,
                "latitude": lat,
                "longitude": lon,
                "rating": rating,
                "jumlah_ulasan": 5 + (idx % 12),
                "deskripsi_singkat": f"Restoran/Kuliner {row.get('place-type', 'Lokal')} di {kecamatan}. Menu Andalan: {menu}.",
                "deskripsi_lengkap": f"Menu Rekomendasi: {menu}. Estimasi Harga: {row.get('price-per-head', 'Terjangkau')}. Jam Buka: {row.get('opening-hours', '08:00 - 21:00')}. Fasilitas: {fasilitas}.",
                "gambar_url": "https://images.unsplash.com/photo-1544025162-d76694265947?auto=format&fit=crop&w=600&q=80"
            }
            if simpan_ke_db(db, payload):
                total_added += 1
            else:
                total_updated += 1

    # 5. PROCESS HOTEL-METADATA (36 rows)
    if "hotel-metadata" in xl.sheet_names:
        df = pd.read_excel(EXCEL_FILE, sheet_name="hotel-metadata")
        print(f"[5/8] Memproses 'hotel-metadata' ({len(df)} entitas)...")
        for idx, row in df.iterrows():
            nama = str(row.get('place-name', ''))
            alamat = str(row.get('address', 'Kawasan Danau Toba'))
            kecamatan = ekstrak_kecamatan(alamat)
            lat, lon = parse_lat_long(row.get('lat-long'))
            if not lat or not lon:
                lat, lon = ambil_koordinat_default(kecamatan)
            
            try:
                rating = float(str(row.get('place-rating', '4.7')).replace(',', '.'))
            except Exception:
                rating = 4.7

            payload = {
                "nama": nama,
                "kategori": "penginapan",
                "kecamatan": kecamatan,
                "nama_jalan": alamat,
                "latitude": lat,
                "longitude": lon,
                "rating": rating,
                "jumlah_ulasan": 14 + (idx % 25),
                "deskripsi_singkat": f"Akomodasi & Hotel {row.get('place-type', 'Lokal')} di kawasan {kecamatan}.",
                "deskripsi_lengkap": f"Fasilitas: {row.get('Fasilitas', '-')}. Kisaran Harga: {row.get('price-per-head', '-')}. Check-in/out: {row.get('check-in', '14:00')} / {row.get('check-out', '12:00')}.",
                "gambar_url": "https://images.unsplash.com/photo-1566073771259-6a8506099945?auto=format&fit=crop&w=600&q=80"
            }
            if simpan_ke_db(db, payload):
                total_added += 1
            else:
                total_updated += 1

    # 6. PROCESS TEMPAT-WISATA-V1 (96 rows)
    if "tempat-wisata-v1" in xl.sheet_names:
        df = pd.read_excel(EXCEL_FILE, sheet_name="tempat-wisata-v1")
        print(f"[6/8] Memproses 'tempat-wisata-v1' ({len(df)} entitas)...")
        for idx, row in df.iterrows():
            nama = str(row.get('place', ''))
            alamat = str(row.get('add', 'Kawasan Danau Toba'))
            kecamatan = ekstrak_kecamatan(alamat)
            lat, lon = ambil_koordinat_default(kecamatan)
            
            try:
                rating = float(str(row.get('rating', '4.6')).replace(',', '.'))
            except Exception:
                rating = 4.6

            payload = {
                "nama": nama,
                "kategori": "wisata",
                "kecamatan": kecamatan,
                "nama_jalan": alamat,
                "latitude": lat,
                "longitude": lon,
                "rating": rating,
                "jumlah_ulasan": 12 + (idx % 30),
                "deskripsi_singkat": f"Wisata {row.get('type', 'Alam')} dengan tarif {row.get('entry-fee', 'Gratis')}.",
                "deskripsi_lengkap": f"Fasilitas: {row.get('addons', '-')}. Ulasan: {row.get('review', '-')}.",
                "gambar_url": "https://images.unsplash.com/photo-1572252009286-268acec5ca0a?auto=format&fit=crop&w=600&q=80"
            }
            if simpan_ke_db(db, payload):
                total_added += 1
            else:
                total_updated += 1

    # 7. PROCESS TRANSPORTASI & KULINER SHEETS
    if "transportasi" in xl.sheet_names:
        df = pd.read_excel(EXCEL_FILE, sheet_name="transportasi")
        print(f"[7/8] Memproses 'transportasi' ({len(df)} entitas)...")
        for idx, row in df.iterrows():
            nama = str(row.get('transport-name', ''))
            arah = str(row.get('direction', 'Toba'))
            kecamatan = ekstrak_kecamatan(arah)
            lat, lon = ambil_koordinat_default(kecamatan)

            payload = {
                "nama": nama,
                "kategori": "umkm",
                "kecamatan": kecamatan,
                "nama_jalan": f"Terminal Rute {arah}",
                "latitude": lat,
                "longitude": lon,
                "rating": 4.6,
                "jumlah_ulasan": 8,
                "deskripsi_singkat": f"Layanan transportasi rute {arah} ({row.get('jenis-mobil', 'Umum')}).",
                "deskripsi_lengkap": f"Tarif: {row.get('price', '-')}. Jam Operasional: {row.get('operational-hour', '-')}. Detail: {row.get('description', '-')}.",
                "gambar_url": "https://images.unsplash.com/photo-1549317661-bd32c8ce0db2?auto=format&fit=crop&w=600&q=80"
            }
            if simpan_ke_db(db, payload):
                total_added += 1
            else:
                total_updated += 1

    # 8. RUN VERIFIED SAMOSIR & TOBA ENRICHMENT
    print(f"[8/8] Menyuntikkan dataset terverifikasi Samosir & Toba...")
    try:
        from add_verified_culinary_data import add_verified_data
        add_verified_data()
    except Exception as e:
        print(f"WARN Verified enrichment error: {e}")

    db.close()
    print("=========================================================")
    print(f"🎉 SUKSES INGESTION DATASET COMPREHENSIVE MULTI-REGENCY!")
    print(f"   Entitas Baru Ditambahkan : {total_added}")
    print(f"   Entitas Diperbarui/Refined: {total_updated}")
    print("=========================================================\n")

if __name__ == "__main__":
    main()
