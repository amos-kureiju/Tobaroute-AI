# DOKUMEN SUBMISSION PRELIMINARY ROUND
## AI HACKATHON IT DEL 2026

---

### INFORMASI UMUM

- **Judul Solusi:** TobaRoute AI – Sistem Pemandu Wisata Cerdas & RAG Semantik Inklusif Pariwisata Danau Toba  
- **Nama Tim:** TobaRoute Innovators  
- **Ketua Tim:** Amos Baringbing  
- **Anggota Tim:** Septian Hutasoit, Nisha Gurning  
*(Catatan: Sesuai aturan panitia, nama institusi/kampus sengaja tidak dicantumkan demi menjaga anonimitas penilaian juri)*

---

### BAB 1: LATAR BELAKANG

Kawasan Strategis Pariwisata Nasional (KSPN) Danau Toba memiliki potensi kekayaan yang mencakup destinasi alam, warisan budaya Batak, kuliner khas, kerajinan tradisional (tenun Ulos), serta armada transportasi lokal seperti angkutan umum (angkot) dan kapal penyeberangan. Namun, potensi ini dihadapkan pada hambatan fragmentasi informasi digital. Data pariwisata tersebar dalam pelbagai format yang tidak terstruktur, tidak konsisten, dan belum terintegrasi menjadi pengetahuan yang mudah digunakan oleh wisatawan maupun pengambil keputusan.

Di sisi lain, dataset pariwisata yang disediakan panitia mencerminkan kondisi riil (*raw & uncleaned data*): mengandung duplikasi entitas, bidang kosong (*missing values*), alamat tekstual tanpa koordinat eksplisit, serta ulasan pengunjung yang heterogen. Kondisi ini menyebabkan mayoritas wisatawan hanya mengunjungi titik-titik populer (*overtourism*), sementara pelaku UMKM lokal, homestay keluarga, pengrajin ulos tradisional di pelosok desa, serta transportasi angkot lokal tidak mendapatkan eksposur digital yang adil (*under-represented*).

Untuk menjawab tantangan tersebut, tim mengusulkan **TobaRoute AI**, sebuah solusi berbasis Kecerdasan Buatan (AI) yang tidak hanya mampu melakukan *cleaning* dan ekstraksi pengetahuan dari dataset mentah, tetapi juga menghadirkan asisten pemandu wisata cerdas berbasis *Retrieval-Augmented Generation* (RAG) dan algoritma *Fairness Recommendation*. Solusi ini dirancang untuk memberikan panduan perjalanan yang presisi, kontekstual, inklusif, serta berorientasi pada pemerataan ekonomi masyarakat lokal di kawasan Danau Toba.

---

### BAB 2: ANALISIS PERMASALAHAN

#### 2.1 Masalah Utama (*Problem Statement*)
1. **Asimetri & Fragmentasi Informasi Pariwisata**: Wisatawan kesulitan menyusun perencanaan perjalanan yang dipersonalisasi (sesuai anggaran, waktu, dan preferensi budaya) karena data tempat, fasilitas, dan ulasan belum terhubung secara sistematis.
2. **Ketimpangan Eksposur Digital UMKM Lokal**: Algoritma rekomendasi konvensional berbasis jumlah ulasan populer mendiskriminasi pelaku usaha kecil dan destinasi *hidden gems* yang memiliki ulasan sedikit di platform digital.
3. **Keterbatasan Informasi Transportasi Lokal**: Informasi rute angkutan umum (angkot) dan jadwal penyeberangan tradisional minim terdigitalisasi, menyulitkan mobilitas wisatawan mandiri.

#### 2.2 Urgensi Penyelesaian Masalah
Pariwisata berkelanjutan di Danau Toba membutuhkan pemerataan manfaat ekonomi. Tanpa intervensi teknologi rekomendasi yang adil, wisatawan akan terus menumpuk di lokasi yang sama, memicu penurunan kualitas destinasi sekaligus meninggalkan UMKM lokal tanpa eksposur. Pengolahan dataset mentah Toba menjadi sistem pengetahuan terintegrasi merupakan langkah mendesak untuk meningkatkan *length of stay* dan keadilan ekonomi lokal.

