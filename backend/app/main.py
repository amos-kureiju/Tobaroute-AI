from fastapi import FastAPI, Depends, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy.orm import Session
from typing import List, Optional
from .database import engine, Base, get_db
from . import crud, schemas, models
from .ai_bot import generate_tourist_response, chat_with_bot, generate_destination_ai_insight

# Otomatis membuat tabel di PostgreSQL saat aplikasi backend dinyalakan
Base.metadata.create_all(bind=engine)

app = FastAPI(title="TobaRoute AI: Backend Keadilan Data")

# CORS middleware configuration
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

def format_destinasi_response(d):
    plus = schemas.generate_plus_code(d.latitude, d.longitude)
    plus_short = f"{plus[:4]}+{plus[4:8]}" if len(plus) >= 8 else plus
    full_addr = f"{plus_short}, {d.nama_jalan}"
    return {
        "id": d.id,
        "nama": d.nama,
        "kategori": d.kategori,
        "kecamatan": d.kecamatan,
        "gambar_url": d.gambar_url,
        "deskripsi_singkat": d.deskripsi_singkat,
        "deskripsi_lengkap": d.deskripsi_lengkap,
        "nama_jalan": d.nama_jalan,
        "latitude": d.latitude,
        "longitude": d.longitude,
        "rating": d.rating,
        "jumlah_ulasan": d.jumlah_ulasan,
        "plus_code": plus_short,
        "full_address": full_addr
    }

# Endpoint Baru: Mengambil rekomendasi rute yang adil bagi UMKM berbasis RAG Semantik
@app.get("/api/route/fair-recommendation", response_model=schemas.TobaRouteResponse)
def get_fair_travel_route(
    query: str, 
    kecamatan: Optional[str] = None, 
    offset: int = 0,
    user_lat: Optional[float] = None,
    user_lon: Optional[float] = None,
    db: Session = Depends(get_db)
):
    print(f"\n[DIAGNOSTIC] Endpoint /api/route/fair-recommendation dipanggil dengan query: {query}, kecamatan: {kecamatan}, offset: {offset}, user_lat: {user_lat}, user_lon: {user_lon}")
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
    
    # 2. Hasil pencarian AI berbasis RAG
    try:
        ai_response = generate_tourist_response(user_query=query, fair_route_data=route_data)
    except Exception as e:
        print(f"[AI Error] Gagal menghubungi Gemini API: {e}")
        ai_response = "[INFO] Asisten AI TobaRoute sedang sibuk. Menampilkan rekomendasi destinasi terdekat langsung dari database."
    
    dest_utama_formatted = [format_destinasi_response(d) for d in route_data["destinasi_utama"]]
    umkm_formatted = [format_destinasi_response(d) for d in route_data["rekomendasi_umkm_sekitar"]]

    return {
        "destinasi_utama": dest_utama_formatted,
        "rekomendasi_umkm_sekitar": umkm_formatted,
        "ai_response": ai_response
    }

# Endpoint Baru: Chatbot Interaktif
@app.post("/api/chat")
def interactive_chat(request: schemas.ChatbotRequest):
    history_dicts = [{"role": msg.role, "text": msg.text} for msg in request.history]
    ai_reply = chat_with_bot(request.message, history_dicts)
    return {"reply": ai_reply}

# Endpoint untuk User & Admin: Mengambil daftar destinasi pariwisata
@app.get("/api/destinasi", response_model=List[schemas.DestinasiResponse])
def read_destinasi(kecamatan: str = None, limit: int = 1000, db: Session = Depends(get_db)):
    destinasi = crud.get_destinasi(db, kecamatan=kecamatan, limit=limit)
    return [format_destinasi_response(d) for d in destinasi]

# Endpoint untuk User: Mengambil Wawasan Otentik & Tips AI untuk Kartu Destinasi / UMKM
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
        nama_jalan=d.nama_jalan or ""
    )
    return insight

# Endpoint untuk Admin: Menambahkan destinasi baru ke database
@app.post("/api/admin/destinasi", response_model=schemas.DestinasiResponse)
def add_new_destinasi(destinasi: schemas.DestinasiCreate, db: Session = Depends(get_db)):
    return crud.create_destinasi(db=db, destinasi=destinasi)

# Endpoint untuk Admin: Mengedit destinasi yang sudah ada di database & Pinecone
@app.put("/api/admin/destinasi/{destinasi_id}", response_model=schemas.DestinasiResponse)
def update_existing_destinasi(destinasi_id: int, destinasi: schemas.DestinasiUpdate, db: Session = Depends(get_db)):
    updated = crud.update_destinasi(db=db, destinasi_id=destinasi_id, update_data=destinasi)
    if not updated:
        raise HTTPException(status_code=404, detail="Destinasi tidak ditemukan")
    return updated

# Endpoint untuk Admin: Menghapus destinasi dari database
@app.delete("/api/admin/destinasi/{destinasi_id}")
def remove_destinasi(destinasi_id: int, db: Session = Depends(get_db)):
    success = crud.delete_destinasi(db=db, destinasi_id=destinasi_id)
    if not success:
        raise HTTPException(status_code=404, detail="Destinasi tidak ditemukan")
    return {"message": f"Destinasi ID {destinasi_id} berhasil dihapus"}

# Endpoint untuk Admin: Memicu sinkronisasi manual seluruh data ke database vektor Pinecone
@app.post("/api/admin/sync-pinecone")
def sync_vector_database(db: Session = Depends(get_db)):
    result = crud.sync_all_vectors(db=db)
    return result

# Endpoint untuk Admin: Mengambil ringkasan metrik sistem dan benchmark RAG
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

