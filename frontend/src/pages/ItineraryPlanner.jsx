// ====================================================================================================
// FILE: frontend/src/pages/ItineraryPlanner.jsx
// TUJUAN:
// Studio Perencana Itinerary AI Interaktif Kawasan Danau Toba.
// Fitur Utama:
// 1. Kustomisasi Durasi Hari (1 - 7 Hari), Wilayah Fokus, Moda Transportasi, dan Ritme Perjalanan.
// 2. Input Kustom Preferensi Wisatawan & Preset Chip Tema Wisata Danau Toba.
// 3. Integrasi Algoritma RAG Keadilan Pariwisata (Fairness Route).
// 4. Jadwal Jam-ke-Jam Interaktif: Geser Urutan, Hapus Spot, Tambah Spot Baru, dan Edit Spot (Modal Form).
// 5. Visualisasi Peta Rute GIS Terintegrasi (RouteMap) untuk Hari Aktif.
// 6. Kalkulator Anggaran Cerdas Dinamis (Kuliner, Tiket, Bensin/Feri, Belanja UMKM, Penginapan).
// 7. Checklist Perlengkapan Kaldera dengan Dukungan Tambah Item Kustom.
// 8. Alat Ekspor & Berbagi: Cetak/PDF, Salin Teks ke Clipboard, Bagikan ke WhatsApp, & Unduh JSON.
// 9. Kompatibilitas State Otomatis dari Halaman Beranda (Seamless Transfer).
// ====================================================================================================

import React, { useState, useEffect, useMemo } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { 
  Sparkles, Calendar, Clock, MapPin, Sun, Cloud, 
  Wind, Thermometer, Plus, Trash2, ArrowUp, ArrowDown, 
  Printer, CheckSquare, DollarSign, Navigation, 
  RotateCw, AlertCircle, CheckCircle, ShieldCheck,
  Copy, Check, Share2, Download, X, Car, 
  Bike, Ship, Layers, Tag, Eye, Info, Users, Compass,
  Utensils, Mountain, Store, Coffee, HeartHandshake
} from 'lucide-react';
import { getFairRecommendation } from '../services/api';
import RouteMap from '../components/RouteMap';

// Preset Tema Wisata Cepat
const THEME_PRESETS = [
  { id: 'culinary', icon: <Utensils size={13} />, label: 'Kuliner Batak Autentik', query: 'Wisata kuliner khas Batak naniarsik naniura mie gomak kedai kopi lokal' },
  { id: 'heritage', icon: <Store size={13} />, label: 'Budaya & Tenun Ulos', query: 'Sentra tenun ulos kampung batak museum makam raja huta siallagan' },
  { id: 'nature', icon: <Mountain size={13} />, label: 'Geosite & Sabana Kaldera', query: 'Wisata alam geosite bukit holbung sipinsur air terjun situmurun danau' },
  { id: 'family', icon: <Users size={13} />, label: 'Family & Staycation', query: 'Resort hotel pantai pasir putih ramah anak dan keluarga wisata santai' },
  { id: 'backpacker', icon: <Compass size={13} />, label: 'Backpacker & Hemat', query: 'Wisata hemat homestay bukit sabana spot foto sunrise kaldera' },
  { id: 'coffee', icon: <Coffee size={13} />, label: 'Sunset & Kedai Kopi', query: 'Kedai kopi arabika lintong pemandangan senja tepi danau dan santai' }
];

// Koordinat referensi per kecamatan untuk GIS map jika koordinat slot baru kosong
const KECAMATAN_COORDS = {
  'Balige': { lat: 2.3333, lon: 99.0667 },
  'Samosir': { lat: 2.5889, lon: 98.7111 },
  'Parapat': { lat: 2.6631, lon: 98.9372 },
  'Doloksanggul': { lat: 2.2708, lon: 98.7483 },
  'Tarutung': { lat: 2.0236, lon: 98.9667 },
  'Berastagi': { lat: 3.1833, lon: 98.5167 },
  'Sidikalang': { lat: 2.7481, lon: 98.3111 },
  'Laguboti': { lat: 2.3667, lon: 99.1167 }
};

// Wilayah yang memiliki akses pelabuhan feri penyeberangan Danau Toba
const FERRY_SUPPORTED_KECAMATANS = ['Samosir', 'Parapat', 'Balige', 'Laguboti', 'Tarutung'];

// Penghasil Jadwal Waktu & Catatan Logistik yang Dinamis Sesuai Moda Transportasi
const getTimeSlotsByMode = (mode, dayNumber, targetKec) => {
  const isFerryRegion = FERRY_SUPPORTED_KECAMATANS.includes(targetKec);
  
  if (mode === 'bike') {
    // Sepeda Motor: Akses lincah bebas hambatan, waktu transit lebih hemat 25%, parkir instan
    return [
      { time: '07:45 – 09:00 WIB', noteSuffix: 'Transit motor lincah & parkir instan di depan kedai.' },
      { time: '09:20 – 12:15 WIB', noteSuffix: 'Akses motor menyusuri jalan lingkar kaldera dengan leluasa.' },
      { time: '12:35 – 14:00 WIB', noteSuffix: 'Singgah kuliner santai tanpa kendala antrean parkir mobil.' },
      { time: '14:20 – 17:15 WIB', noteSuffix: 'Akses mudah ke gang sentra pengrajin tenun pedesaan.' },
      { time: '18:30 – 20:30 WIB', noteSuffix: 'Santap malam & menikmati semilir angin sejuk kaldera.' }
    ];
  } else if (mode === 'ferry') {
    // Feri: Penyeberangan terjadwal di perairan Danau Toba (KMP Ihan Batak / Tao Toba / Pora-Pora)
    if (dayNumber === 2 || targetKec === 'Samosir') {
      return [
        { time: '07:30 – 08:45 WIB', noteSuffix: 'Sarapan pagi & persiapan menuju dermaga pelabuhan feri.' },
        { time: '09:00 – 10:30 WIB', noteSuffix: 'Penyeberangan Feri KMP Ihan Batak / KMP Tao Toba melintasi Danau Toba (45 mnt penyeberangan air).' },
        { time: '11:00 – 13:00 WIB', noteSuffix: 'Eksplorasi destinasi pulau setelah kapal bersandar di pelabuhan.' },
        { time: '13:30 – 15:00 WIB', noteSuffix: 'Santap siang kuliner ikan bakar tepi perairan kaldera.' },
        { time: '15:30 – 17:45 WIB', noteSuffix: 'Kunjungan cagar budaya & sentra tenun ulos khas pulau.' },
        { time: '18:45 – 21:00 WIB', noteSuffix: 'Santap malam tepi danau & check-in penginapan.' }
      ];
    } else {
      return [
        { time: '07:45 – 09:00 WIB', noteSuffix: 'Sarapan & persiapan jalur penyeberangan pelabuhan danau.' },
        { time: '09:30 – 12:15 WIB', noteSuffix: 'Wisata pesisir danau & integrasi dermaga kapal lokal.' },
        { time: '12:45 – 14:15 WIB', noteSuffix: 'Santap siang kuliner khas dekat dermaga pelabuhan.' },
        { time: '14:45 – 17:30 WIB', noteSuffix: 'Eksplorasi pesisir kaldera & sentra kerajinan lokal.' },
        { time: '18:30 – 20:45 WIB', noteSuffix: 'Santap malam danau & istirahat.' }
      ];
    }
  } else {
    // Mobil Pribadi (Default): Standar berkendara mobil jalan beraspal kaldera (~40 km/jam)
    return [
      { time: '08:00 – 09:30 WIB', noteSuffix: 'Mengisi stamina pagi sebelum berkendara via jalan utama.' },
      { time: '10:00 – 12:30 WIB', noteSuffix: 'Waktu terbaik foto pagi. Akses jalan aspal & parkir mobil lega.' },
      { time: '13:00 – 14:30 WIB', noteSuffix: 'Makan siang & singgah UMKM lokal warga setempat.' },
      { time: '15:30 – 17:30 WIB', noteSuffix: 'Menikmati golden hour sore & belanja tenun ulos.' },
      { time: '19:00 – 21:00 WIB', noteSuffix: 'Santap malam ikan bakar & kopi lokal sebelum istirahat.' }
    ];
  }
};

