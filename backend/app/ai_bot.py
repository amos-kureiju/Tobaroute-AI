import os
from pathlib import Path
from dotenv import load_dotenv
from google import genai

# Load environment variables from .env using absolute path
BASE_DIR = Path(__file__).resolve().parent.parent
dotenv_path = BASE_DIR / ".env"
load_dotenv(dotenv_path=dotenv_path, override=False)

# Fetch the Gemini API key from the environment
api_key = os.getenv("GEMINI_API_KEY")

# Inisialisasi klien dengan API Key yang didapatkan dari .env
client = genai.Client(api_key=api_key)

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

def format_fair_route_to_text(fair_route_data: dict) -> str:
    dest_utama = fair_route_data.get("destinasi_utama", [])
    umkm_sekitar = fair_route_data.get("rekomendasi_umkm_sekitar", [])
    
    text = "=== DATA DESTINASI UTAMA (REKOMENDASI SISTEM GEOFENCE) ===\n"
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

def generate_tourist_response(user_query: str, fair_route_data: dict) -> str:
    formatted_data = format_fair_route_to_text(fair_route_data)

    prompt_konteks = f"""
Anda adalah TobaRoute AI — Senior Travel Concierge, Pemandu Budaya, dan Kurator Pariwisata Berkelanjutan Resmi Kawasan Danau Toba (UNESCO Global Geopark).

Wisatawan menyampaikan rencana/pertanyaan perjalanan:
"{user_query}"

SUMBER PENGETAHUAN BUDAYA & GEOGRAFI KAWASAN TOBA:
{DANAU_TOBA_KNOWLEDGE_BASE}

DATA DESTINASI & UMKM TERVERIFIKASI SISTEM GEOFENCE KAMI:
{formatted_data}

PANDUAN PENULISAN & GAYA BAHASA PROFESIONAL:
1. Awali dengan sambutan hangat dan berkarakter khas Toba: "Horas! ..." lalu berikan gambaran pembuka yang memikat mengenai keistimewaan rute yang dipilih.
2. Sajikan ulasan yang KAYA KONTEKS, EDUKATIF, dan BERKUALITAS TINGGI (jangan gunakan template kaku seperti "Kategori: ... Detail: ...", melainkan gunakan narasi yang mengalir, kaya wawasan sejarah/alam, dan terstruktur rapi dengan Markdown).
3. Struktur Rekomendasi yang Wajib Diterapkan:
   - **Rangkaian Destinasi Unggulan**: Jelaskan masing-masing tempat utama yang ada pada data, soroti daya tarik keindahan alam, nilai sejarah/budayanya, pengalaman terbaik yang bisa dirasakan wisatawan, serta tips waktu berkunjung ideal.
   - **Kemitraan UMKM & Gastronomi Lokal Sekitar**: Pasangkan kunjungan wisata dengan UMKM kuliner atau kerajinan tangan lokal di sekitarnya (seperti mencicipi Mie Gomak beraroma andaliman hangat, kopi Arabika Lintong, kue ombus-ombus, atau melihat sentra tenun Ulos).
   - **Tips Cerdas & Etika Berwisata (Travel Concierge Insights)**: Berikan saran praktis mengenai waktu tempuh, kenyamanan berpakaian, serta etika menghormati kearifan lokal masyarakat Batak.
4. ATURAN INTEGRITAS KETAT:
   - HANYA gunakan nama-nama tempat asli yang tercantum pada data di atas.
   - JIKA wisatawan bertanya tentang makanan/kuliner tertentu (misal: Naniarsik, Mie Gomak, Halal food), pastikan HANYA merekomendasikan UMKM/Rumah Makan yang relevan. JANGAN PERNAH merekomendasikan pantai atau air terjun sebagai tempat makan! Jelaskan nilai kuliner tersebut dengan referensi ensiklopedia di atas.
   - Tutup dengan kalimat ramah yang mengundang interaksi eksplorasi lanjutan.
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

def chat_with_bot(user_message: str, history: list) -> str:
    system_instruction = f"""
Anda adalah TobaRoute AI, Senior Travel Concierge & Duta Wisata Kawasan Danau Toba.
Anda memiliki pengetahuan mendalam tentang sejarah kaldera vulkanik Toba (UNESCO Global Geopark), falsafah adat Dalihan Na Tolu, motif kain tenun Ulos, seni ukir Gorga, kuliner khas autentik (Naniarsik, Naniura, Mie Gomak, Manuk Napinadar, Kopi Lintong, Ombusombus), serta rute navigasi darat & danau di 8 kabupaten lingkar Toba.

PANDUAN MERESPONS:
- Sambut dengan hangat dan sopan ("Horas!").
- Berikan jawaban yang kaya konteks, terstruktur rapi, elegan, berwawasan budaya, dan langsung menjawab esensi pertanyaan wisatawan.
- Gunakan format Markdown yang bersih (**bold** untuk poin penting).
- Pastikan selalu menyebutkan nama tempat dan kuliner secara autentik tanpa placeholder.

