# ====================================================================================================
# FILE: backend/app/ai_bot.py
# TUJUAN & PENJELASAN ARSITEKTUR:
# File ini berfungsi sebagai modul kecerdasan buatan utama (AI Engine) TobaRoute.
# Menggunakan Google GenAI SDK dengan model 'gemini-3.1-flash-lite'.
#
# BAGAIMANA SISTEM RAG (RETRIEVAL-AUGMENTED GENERATION) & UNIVERSAL CHATBOT BEKERJA?
# 1. RETRIEVAL (Pengambilan Data): Database SQL & Vektor mencari entitas, statistik wilayah, & POI relevan.
# 2. AUGMENTATION (Pengayaan Konteks): Data destinasi terverifikasi disuntikkan ke dalam ENSILOPEDIA DANAU TOBA.
# 3. GENERATION (Pembuatan Respon): Model LLM Gemini menyusun respons yang sangat kaya, mendalam,
#    faktual, serta fleksibel untuk menjawab SEGALA pertanyaan pengguna (spesifik, budaya, kuantitatif,
#    itinerary, maupun pertanyaan umum/random layaknya ChatGPT atau Gemini).
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
api_key = os.getenv("GEMINI_API_KEY") or os.getenv("GEMINI_KEY") or "AIzaSyDummyFallbackKey1234567890"

try:
    client = genai.Client(api_key=api_key)
except Exception as e:
    print(f"[WARN] Inisialisasi Gemini Client: {e}")
    client = None

