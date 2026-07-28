from sqlalchemy.orm import Session
from . import models, schemas
import math

# Menampilkan semua destinasi (Bisa difilter berdasarkan kecamatan untuk kebutuhan User/Admin)
def get_destinasi(db: Session, kecamatan: str = None, limit: int = 10):
    query = db.query(models.Destinasi)
    if kecamatan:
        query = query.filter(models.Destinasi.kecamatan.ilike(kecamatan))
    return query.order_by(models.Destinasi.rating.desc()).limit(limit).all()

# Fungsi untuk Admin menambah destinasi baru
def create_destinasi(db: Session, destinasi: schemas.DestinasiCreate):
    db_destinasi = models.Destinasi(**destinasi.model_dump())
    db.add(db_destinasi)
    db.commit()
    db.refresh(db_destinasi)
    
    try:
        sync_single_destinasi_vector(db_destinasi)
    except Exception as e:
        print(f"[Vector Sync] Error vector upsert for new item {db_destinasi.id}: {e}")
        
    return db_destinasi

# Fungsi untuk Admin mengedit data destinasi yang sudah ada
def update_destinasi(db: Session, destinasi_id: int, update_data: schemas.DestinasiUpdate):
    db_destinasi = db.query(models.Destinasi).filter(models.Destinasi.id == destinasi_id).first()
    if not db_destinasi:
        return None
        
    data_dict = update_data.model_dump(exclude_unset=True)
    for key, value in data_dict.items():
        if value is not None:
            setattr(db_destinasi, key, value)
            
    db.commit()
    db.refresh(db_destinasi)
    
    try:
        sync_single_destinasi_vector(db_destinasi)
    except Exception as e:
        print(f"[Vector Sync Error] Gagal update vektor Pinecone untuk ID {destinasi_id}: {e}")
        
    return db_destinasi

# Fungsi untuk Admin menghapus destinasi dari database
def delete_destinasi(db: Session, destinasi_id: int):
    db_destinasi = db.query(models.Destinasi).filter(models.Destinasi.id == destinasi_id).first()
    if db_destinasi:
        db.delete(db_destinasi)
        db.commit()
        try:
            idx = get_pinecone_index()
            if idx:
                idx.delete(ids=[str(destinasi_id)])
        except Exception as e:
            print(f"[Vector Delete Error]: {e}")
        return True
    return False

# Fungsi bantuan untuk menghitung jarak koordinat (Haversine Formula) jika diperlukan di lokal
def hitung_jarak(lat1, lon1, lat2, lon2):
    rad = math.pi / 180
    dlat = (lat2 - lat1) * rad
    dlon = (lon2 - lon1) * rad
    a = math.sin(dlat/2)**2 + math.cos(lat1*rad) * math.cos(lat2*rad) * math.sin(dlon/2)**2
    c = 2 * math.atan2(math.sqrt(a), math.sqrt(1-a))
    return 6371 * c # Jarak dalam Kilometer

def get_fair_route(db: Session, kecamatan: str, limit_utama: int = 3):
    # 1. Ambil destinasi wisata utama dengan rating tertinggi di kecamatan tersebut
    destinasi_utama = db.query(models.Destinasi).\
        filter(models.Destinasi.kecamatan.ilike(kecamatan)).\
        filter(models.Destinasi.kategori == 'wisata').\
        order_by(models.Destinasi.rating.desc()).\
        limit(limit_utama).all()
    
    # 2. Ambil pendukung UMKM/Kuliner lokal yang terkena bias (ulasan sedikit) sebagai bentuk keadilan data
    # Kriteria: ulasan di bawah 15 tapi rating di atas 4.0
    umkm_sekitar = db.query(models.Destinasi).\
        filter(models.Destinasi.kecamatan.ilike(kecamatan)).\
        filter(models.Destinasi.kategori.in_(['umkm', 'kuliner'])).\
        filter(models.Destinasi.jumlah_ulasan < 15).\
        filter(models.Destinasi.rating >= 4.0).\
        order_by(models.Destinasi.rating.desc()).\
        limit(4).all()
        
    return {
        "destinasi_utama": destinasi_utama,
        "rekomendasi_umkm_sekitar": umkm_sekitar
    }

# ==============================================================================
# INTEGRASI RAG & VECTOR DATABASE (PINECONE)
# ==============================================================================
from pinecone import Pinecone  # type: ignore
from openai import OpenAI  # type: ignore
from app.config import settings

def get_pinecone_index():
    if settings.PINECONE_API_KEY and settings.PINECONE_INDEX_NAME:
        try:
            pc = Pinecone(api_key=settings.PINECONE_API_KEY)
            return pc.Index(settings.PINECONE_INDEX_NAME)
        except Exception as e:
            print(f"[RAG] Gagal inisialisasi Pinecone: {e}")
    return None

def get_cohere_embedding(query_user: str):
    try:
        # pyrefly: ignore [missing-import]
        from cohere import Client
        co = Client(api_key=settings.COHERE_API_KEY)
        res = co.embed(texts=[query_user], model="embed-multilingual-v3.0", input_type="search_query")
        return res.embeddings[0]
    except Exception as e:
        print(f"[RAG] Cohere Embedding failed: {e}")
        return [0.1] * 1024 # Dummy fallback

