# BAB I
## PRODUCT REQUIREMENT SPECIFICATION (SPESIFIKASI KEBUTUHAN PRODUK)

### 1.1. PENDAHULUAN
Dokumen ini berisi penjelasan mengenai kebutuhan produk untuk **Pengembangan Website Layanan Pemandu Wisata Cerdas Danau Toba (TobaRoute AI) dengan Fitur Chatbot RAG Semantik, Geospatial Routing, dan Integrasi Otomatisasi n8n**. Website ini dikembangkan untuk membantu proses pelayanan informasi pariwisata secara digital, mempermudah pengolahan data pariwisata Toba yang heterogen, serta meningkatkan efektivitas komunikasi antara wisatawan dan ekosistem pariwisata Danau Toba.

Sistem yang dikembangkan memiliki tiga jenis pengguna, yaitu wisatawan (user), pelaku UMKM/mitra lokal, dan admin (administrator), yang masing-masing memiliki hak akses dan fungsi sesuai dengan kebutuhan operasional pariwisata. Wisatawan dapat melakukan registrasi akun, melihat informasi destinasi pariwisata, menyusun *booking* itinerari perjalanan, menerima notifikasi pengingat rute wisata, serta menggunakan fitur chatbot untuk memperoleh informasi rekomendasi secara cepat. Pelaku UMKM/mitra lokal dapat mengelola profil usaha seperti kuliner, akomodasi homestay, dan kerajinan tangan tradisional. Sementara itu, admin bertanggung jawab dalam mengelola data destinasi, mengontrol pipeline pembersihan data, serta mengelola sinkronisasi pengetahuan AI (*AI Knowledge Ingestion*).

Website ini dilengkapi dengan fitur chatbot berbasis Artificial Intelligence (AI) yang berfungsi sebagai asisten pemandu virtual untuk membantu wisatawan memperoleh informasi mengenai objek wisata, rekomendasi kuliner, jadwal transportasi angkutan umum (angkot), prosedur kunjungan, serta menjawab pertanyaan umum yang sering diajukan wisatawan. Dengan adanya chatbot berbasis *Retrieval-Augmented Generation* (RAG), layanan informasi dapat diakses selama 24 jam tanpa harus menunggu respon langsung dari pusat informasi wisata lokal.

Selain itu, sistem juga mengintegrasikan platform otomatisasi workflow n8n untuk mendukung berbagai proses otomatis dalam website. Integrasi n8n digunakan untuk mengelola pengiriman notifikasi pengingat jadwal itinerari perjalanan kepada wisatawan yang telah menyusun rencana wisata, sehingga membantu mengurangi risiko wisatawan terlewat jadwal transportasi atau jam operasional destinasi. Penggunaan n8n juga memungkinkan proses pertukaran data dan otomatisasi layanan berjalan lebih efisien tanpa memerlukan intervensi manual secara terus-menerus.

Pengembangan website ini dilakukan secara bertahap dengan mengikuti tahapan pengembangan perangkat lunak yang meliputi analisis kebutuhan, perancangan sistem, implementasi, pengujian, hingga pemeliharaan. Dengan adanya sistem ini, diharapkan kualitas pelayanan pariwisata di kawasan Danau Toba dapat meningkat, proses pengelolaan data destinasi menjadi lebih terstruktur, serta wisatawan dapat memperoleh layanan pariwisata yang lebih mudah, cepat, inklusif, dan efisien.

**Gambar 1. 1 Siklus Proses Pengembangan Produk**

Tahapan-tahapan dalam siklus pengembangan produk adalah sebagai berikut:
1. **Product Requirement Specification**: Pada tahap ini dilakukan pengumpulan kebutuhan sistem, seperti fitur apa saja yang dibutuhkan dalam website, peta rute interaktif, dan chatbot AI.
2. **Project Planning**: Tahap ini berisi perencanaan pengerjaan proyek, seperti pembagian tugas tim, waktu pengerjaan, dan kebutuhan sumber daya lainnya.
3. **Product Design**: Pada tahap ini dibuat desain tampilan website (*wireframe*), struktur database (ERD/CDM/PDM), arsitektur RAG, serta alur kerja chatbot dan n8n.
4. **Product Implementation**: Tahap ini adalah proses pembuatan website, pembuatan REST API backend, dan integrasi fitur chatbot AI RAG sesuai dengan desain yang telah dibuat.
5. **Product Testing**: Pada tahap ini dilakukan pengujian fungsional, pengujian RAG *retrieval accuracy*, dan pengujian *fairness recommendation rate* untuk memastikan semua fitur berjalan dengan baik tanpa kesalahan.
6. **Product Release**: Tahap terakhir adalah peluncuran website agar dapat digunakan oleh wisatawan, pelaku UMKM, dan pengelola pariwisata Toba.

