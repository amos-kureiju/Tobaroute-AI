# ====================================================================================================
# FILE: backend/app/main.py
# TUJUAN:
# File utama (Entry Point) server API Backend TobaRoute AI berbasis FastAPI.
# Menghubungkan seluruh modul: database PostgreSQL, pencarian vektor Pinecone (RAG),
# model LLM Gemini, dan menyediakan REST API endpoints untuk frontend pengguna & admin.
# ====================================================================================================

from fastapi import FastAPI, Depends, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy.orm import Session
from typing import List, Optional
from .database import engine, Base, get_db, SessionLocal
from . import crud, schemas, models
from .ai_bot import generate_tourist_response, chat_with_bot, generate_destination_ai_insight
from .transport_helper import get_transport_guide

# Otomatis membuat tabel-tabel di database saat server backend pertama kali dijalankan
Base.metadata.create_all(bind=engine)

# Inisialisasi aplikasi FastAPI
app = FastAPI(
    title="TobaRoute AI: API Keadilan Pariwisata & Rekomendasi Cerdas Danau Toba",
    description="Sistem rekomendasi rute presisi dan keterpaparan UMKM kawasan Danau Toba",
    version="2.0.0"
)

# Konfigurasi CORS (Cross-Origin Resource Sharing) agar frontend Vite React dapat mengakses API
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.on_event("startup")
def auto_seed_database():
    """
    Otomatis mengisi database dengan dataset 510 destinasi & UMKM jika tabel masih kosong.
    Sangat krusial untuk initial deployment di cloud (Render, Railway, dll).
    """
    import json
    from pathlib import Path
    db = SessionLocal()
    try:
        count = db.query(models.Destinasi).count()
        if count == 0:
            dataset_path = Path(__file__).resolve().parent.parent / "dataset" / "toba_491_dataset.json"
            if dataset_path.exists():
                with open(dataset_path, "r", encoding="utf-8") as f:
                    items = json.load(f)
                new_objs = []
                for item in items:
                    obj = models.Destinasi(
                        nama=item.get("nama", ""),
                        kategori=item.get("kategori", "wisata"),
                        kecamatan=item.get("kecamatan", ""),
                        gambar_url=item.get("gambar_url", ""),
                        deskripsi_singkat=item.get("deskripsi_singkat", ""),
                        deskripsi_lengkap=item.get("deskripsi_lengkap", ""),
                        nama_jalan=item.get("nama_jalan", ""),
                        latitude=float(item.get("latitude", 0.0)),
                        longitude=float(item.get("longitude", 0.0)),
                        rating=float(item.get("rating", 4.5)),
                        jumlah_ulasan=int(item.get("jumlah_ulasan", 0))
                    )
                    new_objs.append(obj)
                db.bulk_save_objects(new_objs)
                db.commit()
                print(f"[STARTUP] Sukses melakukan auto-seeding {len(new_objs)} destinasi & UMKM!")
    except Exception as e:
        print(f"[STARTUP ERROR] Gagal melakukan auto-seeding database: {e}")
        db.rollback()
    finally:
        db.close()

# ====================================================================================================
# HELPER: format_destinasi_response
# TUJUAN: Menyeragamkan format objek destinasi sebelum dikirimkan ke frontend (termasuk Plus Code & Transportasi).
# ====================================================================================================
import math

def clean_float(val, default=0.0):
    if val is None:
        return default
    try:
        f = float(val)
        if math.isnan(f) or math.isinf(f):
            return default
        return f
    except Exception:
        return default

def clean_str(val, default=""):
    if val is None:
        return default
    s = str(val).strip()
    if s.lower() in ["nan", "none", "null"]:
        return default
    return s

def format_destinasi_response(d):
    lat = clean_float(getattr(d, 'latitude', None), 2.3387)
    lon = clean_float(getattr(d, 'longitude', None), 99.0625)
    rating = clean_float(getattr(d, 'rating', None), 4.7)
    
    raw_reviews = getattr(d, 'jumlah_ulasan', 0)
    reviews = int(clean_float(raw_reviews, 15))

    nama = clean_str(getattr(d, 'nama', 'Destinasi'))
    kategori = clean_str(getattr(d, 'kategori', 'wisata'))
    kecamatan = clean_str(getattr(d, 'kecamatan', 'Toba'))
    nama_jalan = clean_str(getattr(d, 'nama_jalan', ''))
    
    plus = schemas.generate_plus_code(lat, lon)
    plus_short = f"{plus[:4]}+{plus[4:8]}" if len(plus) >= 8 else plus
    full_addr = f"{plus_short}, {nama_jalan}" if nama_jalan else plus_short

    # Hitung panduan akses transportasi lengkap
    transport_guide = get_transport_guide(
        nama=nama,
        kecamatan=kecamatan,
        kategori=kategori,
        latitude=lat,
        longitude=lon,
        nama_jalan=nama_jalan
    )

    return {
        "id": int(getattr(d, 'id', 0)),
        "nama": nama,
        "kategori": kategori,
        "kecamatan": kecamatan,
        "gambar_url": getattr(d, 'gambar_url', None) or None,
        "deskripsi_singkat": clean_str(getattr(d, 'deskripsi_singkat', 'Destinasi unggulan kawasan Danau Toba.')),
        "deskripsi_lengkap": clean_str(getattr(d, 'deskripsi_lengkap', '')),
        "nama_jalan": nama_jalan,
        "latitude": lat,
        "longitude": lon,
        "rating": rating,
        "jumlah_ulasan": reviews,
        "plus_code": plus_short,
        "full_address": full_addr,
        "akses_transportasi": transport_guide
    }

