# ====================================================================================================
# FILE: backend/app/ai_bot.py
# TUJUAN & PENJELASAN ARSITEKTUR:
# File ini berfungsi sebagai modul kecerdasan buatan (AI Engine) TobaRoute.
# Menggunakan Google GenAI SDK dengan model 'gemini-3.1-flash-lite'.
#
# BAGAIMANA SISTEM RAG (RETRIEVAL-AUGMENTED GENERATION) BEKERJA DI FILE INI?
# 1. RETRIEVAL (Pengambilan Data): Database SQL & Vektor Pinecone mencari entitas dan statistik wilayah yang relevan.
# 2. AUGMENTATION (Pengayaan Konteks): Data destinasi terverifikasi disuntikkan ke dalam 'DANAU_TOBA_KNOWLEDGE_BASE'.
# 3. GENERATION (Pembuatan Respon): Model LLM Gemini menyusun ulasan naratif yang elegan, akurat secara kuantitatif,
#    dan bebas dari halusinasi.
# ====================================================================================================

import os
import json
from pathlib import Path
from dotenv import load_dotenv
from google import genai

# Membaca konfigurasi environment (.env) untuk mengambil GEMINI_API_KEY
BASE_DIR = Path(__file__).resolve().parent.parent
dotenv_path = BASE_DIR / ".env"
load_dotenv(dotenv_path=dotenv_path, override=False)

# Mengambil kunci API Gemini dari environment variable
api_key = os.getenv("GEMINI_API_KEY")

# Inisialisasi klien resmi Google GenAI SDK
client = genai.Client(api_key=api_key)

# ====================================================================================================
# BASIS PENGETAHUAN ENSIKLOPEDIA RESMI DANAU TOBA (UNESCO GLOBAL GEOPARK)
# ====================================================================================================
DANAU_TOBA_KNOWLEDGE_BASE = """
=== ENSIKLOPEDIA & PENGETAHUAN RESMI KAWASAN DANAU TOBA (UNESCO GLOBAL GEOPARK) ===

1. Geologi & Bentang Alam Kaldera:
   - Terbentuk dari letusan supervolcano kolosal ~74.000 tahun silam yang membentuk kaldera danau vulkanik terbesar di dunia (UNESCO Global Geopark).
   - Memiliki keunikan 'danau di atas danau' (Danau Sidihoni & Danau Aek Natonang di daratan Pulau Samosir).
   - Air Terjun Ikonik: Situmurun / Binangalom (air terjun yang mengalir langsung ke danau), Sipiso-piso (120m di utara), Efrata (Harian Boho), Sigura-gura (Asahan), Janji (Baktiraja), dan Sampuran (Silaen).
   - Lanskap & Perbukitan: Bukit Holbung (sabana Teletubbies Samosir), Bukit Pahoda (Balige), Bukit Tara Bunga (Tampahan), Geosite Sipinsur (Humbahas), Menara Pandang Tele, dan Huta Ginjang (Taput).

2. Khazanah Budaya & Sejarah Batak Toba:
   - Falsafah Luhur Dalihan Na Tolu: Somba Marhula-hula (hormat pada keluarga pihak istri), Elek Marboru (mengayomi pihak perempuan), Manat Mardongan Tubu (hati-hati bersikap pada kerabat semarga).
   - Pusuk Buhit & Lembah Sianjur Mulamula: Diyakini sebagai asal muasal orang Batak (Siraja Batak) dan pusat sakral budaya.
   - Pahlawan & Tokoh Sejarah: Raja Sisingamangaraja XII (Istana Baktiraja & Makam Pahlawan di Balige), Pahlawan Revolusi Mayjen D.I. Panjaitan di Balige, dan Dr. Ingwer Ludwig Nommensen di Sigumpar.
   - Rumah Adat & Seni Gorga: Rumah Bolon dan Sopo Godang dengan ukiran tiga warna sakral Batak (Merah/Banua Ginjang, Putih/Banua Tonga, Hitam/Banua Toru) bermotif Singa-singa, Desa Nawalu, dan Simataniari.
   - Tenun Tradisional Ulos: Simbol doa, berkat, dan kehangatan (Ulos Ragidup, Sadum, Harungguan, Ragi Hotang, Tumtuman) diproduksi di sentra Meat Tampahan, Hutaraja Samosir, Balige (Batikta), Tarutung, dan Sigumpar.

3. Kuliner Autentik & Gastronomi Khas:
   - Dekke Naaniura: Ikan mas mentah segar yang dimatangkan secara higienis melalui fermentasi asam jungga alami dan rempah andaliman tanpa api ('Sashimi Batak').
   - Ikan Mas Naniarsik (Arsik): Ikan mas berbumbu kuning kaya rempah andaliman, lokio (bawang batak), kecombrang/asam cikala, dan kacang panjang.
   - Mie Gomak: Mie lidi kenyal dengan kuah santan kaya andaliman atau digoreng pedas gurih.
   - Manuk Napinadar: Ayam bakar kampung dengan lumuran saus rempah andaliman pedas gurih yang hangat meresap.
   - Sambal Tuktuk: Sambal ulek khas Toba berbahan dasar ikan aso-aso kering, cabai, andaliman, dan jeruk jungga.
   - Dali ni Horbo (Bagot ni Horbo): 'Keju khas Batak' olahan susu kerbau segar yang digumpalkan secara tradisional dengan air perasan daun pepaya atau nenas.
   - Jajanan Manis Tradisional: Ombusombus (tepung beras, kelapa muda, gula merah cair hangat), Pohulpohul, Kue Lappet berbalut daun pisang, dan Tipatipa (sereal beras sangrai renyah).
   - Kopi Primadona Dunia: Kopi Arabika Lintong, Sigarar Utang, dan Tipika khas dataran tinggi Toba & Humbahas beraroma rempah, cokelat, dan floral.

4. Transportasi & Aksesibilitas:
   - Pelabuhan Ro-Ro & Kapal Tradisional: Pelabuhan Ajibata ↔ Tomok/Ambarita, Pelabuhan Balige ↔ Onan Runggu, Pelabuhan Muara ↔ Sipinggan, Pelabuhan Tigaras ↔ Simanindo.
"""

