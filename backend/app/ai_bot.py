# ====================================================================================================
# FILE: backend/app/ai_bot.py
# TUJUAN & PENJELASAN ARSITEKTUR:
# File ini berfungsi sebagai modul kecerdasan buatan utama (AI Engine) TobaRoute.
# Menggunakan Google GenAI SDK dengan model 'gemini-3.1-flash-lite' & fallback 'gemini-3.6-flash'.
#
# BAGAIMANA SISTEM RAG & ASISTEN WISATAWAN PRAKTIS BEKERJA?
# 1. RETRIEVAL (Pengambilan Data): Database SQL & Vektor mencari entitas, statistik wilayah, & POI relevan.
# 2. PRACTICAL INTENT AUGMENTATION: Mendeteksi pertanyaan praktis pelancong (Transportasi Silangit/Kualanamu,
#    Jadwal Feri, Sewa Motor/Mobil, Estimasi Biaya, Kuliner Halal, Sentra Ulos, Cuaca, Kontak Darurat).
# 3. ENSIKLOPEDIA & REAL-WORLD LOGISTICS: Menyediakan informasi logistik nyata dan mendalam.
# 4. GENERATION (Pembuatan Respon): Model LLM Gemini menyusun respons yang sangat kaya, terstruktur,
#    faktual, serta fleksibel untuk menjawab SEGALA pertanyaan pengguna layaknya Senior Travel Concierge.
# ====================================================================================================

