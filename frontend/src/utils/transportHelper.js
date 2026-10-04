// ====================================================================================================
// FILE: frontend/src/utils/transportHelper.js
// TUJUAN:
// Modul kalkulasi dan penyedia panduan akses transportasi lengkap kawasan Danau Toba (Frontend).
// Memastikan informasi akses bandara (Silangit DTB), angkutan umum/angkot, kapal feri, sewa motor/mobil,
// dan tips navigasi tersedia instan (0 ms) di seluruh kartu destinasi dan peta eksplorasi.
// ====================================================================================================

// Titik Koordinat Hub Utama Kawasan Danau Toba
export const TOBA_TRANSPORT_HUBS = {
  bandara_silangit: {
    nama: 'Bandara Internasional Raja Sisingamangaraja XII (Silangit / DTB)',
    singkat: 'Bandara Silangit (DTB)',
    lat: 2.2590,
    lon: 98.9950,
    tipe: 'bandara'
  },
  pelabuhan_balige: {
    nama: 'Pelabuhan Mulia Raja Napitupulu (Balige)',
    lat: 2.3387,
    lon: 99.0625,
    tipe: 'pelabuhan'
  },
  pelabuhan_ajibata: {
    nama: 'Pelabuhan Ajibata (Parapat)',
    lat: 2.6710,
    lon: 98.9320,
    tipe: 'pelabuhan'
  },
  pelabuhan_tomok: {
    nama: 'Pelabuhan Tomok (Samosir)',
    lat: 2.6515,
    lon: 98.8680,
    tipe: 'pelabuhan'
  },
  pelabuhan_ambarita: {
    nama: 'Pelabuhan Ambarita (Samosir)',
    lat: 2.6860,
    lon: 98.8410,
    tipe: 'pelabuhan'
  },
  pelabuhan_tigaras: {
    nama: 'Pelabuhan Tigaras (Simalungun)',
    lat: 2.7980,
    lon: 98.7890,
    tipe: 'pelabuhan'
  },
  pelabuhan_simanindo: {
    nama: 'Pelabuhan Simanindo (Samosir)',
    lat: 2.7660,
    lon: 98.7610,
    tipe: 'pelabuhan'
  },
  pelabuhan_muara: {
    nama: 'Pelabuhan Muara (Taput)',
    lat: 2.3390,
    lon: 98.9180,
    tipe: 'pelabuhan'
  },
  pelabuhan_onan_runggu: {
    nama: 'Pelabuhan Onan Runggu (Samosir)',
    lat: 2.4510,
    lon: 98.9830,
    tipe: 'pelabuhan'
  },
  terminal_balige: {
    nama: 'Terminal Angkutan Balige',
    lat: 2.3330,
    lon: 99.0640,
    tipe: 'terminal'
  },
  jembatan_tano_ponggol: {
    nama: 'Jembatan Tano Ponggol (Pangururan, Samosir)',
    lat: 2.6070,
    lon: 98.7080,
    tipe: 'akses_darat'
  }
};