# ====================================================================================================
# ENDPOINT: GET /api/route/fair-recommendation
# TUJUAN:
# Endpoint utama untuk menghasilkan rekomendasi rute perjalanan yang adil bagi UMKM (Fairness Algorithm)
# Menggunakan Pinecone Vector Search (RAG) + Google Gemini LLM + Titik Koordinat GPS Wisatawan.
# ====================================================================================================
@app.get("/api/route/fair-recommendation", response_model=schemas.TobaRouteResponse)
def get_fair_travel_route(
    query: str, 
    kecamatan: Optional[str] = None, 
    offset: int = 0,
    user_lat: Optional[float] = None,
    user_lon: Optional[float] = None,
    db: Session = Depends(get_db)
):
    print(f"\n[API] /api/route/fair-recommendation dipanggil: query='{query}', kec='{kecamatan}', offset={offset}")
    if not query:
        raise HTTPException(status_code=400, detail="Parameter query (keinginan wisata) harus diisi")
    
    # 1. Ambil data rute terstruktur (destinasi utama & UMKM sekitar) dengan rotasi offset & lokasi user GPS
    route_data = crud.get_fair_route_with_rag(
        db, 
        query=query, 
        kecamatan=kecamatan, 
        offset=offset,
        user_lat=user_lat,
        user_lon=user_lon
    )
    
    # 2. Hasilkan narasi kurasi perjalanan menggunakan LLM Gemini (RAG)
    try:
        ai_response = generate_tourist_response(user_query=query, fair_route_data=route_data)
    except Exception as e:
        print(f"[AI Error] Gagal menghubungi Gemini API: {e}")
        ai_response = "Horas! Asisten AI TobaRoute sedang sibuk. Menampilkan rekomendasi destinasi terdekat langsung dari database."
    
    dest_utama_formatted = [format_destinasi_response(d) for d in route_data["destinasi_utama"]]
    umkm_formatted = [format_destinasi_response(d) for d in route_data["rekomendasi_umkm_sekitar"]]

    return {
        "destinasi_utama": dest_utama_formatted,
        "rekomendasi_umkm_sekitar": umkm_formatted,
        "ai_response": ai_response
    }

# ====================================================================================================
# ENDPOINT: POST /api/chat
# TUJUAN:
# Endpoint untuk chatbot pemandu wisata interaktif real-time dengan riwayat percakapan.
# ====================================================================================================
@app.post("/api/chat")
def interactive_chat(request: schemas.ChatbotRequest, db: Session = Depends(get_db)):
    history_dicts = [{"role": msg.role, "text": msg.text} for msg in request.history]
    bot_result = chat_with_bot(request.message, history_dicts, db=db)
    
    if isinstance(bot_result, dict):
        reply_text = bot_result.get("reply", "")
        raw_places = bot_result.get("recommended_places", [])
        formatted_places = [format_destinasi_response(p) for p in raw_places] if raw_places else []
        target_kec = bot_result.get("target_kecamatan")
        return {
            "reply": reply_text,
            "recommended_places": formatted_places,
            "target_kecamatan": target_kec
        }
    else:
        return {"reply": str(bot_result), "recommended_places": [], "target_kecamatan": None}

# ====================================================================================================
# ENDPOINT: GET /api/destinasi
# TUJUAN:
# Mengambil seluruh daftar destinasi & UMKM dari database PostgreSQL (bisa difilter per kecamatan).
# ====================================================================================================
@app.get("/api/destinasi", response_model=List[schemas.DestinasiResponse])
def read_destinasi(kecamatan: str = None, limit: int = 1000, db: Session = Depends(get_db)):
    destinasi = crud.get_destinasi(db, kecamatan=kecamatan, limit=limit)
    return [format_destinasi_response(d) for d in destinasi]

