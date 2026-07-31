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
            "Parapat": (2.6620, 98.9350),
            "Berastagi": (3.1870, 98.5110),
            "Sidikalang": (2.7480, 98.3120),
            "Tarutung": (2.0250, 98.9730),
            "Doloksanggul": (2.2570, 98.7510)
        }
        base = koordinat_pusat.get(str(kecamatan).title(), (2.3300, 99.0600))
        return base[0] + random.uniform(-0.003, 0.003), base[1] + random.uniform(-0.003, 0.003)

    def simpan_ke_db(payload):
        nama_clean = str(payload['nama']).strip()
        if not nama_clean or nama_clean.lower() in ['nan', 'none', 'null', 'no', 'nama kabupaten', 'hotel']:
            return False
        if len(nama_clean) < 3:
            return False

        existing = db.query(models.Destinasi).filter(models.Destinasi.nama.ilike(nama_clean)).first()
        if existing:
            existing.kategori = payload['kategori']
            existing.kecamatan = payload['kecamatan']
            existing.nama_jalan = payload['nama_jalan']
            if payload['latitude'] and payload['longitude']:
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

    total_added = 0
    total_updated = 0

    # Ingestion Sheet Processors
    if "wisata-metadata" in xl.sheet_names:
        df = pd.read_excel(EXCEL_FILE, sheet_name="wisata-metadata")
        print(f"[1/5] Memproses 'wisata-metadata' ({len(df)} entitas)...")
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
                "kategori": "wisata",
                "kecamatan": kecamatan,
                "nama_jalan": alamat,
                "latitude": lat,
                "longitude": lon,
                "rating": rating,
                "jumlah_ulasan": 25 + (idx % 40),
                "deskripsi_singkat": f"Objek Wisata {row.get('place-type', 'Populer')} di kawasan {kecamatan}.",
                "deskripsi_lengkap": f"Fasilitas: {row.get('Fasilitas', '-')}. Estimasi Biaya: {row.get('price-per-head', '-')}. Jam Operasional: {row.get('opening-hours', '08:00 - 18:00')}.",
                "gambar_url": "https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=600&q=80"
            }
            if simpan_ke_db(payload):
                total_added += 1
            else:
                total_updated += 1

    db.close()
    print(f"[OK] Ingestion dataset selesai: {total_added} ditambahkan, {total_updated} diperbarui.\n")

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
                        "rating": float(item.rating or 4.5),
                        "jumlah_ulasan": int(item.jumlah_ulasan or 10),
                        "latitude": float(item.latitude or 2.3333),
                        "longitude": float(item.longitude or 99.0667)
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
