# BAB II
## PROJECT PLANNING (PP)
### (PERENCANAAN PENGEMBANGAN PRODUK)

### 2.1. PENDAHULUAN
Proyek ini dilaksanakan sebagai bagian dari pengembangan **Website Layanan Pemandu Wisata Cerdas Danau Toba (TobaRoute AI) dengan Fitur Chatbot RAG Semantik, Geospatial Routing, dan Integrasi Otomatisasi n8n**. Website ini dirancang untuk membantu proses pelayanan informasi pariwisata secara digital melalui sistem berbasis web yang dapat digunakan oleh wisatawan, pelaku UMKM lokal, dan admin. Sistem yang dikembangkan menyediakan berbagai fitur utama, seperti pengelolaan data destinasi, rekomendasi UMKM inklusif (*Fairness Scoring*), peta rute transportasi umum (angkot), chatbot berbasis AI RAG, serta notifikasi otomatis untuk pengingat itinerari perjalanan wisata.

Integrasi n8n digunakan untuk mendukung proses otomatisasi layanan pengiriman notifikasi pengingat via WhatsApp sehingga operasional pelayanan pariwisata dapat berjalan lebih efektif dan efisien. Penyusunan dokumen *Project Planning* ini bertujuan untuk merencanakan tahapan pengembangan produk secara terstruktur, mulai dari analisis kebutuhan, perancangan sistem, implementasi, pengujian, hingga peluncuran sistem. Dokumen ini juga digunakan sebagai pedoman bagi tim pengembang agar proyek dapat berjalan sesuai dengan kebutuhan, estimasi waktu, alokasi sumber daya, dan tujuan yang telah ditetapkan.

---

### 2.2. DESKRIPSI PROYEK
Proyek ini merupakan pengembangan Website Layanan Pemandu Wisata Cerdas Danau Toba (**TobaRoute AI**) yang bertujuan untuk meningkatkan kualitas pelayanan pariwisata dan mendorong pemerataan ekonomi lokal melalui pemanfaatan teknologi digital berbasis AI. Website ini digunakan untuk menyediakan informasi destinasi terintegrasi, mengelola data usaha lokal (kuliner, homestay, kerajinan Ulos), memfasilitasi perencanaan itinerari rute wisata, serta membantu komunikasi interaktif antara wisatawan dan sistem pariwisata Danau Toba.

Sistem dilengkapi dengan chatbot berbasis AI RAG (*Retrieval-Augmented Generation*) yang dapat memberikan rekomendasi pariwisata secara otomatis dan akurat kepada pengguna, serta notifikasi otomatis untuk mengingatkan wisatawan mengenai jadwal perjalanan yang telah disusun. Integrasi n8n digunakan untuk mendukung proses otomatisasi layanan sehingga operasional informasi pariwisata menjadi lebih efektif dan efisien. Website ini digunakan oleh wisatawan, pelaku UMKM lokal, dan admin sesuai dengan fungsi dan hak akses masing-masing. Proyek dikembangkan menggunakan metode Waterfall agar proses pengembangan sistem dapat berjalan secara terstruktur dan sesuai dengan kebutuhan pengguna.

---

#### 2.2.1. Project Organization

**Gambar 2. 1 Project Organization**

Struktur organisasi proyek Website Layanan Pemandu Wisata Cerdas Danau Toba (**TobaRoute AI**) terdiri dari tiga peran utama dengan tugas dan tanggung jawab masing-masing sebagai berikut:

1. **Project Manager & System Analyst (Nisha Gurning)**
   - Bertugas mengatur jalannya proyek dan menyusun alokasi waktu pengerjaan.
   - Menganalisis kebutuhan fungsional dan non-fungsional sistem pariwisata.
   - Menyusun dokumentasi proyek (*Product Requirement Specification*, *Project Planning*, hingga Laporan Akhir).
   - Memastikan seluruh tahapan pengembangan berjalan sesuai dengan rencana dan tepat waktu.

2. **Frontend & UI/UX Developer (Amos Baringbing)**
   - Bertanggung jawab dalam perancangan desain antarmuka (*wireframe* & *mockup*) website agar responsif dan ramah pengguna (*user-friendly*).
   - Mengembangkan komponen antarmuka pengguna berbasis Next.js, React, dan Tailwind CSS.
   - Mengintegrasikan peta interaktif geospatial (Leaflet / Leaflet Routing Machine) untuk visualisasi rute perjalanan dan lokasi UMKM.
   - Memastikan antarmuka website berjalan optimal di berbagai perangkat (desktop dan seluler).