# ====================================================================================================
# ENDPOINT: GET /api/destinasi/{destinasi_id}/ai-insights
# TUJUAN:
# Menghasilkan wawasan budaya, tips wisatawan, dan keunikan produk untuk kartu destinasi/UMKM.
# ====================================================================================================
@app.get("/api/destinasi/{destinasi_id}/ai-insights")
def get_destinasi_ai_insight(destinasi_id: int, db: Session = Depends(get_db)):
    d = db.query(models.Destinasi).filter(models.Destinasi.id == destinasi_id).first()
    if not d:
        raise HTTPException(status_code=404, detail="Destinasi tidak ditemukan")
    
    insight = generate_destination_ai_insight(
        nama=d.nama,
        kecamatan=d.kecamatan,
        kategori=d.kategori,
        deskripsi_singkat=d.deskripsi_singkat,
        nama_jalan=d.nama_jalan or "",
        latitude=getattr(d, 'latitude', 2.3387),
        longitude=getattr(d, 'longitude', 99.0625)
    )
    return insight

# ====================================================================================================
# ENDPOINT: POST /api/admin/destinasi
# TUJUAN:
# Menambahkan entitas destinasi baru ke database PostgreSQL dan otomatis membuat vektor di Pinecone.
# ====================================================================================================
@app.post("/api/admin/destinasi", response_model=schemas.DestinasiResponse)
def add_new_destinasi(destinasi: schemas.DestinasiCreate, db: Session = Depends(get_db)):
    return crud.create_destinasi(db=db, destinasi=destinasi)

# ====================================================================================================
# ENDPOINT: PUT /api/admin/destinasi/{destinasi_id}
# TUJUAN:
# Memperbarui data destinasi yang sudah ada di database dan menyinkronkan vektornya di Pinecone.
# ====================================================================================================
@app.put("/api/admin/destinasi/{destinasi_id}", response_model=schemas.DestinasiResponse)
def update_existing_destinasi(destinasi_id: int, destinasi: schemas.DestinasiUpdate, db: Session = Depends(get_db)):
    updated = crud.update_destinasi(db=db, destinasi_id=destinasi_id, update_data=destinasi)
    if not updated:
        raise HTTPException(status_code=404, detail="Destinasi tidak ditemukan")
    return updated

# ====================================================================================================
# ENDPOINT: DELETE /api/admin/destinasi/{destinasi_id}
# TUJUAN:
# Menghapus data destinasi dari database PostgreSQL dan menghapus vektornya dari Pinecone.
# ====================================================================================================
@app.delete("/api/admin/destinasi/{destinasi_id}")
def remove_destinasi(destinasi_id: int, db: Session = Depends(get_db)):
    success = crud.delete_destinasi(db=db, destinasi_id=destinasi_id)
    if not success:
        raise HTTPException(status_code=404, detail="Destinasi tidak ditemukan")
    return {"message": f"Destinasi ID {destinasi_id} berhasil dihapus"}

# ====================================================================================================
# ENDPOINT: POST /api/admin/sync-pinecone
# TUJUAN:
# Memicu sinkronisasi manual seluruh data dari PostgreSQL ke database vektor Pinecone (1024-dim).
# ====================================================================================================
@app.post("/api/admin/sync-pinecone")
def sync_vector_database(db: Session = Depends(get_db)):
    result = crud.sync_all_vectors(db=db)
    return result

# ====================================================================================================
# ENDPOINT: GET /api/admin/metrics
# TUJUAN:
# Mengambil ringkasan metrik statistik real-time untuk dashboard administrator (rasio keadilan UMKM, dll).
# ====================================================================================================
@app.get("/api/admin/metrics")
def get_system_metrics(db: Session = Depends(get_db)):
    all_dest = db.query(models.Destinasi).all()
    total = len(all_dest)
    
    wisata = sum(1 for d in all_dest if "wisata" in (d.kategori or "").lower())
    kuliner = sum(1 for d in all_dest if any(k in (d.kategori or "").lower() for k in ["kuliner", "makan", "resto", "kafe", "kopi"]))
    umkm = sum(1 for d in all_dest if any(k in (d.kategori or "").lower() for k in ["umkm", "kerajinan", "oleh", "souvenir", "tenun"]))
    penginapan = sum(1 for d in all_dest if any(k in (d.kategori or "").lower() for k in ["penginapan", "hotel", "homestay"]))
    transportasi = sum(1 for d in all_dest if any(k in (d.kategori or "").lower() for k in ["transportasi", "dermaga", "pelabuhan", "kapal"]))
    
    fairness_count = kuliner + umkm
    fairness_pct = round((fairness_count / total * 100), 2) if total > 0 else 0.0

    return {
        "total_destinasi": total,
        "wisata_count": wisata,
        "kuliner_count": kuliner,
        "umkm_count": umkm,
        "penginapan_count": penginapan,
        "transportasi_count": transportasi,
        "fairness_count": fairness_count,
        "fairness_percentage": fairness_pct,
        "vector_dimensions": 1024,
        "embedding_model": "cohere-embed-multilingual-v3.0",
        "llm_model": "gemini-3.1-flash-lite"
    }
