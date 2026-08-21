# 🏆 PANDUAN LENGKAP PITCHING & LIVE DEMO TOBAROUTE AI
## AI Hackathon IT Del 2026

---

## ⏱️ RUNDOWN PRESENTASI (TOTAL: 7 MENIT)

| Durasi | Bagian | Fokus Utama & Pesan Kunci |
| :--- | :--- | :--- |
| **00:00 – 01:00** (1 mnt) | **Hook & Problem Statement** | Ketimpangan ekonomi pariwisata Danau Toba & *overtourism* akibat bias algoritma konvensional. |
| **01:00 – 02:00** (1 mnt) | **Solusi & Arsitektur Inovatif** | Memperkenalkan **TobaRoute AI**: Fairness RAG Engine + Multi-Point GIS Routing. |
| **02:00 – 05:00** (3 mnt) | **LIVE DEMO INTERAKTIF** | Demo langsung di web: Pencarian Persona -> Peta OSRM -> Studio Planner -> AI Chatbot. |
| **05:00 – 06:00** (1 mnt) | **Metrik Evaluasi & Dampak Nyata** | *Retrieval Accuracy* 100%, *Fairness Rate* 41.59%, pemberdayaan 491 entitas lokal. |
| **06:00 – 07:00** (1 mnt) | **Closing & Vision** | Pariwisata Danau Toba yang inklusif, berkelanjutan, dan berdampak nyata bagi UMKM. |

---

## 🎬 SKENARIO LIVE DEMO STEP-BY-STEP (UNTUK DILAKUKAN DI PANGGUNG)

### 🔹 PERSIAPAN SEBELUM TAMPIL:
1. Pastikan Backend FastAPI running: `http://localhost:8000` (atau via SSH Tunnel).
2. Pastikan Frontend React running: `http://localhost:3000`.
3. Buka browser pada tab utama `http://localhost:3000` dalam mode Fullscreen (**F11**).
4. Siapkan tab cadangan:
   - Tab 1: `http://localhost:3000` (Beranda)
   - Tab 2: `http://localhost:3000/planner` (Studio Itinerary)
   - Tab 3: `http://localhost:3000/explore` (Peta Jelajah GIS)
   - Tab 4: `http://localhost:3000/umkm` (Sentra UMKM)

---

### 📍 LANGKAH 1: Beranda & AI Persona Switcher (Waktu: 45 Detik)
**Apa yang Diklik / Ditampilkan:**
1. Tampilkan Hero Section **TobaRoute AI**.
2. Di panel kanan, tunjukkan kartu **AI Persona & Profil Wisatawan**.
3. Klik tombol switch persona atau pilih persona:
   - *The Authentic Foodie* (Pecinta Kuliner Lokal)
   - *The Cultural Explorer* (Penjelajah Budaya & Tenun)
   - *The Nature & Geosite Seeker* (Pencinta Alam Kaldera)
   - *The Family & Staycationer* (Keluarga & Penginapan Nyaman)
4. Di bilah pencarian utama:
   - Pilih Lokasi: **"Parapat (Simalungun)"**
   - Masukkan Kueri: `"coba rekomendasikan hotel dan penginapan yang nyaman"`
   - Klik tombol **"Cari Rute & Rekomendasi Cerdas"** (tombol biru).

**Skrip Bicara (Pitching):**
> *"Dewan juri yang terhormat, mari kita mulai dari Beranda TobaRoute AI. Berbeda dengan aplikasi wisata biasa, kami menyediakan AI Persona Engine yang mengadaptasi rekomendasi sesuai gaya perjalanan wisatawan. Ketika wisatawan mencari hotel di Parapat..."*

---

### 📍 LANGKAH 2: Hasil Fairness Route & Peta GIS Berurutan (Waktu: 60 Detik)
**Apa yang Diklik / Ditampilkan:**
1. Scroll ke bawah menuju bagian **Hasil Rekomendasi AI & Rute Perjalanan**.
2. Tunjukkan bahwa hasil rekomendasi terbagi 2 secara proporsional dan adil:
   - **Destinasi Utama (Biru)**: Menampilkan hotel nyata yang presisi (Inna Parapat, Niagara Hotel, Atsari Hotel).
   - **Rekomendasi UMKM Sekitar (Hijau)**: Menampilkan warung kuliner tradisional, kedai kopi, dan pengrajin lokal di sekitar jalur hotel.