#### 2.3 Sasaran Pengguna (*Beneficiaries*)
- **Wisatawan Domestik & Mancanegara**: Memperoleh rekomendasi kontekstual 24/7 dan peta navigasi rute lokal secara akurat.
- **Pelaku UMKM & Ekonomi Kreatif**: Pengrajin Ulos, pemilik homestay, dan warung makan lokal mendapatkan akses rekomendasi yang adil kepada wisatawan.
- **Pengelola Destinasi & Pemerintah Daerah**: Memperoleh wawasan berbasis data (*data-driven insights*) terkait persebaran wisatawan dan analisis kualitas layanan.

---

### BAB 3: DESAIN & INDIKATOR KEBERHASILAN

#### 3.1 Konsep Solusi (*TobaRoute AI*)
**TobaRoute AI** adalah platform pemandu wisata cerdas yang menggabungkan *Retrieval-Augmented Generation* (RAG), pencarian semantik vektor, *Geospatial Routing Engine*, dan *Fairness Scoring Engine*.

##### Fitur Unggulan Solusi:
1. **Smart Conversational Assistant (RAG)**: Chatbot interaktif 24 jam berbasis LLM yang menjawab pertanyaan wisatawan secara akurat berdasarkan pengetahuan dataset riil Toba.
2. **Fairness Recommendation Engine**: Algoritma yang secara otomatis memberikan dorongan bobot (*fairness boost*) pada UMKM berulasan sedikit ($\le 15$ ulasan) agar tetap muncul dalam opsi rekomendasi.
3. **Interactive Geospatial & Multimodal Routing**: Visualisasi peta interaktif dengan kalkulasi rute jalan nyata, estimasi biaya, dan pilihan moda transportasi lokal (angkot).
4. **Data Quality & Entity Resolution Pipeline**: Pipeline otomatis untuk membersihkan duplikasi entitas data mentah panitia dan mengamankan koordinat lokasi.

#### 3.2 Arsitektur Sistem
```text
[Dataset Mentah Toba] ──> [Data Pipeline: Cleaning & Geocoding] ──> [Pinecone Vector DB & Postgres]
                                                                              │
[Kueri Wisatawan]     ──> [Fairness RAG Engine + Cohere LLM] ─────────────────┤
                                                                              ▼
[Leaflet Interactive Map] <── [Visual Rute & Rekomendasi Inklusif TobaRoute AI]
```

#### 3.3 Indikator Keberhasilan (*KPIs*)
- **Ketepatan Pencarian Semantik (*Retrieval Accuracy*)**: Target > 85.0%, Hasil = 100.0%.
- **Rasio Rekomendasi UMKM (*Fairness Rate*)**: Target > 35.0%, Hasil = 41.59%.
- **Kecepatan Respon Sistem (*Latency*)**: < 2.5 detik per kueri RAG.

---

### BAB 4: PERENCANAAN IMPLEMENTASI

#### 4.1 Rencana Pengembangan (Roadmap & Onsite Final)
- **Tahap Preliminary (Saat Ini)**:
  1. *Pembersihan & Anotasi Dataset*: Deduplikasi entitas, ekstraksi kecamatan (Balige, Laguboti, Muara, Silaen), dan integrasi koordinat GPS.
  2. *Pengembangan Engine RAG & Fairness*: Penyetelan *vector store* Pinecone, model embedding Cohere, dan skrip evaluasi kuantitatif.
  3. *Antarmuka Web Prototype*: Peta interaktif Leaflet dan UI chatbot responsif.
- **Tahap Onsite Final (Rencana Rilis)**:
  1. *Deployment Infrastructure*: Deployment sistem secara intensif di infrastruktur **DGX B200 IT Del**.
  2. *Pengembangan Fitur Lanjutan*: Fitur *Crowding Indicator* (pemantauan kepadatan lokasi), *Live Sentiment Analytics* dari ulasan pengunjung, serta dukungan multibahasa (Bahasa Batak & Bahasa Inggris).

#### 4.2 Mitigasi Risiko, Etika & Privasi AI
- **Mitigasi Halusinasi LLM**: Menerapkan *Strict Prompt Engineering* di mana LLM hanya diizinkan menjawab berdasarkan dokumen konteks yang ditemukan dari database.
- **Privasi & Etika Data**: Tidak mengumpulkan atau menyimpan data personal sensitif (*zero PII storage*), bebas pelacakan pengguna, dan memberikan atribusi transparan pada sumber data panitia.

---

### BAB 5: MODELLING (PENDEKATAN TEKNIS & DATA)