---

#### 1.1.1. Tujuan Penulisan Dokumen
Dokumen ini dibuat untuk menjelaskan kebutuhan sistem pada Pengembangan Website Layanan Pemandu Wisata Cerdas Danau Toba (TobaRoute AI) dengan Fitur Chatbot RAG Semantik, Geospatial Routing, dan Integrasi Otomatisasi n8n. Dokumen ini menjadi acuan bagi tim pengembang dalam merancang, mengimplementasikan, dan menguji sistem agar sesuai dengan kebutuhan pengguna, yaitu wisatawan, pelaku UMKM lokal, dan admin. Selain itu, dokumen ini memberikan gambaran mengenai fitur-fitur yang terdapat dalam sistem, seperti *route planner*, chatbot RAG inklusif, *Fairness Recommendation Engine*, dan notifikasi otomatis, sehingga proses pengembangan dapat berjalan secara terarah dan sesuai dengan tujuan yang diharapkan.

---

#### 1.1.2. Latar Belakang Produk
Perkembangan teknologi informasi telah mendorong berbagai sektor, termasuk sektor pariwisata, untuk melakukan transformasi digital guna meningkatkan kualitas pelayanan kepada masyarakat dan wisatawan. Salah satu bentuk transformasi tersebut adalah pemanfaatan website dan sistem cerdas sebagai media informasi pariwisata yang dapat diakses dengan mudah oleh wisatawan kapan saja dan di mana saja. Kawasan Danau Toba (seperti Balige, Laguboti, Muara, Porsea, dan Silaen) merupakan salah satu Kawasan Strategis Pariwisata Nasional (KSPN) unggulan di Indonesia. Sebelum dilaksanakannya pengembangan sistem, informasi pariwisata Danau Toba tersebar di berbagai platform yang tidak terintegrasi, tidak konsisten, dan didominasi oleh lokasi populer saja, sehingga destinasi *hidden gems* dan UMKM lokal sulit ditemukan oleh wisatawan melalui internet.

Meskipun terdapat media informasi pariwisata dasar yang tersedia di internet, sistem tersebut masih memiliki keterbatasan karena belum mampu memberikan layanan interaktif yang dipersonalisasi kepada wisatawan. Wisatawan masih harus mencari informasi secara manual di berbagai sumber untuk mengetahui rute angkutan umum (angkot), estimasi biaya, dan penginapan homestay, sehingga proses perencanaan perjalanan membutuhkan waktu yang relatif lebih lama dan sering menyebabkan *overtourism* di titik-titik tertentu.

Untuk mengatasi permasalahan tersebut, dilakukan pengembangan Website Layanan Pemandu Wisata Cerdas Danau Toba (**TobaRoute AI**) dengan menambahkan fitur chatbot berbasis kecerdasan buatan dan peta rute interaktif. Chatbot yang dikembangkan menggunakan metode *Retrieval-Augmented Generation* (RAG) (Swacha and Gracel 2025), yaitu pendekatan yang menggabungkan kemampuan Large Language Model (LLM) dengan basis pengetahuan data riil pariwisata Toba sehingga dapat memberikan jawaban yang lebih relevan dan akurat (Vidivelli, Ramachandran, and Dharunbalaji 2024). Melalui chatbot ini, wisatawan dapat memperoleh informasi mengenai destinasi, rute angkutan lokal, rekomendasi kuliner, serta berbagai pertanyaan pariwisata lainnya secara otomatis selama 24 jam.

Selain itu, sistem juga dilengkapi dengan tiga role pengguna, yaitu Wisatawan (User), Pelaku UMKM (Mitra), dan Admin, untuk mendukung pengelolaan layanan dan data secara lebih terstruktur. Sistem diintegrasikan dengan platform otomatisasi n8n yang berfungsi untuk membantu proses pengiriman notifikasi pengingat itinerari secara otomatis sehingga meningkatkan efisiensi pengalaman perjalanan wisatawan. Dengan adanya pengembangan website ini, diharapkan pariwisata Danau Toba dapat memberikan pelayanan yang lebih cepat, modern, inklusif, dan efisien, serta meningkatkan kemudahan akses informasi dan kualitas ekonomi masyarakat lokal.