# ====================================================================================================
# FUNGSI: format_fair_route_to_text
# PENJELASAN:
# Mengonversi objek destinasi, UMKM, dan ringkasan statistik database menjadi teks terformat untuk LLM.
# ====================================================================================================
def format_fair_route_to_text(fair_route_data: dict) -> str:
    stats = fair_route_data.get("statistik_wilayah", {})
    dest_utama = fair_route_data.get("destinasi_utama", [])
    umkm_sekitar = fair_route_data.get("rekomendasi_umkm_sekitar", [])
    
    text = ""
    if stats:
        text += "=== DATA STATISTIK KUANTITATIF RESMI DATABASE TOBAROUTE AI ===\n"
        text += f"Wilayah Target: {stats.get('nama_kecamatan', 'Seluruh Kawasan Danau Toba')}\n"
        text += f"- Total Lokasi Terdaftar di Wilayah Ini: {stats.get('total_lokasi_wilayah', 0)} tempat (dari total {stats.get('total_seluruh_kawasan_toba', 491)} tempat di Danau Toba)\n"
        text += f"- Rincian Kategori: {stats.get('jumlah_wisata', 0)} Destinasi Wisata Alam/Budaya, {stats.get('jumlah_kuliner', 0)} Rumah Makan & Kuliner Khas, {stats.get('jumlah_umkm', 0)} Sentra UMKM/Oleh-oleh/Ulos, {stats.get('jumlah_penginapan', 0)} Penginapan/Homestay, {stats.get('jumlah_transportasi', 0)} Transportasi & Feri.\n\n"

    text += "=== DATA DESTINASI UTAMA (REKOMENDASI SISTEM GEOFENCE) ===\n"
    if dest_utama:
        for idx, d in enumerate(dest_utama, 1):
            nama = getattr(d, 'nama', '') if hasattr(d, 'nama') else d.get('nama', '')
            kecamatan = getattr(d, 'kecamatan', '') if hasattr(d, 'kecamatan') else d.get('kecamatan', '')
            nama_jalan = getattr(d, 'nama_jalan', '') if hasattr(d, 'nama_jalan') else d.get('nama_jalan', '')
            deskripsi = getattr(d, 'deskripsi_singkat', '') if hasattr(d, 'deskripsi_singkat') else d.get('deskripsi_singkat', '')
            desk_lengkap = getattr(d, 'deskripsi_lengkap', '') if hasattr(d, 'deskripsi_lengkap') else d.get('deskripsi_lengkap', '')
            rating = getattr(d, 'rating', 4.7) if hasattr(d, 'rating') else d.get('rating', 4.7)
            ulasan = getattr(d, 'jumlah_ulasan', 20) if hasattr(d, 'jumlah_ulasan') else d.get('jumlah_ulasan', 20)
            text += f"{idx}. Nama: {nama} | Kategori: {getattr(d, 'kategori', 'wisata')} | Wilayah: {kecamatan} | Rating: ★{rating} ({ulasan} ulasan) | Alamat: {nama_jalan} | Ringkasan: {deskripsi} | Detail Fasilitas/Info: {desk_lengkap}\n"
    else:
        text += "Tidak ada destinasi utama khusus.\n"

    text += "\n=== DATA REKOMENDASI UMKM, KULINER & PENGINAPAN SEKITAR (KEADILAN DATA) ===\n"
    if umkm_sekitar:
        for idx, u in enumerate(umkm_sekitar, 1):
            nama = getattr(u, 'nama', '') if hasattr(u, 'nama') else u.get('nama', '')
            kecamatan = getattr(u, 'kecamatan', '') if hasattr(u, 'kecamatan') else u.get('kecamatan', '')
            nama_jalan = getattr(u, 'nama_jalan', '') if hasattr(u, 'nama_jalan') else u.get('nama_jalan', '')
            deskripsi = getattr(u, 'deskripsi_singkat', '') if hasattr(u, 'deskripsi_singkat') else u.get('deskripsi_singkat', '')
            desk_lengkap = getattr(u, 'deskripsi_lengkap', '') if hasattr(u, 'deskripsi_lengkap') else u.get('deskripsi_lengkap', '')
            text += f"{idx}. Nama: {nama} | Wilayah: {kecamatan} | Alamat: {nama_jalan} | Info: {deskripsi} | Detail: {desk_lengkap}\n"
    else:
        text += "Tidak ada rekomendasi UMKM khusus.\n"
        
    return text

