import os
from pathlib import Path
from dotenv import load_dotenv
from google import genai

# Load environment variables from .env using absolute path
BASE_DIR = Path(__file__).resolve().parent.parent
dotenv_path = BASE_DIR / ".env"
load_dotenv(dotenv_path=dotenv_path, override=True)

# Fetch the Gemini API key from the environment
api_key = os.getenv("GEMINI_API_KEY")

# Inisialisasi klien dengan API Key yang didapatkan dari .env
client = genai.Client(api_key=api_key)

def format_fair_route_to_text(fair_route_data: dict) -> str:
    """
    Mengubah objek SQLAlchemy/dict menjadi teks deskriptif yang mudah dibaca oleh LLM Gemini
    sehingga Gemini tidak menghasilkan placeholder tanda kurung seperti [Nama UMKM].
    """
    dest_utama = fair_route_data.get("destinasi_utama", [])
    umkm_sekitar = fair_route_data.get("rekomendasi_umkm_sekitar", [])
    
    text = "=== DATA DESTINASI UTAMA ===\n"
    if dest_utama:
        for idx, d in enumerate(dest_utama, 1):
            nama = getattr(d, 'nama', '') if hasattr(d, 'nama') else d.get('nama', '')
            kecamatan = getattr(d, 'kecamatan', '') if hasattr(d, 'kecamatan') else d.get('kecamatan', '')
            nama_jalan = getattr(d, 'nama_jalan', '') if hasattr(d, 'nama_jalan') else d.get('nama_jalan', '')
            deskripsi = getattr(d, 'deskripsi_singkat', '') if hasattr(d, 'deskripsi_singkat') else d.get('deskripsi_singkat', '')
            text += f"{idx}. Nama: {nama} | Kecamatan: {kecamatan} | Alamat: {nama_jalan} | Info: {deskripsi}\n"
    else:
        text += "Tidak ada destinasi utama khusus.\n"

    text += "\n=== DATA REKOMENDASI UMKM & KULINER SIKITAR ===\n"
    if umkm_sekitar:
        for idx, u in enumerate(umkm_sekitar, 1):
            nama = getattr(u, 'nama', '') if hasattr(u, 'nama') else u.get('nama', '')
            kecamatan = getattr(u, 'kecamatan', '') if hasattr(u, 'kecamatan') else u.get('kecamatan', '')
            nama_jalan = getattr(u, 'nama_jalan', '') if hasattr(u, 'nama_jalan') else u.get('nama_jalan', '')
            deskripsi = getattr(u, 'deskripsi_singkat', '') if hasattr(u, 'deskripsi_singkat') else u.get('deskripsi_singkat', '')
            text += f"{idx}. Nama: {nama} | Kecamatan: {kecamatan} | Alamat: {nama_jalan} | Info: {deskripsi}\n"
    else:
        text += "Tidak ada rekomendasi UMKM khusus.\n"
        
    return text

def generate_tourist_response(user_query: str, fair_route_data: dict) -> str:
    """
    Fungsi untuk menyusun jawaban ramah bagi wisatawan menggunakan arsitektur RAG.
    Menggabungkan pertanyaan user dengan data rute yang sudah disaring adil oleh backend.
    """
    formatted_data = format_fair_route_to_text(fair_route_data)

    # Menyusun prompt instruksi (System Instruction) agar Gemini bertindak sebagai pemandu Toba yang bijak
    prompt_konteks = f"""
    Anda adalah TobaRoute AI, asisten pemandu wisata pintar dan ramah untuk kawasan Danau Toba.
    Wisatawan bertanya: "{user_query}"
    
    Berikut adalah DATA RIIL destinasi dan UMKM lokal terdekat dari database kami:
    {formatted_data}
    
    Tugas Anda:
    1. Jawab pertanyaan wisatawan dengan gaya bahasa yang ramah, hangat, informatif, dan manusiawi.
    2. SEBUTKAN NAMA ASLI destinasi utama dan UMKM lokal dari data di atas secara gamblang dalam paragraf narasi Anda. 
    3. DILARANG KERAS menggunakan teks placeholder dalam tanda kurung siku seperti [Nama UMKM 1], [Nama Destinasi], atau sejenisnya! Wajib gunakan NAMA ASLI tempat dari data di atas.
    4. Jelaskan rute atau cara mencapai tempat-tempat tersebut secara alami. Jangan memberikan koordinat angka mentah.
    """
    
    try:
        response = client.models.generate_content(
            model='gemini-3.1-flash-lite',
            contents=prompt_konteks,
        )
        return response.text
    except Exception as e:
        print(f"[AI Error] Gagal menghubungi Gemini API: {e}")
        return "Mohon maaf, asisten AI sedang sibuk. Silakan lihat kartu rekomendasi destinasi dan UMKM di bawah ini."

def chat_with_bot(user_message: str, history: list) -> str:
    """
    Fungsi untuk ngobrol secara interaktif (Chatbot).
    """
    system_instruction = (
        "Anda adalah TobaRoute AI, asisten pemandu wisata Danau Toba yang ramah, hangat, dan sangat berpengetahuan luas. "
        "Selalu sebutkan nama asli tempat wisata dan UMKM lokal secara spesifik. DILARANG KERAS memakai placeholder seperti [Nama UMKM]. Jawab dalam bahasa Indonesia yang natural."
    )
    
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