3. Sorot **Peta GIS Interaktif**:
   - Tunjukkan **Pin Bernomor Urut** (`1, 2, 3, 4, 5`) yang menghubungkan titik-titik tersebut secara logis.
   - Tunjukkan garis rute jalan raya nyata (*OSRM Polyline Routing*) lengkap dengan jarak (Km) dan estimasi waktu berkendara.
4. Klik salah satu kartu destinasi / pin di peta untuk melihat *flyTo animation* dan popup interaktif.

**Skrip Bicara (Pitching):**
> *"Inilah inti inovasi kami: **Fairness Recommendation Engine**. Sistem tidak hanya memberikan destinasi utama yang tepat (kategori hotel), tetapi secara otomatis menyandingkan UMKM kuliner dan pengrajin lokal di sekitar koridor rutenya. Di peta GIS, pin bernomor urut 1 sampai 5 terhubung langsung melalui jaringan jalan nyata OSRM, bukan garis lurus fiktif!"*

---

### 📍 LANGKAH 3: Studio Perencana AI / Itinerary Planner (Waktu: 60 Detik)
**Apa yang Diklik / Ditampilkan:**
1. Buka halaman **Itinerary AI** (`/planner`).
2. Tunjukkan kontrol Studio Toolbar:
   - Klik **Durasi 3H** (3 Hari) -> jadwal 3 hari tersusun otomatis.
   - Klik salah satu Tema Cepat: misal **"Kuliner Batak Autentik"** atau **"Budaya & Tenun Ulos"**.
3. **Demo Efek Moda Transportasi Cerdas (FITUR UNGGULAN)**:
   - Klik **Mobil**: Perhatikan kecepatan ~40 km/jam kaldera, jam slot standar (`08:00`, `10:00`, `13:00`).
   - Klik **Motor**: Perhatikan jam slot langsung bergeser lebih hemat (-25% transit time) dan catatan logistik otomatis beradaptasi dengan kelincahan motor di pedesaan.
   - Klik **Feri**: Tunjukkan integrasi 45 menit penyeberangan air kapal Danau Toba (KMP Ihan Batak).
4. **Demo Validasi Geografis Realistis**:
   - Buka dropdown *Fokus Wilayah*. Tunjukkan bahwa **Humbahas (Doloksanggul/Sipinsur)** ditandai `(Jalur Darat)`.
   - Jelaskan bahwa jika user memilih wilayah darat, sistem secara cerdas memproteksi agar tidak ada halusinasi feri di daratan tinggi!
5. **Demo Manajemen Aktivitas & Budget**:
   - Klik tombol panah atas `↑` / bawah `↓` untuk memindahkan urutan aktivitas hari itu.
   - Sorot widget **Estimasi Anggaran Cerdas** dan **Checklist Perlengkapan Kaldera**.
   - Klik tombol **Salin Teks** / **WhatsApp** untuk menunjukkan fitur ekspor praktis.

**Skrip Bicara (Pitching):**
> *"Wisatawan membutuhkan rencana konkret. Di Studio Planner ini, setiap moda transportasi (Mobil, Motor, Feri Danau) memiliki implikasi waktu, jam transit, dan estimasi biaya yang nyata. Sistem kami juga memahami geografi Danau Toba: wilayah dataran tinggi seperti Humbahas tidak akan dialihkan ke feri air. Semua jadwal dapat digeser urutannya, dihitung anggarannya, dan langsung dibagikan ke WhatsApp."*

---

### 📍 LANGKAH 4: AI Concierge Assistant (Chatbot 24/7) (Waktu: 30 Detik)
**Apa yang Diklik / Ditampilkan:**
1. Klik widget chatbot melayang (*floating widget*) di pojok kanan bawah.
2. Ketik / paste pertanyaan:
   `"Rekomendasikan makanan halal dan sentra tenun ulos di Balige yang dekat pelabuhan"`
3. Tunjukkan respon cepat dari **Gemini 2.0 Flash**:
   - Terstruktur rapi per nomor (1, 2, 3).
   - Menyertakan rute jalan dan nama UMKM lokal.
   - Bebas emoji berlebihan dan bebas halusinasi.

**Skrip Bicara (Pitching):**
> *"Untuk pertanyaan spontan, asisten AI Concierge kami yang didukung Gemini 2.0 Flash siap 24 jam menjawab preferensi spesifik wisatawan—seperti makanan halal, rute pelabuhan, hingga pengrajin ulos autentik."*

---

