from sqlalchemy.orm import Session
from . import models, schemas
import math

# Menampilkan semua destinasi (Bisa difilter berdasarkan kecamatan untuk kebutuhan User/Admin)
def get_destinasi(db: Session, kecamatan: str = None, limit: int = 1000):
    query = db.query(models.Destinasi)
    if kecamatan:
        query = query.filter(models.Destinasi.kecamatan.ilike(kecamatan))
    return query.order_by(models.Destinasi.id.desc()).limit(limit).all()

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

import math

def haversine_km(lat1, lon1, lat2, lon2):
    if lat1 is None or lon1 is None or lat2 is None or lon2 is None:
        return 999999.0
    try:
        lat1, lon1, lat2, lon2 = float(lat1), float(lon1), float(lat2), float(lon2)
        R = 6371.0  # radius Bumi dalam kilometer
        dlat = math.radians(lat2 - lat1)
        dlon = math.radians(lon2 - lon1)
        a = math.sin(dlat / 2)**2 + math.cos(math.radians(lat1)) * math.cos(math.radians(lat2)) * math.sin(dlon / 2)**2
        c = 2 * math.atan2(math.sqrt(a), math.sqrt(1 - a))
        return R * c
    except Exception:
        return 999999.0

KNOWN_KECAMATANS = [
    "ajibata", "baktiraja", "balige", "berastagi", "doloksanggul", 
    "girsang sipangan bolon", "harian", "laguboti", "lumban julu", 
    "muara", "onan runggu", "pangururan", "parapat", "porsea", 
    "ronggur nihuta", "salak", "sianjur mulamula", "sidikalang", 
    "silaen", "silahisabungan", "simanindo", "tampahan", "tarutung", "toba",
    "sigumpar", "habinsaran", "parmaksian", "siantar narumonda", "uluan", "bonatua lunasi", "borbor"
]