---

#### 1.1.3. Tujuan Produk
Proyek ini bertujuan mengembangkan Website Layanan Pemandu Wisata Cerdas Danau Toba (**TobaRoute AI**) yang dilengkapi chatbot AI berbasis RAG, *Fairness Recommendation Engine*, dan integrasi n8n. Sistem memungkinkan wisatawan memperoleh informasi pariwisata akurat, menyusun itinerari perjalanan dan rute navigasi secara online, serta menerima notifikasi pengingat perjalanan melalui WhatsApp secara otomatis.

---

#### 1.1.4. Ruang Lingkup Produk
Adapun ruang lingkup proyek ini adalah:

1. **Cakupan Produk**
   a. Website TobaRoute AI dikembangkan berbasis web menggunakan teknologi modern seperti Next.js, TypeScript, Tailwind CSS, FastAPI, dan database PostgreSQL (Neon.tech).  
   b. Sistem digunakan sebagai media informasi dan pemandu pariwisata secara online untuk memudahkan wisatawan memperoleh informasi destinasi, rute angkutan umum, serta menggunakan fitur chatbot AI RAG.  
   c. Website menyediakan fitur pengelolaan data destinasi, rekomendasi UMKM lokal, rute transportasi (angkot), perencana itinerari, dan artikel budaya Batak.  
   d. Sistem memiliki halaman admin yang digunakan untuk mengelola data pariwisata, data pengguna, data UMKM, serta sinkronisasi *AI Knowledge Base* (Ingestion).  
   e. Fitur utama sistem meliputi:  
      - Perencana Rute & Itinerari Online (Geospatial Routing)  
      - Chatbot AI Berbasis RAG (*Retrieval-Augmented Generation*)  
      - *Fairness Recommendation Engine* untuk UMKM  
      - Dashboard Admin Pengelolaan & Ingestion Data  
      - Notifikasi Pengingat Wisata Menggunakan n8n  
   f. Website dirancang dengan tampilan yang modern, responsif, dan mudah digunakan oleh wisatawan, pelaku UMKM, maupun admin.  
   g. Sistem chatbot menggunakan teknologi LangChain, Cohere AI, dan Pinecone Vector Database untuk membantu pengguna memperoleh informasi secara otomatis berdasarkan data dan dokumen pariwisata Toba.  
   h. Integrasi n8n digunakan untuk mengotomatisasi pengiriman notifikasi pengingat jadwal itinerari perjalanan kepada wisatawan.

2. **Pengguna Produk**
   a. **Wisatawan/Pengunjung**: Pengguna yang mengakses website untuk melihat informasi destinasi, rekomendasi kuliner/homestay, membuat rencana perjalanan, menerima notifikasi pengingat, dan menggunakan fitur chatbot AI.  
   b. **Admin**: Pengguna yang bertugas mengelola data website, data destinasi, data UMKM, monitoring chatbot, dan melakukan sinkronisasi data pengetahuan AI.  
   c. **Pelaku UMKM / Mitra Lokal**: Pengguna yang mengelola profil usaha kuliner, homestay, atau kerajinan tangan tradisional (Ulos) agar terdaftar dalam sistem rekomendasi.

3. **Batasan Pengembangan**

##### Tabel 1. 1 Batasan Pengembangan
| Batasan Teknis | Batasan Non-Teknis |
| :--- | :--- |
| Sistem hanya berbasis website responsif dan belum mendukung aplikasi mobile native (Android/iOS) secara khusus. | Sistem tidak menggantikan pemandu wisata fisik (*tour guide*) secara keseluruhan di lapangan. |
| Sistem memerlukan koneksi internet stabil untuk mengakses website, peta interaktif, dan layanan chatbot AI RAG. | Informasi pada website digunakan sebagai media informasi dan panduan awal perencanaan perjalanan pariwisata Danau Toba. |
| Sistem belum mendukung transaksi pembayaran booking tiket online secara otomatis. | Penggunaan sistem bergantung pada kemampuan pengguna dalam mengoperasikan perangkat browser website. |
| Sistem chatbot bergantung pada ketersediaan API pihak ketiga seperti Cohere AI dan Pinecone Vector Database. | Data dan layanan yang ditampilkan disesuaikan dengan cakupan wilayah dataset KSPN Danau Toba. |
| Website berjalan optimal pada browser modern seperti Google Chrome, Mozilla Firefox, dan Microsoft Edge. | Konten pengetahuan chatbot bergantung pada dokumen basis data yang diverifikasi oleh administrator. |