### 📍 LANGKAH 5: Metrik Evaluasi, Dampak & Penutup (Waktu: 45 Detik)
**Apa yang Ditampilkan:**
1. Tampilkan slide/data evaluasi kuantitatif dari laporan analisis:
   - **491 Entitas Terintegrasi** (Wisata, Hotel, Kuliner, UMKM, Transportasi).
   - **Retrieval Accuracy**: **100.0%** pada kueri semantik.
   - **Fairness Exposure Rate**: **41.59%** (jauh melampaui target panitia 35%).
   - **Latency Respon**: Rata-rata **< 1.8 detik**.

**Skrip Penutup (Pitching):**
> *"TobaRoute AI bukan sekadar prototipe pencari rute, melainkan platform keadilan ekonomi digital untuk mendukung Danau Toba sebagai Destinasi Pariwisata Super Prioritas yang inklusif dan berkelanjutan. Dari Toba, untuk kebangkitan ekonomi lokal. Terima kasih!"*

---

## 🛡️ CHEAT SHEET MENJAWAB PERTANYAAN JURI (Q&A DEFENSE)

### ❓ Q1: "Apa beda TobaRoute AI dengan Google Maps atau TripAdvisor?"
> **Jawaban Skakmat:**
> *"Google Maps dan TripAdvisor menggunakan algoritma berbasis **popularitas murni (jumlah review & rating tertinggi)**. Akibatnya, warung makan lokal, pengrajin tenun ulos di pelosok desa, atau homestay baru yang hanya punya 5 review tidak akan pernah muncul di halaman utama. **TobaRoute AI menggunakan Fairness Scoring Algorithm**, di mana kami memberikan bobot keadilan (*fairness boost*) dan *geofencing multi-point* agar UMKM lokal di sepanjang koridor perjalanan wisatawan tetap mendapatkan eksposur digital secara adil."*

---

### ❓ Q2: "Bagaimana sistem Anda mencegah halusinasi LLM?"
> **Jawaban Skakmat:**
> *"Kami menerapkan arsitektur **Strict Grounded RAG (Retrieval-Augmented Generation)**. LLM (Gemini 2.0 Flash) diikat dengan system prompt ketat yang mewajibkan model HANYA mengambil fakta dari database lokal 491 entitas terverifikasi kami. Jika entitas tidak ada di database, model secara eksplisit menyatakan data tidak tersedia daripada mengarang informasi."*

---

### ❓ Q3: "Bagaimana cara Anda menghitung rute di peta?"
> **Jawaban Skakmat:**
> *"Kami tidak menggunakan garis lurus (Euclidean distance), melainkan menghubungkan titik awal dan destinasi-destinasi perantara menggunakan **OSRM (Open Source Routing Machine)** pada jaringan jalan raya nyata Danau Toba. Rute kami mendukung kalkulasi multimoda: jalur mobil darat, sepeda motor, serta integrasi titik pelabuhan penyeberangan feri resmi (seperti Ajibata-Ambarita dan Balige-Onan Runggu)."*

---

### ❓ Q4: "Bagaimana model keberlanjutan dan monetisasi sistem ini?"
> **Jawaban Skakmat:**
> *"Model kami adalah **B2G (Business-to-Government) & B2B UMKM**:
> 1. **B2G**: Dashboard analitik persebaran wisatawan untuk Dinas Pariwisata daerah guna memantau *crowding* dan keadilan kunjungan.
> 2. **B2B**: Akses verifikasi profil dan promosi organik bagi pelaku UMKM lokal tanpa biaya iklan yang mencekik.
> 3. **Wisatawan**: Gratis digunakan untuk meningkatkan kenyamanan dan lama tinggal (*length of stay*) wisatawan di kawasan Danau Toba."*

---

## 📋 CHECKLIST PERALATAN & TEKNIS DEMO LOMBA

- [ ] Laptop utama terhubung ke proyektor / HDMI.
- [ ] Resolusi layar diatur optimal (1920x1080 disarankan).
- [ ] Backend FastAPI aktif di port 8000 (`python -m uvicorn app.main:app --reload`).
- [ ] Frontend React aktif di port 3000 (`npm run dev`).
- [ ] Pastikan koneksi internet stabil untuk load peta OpenStreetMap & API Gemini.
- [ ] Mode *Do Not Disturb* / Notifikasi WhatsApp laptop dinonaktifkan.
- [ ] Siapkan presenter clicker atau mouse wireless untuk kemudahan navigasi saat demo.