// Rumus Jarak Haversine (Km)
export const calculateDistanceKm = (lat1, lon1, lat2, lon2) => {
  if (!lat1 || !lon1 || !lat2 || !lon2) return 0;
  try {
    const R = 6371; // Radius bumi dalam km
    const dLat = (lat2 - lat1) * (Math.PI / 180);
    const dLon = (lon2 - lon1) * (Math.PI / 180);
    const a =
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos(lat1 * (Math.PI / 180)) *
      Math.cos(lat2 * (Math.PI / 180)) *
      Math.sin(dLon / 2) * Math.sin(dLon / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return Number((R * c).toFixed(1));
  } catch (e) {
    return 0;
  }
};

// Estimasi Waktu Tempuh Mobil di Jalan Kaldera
export const estimateDriveTime = (roadKm, avgSpeedKmh = 40) => {
  if (!roadKm || roadKm <= 0) return '±5 menit';
  const minutes = Math.round(((roadKm * 1.35) / avgSpeedKmh) * 60);
  if (minutes >= 60) {
    const jam = Math.floor(minutes / 60);
    const sisaMin = minutes % 60;
    return sisaMin > 0 ? `±${jam} jam ${sisaMin} menit` : `±${jam} jam`;
  }
  return `±${Math.max(5, minutes)} menit`;
};

// FUNGSI UTAMA: getClientTransportGuide
export const getClientTransportGuide = (dest) => {
  if (!dest) return null;

  // Jika backend sudah mengirimkan akses_transportasi lengkap, utamakan itu
  if (dest.akses_transportasi && dest.akses_transportasi.bandara_access) {
    return dest.akses_transportasi;
  }

  const lat = Number(dest.latitude) || 2.3387;
  const lon = Number(dest.longitude) || 99.0625;
  const kec = (dest.kecamatan || '').trim();
  const kecLower = kec.toLowerCase();
  const nama = dest.nama || 'Destinasi';

  // 1. Bandara Silangit
  const silangit = TOBA_TRANSPORT_HUBS.bandara_silangit;
  const distSilangitGeo = calculateDistanceKm(lat, lon, silangit.lat, silangit.lon);
  const roadKmSilangit = Number((distSilangitGeo * 1.35).toFixed(1));
  const durSilangitStr = estimateDriveTime(distSilangitGeo, 42);

  // 2. Cek Pulau Samosir
  const isSamosir = [
    'samosir', 'pangururan', 'simanindo', 'onan runggu',
    'palipi', 'ronggur nihuta', 'sianjur mulamula', 'harian', 'tuktuk', 'tomok', 'ambarita'
  ].includes(kecLower);

  // 3. Klasifikasi Angkutan Umum
  let publicTransit = {};
  let kondisiJalan = '';
  let parkirInfo = '';

  if (['balige', 'tampahan'].includes(kecLower)) {
    publicTransit = {
      nama_moda: 'Angkot Balige (Rajawali / Koperasi Balige) & Becak Motor (Bentor)',
      trayek: 'Terminal Balige ↔ Pusat Kota ↔ Pantai Lumban Bulbul / Pantai Meat / TB Silalahi',
      titik_turun: `Simpang masuk ${nama} / depan lokasi`,
      estimasi_tarif: 'Rp 5.000 – Rp 10.000 (Angkot) | Rp 15.000 – Rp 25.000 (Bentor)',
      frekuensi: 'Tersedia tiap 10–15 menit (06.00 – 18.00 WIB)'
    };
    kondisiJalan = 'Jalan aspal mulus perkotaan, sangat mudah dijangkau mobil & bus pariwisata.';
    parkirInfo = 'Area parkir mobil dan motor luas tersedia di lokasi.';
  } else if (['laguboti', 'sigumpar', 'silaen', 'porsea', 'lumban julu'].includes(kecLower)) {
    publicTransit = {
      nama_moda: 'Angkot Antar-Kecamatan & Bus Lintas Sumatera (KBT / Sampri / Sejahtera)',
      trayek: `Rute Lintas Porsea ↔ Laguboti ↔ Balige (Turun di pusat ${kec})`,
      titik_turun: `Simpang utama ${kec}, sambung ojek lokal ke ${nama}`,
      estimasi_tarif: 'Rp 8.000 – Rp 15.000 (Angkot/Bus) | Rp 10.000 – Rp 20.000 (Ojek)',
      frekuensi: 'Tersedia sepanjang hari di jalan lintas utama'
    };
    kondisiJalan = 'Jalan Lintas Sumatera aspal hotmix lebar dengan penerangan jalan memadai.';
    parkirInfo = 'Tersedia area parkir kendaraan mobil dan motor.';
  } else if (['parapat', 'girsang sipangan bolon', 'ajibata'].includes(kecLower)) {
    publicTransit = {
      nama_moda: 'Bus Antar-Kota (Sejahtera / Intra / KBT) & Angkot Parapat',
      trayek: 'Terminal Sosor Saba Parapat ↔ Pelabuhan Ajibata ↔ Tugu Parapat',
      titik_turun: 'Tepi Jalan Lintas Parapat / Dermaga Ajibata',
      estimasi_tarif: 'Rp 5.000 – Rp 10.000 (Angkot) | Rp 15.000 – Rp 30.000 (Bentor Wisata)',
      frekuensi: 'Sangat sering, beroperasi hingga malam hari (06.00 – 21.00 WIB)'
    };
    kondisiJalan = 'Jalan beraspal mulus dengan jalur perbukitan dan pemandangan danau kaldera.';
    parkirInfo = 'Tersedia kantong parkir wisata di lokasi dan pelabuhan.';
  } else if (isSamosir) {
    publicTransit = {
      nama_moda: 'Angkutan Pedesaan Samosir, Ojek Wisata, & Rental Motor',
      trayek: 'Tomok ↔ Tuktuk Siadong ↔ Ambarita ↔ Pangururan (Jalan Lingkar Samosir)',
      titik_turun: `Pemberhentian jalan lingkar Samosir terdekat dari ${nama}`,
      estimasi_tarif: 'Rp 10.000 – Rp 25.000 (Angkot) | Sewa motor Rp 80.000/hari',
      frekuensi: 'Tersedia berkala di sepanjang jalan lingkar pulau Samosir'
    };
    kondisiJalan = 'Jalan Lingkar Samosir aspal baru dan mulus dengan pemandangan danau spektakuler.';
    parkirInfo = 'Parkir nyaman di lokasi destinasi atau pinggir jalan wisata yang aman.';
  } else if (['muara', 'baktiraja', 'doloksanggul', 'lintong nihuta'].includes(kecLower)) {
    publicTransit = {
      nama_moda: 'Angkot Pedesaan Siborong-borong / Muara & Ojek Lokal',
      trayek: `Simpang Siborong-borong ↔ Muara ↔ Huta Ginjang / Baktiraja`,
      titik_turun: `Simpang masuk kawasan wisata ${nama}`,
      estimasi_tarif: 'Rp 15.000 – Rp 25.000 (Angkot/Ojek)',
      frekuensi: 'Beroperasi pagi hingga sore (07.00 – 17.00 WIB)'
    };
    kondisiJalan = 'Jalan aspal berliku di ketinggian bukit dengan panorama lembah Danau Toba.';
    parkirInfo = 'Tersedia area parkir wisata alami.';
  } else {
    publicTransit = {
      nama_moda: 'Angkutan Umum Kecamatan & Ojek Motor Lokal',
      trayek: `Pusat Kecamatan ${kec} ↔ Destinasi ${nama}`,
      titik_turun: `Akses terdekat ${nama}`,
      estimasi_tarif: 'Rp 10.000 – Rp 20.000',
      frekuensi: 'Tersedia pada jam aktivitas warga (07.00 – 17.30 WIB)'
    };
    kondisiJalan = 'Jalan aspal reguler kawasan Toba dengan kontur perbukitan alami.';
    parkirInfo = 'Area parkir memadai untuk mobil dan motor.';
  }

  // 4. Panduan Kapal Feri
  let ferryInfo = null;
  if (isSamosir) {
    ferryInfo = {
      rekomendasi_jalur: 'Penyeberangan Feri RORO (Mobil & Penumpang) atau Kapal Tradisional',
      dermaga_pilihan: [
        {
          rute: 'Pelabuhan Ajibata (Parapat) ↔ Pelabuhan Tomok / Ambarita (Samosir)',
          kapal: 'KMP Ihan Batak & KMP Pora-Pora (RORO) / KMP Tao Toba',
          durasi: '±45 menit penyeberangan',
          tarif_orang: 'Rp 15.000 – Rp 20.000 / orang',
          tarif_mobil: 'Rp 135.000 – Rp 170.000 / mobil',
          jadwal: 'Setiap 1–2 jam (07.00 – 20.00 WIB)'
        },
        {
          rute: 'Pelabuhan Balige ↔ Pelabuhan Onan Runggu (Samosir Selatan)',
          kapal: 'KMP Kaldera Toba',
          durasi: '±60 menit penyeberangan',
          tarif_orang: 'Rp 20.000 / orang',
          tarif_mobil: 'Rp 150.000 / mobil',
          jadwal: 'Jadwal reguler harian pagi & siang'
        }
      ],
      opsi_jalur_darat: 'Bisa juga lewat jalur darat via Jembatan Tano Ponggol (Pangururan) tanpa naik kapal.'
    };
  } else if (['balige', 'ajibata', 'parapat', 'muara'].includes(kecLower)) {
    ferryInfo = {
      rekomendasi_jalur: `Dekat dengan Pelabuhan ${kec} untuk akses menyeberang Danau Toba`,
      dermaga_pilihan: [
        {
          rute: `Pelabuhan ${kec} ↔ Pulau Samosir`,
          kapal: 'Kapal Feri KMP & Speedboat Wisata',
          durasi: '±30 – 50 menit penyeberangan',
          tarif_orang: 'Rp 15.000 – Rp 25.000 / orang',
          jadwal: 'Berangkat reguler pagi s/d sore'
        }
      ],
      opsi_jalur_darat: 'Akses darat langsung via Jalan Lintas Sumatera.'
    };
  }

  // 5. Kendaraan Pribadi & Rental
  const privateRental = {
    sewa_motor: {
      tersedia: true,
      estimasi_tarif: 'Rp 70.000 – Rp 100.000 / 24 jam',
      rekomendasi: 'Sangat direkomendasikan untuk solo traveler & pasangan agar leluasa menjelajah spot hidden gems.'
    },
    sewa_mobil: {
      tersedia: true,
      estimasi_tarif: 'Rp 450.000 – Rp 650.000 / hari (Mobil + Driver lokal)',
      rekomendasi: 'Pilihan ternyaman untuk keluarga atau rombongan dari Bandara Silangit / Medan.'
    },
    kondisi_akses: kondisiJalan,
    fasilitas_parkir: parkirInfo
  };

  // 6. Akses Bandara Silangit
  const airportAccess = {
    bandara: 'Bandara Internasional Raja Sisingamangaraja XII (Silangit / DTB)',
    jarak_km: roadKmSilangit,
    estimasi_durasi: durSilangitStr,
    rute_utama: `Via Jl. Lintas Sumatera menuju ${kec}`,
    pilihan_moda: [
      'Taksi Resmi Bandara Silangit (Tarif flat ke Balige / Parapat)',
      'Shuttle Bus DAMRI Bandara (Rute Silangit ↔ Balige ↔ Parapat)',
      'Rental Mobil Bandara (Langsung pick-up di gerbang kedatangan)'
    ]
  };

  // 7. Tips Navigasi
  const driverTips = [
    `Gunakan navigasi peta menuju '${nama}, ${kec}' untuk rute jalan terbaik.`,
    'Sinyal seluler 4G/5G Telkomsel & Indosat terpantau kuat di sepanjang jalur utama.',
    'Perhatikan rambu tikungan dan nikmati panorama kaldera Danau Toba sepanjang perjalanan.'
  ];

  return {
    jarak_bandara_km: roadKmSilangit,
    durasi_bandara: durSilangitStr,
    bandara_access: airportAccess,
    angkutan_umum: publicTransit,
    kapal_feri: ferryInfo,
    kendaraan_pribadi: privateRental,
    tips_navigasi: driverTips,
    quick_summary: `${durSilangitStr} dari Bandara Silangit (${roadKmSilangit} km) • ${publicTransit.nama_moda.split('&')[0].trim()}`
  };
};