---

#### 1.1.5. Manfaat Produk
Pengembangan Website Layanan Pemandu Wisata Cerdas Danau Toba (**TobaRoute AI**) dengan fitur chatbot AI RAG dan integrasi otomatisasi n8n diharapkan dapat meningkatkan kualitas pelayanan pariwisata menjadi lebih cepat, inklusif, dan terorganisir.

Bagi **wisatawan**, website ini memudahkan dalam memperoleh informasi destinasi yang akurat, menyusun rute perjalanan interaktif, menerima notifikasi pengingat jadwal perjalanan, serta menggunakan chatbot untuk mendapatkan jawaban rekomendasi secara otomatis.

Bagi **pelaku UMKM lokal dan pengrajin tradisional**, sistem ini membantu meningkatkan eksposur usaha kecil yang selama ini kurang berulasan di internet melalui mekanisme *Fairness Recommendation Engine*.

Bagi **admin dan pengelola pariwisata**, sistem ini membantu proses pengelolaan data destinasi, analisis keterhubungan transportasi lokal, dan penyebaran wisatawan agar lebih efisien dan terstruktur.

Selain itu, integrasi otomatisasi n8n membantu mengotomatisasi pengiriman notifikasi pengingat perjalanan sehingga mendukung ekosistem pariwisata Toba yang lebih modern dan efektif.

---

#### 1.1.6. Definisi dan Singkatan

##### Tabel 1. 2 Daftar Definisi dan Singkatan
| No | Definisi / Singkatan | Keterangan |
| :---: | :--- | :--- |
| 1 | **RAG (Retrieval-Augmented Generation)** | Teknik AI yang menggabungkan pencarian informasi dari dokumen dengan kemampuan generatif model bahasa untuk menghasilkan jawaban yang relevan. |
| 2 | **API (Application Programming Interface)** | Mekanisme yang memungkinkan aplikasi atau sistem saling berkomunikasi dan bertukar data. |
| 3 | **LangChain** | Framework yang digunakan untuk menghubungkan LLM dengan database, dokumen, dan tools eksternal. |
| 4 | **Cohere AI** | Platform penyedia Large Language Model (LLM) dan Embedding yang digunakan sebagai model chatbot RAG. |
| 5 | **Pinecone** | Vector database yang digunakan untuk menyimpan embedding dokumen data pariwisata Toba. |
| 6 | **PostgreSQL** | Sistem manajemen database relasional yang digunakan untuk penyimpanan data aplikasi. |
| 7 | **Chatbot** | Program berbasis AI yang dapat berinteraksi dan menjawab pertanyaan pengguna secara otomatis. |
| 8 | **Embedding** | Representasi data dalam bentuk vektor numerik yang digunakan untuk memahami makna teks. |
| 9 | **Frontend** | Bagian antarmuka pengguna yang berinteraksi langsung dengan user. |
| 10 | **Backend** | Bagian sistem yang mengelola logika bisnis aplikasi, database, dan REST API. |
| 11 | **REST API** | Arsitektur API yang digunakan untuk komunikasi data antara frontend dan backend. |
| 12 | **Next.js** | Framework React yang digunakan untuk membangun frontend aplikasi web responsif. |
| 13 | **FastAPI** | Framework backend berbasis Python untuk membangun layanan API berkecepatan tinggi. |
| 14 | **Tailwind CSS** | Framework CSS utility-first yang digunakan untuk mendesain tampilan UI antarmuka website. |
| 15 | **TypeScript** | Bahasa pemrograman berbasis JavaScript yang memiliki fitur *type safety*. |
| 16 | **Docker** | Platform containerization untuk deployment dan distribusi aplikasi. |
| 17 | **Git** | Sistem version control untuk melacak perubahan kode program. |
| 18 | **GitHub** | Platform cloud untuk menyimpan dan mengelola repository proyek. |
| 19 | **n8n** | Platform workflow automation untuk otomatisasi pengiriman pesan dan proses sistem. |
| 20 | **LLM (Large Language Model)** | Model AI berbasis bahasa yang mampu memahami dan menghasilkan teks alami secara kontekstual. |

---