def sync_single_destinasi_vector(d):
    index = get_pinecone_index()
    if not index:
        return
    semantik_text = (
        f"Nama: {d.nama} | Kategori: {d.kategori} | Kecamatan: {d.kecamatan} | "
        f"Deskripsi: {d.deskripsi_singkat} {d.deskripsi_lengkap or ''} | Jalan: {d.nama_jalan or ''}"
    )
    vec = get_cohere_embedding(semantik_text)
    index.upsert(vectors=[{
        "id": str(d.id),
        "values": vec,
        "metadata": {
            "nama": d.nama,
            "kategori": d.kategori,
            "kecamatan": d.kecamatan,
            "deskripsi_singkat": d.deskripsi_singkat,
            "nama_jalan": d.nama_jalan or "",
            "rating": float(d.rating or 4.8),
            "jumlah_ulasan": int(d.jumlah_ulasan or 10),
            "latitude": float(d.latitude or 2.33),
            "longitude": float(d.longitude or 99.06)
        }
    }])

def sync_all_vectors(db: Session):
    index = get_pinecone_index()
    if not index:
        return {"status": "error", "message": "Pinecone API Key tidak terkonfigurasi."}
    
    all_dest = db.query(models.Destinasi).all()
    count = 0
    for d in all_dest:
        try:
            sync_single_destinasi_vector(d)
            count += 1
        except Exception as e:
            print(f"[Sync Error] ID {d.id}: {e}")
            
    return {"status": "success", "synced_count": count, "total": len(all_dest)}

def cari_destinasi_semantik(query_user: str, top_k: int = 20):
    query_vector = None
    
    # Pilih model embedding yang tersedia (OpenAI atau Cohere fallback)
    if settings.OPENAI_API_KEY and not settings.OPENAI_API_KEY.startswith("sk-proj-placeholder"):
        try:
            client = OpenAI(api_key=settings.OPENAI_API_KEY)
            response = client.embeddings.create(
                input=[query_user],
                model="text-embedding-3-small"
            )
            query_vector = response.data[0].embedding
        except Exception as e:
            print(f"[RAG] OpenAI Embedding failed: {e}. Falling back to Cohere...")
            query_vector = get_cohere_embedding(query_user)
    else:
        query_vector = get_cohere_embedding(query_user)

    # Lakukan pencarian di Pinecone
    index = get_pinecone_index()
    if index and query_vector:
        try:
            results = index.query(vector=query_vector, top_k=top_k, include_metadata=True)
            return [match.id for match in results.matches]
        except Exception as e:
            print(f"[RAG] Pinecone Query failed: {e}")
    return []

def get_fair_route_with_rag(db: Session, query: str, kecamatan: str = None, limit_utama: int = 3):
    # 1. Cari ID destinasi yang paling cocok secara makna lewat Pinecone
    matched_ids = cari_destinasi_semantik(query)
    
    # 2. Ambil destinasi utama dari PostgreSQL (mendukung wisata, kuliner, maupun UMKM yang cocok secara semantik)
    query_base = db.query(models.Destinasi)
    if kecamatan:
        query_base = query_base.filter(models.Destinasi.kecamatan.ilike(kecamatan))
        
    destinasi_utama = []
    if matched_ids:
        int_ids = []
        for mid in matched_ids:
            try:
                int_ids.append(int(mid))
            except ValueError:
                pass
        
        if int_ids:
            fetched = query_base.filter(models.Destinasi.id.in_(int_ids)).all()
            id_to_dest = {d.id: d for d in fetched}
            # Pertahankan urutan skor kemiripan dari Pinecone
            destinasi_utama = [id_to_dest[id_] for id_ in int_ids if id_ in id_to_dest][:limit_utama]
    
    if not destinasi_utama:
        # Fallback pencarian terpopuler biasa
        destinasi_utama = query_base.order_by(models.Destinasi.rating.desc()).limit(limit_utama).all()

    # 3. Deteksi Intensi Pencarian (Kuliner / Makanan vs Kerajinan / Wisata)
    query_lower = query.lower()
    food_keywords = ['makanan', 'kuliner', 'makan', 'enak', 'laper', 'lapar', 'resto', 'rumah makan', 'warung', 'menu', 'lapo', 'naniarsik', 'arsik', 'mie gomak', 'naniura', 'saksang', 'bpk', 'andaliman', 'kopi', 'kue', 'ombus', 'sihobuk', 'minum']
    is_food_query = any(k in query_lower for k in food_keywords)

    target_kecamatans = list(set([d.kecamatan for d in destinasi_utama]))
    if not target_kecamatans and kecamatan:
        target_kecamatans = [kecamatan]
        
    # Jika wisatawan menanyakan makanan/kuliner, filter rekomendasi pendukung ke 'kuliner' saja!
    allowed_categories = ['kuliner'] if is_food_query else ['umkm', 'kuliner']
    
    umkm_query = db.query(models.Destinasi).filter(models.Destinasi.kategori.in_(allowed_categories))
    if target_kecamatans:
        umkm_query = umkm_query.filter(models.Destinasi.kecamatan.in_(target_kecamatans))
        
    utama_ids = set([d.id for d in destinasi_utama])
    fetched_umkm = umkm_query.filter(models.Destinasi.rating >= 4.0).order_by(models.Destinasi.rating.desc()).all()
    umkm_sekitar = [u for u in fetched_umkm if u.id not in utama_ids][:4]

    # Fallback jika di kecamatan spesifik belum cukup: ambil tempat kuliner/UMKM terbaik dari seluruh Toba
    if len(umkm_sekitar) < 4:
        extra_umkm = db.query(models.Destinasi).filter(models.Destinasi.kategori.in_(allowed_categories)).\
            order_by(models.Destinasi.rating.desc()).all()
        
        seen_ids = set([u.id for u in umkm_sekitar] + list(utama_ids))
        for extra in extra_umkm:
            if extra.id not in seen_ids:
                umkm_sekitar.append(extra)
                seen_ids.add(extra.id)
            if len(umkm_sekitar) >= 4:
                break
        
    return {
        "destinasi_utama": destinasi_utama,
        "rekomendasi_umkm_sekitar": umkm_sekitar
    }
