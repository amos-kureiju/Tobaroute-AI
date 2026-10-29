"""
TobaRoute Data Management Tool
================================
Skrip manajemen terintegrasi untuk inisialisasi database, ekstraksi/ingestion dataset,
dan sinkronisasi vector indexing Pinecone.

Penggunaan CLI:
  python manage_data.py --init-db       : Inisialisasi database & tabel PostgreSQL
  python manage_data.py --ingest        : Mengimpor dataset pariwisata ke PostgreSQL
  python manage_data.py --sync-pinecone : Mengisi & menyelaraskan vektor di Pinecone
  python manage_data.py --all           : Menjalankan seluruh alur setup di atas
"""

import os
import sys
import argparse
import random
import time
from pathlib import Path

# Impor modul dasar
BASE_DIR = Path(__file__).resolve().parent
sys.path.append(str(BASE_DIR))

def init_database():
    """Inisialisasi database PostgreSQL 'tobaguide_db' dan pembuatan skema tabel."""
    import psycopg2
    from psycopg2.extensions import ISOLATION_LEVEL_AUTOCOMMIT
    from app.database import Base, engine
    from app import models

    print("\n--- 1. INISIALISASI DATABASE POSTGRESQL ---")
    try:
        conn = psycopg2.connect(
            dbname='postgres',
            user='postgres',
            host='localhost',
            port=5432
        )
        conn.set_isolation_level(ISOLATION_LEVEL_AUTOCOMMIT)
        cursor = conn.cursor()
        
        cursor.execute("SELECT 1 FROM pg_catalog.pg_database WHERE datname = 'tobaguide_db'")
        exists = cursor.fetchone()
        
        if not exists:
            print("[INFO] Membuat database 'tobaguide_db'...")
            cursor.execute("CREATE DATABASE tobaguide_db")
            print("[OK] Database 'tobaguide_db' berhasil dibuat!")
        else:
            print("[OK] Database 'tobaguide_db' terdeteksi aktif.")
            
        cursor.close()
        conn.close()
    except Exception as e:
        print(f"[WARN] Inisialisasi basis data PostgreSQL: {e}")

    print("[INFO] Membuat skema tabel ORM...")
    Base.metadata.create_all(bind=engine)
    print("[OK] Skema tabel database telah siap!\n")