#### 1.1.7. Referensi
- Adamopoulou, Eleni, and Lefteris Moussiades. 2020. “Chatbots: History, Technology, and Applications.” *Machine Learning with Applications* 2: 100006. doi:10.1016/j.mlwa.2020.100006.
- Swacha, Jakub, and Michał Gracel. 2025. “Retrieval-Augmented Generation (RAG) Chatbots for Education & Tourism: A Survey of Applications.” *Applied Sciences* 15(8): 4234. doi:10.3390/app15084234.
- Vidivelli, S., Manikandan Ramachandran, and A. Dharunbalaji. 2024. “Efficiency-Driven Custom Chatbot Development: Unleashing LangChain, RAG, and Performance-Optimized LLM Fusion.” *Computers, Materials & Continua* 80(2): 2423–42. doi:10.32604/cmc.2024.054360.

---

### 1.2. DESKRIPSI UMUM PROYEK

#### 1.2.1. Permasalahan dan Persoalan
Kawasan Danau Toba merupakan destinasi wisata strategis yang kaya akan potensi alam dan budaya. Namun, proses pelayanan informasi dan perencanaan pariwisata yang berjalan saat ini masih menghadapi beberapa kendala karena belum adanya sistem digital yang terintegrasi secara cerdas. Data tempat wisata, penginapan, kuliner, dan angkutan lokal masih tersebar secara tidak terstruktur, mengandung duplikasi entitas, serta sulit diakses oleh wisatawan mandiri.

Selain itu, penyampaian rekomendasi pariwisata masih dilakukan secara konvensional atau didominasi oleh algoritma pencarian besar yang hanya mengunggulkan tempat populer, sehingga kurang efisien dan tidak adil bagi pelaku usaha lokal.

Berikut beberapa permasalahan yang terjadi di ekosistem pariwisata Danau Toba:
1. Data pariwisata masih dikelola secara mentah (*raw data*) dengan format tidak konsisten dan berisiko konflik informasi.
2. Wisatawan dan pengelola mengalami kesulitan dalam memetakan rute transportasi lokal (angkot) dan konektivitas antarwilayah wisata.
3. Informasi mengenai tempat wisata *hidden gems*, kerajinan Ulos, dan homestay lokal belum dapat diakses secara optimal secara online.
4. Wisatawan harus mencari informasi di berbagai platform terpisah untuk memperoleh panduan rute dan jadwal operasional.
5. Belum tersedia sistem perencana itinerari dan rute jalan nyata yang memudahkan wisatawan melakukan pendaftaran perjalanan online.
6. Belum terdapat sistem notifikasi otomatis untuk mengingatkan wisatawan mengenai jadwal perjalanan wisata yang telah dibuat.
7. Belum tersedia chatbot RAG cerdas yang dapat memberikan rekomendasi inklusif dan menjawab pertanyaan pariwisata secara otomatis.

Berdasarkan permasalahan tersebut, diperlukan sebuah website pemandu wisata cerdas yang dilengkapi fitur perencana rute, chatbot berbasis AI RAG, *Fairness Scoring*, dan integrasi otomatisasi n8n untuk membantu pengolahan data, meningkatkan efisiensi pelayanan pariwisata, serta memudahkan wisatawan dalam memperoleh informasi secara online.

---

#### 1.2.2. Produk yang menjadi Inspirasi
Dalam pengembangan Website **TobaRoute AI**, terdapat beberapa website dan sistem layanan pariwisata/teknologi yang menjadi inspirasi, terutama platform pariwisata digital yang telah menggunakan peta interaktif serta fitur chatbot untuk membantu pelayanan pengguna secara online. Salah satu inspirasi berasal dari platform seperti Google Maps dan Traveloka yang menyediakan layanan informasi peta, lokasi, dan rekomendasi tempat secara online.

Platform tersebut memiliki kelebihan dalam penyampaian visualisasi peta yang cepat, tampilan yang mudah digunakan, serta penggunaan fitur pencarian yang membantu pengguna memperoleh lokasi dengan praktis. Selain itu, penggunaan chatbot AI modern seperti ChatGPT dan Perplexity juga menjadi inspirasi karena mampu membantu menjawab pertanyaan pengguna secara otomatis dan fleksibel.

Namun, beberapa sistem yang sudah ada memiliki kekurangan seperti tidak adanya keberpihakan algoritma terhadap UMKM kecil yang kurang ulasan (*fairness bias*), serta tidak tersedianya integrasi rute transportasi angkutan umum lokal (angkot) di kawasan Toba. Berdasarkan hal tersebut, Website **TobaRoute AI** dikembangkan dengan tampilan yang lebih fokus pada pariwisata Danau Toba, dilengkapi fitur RAG inklusif dan otomatisasi n8n untuk membantu wisatawan dan perekonomian masyarakat lokal secara lebih efektif.