# ====================================================================================================
# BASIS PENGETAHUAN ENSIKLOPEDIA RESMI & KOMPREHENSIF KAWASAN DANAU TOBA (UNESCO GLOBAL GEOPARK)
# ====================================================================================================
DANAU_TOBA_KNOWLEDGE_BASE = """
=== ENSIKLOPEDIA & BASIS PENGETAHUAN RESMI KAWASAN DANAU TOBA (UNESCO GLOBAL GEOPARK) ===

1. Geologi & Sejarah Kaldera Vulkanik Terbesar di Dunia:
   - Supererupsi Kaldera Toba (~74.000 tahun silam / Youngest Toba Tuff) berkekuatan VEI 8 melepaskan lebih dari 2.800 km³ material vulkanik, menyebabkan musim dingin vulkanik global (volcanic winter) selama bertahun-tahun dan mengubah iklim bumi purba.
   - Membentuk danau vulkanik kaldera terbesar di dunia dengan panjang ~100 km, lebar ~30 km, dan kedalaman mencapai lebih dari 500 meter di permukaan 905 meter di atas permukaan laut.
   - Fenomena Langka 'Danau di Atas Danau': Danau Sidihoni (Kecamatan Pangururan) dan Danau Aek Natonang (Kecamatan Simanindo) di daratan Pulau Samosir.
   - Pulau-pulau di Danau Toba: Pulau Samosir (pulau vulkanik utama di tengah kaldera), Pulau Sibandang (sentra mangga manis di Muara), Pulau Tao (Simanindo), Pulau Sirukkungon, dan Pulau Tolping.
   - 16 Geosite Resmi UNESCO Global Geopark: Geosite Sipinsur (Humbahas), Bakkara-Tipang, Tongging-Sipiso-piso (Karo), Haranggaol (Simalungun), Menara Pandang Tele (Samosir), Pusuk Buhit, Sianjur Mulamula, Simanindo-Ambarita, Tuk-Tuk-Tomok, Hutaginjang (Taput), Parapat-Sibaganding, Silalahi-Sabungan (Dairi), Muara-Sibandang, Situmurun / Binangalom (Toba), Taman Eden 100, dan Desa Wisata Meat Tampahan.
   - Air Terjun Fenomenal: Situmurun / Binangalom (mengucur langsung ke air Danau Toba), Sipiso-piso (air terjun tunggal 120m di utara), Efrata (Harian Boho), Sigura-gura & Tangga (Asahan), Janji (Lembah Bakkara), Sampuran (Silaen), dan Simanimbo (Porsea).
   - Lanskap Perbukitan Panorama 360°: Bukit Holbung (sabana bukit Teletubbies Samosir), Bukit Pahoda (Balige), Bukit Tara Bunga (Tampahan), Geosite Sipinsur (panorama hutan pinus kaldera), Bukit Singgolom, dan Huta Ginjang (spot paralayang kaldera).

2. Asal-Usul, Sejarah, Adat & Kosmologi Suku Batak:
   - Asal Muasal: Gunung suci Pusuk Buhit dan Lembah Sianjur Mulamula diyakini sebagai tempat turun dan bermukimnya Si Raja Batak (leluhur awal orang Batak) beserta putranya Guru Tatea Bulan dan Raja Isumbaon.
   - Falsafah Luhur Dalihan Na Tolu (Tiga Pilar Kekerabatan Batak):
     1. Somba Marhula-hula: Sikap hormat, santun, dan menjunjung tinggi keluarga pihak istri (pemberi berkat dan restu).
     2. Elek Marboru: Sikap mengayomi, membimbing, dan penuh kelemahlembutan terhadap saudara perempuan/pihak perempuan (penerima berkat).
     3. Manat Mardongan Tubu: Sikap hati-hati, bijaksana, dan saling menghormati dengan sesama kerabat satu marga agar tidak terjadi perselisihan.
   - Sistem Patrilineal & Tarombo: Silsilah marga diturunkan dari garis ayah, melahirkan lebih dari 400 marga Batak dengan larangan pernikahan satu rumpun marga (namariboto).
   - Tokoh Sejarah & Pahlawan Nasional:
     * Raja Sisingamangaraja XII: Raja sekaligus pejuang anti-kolonialisme Belanda dari Lembah Bakkara, gugur di Dairi 1907, dimakamkan di Makam Pahlawan Nasional Soposurung Balige.
     * Pahlawan Revolusi Mayjen TNI Anumerta D.I. Panjaitan (Balige).
     * Dr. Ingwer Ludwig Nommensen: Misionaris perintis pendidikan dan modernisasi masyarakat Batak (Makam & Pusat Ziarah di Sigumpar).
   - Seni Arsitektur Gorga & Rumah Bolon:
     * Konstruksi pasak kayu tradisional tanpa paku, atap pelana menjulang seperti tanduk kerbau (simbol kekuatan dan kerja keras).
     * Ornamen Gorga dengan 3 Warna Kosmologis (Tiga Banua): Putih (Banua Ginjang - Dunia Atas/Kesucian), Merah (Banua Tonga - Dunia Tengah/Kehidupan Manusia), Hitam (Banua Toru - Dunia Bawah/Keteguhan).
     * Motif Simbolis: Boraspati ni Tano (cicak penjaga bumi dan kesuburan), Paung (tanduk kerbau pelindung mara bahaya), Singa-singa, Desa Nawalu, dan Simataniari (matahari sumber berkah).
   - Seni Tenun Tradisional Ulos:
     * Ulos Ragidup: Ulos berderajat sakral tertinggi dengan tenunan rumit, simbol kehidupan, diberikan orang tua pengantin wanita kepada ibu pengantin pria saat pernikahan adat.
     * Ulos Sadum: Penuh warna-warni cerah ceria, simbol sukacita, optimisme, dan kemeriahan pesta.
     * Ulos Ragi Hotang: Simbol ikatan lahir batin yang kuat dan kokoh (sering disampirkan pada pengantin baru).
     * Ulos Mangiring: Diberikan kepada anak pertama atau cucu sebagai doa kesuburan dan kelancaran rezeki.
     * Ulos Harungguan: Masterpiece tenun khas Tarutung dan Muara yang memadukan puluhan motif ulos dalam satu helai kain.
     * Sentra Tenun Asli: Desa Meat (Tampahan), Huta Raja (Lumban Suhi-suhi Samosir), Batikta & Sentra Balige, Tarutung, dan Sigumpar.

3. Gastronomi & Kuliner Autentik Khas Batak:
   - Dekke Naaniura: Hidangan ikan mas mentah segar yang dimatangkan secara dingin tanpa api melalui fermentasi asam jeruk jungga alami dan dibaluri rempah andaliman, unte, lengkuas, kunyit, kacang sangrai, serta kemiri ('Sashimi Tradisional Batak').
   - Ikan Mas Naniarsik (Arsik): Sajian ikan mas berbumbu kuning melimpah rempah andaliman, lokio (bawang batak), kecombrang/asam cikala, kacang panjang, dan asam gelugur yang dimasak hingga kuahnya meresap kering.
   - Mie Gomak: Mie lidi kenyal khas Toba disiram kuah santan kuning kaya andaliman yang pedas getir hangat atau digoreng kering gurih.
   - Manuk Napinadar: Ayam kampung bakar dibalut saus rempah andaliman pedas gurih yang meresap hangat ke dalam serat daging.
   - Sambal Tuktuk: Sambal ulek khas Toba berbahan dasar cabai rawit, andaliman, jeruk jungga, dan ikan aso-aso kering sangrai.
   - Dali ni Horbo (Bagot ni Horbo): 'Keju khas Batak' olahan susu kerbau segar yang digumpalkan secara alami menggunakan air perasan daun pepaya atau nenas, lalu dikukus hingga lembut kenyal.
   - Kudapan Manis Tradisional:
     * Ombusombus: Tepung beras ketan, parutan kelapa muda, dan gula aren merah cair yang disajikan hangat mengepul berbalut daun pisang (legendaris dari Siborongborong & Balige).
     * Pohulpohul: Kue tepung beras manis yang dicetak dengan kepalan jari tangan (simbol kekompakan dan komitmen).
     * Kue Lappet: Tepung beras ketan isi gula merah kelapa dibungkus kerucut daun pisang.
     * Tipatipa: Sereal beras sangrai khas Porsea yang renyah gurih dimakan dengan parutan kelapa dan gula pasir.
     * Sasagun: Tepung beras sangrai gurih manis harum kelapa.
   - Kopi Arabika Dataran Tinggi: Kopi Arabika Lintong (Humbahas), Sigarar Utang, dan Tipika berkarakter body tebal, aroma rempah herba (spicy), cokelat hitam, dan floral eksotis.

4. Delapan (8) Kabupaten Lingkar Danau Toba:
   - Kabupaten Toba (Ibukota: Balige): Sentra budaya, Institut Teknologi Del di Laguboti, Pantai Lumban Silintong, Desa Meat, Makam Raja Sisingamangaraja XII, Bukit Singgolom, Porsea.
   - Kabupaten Samosir (Ibukota: Pangururan): Pusat wisata pulau, Jembatan Tano Ponggol, Pemandian Air Panas Aek Rangat, Bukit Holbung, Menara Pandang Tele, Desa Wisata Tomok & Tuk-Tuk, Batu Kursi Persidangan Huta Siallagan.
   - Kabupaten Humbang Hasundutan (Ibukota: Doloksanggul): Geosite Sipinsur, Lembah Hijau Bakkara, Istana Raja Sisingamangaraja XII, Air Terjun Janji, Sentra Kopi Lintong.
   - Kabupaten Tapanuli Utara (Ibukota: Tarutung): Wisata Rohani Salib Kasih Siatas Barita, Pemandian Air Soda Parbubu (satu dari dua di dunia), Pemandian Air Panas Sipoholon, Panorama Huta Ginjang.
   - Kabupaten Simalungun (Kawasan: Parapat): Gerbang wisata legendaris Toba, Pesanggrahan Bung Karno, Pelabuhan Wisata Ajibata, Haranggaol.
   - Kabupaten Karo (Kawasan: Tongging/Berastagi): Air Terjun Sipiso-piso 120 meter, Bukit Gundaling, Kebun Jeruk & Bunga Berastagi, Gunung Sinabung & Sibayak.
   - Kabupaten Dairi (Kawasan: Silahisabungan/Sidikalang): Pantai Tao Silalahi (pantai terpanjang di Danau Toba), Tugu Silahisabungan, Kopi Sidikalang legendaris.
   - Kabupaten Pakpak Bharat (Ibukota: Salak): Air Terjun Lae Mbilulu, Geopark Delleng Simpon, tradisi budaya suku Pakpak.

5. Aksesibilitas, Navigasi & Logistik Transportasi:
   - Bandara Internasional Sisingamangaraja XII / Silangit (DTB) di Siborongborong: Akses tercepat ke Balige (~30 mnt), Muara (~45 mnt), Doloksanggul (~45 mnt), dan Parapat (~1.5 jam).
   - Bandara Internasional Kualanamu (KNO) di Deli Serdang: Akses via Jalan Tol Medan-Tebing Tinggi-Sinaksak menuju Parapat (~2.5 - 3.5 jam).
   - Pelabuhan Feri Penyeberangan Ro-Ro Utama:
     * Pelabuhan Ajibata ↔ Pelabuhan Ambarita (KMP Ihan Batak & KMP Pora-Pora).
     * Pelabuhan Ajibata ↔ Pelabuhan Tomok (Kapal Motor Tradisional & Kapal Feri Tao Toba).
     * Pelabuhan Tigaras (Simalungun) ↔ Pelabuhan Simanindo (Samosir).
     * Pelabuhan Balige (Toba) ↔ Pelabuhan Onan Runggu (Samosir).
     * Pelabuhan Muara (Taput) ↔ Pelabuhan Sipinggan (Samosir).
"""