3. **Backend Developer & AI Chatbot Engineer (Septian Hutasoit)**
   - Bertugas mengembangkan *REST API* backend menggunakan framework FastAPI.
   - Mengelola basis data relasional PostgreSQL (Neon.tech) dan *vector database* Pinecone.
   - Mengembangkan *pipeline* RAG (*Retrieval-Augmented Generation*) menggunakan LangChain dan Cohere AI.
   - Mengimplementasikan algoritma *Fairness Recommendation Engine* untuk dorongan rekomendasi UMKM.
   - Mengonfigurasi integrasi workflow n8n untuk otomatisasi pengingat WhatsApp.

---

#### 2.2.2. Work Breakdown Structure (WBS)

Work Breakdown Structure (WBS) digunakan untuk membagi proyek menjadi bagian-bagian pekerjaan kecil yang lebih mudah dikelola. Dengan WBS, setiap tahap pengembangan dapat dikontrol dengan lebih efisien, memastikan alokasi sumber daya yang tepat, serta mempermudah pemantauan progres proyek.

**Gambar 2. 2 Work Breakdown Structure (WBS)**

Rincian tahapan pekerjaan dalam WBS proyek **TobaRoute AI** meliputi:
1. **Inisiasi & Analisis Kebutuhan**:
   - Pengumpulan dataset pariwisata Toba (destinasi, akomodasi, kuliner, angkot, UMKM, ulasan).
   - Analisis kebutuhan pengguna (wisatawan, UMKM, admin).
   - Pembuatan dokumen *Product Requirement Specification* (PRS).
2. **Perancangan Sistem (Design)**:
   - Perancangan arsitektur sistem dan alur kerja RAG.
   - Perancangan database (ERD, CDM, PDM).
   - Perancangan UI/UX antarmuka website dan peta rute.
   - Perancangan workflow n8n.
3. **Implementasi & Pengkodean (Implementation)**:
   - *Data Preprocessing & Chunking*: Deduplikasi data mentah dan *vector embedding* ke Pinecone.
   - Pengembangan backend API (FastAPI) dan integrasi model Cohere LLM.
   - Pengembangan frontend (Next.js) dan peta interaktif (Leaflet).
   - Penyiapan otomatisasi pesan WhatsApp via n8n.
4. **Pengujian Sistem (Testing)**:
   - Pengujian fungsionalitas (*Black Box Testing*).
   - Evaluasi kuantitatif RAG (*Retrieval Accuracy* & *Fairness Rate* via `rag_evaluator.py`).
   - Pengujian responsivitas dan latensi sistem.
5. **Peluncuran & Dokumentasi (Release & Closure)**:
   - Penyusunan dokumen *Product Release* dan panduan pengguna.
   - *Deployment* aplikasi web ke server cloud.

---

#### 2.2.3. Budget

##### Tabel 2. 1 Budget yang Diperlukan
| Biaya Pengembangan Proyek | Jumlah | Satuan | Total |
| :--- | :---: | :---: | :---: |
| **A. Biaya selama tahapan pengembangan perangkat lunak** | | | |
| 1. Requirement Gathering (Survei & Pengumpulan Data Toba) | 1 | Rp 50.000 | Rp 50.000 |
| 2. Analisis Kebutuhan Sistem | 1 | Rp 0 | Rp 0 |
| 3. Desain UI/UX & Arsitektur | 1 | Rp 0 | Rp 0 |
| 4. Implementasi & Pengkodean | 1 | Rp 0 | Rp 0 |
| 5. Pengujian & Evaluasi Model RAG | 1 | Rp 0 | Rp 0 |
| 6. Maintenance & Deployment | 1 | Rp 0 | Rp 0 |
| **Total A** | | | **Rp 50.000** |
| **B. Biaya untuk pengembang perangkat lunak** | | | |
| 1. Project Manager & System Analyst | 1 | Rp 0 | Rp 0 |
| 2. Frontend & UI/UX Developer | 1 | Rp 0 | Rp 0 |
| 3. Backend Developer & AI Chatbot Engineer | 1 | Rp 0 | Rp 0 |
| **Total B** | | | **Rp 0** |
| **C. Biaya tak terduga** | | | |
| 1. Kunjungan ulang survei data lapangan jika terjadi ketidaksesuaian | 1 | Rp 0 | Rp 0 |
| 2. Perbaikan perangkat komputer jika mengalami kerusakan ringan | 1 | Rp 0 | Rp 0 |
| **Total C** | | | **Rp 0** |
| **TOTAL BIAYA PROYEK** | | | **Rp 50.000** |