---

#### 1.2.3. Produk yang akan dibangun
Produk yang akan dibangun adalah Website Layanan Pemandu Wisata Cerdas Danau Toba (**TobaRoute AI**) yang digunakan untuk membantu proses perencanaan perjalanan dan pelayanan pariwisata secara digital. Website ini dirancang untuk digunakan oleh wisatawan, pelaku UMKM lokal, dan admin dengan hak akses dan fungsi yang berbeda sesuai kebutuhan masing-masing. Sistem ini bertujuan untuk memudahkan pengolahan data pariwisata serta memberikan kemudahan bagi wisatawan dalam memperoleh informasi dan layanan rute secara online.

Fitur utama yang akan diimplementasikan pada website ini meliputi:
1. Sistem login untuk wisatawan, pelaku UMKM, dan admin.
2. Pengelolaan data destinasi, akomodasi, kuliner, dan UMKM secara digital.
3. Informasi peta interaktif dan rute angkutan umum (angkot).
4. Fitur perencana rute itinerari wisata secara online.
5. Fitur chatbot berbasis AI RAG (*Retrieval-Augmented Generation*) untuk membantu menjawab pertanyaan wisatawan.
6. Notifikasi pengingat jadwal perjalanan secara otomatis via WhatsApp (n8n).

Nilai tambah dari website ini dibandingkan sistem pariwisata pada umumnya adalah adanya fitur chatbot berbasis AI RAG, *Fairness Recommendation Engine* (yang mendorong eksposur UMKM kecil berulasan $\le 15$), serta integrasi otomatisasi n8n yang membantu meningkatkan kecepatan dan efisiensi pelayanan. Integrasi n8n digunakan untuk mengotomatisasi proses pengiriman notifikasi jadwal itinerari kepada wisatawan. Selain itu, website dirancang dengan tampilan responsif sehingga dapat memberikan pengalaman yang lebih baik bagi wisatawan maupun pengelola lokal.

---

#### 1.2.4. Konteks
Website **TobaRoute AI** merupakan sistem berbasis web yang digunakan oleh wisatawan, pelaku UMKM, dan admin untuk mendukung proses pelayanan pariwisata Danau Toba secara digital. Sistem ini terdiri dari beberapa modul utama, yaitu login dan manajemen hak akses, pengelolaan data pariwisata, peta rute interaktif, perencana itinerari, chatbot berbasis AI RAG, *Fairness Engine*, dan sistem notifikasi otomatis.

Wisatawan dapat mengakses informasi pariwisata Toba, menyusun itinerari rute, menerima notifikasi pengingat perjalanan, serta menggunakan chatbot untuk memperoleh jawaban otomatis. Admin bertugas mengelola data destinasi, data pengguna, data UMKM, serta memantau proses *AI Knowledge Ingestion*. Pelaku UMKM dapat mengunggah dan mengelola profil usaha lokal mereka. Sistem juga terintegrasi dengan n8n untuk mendukung otomatisasi pengiriman notifikasi WhatsApp dan alur kerja sistem lainnya.

---

#### 1.2.5. Deskripsi Kebutuhan Produk
Bagian ini menjelaskan kebutuhan yang diperlukan dalam pengembangan Website Layanan Pemandu Wisata Cerdas Danau Toba (**TobaRoute AI**) dengan Fitur Chatbot RAG dan Integrasi Otomatisasi n8n. Kebutuhan sistem disusun berdasarkan proses pelayanan pariwisata, pengolahan data Toba, fitur perencana rute, chatbot AI, serta notifikasi otomatis. Penjabaran kebutuhan ini mencakup kebutuhan fungsional dan non-fungsional yang menjadi dasar dalam pengembangan sistem agar dapat berjalan dengan baik, aman, dan mudah digunakan oleh wisatawan, UMKM, maupun admin.

##### 1.2.5.1. Kebutuhan Fungsional
Kebutuhan fungsional merupakan fitur atau layanan yang harus dimiliki sistem agar dapat berjalan sesuai kebutuhan pengguna. Adapun kebutuhan fungsional sistem dijelaskan pada Tabel 1.3.