ENSIKLOPEDIA KAWASAN:
{DANAU_TOBA_KNOWLEDGE_BASE}
"""
    
    chat_history_text = system_instruction + "\n\n"
    for msg in history:
        role_name = "Wisatawan" if msg["role"] == "user" else "TobaRoute AI"
        chat_history_text += f"{role_name}: {msg['text']}\n"
    
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

import json

def generate_heuristic_insight(nama: str, kecamatan: str, kategori: str, deskripsi_singkat: str) -> dict:
    """Fallback lokal yang kaya konteks jika Gemini API offline/terkendala kuota."""
    nama_lower = (nama or "").lower()
    kat_lower = (kategori or "").lower()
    desk_lower = (deskripsi_singkat or "").lower()

    if any(k in nama_lower or k in kat_lower or k in desk_lower for k in ["ulos", "tenun", "songket"]):
        return {
            "storytelling": f"Sentra kerajinan tangan di {kecamatan} ini mempertahankan warisan luhur tradisi tenun Batak secara turun-temurun, di mana setiap lembar kain Ulos ditenun dengan ketelitian tinggi dan sarat makna berkat serta kehangatan adat.",
            "must_try": "Melihat langsung proses merajut motif Ulos tradisional (seperti Sadum atau Ragi Hotang) serta membeli kain tenun asli langsung dari tangan pengrajin warga setempat.",
            "travel_tips": "Disarankan berkunjung pada pagi atau siang hari saat pengrajin aktif menenun. Anda juga dapat berkonsultasi mengenai makna filosofis setiap motif ulos.",
            "highlight_tags": ["Tenun Tangan Asli", "Pemberdayaan UMKM", "Warisan Budaya Batak"]
        }
    elif any(k in nama_lower or k in desk_lower for k in ["gula", "aren", "palm sugar", "nira"]):
        return {
            "storytelling": f"Diproduksi secara higienis dari sadapan pohon enau alami di perbukitan {kecamatan} tanpa tambahan zat kimia pengawet, menghasilkan cita rasa manis karamel legit yang beraroma harum alami khas tanah vulkanik Toba.",
            "must_try": "Membeli gula aren cetak murni dan sirup aren alami yang sangat cocok sebagai pemanis kopi Arabika Toba atau bahan baku kue tradisional.",
            "travel_tips": "Simpan di tempat sejuk dan kedap udara agar kualitas keaslian rasa dan aromanya tetap terjaga prima.",
            "highlight_tags": ["100% Nira Aren Murni", "Tanpa Pengawet", "Produksi Rumahan Warga"]
        }
    elif any(k in kat_lower or k in nama_lower for k in ["kuliner", "makan", "resto", "kopi", "cafe", "warung"]):
        return {
            "storytelling": f"Destinasi kuliner autentik di kawasan {kecamatan} yang menghidangkan kekayaan bumbu rempah tradisional khas Batak Toba (seperti andaliman, asam cikala, dan lokio) yang dimasak segar setiap hari.",
            "must_try": "Mencicipi sajian andalan hangat yang diracik dengan bumbu rempah andaliman segar untuk pengalaman gastronomi Danau Toba yang tak terlupakan.",
            "travel_tips": "Waktu terbaik berkunjung adalah menjelang jam makan siang (11.30 - 13.30 WIB) untuk menikmati sajian yang baru matang.",
            "highlight_tags": ["Rempah Andaliman Segar", "Kuliner Khas Autentik", "Bahan Segar Lokal"]
        }
    elif any(k in kat_lower or k in nama_lower for k in ["penginapan", "hotel", "homestay", "resort"]):
        return {
            "storytelling": f"Akomodasi berkonsep ramah keluarga di {kecamatan} yang menawarkan suasana menginap tenang dengan udara sejuk dan pemandangan asri bentang kaldera Danau Toba.",
            "must_try": "Menikmati secangkir kopi hangat di pagi hari sambil menyaksikan kabut dan matahari terbit di atas perairan Danau Toba.",
            "travel_tips": "Lakukan konfirmasi pemesanan terlebih dahulu terutama saat akhir pekan atau musim liburan.",
            "highlight_tags": ["Udara Sejuk Pegunungan", "Suasana Tenang", "Akses Strategis"]
        }
    else:
        return {
            "storytelling": f"Destinasi unggulan di wilayah {kecamatan} yang menyuguhkan keindahan panorama alam kaldera Danau Toba (UNESCO Global Geopark) dengan suasana damai yang sangat asri.",
            "must_try": "Menikmati pemandangan bentang alam danau dari sudut pandang terbaik, berfoto di spot panorama alami, dan menikmati ketenangan alam.",
            "travel_tips": "Gunakan pakaian santai yang nyaman dan bawa jaket ringan karena embusan angin danau yang sejuk di pagi/sore hari.",
            "highlight_tags": ["UNESCO Geopark", "Spot Foto Eksotis", "Panorama Alam Asri"]
        }

def generate_destination_ai_insight(nama: str, kecamatan: str, kategori: str, deskripsi_singkat: str, nama_jalan: str = "") -> dict:
    """
    Menghasilkan ulasan mendalam, wawasan budaya, tips wisatawan, dan keunggulan otentik
    berbasis Gemini AI untuk kartu destinasi/UMKM agar tidak kosong dan kaya konteks.
    """
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