#### 5.1 Pemanfaatan Dataset Panitia & Data Cleaning Pipeline
Menggunakan dataset resmi panitia (*destinasi wisata, akomodasi, kuliner, transportasi, budaya/UMKM, fasilitas umum, dan ulasan pengunjung*).  
Proses transformasi data meliputi:
1. **Entity Resolution**: Menggabungkan variasi ejaan entitas sama (misal: "RM. Fly Over" dan "Rumah Makan Flyover Laguboti").
2. **Text Chunking**: Membagi ulasan dan deskripsi tempat menjadi potongan (*chunks*) 500–800 karakter menggunakan LangChain `RecursiveCharacterTextSplitter`.
3. **Vector Embedding**: Mengonversi teks menjadi vektor numerik menggunakan model Cohere Multilingual Embed.

#### 5.2 Algoritma Fairness Scoring
Rekomendasi tempat diurutkan menggunakan formula skor kombinasi S_i:

S_i = alpha * Sim(Q, D_i) + beta * Rating_i + gamma * Boost_UMKM

- Sim(Q, D_i): Skor kemiripan vektor antara kueri wisatawan Q dan dokumen D_i.
- Boost_UMKM: Nilai insentif positif untuk entitas usaha lokal dengan jumlah ulasan <= 15.

---

### BAB 6: EVALUASI MODEL

Evaluasi teknis dilakukan secara kuantitatif menggunakan skrip pengujian benchmark internal (`rag_evaluator.py`) terhadap sampel kueri skenario pariwisata Toba.

#### Tabel 6.1 Hasil Evaluasi Kuantitatif Engine RAG TobaRoute AI
| Parameter Evaluasi | Target Metrik | Hasil Pengujian | Status Performa |
| :--- | :---: | :---: | :---: |
| **Total Skenario Kueri Benchmark** | 4 Skenario Kompleks | 4 / 4 Teruji | Valid |
| **Retrieval Accuracy (%)** | > 85.0% | **100.0%** | **Sangat Akurat** |
| **Rasio Rekomendasi UMKM (Fairness Exposure)** | > 35.0% | **41.59%** | **Melampaui Target** |
| **Rata-rata Latensi Respons RAG** | < 3.0 detik | **1.85 detik** | **Sangat Cepat** |

#### Analisis Evaluasi:
- **Retrieval Accuracy (100%)**: Modul RAG secara presisi menarik data spesifik mengenai kuliner lokal (seperti Mie Gompa / RM Sinar Minang) dan transportasi angkot Balige–Onanrunggu.
- **Fairness Exposure (41.59%)**: Algoritma *Fairness Scoring* terbukti mampu menghadirkan rekomendasi penginapan homestay dan pengrajin ulos lokal sebesar 41.59% dari total rekomendasi, mencegah dominasi tempat populer.

---

### BAB 7: HASIL DAN PEMBAHASAN

#### 7.1 Hasil Inovasi Solusi
Melalui integrasi data pariwisata Toba dan AI RAG Inklusif, **TobaRoute AI** menghadirkan keunggulan nyata:
1. **Pengalaman Wisata Terintegrasi**: Wisatawan dapat merencanakan perjalanan secara mandiri dengan panduan rute jalan nyata dan informasi transportasi lokal yang jelas.
2. **Pemerataan Ekonomi Wisata**: Terbuka ruang promosi digital yang adil bagi UMKM lokal dan *hidden gems* di kawasan Danau Toba.

#### 7.2 Diferensiasi Keunikan Inovasi
Dibandingkan aplikasi pencarian konvensional (seperti Google Maps atau Traveloka), **TobaRoute AI** memiliki diferensiasi utama pada **Fairness Recommendation Engine** yang berpihak pada ekonomi lokal Toba serta integrasi pengetahuan rute angkutan umum tradisional yang belum pernah ada sebelumnya.

---

### BAB 8: DEKLARASI PENGGUNAAN AI

Tim peserta menyatakan transparansi penuh dalam penggunaan teknologi Kecerdasan Buatan:
1. **Model Generatif & Embedding**: Menggunakan `Cohere Multilingual Embedding` untuk pencarian vektor dan `Cohere Command-R / Gemini 3.1 Flash Lite` sebagai *engine* sintesis jawaban RAG pada backend.
2. **Framework & Analytics**: Framework `LangChain` untuk manajemen alur kerja RAG dan library Python `Scikit-Learn` untuk kalkulasi skor similarity.
3. **Pernyataan Tanggung Jawab**: Seluruh kerangka analisis, formulasi algoritma *Fairness Scoring*, perancangan antarmuka, dan interpretasi data diselesaikan secara mandiri dan bertanggung jawab oleh tim peserta.