##### Tabel 1. 3 Kebutuhan Fungsional
| Fitur | Deskripsi |
| :--- | :--- |
| **Autentikasi Pengguna** | Pengguna dapat melakukan login dan logout sesuai hak akses masing-masing (Wisatawan, UMKM, Admin). |
| **Informasi Pariwisata Toba** | Pengguna dapat melihat informasi destinasi, kuliner, akomodasi, dan rute angkutan umum (angkot). |
| **Perencana Rute (Route Planner)** | Wisatawan dapat menyusun itinerari rute perjalanan secara online melalui peta interaktif. |
| **Chatbot AI RAG Inklusif** | Pengguna dapat bertanya dan memperoleh rekomendasi otomatis berbasis data riil Toba melalui chatbot AI. |
| **Fairness Recommendation** | Sistem memberikan dorongan rekomendasi (*boost*) secara otomatis kepada UMKM lokal berulasan sedikit. |
| **Dashboard Admin & Ingestion** | Admin dapat mengelola data destinasi, artikel budaya, serta melakukan sinkronisasi dokumen pengetahuan AI. |
| **Notifikasi Workflow (n8n)** | Sistem mengirimkan pengingat jadwal itinerari perjalanan secara otomatis ke WhatsApp pengguna. |

---

##### 1.2.5.2. Kebutuhan Non-Fungsional
Kebutuhan non-fungsional merupakan aspek yang menentukan kualitas dan cara kerja sistem. Kebutuhan ini mencakup *reliability*, *performance*, *usability*, *security*, *availability*, dan *scalability*. Adapun kebutuhan non-fungsional sistem dijelaskan pada Tabel 1.4.

##### Tabel 1. 4 Kebutuhan Non-fungsional
| Aspek | Kebutuhan |
| :--- | :--- |
| **Reliability** | Sistem harus dapat berjalan dengan stabil, minim error, dan memiliki *retrieval accuracy* RAG $> 85\%$. |
| **Performance** | Website dan Chatbot RAG harus memiliki waktu respon latensi yang cepat saat diakses pengguna ($< 2.5$ detik). |
| **Usability** | Antarmuka website harus responsif, modern, serta mudah digunakan oleh wisatawan pada perangkat seluler/desktop. |
| **Security** | Data pengguna terlindungi dengan sistem autentikasi, bebas pelacakan data pribadi sensitif (PII), dan menggunakan HTTPS. |
| **Availability** | Sistem dapat diakses kapan saja selama 24 jam melalui koneksi internet. |
| **Scalability** | Sistem dapat dikembangkan kembali untuk mencakup kawasan destinasi pariwisata yang lebih luas di masa mendatang. |

---

#### 1.2.6. Environment Hardware dan Software

##### Tabel 1. 5 Environment Software
| No | Software | Spesifikasi atau Keterangan |
| :---: | :--- | :--- |
| 1. | Frontend Framework | Next.js digunakan untuk membangun antarmuka website yang modern dan responsif |
| 2. | Backend Framework | FastAPI digunakan untuk membangun REST API dan logika backend sistem RAG |
| 3. | Styling Framework | Tailwind CSS digunakan untuk mendesain tampilan website secara responsif |
| 4. | Bahasa Pemrograman | TypeScript dan Python digunakan dalam pengembangan frontend dan backend |
| 5. | Database | PostgreSQL (Neon.tech) digunakan untuk menyimpan data pengguna, destinasi, dan itinerari |
| 6. | Vector Database | Pinecone digunakan untuk menyimpan embedding dan basis pengetahuan RAG chatbot |
| 7. | Framework AI | LangChain digunakan untuk mengelola alur kerja chatbot berbasis RAG |
| 8. | AI Model | Cohere AI (Embed & Command-R) / Gemini digunakan untuk menghasilkan jawaban chatbot berbasis AI |
| 9. | Runtime Environment | Node.js dan npm digunakan untuk menjalankan serta mengelola package frontend |
| 10. | API Testing | Postman dan Swagger UI digunakan untuk pengujian endpoint API |
| 11. | Web Server | Uvicorn digunakan untuk menjalankan aplikasi FastAPI |
| 12. | Version Control | Git dan GitHub digunakan untuk pengelolaan versi dan kolaborasi kode |
| 13. | Deployment | Docker digunakan untuk containerization dan deployment aplikasi |

