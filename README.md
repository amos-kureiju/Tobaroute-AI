# TobaRoute AI — Submission AI Hackathon 2026

> **PENTING - ATURAN BLIND REVIEW:** 
> Peserta **DILARANG KERAS** mencantumkan nama institusi/universitas/sekolah asal di dalam file ini maupun di seluruh _source code_. Pelanggaran terhadap aturan ini dapat berakibat pada pengurangan nilai atau diskualifikasi.

---

## 1. Deskripsi Singkat
TobaRoute AI adalah platform navigasi dan sistem rekomendasi pariwisata Danau Toba yang dirancang untuk mengatasi masalah ketimpangan promosi digital. Saat ini, informasi pariwisata Danau Toba terfragmentasi dan didominasi oleh destinasi populer saja, sehingga destinasi lokal (*hidden gems*) dan UMKM lokal kurang mendapatkan perhatian.

TobaRoute AI menyajikan solusi terpadu yang memadukan pencarian rute navigasi jalan presisi, rekomendasi tempat kontekstual, serta asisten AI interaktif.

Pendekatan teknologi yang digunakan berbasis **Semantic Retrieval-Augmented Generation (RAG)** memanfaatkan PostgreSQL, Pinecone Vector Database, Cohere Rerank, dan Large Language Model (Gemini), yang diperkuat dengan **Algoritma Fairness Boosting ($\gamma$)** untuk memberikan pembobotan proporsional secara otomatis kepada UMKM lokal dan tempat wisata sekitar.

---

## 2. Anggota Tim