# ====================================================================================================
# FUNGSI: format_fair_route_to_text
# ====================================================================================================
def format_fair_route_to_text(fair_route_data: dict) -> str:
    stats = fair_route_data.get("statistik_wilayah", {})
    dest_utama = fair_route_data.get("destinasi_utama", [])
    umkm_sekitar = fair_route_data.get("rekomendasi_umkm_sekitar", [])
    
    text = ""
    if stats:
        text += "=== DATA STATISTIK RESMI DATABASE TOBAROUTE AI ===\n"
        text += f"Wilayah Target: {stats.get('nama_kecamatan', 'Seluruh Kawasan Danau Toba')}\n"
        text += f"- Total Tempat Terdaftar di Wilayah Ini: {stats.get('total_lokasi_wilayah', 0)} lokasi (dari total {stats.get('total_seluruh_kawasan_toba', 491)} tempat terdata di Danau Toba)\n"
        text += f"- Rincian per Kategori: {stats.get('jumlah_wisata', 0)} Wisata Alam/Budaya, {stats.get('jumlah_kuliner', 0)} Kuliner Khas/Resto, {stats.get('jumlah_umkm', 0)} Sentra UMKM/Oleh-oleh, {stats.get('jumlah_penginapan', 0)} Penginapan/Hotel, {stats.get('jumlah_transportasi', 0)} Titik Transportasi/Feri.\n\n"

    text += "=== DATA DESTINASI UTAMA (HASIL REKOMENDASI SISTEM GEOFENCE) ===\n"
    if dest_utama:
        for idx, d in enumerate(dest_utama, 1):
            nama = getattr(d, 'nama', '') if hasattr(d, 'nama') else d.get('nama', '')
            kecamatan = getattr(d, 'kecamatan', '') if hasattr(d, 'kecamatan') else d.get('kecamatan', '')
            nama_jalan = getattr(d, 'nama_jalan', '') if hasattr(d, 'nama_jalan') else d.get('nama_jalan', '')
            deskripsi = getattr(d, 'deskripsi_singkat', '') if hasattr(d, 'deskripsi_singkat') else d.get('deskripsi_singkat', '')
            desk_lengkap = getattr(d, 'deskripsi_lengkap', '') if hasattr(d, 'deskripsi_lengkap') else d.get('deskripsi_lengkap', '')
            rating = getattr(d, 'rating', 4.7) if hasattr(d, 'rating') else d.get('rating', 4.7)
            ulasan = getattr(d, 'jumlah_ulasan', 20) if hasattr(d, 'jumlah_ulasan') else d.get('jumlah_ulasan', 20)
            text += f"{idx}. Nama: {nama} | Kategori: {getattr(d, 'kategori', 'wisata')} | Kecamatan: {kecamatan} | Rating: {rating} ({ulasan} ulasan) | Alamat: {nama_jalan} | Ringkasan: {deskripsi} | Detail: {desk_lengkap}\n"
    else:
        text += "Tidak ada destinasi utama khusus.\n"

    text += "\n=== DATA REKOMENDASI UMKM, KULINER & PENGINAPAN SEKITAR ===\n"
    if umkm_sekitar:
        for idx, u in enumerate(umkm_sekitar, 1):
            nama = getattr(u, 'nama', '') if hasattr(u, 'nama') else u.get('nama', '')
            kecamatan = getattr(u, 'kecamatan', '') if hasattr(u, 'kecamatan') else u.get('kecamatan', '')
            nama_jalan = getattr(u, 'nama_jalan', '') if hasattr(u, 'nama_jalan') else u.get('nama_jalan', '')
            deskripsi = getattr(u, 'deskripsi_singkat', '') if hasattr(u, 'deskripsi_singkat') else u.get('deskripsi_singkat', '')
            desk_lengkap = getattr(u, 'deskripsi_lengkap', '') if hasattr(u, 'deskripsi_lengkap') else u.get('deskripsi_lengkap', '')
            text += f"{idx}. Nama: {nama} | Kecamatan: {kecamatan} | Alamat: {nama_jalan} | Ringkasan: {deskripsi} | Detail: {desk_lengkap}\n"
    else:
        text += "Tidak ada rekomendasi UMKM khusus.\n"
        
    return text

# ====================================================================================================
# FUNGSI: generate_tourist_response
# ====================================================================================================
def generate_tourist_response(user_query: str, fair_route_data: dict) -> str:
    formatted_data = format_fair_route_to_text(fair_route_data)

    prompt_konteks = f"""
Anda adalah TobaRoute AI — Asisten Cerdas, Senior Travel Concierge, dan Kurator Budaya Kawasan Danau Toba (UNESCO Global Geopark).

Pengguna menyampaikan pertanyaan/rencana perjalanan:
"{user_query}"

BASIS PENGETAHUAN ENSIKLOPEDIA DANAU TOBA:
{DANAU_TOBA_KNOWLEDGE_BASE}

DATA DESTINASI & STATISTIK DATABASE TERVERIFIKASI:
{formatted_data}

PANDUAN MENJAWAB & GAYA BAHASA CERDAS:
1. ATURAN JIKA PERTANYAAN KUANTITAS / JUMLAH:
   - Jika pengguna menanyakan "berapa banyak", "jumlah", atau rekapitulasi tempat (misal: "berapa banyak lokasi wisata di Balige?"), Anda WAJIB MENYEBUTKAN ANGKA PASTI DARI DATA STATISTIK RESMI DI ATAS SECARA LENGKAP PADA AWAL KALIMAT (sebutkan total dan rincian per kategori wisata, kuliner, UMKM, dan penginapan), baru uraikan contoh-contoh unggulannya.
2. ATURAN JIKA PERTANYAAN UMUM / RANDOM / DILUAR TOBA:
3. ATURAN JIKA PERTANYAAN WISATA / KULINER / ITINERARY:
   - Sajikan ulasan yang MENDALAM, ELEGAN, dan TERSTRUKTUR RAPI menggunakan Markdown (heading `###`, bullet points `-`, dan **bold** pada nama tempat).
   - Rangkai rencana perjalanan per jam (misal: Pagi 08.00 - 09.30, Siang 10.00 - 12.30, Makan Siang 13.00 - 14.30, Sore 15.30 - 17.30, Malam 19.00 - 21.00) dan per hari jika multi-hari.
   - Cantumkan estimasi prakiraan cuaca mikro kaldera Toba (suhu ~22-25°C, kondisi angin danau sejuk) dan tips pakaian/outfit yang nyaman untuk setiap aktivitas.
   - Jelaskan keunikan tempat, latar belakang budaya/sejarah, pengalaman terbaik yang dapat dirasakan, panduan kuliner lokal (Mie Gomak, Kopi Lintong, Ombusombus, Arsik, dll.), serta tips transportasi/penyeberangan feri jika relevan.
4. ATURAN PENTING: DILARANG KERAS MENGGUNAKAN SIMBOL EMOJI:
   - DILARANG KERAS menggunakan simbol emoji apa pun (seperti 🌊, 🏛️, 🍽️, 📍, 💡, ✨, 🌿, ☕, ⭐, 🚗, dll.) baik pada judul heading Markdown maupun isi narasi. Gunakan tipografi teks editorial yang bersih, formal, elegan, dan profesional.
5. Awali sapaan hangat dan sopan (misal "Horas!").
"""
    
    try:
        response = client.models.generate_content(
            model='gemini-2.0-flash',
            contents=prompt_konteks,
        )
        return response.text
    except Exception as e:
        print(f"[AI Error] Gagal menghubungi Gemini API: {e}")
        try:
            response = client.models.generate_content(
                model='gemini-1.5-flash',
                contents=prompt_konteks,
            )
            return response.text
        except Exception as e2:
            print(f"[AI Error] Fallback Gemini API gagal: {e2}")
            return "Horas! Asisten AI TobaRoute siap membantu merencanakan rute Anda. Silakan jelajahi kartu destinasi dan peta interaktif di layar."