##### Tabel 1. 6 Environment Hardware
| No | Hardware | Spesifikasi atau Keterangan |
| :---: | :--- | :--- |
| 1 | Laptop Developer | ASUS VivoBook / AMD Ryzen 5, RAM 8GB/16GB, SSD 512GB |
| 2. | Server/Cloud Instance | Digunakan untuk menjalankan website, backend RAG, dan integrasi n8n |
| 3. | Jaringan | Akses internet stabil dibutuhkan untuk pengembangan sistem, akses GitHub, Cohere API, dan n8n |

---

#### 1.2.7. Metodologi dan Tools Pengembangan

##### 1.2.7.1. Metodologi
Metodologi pengembangan yang digunakan pada Website Layanan Pemandu Wisata Cerdas Danau Toba (**TobaRoute AI**) adalah metode **Waterfall**. Metode ini dipilih karena proses pengembangan sistem dilakukan secara terstruktur dan bertahap sehingga memudahkan tim dalam merancang dan mengembangkan website sesuai kebutuhan pengguna.

Tahapan pengembangan produk meliputi:
1. **Product Requirement Specification**: Tahap pengumpulan kebutuhan sistem, seperti fitur website, RAG chatbot, dan kebutuhan pengguna seperti wisatawan, pelaku UMKM, dan admin.
2. **Project Planning**: Tahap perencanaan pengerjaan proyek, pembagian tugas tim, serta penentuan kebutuhan sistem dan tools yang digunakan.
3. **Product Design**: Tahap perancangan tampilan website (*wireframe*), arsitektur RAG, database (ERD/CDM/PDM), serta alur kerja chatbot dan integrasi n8n.
4. **Product Implementation**: Tahap pembuatan website, chatbot AI RAG, dan integrasi otomatisasi n8n sesuai desain yang telah dibuat.
5. **Product Testing**: Tahap pengujian sistem untuk memastikan seluruh fitur website, peta rute, dan RAG chatbot berjalan dengan baik tanpa kesalahan.
6. **Product Release**: Tahap peluncuran website agar dapat digunakan oleh wisatawan dan pelaku usaha pariwisata Toba.

---

##### 1.2.7.2. Tools Pengembangan
Adapun tools pengembangan dalam proyek ini dapat dilihat pada Tabel 1.7.

##### Tabel 1. 7 Tools Pengembangan
| No | Hardware / Software | Spesifikasi atau Keterangan |
| :---: | :--- | :--- |
| 1. | Frontend Framework | Menggunakan Next.js sebagai framework frontend berbasis React |
| 2. | Backend Framework | Menggunakan FastAPI untuk membangun REST API backend |
| 3. | Styling Framework | Tailwind CSS digunakan untuk mendesain UI modern dan responsif |
| 4. | Bahasa Pemrograman | TypeScript dan Python digunakan untuk frontend serta backend |
| 5. | IDE / Code Editor | Visual Studio Code (VS Code) digunakan untuk proses pengembangan sistem |
| 6. | Runtime Environment | Node.js dan npm run dev digunakan untuk menjalankan serta mengelola package frontend |
| 7. | Visual Environment | Python venv digunakan untuk mengisolasi library backend |
| 8. | Web Server | Uvicorn digunakan sebagai server untuk menjalankan aplikasi FastAPI |
| 9. | API Testing | Swagger UI dan Postman digunakan untuk pengujian endpoint API |
| 10. | Framework AI | LangChain digunakan untuk integrasi chatbot RAG, dokumen, dan model AI |
| 11. | AI Model | Cohere AI / Gemini digunakan sebagai Large Language Model (LLM) chatbot |
| 12. | Vector Database | Pinecone digunakan untuk menyimpan embedding data pariwisata Toba |
| 13. | Database | PostgreSQL (Neon.tech) digunakan sebagai database utama sistem |
| 14. | Version Control | Git digunakan untuk mengontrol dan melacak perubahan kode |
| 15. | Repository Cloud | GitHub digunakan sebagai penyimpanan repository proyek |
| 16. | Git GUI Tools | GitHub Desktop / VS Code Git GUI digunakan untuk proses commit, push, dan pull |
| 17. | Automation Tools | n8n workflow digunakan untuk otomatisasi reminder WhatsApp |
| 18. | UI Icon Library | Lucide React digunakan untuk mempercantik tampilan antarmuka |
| 19. | Animation Library | Framer Motion digunakan untuk animasi dan transisi antarmuka website |
| 20. | Desain Tools | Balsamiq / Figma digunakan untuk membuat mockup dan desain antarmuka |
| 21. | Deployment Tools | Docker digunakan untuk containerization dan deployment sistem |