# Matriks Ketetanggaan Geografis Danau Toba (Radius Maksimal 2 Kecamatan / ~20 KM)
KECAMATAN_NEIGHBORS_2_HOPS = {
    "Laguboti": ["Laguboti", "Sigumpar", "Balige", "Silaen", "Porsea", "Tampahan", "Parmaksian", "Siantar Narumonda"],
    "Balige": ["Balige", "Laguboti", "Tampahan", "Sigumpar", "Silaen", "Muara", "Porsea", "Habinsaran"],
    "Sigumpar": ["Sigumpar", "Laguboti", "Silaen", "Porsea", "Balige", "Parmaksian", "Siantar Narumonda"],
    "Porsea": ["Porsea", "Sigumpar", "Laguboti", "Parmaksian", "Siantar Narumonda", "Uluan", "Bonatua Lunasi", "Lumban Julu", "Balige"],
    "Silaen": ["Silaen", "Laguboti", "Sigumpar", "Balige", "Porsea", "Habinsaran", "Borbor"],
    "Tampahan": ["Tampahan", "Balige", "Laguboti", "Muara", "Siborongborong", "Baktiraja"],
    "Lumban Julu": ["Lumban Julu", "Porsea", "Ajibata", "Uluan", "Bonatua Lunasi", "Girsang Sipangan Bolon", "Parapat"],
    "Ajibata": ["Ajibata", "Lumban Julu", "Girsang Sipangan Bolon", "Parapat", "Simanindo", "Porsea"],
    "Parapat": ["Parapat", "Girsang Sipangan Bolon", "Ajibata", "Lumban Julu", "Simanindo", "Haranggaol Horison"],
    "Girsang Sipangan Bolon": ["Girsang Sipangan Bolon", "Parapat", "Ajibata", "Lumban Julu", "Simanindo"],
    "Simanindo": ["Simanindo", "Pangururan", "Ronggur Nihuta", "Onan Runggu", "Ajibata", "Parapat", "Haranggaol Horison"],
    "Pangururan": ["Pangururan", "Simanindo", "Ronggur Nihuta", "Palipi", "Sianjur Mulamula", "Harian", "Sitio-tio"],
    "Sianjur Mulamula": ["Sianjur Mulamula", "Pangururan", "Harian", "Baktiraja", "Pollung", "Simanindo"],
    "Harian": ["Harian", "Sianjur Mulamula", "Pangururan", "Sitio-tio", "Baktiraja", "Pollung"],
    "Onan Runggu": ["Onan Runggu", "Simanindo", "Palipi", "Nainggolan", "Ronggur Nihuta", "Balige"],
    "Palipi": ["Palipi", "Onan Runggu", "Pangururan", "Nainggolan", "Sitio-tio", "Ronggur Nihuta"],
    "Ronggur Nihuta": ["Ronggur Nihuta", "Pangururan", "Simanindo", "Palipi", "Onan Runggu"],
    "Muara": ["Muara", "Tampahan", "Balige", "Baktiraja", "Siborongborong", "Lintong Nihuta"],
    "Baktiraja": ["Baktiraja", "Muara", "Doloksanggul", "Pollung", "Harian", "Sianjur Mulamula"],
    "Doloksanggul": ["Doloksanggul", "Lintong Nihuta", "Pollung", "Baktiraja", "Siborongborong", "Onan Ganjang"],
    "Pollung": ["Pollung", "Doloksanggul", "Baktiraja", "Harian", "Sianjur Mulamula"],
    "Lintong Nihuta": ["Lintong Nihuta", "Doloksanggul", "Siborongborong", "Muara", "Paranginan"],
    "Siborongborong": ["Siborongborong", "Lintong Nihuta", "Muara", "Tarutung", "Sipoholon", "Pagaran", "Tampahan"],
    "Tarutung": ["Tarutung", "Sipoholon", "Siatas Barita", "Siborongborong", "Pahae Jae", "Pahae Julu"],
    "Sipoholon": ["Sipoholon", "Tarutung", "Siborongborong", "Pagaran"],
    "Berastagi": ["Berastagi", "Kabanjahe", "Merdeka", "Dolat Rayat", "Merek"],
    "Kabanjahe": ["Kabanjahe", "Berastagi", "Merek", "Tigapanah"],
    "Merek": ["Merek", "Kabanjahe", "Silahisabungan", "Tongging", "Berastagi"],
    "Silahisabungan": ["Silahisabungan", "Merek", "Tongging", "Sidikalang", "Sumbul", "Sitinjo"],
    "Sidikalang": ["Sidikalang", "Sitinjo", "Sumbul", "Silahisabungan", "Parbuluan"],
    "Sitinjo": ["Sitinjo", "Sidikalang", "Parbuluan", "Sumbul", "Silahisabungan"],
    "Salak": ["Salak", "Sitellu Tali Urang Jehe", "Pergetteng-getteng Sengku", "Pakkat", "Doloksanggul"]
}

KECAMATAN_REFERENCE_CENTERS = {
    "balige": (2.3387, 99.0625),
    "laguboti": (2.3544, 99.1264),
    "sigumpar": (2.3920, 99.1550),
    "porsea": (2.4475, 99.1538),
    "silaen": (2.3870, 99.2051),
    "tampahan": (2.3160, 99.0125),
    "lumban julu": (2.6010, 99.0480),
    "ajibata": (2.6650, 98.9320),
    "parapat": (2.6620, 98.9350),
    "girsang sipangan bolon": (2.6620, 98.9350),
    "pangururan": (2.6033, 98.7050),
    "simanindo": (2.7252, 98.7869),
    "harian": (2.5830, 98.6330),
    "sianjur mulamula": (2.5890, 98.6420),
    "onan runggu": (2.5020, 98.9210),
    "palipi": (2.4450, 98.7900),
    "ronggur nihuta": (2.5800, 98.7700),
    "muara": (2.3378, 98.9048),
    "baktiraja": (2.3250, 98.8150),
    "doloksanggul": (2.2570, 98.7510),
    "pollung": (2.3100, 98.6800),
    "berastagi": (3.1870, 98.5110),
    "sidikalang": (2.7480, 98.3120),
    "tarutung": (2.0250, 98.9730)
}