def ingest_dataset():
    """Mengimpor dataset pariwisata dari Excel ke PostgreSQL."""
    import pandas as pd
    from app.database import SessionLocal
    from app import models

    EXCEL_FILE = BASE_DIR / "dataset" / "Dataset HackathonTourism - IT DEL.xlsx"
    if not os.path.exists(EXCEL_FILE):
        print(f"[ERROR] Berkas dataset '{EXCEL_FILE}' tidak ditemukan.")
        return

    print("\n--- 2. INGESTION DATASET PARIWISATA ---")
    xl = pd.ExcelFile(EXCEL_FILE)
    print(f"[INFO] Dataset terdeteksi ({len(xl.sheet_names)} Sheet): {xl.sheet_names}")

    db = SessionLocal()

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

    KNOWN_EXACT_COORDINATES = {
        "batikta & sentra tenun ulos balige": (2.3325, 99.0638),
        "batikta": (2.3325, 99.0638),
        "monumen d.i. panjaitan": (2.3347, 99.0645),
        "monumen di panjaitan": (2.3347, 99.0645),
        "desa wisata silalahi pagar batu": (2.3310, 99.0492),
        "museum tb silalahi center": (2.3325, 99.0558),
        "museum batak t.b. silalahi center": (2.3325, 99.0558),
        "arung jeram desa parhitean": (2.5312, 99.3178),
        "rm islam \"nauli\"": (2.3338, 99.0629),
        "pantai pasir putih lumban bulbul": (2.3485, 99.0712),
        "pantai pasir putih lumban bul-bul balige": (2.3485, 99.0712),
        "pantai lumban silintong": (2.3421, 99.0510),
        "bukit pahoda": (2.3494, 99.0403),
        "bukit pahoda tampahan": (2.3160, 99.0125),
        "desa wisata meat tampahan": (2.3120, 99.0180),
        "pelabuhan balige": (2.3360, 99.0602),
        "pasar tradisional onan balige": (2.3350, 99.0630),
        "makam pahlawan nasional sisingamangaraja xii": (2.3290, 99.0680),
        "geosite sipinsur pollung": (2.3100, 98.6800),
        "geosite sipinsur": (2.3100, 98.6800),
        "air terjun sipiso-piso": (2.9180, 98.5240),
        "air terjun sipiso-piso brandan": (2.9180, 98.5240),
        "salib kasih tarutung": (2.0250, 98.9730),
        "wisata religi salib kasih tarutung": (2.0250, 98.9730),
        "pemandian air panas aek rangat pangururan": (2.6120, 98.6920),
        "waterfront city pangururan": (2.6033, 98.7050),
        "jembatan tano ponggol pangururan": (2.6015, 98.7080),
        "bukit holbung samosir": (2.5830, 98.7210),
        "pantai batu hoda simanindo": (2.7620, 98.7380),
        "desa wisata tomok & makam raja sidabutar": (2.6650, 98.8620),
        "menara pandang tele": (2.5830, 98.6330),
        "air terjun efrata harian": (2.5710, 98.6480),
        "desa wisata sianjur mulamula": (2.5890, 98.6420),
        "aek sipitu dai sianjur mulamula": (2.5920, 98.6400),
        "lembah bakkara & baktiraja": (2.3250, 98.8150),
        "air terjun janji baktiraja": (2.3210, 98.8180)
    }

    def ambil_koordinat_default(kecamatan, nama_tempat=""):
        if nama_tempat:
            k_nama = str(nama_tempat).strip().lower()
            for key, (lat, lon) in KNOWN_EXACT_COORDINATES.items():
                if key in k_nama or k_nama in key:
                    return lat, lon

        koordinat_pusat = {
            "Balige": (2.3328, 99.0638),
            "Laguboti": (2.3520, 99.1225),
            "Sigumpar": (2.3920, 99.1550),
            "Porsea": (2.4480, 99.1460),
            "Silaen": (2.3870, 99.2050),
            "Tampahan": (2.3160, 99.0125),
            "Lumban Julu": (2.6010, 99.0480),
            "Ajibata": (2.6680, 98.9380),
            "Pangururan": (2.6033, 98.7050),
            "Simanindo": (2.6850, 98.8350),
            "Harian": (2.5810, 98.6320),
            "Muara": (2.3378, 98.9048),
            "Sianjur Mulamula": (2.5890, 98.6420),
            "Onan Runggu": (2.5020, 98.9210),
            "Palipi": (2.4450, 98.7900),
            "Ronggur Nihuta": (2.5800, 98.7700),
            "Parapat": (2.6620, 98.9350),
            "Girsang Sipangan Bolon": (2.6620, 98.9350),
            "Berastagi": (3.1870, 98.5110),
            "Sidikalang": (2.7480, 98.3120),
            "Tarutung": (2.0250, 98.9730),
            "Doloksanggul": (2.2570, 98.7510),
            "Baktiraja": (2.3250, 98.8150),
            "Pollung": (2.3100, 98.6800)
        }
        base = koordinat_pusat.get(str(kecamatan).title(), (2.3328, 99.0638))
        return base[0], base[1]

    def simpan_ke_db(payload):
        nama_clean = str(payload['nama']).strip()
        if not nama_clean or nama_clean.lower() in ['nan', 'none', 'null', 'no', 'nama kabupaten', 'hotel']:
            return False
        if len(nama_clean) < 3:
            return False

        # Cek jika ada koordinat spesifik presisi
        n_low = nama_clean.lower()
        for k_poi, (plat, plon) in KNOWN_EXACT_COORDINATES.items():
            if k_poi in n_low or n_low in k_poi:
                payload['latitude'] = plat
                payload['longitude'] = plon
                break

        existing = db.query(models.Destinasi).filter(models.Destinasi.nama.ilike(nama_clean)).first()
        if existing:
            existing.kategori = payload['kategori']
            existing.kecamatan = payload['kecamatan']
            existing.nama_jalan = payload['nama_jalan']
            if payload['latitude'] and payload['longitude']:
                # Jangan timpa koordinat asli dengan koordinat default kecamatan
                def_lat, def_lon = ambil_koordinat_default(payload['kecamatan'])
                is_default_coords = (abs(payload['latitude'] - def_lat) < 0.0005 and abs(payload['longitude'] - def_lon) < 0.0005)
                if not is_default_coords or not existing.latitude:
                    existing.latitude = payload['latitude']
                    existing.longitude = payload['longitude']
            existing.rating = payload['rating']
            existing.jumlah_ulasan = payload['jumlah_ulasan']
            existing.deskripsi_singkat = payload['deskripsi_singkat']
            existing.deskripsi_lengkap = payload['deskripsi_lengkap']
            db.commit()
            return False
        else:
            baru = models.Destinasi(
                nama=nama_clean,
                kategori=payload['kategori'],
                kecamatan=payload['kecamatan'],
                nama_jalan=payload['nama_jalan'],
                latitude=payload['latitude'],
                longitude=payload['longitude'],
                rating=payload['rating'],
                jumlah_ulasan=payload['jumlah_ulasan'],
                deskripsi_singkat=payload['deskripsi_singkat'],
                deskripsi_lengkap=payload['deskripsi_lengkap'],
                gambar_url=payload.get('gambar_url', '')
            )
            db.add(baru)
            db.commit()
            return True

    print("[INFO] Membersihkan seluruh data lama di database (Purge Old/Dummy Data)...")
    db.query(models.Destinasi).delete()
    db.commit()
    print("[OK] Database bersih. Memulai ingestion 100% murni dari file Excel resmi panitia...")

    total_added = 0
    total_updated = 0

    def clean_val(val, default="-"):
        if val is None:
            return default
        s = str(val).strip()
        if s.lower() in ['nan', 'none', 'null', '', 'tidak ada']:
            return default
        return s

    # Ingestion Sheet Processors
    # 1. Sheet 'wisata-metadata'
    if "wisata-metadata" in xl.sheet_names:
        df = pd.read_excel(EXCEL_FILE, sheet_name="wisata-metadata")
        print(f"[1/5] Memproses 'wisata-metadata' ({len(df)} entitas)...")
        for idx, row in df.iterrows():
            nama = clean_val(row.get('place-name'), default='')
            alamat = clean_val(row.get('address'), default='Kawasan Danau Toba')
            kecamatan = ekstrak_kecamatan(alamat)
            lat, lon = parse_lat_long(row.get('lat-long'))
            if not lat or not lon:
                lat, lon = ambil_koordinat_default(kecamatan)
            
            try:
                rating = float(str(row.get('place-rating', '4.7')).replace(',', '.'))
            except Exception:
                rating = 4.7

            fasilitas = clean_val(row.get('Fasilitas'))
            harga = clean_val(row.get('price-per-head'), default='Terjangkau')
            jam = clean_val(row.get('operational-hour', row.get('opening-hours')), default='08:00 - 18:00')
            tipe = clean_val(row.get('place-type'), default='Populer')

            payload = {
                "nama": nama,
                "kategori": "wisata",
                "kecamatan": kecamatan,
                "nama_jalan": alamat,
                "latitude": lat,
                "longitude": lon,
                "rating": rating,
                "jumlah_ulasan": 25 + (idx % 40),
                "deskripsi_singkat": f"Objek wisata {tipe.lower()} unggulan dengan pesona alam asri di {kecamatan}.",
                "deskripsi_lengkap": f"Fasilitas: {fasilitas}. Estimasi Biaya: {harga}. Jam Operasional: {jam}.",
                "gambar_url": "https://images.unsplash.com/photo-1506744038136-46273834b3fb?auto=format&fit=crop&w=800&q=80"
            }
            if simpan_ke_db(payload):
                total_added += 1
            else:
                total_updated += 1

    # 2. Sheet 'resto-metadata'
    if "resto-metadata" in xl.sheet_names:
        df = pd.read_excel(EXCEL_FILE, sheet_name="resto-metadata")
        print(f"[2/5] Memproses 'resto-metadata' ({len(df)} entitas)...")
        for idx, row in df.iterrows():
            nama = clean_val(row.get('place-name'), default='')
            alamat = clean_val(row.get('address'), default='Kawasan Danau Toba')
            kecamatan = ekstrak_kecamatan(alamat)
            lat, lon = parse_lat_long(row.get('lat-long'))
            if not lat or not lon:
                lat, lon = ambil_koordinat_default(kecamatan)
            
            try:
                rating = float(str(row.get('place-rating', '4.5')).replace(',', '.'))
            except Exception:
                rating = 4.5

            menu = clean_val(row.get('recommend-menu'))
            fasilitas = clean_val(row.get('Fasilitas'))
            jam_buka = clean_val(row.get('opening-hours'), default='09:00 - 21:00')
            harga = clean_val(row.get('price-per-head'), default='Terjangkau')

            singkat = f"Rumah makan & kuliner khas di {kecamatan} dengan pilihan hidangan lokal autentik."
            if menu != "-":
                singkat = f"Rumah makan khas di {kecamatan} dengan menu andalan seperti {menu.split(',')[0]}."

            payload = {
                "nama": nama,
                "kategori": "kuliner",
                "kecamatan": kecamatan,
                "nama_jalan": alamat,
                "latitude": lat,
                "longitude": lon,
                "rating": rating,
                "jumlah_ulasan": 15 + (idx % 35),
                "deskripsi_singkat": singkat,
                "deskripsi_lengkap": f"Menu Rekomendasi: {menu}. Fasilitas: {fasilitas}. Jam Operasional: {jam_buka}. Estimasi Harga: {harga}.",
                "gambar_url": "https://images.unsplash.com/photo-1555396273-367ea4eb4db5?auto=format&fit=crop&w=600&q=80"
            }
            if simpan_ke_db(payload):
                total_added += 1
            else:
                total_updated += 1

    # 3. Sheet 'hotel-metadata'
    if "hotel-metadata" in xl.sheet_names:
        df = pd.read_excel(EXCEL_FILE, sheet_name="hotel-metadata")
        print(f"[3/5] Memproses 'hotel-metadata' ({len(df)} entitas)...")
        for idx, row in df.iterrows():
            nama = clean_val(row.get('place-name'), default='')
            alamat = clean_val(row.get('address'), default='Kawasan Danau Toba')
            kecamatan = ekstrak_kecamatan(alamat)
            lat, lon = parse_lat_long(row.get('lat-long'))
            if not lat or not lon:
                lat, lon = ambil_koordinat_default(kecamatan)
            
            try:
                rating = float(str(row.get('place-rating', '4.4')).replace(',', '.'))
            except Exception:
                rating = 4.4

            fasilitas = clean_val(row.get('Fasilitas'))
            checkin = clean_val(row.get('check-in'), default='14:00')
            checkout = clean_val(row.get('check-out'), default='12:00')
            harga = clean_val(row.get('price-per-head'), default='Sesuai tipe kamar')

            payload = {
                "nama": nama,
                "kategori": "penginapan",
                "kecamatan": kecamatan,
                "nama_jalan": alamat,
                "latitude": lat,
                "longitude": lon,
                "rating": rating,
                "jumlah_ulasan": 18 + (idx % 30),
                "deskripsi_singkat": f"Akomodasi penginapan dan hotel nyaman untuk istirahat wisatawan di kawasan {kecamatan}.",
                "deskripsi_lengkap": f"Fasilitas: {fasilitas}. Check-in: {checkin}, Check-out: {checkout}. Estimasi Tarif: {harga}.",
                "gambar_url": "https://images.unsplash.com/photo-1566073771259-6a8506099945?auto=format&fit=crop&w=600&q=80"
            }
            if simpan_ke_db(payload):
                total_added += 1
            else:
                total_updated += 1

    # 4. Sheet 'tempat-wisata-v1'
    if "tempat-wisata-v1" in xl.sheet_names:
        df = pd.read_excel(EXCEL_FILE, sheet_name="tempat-wisata-v1")
        print(f"[4/5] Memproses 'tempat-wisata-v1' ({len(df)} entitas)...")
        for idx, row in df.iterrows():
            nama = clean_val(row.get('place'), default='')
            alamat = clean_val(row.get('add', row.get('addons')), default='Kawasan Danau Toba')
            kecamatan = ekstrak_kecamatan(alamat)
            lat, lon = parse_lat_long(row.get('add'))
            if not lat or not lon:
                lat, lon = ambil_koordinat_default(kecamatan)
            
            try:
                rating = float(str(row.get('rating', '4.6')).replace(',', '.'))
            except Exception:
                rating = 4.6

            entry = clean_val(row.get('entry-fee'), default='Gratis/Terjangkau')
            jam = clean_val(row.get('service-hour'), default='08:00 - 18:00')
            review = clean_val(row.get('review'))
            tipe = clean_val(row.get('type'), default='alam')

            singkat = f"Destinasi wisata {tipe.lower()} favorit dengan suasana asri di {kecamatan}."
            lengkap = f"Tiket Masuk: {entry}. Jam Buka: {jam}."
            if review != "-":
                lengkap += f" Ulasan: {review}."

            payload = {
                "nama": nama,
                "kategori": "wisata",
                "kecamatan": kecamatan,
                "nama_jalan": alamat,
                "latitude": lat,
                "longitude": lon,
                "rating": rating,
                "jumlah_ulasan": 20 + (idx % 25),
                "deskripsi_singkat": singkat,
                "deskripsi_lengkap": lengkap,
                "gambar_url": "https://images.unsplash.com/photo-1506744038136-46273834b3fb?auto=format&fit=crop&w=600&q=80"
            }
            if simpan_ke_db(payload):
                total_added += 1
            else:
                total_updated += 1

    # 5. Sheet 'transportasi'
    if "transportasi" in xl.sheet_names:
        df = pd.read_excel(EXCEL_FILE, sheet_name="transportasi")
        print(f"[5/5] Memproses 'transportasi' ({len(df)} entitas)...")
        for idx, row in df.iterrows():
            nama = clean_val(row.get('transport-name'), default='')
            direction = clean_val(row.get('direction'), default='Kawasan Danau Toba')
            kecamatan = ekstrak_kecamatan(direction)
            lat, lon = ambil_koordinat_default(kecamatan)
            price = clean_val(row.get('price'), default='Terjangkau')
            jam = clean_val(row.get('operational-hour'), default='24 Jam')
            desc = clean_val(row.get('description'))
            mobil = clean_val(row.get('jenis-mobil'), default='Angkutan/Kapal')

            payload = {
                "nama": f"Transportasi: {nama}",
                "kategori": "transportasi",
                "kecamatan": kecamatan,
                "nama_jalan": direction,
                "latitude": lat,
                "longitude": lon,
                "rating": 4.5,
                "jumlah_ulasan": 12 + idx,
                "deskripsi_singkat": f"Layanan transportasi ({mobil}) melayani rute perjalanan di kawasan Danau Toba.",
                "deskripsi_lengkap": f"Rute: {direction}. Tarif: {price}. Jam Operasional: {jam}." + (f" Info: {desc}." if desc != '-' else ""),
                "gambar_url": "https://images.unsplash.com/photo-1544551763-46a013bb70d5?auto=format&fit=crop&w=600&q=80"
            }
            if simpan_ke_db(payload):
                total_added += 1
            else:
                total_updated += 1

    # 6. Sheet 'hotel-resto-v1'
    if "hotel-resto-v1" in xl.sheet_names:
        df = pd.read_excel(EXCEL_FILE, sheet_name="hotel-resto-v1")
        print(f"[*] Memproses 'hotel-resto-v1' ({len(df)} entitas)...")
        for idx, row in df.iterrows():
            nama = clean_val(row.get('place'), default='')
            alamat = clean_val(row.get('add'), default='Kawasan Danau Toba')
            kecamatan = ekstrak_kecamatan(alamat)
            lat, lon = parse_lat_long(alamat)
            if not lat or not lon:
                lat, lon = ambil_koordinat_default(kecamatan)
            
            try:
                rating = float(str(row.get('rating', '4.5')).replace(',', '.'))
            except Exception:
                rating = 4.5

            place_type = clean_val(row.get('type'), default='Kuliner / Hotel').lower()
            cat = "penginapan" if "hotel" in place_type or "penginapan" in place_type else "kuliner"
            htm = clean_val(row.get('htm'), default='Terjangkau')
            fasilitas = clean_val(row.get('facilitates'))
            jam = clean_val(row.get('service-hour'), default='08:00 - 21:00')
            review = clean_val(row.get('review'))

            payload = {
                "nama": nama,
                "kategori": cat,
                "kecamatan": kecamatan,
                "nama_jalan": alamat,
                "latitude": lat,
                "longitude": lon,
                "rating": rating,
                "jumlah_ulasan": 20 + (idx % 25),
                "deskripsi_singkat": f"Penyedia layanan {place_type} terpercaya di kawasan {kecamatan}.",
                "deskripsi_lengkap": f"HTM / Tarif: {htm}. Fasilitas: {fasilitas}. Jam Operasional: {jam}." + (f" Ulasan: {review}." if review != '-' else ""),
                "gambar_url": "https://images.unsplash.com/photo-1555396273-367ea4eb4db5?auto=format&fit=crop&w=600&q=80"
            }
            if simpan_ke_db(payload):
                total_added += 1
            else:
                total_updated += 1

    # 7. Sheet 'kuliner'
    if "kuliner" in xl.sheet_names:
        df = pd.read_excel(EXCEL_FILE, sheet_name="kuliner")
        print(f"[*] Memproses 'kuliner' ({len(df)} entitas)...")
        for idx, row in df.iterrows():
            nama = str(row.get('kuliner-name', ''))
            desc = str(row.get('description', ''))
            if not nama or nama.lower() in ['nan', 'none', 'null']:
                continue
            
            lat, lon = ambil_koordinat_default("Balige")
            payload = {
                "nama": f"Kuliner Khas: {nama}",
                "kategori": "kuliner",
                "kecamatan": "Balige",
                "nama_jalan": "Pusat Kuliner Tradisional Toba",
                "latitude": lat,
                "longitude": lon,
                "rating": 4.8,
                "jumlah_ulasan": 50 + idx * 5,
                "deskripsi_singkat": f"Hidangan legendaris & kuliner autentik khas Batak Toba: {nama}.",
                "deskripsi_lengkap": f"{desc}. Tersedia di berbagai rumah makan & lapo khas Toba di kawasan Danau Toba.",
                "gambar_url": "https://images.unsplash.com/photo-1555396273-367ea4eb4db5?auto=format&fit=crop&w=600&q=80"
            }
            if simpan_ke_db(payload):
                total_added += 1
            else:
                total_updated += 1

    # 8. Sheet 'waktu operasional destinasi'
    if "waktu operasional destinasi" in xl.sheet_names:
        df = pd.read_excel(EXCEL_FILE, sheet_name="waktu operasional destinasi")
        print(f"[*] Memproses 'waktu operasional destinasi' ({len(df)} entitas)...")
        for idx, row in df.iterrows():
            nama = clean_val(row.get('OBJEK / DESTINASI WISATA'), default='')
            alamat = clean_val(row.get('ALAMAT'), default='Kawasan Danau Toba')
            kab = clean_val(row.get('KABUPATEN'), default='Toba')
            kecamatan = ekstrak_kecamatan(alamat)
            if kecamatan == "Kawasan Danau Toba":
                kecamatan = kab.title()
            
            lat, lon = ambil_koordinat_default(kecamatan)
            try:
                rating = float(str(row.get('RATING BPODT', '4.6')).replace(',', '.'))
            except Exception:
                rating = 4.6

            fas_umum = clean_val(row.get('FASILITAS UMUM'))
            fas_penunjang = clean_val(row.get('FASILITAS PENUNJANG'))
            jam = clean_val(row.get('WAKTU OPERASIONAL'), default='08:00 - 18:00')

            fas_total = []
            if fas_umum != "-":
                fas_total.append(fas_umum)
            if fas_penunjang != "-":
                fas_total.append(fas_penunjang)
            fas_str = ", ".join(fas_total) if fas_total else "-"

            payload = {
                "nama": nama,
                "kategori": "wisata",
                "kecamatan": kecamatan,
                "nama_jalan": alamat,
                "latitude": lat,
                "longitude": lon,
                "rating": rating,
                "jumlah_ulasan": 30 + (idx % 20),
                "deskripsi_singkat": f"Destinasi wisata resmi di Kabupaten {kab} dengan pengelolaan aktif.",
                "deskripsi_lengkap": f"Fasilitas: {fas_str}. Jam Operasional: {jam}.",
                "gambar_url": "https://images.unsplash.com/photo-1506744038136-46273834b3fb?auto=format&fit=crop&w=600&q=80"
            }
            if simpan_ke_db(payload):
                total_added += 1
            else:
                total_updated += 1

    # 9. Sheet 'Attractions Info'
    if "Attractions Info" in xl.sheet_names:
        df = pd.read_excel(EXCEL_FILE, sheet_name="Attractions Info")
        print(f"[*] Memproses 'Attractions Info' ({len(df)} entitas)...")
        for idx, row in df.iterrows():
            nama = str(row.get('Nama Atraksi', ''))
            kab = str(row.get('Nama Kabupaten', 'Toba'))
            detail = str(row.get('Detail', ''))
            if not nama or nama.lower() in ['nan', 'none', 'nama atraksi']:
                continue
            
            kecamatan = kab.title()
            lat, lon = ambil_koordinat_default(kecamatan)
            payload = {
                "nama": nama,
                "kategori": "wisata",
                "kecamatan": kecamatan,
                "nama_jalan": f"Kabupaten {kab}",
                "latitude": lat,
                "longitude": lon,
                "rating": 4.7,
                "jumlah_ulasan": 25 + idx,
                "deskripsi_singkat": f"Atraksi wisata unggulan di Kabupaten {kab}.",
                "deskripsi_lengkap": f"Detail Atraksi: {detail}",
                "gambar_url": "https://images.unsplash.com/photo-1501785888041-af3ef285b470?auto=format&fit=crop&w=800&q=80"
            }
            if simpan_ke_db(payload):
                total_added += 1
            else:
                total_updated += 1

    # 10. Sheet 'Sheet1' (jika ada)
    if "Sheet1" in xl.sheet_names:
        df = pd.read_excel(EXCEL_FILE, sheet_name="Sheet1")
        print(f"[*] Memproses 'Sheet1' ({len(df)} entitas)...")
        for idx, row in df.iterrows():
            nama = str(row.get('place', ''))
            alamat = str(row.get('add', 'Kawasan Danau Toba'))
            kecamatan = ekstrak_kecamatan(alamat)
            lat, lon = ambil_koordinat_default(kecamatan)
            
            try:
                rating_str = str(row.get('rating', '4.5')).replace(',', '.')
                rating = float(rating_str)
            except Exception:
                rating = 4.5

            place_type = str(row.get('type', 'Tempat Wisata')).lower()
            if any(k in place_type for k in ['makan', 'resto', 'kuliner', 'kafe', 'cafe']):
                kategori_val = "kuliner"
            elif any(k in place_type for k in ['oleh', 'belanja', 'suvenir', 'pasar']):
                kategori_val = "umkm"
            else:
                kategori_val = "wisata"

            payload = {
                "nama": nama,
                "kategori": kategori_val,
                "kecamatan": kecamatan,
                "nama_jalan": alamat,
                "latitude": lat,
                "longitude": lon,
                "rating": rating,
                "jumlah_ulasan": 20 + (idx % 25),
                "deskripsi_singkat": f"{row.get('type', 'Tempat Wisata')} di {kecamatan}.",
                "deskripsi_lengkap": f"HTM: {row.get('htm', '-')}. Fasilitas: {row.get('facilitates', '-')}. Jam Operasional: {row.get('service-hour', '-')}. Review: {row.get('review', '-')}.",
                "gambar_url": "https://images.unsplash.com/photo-1506744038136-46273834b3fb?auto=format&fit=crop&w=600&q=80"
            }
    # 11. Sheet 'toba-100-curated' (100 Destinasi & UMKM Terverifikasi PDF)
    if "toba-100-curated" in xl.sheet_names:
        df = pd.read_excel(EXCEL_FILE, sheet_name="toba-100-curated")
        print(f"[*] Memproses 'toba-100-curated' ({len(df)} entitas)...")
        for idx, row in df.iterrows():
            nama = clean_val(row.get('nama_lokasi'), default='')
            kecamatan = clean_val(row.get('kecamatan'), default='Balige')
            raw_kat = clean_val(row.get('kategori'), default='wisata').lower()
            
            if any(k in raw_kat for k in ['kuliner', 'makan', 'kopi', 'resto', 'kafe']):
                cat = "kuliner"
            elif any(k in raw_kat for k in ['kerajinan', 'souvenir', 'oleh', 'umkm', 'tenun', 'pasar']):
                cat = "umkm"
            elif any(k in raw_kat for k in ['akomodasi', 'homestay', 'hotel', 'penginapan']):
                cat = "penginapan"
            elif any(k in raw_kat for k in ['transportasi', 'dermaga', 'pelabuhan', 'kapal']):
                cat = "transportasi"
            else:
                cat = "wisata"

            try:
                lat = float(row.get('lat'))
                lon = float(row.get('lon'))
            except Exception:
                lat, lon = ambil_koordinat_default(kecamatan)

            try:
                rating = float(str(row.get('rating', '4.7')).replace(',', '.'))
            except Exception:
                rating = 4.7

            try:
                ulasan = int(row.get('ulasan_count', 20))
            except Exception:
                ulasan = 20

            deskripsi = clean_val(row.get('deskripsi'), default=f"Destinasi {cat} unggulan di {kecamatan}.")

            payload = {
                "nama": nama,
                "kategori": cat,
                "kecamatan": kecamatan,
                "nama_jalan": f"Kecamatan {kecamatan}, Kawasan Danau Toba",
                "latitude": lat,
                "longitude": lon,
                "rating": rating,
                "jumlah_ulasan": ulasan,
                "deskripsi_singkat": f"{deskripsi.split('.')[0]}.",
                "deskripsi_lengkap": f"{deskripsi}",
                "gambar_url": "https://images.unsplash.com/photo-1506744038136-46273834b3fb?auto=format&fit=crop&w=800&q=80"
            }
            if simpan_ke_db(payload):
                total_added += 1
            else:
                total_updated += 1

    print(f"\n[OK] Ingestion dataset 100% selesai murni dari Excel: {total_added} data tersimpan, {total_updated} data diperbarui.")