# ====================================================================================================
# FUNGSI: calc_distance_km (Haversine)
# ====================================================================================================
def calc_distance_km(lat1, lon1, lat2, lon2):
    if lat1 is None or lon1 is None or lat2 is None or lon2 is None:
        return 999999.0
    try:
        import math
        lat1, lon1, lat2, lon2 = float(lat1), float(lon1), float(lat2), float(lon2)
        R = 6371.0
        dlat = math.radians(lat2 - lat1)
        dlon = math.radians(lon2 - lon1)
        a = math.sin(dlat / 2)**2 + math.cos(math.radians(lat1)) * math.cos(math.radians(lat2)) * math.sin(dlon / 2)**2
        c = 2 * math.atan2(math.sqrt(a), math.sqrt(1 - a))
        return R * c
    except Exception:
        return 999999.0

# ====================================================================================================
# FUNGSI: chat_with_bot
# PENJELASAN:
# Chatbot percakapan cerdas yang bertindak sebagai Universal AI Assistant (seperti ChatGPT/Gemini)
# dengan keahlian mendalam ensiklopedia Danau Toba, budaya Batak, rute navigasi, dan integrasi database live.
# ====================================================================================================
def clean_norm(t: str) -> str:
    if not t:
        return ""
    import re
    return re.sub(r'[^a-z0-9]', '', t.lower())

# KABUPATEN / PULAU MAPPINGS (Mencakup seluruh kecamatan pembentuknya di Kawasan Danau Toba)
KABUPATEN_MAPPINGS = {
    'samosir': ['samosir', 'pangururan', 'simanindo', 'harian', 'sianjur mulamula', 'onan runggu', 'palipi', 'ronggur nihuta'],
    'pulau samosir': ['samosir', 'pangururan', 'simanindo', 'harian', 'sianjur mulamula', 'onan runggu', 'palipi', 'ronggur nihuta'],
    'kabupaten samosir': ['samosir', 'pangururan', 'simanindo', 'harian', 'sianjur mulamula', 'onan runggu', 'palipi', 'ronggur nihuta'],
    'toba': ['toba', 'balige', 'laguboti', 'sigumpar', 'porsea', 'silaen', 'tampahan', 'lumban julu', 'ajibata'],
    'kabupaten toba': ['toba', 'balige', 'laguboti', 'sigumpar', 'porsea', 'silaen', 'tampahan', 'lumban julu', 'ajibata'],
    'tapanuli utara': ['tapanuli utara', 'tarutung', 'muara', 'sipoholon', 'siatas barita', 'siborongborong'],
    'taput': ['tapanuli utara', 'tarutung', 'muara', 'sipoholon', 'siatas barita', 'siborongborong'],
    'humbang hasundutan': ['humbang hasundutan', 'humbahas', 'doloksanggul', 'baktiraja', 'pollung', 'lintong nihuta'],
    'humbahas': ['humbang hasundutan', 'humbahas', 'doloksanggul', 'baktiraja', 'pollung', 'lintong nihuta'],
    'simalungun': ['simalungun', 'parapat', 'girsang sipangan bolon', 'haranggaol'],
    'karo': ['karo', 'berastagi', 'tongging', 'merek'],
    'dairi': ['dairi', 'sidikalang', 'silahisabungan', 'silalahi']
}

KEY_LANDMARKS_MAP = {
    'hutaginjang': 'huta ginjang',
    'huta ginjang': 'huta ginjang',
    'puncak huta ginjang': 'huta ginjang',
    'holbung': 'bukit holbung',
    'bukit holbung': 'bukit holbung',
    'sipinsur': 'geosite sipinsur',
    'geosite sipinsur': 'geosite sipinsur',
    'bulbul': 'pantai lumban bulbul',
    'lumban bulbul': 'pantai lumban bulbul',
    'tb silalahi': 'museum batak tb silalahi',
    'tbsilalahi': 'museum batak tb silalahi',
    'meat': 'desa wisata meat',
    'desa meat': 'desa wisata meat',
    'desa wisata meat': 'desa wisata meat',
    'siallagan': 'batu kursi siallagan',
    'huta siallagan': 'batu kursi siallagan',
    'batu kursi': 'batu kursi siallagan',
    'tomok': 'desa wisata tomok',
    'desa tomok': 'desa wisata tomok',
    'huta raja': 'kampung ulos huta raja',
    'hutaraja': 'kampung ulos huta raja',
    'aek rangat': 'pemandian air panas aek rangat',
    'aekrangat': 'pemandian air panas aek rangat',
    'efrata': 'air terjun efrata',
    'situmurun': 'air terjun situmurun',
    'binangalom': 'air terjun binangalom',
    'sipisopiso': 'air terjun sipiso-piso',
    'sipiso piso': 'air terjun sipiso-piso',
    'bakkara': 'lembah bakkara',
    'tano ponggol': 'jembatan tano ponggol',
    'tanoponggol': 'jembatan tano ponggol',
    'salib kasih': 'wisata rohani salib kasih',
    'salibkasih': 'wisata rohani salib kasih',
    'parbubu': 'pemandian air soda parbubu',
    'air soda': 'pemandian air soda parbubu',
    'sidihoni': 'danau sidihoni',
    'aek natonang': 'danau aek natonang',
    'singgolom': 'bukit singgolom',
    'tara bunga': 'bukit tara bunga',
    'tarabunga': 'bukit tara bunga',
    'pahoda': 'bukit pahoda',
    'parbaba': 'pantai pasir putih parbaba',
    'parparean': 'pantai parparean porsea',
    'taman eden': 'taman eden 100',
    'siguragura': 'air terjun sigura-gura',
    'sigura gura': 'air terjun sigura-gura',
    'batikta': 'batikta',
    'tele': 'menara pandang tele'
}