def get_fair_route_with_rag(
    db: Session, 
    query: str, 
    kecamatan: str = None, 
    limit_utama: int = 3, 
    offset: int = 0,
    user_lat: float = None,
    user_lon: float = None
):
    query_lower = query.lower() if query else ""
    target_kecamatan_clean = None

    # 0. Deteksi otomatis nama kecamatan dari parameter atau string query
    if kecamatan and str(kecamatan).strip() and str(kecamatan).strip().lower() != 'all':
        target_kecamatan_clean = str(kecamatan).strip().title()
    else:
        for k_name in KNOWN_KECAMATANS:
            if k_name in query_lower:
                target_kecamatan_clean = k_name.title()
                break

    # Tentukan daftar kecamatan yang diperbolehkan (radius maksimal 2 hop tetangga)
    allowed_kecamatans = []
    target_center = None
    if target_kecamatan_clean:
        target_kec_key = target_kecamatan_clean.lower()
        target_center = KECAMATAN_REFERENCE_CENTERS.get(target_kec_key)
        for k_key, n_list in KECAMATAN_NEIGHBORS_2_HOPS.items():
            if k_key.lower() == target_kec_key:
                allowed_kecamatans = [n.lower() for n in n_list]
                break
        if not allowed_kecamatans:
            allowed_kecamatans = [target_kec_key]

    # 1. Deteksi Intensi Kategori Pencarian
    food_keywords = ['makanan', 'kuliner', 'makan', 'enak', 'terenak', 'rekomendasi', 'laper', 'lapar', 'resto', 'rumah makan', 'warung', 'menu', 'lapo', 'naniarsik', 'arsik', 'mie gomak', 'naniura', 'saksang', 'bpk', 'andaliman', 'sambal', 'tuktuk', 'kopi', 'kue', 'ombus', 'sihobuk', 'minum']
    umkm_keywords = ['umkm', 'oleh-oleh', 'oleh', 'ulos', 'souvenir', 'toko', 'kerajinan', 'kacang', 'belanja', 'sentra']
    wisata_keywords = ['wisata', 'pantai', 'museum', 'bukit', 'air terjun', 'taman', 'alam', 'rekreasi', 'liburan', 'jalan-jalan', 'lihat', 'tempat']

    is_food_query = any(k in query_lower for k in food_keywords)
    is_umkm_query = any(k in query_lower for k in umkm_keywords)
    is_wisata_query = any(k in query_lower for k in wisata_keywords) or (not is_food_query and not is_umkm_query)

    # 2. Filter kandidat dari database dengan validasi koordinat geografis ketat
    all_dests = db.query(models.Destinasi).all()
    candidate_pool = []

    if target_kecamatan_clean and allowed_kecamatans:
        for d in all_dests:
            if not d.latitude or not d.longitude:
                continue
            
            d_name_lower = (d.nama or '').lower()
            if any(non_poi in d_name_lower for non_poi in ['artikel', 'berita', 'sejarah terbentuknya', 'kawah purba terbesar', 'sejarah, legenda']):
                continue

            d_kec = (d.kecamatan or '').strip().lower()
            if d_kec not in allowed_kecamatans:
                continue
            
            # Hard Geofence Cap: Discard if coordinates are > 12 km away from target center
            if target_center:
                dist_to_center = haversine_km(target_center[0], target_center[1], d.latitude, d.longitude)
                if d_kec == target_kecamatan_clean.lower() and dist_to_center > 12.0:
                    continue
                if dist_to_center > 20.0:
                    continue

            candidate_pool.append(d)

        # Multi-Tier Sorting:
        # Tier 0: Destinasi di kecamatan target yang sama persis
        # Tier 1: Destinasi di kecamatan tetangga 1-2 hop
        def candidate_sort_key(d):
            d_kec = (d.kecamatan or '').strip().lower()
            tier = 0 if d_kec == target_kecamatan_clean.lower() else 1
            
            d_cat = (d.kategori or '').strip().lower()
            cat_match = 1
            if is_food_query and 'kuliner' in d_cat:
                cat_match = 0
            elif is_umkm_query and ('umkm' in d_cat or 'oleh' in d_cat or 'ulos' in d_cat):
                cat_match = 0
            elif is_wisata_query and 'wisata' in d_cat:
                cat_match = 0

            rating_val = float(d.rating or 4.0)
            dist_to_center = haversine_km(target_center[0], target_center[1], d.latitude, d.longitude) if target_center else 0.0

            return (tier, cat_match, -rating_val, dist_to_center)

        candidate_pool.sort(key=candidate_sort_key)
    else:
        # Jika query umum tanpa kecamatan spesifik
        matched_ids = cari_destinasi_semantik(query)
        if matched_ids:
            int_ids = set()
            for mid in matched_ids:
                try:
                    int_ids.add(int(mid))
                except ValueError:
                    pass
            # Filter berdasarkan intent
            temp_pool = []
            for d in all_dests:
                if d.id in int_ids:
                    d_cat = (d.kategori or '').strip().lower()
                    if is_food_query:
                        if 'kuliner' in d_cat or 'resto' in d_cat or 'makan' in d_cat:
                            temp_pool.append(d)
                    elif is_umkm_query:
                        if 'umkm' in d_cat or 'oleh' in d_cat or 'ulos' in d_cat:
                            temp_pool.append(d)
                    elif is_wisata_query:
                        if 'wisata' in d_cat or 'alam' in d_cat:
                            temp_pool.append(d)
                    else:
                        temp_pool.append(d)
            
            # Jika hasil filter berdasarkan intent kosong (misal Pinecone tidak menemukan kuliner), ambil dari seluruh DB
            if not temp_pool:
                if is_food_query:
                    temp_pool = [d for d in all_dests if 'kuliner' in (d.kategori or '').strip().lower()]
                elif is_umkm_query:
                    temp_pool = [d for d in all_dests if 'umkm' in (d.kategori or '').strip().lower()]
                else:
                    temp_pool = [d for d in all_dests if d.id in int_ids]

            candidate_pool = temp_pool

        if not candidate_pool:
            ref_lat = user_lat or 2.3387
            ref_lon = user_lon or 99.0625
            candidate_pool = sorted(
                all_dests, 
                key=lambda d: (-float(d.rating or 4.0), haversine_km(ref_lat, ref_lon, d.latitude, d.longitude))
            )

    # Ambil destinasi utama dengan rotasi offset
    total_candidates = len(candidate_pool)
    if total_candidates > 0:
        start_idx = (offset * limit_utama) % total_candidates
        destinasi_utama = candidate_pool[start_idx : start_idx + limit_utama]
        if len(destinasi_utama) < limit_utama and total_candidates > limit_utama:
            destinasi_utama += candidate_pool[: limit_utama - len(destinasi_utama)]
    else:
        destinasi_utama = []

    # 3. UMKM & Kuliner Rekomendasi Sekitar
    ref_center_lat = target_center[0] if target_center else (user_lat or 2.3387)
    ref_center_lon = target_center[1] if target_center else (user_lon or 99.0625)

    utama_ids = set([d.id for d in destinasi_utama])
    allowed_umkm_cats = ['kuliner'] if is_food_query else ['umkm', 'kuliner']

    all_umkm_db = db.query(models.Destinasi).filter(
        models.Destinasi.kategori.in_(allowed_umkm_cats)
    ).all()

    umkm_filtered = []
    for cand in all_umkm_db:
        if cand.id in utama_ids or not cand.latitude or not cand.longitude:
            continue
        
        cand_kec = (cand.kecamatan or '').strip().lower()
        if allowed_kecamatans and cand_kec not in allowed_kecamatans:
            continue

        dist = haversine_km(ref_center_lat, ref_center_lon, cand.latitude, cand.longitude)
        if dist > 15.0:
            continue

        # Prioritas skor: bobot lebih dekat untuk kecamatan yang sama persis
        weighted_dist = dist * 0.3 if (target_kecamatan_clean and cand_kec == target_kecamatan_clean.lower()) else dist * 0.7
        umkm_filtered.append((weighted_dist, -float(cand.rating or 4.0), cand))

    umkm_filtered.sort(key=lambda x: (x[0], x[1]))
    sorted_umkms = [x[2] for x in umkm_filtered]

    total_umkms = len(sorted_umkms)
    if total_umkms > 0:
        umkm_start_idx = (offset * 4) % total_umkms
        umkm_sekitar = sorted_umkms[umkm_start_idx : umkm_start_idx + 4]
        if len(umkm_sekitar) < 4 and total_umkms > 4:
            umkm_sekitar += sorted_umkms[: 4 - len(umkm_sekitar)]
    else:
        umkm_sekitar = []

    return {
        "destinasi_utama": destinasi_utama,
        "rekomendasi_umkm_sekitar": umkm_sekitar
    }