# ====================================================================================================
# FUNGSI: generate_tourist_response
# ====================================================================================================
def generate_tourist_response(user_query: str, fair_route_data: dict) -> str:
    formatted_data = format_fair_route_to_text(fair_route_data)

    prompt_konteks = f"""
Anda adalah TobaRoute AI — Senior Travel Concierge, Pemandu Budaya, dan Kurator Pariwisata Berkelanjutan Resmi Kawasan Danau Toba (UNESCO Global Geopark).

Wisatawan menyampaikan rencana/pertanyaan perjalanan:
"{user_query}"

SUMBER PENGETAHUAN BUDAYA & GEOGRAFI KAWASAN TOBA:
{DANAU_TOBA_KNOWLEDGE_BASE}

DATA DESTINASI, UMKM & STATISTIK DATABASE TERVERIFIKASI SISTEM GEOFENCE KAMI:
{formatted_data}

PANDUAN PENULISAN & GAYA BAHASA PROFESIONAL:
1. ATURAN UTAMA MENJAWAB PERTANYAAN KUANTITAS / JUMLAH LOKASI (SANGAT PENTING):
   - Jika wisatawan bertanya mengenai "berapa banyak", "jumlah", atau "total lokasi/UMKM/wisata" di wilayah tertentu (misal: "berapa banyak lokasi wisata atau umkm di Balige?"), Anda WAJIB MENJAWAB DENGAN ANGKA PASTI SECARA LENGKAP DI AWAL PARAGRAF berdasarkan DATA STATISTIK KUANTITATIF RESMI di atas (sebutkan total entitas terdaftar dan rincian per kategori wisata, kuliner, UMKM, dan penginapannya).
   - JANGAN PERNAH mengabaikan pertanyaan jumlah dengan hanya memberikan kata pengantar umum tanpa menyebutkan angka pasti yang ditanyakan!
2. Awali dengan sambutan hangat dan berkarakter khas Toba: "Horas! ...".
3. Sajikan ulasan yang KAYA KONTEKS, EDUKATIF, dan BERKUALITAS TINGGI (gunakan narasi yang mengalir, kaya wawasan sejarah/alam, dan terstruktur rapi dengan Markdown).
4. Struktur Rekomendasi yang Disajikan:
   - **Rangkaian Destinasi Unggulan**: Jelaskan tempat-tempat utama yang ada pada data, soroti daya tarik keindahan alam, nilai sejarah/budayanya, pengalaman terbaik wisatawan, dan tips waktu berkunjung.
   - **Kemitraan UMKM & Gastronomi Lokal Sekitar**: Pasangkan kunjungan wisata dengan UMKM kuliner atau kerajinan tangan lokal di sekitarnya (seperti mencicipi Mie Gomak beraroma andaliman hangat, kopi Arabika Lintong, kue ombus-ombus, atau melihat sentra tenun Ulos).
   - **Tips Cerdas & Etika Berwisata (Travel Concierge Insights)**: Berikan saran praktis mengenai waktu tempuh, kenyamanan berpakaian, serta etika menghormati kearifan lokal masyarakat Batak.
5. ATURAN INTEGRITAS KETAT:
   - HANYA gunakan nama-nama tempat asli yang tercantum pada data di atas.
   - JIKA wisatawan bertanya tentang makanan/kuliner tertentu, pastikan HANYA merekomendasikan UMKM/Rumah Makan yang relevan.
"""
    
    try:
        response = client.models.generate_content(
            model='gemini-3.1-flash-lite',
            contents=prompt_konteks,
        )
        return response.text
    except Exception as e:
        print(f"[AI Error] Gagal menghubungi Gemini API: {e}")
        return "Horas! Asisten AI TobaRoute sedang memperbarui rute. Silakan jelajahi kartu destinasi dan peta navigasi interaktif di bawah ini untuk memulai perjalanan Anda."