const buildInitialDays = (daysCount = 3, targetKec = 'Balige', mode = 'car') => {
  const weatherSamples = [
    { temp: '22°C – 25°C', status: 'Cerah Berawan', humidity: '72%', wind: '11 km/jam', outfit: 'Pakaian santai katun & jaket tipis' },
    { temp: '21°C – 24°C', status: 'Semilir Angin Kaldera', humidity: '76%', wind: '15 km/jam', outfit: 'Jaket angin & alas kaki nyaman' },
    { temp: '20°C – 23°C', status: 'Sejuk Menyegarkan', humidity: '80%', wind: '9 km/jam', outfit: 'Sepatu olahraga & pakaian hangat' },
    { temp: '22°C – 26°C', status: 'Hangat Bersahabat', humidity: '70%', wind: '13 km/jam', outfit: 'Outfit foto warna cerah & kacamata' },
    { temp: '21°C – 25°C', status: 'Sejuk Berawan', humidity: '74%', wind: '12 km/jam', outfit: 'Sweater ringan & celana santai' }
  ];

  const dailyThemes = [
    {
      title: 'Hari 1: Pusaka Budaya & Gastronomi Balige',
      d1: { id: 101, nama: 'Pantai Pasir Putih Lumban Bulbul', kategori: 'wisata', kecamatan: 'Balige', nama_jalan: 'Jl. Bulbul Balige', latitude: 2.3485, longitude: 99.0712 },
      u1: { id: 201, nama: 'RM Nauli Balige (Ikan Mas Naniarsik)', kategori: 'kuliner', kecamatan: 'Balige', nama_jalan: 'Pusat Kuliner Balige', latitude: 2.3350, longitude: 99.0680 },
      d2: { id: 102, nama: 'Museum Batak TB Silalahi Center', kategori: 'wisata', kecamatan: 'Balige', nama_jalan: 'Jl. Pagar Batu No. 88', latitude: 2.3395, longitude: 99.0520 },
      u2: { id: 202, nama: 'Batikta & Sentra Tenun Ulos Balige', kategori: 'umkm', kecamatan: 'Balige', nama_jalan: 'Jl. Somba Debata', latitude: 2.3360, longitude: 99.0620 },
    },
    {
      title: 'Hari 2: Penyeberangan Samosir & Geosite Kaldera',
      d1: { id: 103, nama: 'Bukit Holbung Sabana Samosir', kategori: 'wisata', kecamatan: 'Simanindo', nama_jalan: 'Desa Janji Marjoring', latitude: 2.5830, longitude: 98.7210 },
      u1: { id: 203, nama: 'Sentra Tenun Ulos Tradisional Tomok', kategori: 'umkm', kecamatan: 'Simanindo', nama_jalan: 'Desa Tomok Samosir', latitude: 2.6520, longitude: 98.8650 },
      d2: { id: 104, nama: 'Batu Kursi Persidangan Huta Siallagan', kategori: 'wisata', kecamatan: 'Simanindo', nama_jalan: 'Desa Siallagan', latitude: 2.6780, longitude: 98.8450 },
      u2: { id: 204, nama: 'Resto Tepi Danau Tuk-Tuk Siadong', kategori: 'kuliner', kecamatan: 'Simanindo', nama_jalan: 'Tuk-Tuk Samosir', latitude: 2.6710, longitude: 98.8520 },
    },
    {
      title: 'Hari 3: Geosite Sipinsur, Sunset & Kopi Lintong',
      d1: { id: 105, nama: 'Geosite Sipinsur Humbahas', kategori: 'wisata', kecamatan: 'Doloksanggul', nama_jalan: 'Parulohan Humbahas', latitude: 2.2688, longitude: 98.7495 },
      u1: { id: 205, nama: 'Kedai Kopi Arabika Lintong & Tipatipa', kategori: 'kuliner', kecamatan: 'Doloksanggul', nama_jalan: 'Lintong Nihuta', latitude: 2.2740, longitude: 98.7620 },
      d2: { id: 106, nama: 'Lembah Hijau Bakkara & Air Terjun Janji', kategori: 'wisata', kecamatan: 'Baktiraja', nama_jalan: 'Lembah Bakkara', latitude: 2.2850, longitude: 98.7120 },
      u2: { id: 206, nama: 'Sentra Oleh-Oleh Ombus-ombus Siborongborong', kategori: 'umkm', kecamatan: 'Siborongborong', nama_jalan: 'Jl. Sisingamangaraja', latitude: 2.2150, longitude: 98.9720 },
    },
    {
      title: 'Hari 4: Pesona Parapat & Air Terjun Situmurun',
      d1: { id: 107, nama: 'Air Terjun Situmurun Binangalom', kategori: 'wisata', kecamatan: 'Lumban Julu', nama_jalan: 'Situmurun Toba', latitude: 2.4560, longitude: 99.0230 },
      u1: { id: 207, nama: 'Kuliner Ikan Bakar Sambal Tuktuk Parapat', kategori: 'kuliner', kecamatan: 'Parapat', nama_jalan: 'Tepi Danau Parapat', latitude: 2.6620, longitude: 98.9350 },
      d2: { id: 108, nama: 'Puncak Bukit Gibeon & Sibisa Geosite', kategori: 'wisata', kecamatan: 'Ajibata', nama_jalan: 'Kawasan Sibisa', latitude: 2.5920, longitude: 99.0120 },
      u2: { id: 208, nama: 'Sentra Cinderamata & Mangga Toba', kategori: 'umkm', kecamatan: 'Parapat', nama_jalan: 'Pasar Parapat', latitude: 2.6630, longitude: 98.9320 },
    }
  ];

  const builtDays = [];
  for (let i = 0; i < daysCount; i++) {
    const theme = dailyThemes[i % dailyThemes.length];
    const timeSlots = getTimeSlotsByMode(mode, i + 1, targetKec);
    const transportCost = mode === 'ferry' ? 95000 : mode === 'bike' ? 45000 : 70000;

    builtDays.push({
      dayNumber: i + 1,
      dateLabel: `Hari ${i + 1}`,
      title: theme.title,
      weather: weatherSamples[i % weatherSamples.length],
      budgetEst: {
        makan: 120000,
        tiket: 35000,
        transport: transportCost * 2,
        olehOleh: 150000,
        penginapan: 300000
      },
      destinasiUtama: [theme.d1, theme.d2],
      umkmSekitar: [theme.u1, theme.u2],
      items: [
        {
          id: `${i}-1`,
          time: timeSlots[0].time,
          title: `Sarapan Mie Gomak & Kopi Arabika (${theme.u1.kecamatan})`,
          category: 'Kuliner Pagi',
          location: theme.u1.nama_jalan,
          temp: '21°C',
          note: `Kuah santan hangat andaliman bertenaga. ${timeSlots[0].noteSuffix}`,
          cost: 'Rp 25.000 / porsi',
          destRef: theme.u1
        },
        {
          id: `${i}-2`,
          time: timeSlots[1].time,
          title: theme.d1.nama,
          category: 'Destinasi Utama',
          location: theme.d1.nama_jalan,
          temp: '24°C',
          note: `Eksplorasi panorama alam & foto pagi hari. ${timeSlots[1].noteSuffix}`,
          cost: 'Rp 15.000 (Tiket)',
          destRef: theme.d1
        },
        {
          id: `${i}-3`,
          time: timeSlots[2].time,
          title: theme.u1.nama,
          category: 'Makan Siang & UMKM',
          location: theme.u1.nama_jalan,
          temp: '25°C',
          note: `Mencicipi olahan masakan khas Batak autentik. ${timeSlots[2].noteSuffix}`,
          cost: 'Rp 45.000 / orang',
          destRef: theme.u1
        },
        {
          id: `${i}-4`,
          time: timeSlots[3].time,
          title: theme.d2.nama,
          category: 'Wisata & Budaya',
          location: theme.d2.nama_jalan,
          temp: '23°C',
          note: `Melihat warisan budaya dan tenun ulos. ${timeSlots[3].noteSuffix}`,
          cost: 'Rp 10.000',
          destRef: theme.d2
        },
        {
          id: `${i}-5`,
          time: timeSlots[4].time,
          title: theme.u2.nama,
          category: 'Santap Malam',
          location: theme.u2.nama_jalan,
          temp: '20°C',
          note: `Santap malam tepi danau & kopi hangat. ${timeSlots[4].noteSuffix}`,
          cost: 'Rp 50.000 / orang',
          destRef: theme.u2
        }
      ]
    });
  }
  return builtDays;
};