import os
import json
import math
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
# BASIS PENGETAHUAN ENSIKLOPEDIA RESMI & LOGISTIK PRAKTIS KAWASAN DANAU TOBA (UNESCO GLOBAL GEOPARK)
# ====================================================================================================
DANAU_TOBA_KNOWLEDGE_BASE = """
=== ENSIKLOPEDIA & PANDUAN LOGISTIK PRAKTIS KAWASAN DANAU TOBA (UNESCO GLOBAL GEOPARK) ===

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
   - Kabupaten Toba (Ibukota: Balige): Sentra budaya, Pusat Riset Teknologi di Laguboti, Pantai Lumban Silintong, Desa Meat, Makam Raja Sisingamangaraja XII, Bukit Singgolom, Porsea.
   - Kabupaten Samosir (Ibukota: Pangururan): Pusat wisata pulau, Jembatan Tano Ponggol, Pemandian Air Panas Aek Rangat, Bukit Holbung, Menara Pandang Tele, Desa Wisata Tomok & Tuk-Tuk, Batu Kursi Persidangan Huta Siallagan.
   - Kabupaten Humbang Hasundutan (Ibukota: Doloksanggul): Geosite Sipinsur, Lembah Hijau Bakkara, Istana Raja Sisingamangaraja XII, Air Terjun Janji, Sentra Kopi Lintong.
   - Kabupaten Tapanuli Utara (Ibukota: Tarutung): Wisata Rohani Salib Kasih Siatas Barita, Pemandian Air Soda Parbubu (satu dari dua di dunia), Pemandian Air Panas Sipoholon, Panorama Huta Ginjang.
   - Kabupaten Simalungun (Kawasan: Parapat): Gerbang wisata legendaris Toba, Pesanggrahan Bung Karno, Pelabuhan Wisata Ajibata, Haranggaol.
   - Kabupaten Karo (Kawasan: Tongging/Berastagi): Air Terjun Sipiso-piso 120 meter, Bukit Gundaling, Kebun Jeruk & Bunga Berastagi, Gunung Sinabung & Sibayak.
   - Kabupaten Dairi (Kawasan: Silahisabungan/Sidikalang): Pantai Tao Silalahi (pantai terpanjang di Danau Toba), Tugu Silahisabungan, Kopi Sidikalang legendaris.
   - Kabupaten Pakpak Bharat (Ibukota: Salak): Air Terjun Lae Mbilulu, Geopark Delleng Simpon, tradisi budaya suku Pakpak.

5. PANDUAN PRAKTIS LOGISTIK & AKSES TRANSPORTASI WISATAWAN:
   A. Dari Bandara Internasional Silangit / Raja Sisingamangaraja XII (DTB) di Siborongborong:
      - Ke Balige: ~25 km (30-40 menit). Taksi resmi bandara: Rp 150.000 - Rp 200.000. Bus DAMRI: Rp 25.000 - Rp 35.000/orang.
      - Ke Parapat: ~75 km (1.5 - 2 jam). Taksi resmi bandara: Rp 350.000 - Rp 450.000. Bus DAMRI: Rp 45.000 - Rp 65.000/orang.
      - Ke Pangururan / Samosir (via Tele/Tano Ponggol): ~85 km (2 - 2.5 jam). Taksi bandara: Rp 500.000 - Rp 650.000.
      - Ke Sipinsur / Doloksanggul: ~35 km (45 menit). Taksi bandara: Rp 150.000 - Rp 220.000.
      - Ke Tarutung: ~30 km (40 menit). Taksi bandara: Rp 150.000 - Rp 200.000.
   B. Dari Medan / Bandara Internasional Kualanamu (KNO):
      - Travel Eksekutif (KBT, Sampri, Simpati Star, Tiomaz, Sejahtera): Rute via Tol Tebing Tinggi - Sinaksak - Pematang Siantar - Parapat (~2.5 - 3.5 jam). Tarif: Rp 90.000 - Rp 140.000/orang.
      - Kereta Api: KA Siantar Ekspres (Medan - Pematang Siantar, Rp 22.000) lalu sambung Angkot Siantar - Parapat (Rp 20.000, 45 menit).
   C. Jadwal & Tarif Kapal Feri Penyeberangan Danau Toba:
      - Pelabuhan Ajibata (Parapat) ↔ Pelabuhan Ambarita (Samosir): KMP Ihan Batak & KMP Pora-Pora (Feri RORO). Berangkat setiap 1.5 - 2 jam mulai pukul 07.30 s/d 20.00 WIB. Tarif: Penumpang Rp 15.000 - Rp 20.000, Sepeda Motor Rp 25.000, Mobil Pribadi Rp 140.000 - Rp 170.000.
      - Pelabuhan Ajibata ↔ Pelabuhan Tomok: KMP Tao Toba / Kapal Motor Tradisional. Setiap 1 jam. Tarif: Penumpang Rp 10.000 - Rp 15.000, Mobil Rp 135.000 - Rp 160.000.
      - Pelabuhan Balige (Mulia Raja Napitupulu) ↔ Pelabuhan Onan Runggu (Samosir): KMP Kaldera Toba. Jadwal pagi 08.30 & siang 13.30 WIB. Tarif: Penumpang Rp 20.000, Mobil Rp 150.000.
      - Pelabuhan Tigaras (Simalungun) ↔ Pelabuhan Simanindo (Samosir): KMP Sumut I & II. Berangkat setiap 1 - 2 jam. Tarif: Penumpang Rp 15.000, Mobil Rp 135.000.
      - Pelabuhan Muara (Taput) ↔ Pelabuhan Sipinggan (Samosir): KMP Muara Putih & Kapal Tradisional.
      - Rute Darat Tanpa Feri: Lewat Jembatan Tano Ponggol di Pangururan via Tele (dari arah Medan/Berastagi atau Doloksanggul).
   D. Sewa Kendaraan & Transportasi Lokal:
      - Sewa Sepeda Motor: Rp 70.000 - Rp 100.000 / 24 jam (banyak di Tuktuk Siadong, Tomok, Balige, Parapat). Wajib bawa SIM C dan helm.
      - Sewa Mobil + Supir Lokal: Rp 500.000 - Rp 700.000 / hari (sangat disarankan karena medan kaldera berbukit dan jalan berliku).
      - Angkot Lokal & Bentor (Becak Motor): Angkot trayek Balige - Laguboti - Porsea Rp 5.000 - Rp 15.000, Bentor Balige/Parapat Rp 10.000 - Rp 30.000.

6. PANDUAN ANGGARAN & ESTIMASI BIAYA WISATA (BUDGET GUIDE):
   - Paket Backpacker / Solo Traveler (2 Hari 1 Malam):
     * Penginapan / Homestay warga: Rp 150.000 - Rp 250.000 / malam.
     * Makan kuliner lokal (Mie Gomak, Nasi Ikan, Kopi): Rp 20.000 - Rp 35.000 / porsi.
     * Sewa motor: Rp 80.000 / hari.
     * Tiket masuk wisata (HTM): Rp 5.000 - Rp 15.000 / spot.
     * Estimasi Total: ~Rp 450.000 - Rp 750.000 per orang (di luar tiket pesawat/kereta).
   - Paket Keluarga / Rombongan (3 Hari 2 Malam, 4 Orang):
     * Hotel / Resort tepi danau: Rp 550.000 - Rp 1.200.000 / kamar / malam.
     * Restoran kuliner khas / cafe: Rp 60.000 - Rp 120.000 / orang / makan.
     * Sewa mobil Avanza/Innova + supir + BBM: Rp 600.000 / hari.
     * Belanja souvenir tenun Ulos & kopi: Rp 250.000 - Rp 600.000.
     * Estimasi Total: ~Rp 1.100.000 - Rp 1.800.000 per orang.

7. PANDUAN KULINER HALAL & RAMAH MUSLIM:
   - Kawasan Danau Toba sangat ramah wisatawan Muslim dengan ketersediaan ragam menu halal:
     * Menu Halal Khas Toba: Ikan Mas / Nila Bakar bumbu rempah Danau Toba, Mie Gomak kuah kuning andaliman halal, Ayam Pinadar bumbu rempah halal (kelapa sangrai), Kopi Arabika Lintong, Ombusombus, Pohulpohul, Tipatipa.
     * Lokasi Rumah Makan Halal: Banyak tersebar di Balige (sepanjang Jl. SM Raja & Jl. Mulia Raja), Parapat (Jl. Haranggaol & Jl. SM Raja), Pangururan, Tarutung, dan Doloksanggul. Terdapat pula banyak Rumah Makan Minang/Padang dan Warung Muslim lokal.

8. PANDUAN BELANJA TENUN ULOS & SOUVENIR ASLI DARI PENGRAJIN:
   - Desa Wisata Meat (Tampahan, Balige): Sentra tenun Ulos asli di tepi sawah bertingkat, bisa melihat proses tenun manual dan beli langsung dari pengrajin warga (Rp 150.000 - Rp 800.000).
   - Kampung Ulos Huta Raja (Lumban Suhi-suhi, Samosir): Desa tenun tradisional berderet Rumah Bolon purba.
   - Galeri Batikta Balige: Pusat cenderamata, tenun Ulos terkurasi tinggi, batik motif gorga, dan pakaian etnik modern.
   - Balerong Onan Raja Balige & Pasar Tomok: Pasar tradisional untuk berburu pernak-pernik ukiran kayu gorga, kain tenun, dan camilan kacang Sihobuk.

9. CUACA MIKRO, MUSIM KUNJUNGAN & TIPS PAKAIAN:
   - Suhu rata-rata harian: 20°C - 26°C (siang sejuk, pagi dan malam dingin berangin ~18°C - 21°C).
   - Musim Terbaik: Mei hingga September (musim kemarau dengan pemandangan air danau tenang, langit biru cerah, dan sunset terbaik).
   - Tips Pakaian: Pakaian katun santai, kacamata hitam, sunscreen, serta **wajib membawa jaket hangat / windbreaker** terutama saat menyeberang kapal feri atau berkunjung ke dataran tinggi (Tele, Sipinsur, Huta Ginjang).

10. KONTAK DARURAT & POSKO WISATAWAN:
    - Tourism Information Center (TIC) Parapat & Balige.
    - Basarnas Pos SAR Danau Toba: 115 / (0625).
    - RS HKBP Balige / RSUD Porsea / RSUD Hadrianus Sinaga Pangururan / RSUD Tarutung.
    - Call Center Darurat: 112 / Polsek Balige, Polsek Parapat, Polres Samosir.
"""