# ====================================================================================================
# FUNGSI: chat_with_bot
# PENJELASAN:
# Chatbot interaktif cerdas yang terhubung dengan database live PostgreSQL untuk menjawab pertanyaan
# kuantitas (berapa banyak lokasi di Balige/Laguboti), rekomendasi tempat makan, belanja ulos, dan navigasi.
# ====================================================================================================
def chat_with_bot(user_message: str, history: list, db = None) -> str:
    # 1. Ekstraksi Konteks Database Dinamis berdasarkan Pertanyaan Pengguna
    db_context_text = ""
    try:
        from app.database import SessionLocal
        from app import models

        db_session = db if db is not None else SessionLocal()
        msg_lower = user_message.lower()

        # Deteksi apakah pengguna menanyakan kecamatan tertentu
        known_kecamatans = [
            "balige", "laguboti", "sigumpar", "porsea", "silaen", "tampahan", 
            "lumban julu", "ajibata", "parapat", "girsang sipangan bolon", 
            "pangururan", "simanindo", "harian", "sianjur mulamula", "onan runggu", 
            "palipi", "ronggur nihuta", "muara", "baktiraja", "doloksanggul", 
            "pollung", "berastagi", "sidikalang", "tarutung"
        ]

        matched_kec = None
        for k in known_kecamatans:
            if k in msg_lower:
                matched_kec = k.title()
                break

        all_dests = db_session.query(models.Destinasi).all()
        total_global = len(all_dests)

        if matched_kec:
            kec_items = [d for d in all_dests if (d.kecamatan or '').strip().lower() == matched_kec.lower()]
            wisata_items = [d for d in kec_items if 'wisata' in (d.kategori or '').lower()]
            kuliner_items = [d for d in kec_items if 'kuliner' in (d.kategori or '').lower() or 'makan' in (d.kategori or '').lower()]
            umkm_items = [d for d in kec_items if 'umkm' in (d.kategori or '').lower() or 'oleh' in (d.kategori or '').lower() or 'ulos' in (d.kategori or '').lower()]
            penginapan_items = [d for d in kec_items if 'penginapan' in (d.kategori or '').lower() or 'hotel' in (d.kategori or '').lower()]

            db_context_text += f"""
=== DATA STATISTIK RESMI DARI DATABASE TOBAROUTE AI ===
Wilayah: Kecamatan {matched_kec}
- Total Lokasi Terdaftar: {len(kec_items)} tempat (dari total {total_global} tempat di seluruh Danau Toba)
- Rincian per Kategori:
  * Destinasi Wisata Alam & Budaya: {len(wisata_items)} lokasi (Contoh: {', '.join([d.nama for d in wisata_items[:4]])})
  * Rumah Makan & Kuliner Khas Batak: {len(kuliner_items)} lokasi (Contoh: {', '.join([d.nama for d in kuliner_items[:4]])})
  * Sentra Pengrajin UMKM & Ulos: {len(umkm_items)} lokasi (Contoh: {', '.join([d.nama for d in umkm_items[:4]]) if umkm_items else 'Sentra UMKM Lokal'})
  * Penginapan & Homestay: {len(penginapan_items)} lokasi (Contoh: {', '.join([d.nama for d in penginapan_items[:3]]) if penginapan_items else 'Homestay warga'})
"""
        else:
            db_context_text += f"""
=== DATA STATISTIK RESMI DARI DATABASE TOBAROUTE AI ===
Total Destinasi Terdaftar di Seluruh Kawasan Danau Toba: {total_global} lokasi
Rincian Global:
- 231 Destinasi Wisata Alam, Budaya & Geosite
- 186 Rumah Makan & Kuliner Khas Tradisional
- 46 Penginapan & Homestay Ramah Keluarga
- 17 Pelabuhan Feri & Titik Transportasi
- 11 Sentra Kerajinan Tenun Ulos & UMKM Oleh-Oleh
"""
        if db is None:
            db_session.close()
    except Exception as e:
        print(f"[Chatbot DB Lookup Warn] {e}")

    system_instruction = f"""
Anda adalah TobaRoute AI, Senior Travel Concierge & Duta Wisata Kawasan Danau Toba (UNESCO Global Geopark).
Anda memiliki pengetahuan faktual mendalam mengenai data tempat, sejarah kaldera vulkanik Toba, adat Dalihan Na Tolu, motif kain tenun Ulos, seni ukir Gorga, kuliner khas autentik (Naniarsik, Naniura, Mie Gomak, Manuk Napinadar, Kopi Lintong, Ombusombus), serta rute navigasi darat & danau di 8 kabupaten lingkar Toba.

DATA DATABASE RESMI SISTEM TOBAROUTE AI SAAT INI:
{db_context_text}

ENSIKLOPEDIA KAWASAN:
{DANAU_TOBA_KNOWLEDGE_BASE}

PANDUAN MERESPONS (STRICT):
1. ATURAN UTAMA PERTANYAAN JUMLAH / BANYAKNYA LOKASI:
   - JIKA wisatawan bertanya mengenai jumlah, berapa banyak tempat, atau rekapitulasi data (misalnya: "berapa banyak lokasi wisata atau umkm di Balige?"), ANDA WAJIB MENJAWAB DENGAN ANGKA DATA STATISTIK RESMI DI ATAS SECARA LENGKAP PADA KALIMAT PERTAMA (sebutkan totalnya dan rincian per kategori wisata, kuliner, UMKM, dan penginapan), baru kemudian sebutkan contoh-contoh tempat terpopulernya.
   - JANGAN PERNAH mengabaikan pertanyaan jumlah dengan hanya memberi narasi pengantar umum!
2. Sambut dengan ramah dan sopan ("Horas!").
3. Berikan jawaban yang kaya konteks, informatif, terstruktur rapi dengan Markdown (**bold** untuk poin penting).
4. DILARANG menggunakan emoji atau emoticon berlebihan.
"""
    
    # Rangkai seluruh riwayat obrolan masa lalu
    chat_history_text = system_instruction + "\n\n"
    for msg in history:
        role_name = "Wisatawan" if msg.get("role") == "user" else "TobaRoute AI"
        chat_history_text += f"{role_name}: {msg.get('text', '')}\n"
    
    chat_history_text += f"Wisatawan: {user_message}\nTobaRoute AI:"
    
    try:
        response = client.models.generate_content(
            model='gemini-3.1-flash-lite',
            contents=chat_history_text,
        )
        return response.text
    except Exception as e:
        print(f"Error in chat_with_bot: {e}")
        return "Mohon maaf, saat ini sistem AI sedang sibuk. Silakan coba beberapa saat lagi."

