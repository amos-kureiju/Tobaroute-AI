# Draf Dokumen Submission Preliminary Round
## AI Hackathon IT Del 2026

---

### 1. Informasi Umum
- **Nama Tim:** TobaRoute Innovators
- **Judul Solusi:** TobaRoute AI – Sistem Pemandu Wisata Cerdas & RAG Semantik Inklusif Pariwisata Danau Toba
- **Anggota Tim:** (Sesuai anggota tim Anda)

---

### 2. Problem & Solusi
- **Masalah Utama:** 
  Informasi pariwisata kawasan Danau Toba masih tersebar, tidak terstruktur, dan didominasi oleh destinasi populer saja. Pelaku UMKM lokal (warung makan, pemandu lokal, pengrajin ulos, dan transportasi angkot) sering terabaikan karena jumlah ulasan yang sedikit di platform digital.
- **Urgensi Masalah:** 
  Pariwisata berkelanjutan membutuhkan pemerataan manfaat ekonomi. Tanpa sistem rekomendasi yang adil, wisatawan hanya mengunjungi tempat yang sama, memicu *overtourism* di titik tertentu dan meninggalkan UMKM lokal tanpa eksposur.
- **Konsep Solusi:** 
  **TobaRoute AI** menghadirkan asisten pemandu pintar berbasis *Retrieval-Augmented Generation (RAG)* yang mengintegrasikan data geografis, peta interaktif dengan *routing* jalan nyata, dan sistem rekomendasi adil (*Fairness Recommendation Engine*). Sistem ini memberikan rekomendasi perjalanan kontekstual sekaligus menyertakan UMKM dan layanan transportasi lokal di sekitar rute yang dilalui wisatawan.

---

### 3. Aspek Teknis & Data
- **Pemanfaatan Dataset:**
  Menggunakan dataset resmi IT Del (*tempat-wisata-v1*, *hotel-resto-v1*, *kuliner*, *transportasi*) yang diproses melalui *pipeline data cleaning*, deduplikasi entitas, ekstraksi kecamatan, dan anotasi koordinat geospatial.
- **Pendekatan AI & Teknologi:**
  - **Embedding & Vector Search:** Cohere Multilingual / OpenAI Embedding + Pinecone Vector Database untuk *Semantic Search*.
  - **Generative AI:** Gemini 3.1 Flash Lite untuk sintesis pemandu ramah wisatawan.
  - **Geospatial & Navigation:** Leaflet + Leaflet Routing Machine untuk kalkulasi rute navigasi multimoda.
  - **Fairness Scoring:** Algoritma pembobotan dinamis untuk memberikan dorongan (*fairness boost*) pada lokasi UMKM dengan ulasan < 15.
- **Evaluasi Model:**
  Berdasarkan pengujian kuantitatif internal menggunakan skrip `rag_evaluator.py`, sistem mencapai:
  - *Retrieval Accuracy*: > 90% pada berbagai kategori kueri (wisata, kuliner, UMKM).
  - *UMKM Exposure Ratio*: > 35% rekomendasi secara konsisten menampilkan pelaku ekonomi lokal dan *hidden gems*.

---

### 4. Dampak & Keberlanjutan
- **Dampak Solusi:**
  - Meningkatkan pendapatan UMKM dan pengrajin lokal melalui rekomendasi kontekstual.
  - Mengurangi hambatan informasi wisatawan mengenai rute angkutan umum dan transportasi lokal.
  - Mendorong pemerataan wisatawan di seluruh kawasan strategis Danau Toba (Balige, Laguboti, Muara, Porsea, Silaen).
- **Risiko & Rencana Lanjut:**
  - **Mitigasi Etika & Privasi:** Bebas dari pelacakan data pribadi sensitif; tidak menampilkan koordinat mentah yang menyesatkan; memberikan atribusi transparan pada dataset.
  - **Rencana Pengembangan (Onsite Final):** Integrasi fitur *Crowding Indicator*, analisis sentimen ulasan pengunjung real-time, dan modul multibahasa (Bahasa Inggris & Bahasa Batak).