def calc_distance_km(lat1, lon1, lat2, lon2):
    """Menghitung jarak geodesic Haversine (km) antara dua koordinat."""
    if lat1 is None or lon1 is None or lat2 is None or lon2 is None:
        return 999.0
    R = 6371.0
    dlat = math.radians(lat2 - lat1)
    dlon = math.radians(lon2 - lon1)
    a = math.sin(dlat / 2)**2 + math.cos(math.radians(lat1)) * math.cos(math.radians(lat2)) * math.sin(dlon / 2)**2
    c = 2 * math.atan2(math.sqrt(a), math.sqrt(1 - a))
    return R * c

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

DATA STATISTIK & DESTINASI DARI DATABASE TOBAROUTE AI:
{formatted_data}

BASIS PENGETAHUAN RESMI ENSIKLOPEDIA & LOGISTIK DANAU TOBA:
{DANAU_TOBA_KNOWLEDGE_BASE}

TUGAS UTAMA ANDA:
1. Berikan rekomendasi rute terpadu yang sangat praktis, inspiratif, dan terstruktur.
2. Jika relevan dengan transportasi/akses, sertakan panduan waktu tempuh dari Bandara Silangit, penyeberangan feri, atau tarif nyata.
3. Sambungkan destinasi wisata utama dengan warung kuliner khas (Mie Gomak/Naniura/Arsik/Kopi Lintong) dan sentra pengrajin UMKM di sekitarnya.
4. Gunakan gaya bahasa sopan, ramah, profesional, dan berwibawa khas Batak ("Horas!").
5. DILARANG KERAS menggunakan simbol emoji apa pun. Gunakan tipografi Markdown yang rapi (Heading ###, list -, dan **bold**).
"""
    try:
        response = client.models.generate_content(
            model='gemini-2.0-flash',
            contents=prompt_konteks,
        )
        return response.text
    except Exception as e:
        print(f"[AI Error] Error in generate_tourist_response: {e}")
        try:
            response = client.models.generate_content(
                model='gemini-1.5-flash',
                contents=prompt_konteks,
            )
            return response.text
        except Exception as e2:
            print(f"[AI Error] Fallback model error: {e2}")
            return f"Horas! Berdasarkan penelusuran kami, kawasan Danau Toba menawarkan beragam pilihan wisata alam kaldera, kuliner berempah andaliman, serta kerajinan tenun Ulos autentik dari pelaku UMKM setempat."

def clean_norm(t: str) -> str:
    if not t:
        return ""
    import re
    return re.sub(r'[^a-z0-9]', '', t.lower())

# KABUPATEN / PULAU MAPPINGS
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
# Chatbot percakapan cerdas yang bertindak sebagai Universal AI Assistant dengan keahlian mendalam
# ensiklopedia Danau Toba, budaya Batak, rute navigasi, logistik praktis, dan integrasi database live.
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
        is_transport_req = any(k in msg_lower for k in ['transport', 'silangit', 'kualanamu', 'taksi', 'angkot', 'damri', 'sewa mobil', 'sewa motor', 'rental', 'ongkos', 'tarif', 'cara ke', 'naik apa', 'pesawat', 'kendaraan', 'ojek', 'bentor'])
        is_ferry_req = any(k in msg_lower for k in ['feri', 'ferry', 'kapal', 'penyeberangan', 'pelabuhan', 'ajibata', 'tomok', 'ambarita', 'jadwal kapal', 'ihan batak', 'tao toba', 'dermaga', 'menyeberang', 'roro'])
        is_budget_req = any(k in msg_lower for k in ['biaya', 'budget', 'estimasi', 'rupiah', 'ongkos', 'paket', 'murah', 'hemat', 'harga', 'berapa duit', 'pengeluaran', 'htm', 'tiket masuk'])
        is_halal_req = any(k in msg_lower for k in ['halal', 'muslim', 'islam', 'aman', 'tidak makan babi', 'masjid', 'shalat', 'makanan halal'])
        is_souvenir_req = any(k in msg_lower for k in ['ulos', 'oleh', 'suvenir', 'souvenir', 'beli', 'kain', 'batikta', 'kerajinan', 'pengrajin', 'tenun'])
        is_weather_req = any(k in msg_lower for k in ['cuaca', 'suhu', 'hujan', 'pakaian', 'baju', 'musim', 'angin', 'dingin', 'panas', 'outfit'])
        is_emergency_req = any(k in msg_lower for k in ['darurat', 'rumah sakit', 'polisi', 'kontak', 'hotline', 'bantuan', 'puskesmas', 'kecelakaan', 'sar'])
        is_coffee_req = any(k in msg_lower for k in ['kopi', 'cafe', 'kafe', 'nongkrong', 'ngopi', 'arabika', 'lintong'])
        is_food_req = any(k in msg_lower for k in ['makan', 'kuliner', 'mie gomak', 'resto', 'lapo', 'arsik', 'naniura', 'sarapan', 'malam', 'siang', 'ombusombus'])
        is_umkm_req = any(k in msg_lower for k in ['umkm', 'oleh', 'ulos', 'souvenir', 'belanja', 'kerajinan', 'tenun'])
        is_hotel_req = any(k in msg_lower for k in ['hotel', 'penginapan', 'homestay', 'resort', 'menginap', 'villa', 'kamar'])

        # TAHAP 1: Deteksi Nama Tempat / Destinasi Spesifik / Landmark
        matched_target_dest = None

        # 1A. Cari via KEY_LANDMARKS_MAP
        for k_alias, k_target in KEY_LANDMARKS_MAP.items():
            if k_alias in msg_lower or clean_norm(k_alias) in norm_msg:
                for d in all_dests:
                    d_nama_low = (d.nama or '').lower()
                    if k_target in d_nama_low or clean_norm(k_target) in clean_norm(d_nama_low):
                        matched_target_dest = d
                        break
                if matched_target_dest:
                    break

        # 1B. Jika belum ketemu, periksa kecocokan nama destinasi langsung di database
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
            # TAHAP 3: Deteksi Wilayah Kabupaten / Pulau
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
                elif is_umkm_req or is_souvenir_req:
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
                    elif is_umkm_req or is_souvenir_req:
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
                    keywords = ["mie gomak", "naniura", "arsik", "kopi", "ulos", "sipiso", "sipinsur", "holbung", "meat", "siallagan", "tomok", "sigura", "aek rangat", "batikta", "andaliman", "ombusombus", "silangit", "ferry", "feri", "ajibata", "ambarita"]
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
    # INSTRUKSI SISTEM UNTUK GEMINI FLASH LITE (UNIVERSAL INTELLIGENCE + PRACTICAL TOURIST CONCIERGE)
    # ================================================================================================
    system_instruction = f"""
Anda adalah TobaRoute AI — Asisten Cerdas Universal, Senior Travel Concierge, dan Master Pemandu Budaya serta Logistik Praktis Kawasan Danau Toba (UNESCO Global Geopark).

KEMAMPUAN UTAMA & PANDUAN MENJAWAB PERTANYAAN PRAKTIS WISATAWAN:

1. KEMAMPUAN MENJAWAB PERTANYAAN PRAKTIS WISATAWAN SECARA NYATA & RINCI:
   - JIKA pengguna bertanya tentang TRANSPORTASI / CARA KE SANA (Bandara Silangit, Kualanamu, Taksi, Damri, Rental Mobil/Motor, Angkot):
     * Berikan rute langkah-demi-langkah, jarak km, durasi perjalanan, jenis armada transportasi, dan ESTIMASI TARIF RUPIAH NYATA sesuai data resmi di bawah.
   - JIKA pengguna bertanya tentang PENYEBERANGAN KAPAL FERI (Jadwal, Tarif, Pelabuhan Ajibata, Ambarita, Tomok, Tigaras, Balige):
     * Berikan nama kapal (KMP Ihan Batak, KMP Pora-Pora, KMP Tao Toba, KMP Kaldera Toba), frekuensi jam keberangkatan, serta tarif tiket orang, motor, dan mobil pribadi.
   - JIKA pengguna bertanya tentang ESTIMASI BIAYA / BUDGET (Berapa biaya liburan 2D1N / 3D2N / backpacker / keluarga):
     * Berikan rincian anggaran yang masuk akal (penginapan/homestay, makan per porsi, transportasi/sewa kendaraan, HTM wisata) beserta total estimasi per orang.
   - JIKA pengguna bertanya tentang KULINER HALAL & RESTORAN RAMAH MUSLIM:
     * Jelaskan dengan ramah pilihan kuliner halal khas Toba (Ikan bakar rempah, mie gomak halal, kopi Lintong, ombusombus) dan sebutkan lokasi rumah makan halal di Balige, Parapat, dan sekitarnya.
   - JIKA pengguna bertanya tentang TENUN ULOS & SOUVENIR:
     * Rekomendasikan tempat beli ulos asli langsung dari pengrajin warga (Desa Meat, Kampung Ulos Huta Raja, Batikta Balige) beserta kisaran harganya.
   - JIKA pengguna bertanya tentang CUACA, PAKAIAN, ATAU WAKTU TERBAIK BERKUNJUNG:
     * Jelaskan suhu sejuk kaldera (20-26°C), musim terbaik (Mei-September), dan saran pakaian praktis (termasuk wajib jaket hangat/windbreaker).

2. UNIVERSAL INTELLIGENCE (SEPERTI CHATGPT & GOOGLE GEMINI):
   - JIKA pengguna bertanya tentang topik APAPUN di luar Danau Toba (sains, teknologi, koding, sejarah dunia, resep umum, matematika, puisi, curhat/santai):
     * JAWABLAH SECARA LENGKAP, CERDAS, DAN AKURAT! DILARANG KERAS menolak pertanyaan umum.

3. STRUKTUR & TIPOGRAFI JAWABAN:
   - Gunakan format Markdown yang rapi: Heading (###), poin-poin (-), nomor (1.), dan **bold** pada nama tempat, tarif, dan tips penting.
   - DILARANG KERAS MENGGUNAKAN SIMBOL EMOJI / EMOTICON APAPUN (seperti 🚗, ✈️, 🚢, 💡, 📍, dll.). Gunakan bahasa tulis editorial yang bersih, ramah, dan profesional.
   - Awali dengan sapaan khas Batak: "Horas!"

DATA STATISTIK & REKOMENDASI DATABASE TOBAROUTE AI SAAT INI:
{db_context_text}

PANDUAN ENSIKLOPEDIA & LOGISTIK RESMI KAWASAN DANAU TOBA:
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
# FUNGSI: generate_destination_ai_insight
# TUJUAN:
# Menghasilkan wawasan budaya, tips wisatawan, rekomendasi must-try, dan tag keunikan produk/lokasi
# secara cerdas menggunakan Google Gemini AI (dengan fallback heuristik berkecepatan 0 ms).
# ====================================================================================================
def generate_destination_ai_insight(
    nama: str,
    kecamatan: str,
    kategori: str,
    deskripsi_singkat: str,
    nama_jalan: str = "",
    latitude: float = 2.3387,
    longitude: float = 99.0625
) -> dict:
    n = (nama or '').lower()
    k = (kategori or '').lower()
    d = (deskripsi_singkat or '').lower()

    # Fallback Heuristik Lokal
    if any(kw in n or kw in k or kw in d for kw in ['ulos', 'tenun', 'batik']):
        default_insight = {
            "storytelling": f"Sentra kerajinan tangan di {kecamatan} yang melestarikan teknik tenun Ulos tradisional Batak sarat makna doa leluhur.",
            "must_try": "Melihat proses tenun motif Sadum / Ragi Hotang dan membeli kain asli dari pengrajin warga.",
            "travel_tips": "Kunjungi pada pagi atau siang hari saat pengrajin aktif menenun.",
            "highlight_tags": ["Tenun Asli", "UMKM Lokal", "Budaya Batak"]
        }
    elif any(kw in n or kw in d for kw in ['gula', 'aren', 'nira']):
        default_insight = {
            "storytelling": f"Diproduksi murni dari sadapan pohon enau alami {kecamatan} tanpa bahan pengawet kimia.",
            "must_try": "Membeli gula aren cetak dan sirup aren alami untuk pemanis kopi Arabika Toba.",
            "travel_tips": "Simpan di tempat sejuk dan kedap udara agar keaslian aroma terjaga.",
            "highlight_tags": ["Nira Murni", "Produksi Warga", "Tanpa Pengawet"]
        }
    elif any(kw in k or kw in n for kw in ['kuliner', 'makan', 'resto', 'kopi', 'warung', 'cafe']):
        default_insight = {
            "storytelling": f"Kuliner autentik di {kecamatan} yang menghidangkan kekayaan bumbu rempah tradisional khas Batak Toba.",
            "must_try": "Mencicipi sajian andalan dengan bumbu rempah andaliman segar.",
            "travel_tips": "Waktu terbaik berkunjung adalah jam makan siang (11.30 - 13.30 WIB).",
            "highlight_tags": ["Rempah Andaliman", "Kuliner Khas", "Bahan Segar"]
        }
    elif any(kw in k or kw in n for kw in ['penginapan', 'hotel', 'homestay', 'resort']):
        default_insight = {
            "storytelling": f"Akomodasi ramah keluarga di {kecamatan} dengan suasana tenang dan panorama asri Danau Toba.",
            "must_try": "Menikmati kopi hangat di pagi hari dengan pemandangan danau kaldera.",
            "travel_tips": "Lakukan reservasi terlebih dahulu terutama saat akhir pekan atau musim libur.",
            "highlight_tags": ["Suasana Tenang", "Pemandangan Danau", "Akses Strategis"]
        }
    else:
        default_insight = {
            "storytelling": f"Destinasi alam unggulan di wilayah {kecamatan} dengan panorama bentang alam kaldera Danau Toba.",
            "must_try": "Menikmati pemandangan bentang danau dari sudut terbaik dan berfoto di spot alami.",
            "travel_tips": "Gunakan pakaian santai yang nyaman dan bawa jaket ringan karena udara sejuk.",
            "highlight_tags": ["UNESCO Geopark", "Panorama Alam", "Spot Foto"]
        }

    try:
        if client:
            prompt = f"""
Buatkan wawasan singkat dan tips wisata dalam format JSON murni untuk destinasi berikut di kawasan Danau Toba:
Nama: {nama}
Kecamatan: {kecamatan}
Kategori: {kategori}
Deskripsi: {deskripsi_singkat}
Alamat: {nama_jalan}

Format JSON yang wajib dihasilkan (hanya kembalikan JSON tanpa markdown / backtick):
{{
  "storytelling": "Narasi 1-2 kalimat tentang keunikan sejarah/alam/budaya tempat ini",
  "must_try": "Aktivitas atau menu yang wajib dicoba wisatawan di sini",
  "travel_tips": "Tips praktis waktu terbaik / pakaian / persiapan berkunjung",
  "highlight_tags": ["Tag1", "Tag2", "Tag3"]
}}
"""
            resp = client.models.generate_content(
                model='gemini-3.1-flash-lite',
                contents=prompt
            )
            raw_text = resp.text.strip()
            if raw_text.startswith("```json"):
                raw_text = raw_text[7:]
            if raw_text.startswith("```"):
                raw_text = raw_text[3:]
            if raw_text.endswith("```"):
                raw_text = raw_text[:-3]
            parsed = json.loads(raw_text.strip())
            if isinstance(parsed, dict) and "storytelling" in parsed:
                return parsed
    except Exception:
        pass

    return default_insight