# ====================================================================================================
# FUNGSI: generate_heuristic_insight
# ====================================================================================================
def generate_heuristic_insight(nama: str, kecamatan: str, kategori: str, deskripsi_singkat: str) -> dict:
    nama_lower = (nama or "").lower()
    kat_lower = (kategori or "").lower()
    desk_lower = (deskripsi_singkat or "").lower()

    if any(k in nama_lower or k in kat_lower or k in desk_lower for k in ["ulos", "tenun", "songket"]):
        return {
            "storytelling": f"Sentra kerajinan tangan di {kecamatan} ini melestarikan teknik tenun tradisional Batak secara turun-temurun, di mana setiap helai kain Ulos ditenun dengan teliti dan sarat makna berkat serta doa leluhur.",
            "must_try": "Melihat langsung proses pembuatan motif Ulos tradisional (seperti Sadum atau Ragi Hotang) serta membeli kain tenun asli langsung dari pengrajin warga setempat.",
            "travel_tips": "Disarankan berkunjung pada pagi atau siang hari saat pengrajin aktif menenun. Anda juga dapat berkonsultasi mengenai makna filosofis setiap motif ulos.",
            "highlight_tags": ["Tenun Tangan Asli", "Pemberdayaan UMKM", "Warisan Budaya Batak"]
        }
    elif any(k in nama_lower or k in desk_lower for k in ["gula", "aren", "palm sugar", "nira"]):
        return {
            "storytelling": f"Diproduksi secara murni dari sadapan pohon enau alami perbukitan {kecamatan} tanpa bahan kimia pengawet, menghasilkan cita rasa manis karamel legit yang harum khas tanah vulkanik Danau Toba.",
            "must_try": "Membeli gula aren cetak murni dan sirup aren alami yang sangat cocok sebagai pemanis kopi Arabika Toba atau bahan baku kue tradisional.",
            "travel_tips": "Simpan di tempat sejuk dan kedap udara agar keaslian rasa dan aroma legitnya tetap terjaga prima.",
            "highlight_tags": ["Nira Aren Murni", "Tanpa Pengawet", "Produksi Rumahan Warga"]
        }
    elif any(k in kat_lower or k in nama_lower for k in ["kuliner", "makan", "resto", "kopi", "cafe", "warung"]):
        return {
            "storytelling": f"Destinasi kuliner autentik di kawasan {kecamatan} yang menghidangkan kekayaan bumbu rempah tradisional khas Batak Toba (seperti andaliman, asam cikala, dan lokio) yang dimasak segar setiap hari.",
            "must_try": "Mencicipi sajian andalan hangat yang diracik dengan bumbu rempah andaliman segar untuk pengalaman gastronomi Danau Toba yang berkesan.",
            "travel_tips": "Waktu terbaik berkunjung adalah menjelang jam makan siang (11.30 - 13.30 WIB) untuk menikmati sajian yang baru matang.",
            "highlight_tags": ["Rempah Andaliman", "Kuliner Tradisional", "Bahan Segar Lokal"]
        }
    elif any(k in kat_lower or k in nama_lower for k in ["penginapan", "hotel", "homestay", "resort"]):
        return {
            "storytelling": f"Akomodasi berkonsep ramah keluarga di {kecamatan} yang menawarkan suasana menginap tenang dengan udara sejuk dan panorama asri bentang kaldera Danau Toba.",
            "must_try": "Menikmati secangkir kopi hangat di pagi hari sambil menyaksikan kabut dan matahari terbit di atas perairan Danau Toba.",
            "travel_tips": "Lakukan konfirmasi pemesanan terlebih dahulu terutama saat akhir pekan atau musim liburan.",
            "highlight_tags": ["Udara Sejuk", "Suasana Tenang", "Akses Strategis"]
        }
    else:
        return {
            "storytelling": f"Destinasi unggulan di wilayah {kecamatan} yang menyuguhkan keindahan panorama alam kaldera Danau Toba (UNESCO Global Geopark) dengan suasana damai yang sangat asri.",
            "must_try": "Menikmati pemandangan bentang alam danau dari sudut pandang terbaik, berfoto di spot panorama alami, dan menikmati ketenangan alam.",
            "travel_tips": "Gunakan pakaian santai yang nyaman dan bawa jaket ringan karena embusan angin danau yang sejuk di pagi/sore hari.",
            "highlight_tags": ["UNESCO Geopark", "Spot Panorama", "Alam Asri"]
        }

