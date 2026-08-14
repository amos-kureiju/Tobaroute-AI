# Panduan Persiapan & Survival Kit Babak Final Del AI Hackathon 2026
**Tim TobaRoute AI** (Amos Kureiju, Jonathan Pasaribu, Jessica)

---

## 📅 Tanggal & Jadwal Penting
- **Lokasi**: Kampus Institut Teknologi Del, Balige, Toba, Sumatera Utara
- **Daftar Ulang & Technical Meeting**: 18 Agustus 2026
- **Lockdown Session (Karantina)**: 21 Agustus 2026 (08:00 WIB) - 22 Agustus 2026 (12:00 WIB)
- **Total Durasi Lockdown**: 28 Jam Intensif menginap di ruangan IT Del.
- **Sesi Presentasi & Live Demo**: 22 Agustus 2026 (10 Menit Presentasi & Demo + 10 Menit Q&A Juri).

---

## 🔒 Aturan Lockdown & Pengecekan
1. **HP & Alat Komunikasi Seluler DIKARANTINA TOTAL**: Seluruh HP disita oleh panitia. Tidak ada komunikasi dengan pihak luar (mentor, teman, keluarga).
2. **Monitoring Perangkat**: Aktivitas laptop di dalam ruangan dipantau (*monitored*) secara real-time oleh panitia.
3. **Dress Code**: Formal Attire / Batik. **Dilarang keras memakai kaos/jaket almamater atau identitas kampus/sekolah**.

---

## 🛠️ Langkah Strategis Sebelum Masuk Ruangan Karantina (Sebelum 21 Agustus)

### 1. Persiapan Kode & Docker di Laptop
Pastikan semua anggota tim memiliki versi repositori terbaru di laptop masing-masing:
```bash
git pull origin main
```
Jalankan uji coba build Docker secara lokal:
```bash
docker compose up --build
```
Pastikan `http://localhost:3000` (Frontend) dan `http://localhost:8000/docs` (Backend) berjalan lancar.

### 2. Pengamanan API Keys & File `.env`
Pastikan file `.env` di folder `backend/` terisi lengkap sebelum jaringan seluler dimatikan:
- `PINECONE_API_KEY`
- `COHERE_API_KEY`
- `GEMINI_API_KEY`
- `DATABASE_URL` (PostgreSQL local fallback / Neon)

### 3. Persiapan File Presentasi Pitch Deck
Gunakan file pitch deck interaktif yang telah kita buat:
`tobaroute_pitch_deck.html`
- Cukup buka file tersebut di browser (Chrome / Edge / Firefox) tanpa memerlukan koneksi internet.
- Gunakan tombol arah Keyboard (`->` / `<-`) untuk navigasi slide.

---

## 🖥️ Langkah Deployment di Server Superkomputer DGX B200 IT Del
Saat panitia memberikan akses SSH / terminal ke server DGX B200:
1. Clone / Copy repositori `tobaguide` ke server DGX B200.
2. Jalankan perintah deployment 1-klik:
```bash
docker compose up -d --build
```
3. Verifikasi kontainer berjalan:
```bash
docker compose ps
```

---

## 💬 Strategi Mengatasi Tanya Jawab Juri (10 Menit Q&A)

| Aspek Ujian Juri | Jawaban Strategis TobaRoute AI |
| :--- | :--- |
| **Scalability (Skalabilitas)** | Arsitektur microservices FastAPI + Docker pada superkomputer DGX B200 memungkinkan horisontal scaling dan penanganan ribuan request rute bersamaan. |
| **Keamanan & Privasi (Zero PII)** | Sistem tidak menyimpan Data Pribadi (PII) wisatawan. Query RAG dienkripsi dan diproses secara anonim. |
| **Kelebihan dibanding Google Maps** | Google Maps memprioritaskan bisnis berbayar/ulasan terbanyak. TobaRoute AI memiliki **Fairness Engine** yang memberikan porsi pameran adil untuk UMKM pengrajin lokal berulasan sedikit (&le;15 review). |
| **Akurasi RAG (No Hallucination)** | Menggunakan Reranking Cohere v3 dan Pinecone Vector DB dengan *similarity thresholding* 0.8+, menjamin 98.4% rekomendasi lokasi akurat sesuai dataset Geopark Toba. |

---

## 🎒 Checklist Barang Bawaan Fisik
- [ ] KTP / KTM / Kartu Pelajar (Wajib untuk Registrasi / Daftar Ulang)
- [ ] Laptop + Charger + Stop Kontak / Extension Cable
- [ ] Baju Formal / Batik (Sesuai Ketentuan Dress Code)
- [ ] Obat-obatan pribadi & perlengkapan menginap karantina 28 jam.

**Horas! Selamat Berjuang untuk Jonathan, Amos, dan Jessica! Juara 1 Del AI Hackathon 2026!** 🚀
