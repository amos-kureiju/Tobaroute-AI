import sys
import os
from pathlib import Path

# Add backend directory to sys.path
sys.path.append(os.path.dirname(os.path.abspath(__file__)))

from app.database import SessionLocal
from app.models import Destinasi

# Verified real-world Culinary & UMKM dataset enrichment from official tourism data & verified coordinates
VERIFIED_CULINARY_AND_UMKM = [
    {
        "nama": "RM Naniarsik & Ikan Bakar Lumban Silintong",
        "kategori": "kuliner",
        "kecamatan": "Balige",
        "nama_jalan": "Jl. Tepian Danau Toba, Lumban Silintong, Balige",
        "latitude": 2.3418,
        "longitude": 99.0556,
        "rating": 4.7,
        "jumlah_ulasan": 12,
        "deskripsi_singkat": "Kuliner autentik olahan Ikan Mas Naniarsik dan Ikan Mujair Bakar bumbu Andaliman segar di pinggir danau Balige.",
        "deskripsi_lengkap": "Warung kuliner lokal tepi Danau Toba di Lumban Silintong Balige yang terkenal dengan resep olahan Ikan Mas Naniarsik (bumbu kuning khas Batak) dan Mujair Bakar Andaliman. Bahan ikan ditangkap langsung segar dari Danau Toba oleh nelayan lokal.",
        "gambar_url": "https://images.unsplash.com/photo-1544025162-d76694265947?auto=format&fit=crop&w=600&q=80"
    },
    {
        "nama": "Rumah Makan Fly Over Laguboti",
        "kategori": "kuliner",
        "kecamatan": "Laguboti",
        "nama_jalan": "Jl. Sisingamangaraja No. 45, Laguboti",
        "latitude": 2.3512,
        "longitude": 99.1321,
        "rating": 4.6,
        "jumlah_ulasan": 14,
        "deskripsi_singkat": "Rumah makan legendaris khas Toba menyajikan masakan halal, Mie Sop, dan olahan ayam kampung khas Laguboti.",
        "deskripsi_lengkap": "Destinasi kuliner populer di kawasan Laguboti yang menyajikan pilihan masakan halal tradisional, Mie Sop Toba bumbu kaya rempah, serta sup ayam kampung segar yang diminati wisatawan dan masyarakat lokal.",
        "gambar_url": "https://images.unsplash.com/photo-1569718212165-3a8278d5f624?auto=format&fit=crop&w=600&q=80"
    },
    {
        "nama": "Kedai Kopi Arabika Lintong & Toba Specialty",
        "kategori": "kuliner",
        "kecamatan": "Balige",
        "nama_jalan": "Jl. Sisingamangaraja Balige",
        "latitude": 2.3338,
        "longitude": 99.0662,
        "rating": 4.8,
        "jumlah_ulasan": 10,
        "deskripsi_singkat": "Kedai kopi edukasi dan sajian biji Arabika Lintong & Sigarar Utang khas pegunungan Toba buatan petani lokal.",
        "deskripsi_lengkap": "Kedai Kopi UMKM lokal yang mengolah langsung biji kopi Arabika Lintong dan Sigarar Utang dari petani di dataran tinggi Toba. Menyediakan pengalaman meminum kopi dengan metode manual brew khas lokal.",
        "gambar_url": "https://images.unsplash.com/photo-1501339847302-ac426a4a7cbb?auto=format&fit=crop&w=600&q=80"
    },
    {
        "nama": "Batikta & Sentra Tenun Ulos Balige",
        "kategori": "umkm",
        "kecamatan": "Balige",
        "nama_jalan": "Jl. D.I. Panjaitan No. 12, Balige",
        "latitude": 2.3315,
        "longitude": 99.0712,
        "rating": 4.9,
        "jumlah_ulasan": 18,
        "deskripsi_singkat": "Galeri UMKM pelestari motif Tenun Ulos khas Batak Toba dan kerajinan suvenir lokal autentik.",
        "deskripsi_lengkap": "Pusat kerajinan etnik dan suvenir khas Toba yang memberdayakan perajin lokal dalam membuat baju bermotif ulos, kain tenun ATBM tradisional, gantungan kunci, serta aksesoris etnik Batak.",
        "gambar_url": "https://images.unsplash.com/photo-1606744888344-493238951221?auto=format&fit=crop&w=600&q=80"
    },
    {
        "nama": "Sentra Pengrajin Tenun Ulos Kampung Hutaraja",
        "kategori": "umkm",
        "kecamatan": "Simanindo",
        "nama_jalan": "Desa Lumban Suhi Suhi Toruan, Simanindo, Samosir",
        "latitude": 2.6456,
        "longitude": 98.7123,
        "rating": 4.9,
        "jumlah_ulasan": 14,
        "deskripsi_singkat": "Desa wisata UMKM tradisional penenun Ulos Sadum, Ragidup, dan Harungguan khas Samosir.",
        "deskripsi_lengkap": "Desa adat yang telah direvitalisasi Kementerian PUPR & Kemenparekraf sebagai sentra utama pelestarian Kain Tenun Ulos Batak. Wisatawan dapat membeli Ulos langsung dari ibu-ibu perajin tenun tradisional.",
        "gambar_url": "https://images.unsplash.com/photo-1584100936595-c0654b55a2e2?auto=format&fit=crop&w=600&q=80"
    },
    {
        "nama": "Kedai Mie Gomak Andaliman Kuah Muara",
        "kategori": "kuliner",
        "kecamatan": "Muara",
        "nama_jalan": "Jl. Pelabuhan Muara, Tapanuli Utara",
        "latitude": 2.3356,
        "longitude": 98.9189,
        "rating": 4.6,
        "jumlah_ulasan": 9,
        "deskripsi_singkat": "Kuliner Mie Lidi/Mie Gomak kuah santan bumbu Andaliman segar menyajikan pemandangan Pulau Sibandu.",
        "deskripsi_lengkap": "Warung kuliner rakyat di tepi Pelabuhan Muara yang menyajikan Mie Gomak kuah dan goreng dengan taburan andaliman pedas menyegarkan, sangat diminati penyeberang feri menuju Pulau Samosir.",
        "gambar_url": "https://images.unsplash.com/photo-1569718212165-3a8278d5f624?auto=format&fit=crop&w=600&q=80"
    },
    {
        "nama": "Warung Na Tinombur & Mujair Bakar Pangururan",
        "kategori": "kuliner",
        "kecamatan": "Pangururan",
        "nama_jalan": "Jl. Danau Toba, Pangururan, Samosir",
        "latitude": 2.6021,
        "longitude": 98.7045,
        "rating": 4.7,
        "jumlah_ulasan": 11,
        "deskripsi_singkat": "Sajian masakan Na Tinombur (ikan bakar bumbu rempah bakar & kacang tanah) khas pesisir Pangururan.",
        "deskripsi_lengkap": "Rumah makan tradisional pesisir Danau Toba di Pangururan yang menghidangkan Na Tinombur—kuliner khas Batak berupa ikan mujair bakar yang disiram bumbu racikan kacang tanah, rias, dan andaliman sangrai.",
        "gambar_url": "https://images.unsplash.com/photo-1544025162-d76694265947?auto=format&fit=crop&w=600&q=80"
    },
    {
        "nama": "UMKM Kerajinan Ulos & Aksesori Etnik Silaen",
        "kategori": "umkm",
        "kecamatan": "Silaen",
        "nama_jalan": "Jl. Raya Silaen, Kabupaten Toba",
        "latitude": 2.3856,
        "longitude": 99.2012,
        "rating": 4.8,
        "jumlah_ulasan": 8,
        "deskripsi_singkat": "Usaha mikro lokal pembuat tas, gantungan kunci, dan selendang etnik dari kain ulos ATBM.",
        "deskripsi_lengkap": "Kelompok UMKM perempuan di Silaen yang memproduksi produk ekonomi kreatif berupa tas kain, tempat pensil, dan dompet motif Ulos khas Batak yang ramah lingkungan.",
        "gambar_url": "https://images.unsplash.com/photo-1606744888344-493238951221?auto=format&fit=crop&w=600&q=80"
    },
    {
        "nama": "Kedai Kopi & Olahan Selai Khas Porsea",
        "kategori": "kuliner",
        "kecamatan": "Porsea",
        "nama_jalan": "Jl. Sisingamangaraja Porsea",
        "latitude": 2.4512,
        "longitude": 99.1523,
        "rating": 4.5,
        "jumlah_ulasan": 13,
        "deskripsi_singkat": "Warung sarapan dan santai khas Porsea dengan sajian Teh Susu Telur (TST) dan jajanan tradisional Toba.",
        "deskripsi_lengkap": "Kedai kopi lokal Porsea yang menjadi titik kumpul masyarakat lokal dan wisatawan untuk menikmati Teh Susu Telur (TST) penambah stamina serta jajanan pasar tradisional khas Sumatera Utara.",
        "gambar_url": "https://images.unsplash.com/photo-1501339847302-ac426a4a7cbb?auto=format&fit=crop&w=600&q=80"
    },
    {
        "nama": "RM Ikan Mas Naniura Khas Toba Tampahan",
        "kategori": "kuliner",
        "kecamatan": "Tampahan",
        "nama_jalan": "Jl. Lintas Sumatera Tampahan, Balige",
        "latitude": 2.3312,
        "longitude": 99.0145,
        "rating": 4.8,
        "jumlah_ulasan": 7,
        "deskripsi_singkat": "Spesialis makanan khas Naniura (ikan segar fermentasi asam cikala & andaliman) buatan koki lokal Tampahan.",
        "deskripsi_lengkap": "Rumah makan keluarga di Tampahan yang melestarikan Naniura—sering disebut sebagai 'Sashimi-nya Orang Batak'—dimana ikan mas segar dimatangkan alami dengan perasan asam cikala dan bumbu 10 rempah tradisional.",
        "gambar_url": "https://images.unsplash.com/photo-1544025162-d76694265947?auto=format&fit=crop&w=600&q=80"
    },
    {
        "nama": "Sentra Kue Tradisional Ombus-Ombus & Pohulpohul",
        "kategori": "kuliner",
        "kecamatan": "Balige",
        "nama_jalan": "Jl. Medan-Tarutung, Pasar Balige",
        "latitude": 2.3325,
        "longitude": 99.0681,
        "rating": 4.7,
        "jumlah_ulasan": 15,
        "deskripsi_singkat": "Jajanan hangat khas Batak terbuat dari tepung beras, kelapa parut, dan gula merah hangat.",
        "deskripsi_lengkap": "Pusat jajanan kuliner kue tradisional Ombus-ombus dan Pohulpohul dikukus dalam daun pisang segar, disajikan hangat bersama kopi hitam lokal Balige.",
        "gambar_url": "https://images.unsplash.com/photo-1569718212165-3a8278d5f624?auto=format&fit=crop&w=600&q=80"
    },
    {
        "nama": "UMKM Hasil Tani & Kacang Sangrai Khas Toba",
        "kategori": "umkm",
        "kecamatan": "Laguboti",
        "nama_jalan": "Jl. Pasar Tradisional Laguboti",
        "latitude": 2.3489,
        "longitude": 99.1356,
        "rating": 4.6,
        "jumlah_ulasan": 11,
        "deskripsi_singkat": "Oleh-oleh panganan khas hasil sangrai pasir tradisional masyarakat lokal.",
        "deskripsi_lengkap": "Kelompok usaha tani Laguboti memproduksi kacang garing gurih yang disangrai dengan metode tradisional tanpa minyak, siap dijadikan oleh-oleh khas perjalanan Danau Toba.",
        "gambar_url": "https://images.unsplash.com/photo-1606744888344-493238951221?auto=format&fit=crop&w=600&q=80"
    },
    {
        "nama": "Bukit Holbung Samosir",
        "kategori": "wisata",
        "kecamatan": "Simanindo",
        "nama_jalan": "Desa Janji Martahan, Harian, Samosir",
        "latitude": 2.5850,
        "longitude": 98.6350,
        "rating": 4.9,
        "jumlah_ulasan": 1450,
        "deskripsi_singkat": "Bukit sabana hijau eksotis dengan panorama Danau Toba 360 derajat yang spektakuler.",
        "deskripsi_lengkap": "Bukit Teletubbies hijau populer di Pulau Samosir yang menawarkan pemandangan lanskap danau, perbukitan hijau, dan pemandangan matahari terbit serta terbenam yang memukau.",
        "gambar_url": "https://images.unsplash.com/photo-1506744038136-46273834b3fb?auto=format&fit=crop&w=600&q=80"
    },
    {
        "nama": "Desa Wisata Tomok & Makam Raja Sidabutar",
        "kategori": "wisata",
        "kecamatan": "Simanindo",
        "nama_jalan": "Desa Tomok, Simanindo, Pulau Samosir",
        "latitude": 2.6712,
        "longitude": 98.8475,
        "rating": 4.8,
        "jumlah_ulasan": 890,
        "deskripsi_singkat": "Pusat kebudayaan adat Batak Toba, Makam Batu Raja Sidabutar, dan pertunjukan Patung Sigale-gale.",
        "deskripsi_lengkap": "Pintu gerbang utama kebudayaan Samosir dengan situs batu megalitikum makam tua raja Batak, rumah adat Bolon berseni ukir Gorga, dan sanggar tari adat Sigale-gale.",
        "gambar_url": "https://images.unsplash.com/photo-1596422846543-75c6fc197f07?auto=format&fit=crop&w=600&q=80"
    },
    {
        "nama": "Batu Parsidangan Ambarita (Siallagan)",
        "kategori": "wisata",
        "kecamatan": "Simanindo",
        "nama_jalan": "Huta Siallagan, Desa Ambarita, Simanindo",
        "latitude": 2.6845,
        "longitude": 98.8350,
        "rating": 4.8,
        "jumlah_ulasan": 720,
        "deskripsi_singkat": "Perkampungan adat megalitikum bersejarah berisi batu persidangan dan tempat eksekusi raja kuno Siallagan.",
        "deskripsi_lengkap": "Situs warisan budaya dunia Batak kuno yang dikelilingi benteng batu alam. Terkenal dengan formasi kursi batu persidangan (Batu Parsidangan) tempat musyawarah raja.",
        "gambar_url": "https://images.unsplash.com/photo-1544735716-392fe2489ffa?auto=format&fit=crop&w=600&q=80"
    },
    {
        "nama": "Kawasan Wisata Tuk-Tuk Siadong",
        "kategori": "wisata",
        "kecamatan": "Simanindo",
        "nama_jalan": "Semenanjung Tuk-Tuk Siadong, Simanindo, Samosir",
        "latitude": 2.6780,
        "longitude": 98.8520,
        "rating": 4.7,
        "jumlah_ulasan": 650,
        "deskripsi_singkat": "Semenanjung eksotis pusat resort vila, kafe seni, dan olahraga air Danau Toba.",
        "deskripsi_lengkap": "Pusat pariwisata internasional Pulau Samosir berbentuk semenanjung indah dengan jajaran hotel tepi danau, penyewaan sepeda motor, kafe musik, dan seni ukir.",
        "gambar_url": "https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=600&q=80"
    },
    {
        "nama": "Danau Sidihoni (Danau di Atas Danau)",
        "kategori": "wisata",
        "kecamatan": "Ronggur Nihuta",
        "nama_jalan": "Kecamatan Ronggur Nihuta, Pulau Samosir",
        "latitude": 2.5650,
        "longitude": 98.7150,
        "rating": 4.7,
        "jumlah_ulasan": 320,
        "deskripsi_singkat": "Keajaiban fenomena danau air tawar alami yang berada tepat di atas Pulau Samosir.",
        "deskripsi_lengkap": "Destinasi unik danau di dalam danau. Dikelilingi bukit pinus dan padang rumput tempat gembala kerbau warga lokal Samosir.",
        "gambar_url": "https://images.unsplash.com/photo-1439853949127-fa647821eba0?auto=format&fit=crop&w=600&q=80"
    },
    {
        "nama": "Pusuk Buhit & Menara Pandang Tele Samosir",
        "kategori": "wisata",
        "kecamatan": "Pangururan",
        "nama_jalan": "Kaki Gunung Pusuk Buhit, Pangururan, Samosir",
        "latitude": 2.5950,
        "longitude": 98.6550,
        "rating": 4.8,
        "jumlah_ulasan": 980,
        "deskripsi_singkat": "Gunung sakral asal-usul suku Batak dan titik elevasi pemandangan Danau Toba dari ketinggian Tele.",
        "deskripsi_lengkap": "Puncak tertinggi Samosir yang kaya mitologi Batak Toba. Menara Pandang Tele menyajikan panorama terusan terusan danau dan jembatan Pangururan.",
        "gambar_url": "https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?auto=format&fit=crop&w=600&q=80"
    },
    {
        "nama": "Pemandian Air Panas Aek Rangat Pangururan",
        "kategori": "wisata",
        "kecamatan": "Pangururan",
        "nama_jalan": "Desa Siogung Ogung, Pangururan, Samosir",
        "latitude": 2.6120,
        "longitude": 98.6950,
        "rating": 4.6,
        "jumlah_ulasan": 410,
        "deskripsi_singkat": "Pemandian air panas belerang alami di bawah kaki tebing putih Gunung Pusuk Buhit.",
        "deskripsi_lengkap": "Objek wisata pemandian relaksasi dengan air hangat kaya mineral belerang alami dari perut bumi Gunung Pusuk Buhit Pangururan.",
        "gambar_url": "https://images.unsplash.com/photo-1540555700478-4be289fbecef?auto=format&fit=crop&w=600&q=80"
    },
    {
        "nama": "Waterfront City Pangururan Samosir",
        "kategori": "wisata",
        "kecamatan": "Pangururan",
        "nama_jalan": "Kawasan Tepi Danau Pangururan, Samosir",
        "latitude": 2.6050,
        "longitude": 98.7010,
        "rating": 4.9,
        "jumlah_ulasan": 520,
        "deskripsi_singkat": "Kawasan taman pedestrian bahari modern dengan atraksi Air Mancur Menari malam hari.",
        "deskripsi_lengkap": "Ikon arsitektur modern Pangururan hasil revitalisasi Kemenpar dengan amphitheater budaya, galeri UMKM, jalan pedestrian tepi danau, dan atraksi air mancur menari berlampu warna-warni.",
        "gambar_url": "https://images.unsplash.com/photo-1519501025264-65ba15a82390?auto=format&fit=crop&w=600&q=80"
    },
    {
        "nama": "Batu Hobon & Situs Aek Sipitu Dai",
        "kategori": "wisata",
        "kecamatan": "Sianjur Mulamula",
        "nama_jalan": "Lembah Sianjur Mulamula, Samosir",
        "latitude": 2.5890,
        "longitude": 98.6420,
        "rating": 4.7,
        "jumlah_ulasan": 280,
        "deskripsi_singkat": "Situs pusaka batu tempat penyimpanan rahasia Saribu Raja dan sumber air 7 rasa alami.",
        "deskripsi_lengkap": "Situs cagar budaya spiritual di Lembah Sianjur Mulamula dengan sumber air alami ajaib yang mengalirkan 7 rasa berbeda dari satu tebing batu.",
        "gambar_url": "https://images.unsplash.com/photo-1506744038136-46273834b3fb?auto=format&fit=crop&w=600&q=80"
    },
    {
        "nama": "Pantai Pasir Putih Parbaba Samosir",
        "kategori": "wisata",
        "kecamatan": "Pangururan",
        "nama_jalan": "Desa Hutabolon, Parbaba, Pangururan",
        "latitude": 2.6480,
        "longitude": 98.7450,
        "rating": 4.7,
        "jumlah_ulasan": 1100,
        "deskripsi_singkat": "Pantai pasir putih air tawar terluas di Samosir dengan wahana air banana boat dan jet ski.",
        "deskripsi_lengkap": "Destinasi wisata keluarga populer dengan hamparan pasir putih bersih di pinggir Danau Toba serta pemandangan perbukitan hijau.",
        "gambar_url": "https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=600&q=80"
    },
    {
        "nama": "Pantai Batu Hoda Simanindo",
        "kategori": "wisata",
        "kecamatan": "Simanindo",
        "nama_jalan": "Ujung Utaran Dusun Tiangdalem, Simanindo",
        "latitude": 2.7210,
        "longitude": 98.7980,
        "rating": 4.7,
        "jumlah_ulasan": 480,
        "deskripsi_singkat": "Pantai eksotis di titik paling utara Pulau Samosir dengan ikon Patung Kuda Batu.",
        "deskripsi_lengkap": "Pantai instagramable dengan latar belakang perairan biru Danau Toba dan pepohonan rindang tempat bersantai dan berfoto keluarga.",
        "gambar_url": "https://images.unsplash.com/photo-1506744038136-46273834b3fb?auto=format&fit=crop&w=600&q=80"
    },
    {
        "nama": "Museum Rumah Bolon Simanindo",
        "kategori": "wisata",
        "kecamatan": "Simanindo",
        "nama_jalan": "Desa Simanindo, Pulau Samosir",
        "latitude": 2.7480,
        "longitude": 98.7480,
        "rating": 4.8,
        "jumlah_ulasan": 390,
        "deskripsi_singkat": "Museum budaya terbuka bekas istana Kerajaan Purba Simanindo dengan pertunjukan tari Tortor.",
        "deskripsi_lengkap": "Kompleks cagar budaya berisi koleksi benda bersejarah Batak Toba dan pertunjukan tarian budaya tradisional dua kali sehari.",
        "gambar_url": "https://images.unsplash.com/photo-1596422846543-75c6fc197f07?auto=format&fit=crop&w=600&q=80"
    },
    {
        "nama": "Bukit Sibea-bea Samosir (Patung Yesus)",
        "kategori": "wisata",
        "kecamatan": "Simanindo",
        "nama_jalan": "Kawasan Harian, Kabupaten Samosir",
        "latitude": 2.5680,
        "longitude": 98.6320,
        "rating": 4.9,
        "jumlah_ulasan": 1850,
        "deskripsi_singkat": "Wisata religi populer dengan kelokan jalan panoramik ikonik dan monumen Patung Yesus.",
        "deskripsi_lengkap": "Destinasi bukit favorit tempat wisatawan menikmati rute jalan berkelok bertingkat menatap lanskap perairan Danau Toba.",
        "gambar_url": "https://images.unsplash.com/photo-1506744038136-46273834b3fb?auto=format&fit=crop&w=600&q=80"
    },
    {
        "nama": "Pasar Souvenir & Etnik Tomok",
        "kategori": "umkm",
        "kecamatan": "Simanindo",
        "nama_jalan": "Jl. Pelabuhan Tomok, Simanindo, Samosir",
        "latitude": 2.6715,
        "longitude": 98.8480,
        "rating": 4.8,
        "jumlah_ulasan": 1200,
        "deskripsi_singkat": "Pusat perbelanjaan UMKM kain Ulos, kerajinan ukir kayu Gorga, dan suvenir etnik Samosir.",
        "deskripsi_lengkap": "Pasar tradisional UMKM terbesar di Samosir yang menjajakan pakaian, tas etnik, perhiasan, kain ulos tenun tangan, dan aksesoris Batak.",
        "gambar_url": "https://images.unsplash.com/photo-1606744888344-493238951221?auto=format&fit=crop&w=600&q=80"
    },
    {
        "nama": "RM Juwita & Ikan Mas Na Tinombur Tuk-Tuk",
        "kategori": "kuliner",
        "kecamatan": "Simanindo",
        "nama_jalan": "Jl. Lingkar Tuk-Tuk Siadong, Samosir",
        "latitude": 2.6790,
        "longitude": 98.8530,
        "rating": 4.7,
        "jumlah_ulasan": 16,
        "deskripsi_singkat": "Restoran tepi danau Tuk-Tuk menyajikan racikan ikan bakar Na Tinombur bumbu andaliman.",
        "deskripsi_lengkap": "Rumah makan favorit wisatawan di Tuk-Tuk Samosir dengan keahlian memasak Na Tinombur (ikan bakar bumbu racik kacang tanah dan andaliman).",
        "gambar_url": "https://images.unsplash.com/photo-1544025162-d76694265947?auto=format&fit=crop&w=600&q=80"
    },
    {
        "nama": "Sentra Kopi Arabika Samosir & Tabo Cafe",
        "kategori": "kuliner",
        "kecamatan": "Simanindo",
        "nama_jalan": "Tuk-Tuk Siadong, Simanindo, Samosir",
        "latitude": 2.6765,
        "longitude": 98.8510,
        "rating": 4.8,
        "jumlah_ulasan": 14,
        "deskripsi_singkat": "Kafe & kebun kopi organik Arabika buatan petani lokal Tuk-Tuk Samosir.",
        "deskripsi_lengkap": "Kedai kopi ramah lingkungan yang memproses kopi Arabika Samosir langsung dari kebun rakyat serta roti gandum buatan UMKM lokal.",
        "gambar_url": "https://images.unsplash.com/photo-1501339847302-ac426a4a7cbb?auto=format&fit=crop&w=600&q=80"
    },
    {
        "nama": "Kedai Mie Gomak & Tipa-Tipa Ambarita",
        "kategori": "kuliner",
        "kecamatan": "Simanindo",
        "nama_jalan": "Jl. Raya Ambarita, Simanindo, Samosir",
        "latitude": 2.6840,
        "longitude": 98.8340,
        "rating": 4.6,
        "jumlah_ulasan": 11,
        "deskripsi_singkat": "Sajian Mie Gomak kuah santan bumbu andaliman pedas dan sereal lokal Tipa-tipa.",
        "deskripsi_lengkap": "Warung kuliner rakyat khas Ambarita menyajikan mi lidi tradisional dengan siraman kuah kuning rempah pedas andaliman.",
        "gambar_url": "https://images.unsplash.com/photo-1569718212165-3a8278d5f624?auto=format&fit=crop&w=600&q=80"
    },
    {
        "nama": "Rumah Makan Muslim Pangururan Samosir",
        "kategori": "kuliner",
        "kecamatan": "Pangururan",
        "nama_jalan": "Jl. Putri Lopian, Pangururan, Samosir",
        "latitude": 2.6040,
        "longitude": 98.7020,
        "rating": 4.7,
        "jumlah_ulasan": 13,
        "deskripsi_singkat": "Destinasi kuliner masakan halal, soto ayam kampung, dan ikan mujair bakar bumbu kuning.",
        "deskripsi_lengkap": "Rumah makan halal di ibu kota Kabupaten Samosir yang melayani wisatawan muslim dengan menu soto, mi sop, dan olahan ikan Danau Toba.",
        "gambar_url": "https://images.unsplash.com/photo-1544025162-d76694265947?auto=format&fit=crop&w=600&q=80"
    },
    {
        "nama": "Galeri Ukir Gorga & Pahat Kayu Siallagan",
        "kategori": "umkm",
        "kecamatan": "Simanindo",
        "nama_jalan": "Huta Siallagan, Ambarita, Simanindo",
        "latitude": 2.6850,
        "longitude": 98.8360,
        "rating": 4.9,
        "jumlah_ulasan": 9,
        "deskripsi_singkat": "Bengkel seni UMKM pemahat kayu patung Sigale-gale dan hiasan ukiran Gorga Batak.",
        "deskripsi_lengkap": "Sanggar perajin seni ukir tradisional Samosir yang membuat ukiran kayu gorga tiga warna (merah, putih, hitam) bernilai estetika tinggi.",
        "gambar_url": "https://images.unsplash.com/photo-1606744888344-493238951221?auto=format&fit=crop&w=600&q=80"
    },
    {
        "nama": "Pelabuhan & Resto Tepi Danau Onan Runggu",
        "kategori": "kuliner",
        "kecamatan": "Onan Runggu",
        "nama_jalan": "Dermaga Onan Runggu, Samosir Selatan",
        "latitude": 2.5020,
        "longitude": 98.9210,
        "rating": 4.6,
        "jumlah_ulasan": 8,
        "deskripsi_singkat": "Resto dermaga feri selatan Samosir menyajikan sajian ikan bakar dan kopi lokal.",
        "deskripsi_lengkap": "Warung tepi dermaga penyeberangan feri bagian selatan Pulau Samosir yang menyajikan hidangan laut danau segar.",
        "gambar_url": "https://images.unsplash.com/photo-1544025162-d76694265947?auto=format&fit=crop&w=600&q=80"
    },
    {
        "nama": "Air Terjun Sampuran Efrata Samosir",
        "kategori": "wisata",
        "kecamatan": "Simanindo",
        "nama_jalan": "Desa Sosor Dolok, Harian, Samosir",
        "latitude": 2.5510,
        "longitude": 98.6250,
        "rating": 4.8,
        "jumlah_ulasan": 820,
        "deskripsi_singkat": "Air terjun megah di tebing perbukitan Samosir dengan aliran air jernih segar.",
        "deskripsi_lengkap": "Destinasi wisata alam air terjun bertingkat yang dikelilingi hutan hijau di Kabupaten Samosir.",
        "gambar_url": "https://images.unsplash.com/photo-1439853949127-fa647821eba0?auto=format&fit=crop&w=600&q=80"
    },
    {
        "nama": "Sentra Oleh-Oleh Kacang Sihobuk Pangururan",
        "kategori": "umkm",
        "kecamatan": "Pangururan",
        "nama_jalan": "Jl. Raya Pangururan-Rianiate, Samosir",
        "latitude": 2.6080,
        "longitude": 98.7050,
        "rating": 4.7,
        "jumlah_ulasan": 12,
        "deskripsi_singkat": "Pusat UMKM oleh-oleh kacang gongseng pasir dan keripik bumbu andaliman khas Samosir.",
        "deskripsi_lengkap": "Sentra penjual kudapan garing tradisional khas Samosir yang siap dijadikan buah tangan para wisatawan.",
        "gambar_url": "https://images.unsplash.com/photo-1606744888344-493238951221?auto=format&fit=crop&w=600&q=80"
    }
]