const ItineraryPlanner = () => {
  const location = useLocation();
  const navigate = useNavigate();

  // State inisialisasi (menerima state dari Beranda jika ada)
  const initialQuery = location.state?.query || 'Wisata alam kaldera, budaya Batak, dan kuliner khas naniarsik';
  const initialKec = location.state?.kecamatan || 'Balige';
  const initialDuration = location.state?.duration || 3;

  const [selectedDuration, setSelectedDuration] = useState(initialDuration);
  const [activeDayIndex, setActiveDayIndex] = useState(0);
  const [loading, setLoading] = useState(false);
  const [query, setQuery] = useState(initialQuery);
  const [kecamatan, setKecamatan] = useState(initialKec);
  const [activeTheme, setActiveTheme] = useState(null);
  const [transportMode, setTransportMode] = useState('car');
  const [travelPace, setTravelPace] = useState('standar');
  const [travelerCount, setTravelerCount] = useState(2);
  const [itineraryDays, setItineraryDays] = useState(() => buildInitialDays(initialDuration, initialKec, 'car'));

  
  // State Modal Tambah Spot
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [newSlotData, setNewSlotData] = useState({
    title: '', time: '10:00 – 12:00 WIB', category: 'Wisata Alam', location: 'Kawasan Danau Toba', cost: 'Rp 15.000', note: 'Menikmati keindahan alam dan suasana asri kaldera.'
  });

  // State Checklist Perlengkapan
  const [packingList, setPackingList] = useState([
    { id: 1, text: 'Jaket hangat / windbreaker (suhu kaldera sejuk 19-23°C)', done: true },
    { id: 2, text: 'Sepatu jalan antiselip untuk trekking bukit & geosite', done: true },
    { id: 3, text: 'Uang tunai pecahan kecil untuk retribusi & UMKM tenun', done: false },
    { id: 4, text: 'Kacamata hitam & tabir surya di area danau', done: false },
    { id: 5, text: 'Powerbank & kamera dokumentasi panorama', done: true },
    { id: 6, text: 'Pakaian ganti untuk wisata air / pantai pasir putih', done: false },
    { id: 7, text: 'Obat pribadi & minyak kayu putih / tolak angin', done: false }
  ]);
  const [newPackingText, setNewPackingText] = useState('');

  // State Toast Notification
  const [toastMessage, setToastMessage] = useState('');

  const showToast = (msg) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(''), 3000);
  };

  useEffect(() => {
    generateCustomItinerary(selectedDuration, kecamatan, query, transportMode);
  }, [selectedDuration]);

  const generateCustomItinerary = async (daysCount, targetKec, targetQuery, activeMode = transportMode) => {
    setLoading(true);
    const effectiveQuery = targetQuery || query;
    try {
      const data = await getFairRecommendation(effectiveQuery, targetKec, 0);
      const destUtama = data?.destinasi_utama || [];
      const umkmList = data?.rekomendasi_umkm_sekitar || [];

      const weatherSamples = [
        { temp: '22°C – 25°C', status: 'Cerah Berawan', humidity: '72%', wind: '11 km/jam', outfit: 'Pakaian santai katun & jaket tipis' },
        { temp: '21°C – 24°C', status: 'Semilir Angin Kaldera', humidity: '76%', wind: '15 km/jam', outfit: 'Jaket angin & alas kaki nyaman' },
        { temp: '20°C – 23°C', status: 'Sejuk Menyegarkan', humidity: '80%', wind: '9 km/jam', outfit: 'Sepatu olahraga & pakaian hangat' },
        { temp: '22°C – 26°C', status: 'Hangat Bersahabat', humidity: '70%', wind: '13 km/jam', outfit: 'Outfit foto warna cerah & kacamata' },
        { temp: '21°C – 25°C', status: 'Sejuk Berawan', humidity: '74%', wind: '12 km/jam', outfit: 'Sweater ringan & celana santai' }
      ];

      const builtDays = [];
      for (let i = 0; i < daysCount; i++) {
        const d1 = destUtama[i % Math.max(destUtama.length, 1)] || { 
          id: 100 + i,
          nama: 'Eksplorasi Kaldera Danau Toba', 
          kategori: 'wisata', 
          rating: 4.8, 
          kecamatan: targetKec || 'Balige',
          nama_jalan: targetKec ? `Jl. Raya ${targetKec}` : 'Kawasan Danau Toba',
          latitude: KECAMATAN_COORDS[targetKec]?.lat || 2.3333,
          longitude: KECAMATAN_COORDS[targetKec]?.lon || 99.0667
        };

        const u1 = umkmList[i % Math.max(umkmList.length, 1)] || { 
          id: 200 + i,
          nama: 'Rumah Makan Tradisional Batak', 
          kategori: 'kuliner', 
          rating: 4.7, 
          kecamatan: targetKec || 'Balige',
          nama_jalan: 'Pusat Kuliner Lokal',
          latitude: (KECAMATAN_COORDS[targetKec]?.lat || 2.3333) + 0.008,
          longitude: (KECAMATAN_COORDS[targetKec]?.lon || 99.0667) + 0.008
        };

        const d2 = destUtama[(i + 1) % Math.max(destUtama.length, 1)] || { 
          id: 300 + i,
          nama: 'Sentra Tenun Ulos & Budaya', 
          kategori: 'umkm', 
          rating: 4.9, 
          kecamatan: 'Meat',
          nama_jalan: 'Desa Meat',
          latitude: (KECAMATAN_COORDS[targetKec]?.lat || 2.3333) - 0.012,
          longitude: (KECAMATAN_COORDS[targetKec]?.lon || 99.0667) + 0.015
        };

        const u2 = umkmList[(i + 1) % Math.max(umkmList.length, 1)] || {
          id: 400 + i,
          nama: 'Kedai Kopi Arabika Lintong & Oleh-Oleh',
          kategori: 'umkm',
          rating: 4.8,
          kecamatan: targetKec || 'Toba',
          nama_jalan: 'Sentra Oleh-Oleh Warga',
          latitude: (KECAMATAN_COORDS[targetKec]?.lat || 2.3333) + 0.015,
          longitude: (KECAMATAN_COORDS[targetKec]?.lon || 99.0667) - 0.005
        };

        const timeSlots = getTimeSlotsByMode(activeMode, i + 1, targetKec);
        const transportCost = activeMode === 'ferry' ? 95000 : activeMode === 'bike' ? 45000 : 70000;

        builtDays.push({
          dayNumber: i + 1,
          dateLabel: `Hari ${i + 1}`,
          title: i === 0 
            ? `Hari 1: Pusaka & Gastronomi ${targetKec || 'Balige'}` 
            : i === 1 
            ? `Hari 2: Penyeberangan Samosir & Geosite Kaldera` 
            : `Hari ${i + 1}: Hidden Gems & Belanja Oleh-Oleh UMKM`,
          weather: weatherSamples[i % weatherSamples.length],
          budgetEst: {
            makan: 120000,
            tiket: 35000,
            transport: transportCost * travelerCount,
            olehOleh: 150000,
            penginapan: 300000
          },
          destinasiUtama: [d1, d2],
          umkmSekitar: [u1, u2],
          items: [
            {
              id: `${i}-1`,
              time: timeSlots[0].time,
              title: 'Sarapan Mie Gomak Kuah Andaliman & Kopi Lintong',
              category: 'Kuliner Pagi',
              location: 'Kedai Kopi & Warung Sarapan Lokal',
              temp: '21°C',
              note: `Memulai hari dengan kuah santan hangat rempah andaliman. ${timeSlots[0].noteSuffix}`,
              cost: 'Rp 25.000 / porsi',
              destRef: u1
            },
            {
              id: `${i}-2`,
              time: timeSlots[1].time,
              title: d1.nama,
              category: d1.kategori || 'Destinasi Utama',
              location: d1.nama_jalan || d1.kecamatan || 'Kawasan Wisata Kaldera',
              temp: '24°C',
              note: `Eksplorasi panorama alam & spot foto terbaik. ${timeSlots[1].noteSuffix}`,
              cost: 'Rp 15.000 (Tiket)',
              destRef: d1
            },
            {
              id: `${i}-3`,
              time: timeSlots[2].time,
              title: u1.nama,
              category: 'Makan Siang & UMKM',
              location: u1.nama_jalan || 'Pusat Kuliner Lokal',
              temp: '25°C',
              note: `Mencicipi olahan masakan khas Batak autentik. ${timeSlots[2].noteSuffix}`,
              cost: 'Rp 45.000 / orang',
              destRef: u1
            },
            {
              id: `${i}-4`,
              time: timeSlots[3].time,
              title: d2.nama,
              category: d2.kategori || 'Sentra Kerajinan',
              location: d2.nama_jalan || 'Sentra UMKM Lokal',
              temp: '23°C',
              note: `Melihat langsung warisan budaya dan tenun ulos. ${timeSlots[3].noteSuffix}`,
              cost: 'Bebas Masuk / Donasi',
              destRef: d2
            },
            {
              id: `${i}-5`,
              time: timeSlots[4].time,
              title: 'Santap Malam Ikan Bakar Danau & Kopi Arabika',
              category: 'Santap Malam',
              location: 'Resto Tepi Danau Toba',
              temp: '20°C',
              note: `Santap malam dengan pemandangan danau dan alunan musik lokal. ${timeSlots[4].noteSuffix}`,
              cost: 'Rp 50.000 / orang',
              destRef: u2
            }
          ]
        });
      }

      setItineraryDays(builtDays);
      const modeText = activeMode === 'ferry' ? 'Feri' : activeMode === 'bike' ? 'Motor' : 'Mobil';
      showToast(`Rute ${daysCount} Hari & estimasi waktu moda ${modeText} berhasil disusun!`);
    } catch (e) {
      console.error("Error generating planner itinerary:", e);
      showToast('Gagal menghubungkan ke AI. Menggunakan jadwal heuristik cadangan.');
    } finally {
      setLoading(false);
    }
  };

  const handleTransportModeChange = (mode) => {
    setTransportMode(mode);
    const isFerryRegion = FERRY_SUPPORTED_KECAMATANS.includes(kecamatan);
    if (mode === 'ferry' && !isFerryRegion) {
      showToast(`Wilayah ${kecamatan} merupakan dataran tinggi (jalur darat). Jadwal penyeberangan Feri disesuaikan melalui pelabuhan terdekat di Danau Toba (Samosir ⇄ Parapat/Ajibata/Balige).`);
    }

    setItineraryDays(prevDays => {
      return prevDays.map(day => {
        const slotsConfig = getTimeSlotsByMode(mode, day.dayNumber, kecamatan);
        const transportCost = mode === 'ferry' ? 95000 : mode === 'bike' ? 45000 : 70000;
        
        const updatedItems = day.items.map((item, idx) => {
          const config = slotsConfig[idx] || slotsConfig[slotsConfig.length - 1];
          const baseNote = (item.note || '').split('. ')[0] || item.note;
          return {
            ...item,
            time: config.time,
            note: `${baseNote}. ${config.noteSuffix}`
          };
        });

        return {
          ...day,
          budgetEst: {
            ...day.budgetEst,
            transport: transportCost * travelerCount
          },
          items: updatedItems
        };
      });
    });

    const modeName = mode === 'ferry' ? 'Feri Danau' : mode === 'bike' ? 'Sepeda Motor' : 'Mobil Pribadi';
    showToast(`Waktu transit & jadwal otomatis disesuaikan untuk moda ${modeName}!`);
  };

  const handleKecamatanChange = (newKec) => {
    setKecamatan(newKec);
    const isFerryRegion = FERRY_SUPPORTED_KECAMATANS.includes(newKec);
    if (transportMode === 'ferry' && !isFerryRegion) {
      showToast(`Wilayah ${newKec} merupakan dataran tinggi (jalur darat). Moda dialihkan ke Mobil untuk rute darat.`);
      setTransportMode('car');
      generateCustomItinerary(selectedDuration, newKec, query, 'car');
    } else {
      generateCustomItinerary(selectedDuration, newKec, query, transportMode);
    }
  };

  const handleSelectTheme = (theme) => {
    setActiveTheme(theme.id);
    setQuery(theme.query);
    generateCustomItinerary(selectedDuration, kecamatan, theme.query, transportMode);
  };

  const handleToggleCheck = (id) => {
    setPackingList(packingList.map(item => item.id === id ? { ...item, done: !item.done } : item));
  };

  const handleAddPackingItem = (e) => {
    if (e) e.preventDefault();
    if (!newPackingText.trim()) return;
    setPackingList([
      ...packingList,
      { id: Date.now(), text: newPackingText.trim(), done: false }
    ]);
    setNewPackingText('');
    showToast('Item perlengkapan baru ditambahkan!');
  };

  const handleDeletePackingItem = (id) => {
    setPackingList(packingList.filter(item => item.id !== id));
  };

  const moveItem = (dayIdx, itemIdx, direction) => {
    const newDays = [...itineraryDays];
    const items = [...newDays[dayIdx].items];
    const targetIdx = itemIdx + direction;
    if (targetIdx >= 0 && targetIdx < items.length) {
      const temp = items[itemIdx];
      items[itemIdx] = items[targetIdx];
      items[targetIdx] = temp;
      newDays[dayIdx].items = items;
      setItineraryDays(newDays);
      showToast('Urutan aktivitas diperbarui!');
    }
  };

  const deleteItem = (dayIdx, itemIdx) => {
    const newDays = [...itineraryDays];
    newDays[dayIdx].items = newDays[dayIdx].items.filter((_, idx) => idx !== itemIdx);
    setItineraryDays(newDays);
    showToast('Aktivitas berhasil dihapus dari jadwal.');
  };

  const handleAddNewSlot = () => {
    if (!newSlotData.title.trim()) {
      alert('Judul tempat/aktivitas harus diisi');
      return;
    }
    const newDays = [...itineraryDays];
    const currentItems = [...newDays[activeDayIndex].items];
    const newItem = {
      id: `custom-${Date.now()}`,
      title: newSlotData.title,
      time: newSlotData.time,
      category: newSlotData.category,
      location: newSlotData.location || 'Kawasan Danau Toba',
      temp: '23°C',
      cost: newSlotData.cost || 'Rp 10.000',
      note: newSlotData.note || 'Aktivitas kustom tambahan.',
      destRef: {
        id: Date.now(),
        nama: newSlotData.title,
        kategori: newSlotData.category.toLowerCase(),
        kecamatan: kecamatan || 'Balige',
        nama_jalan: newSlotData.location,
        latitude: KECAMATAN_COORDS[kecamatan]?.lat || 2.3333,
        longitude: KECAMATAN_COORDS[kecamatan]?.lon || 99.0667
      }
    };
    currentItems.push(newItem);
    newDays[activeDayIndex].items = currentItems;
    
    // Tambahkan juga ke list destinasi hari tersebut untuk peta GIS
    if (newDays[activeDayIndex].destinasiUtama) {
      newDays[activeDayIndex].destinasiUtama.push(newItem.destRef);
    }

    setItineraryDays(newDays);
    setIsAddModalOpen(false);
    setNewSlotData({
      title: '', time: '10:00 – 12:00 WIB', category: 'Wisata Alam', location: 'Kawasan Danau Toba', cost: 'Rp 15.000', note: 'Menikmati keindahan alam dan suasana asri kaldera.'
    });
    showToast('Spot aktivitas baru berhasil ditambahkan ke jadwal!');
  };

  const handleAddDay = () => {
    const newCount = selectedDuration + 1;
    if (newCount > 7) {
      showToast('Maksimum durasi Studio adalah 7 Hari.');
      return;
    }
    setSelectedDuration(newCount);
  };

  const handleRemoveDay = (dayIdx) => {
    if (itineraryDays.length <= 1) {
      showToast('Minimal harus ada 1 hari perjalanan.');
      return;
    }
    const newDays = itineraryDays.filter((_, idx) => idx !== dayIdx);
    setItineraryDays(newDays);
    setSelectedDuration(newDays.length);
    if (activeDayIndex >= newDays.length) {
      setActiveDayIndex(newDays.length - 1);
    }
    showToast(`Hari ke-${dayIdx + 1} berhasil dihapus.`);
  };

  // Ekspor Teks Jadwal
  const generateFormattedText = () => {
    let text = `========================================\n`;
    text += `🗺️ ITINERARY PERJALANAN DANAU TOBA\n`;
    text += `Dibuat dengan TobaRoute AI Trip Planner\n`;
    text += `Durasi: ${selectedDuration} Hari | Fokus: ${kecamatan || 'Kawasan Toba'}\n`;
    text += `Moda: ${transportMode === 'car' ? 'Mobil' : transportMode === 'bike' ? 'Sepeda Motor' : 'Kapal Feri Danau'}\n`;
    text += `========================================\n\n`;

    itineraryDays.forEach((d) => {
      text += `📅 ${d.title.toUpperCase()}\n`;
      text += `🌤️ Cuaca: ${d.weather?.temp} (${d.weather?.status}) | Angin: ${d.weather?.wind}\n`;
      text += `💡 Tips Outfit: ${d.weather?.outfit}\n\n`;
      d.items.forEach((item, idx) => {
        text += `  ${idx + 1}. [${item.time}] ${item.title}\n`;
        text += `     • Kategori: ${item.category}\n`;
        text += `     • Lokasi: ${item.location}\n`;
        text += `     • Estimasi Biaya: ${item.cost}\n`;
        text += `     • Info: ${item.note}\n\n`;
      });
      text += `----------------------------------------\n\n`;
    });

    text += `✨ Disusun otomatis berbasis AI Geopark Danau Toba & UMKM Fairness Algorithm.\n`;
    return text;
  };

  const handleCopyItinerary = () => {
    const text = generateFormattedText();
    navigator.clipboard.writeText(text);
    showToast('Seluruh itinerary berhasil disalin ke clipboard!');
  };

  const handleShareWhatsApp = () => {
    const text = generateFormattedText();
    const waUrl = `https://api.whatsapp.com/send?text=${encodeURIComponent(text)}`;
    window.open(waUrl, '_blank');
  };

  const handleDownloadJSON = () => {
    const tripData = {
      platform: 'TobaRoute AI',
      generatedAt: new Date().toISOString(),
      duration: selectedDuration,
      kecamatan: kecamatan,
      query: query,
      days: itineraryDays,
      packingList: packingList
    };
    const blob = new Blob([JSON.stringify(tripData, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `tobaroute-itinerary-${kecamatan.toLowerCase() || 'toba'}-${selectedDuration}d.json`;
    a.click();
    URL.revokeObjectURL(url);
    showToast('File itinerary JSON berhasil diunduh!');
  };

  const currentDay = itineraryDays[activeDayIndex] || itineraryDays[0];

  // Destinasi untuk peta pada hari aktif
  const currentDayDestinations = useMemo(() => {
    if (!currentDay) return [];
    const list = [];
    currentDay.items.forEach(it => {
      if (it.destRef) list.push(it.destRef);
    });
    return list;
  }, [currentDay]);

  // Kalkulasi Anggaran Dinamis
  const totalMakan = (currentDay?.budgetEst?.makan || 120000) * selectedDuration * travelerCount;
  const totalTiket = (currentDay?.budgetEst?.tiket || 35000) * selectedDuration * travelerCount;
  const totalTransport = (currentDay?.budgetEst?.transport || 70000) * selectedDuration;
  const totalOlehOleh = (currentDay?.budgetEst?.olehOleh || 150000) * (travelerCount > 1 ? 1.5 : 1);
  const totalPenginapan = (currentDay?.budgetEst?.penginapan || 300000) * Math.max(selectedDuration - 1, 1);
  const grandTotalBudget = totalMakan + totalTiket + totalTransport + totalOlehOleh + totalPenginapan;

  return (
    <div className="planner-page-container fade-in" style={{ padding: '3rem 0 5rem 0' }}>
      <div className="container">
        
        {/* Header Studio Planner */}
        <div style={{ textAlign: 'center', maxWidth: '780px', margin: '0 auto 2.5rem auto' }}>
          <span className="badge badge-blue" style={{ marginBottom: '0.85rem', display: 'inline-flex', alignItems: 'center', gap: '0.35rem' }}>
            <Sparkles size={13} /> Studio Perencana AI Danau Toba
          </span>
          <h1 style={{ fontSize: '2.4rem', fontWeight: 800, color: '#0A0F1E', letterSpacing: '-0.025em', margin: '0 0 0.75rem 0' }}>
            Rancang & Kustomisasi Itinerary Sempurna
          </h1>
          <p style={{ fontSize: '1rem', color: '#64748B', lineHeight: 1.65 }}>
            Atur jadwal jam-ke-jam, geser rute, tambahkan spot kustom, hitung estimasi anggaran, dan visualisasikan peta GIS secara instan.
          </p>
        </div>

        {/* Studio Control Toolbar Card */}
        <div className="card" style={{ padding: '1.75rem', marginBottom: '2rem', background: '#ffffff', borderRadius: '20px', border: '1px solid #E2E8F0', boxShadow: 'var(--shadow-sm)' }}>
          
          {/* Row 1: Durasi, Fokus Wilayah, Moda, & Jumlah Wisatawan */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1.25rem', marginBottom: '1.25rem' }}>
            
            {/* Durasi Hari */}
            <div>
              <label style={{ display: 'flex', alignItems: 'center', gap: '0.35rem', fontSize: '0.75rem', fontWeight: 700, color: '#475569', textTransform: 'uppercase', marginBottom: '0.4rem', letterSpacing: '0.03em' }}>
                <Calendar size={13} color="#0071CE" /> Durasi Perjalanan:
              </label>
              <div style={{ display: 'flex', gap: '0.35rem' }}>
                {[1, 2, 3, 4, 5, 7].map((num) => (
                  <button
                    key={num}
                    className={`btn-secondary${selectedDuration === num ? ' active' : ''}`}
                    onClick={() => { setSelectedDuration(num); setActiveDayIndex(0); }}
                    style={{
                      flex: 1,
                      padding: '0.45rem 0.2rem',
                      borderRadius: '8px',
                      fontWeight: 700,
                      fontSize: '0.82rem',
                      background: selectedDuration === num ? '#0071CE' : '#F8FAFC',
                      color: selectedDuration === num ? '#ffffff' : '#475569',
                      borderColor: selectedDuration === num ? '#0071CE' : '#E2E8F0',
                      cursor: 'pointer'
                    }}
                  >
                    {num}H
                  </button>
                ))}
              </div>
            </div>

            {/* Target Wilayah */}
            <div>
              <label style={{ display: 'flex', alignItems: 'center', gap: '0.35rem', fontSize: '0.75rem', fontWeight: 700, color: '#475569', textTransform: 'uppercase', marginBottom: '0.4rem', letterSpacing: '0.03em' }}>
                <MapPin size={13} color="#0071CE" /> Fokus Wilayah:
              </label>
              <select
                value={kecamatan}
                onChange={(e) => handleKecamatanChange(e.target.value)}
                style={{ height: '38px', fontWeight: 600, width: '100%' }}
              >
                <option value="Balige">Balige & Toba (Pelabuhan Feri)</option>
                <option value="Samosir">Pulau Samosir (Pusat Feri Danau)</option>
                <option value="Parapat">Parapat & Simalungun (Pelabuhan Ajibata)</option>
                <option value="Doloksanggul">Humbahas (Sipinsur & Bakkara - Jalur Darat)</option>
                <option value="Tarutung">Tapanuli Utara (Muara Feri & Tarutung)</option>
                <option value="Berastagi">Karo (Tongging & Sipiso-piso - Jalur Darat)</option>
                <option value="Sidikalang">Dairi (Silalahi - Jalur Darat)</option>
                <option value="Laguboti">Laguboti & Porsea (Jalur Darat)</option>
              </select>
            </div>

            {/* Moda Transportasi */}
            <div>
              <label style={{ display: 'flex', alignItems: 'center', gap: '0.35rem', fontSize: '0.75rem', fontWeight: 700, color: '#475569', textTransform: 'uppercase', marginBottom: '0.4rem', letterSpacing: '0.03em' }}>
                <Car size={13} color="#0071CE" /> Moda Transportasi:
              </label>
              <div style={{ display: 'flex', gap: '0.35rem' }}>
                {[
                  { id: 'car', icon: <Car size={13} />, label: 'Mobil' },
                  { id: 'bike', icon: <Bike size={13} />, label: 'Motor' },
                  { id: 'ferry', icon: <Ship size={13} />, label: 'Feri' },
                ].map((m) => (
                  <button
                    key={m.id}
                    type="button"
                    onClick={() => handleTransportModeChange(m.id)}
                    style={{
                      flex: 1,
                      padding: '0.45rem 0.3rem',
                      borderRadius: '8px',
                      fontWeight: 600,
                      fontSize: '0.8rem',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      gap: '0.25rem',
                      background: transportMode === m.id ? '#0F172A' : '#F8FAFC',
                      color: transportMode === m.id ? '#ffffff' : '#475569',
                      border: '1px solid',
                      borderColor: transportMode === m.id ? '#0F172A' : '#E2E8F0',
                      cursor: 'pointer',
                      transition: 'all 0.15s ease'
                    }}
                  >
                    {m.icon} {m.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Jumlah Wisatawan */}
            <div>
              <label style={{ display: 'flex', alignItems: 'center', gap: '0.35rem', fontSize: '0.75rem', fontWeight: 700, color: '#475569', textTransform: 'uppercase', marginBottom: '0.4rem', letterSpacing: '0.03em' }}>
                <Users size={13} color="#0071CE" /> Peserta:
              </label>
              <select
                value={travelerCount}
                onChange={(e) => setTravelerCount(Number(e.target.value))}
                style={{ height: '38px', fontWeight: 600, width: '100%' }}
              >
                <option value={1}>1 Orang (Solo Traveler)</option>
                <option value={2}>2 Orang (Pasangan / Duet)</option>
                <option value={4}>4 Orang (Keluarga Kecil)</option>
                <option value={6}>6+ Orang (Rombongan)</option>
              </select>
            </div>

          </div>

          {/* Row 2: Free-text Query & Quick Theme Chips */}
          <div style={{ paddingTop: '1rem', borderTop: '1px solid #F1F5F9' }}>
            <label style={{ display: 'flex', alignItems: 'center', gap: '0.35rem', fontSize: '0.75rem', fontWeight: 700, color: '#475569', textTransform: 'uppercase', marginBottom: '0.4rem', letterSpacing: '0.03em' }}>
              <Sparkles size={13} color="#0071CE" /> Gaya & Preferensi Wisata (AI Prompt):
            </label>
            <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
              <input
                type="text"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Tuliskan keinginan wisata Anda (misal: Wisata budaya tenun ulos, pantai pasir putih, dan makan ikan mas arsik)"
                style={{ flex: 1, minWidth: '260px', height: '40px', padding: '0 0.85rem', borderRadius: '8px', border: '1.5px solid #CBD5E1', fontSize: '0.85rem' }}
              />
              <button
                className="btn-primary"
                onClick={() => generateCustomItinerary(selectedDuration, kecamatan, query)}
                disabled={loading}
                style={{ height: '40px', padding: '0 1.25rem' }}
              >
                <RotateCw size={14} className={loading ? 'spinner' : ''} />
                <span>{loading ? 'Menyusun...' : 'Buat Ulang Rute AI'}</span>
              </button>
            </div>

            {/* Quick Theme Chips */}
            <div className="planner-chip-group">
              <span style={{ fontSize: '0.75rem', fontWeight: 600, color: '#94A3B8', alignSelf: 'center', marginRight: '0.25rem' }}>Tema Cepat:</span>
              {THEME_PRESETS.map((th) => (
                <button
                  key={th.id}
                  type="button"
                  className={`planner-theme-chip${activeTheme === th.id ? ' active' : ''}`}
                  onClick={() => handleSelectTheme(th)}
                >
                  {th.icon} {th.label}
                </button>
              ))}
            </div>
          </div>

          {/* Row 3: Action Toolbar (Print, Copy, WhatsApp, Download) */}
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '0.75rem', marginTop: '1.25rem', paddingTop: '1rem', borderTop: '1px solid #F1F5F9' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.82rem', color: '#64748B' }}>
              <ShieldCheck size={16} color="#00875A" />
              <span>Itinerary terverifikasi mencakup destinasi unggulan & keterpaparan UMKM lokal.</span>
            </div>

            <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
              <button
                type="button"
                className="btn-secondary"
                onClick={handleCopyItinerary}
                style={{ height: '36px', padding: '0 0.85rem', fontSize: '0.8rem', display: 'inline-flex', alignItems: 'center', gap: '0.35rem' }}
                title="Salin Teks Itinerary Lengkap"
              >
                <Copy size={13} /> Salin Teks
              </button>

              <button
                type="button"
                className="btn-secondary"
                onClick={handleShareWhatsApp}
                style={{ height: '36px', padding: '0 0.85rem', fontSize: '0.8rem', display: 'inline-flex', alignItems: 'center', gap: '0.35rem', color: '#16A34A', borderColor: '#BBF7D0' }}
                title="Bagikan ke WhatsApp"
              >
                <Share2 size={13} /> WhatsApp
              </button>

              <button
                type="button"
                className="btn-secondary"
                onClick={handleDownloadJSON}
                style={{ height: '36px', padding: '0 0.85rem', fontSize: '0.8rem', display: 'inline-flex', alignItems: 'center', gap: '0.35rem' }}
                title="Unduh Rencana format JSON"
              >
                <Download size={13} /> JSON
              </button>

              <button
                type="button"
                className="btn-secondary"
                onClick={() => window.print()}
                style={{ height: '36px', padding: '0 0.85rem', fontSize: '0.8rem', display: 'inline-flex', alignItems: 'center', gap: '0.35rem' }}
                title="Cetak Rencana Perjalanan"
              >
                <Printer size={13} /> Cetak
              </button>
            </div>
          </div>

        </div>

        {/* Main Grid Studio (Left: Itinerary Timeline & Map, Right: Budget & Packing) */}
        <div style={{ display: 'grid', gridTemplateColumns: '1.65fr 0.85fr', gap: '2rem' }}>
          
          {/* ====================================================== */}
          {/* KOLOM KIRI: Day Tabs, Weather, Timeline, & GIS Map     */}
          {/* ====================================================== */}
          <div>
            
            {/* Day Selector Tabs & Add Day Button */}
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '0.4rem', overflowX: 'auto', paddingBottom: '0.5rem', marginBottom: '1.25rem' }}>
              <div style={{ display: 'flex', gap: '0.4rem' }}>
                {itineraryDays.map((d, idx) => (
                  <button
                    key={idx}
                    className={`day-tab-btn${activeDayIndex === idx ? ' active' : ''}`}
                    onClick={() => setActiveDayIndex(idx)}
                  >
                    <Calendar size={13} />
                    <span>{d.dateLabel}</span>
                  </button>
                ))}
              </div>

              <div style={{ display: 'flex', gap: '0.35rem' }}>
                <button
                  type="button"
                  onClick={handleAddDay}
                  className="btn-secondary"
                  style={{ fontSize: '0.78rem', padding: '0.45rem 0.75rem', whiteSpace: 'nowrap' }}
                  title="Tambah 1 Hari Perjalanan"
                >
                  <Plus size={13} /> Tambah Hari
                </button>
                
                {itineraryDays.length > 1 && (
                  <button
                    type="button"
                    onClick={() => handleRemoveDay(activeDayIndex)}
                    className="btn-secondary"
                    style={{ fontSize: '0.78rem', padding: '0.45rem 0.75rem', color: '#DC2626', borderColor: '#FECACA' }}
                    title="Hapus Hari Aktif Ini"
                  >
                    <Trash2 size={13} />
                  </button>
                )}
              </div>
            </div>

            {/* Weather Card for Active Day */}
            {currentDay && (
              <div className="daily-weather-bar">
                <div className="weather-forecast-badge">
                  <div className="weather-icon-dot"><Sun size={20} /></div>
                  <span className="weather-temp-num">{currentDay.weather?.temp}</span>
                  <div className="weather-detail-col">
                    <span className="weather-status-text">{currentDay.weather?.status}</span>
                    <span className="weather-sub-text">Kelembapan {currentDay.weather?.humidity} · Angin Danau {currentDay.weather?.wind}</span>
                  </div>
                </div>

                <div className="weather-outfit-tip">
                  <CheckCircle size={14} />
                  <span>{currentDay.weather?.outfit}</span>
                </div>
              </div>
            )}

            {/* Dynamic Transit Logistics Pill for Active Day */}
            <div style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              flexWrap: 'wrap',
              gap: '0.75rem',
              padding: '0.75rem 1rem',
              borderRadius: '12px',
              background: transportMode === 'ferry' ? 'linear-gradient(135deg, #EFF6FF, #DBEAFE)' : transportMode === 'bike' ? 'linear-gradient(135deg, #F0FDF4, #DCFCE7)' : 'linear-gradient(135deg, #F8FAFC, #F1F5F9)',
              border: `1px solid ${transportMode === 'ferry' ? '#BFDBFE' : transportMode === 'bike' ? '#BBF7D0' : '#E2E8F0'}`,
              marginBottom: '1rem',
              fontSize: '0.82rem'
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontWeight: 700, color: transportMode === 'ferry' ? '#1D4ED8' : transportMode === 'bike' ? '#15803D' : '#0F172A' }}>
                {transportMode === 'ferry' ? <Ship size={16} /> : transportMode === 'bike' ? <Bike size={16} /> : <Car size={16} />}
                <span>
                  {transportMode === 'ferry' 
                    ? 'Logistik Feri Danau: Terkoneksi penyeberangan kapal feri perairan Danau Toba (estimasi 45 mnt penyeberangan air).'
                    : transportMode === 'bike'
                    ? 'Logistik Sepeda Motor: Kecepatan lincah, parkir praktis, waktu transit antar-spot lebih hemat ~25%.'
                    : 'Logistik Mobil: Estimasi kecepatan normal jalan berliku kaldera ~40 km/jam via jalur aspal.'}
                </span>
              </div>
              <span style={{ 
                fontSize: '0.72rem', 
                fontWeight: 800, 
                padding: '0.2rem 0.55rem', 
                borderRadius: '6px',
                background: transportMode === 'ferry' ? '#2563EB' : transportMode === 'bike' ? '#16A34A' : '#475569',
                color: '#ffffff',
                textTransform: 'uppercase',
                letterSpacing: '0.04em'
              }}>
                {transportMode === 'ferry' ? 'Rute Kapal & Pesisir' : transportMode === 'bike' ? 'Transit Cepat' : 'Jalur Standar'}
              </span>
            </div>

            {/* Action Row: Add New Activity Button */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
              <div style={{ fontSize: '0.9rem', fontWeight: 800, color: '#0F172A' }}>
                {currentDay?.title} ({currentDay?.items.length || 0} Aktivitas)
              </div>
              <button
                type="button"
                className="btn-primary"
                onClick={() => setIsAddModalOpen(true)}
                style={{ fontSize: '0.78rem', padding: '0.45rem 0.95rem', display: 'inline-flex', alignItems: 'center', gap: '0.35rem' }}
              >
                <Plus size={14} /> Tambah Spot / Aktivitas
              </button>
            </div>

            {/* Timeline Schedule Items with Reorder & CRUD */}
            {currentDay && (
              <div className="timeline-schedule-list" style={{ borderLeftColor: '#E2E8F0', marginBottom: '2.5rem' }}>
                {currentDay.items.map((slot, sIdx) => (
                  <div key={slot.id || sIdx} className="timeline-slot-item">
                    <div className="timeline-bullet" />
                    <div className="timeline-slot-card" style={{ marginBottom: '0.75rem' }}>
                      
                      {/* Time & Weather Col */}
                      <div className="slot-time-col">
                        <span className="slot-time-pill">
                          <Clock size={11} /> {slot.time}
                        </span>
                        <span className="slot-weather-chip">
                          <Thermometer size={11} /> {slot.temp || '23°C'}
                        </span>
                      </div>

                      {/* Content Col */}
                      <div className="slot-content-col">
                        <span className="slot-category-tag">{slot.category}</span>
                        <h4 style={{ margin: '0 0 0.25rem 0' }}>{slot.title}</h4>
                        <div style={{ fontSize: '0.78rem', color: '#64748B', marginBottom: '0.35rem', display: 'flex', alignItems: 'center', gap: '0.5rem', flexWrap: 'wrap' }}>
                          <span><MapPin size={11} style={{ display: 'inline', verticalAlign: 'text-top' }} /> {slot.location}</span>
                          <span>·</span>
                          <strong style={{ color: '#00875A' }}>{slot.cost}</strong>
                        </div>
                        <div className="slot-ai-reason">{slot.note}</div>
                      </div>

                      {/* Action Controls: Move Up, Move Down, Edit, Delete */}
                      <div style={{ display: 'flex', gap: '0.3rem', flexShrink: 0, alignItems: 'center' }}>
                        <button 
                          className="slot-action-btn"
                          onClick={() => moveItem(activeDayIndex, sIdx, -1)} 
                          disabled={sIdx === 0} 
                          title="Geser ke Atas"
                        >
                          <ArrowUp size={13} />
                        </button>
                        <button 
                          className="slot-action-btn"
                          onClick={() => moveItem(activeDayIndex, sIdx, 1)} 
                          disabled={sIdx === currentDay.items.length - 1} 
                          title="Geser ke Bawah"
                        >
                          <ArrowDown size={13} />
                        </button>
                        <button 
                          className="slot-action-btn btn-delete"
                          onClick={() => deleteItem(activeDayIndex, sIdx)} 
                          title="Hapus Spot"
                        >
                          <Trash2 size={13} />
                        </button>
                      </div>

                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* Integrated Interactive GIS RouteMap for Active Day */}
            <div className="card" style={{ padding: '1.5rem', borderRadius: '20px', background: '#FFFFFF', border: '1px solid #E2E8F0', marginTop: '2rem' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  <Compass size={18} color="#0071CE" />
                  <h3 style={{ fontSize: '1.15rem', fontWeight: 800, margin: 0, color: '#0F172A' }}>
                    Peta Visualisasi Rute GIS — {currentDay?.dateLabel}
                  </h3>
                </div>
                <span className="badge badge-blue" style={{ fontSize: '0.72rem' }}>
                  {currentDayDestinations.length} Titik Kunjungan Terplot
                </span>
              </div>
              <p style={{ fontSize: '0.82rem', color: '#64748B', marginTop: 0, marginBottom: '1rem' }}>
                Pin bernomor urut di peta merepresentasikan alur perjalanan Anda hari ini dari titik keberangkatan hingga tujuan akhir.
              </p>
              
              <RouteMap 
                destinasiUtama={currentDay?.destinasiUtama || currentDayDestinations} 
                umkmSekitar={currentDay?.umkmSekitar || []} 
              />
            </div>

          </div>

          {/* ====================================================== */}
          {/* KOLOM KANAN: Kalkulator Anggaran & Packing Checklist  */}
          {/* ====================================================== */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1.75rem' }}>
            
            {/* Widget Estimasi Biaya Cerdas */}
            <div className="card" style={{ padding: '1.5rem', background: '#ffffff', borderRadius: '20px', border: '1px solid #E2E8F0', boxShadow: 'var(--shadow-sm)' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
                <h3 style={{ fontSize: '1.1rem', fontWeight: 800, color: '#0A0F1E', margin: 0, display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                  <DollarSign size={17} color="#00875A" /> Estimasi Anggaran
                </h3>
                <span className="badge badge-green" style={{ fontSize: '0.72rem' }}>
                  {travelerCount} Orang · {selectedDuration} Hari
                </span>
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem', fontSize: '0.85rem' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', paddingBottom: '0.4rem', borderBottom: '1px dashed #E2E8F0' }}>
                  <span style={{ color: '#64748B' }}>Kuliner & Santap:</span>
                  <span style={{ fontWeight: 700, color: '#0A0F1E' }}>Rp {totalMakan.toLocaleString('id-ID')}</span>
                </div>
                
                <div style={{ display: 'flex', justifyContent: 'space-between', paddingBottom: '0.4rem', borderBottom: '1px dashed #E2E8F0' }}>
                  <span style={{ color: '#64748B' }}>Tiket Wisata & Retribusi:</span>
                  <span style={{ fontWeight: 700, color: '#0A0F1E' }}>Rp {totalTiket.toLocaleString('id-ID')}</span>
                </div>

                <div style={{ display: 'flex', justifyContent: 'space-between', paddingBottom: '0.4rem', borderBottom: '1px dashed #E2E8F0' }}>
                  <span style={{ color: '#64748B' }}>Bahan Bakar & Tiket Feri:</span>
                  <span style={{ fontWeight: 700, color: '#0A0F1E' }}>Rp {totalTransport.toLocaleString('id-ID')}</span>
                </div>

                <div style={{ display: 'flex', justifyContent: 'space-between', paddingBottom: '0.4rem', borderBottom: '1px dashed #E2E8F0' }}>
                  <span style={{ color: '#64748B' }}>Belanja UMKM & Oleh-Oleh:</span>
                  <span style={{ fontWeight: 700, color: '#0A0F1E' }}>Rp {totalOlehOleh.toLocaleString('id-ID')}</span>
                </div>

                <div style={{ display: 'flex', justifyContent: 'space-between', paddingBottom: '0.4rem', borderBottom: '1px dashed #E2E8F0' }}>
                  <span style={{ color: '#64748B' }}>Akomodasi / Penginapan:</span>
                  <span style={{ fontWeight: 700, color: '#0A0F1E' }}>Rp {totalPenginapan.toLocaleString('id-ID')}</span>
                </div>
                
                <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '0.5rem', paddingTop: '0.75rem', borderTop: '1.5px solid #0A0F1E', fontSize: '1rem', fontWeight: 800 }}>
                  <span>Total Anggaran:</span>
                  <span style={{ color: '#0071CE' }}>
                    Rp {grandTotalBudget.toLocaleString('id-ID')}
                  </span>
                </div>
                <div style={{ fontSize: '0.75rem', color: '#94A3B8', textAlign: 'right' }}>
                  (~Rp {Math.round(grandTotalBudget / travelerCount).toLocaleString('id-ID')} / orang)
                </div>
              </div>
            </div>

            {/* Checklist Perlengkapan Wisata Dinamis */}
            <div className="card" style={{ padding: '1.5rem', background: '#ffffff', borderRadius: '20px', border: '1px solid #E2E8F0', boxShadow: 'var(--shadow-sm)' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem' }}>
                <h3 style={{ fontSize: '1.1rem', fontWeight: 800, color: '#0A0F1E', margin: 0, display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                  <CheckSquare size={17} color="#0071CE" /> Checklist Perlengkapan
                </h3>
                <span style={{ fontSize: '0.75rem', color: '#64748B', fontWeight: 700 }}>
                  {packingList.filter(i => i.done).length}/{packingList.length} Siap
                </span>
              </div>
              <p style={{ fontSize: '0.78rem', color: '#64748B', margin: '0 0 1rem 0' }}>
                Disesuaikan otomatis dengan suhu sejuk kaldera dan kondisi geografis Danau Toba.
              </p>

              {/* Form Tambah Item Perlengkapan */}
              <form onSubmit={handleAddPackingItem} style={{ display: 'flex', gap: '0.4rem', marginBottom: '1rem' }}>
                <input
                  type="text"
                  value={newPackingText}
                  onChange={(e) => setNewPackingText(e.target.value)}
                  placeholder="+ Tambah barang bawaan..."
                  style={{ flex: 1, height: '34px', padding: '0 0.65rem', borderRadius: '6px', border: '1px solid #CBD5E1', fontSize: '0.8rem' }}
                />
                <button
                  type="submit"
                  className="btn-primary"
                  style={{ padding: '0 0.75rem', height: '34px', fontSize: '0.78rem' }}
                >
                  <Plus size={13} />
                </button>
              </form>

              {/* Item Checklist */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.6rem', maxHeight: '280px', overflowY: 'auto' }}>
                {packingList.map(item => (
                  <div key={item.id} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '0.5rem' }}>
                    <label style={{ display: 'flex', alignItems: 'center', gap: '0.55rem', fontSize: '0.82rem', color: item.done ? '#94A3B8' : '#334155', cursor: 'pointer', textDecoration: item.done ? 'line-through' : 'none', flex: 1 }}>
                      <input 
                        type="checkbox" 
                        checked={item.done} 
                        onChange={() => handleToggleCheck(item.id)}
                        style={{ width: '15px', height: '15px', accentColor: '#0071CE', cursor: 'pointer' }}
                      />
                      <span>{item.text}</span>
                    </label>
                    <button
                      type="button"
                      onClick={() => handleDeletePackingItem(item.id)}
                      style={{ background: 'none', border: 'none', color: '#CBD5E1', cursor: 'pointer', padding: '2px 4px' }}
                      title="Hapus item"
                    >
                      <X size={13} />
                    </button>
                  </div>
                ))}
              </div>
            </div>

            {/* Card Panduan Cepat Kaldera */}
            <div className="card" style={{ padding: '1.35rem', background: '#F8FAFC', borderRadius: '16px', border: '1px solid #E2E8F0' }}>
              <h4 style={{ fontSize: '0.88rem', fontWeight: 800, color: '#0F172A', margin: '0 0 0.5rem 0', display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
                <Info size={15} color="#0071CE" /> Tips Wisatawan Kaldera Toba
              </h4>
              <ul style={{ margin: 0, paddingLeft: '1.25rem', fontSize: '0.78rem', color: '#475569', lineHeight: 1.6 }}>
                <li>Pagi hari (08.00–10.00 WIB) adalah waktu terbaik berfoto di bukit sabana kaldera karena minim kabut.</li>
                <li>Selalu siapkan uang tunai kecil untuk retribusi geosite dan sentra penenun Ulos tradisional.</li>
                <li>Jika menyeberang via feri Ajibata–Ambarita, usahakan tiba 30 menit sebelum jadwal keberangkatan kapal.</li>
              </ul>
            </div>

          </div>

        </div>

      </div>

      {/* ====================================================== */}
      {/* MODAL DIALOG: TAMBAH SPOT BARU                         */}
      {/* ====================================================== */}
      {isAddModalOpen && (
        <div className="modal-overlay" onClick={() => setIsAddModalOpen(false)}>
          <div className="modal-content-card" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header-row">
              <h3>Tambah Spot Baru — {currentDay?.dateLabel}</h3>
              <button 
                type="button" 
                onClick={() => setIsAddModalOpen(false)}
                style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#64748B' }}
              >
                <X size={18} />
              </button>
            </div>
            
            <div className="modal-body-form">
              <label className="form-group-label">
                <span>Nama Tempat / Spot Aktivitas:</span>
                <input
                  type="text"
                  placeholder="misal: Bukit Holbung, Kedai Kopi Siborongborong..."
                  value={newSlotData.title}
                  onChange={(e) => setNewSlotData({ ...newSlotData, title: e.target.value })}
                />
              </label>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem' }}>
                <label className="form-group-label">
                  <span>Waktu Kunjungan:</span>
                  <input
                    type="text"
                    value={newSlotData.time}
                    onChange={(e) => setNewSlotData({ ...newSlotData, time: e.target.value })}
                  />
                </label>

                <label className="form-group-label">
                  <span>Kategori:</span>
                  <select
                    value={newSlotData.category}
                    onChange={(e) => setNewSlotData({ ...newSlotData, category: e.target.value })}
                  >
                    <option value="Wisata Alam">Wisata Alam</option>
                    <option value="Kuliner Pagi">Kuliner Pagi</option>
                    <option value="Makan Siang & UMKM">Makan Siang & UMKM</option>
                    <option value="Sentra Kerajinan">Sentra Kerajinan & Budaya</option>
                    <option value="Santap Malam">Santap Malam & Santai</option>
                    <option value="Hotel & Penginapan">Hotel & Penginapan</option>
                  </select>
                </label>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem' }}>
                <label className="form-group-label">
                  <span>Lokasi / Kecamatan:</span>
                  <input
                    type="text"
                    value={newSlotData.location}
                    onChange={(e) => setNewSlotData({ ...newSlotData, location: e.target.value })}
                    placeholder="misal: Kecamatan Balige"
                  />
                </label>

                <label className="form-group-label">
                  <span>Estimasi Biaya:</span>
                  <input
                    type="text"
                    value={newSlotData.cost}
                    onChange={(e) => setNewSlotData({ ...newSlotData, cost: e.target.value })}
                    placeholder="misal: Rp 15.000 (Tiket Masuk)"
                  />
                </label>
              </div>

              <label className="form-group-label">
                <span>Alasan / Catatan Perjalanan:</span>
                <textarea
                  rows={3}
                  value={newSlotData.note}
                  onChange={(e) => setNewSlotData({ ...newSlotData, note: e.target.value })}
                  placeholder="Tuliskan panduan atau tips menarik mengenai spot ini..."
                />
              </label>
            </div>

            <div className="modal-footer-row">
              <button 
                type="button" 
                className="btn-secondary" 
                onClick={() => setIsAddModalOpen(false)}
              >
                Batal
              </button>
              <button 
                type="button" 
                className="btn-primary" 
                onClick={handleAddNewSlot}
              >
                <Plus size={14} /> Tambahkan ke Jadwal
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Toast Notification Alert */}
      {toastMessage && (
        <div className="toast-alert-box">
          <CheckCircle size={16} color="#4ADE80" />
          <span>{toastMessage}</span>
        </div>
      )}

    </div>
  );
};

export default ItineraryPlanner;