# ====================================================================================================
# FUNGSI: chat_with_bot
# PENJELASAN:
# Chatbot percakapan cerdas yang bertindak sebagai Universal AI Assistant (seperti ChatGPT/Gemini)
# dengan keahlian mendalam ensiklopedia Danau Toba, budaya Batak, rute navigasi, dan integrasi database live.
# ====================================================================================================
def chat_with_bot(user_message: str, history: list, db = None) -> dict:
    db_context_text = ""
    matched_kec = None
    matched_places = []
    
    try:
        from app.database import SessionLocal
        from app import models

        db_session = db if db is not None else SessionLocal()
        msg_lower = user_message.lower()
        norm_msg = clean_norm(msg_lower)

        all_dests = db_session.query(models.Destinasi).all()
        total_global = len(all_dests)

        # Cek intent kategori dari pesan pengguna
        is_coffee_req = any(k in msg_lower for k in ['kopi', 'cafe', 'kafe', 'nongkrong', 'ngopi'])
        is_food_req = any(k in msg_lower for k in ['makan', 'kuliner', 'mie gomak', 'resto', 'lapo', 'arsik', 'naniura', 'sarapan', 'malam'])
        is_umkm_req = any(k in msg_lower for k in ['umkm', 'oleh', 'ulos', 'souvenir', 'belanja', 'kerajinan', 'tenun'])
        is_hotel_req = any(k in msg_lower for k in ['hotel', 'penginapan', 'homestay', 'resort', 'menginap', 'villa'])

        # TAHAP 1: Deteksi Nama Tempat / Destinasi Spesifik / Landmark (misal: "Huta Ginjang", "Sipinsur", "Bukit Holbung", dll)
        matched_target_dest = None

        # 1A. Cari via KEY_LANDMARKS_MAP (menangani variasi tanpa spasi seperti "hutaginjang", "bukitholbung", dll)
        for k_alias, k_target in KEY_LANDMARKS_MAP.items():
            if k_alias in msg_lower or clean_norm(k_alias) in norm_msg:
                # Cari destinasi yang mengandung k_target di namanya
                for d in all_dests:
                    d_nama_low = (d.nama or '').lower()
                    if k_target in d_nama_low or clean_norm(k_target) in clean_norm(d_nama_low):
                        matched_target_dest = d
                        break
                if matched_target_dest:
                    break

        # 1B. Jika belum ketemu, periksa kecocokan nama destinasi langsung di database (dengan normalisasi string)
        if not matched_target_dest:
            best_match_len = 0
            stop_words = {'wisata', 'pantai', 'hotel', 'resto', 'taman', 'kopi', 'kafe', 'desa', 'bukit', 'air', 'danau'}
            for d in all_dests:
                nd = clean_norm(d.nama)
                if len(nd) >= 5 and nd not in stop_words and nd in norm_msg:
                    if len(nd) > best_match_len:
                        matched_target_dest = d
                        best_match_len = len(nd)

        # TAHAP 2: Jika Destinasi Spesifik Ditemukan
        if matched_target_dest:
            matched_kec = matched_target_dest.kecamatan
            matched_places = [matched_target_dest]

            # Cari tempat kuliner / kopi / UMKM / wisata sekitar dalam radius 15-20 km
            nearby_list = []
            if matched_target_dest.latitude and matched_target_dest.longitude:
                for d in all_dests:
                    if d.id == matched_target_dest.id or not d.latitude or not d.longitude:
                        continue
                    dist = calc_distance_km(matched_target_dest.latitude, matched_target_dest.longitude, d.latitude, d.longitude)
                    if dist <= 20.0:
                        d_cat = (d.kategori or '').lower()
                        d_desc = d.deskripsi_singkat or ''
                        d_text = (d.nama + ' ' + d_desc + ' ' + d_cat).lower()
                        
                        tier = 3
                        if is_coffee_req and ('kopi' in d_text or 'cafe' in d_text or 'kedai' in d_text):
                            tier = 0
                        elif is_food_req and ('kuliner' in d_cat or 'makan' in d_cat or 'resto' in d_cat):
                            tier = 0
                        elif is_umkm_req and ('umkm' in d_cat or 'oleh' in d_cat or 'ulos' in d_cat):
                            tier = 0
                        elif 'kuliner' in d_cat or 'umkm' in d_cat:
                            tier = 1

                        score = (tier, dist, -float(d.rating or 4.0))
                        nearby_list.append((score, d, dist))

                nearby_list.sort(key=lambda x: x[0])
                matched_places += [item[1] for item in nearby_list[:4]]

            db_context_text += f"""
=== DATA DESTINASI UTAMA YANG DICARI PENGGUNA ===
Nama Destinasi: {matched_target_dest.nama}
Kategori: {matched_target_dest.kategori}
Kecamatan: {matched_target_dest.kecamatan}
Alamat / Jalan: {matched_target_dest.nama_jalan}
Rating: {matched_target_dest.rating} ({matched_target_dest.jumlah_ulasan} ulasan)
Ringkasan: {matched_target_dest.deskripsi_singkat}
Detail Fasilitas/Rute: {matched_target_dest.deskripsi_lengkap}

=== REKOMENDASI TEMPAT SEKITAR (KULINER/KOPI/UMKM) ===
"""
            for idx, p in enumerate(matched_places[1:], 1):
                db_context_text += f"{idx}. {p.nama} ({p.kategori}) - Wilayah: {p.kecamatan} - Alamat: {p.nama_jalan} | Info: {p.deskripsi_singkat}\n"

        else:
            # TAHAP 3: Deteksi Wilayah Kabupaten / Pulau (misal: Samosir, Toba, Taput, Humbahas, Simalungun, Karo, Dairi)
            matched_kab = None
            for kab_key in sorted(KABUPATEN_MAPPINGS.keys(), key=lambda x: len(x), reverse=True):
                if kab_key in msg_lower or clean_norm(kab_key) in norm_msg:
                    matched_kab = kab_key
                    break

            if matched_kab:
                sub_kecs = KABUPATEN_MAPPINGS[matched_kab]
                region_label = matched_kab.title()
                matched_kec = region_label

                region_items = [d for d in all_dests if (d.kecamatan or '').strip().lower() in sub_kecs]
                wisata_items = [d for d in region_items if 'wisata' in (d.kategori or '').lower()]
                kuliner_items = [d for d in region_items if any(k in (d.kategori or '').lower() for k in ['kuliner', 'makan', 'resto', 'cafe', 'kopi'])]
                umkm_items = [d for d in region_items if any(k in (d.kategori or '').lower() for k in ['umkm', 'oleh', 'ulos', 'kerajinan', 'toko'])]
                penginapan_items = [d for d in region_items if any(k in (d.kategori or '').lower() for k in ['penginapan', 'hotel', 'homestay', 'resort'])]

                if is_coffee_req or is_food_req:
                    selected = sorted(kuliner_items, key=lambda d: float(d.rating or 4.0), reverse=True)[:6]
                elif is_umkm_req:
                    selected = sorted(umkm_items, key=lambda d: float(d.rating or 4.0), reverse=True)[:6]
                elif is_hotel_req:
                    selected = sorted(penginapan_items, key=lambda d: float(d.rating or 4.0), reverse=True)[:6]
                else:
                    top_w = sorted(wisata_items, key=lambda d: float(d.rating or 4.0), reverse=True)[:4]
                    top_k = sorted(kuliner_items, key=lambda d: float(d.rating or 4.0), reverse=True)[:2]
                    top_u = sorted(umkm_items, key=lambda d: float(d.rating or 4.0), reverse=True)[:2]
                    selected = top_w + top_k + top_u

                matched_places = selected if selected else sorted(region_items, key=lambda d: float(d.rating or 4.0), reverse=True)[:6]

                db_context_text += f"""
=== DATA STATISTIK RESMI DATABASE TOBAROUTE AI (WILAYAH/KABUPATEN {region_label.upper()}) ===
Wilayah Target: {region_label} (Mencakup Kecamatan: {', '.join([k.title() for k in sub_kecs if k != matched_kab])})
- Total Tempat Terdaftar: {len(region_items)} tempat (dari total {total_global} tempat di seluruh Kawasan Danau Toba)
- Rincian per Kategori:
  * Destinasi Wisata Alam & Budaya: {len(wisata_items)} lokasi (Contoh Unggulan: {', '.join([d.nama for d in wisata_items[:5]]) if wisata_items else 'Destinasi wisata'})
  * Rumah Makan & Kuliner Khas: {len(kuliner_items)} lokasi (Contoh Unggulan: {', '.join([d.nama for d in kuliner_items[:5]]) if kuliner_items else 'Kuliner khas'})
  * Sentra Pengrajin UMKM & Tenun Ulos: {len(umkm_items)} lokasi (Contoh Unggulan: {', '.join([d.nama for d in umkm_items[:5]]) if umkm_items else 'Sentra UMKM'})
  * Penginapan & Homestay: {len(penginapan_items)} lokasi (Contoh Unggulan: {', '.join([d.nama for d in penginapan_items[:4]]) if penginapan_items else 'Penginapan'})
"""

            else:
                # TAHAP 4: Deteksi Kecamatan Spesifik (24 Kecamatan)
                known_kecamatans = [
                    "balige", "laguboti", "sigumpar", "porsea", "silaen", "tampahan", 
                    "lumban julu", "ajibata", "parapat", "girsang sipangan bolon", 
                    "pangururan", "simanindo", "harian", "sianjur mulamula", "onan runggu", 
                    "palipi", "ronggur nihuta", "muara", "baktiraja", "doloksanggul", 
                    "pollung", "berastagi", "sidikalang", "tarutung", "silahisabungan"
                ]

                matched_kec_key = None
                for k in known_kecamatans:
                    if k in msg_lower or clean_norm(k) in norm_msg:
                        matched_kec_key = k
                        matched_kec = k.title()
                        break

                if matched_kec_key:
                    kec_items = [d for d in all_dests if (d.kecamatan or '').strip().lower() == matched_kec_key]
                    wisata_items = [d for d in kec_items if 'wisata' in (d.kategori or '').lower()]
                    kuliner_items = [d for d in kec_items if any(k in (d.kategori or '').lower() for k in ['kuliner', 'makan', 'resto', 'cafe', 'kopi'])]
                    umkm_items = [d for d in kec_items if any(k in (d.kategori or '').lower() for k in ['umkm', 'oleh', 'ulos', 'kerajinan', 'toko'])]
                    penginapan_items = [d for d in kec_items if any(k in (d.kategori or '').lower() for k in ['penginapan', 'hotel', 'homestay', 'resort'])]

                    if is_coffee_req or is_food_req:
                        selected = sorted(kuliner_items, key=lambda d: float(d.rating or 4.0), reverse=True)[:6]
                    elif is_umkm_req:
                        selected = sorted(umkm_items, key=lambda d: float(d.rating or 4.0), reverse=True)[:6]
                    elif is_hotel_req:
                        selected = sorted(penginapan_items, key=lambda d: float(d.rating or 4.0), reverse=True)[:6]
                    else:
                        top_w = sorted(wisata_items, key=lambda d: float(d.rating or 4.0), reverse=True)[:4]
                        top_k = sorted(kuliner_items, key=lambda d: float(d.rating or 4.0), reverse=True)[:2]
                        top_u = sorted(umkm_items, key=lambda d: float(d.rating or 4.0), reverse=True)[:2]
                        selected = top_w + top_k + top_u

                    matched_places = selected if selected else sorted(kec_items, key=lambda d: float(d.rating or 4.0), reverse=True)[:6]

                    db_context_text += f"""
=== DATA STATISTIK RESMI DATABASE TOBAROUTE AI (KECAMATAN {matched_kec.upper()}) ===
Wilayah Target: Kecamatan {matched_kec}
- Total Tempat Terdaftar: {len(kec_items)} tempat (dari total {total_global} tempat di seluruh Danau Toba)
- Rincian per Kategori:
  * Destinasi Wisata Alam & Budaya: {len(wisata_items)} lokasi (Contoh: {', '.join([d.nama for d in wisata_items[:5]]) if wisata_items else 'Destinasi wisata lokal'})
  * Rumah Makan & Kuliner Khas: {len(kuliner_items)} lokasi (Contoh: {', '.join([d.nama for d in kuliner_items[:5]]) if kuliner_items else 'Kuliner khas lokal'})
  * Sentra Pengrajin UMKM & Tenun Ulos: {len(umkm_items)} lokasi (Contoh: {', '.join([d.nama for d in umkm_items[:5]]) if umkm_items else 'Sentra UMKM lokal'})
  * Penginapan & Homestay: {len(penginapan_items)} lokasi (Contoh: {', '.join([d.nama for d in penginapan_items[:4]]) if penginapan_items else 'Penginapan keluarga'})
"""

                else:
                    # TAHAP 5: Kueri Tematik / Pencarian Kata Kunci Global
                    db_context_text += f"""
=== DATA STATISTIK GLOBAL DATABASE TOBAROUTE AI ===
Total Lokasi Terdaftar di Seluruh 8 Kabupaten Kawasan Danau Toba: {total_global} lokasi
- Destinasi Wisata Alam, Budaya & 16 Geosite UNESCO
- Rumah Makan, Lapo Tradisional & Kuliner Khas (Mie Gomak, Naniura, Arsik, Kopi Lintong)
- Penginapan, Homestay Tepi Danau & Hotel Resort
- Sentra Pengrajin Tenun Ulos Tradisional & UMKM Oleh-Oleh
- Pelabuhan Feri & Dermaga Penyeberangan Danau
"""
                    keywords = ["mie gomak", "naniura", "arsik", "kopi", "ulos", "sipiso", "sipinsur", "holbung", "meat", "siallagan", "tomok", "sigura", "aek rangat", "batikta", "andaliman", "ombusombus", "makanan", "kuliner", "batak", "makan", "resto", "kafe", "lapo", "napinadar", "dali", "lappet", "wisata", "hotel", "penginapan"]
                    found_keywords = [kw for kw in keywords if kw in msg_lower or clean_norm(kw) in norm_msg]
                    if found_keywords:
                        matched_pool = []
                        for d in all_dests:
                            d_text = f"{d.nama} {d.deskripsi_singkat} {d.deskripsi_lengkap or ''} {d.kategori} {d.kecamatan}".lower()
                            if any(kw in d_text for kw in found_keywords):
                                matched_pool.append(d)
                        matched_places = sorted(matched_pool, key=lambda d: float(d.rating or 4.0), reverse=True)[:6]

                    if (is_food_req or 'makan' in msg_lower) and not matched_places:
                        kuliner_all = [d for d in all_dests if any(k in (d.kategori or '').lower() for k in ['kuliner', 'makan', 'resto', 'kafe', 'kopi'])]
                        matched_places = sorted(kuliner_all, key=lambda d: float(d.rating or 4.0), reverse=True)[:6]
                        matched_kec = "Balige & Sekitarnya"

        if db is None:
            db_session.close()
    except Exception as e:
        print(f"[Chatbot DB Context Warn] {e}")

    # ================================================================================================
    # INSTRUKSI SISTEM UNTUK GEMINI FLASH (UNIVERSAL INTELLIGENCE + DEEP CULTURAL CONCIERGE)
    # ================================================================================================
    system_instruction = f"""
Anda adalah TobaRoute AI — Asisten Cerdas Universal, Senior Travel Concierge, dan Master Pemandu Budaya Kawasan Danau Toba (UNESCO Global Geopark).

KEMAMPUAN UTAMA & PERAN MULTI-DIMENSI:
1. UNIVERSAL INTELLIGENCE (SEPERTI CHATGPT & GOOGLE GEMINI):
   - Anda adalah Large Language Model yang sangat cerdas, berwawasan luas, dan serbaguna.
   - JIKA pengguna bertanya tentang topik APAPUN di luar pariwisata Danau Toba (seperti: pengetahuan umum, sains, fisika, sejarah dunia, teknologi, pemrograman/coding, matematika, resep masakan umum, tips kehidupan, psikologi, perbandingan budaya, puisi, maupun pertanyaan santai/random):
     * ANDA WAJIB MENJAWAB DENGAN CERDAS, LENGKAP, AKURAT, DAN MENARIK!
     * DILARANG KERAS menolak pertanyaan atau mengatakan kalimat seperti "Maaf, pertanyaan ini di luar jangkauan saya". Jawablah pertanyaan pengguna dengan tuntas dan mendalam layaknya ChatGPT/Gemini!
     * Setelah memberikan jawaban yang memuaskan untuk topik umum, Anda dapat memberikan salam ramah khas atau menawarkan bantuan eksplorasi jika mereka ingin berlibur ke Danau Toba.

2. KEAHLIAN MENDALAM PARIWISATA, BUDAYA BATAK, KULINER & RUTE PERJALANAN (SANGAT PENTING):
   - JIKA pengguna meminta rekomendasi makanan, wisata, rute, atau bertanya tentang suatu wilayah (seperti Balige, Samosir, Parapat, Laguboti, dll.):
     * Berikan penjelasan yang SANGAT DETAIL, KAYA KONTEKS, EDUKATIF, dan MENGALIR INDAH DENGAN FORMAT KURASI RUTE PERJALANAN YANG SANGAT PROFESIONAL:
       1. Salam Hangat & Pengantar Kurasi Singkat.
       2. **Rute Navigasi & Titik yang Dilewati (Urutan Berurutan)**:
          - **Titik 1 (Start / Destinasi Utama / Sarapan Khas)**: [Nama Tempat] — [Wilayah/Alamat] — [Sajian andalan/daya tarik unik].
          - **Titik 2 (Kuliner Autentik Siang / Resto Sekitar)**: [Nama Tempat] — [Wilayah/Alamat] — [Cita rasa rempah andaliman / Keunikan menu].
          - **Titik 3 (Sentra Kerajinan / Oleh-Oleh Khas)**: [Nama Tempat] — [Wilayah/Alamat] — [Produk tenun ulos / Kudapan lokal].
          - **Titik 4 (Spot Santai / Senja Panorama Kaldera)**: [Nama Tempat] — [Wilayah/Alamat] — [Kopi Arabika lokal & Pemandangan danau].
       3. **Jalur Jalan Raya & Estimasi Perjalanan**:
          - Sebutkan jalur/jalan utama yang dilalui (misal: Jl. Lintas Sumatra, Jl. Tarutung, Jl. DR TD Pardede, dll.).
          - Berikan estimasi jarak total tempuh (~5-12 km) dan estimasi waktu berkendara (~15-30 menit antar titik).
          - Beri tahu pengguna bahwa **seluruh pin lokasi bernomor urut dan garis rute jalan raya resmi telah otomatis aktif di peta interaktif di samping**.

3. ITINERARY MULTI-DAY & BUDAYA:
   - Jika diminta ITINERARY (misal: "buatkan rencana 3 hari 2 malam", "trip keluarga dengan lansia", "backpacker hemat"):
     * Buatlah itinerary terstruktur lengkap dengan pembagian Waktu (Pagi, Siang, Sore, Malam), estimasi rute/waktu tempuh, rekomendasi kuliner lokal pendamping (Mie Gomak, Kopi Lintong, Ombusombus), tips pakaian/cuaca, dan estimasi logistik penyeberangan feri.
   - Jika ditanya tentang BUDAYA/SEJARAH (Dalihan Na Tolu, Ulos Ragidup/Sadum, Rumah Bolon Gorga, letusan kaldera 74.000 tahun silam, Si Raja Batak):
     * Uraikan secara filosofis dan historis dengan penjelasan yang mendalam, tidak setengah-setengah!

4. PRESISI JAWABAN KUANTITATIF & REKAPITULASI DATA:
   - JIKA pengguna menanyakan jumlah, berapa banyak lokasi, atau rekapitulasi data (misalnya: "berapa banyak lokasi wisata atau umkm di Balige?"):
     * ANDA WAJIB MENJAWAB DENGAN ANGKA PASTI DARI DATA STATISTIK RESMI DI BAWAH PADA KALIMAT PERTAMA (sebutkan total lokasi terdaftar dan rincian per kategori wisata, kuliner, UMKM, dan penginapan), baru kemudian rekomendasikan tempat-tempat populernya.

5. GAYA BAHASA & LARANGAN EMOJI (STRICT):
   - Ramah, sopan, berwibawa, dan hangat (bisa diawali dengan salam khas "Horas!").
   - DILARANG KERAS menggunakan simbol emoji atau emoticon apa pun (seperti 🌊, 🏛️, 🍽️, 📍, 💡, ✨, 🌿, ☕, ⭐, 🚗, dll.). Gunakan tipografi teks editorial yang bersih, formal, dan profesional.

DATA DATABASE SISTEM TOBAROUTE AI SAAT INI:
{db_context_text}

ENSIKLOPEDIA RESMI KAWASAN DANAU TOBA:
{DANAU_TOBA_KNOWLEDGE_BASE}
"""

    # Rangkai seluruh riwayat obrolan masa lalu
    chat_history_text = system_instruction + "\n\n=== RIWAYAT PERCAKAPAN SEBELUMNYA ===\n"
    if history:
        for msg in history:
            role_name = "Pengguna" if msg.get("role") in ["user", "human"] else "TobaRoute AI"
            chat_history_text += f"{role_name}: {msg.get('text', '')}\n"
    
    chat_history_text += f"\nPengguna: {user_message}\nTobaRoute AI:"

    try:
        response = client.models.generate_content(
            model='gemini-2.0-flash',
            contents=chat_history_text,
        )
        reply_text = response.text
    except Exception as e:
        print(f"[AI Error] Error in chat_with_bot: {e}")
        # Coba fallback model jika terjadi gangguan jaringan sementara
        try:
            response = client.models.generate_content(
                model='gemini-1.5-flash',
                contents=chat_history_text,
            )
            reply_text = response.text
        except Exception as e2:
            print(f"[AI Error] Fallback model error: {e2}")
            if matched_places:
                places_list = "\n".join([f"- **{p.nama}** ({p.kecamatan}): {p.deskripsi_singkat or p.kategori}" for p in matched_places])
                reply_text = f"Horas! Berikut adalah rekomendasi destinasi & kuliner pilihan TobaRoute AI untuk pencarian Anda:\n\n{places_list}\n\nSilakan klik atau jelajahi kartu informasi dan peta interaktif di layar untuk detail lebih lanjut."
            elif is_food_req or any(w in msg_lower for w in ["makanan", "kuliner", "batak", "makan", "lapo", "arsik", "naniura", "gomak"]):
                reply_text = """Horas! Berikut adalah rekomendasi kuliner autentik khas Batak Toba yang sangat populer di kawasan Danau Toba:

### 1. Dekke Naaniura (Sashimi Tradisional Batak)
Ikan mas mentah segar yang dimatangkan secara dingin menggunakan perasan asam jeruk jungga alami dan dibaluri rempah andaliman, unte, lengkuas, serta kemiri sangrai.

### 2. Ikan Mas Naniarsik (Arsik)
Sajian ikan mas berbumbu kuning kaya rempah andaliman, lokio (bawang batak), kecombrang (asam cikala), dan asam gelugur yang dimasak perlahan hingga kuahnya meresap.

### 3. Mie Gomak (Spaghetti Khas Toba)
Mie lidi kenyal disiram kuah santan kuning kaya rasa andaliman yang pedas getir hangat, atau digoreng gurih khas warung lokal.

### 4. Manuk Napinadar
Ayam kampung panggang yang disiram saus rempah andaliman pedas gurih yang meresap hangat.

### 5. Dali ni Horbo (Keju Tradisional Batak)
Olahan susu kerbau segar yang digumpalkan secara alami menggunakan perasan daun pepaya atau nenas, lalu dikukus hingga lembut gurih.

### 6. Kudapan Tradisional (Kue Ombusombus & Lappet)
Kue tepung beras ketan isi gula merah aren dan kelapa parut hangat berbungkus daun pisang khas Siborongborong & Balige.

Silakan jelajahi kartu destinasi kuliner dan peta interaktif TobaRoute AI di layar untuk menemukan lokasi rumah makan terdekat!"""
            else:
                reply_text = "Horas! Asisten TobaRoute AI siap membantu Anda menjelajahi kawasan Danau Toba. Anda dapat menanyakan tentang kuliner khas Batak, tempat wisata di Balige, rute feri Samosir, hingga informasi kebudayaan."

    return {
        "reply": reply_text,
        "recommended_places": matched_places,
        "target_kecamatan": matched_kec
    }

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
            model='gemini-2.5-flash',
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