---

#### 2.2.4. Tools

Tabel berikut menjelaskan alat dan teknologi yang digunakan selama proses pengembangan proyek **TobaRoute AI**, termasuk alasan pemilihannya:

##### Tabel 2. 2 Tools Pengembangan & Manajemen Proyek
| No | Hardware / Software | Tool Management Proyek | Alat Bantu Kolaborasi Tim | Tools Simulasi, Desain, & Pengujian | Alasan Pemilihan Tools |
| :---: | :--- | :--- | :--- | :--- | :--- |
| 1. | Komputer / Laptop Developer | Trello | GitHub | Visual Studio Code, Balsamiq / Figma | VS Code digunakan karena ringan, fleksibel, dan memiliki ekosistem ekstensi yang luas untuk mendukung Next.js, Python, dan TypeScript. Figma/Balsamiq digunakan untuk merancang *mockup* antarmuka. |
| 2. | Internet Stabil | - | WhatsApp Group | Node.js, npm | Node.js dan npm mendukung ekosistem runtime untuk menjalankan framework Next.js pada sisi frontend. |
| 3. | Server Local / Hosting | - | GitHub Cloud | PostgreSQL (Neon.tech), FastAPI, Swagger UI | PostgreSQL pada Neon.tech digunakan untuk pengelolaan database relasional serverless, dan FastAPI dipadukan dengan Swagger UI untuk pengujian *endpoint API* secara interaktif. |
| 4. | Cloud Instance | - | GitHub | n8n Workflow, Pinecone, Cohere API, Draw.io | n8n dipilih untuk otomatisasi pesan notifikasi WhatsApp secara *open-source*, Pinecone sebagai database vektor berkecepatan tinggi, dan Draw.io untuk perancangan diagram arsitektur. |
| 5. | Laptop Development | - | - | Tailwind CSS, Next.js, Leaflet Maps | Next.js dan Tailwind CSS dipilih untuk menghasilkan antarmuka modern yang cepat dan responsif, sementara Leaflet digunakan untuk peta rute interaktif. |

---

#### 2.2.5. Resiko dan Hambatan

Dalam proses pengembangan **Website Layanan Pemandu Wisata Cerdas Danau Toba (TobaRoute AI)**, terdapat beberapa risiko dan hambatan yang mungkin terjadi. 

1. **Risiko Internal & Manajerial**:
   - *Keterlambatan Pengerjaan Proyek*: Disebabkan oleh pembagian tugas yang kurang seimbang atau kendala teknis saat integrasi *vector database*.
   - *Koneksi Internet Tidak Stabil*: Dapat menghambat proses *embedding* data pariwisata ke Pinecone dan sinkronisasi repositori GitHub.
   - *Kemunculan Bug / Halusinasi LLM*: Model AI generatif dapat memberikan jawaban yang tidak sesuai dengan data riil destinasi Toba jika *prompting* tidak ketat.
   - **Mitigasi**: Tim melakukan pembagian tugas yang jelas, evaluasi harian progres proyek, backup data rutin di GitHub, serta menerapkan *Strict Context RAG Prompting* untuk mencegah halusinasi AI.

2. **Hambatan Eksternal**:
   - *Perubahan / Ketidaklengkapan Data Lapangan*: Data alamat tekstual mentah panitia yang belum memiliki koordinat latitude/longitude eksplisit.
   - *Keterbatasan Batas Penggunaan (Rate Limit) API Pihak Ketiga*: Batasan pemanggilan API gratis dari Cohere AI, Pinecone, atau WhatsApp Gateway.
   - **Mitigasi**: Tim memanfaatkan skrip *geocoding* otomatis untuk melengkapi koordinat lokasi, melakukan *caching* respons kueri yang sering ditanyakan, serta menyiapkan *fallback model* alternatif apabila API utama mengalami kedaluwarsa atau *downtime*.