| Nama Lengkap | Peran dalam Tim | Kontak (Email / GitHub) |
| :--- | :--- | :--- |
| **Amos Baringbing** | Team Lead & Full-Stack Engineer | `amosbaringbing@gmail.com` / [GitHub](https://github.com/amos-kureiju) |
| **Jonatan Pasaribu** | Data & Backend Engineer | `jonathanpasaribu12r@gmail.com` / [GitHub](https://github.com/jonathanpasaribu12r-crypt) |
| **Jessica Ruth Abigael** | Frontend & UI/UX Designer | `jessicaruthylie@gmail.com` / [GitHub](https://github.com/jessicaruthylie-boop) |

---

## 3. Pemanfaatan Data Pariwisata Toba
Sistem ini memanfaatkan **Dataset Hackathon Tourism** secara optimal:
- **Data Utama:** Memanfaatkan 700+ entitas data pariwisata yang mencakup kategori Destinasi Wisata Alam/Budaya, Kuliner Khas, Penginapan, Transportasi Lokal, dan UMKM Kerajinan (seperti Sentra Ulos).
- **Pengolahan:**
  1. *Data Cleaning & Standardisasi:* Pembersihan data kosong (`NaN`), pembetulan ejaan, serta ekstraksi nama kecamatan berbasis aturan teks.
  2. *Entity Resolution:* Penggabungan variasi entitas ganda (deduplikasi nama usaha/tempat yang sama).
  3. *GPS Coordinate Calibration:* Pemetaan ulang dan perbaikan koordinat garis pantai/daratan presisi agar tidak ada titik lokasi yang jatuh di perairan Danau Toba.
  4. *Chunking & Embedding Vector:* Penyiapan teks konteks yang diubah menjadi representasi vektor dan disinkronkan ke **Pinecone Vector Database**.
- **Data Tambahan:** Google Maps & OpenStreetMap Tile Services (untuk tile peta interaktif Leaflet dan rute navigasi jalan).

---

## 4. Tautan & Aset Pendukung
- **Link Video Demonstrasi (Wajib):** [Tautan Video YouTube / Google Drive]
- **Link Pitch Deck / Proposal (Wajib):** [Tautan Dokumen PDF Pitch Deck]
- **Link Deployment / Live App (Opsional):** `http://localhost:5173` *(Menjalankan secara lokal)*

---

## 5. Struktur Repository
```text
.
├── backend/                # Kode server FastAPI, database ORM, RAG engine & skrip manajemen data
│   ├── app/                # Package utama (main.py, models.py, schemas.py, crud.py, ai_bot.py, config.py)
│   ├── dataset/            # File Dataset HackathonTourism Excel
│   ├── manage_data.py      # Skrip CLI terpadu (init DB, ingestion dataset, & sync Pinecone vector)
│   ├── requirements.txt    # Daftar dependensi Python backend
│   └── .env.example        # Template variabel environment backend
├── frontend/               # Kode antarmuka pengguna berbasis React + Vite
│   ├── src/                # Halaman (Home, Explore, About, Admin), komponen Leaflet, & layanan API
│   ├── package.json        # Daftar dependensi Node.js frontend
│   └── README.md
├── docs/                   # Dokumen analisis dan laporan submission
└── README.md               # Dokumen submission utama ini
```

---

## 6. Prasyarat (Requirements)
Sebelum menjalankan sistem, pastikan perangkat Anda telah terpasang:
- **Environment:** Python versi 3.10+ & Node.js versi v18+
- **Package manager:** `pip` (Python) & `npm` (Node.js)
- **Software tambahan:** PostgreSQL (Server database lokal / cloud)
- **API Key Eksternal yang dibutuhkan:**
  - `PINECONE_API_KEY` (Vector Database Indexing)
  - `COHERE_API_KEY` (Semantic Reranking)
  - `GEMINI_API_KEY` (Large Language Model & Asisten AI)

---

## 7. Environment Variables
File `.env` sudah disertakan di folder `backend/.env` untuk pengujian langsung oleh juri. Berikut adalah isi lengkap konfigurasi `.env` yang digunakan:

```env
PROJECT_NAME="TobaGuide Backend API"
DATABASE_URL="postgresql://postgres:amos123@localhost:5432/tobaguide_db"
SECRET_KEY="development_secret_key_please_change_in_production_12345"
ALGORITHM="HS256"
ACCESS_TOKEN_EXPIRE_MINUTES=10080

# RAG & Vector Database Settings
PINECONE_API_KEY="pcsk_38mDkG_AUrnQ5yf4rG5How1Jn3zw5X4p646dii4mq7pxJnvS1M2EPSMLAVkxtpmQhrEhNn"
PINECONE_INDEX_NAME="tobaguide-index"
OPENAI_API_KEY="sk-proj-placeholder"
COHERE_API_KEY="gFVspCBouVSx08IEQ66yWvoKGuw2a8aU4a6rcBGa"

# Gemini API Key
GEMINI_API_KEY="AQ.Ab8RN6KUv2Ow_M3S84uVD5t_cXNcuAZHxZq29bZp2SyalEYtQw"
```

---

## 8. Langkah Instalasi & Menjalankan Project Secara Lokal

### 1. Clone Repository
```bash
git clone https://github.com/amos-kureiju/Tobaroute-AI.git tobaguide
cd tobaguide
```

### 2. Setup & Jalankan Backend (FastAPI)
```bash
# Masuk ke direktori backend
cd backend

# Buat & aktifkan virtual environment (Opsional)
python -m venv venv
# Windows (PowerShell):
.\venv\Scripts\Activate.ps1
# Mac/Linux:
# source venv/bin/activate

# Install dependensi Python
pip install -r requirements.txt

# Inisialisasi Database & Vector Indexing otomatis (Pastikan PostgreSQL aktif)
python manage_data.py --all

# Jalankan server backend FastAPI
uvicorn app.main:app --port 8080 --reload
```
*Backend akan berjalan di `http://localhost:8080`*

### 3. Setup & Jalankan Frontend (React + Vite)
Buka terminal baru di folder proyek `tobaguide`:
```bash
# Masuk ke direktori frontend
cd frontend

# Install dependensi Node.js
npm install

# Jalankan server frontend
npm run dev
```
*Frontend akan berjalan di `http://localhost:5173`*

---

## 9. Cara Menggunakan / Testing (Evaluasi Model)
Setelah aplikasi berjalan:
1. Buka browser dan akses alamat Web App: `http://localhost:5173`
2. Buka dokumentasi API interaktif (Swagger UI): `http://localhost:8080/docs`
3. **Pengujian Fitur AI Utama & Navigasi Rute:**
   - Masuk ke menu **Jelajah** (`http://localhost:5173/explore`).
   - Ketik pertanyaan di chatbot Asisten Lokasi AI, contohnya:
     - *"Lokasi Laguboti"* $\rightarrow$ Peta akan berfokus pada titik presisi Kecamatan Laguboti dengan tingkat zoom optimum (level 13) dan menampilkan destinasi sekitarnya.
     - *"Wisata pantai di Balige"* $\rightarrow$ Peta akan menampilkan garis rute navigasi dari lokasi awal ke Pantai Lumban Bulbul Balige dan merekomendasikan UMKM kuliner sekitar.
     - *"Rekomendasi Ulos di Pangururan"* $\rightarrow$ Menampilkan rute ke Sentra Ulos Hutaraja beserta penanda UMKM lokal.

---

## 10. Known Issues / Batasan
- **Layanan Routing Publik:** Pengubahan rute jalan jalan raya bergantung pada ketersediaan API OSRM publik; jika jaringan publik mengalami keterlambatan, sistem secara otomatis mengaktifkan *fallback* garis rute visual (*Polyline*) presisi di atas peta.
- **Kecepatan Respon LLM:** Latensi jawaban chatbot AI sangat bergantung pada kecepatan koneksi jaringan ke server API Gemini dan Cohere.

---

## 📋 Aturan Submission (Wajib Dibaca & Dipatuhi)
1. **Hak Akses:** Repository bersifat **Private**. Email `aicenter.itdel@gmail.com` telah diundang sebagai *Collaborator/Viewer* agar dewan juri dapat mengakses kode.
2. **Kesesuaian Instruksi:** Sistem dapat dieksekusi secara lokal murni berdasarkan petunjuk di *Langkah Instalasi* pada README ini.
3. **Keamanan:** Kunci API dan variabel konfigurasi diatur secara aman dan disiapkan untuk kemudahan evaluasi juri.
4. **Kelengkapan Kode:** Seluruh *source code* backend, frontend, skrip ingestion, dan dataset pengujian disertakan secara lengkap.
5. **Batas Waktu:** Seluruh submisi dan komit final telah diselesaikan sesuai tenggat waktu *Preliminary Round*.