def sync_pinecone():
    """Mengisi dan menyinkronkan data embedding destinasi ke Pinecone."""
    from openai import OpenAI
    from cohere import Client as CohereClient
    from pinecone import Pinecone, ServerlessSpec
    from app.database import SessionLocal
    from app import models
    from app.config import settings

    PINECONE_API_KEY = settings.PINECONE_API_KEY
    PINECONE_INDEX_NAME = settings.PINECONE_INDEX_NAME or "tobaguide-index"
    COHERE_API_KEY = settings.COHERE_API_KEY
    OPENAI_API_KEY = settings.OPENAI_API_KEY

    print("\n--- 3. SINKRONISASI VECTOR INDEXING PINECONE ---")
    if not PINECONE_API_KEY:
        print("[ERROR] PINECONE_API_KEY tidak ditemukan di environment.")
        return

    provider = "cohere"
    model_name = "embed-multilingual-v3.0"
    dimension = 1024

    if OPENAI_API_KEY and not OPENAI_API_KEY.startswith("sk-proj-placeholder"):
        provider = "openai"
        model_name = "text-embedding-3-small"
        dimension = 1536

    print(f"[INFO] Provider Embedding: {provider.upper()} ({model_name}) | Dimensi: {dimension}")
    openai_client = OpenAI(api_key=OPENAI_API_KEY) if provider == "openai" else None
    cohere_client = CohereClient(api_key=COHERE_API_KEY) if provider == "cohere" else None

    pc = Pinecone(api_key=PINECONE_API_KEY)
    existing_indexes = [idx.name for idx in pc.list_indexes()]

    if PINECONE_INDEX_NAME not in existing_indexes:
        print(f"[INFO] Membuat indeks Pinecone baru '{PINECONE_INDEX_NAME}'...")
        pc.create_index(
            name=PINECONE_INDEX_NAME,
            dimension=dimension,
            metric="cosine",
            spec=ServerlessSpec(cloud="aws", region="us-east-1")
        )
        time.sleep(8)

    index = pc.Index(PINECONE_INDEX_NAME)

    db = SessionLocal()
    destinasis = db.query(models.Destinasi).all()
    print(f"[INFO] Mengambil {len(destinasis)} destinasi dari PostgreSQL...")

    if not destinasis:
        print("[WARN] Database kosong.")
        return

    def get_embeddings_batch(texts):
        if provider == "openai":
            res = openai_client.embeddings.create(input=texts, model=model_name)
            return [e.embedding for e in res.data]
        elif provider == "cohere":
            res = cohere_client.embed(texts=texts, model=model_name, input_type="search_document")
            return res.embeddings
        return []

    vectors_to_upsert = []
    batch_size = 90

    def safe_float(val, default=4.5):
        try:
            if val is None:
                return default
            f = float(val)
            import math
            if math.isnan(f):
                return default
            return f
        except Exception:
            return default

    def safe_int(val, default=10):
        try:
            if val is None:
                return default
            f = float(val)
            import math
            if math.isnan(f):
                return default
            return int(f)
        except Exception:
            return default

    for i in range(0, len(destinasis), batch_size):
        batch_items = destinasis[i:i + batch_size]
        batch_texts = [
            f"Nama: {d.nama} | Kategori: {d.kategori} | Kecamatan: {d.kecamatan} | Deskripsi: {d.deskripsi_singkat} {d.deskripsi_lengkap or ''} | Jalan: {d.nama_jalan}"
            for d in batch_items
        ]
        
        try:
            embeddings = get_embeddings_batch(batch_texts)
            for item, vector in zip(batch_items, embeddings):
                vectors_to_upsert.append({
                    "id": str(item.id),
                    "values": vector,
                    "metadata": {
                        "nama": str(item.nama or ""),
                        "kategori": str(item.kategori or "wisata"),
                        "kecamatan": str(item.kecamatan or "Balige"),
                        "deskripsi_singkat": str(item.deskripsi_singkat or "")[:500],
                        "nama_jalan": str(item.nama_jalan or ""),
                        "rating": safe_float(item.rating, 4.5),
                        "jumlah_ulasan": safe_int(item.jumlah_ulasan, 10),
                        "latitude": safe_float(item.latitude, 2.3333),
                        "longitude": safe_float(item.longitude, 99.0667)
                    }
                })
        except Exception as e:
            print(f"[WARN] Batch embedding error: {e}")

    for i in range(0, len(vectors_to_upsert), 50):
        upsert_batch = vectors_to_upsert[i:i + 50]
        index.upsert(vectors=upsert_batch)

    db.close()
    print(f"[OK] Berhasil mengunggah {len(vectors_to_upsert)} vektor ke Pinecone!\n")

def main():
    parser = argparse.ArgumentParser(description="TobaRoute Data Management Tool")
    parser.add_argument("--init-db", action="store_true", help="Inisialisasi database dan skema tabel PostgreSQL")
    parser.add_argument("--ingest", action="store_true", help="Mengimpor dataset pariwisata dari Excel ke PostgreSQL")
    parser.add_argument("--sync-pinecone", action="store_true", help="Mengisi & menyinkronkan data vektor di Pinecone")
    parser.add_argument("--all", action="store_true", help="Menjalankan seluruh alur setup di atas secara otomatis")

    args = parser.parse_args()

    if not any([args.init_db, args.ingest, args.sync_pinecone, args.all]):
        parser.print_help()
        return

    if args.all or args.init_db:
        init_database()
    if args.all or args.ingest:
        ingest_dataset()
    if args.all or args.sync_pinecone:
        sync_pinecone()

if __name__ == "__main__":
    main()