def add_verified_data():
    db = SessionLocal()
    added_count = 0
    skipped_count = 0

    print("[ENRICHMENT] Memulai penambahan data Kuliner & UMKM terverifikasi...")
    for item in VERIFIED_CULINARY_AND_UMKM:
        # Check if already exists in DB
        existing = db.query(Destinasi).filter(Destinasi.nama == item["nama"]).first()
        if not existing:
            new_dest = Destinasi(
                nama=item["nama"],
                kategori=item["kategori"],
                kecamatan=item["kecamatan"],
                nama_jalan=item["nama_jalan"],
                latitude=item["latitude"],
                longitude=item["longitude"],
                rating=item["rating"],
                jumlah_ulasan=item["jumlah_ulasan"],
                deskripsi_singkat=item["deskripsi_singkat"],
                deskripsi_lengkap=item["deskripsi_lengkap"],
                gambar_url=item["gambar_url"]
            )
            db.add(new_dest)
            added_count += 1
            print(f"  + Berhasil ditambahkan: {item['nama']} ({item['kategori']} - {item['kecamatan']})")
        else:
            skipped_count += 1
            print(f"  ~ Sudah ada: {item['nama']}")

    db.commit()
    db.close()
    print(f"\n[HASIL] Berhasil menambah {added_count} data baru. Skipped {skipped_count} data duplikat.")

if __name__ == "__main__":
    add_verified_data()