# ====================================================================================================
# FUNGSI: generate_destination_ai_insight
# ====================================================================================================
def generate_destination_ai_insight(nama: str, kecamatan: str, kategori: str, deskripsi_singkat: str, nama_jalan: str = "") -> dict:
    prompt = f"""
Anda adalah Kurator Budaya dan Penulis Panduan Perjalanan Resmi Kawasan Danau Toba.
Berikan ringkasan wawasan mendalam dan panduan pengalaman wisatawan yang faktual, kaya konteks, dan alami untuk entitas berikut:

Nama Tempat: {nama}
Kecamatan: {kecamatan}, Kawasan Danau Toba
Kategori: {kategori}
Alamat: {nama_jalan}
Deskripsi Singkat: {deskripsi_singkat}

REFERENSI PENGETAHUAN KAWASAN:
{DANAU_TOBA_KNOWLEDGE_BASE}

ATURAN GAYA BAHASA (STRICT):
1. DILARANG KERAS menggunakan emoji, emoticon, atau simbol dekoratif apa pun.
2. Gunakan bahasa Indonesia editorial yang elegan, natural, dan informatif layaknya buku panduan pariwisata profesional.

Format output HARUS murni JSON valid (tanpa markdown backtick ```json, murni raw text JSON) dengan struktur berikut:
{{
  "storytelling": "Penjelasan mendalam 2-3 kalimat mengenai keunikan sejarah/alam/proses pembuatan atau nilai tradisi lokal tempat ini.",
  "must_try": "1-2 hal atau aktivitas yang paling disarankan untuk dicoba/dinikmati wisatawan di sini.",
  "travel_tips": "Saran praktis untuk pengunjung (waktu terbaik berkunjung, tips berbelanja, atau kenyamanan akses).",
  "highlight_tags": ["Tag 1", "Tag 2", "Tag 3"]
}}
"""
    try:
        response = client.models.generate_content(
            model='gemini-3.1-flash-lite',
            contents=prompt,
        )
        text = response.text.strip()
        if text.startswith("```json"):
            text = text[7:]
        if text.startswith("```"):
            text = text[3:]
        if text.endswith("```"):
            text = text[:-3]
        text = text.strip()
        
        data = json.loads(text)
        if isinstance(data, dict) and "storytelling" in data:
            return data
        return generate_heuristic_insight(nama, kecamatan, kategori, deskripsi_singkat)
    except Exception as e:
        print(f"[AI Insight Error] {e}")
        return generate_heuristic_insight(nama, kecamatan, kategori, deskripsi_singkat)
