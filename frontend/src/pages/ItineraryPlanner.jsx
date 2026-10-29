// ====================================================================================================
// FILE: frontend/src/pages/ItineraryPlanner.jsx
// TUJUAN:
// Halaman Studio Perencana Itinerary AI Interaktif Kaldera Danau Toba (UNESCO Global Geopark).
// Fitur Utama:
// 1. Zero Blank State: Dataset itinerary multi-hari presisi dan kaya untuk seluruh 6 kawasan lingkar Toba.
// 2. AI Concierge Narration: Menampilkan ulasan personal Gemini AI secara real-time dari sistem RAG.
// 3. Navigasi Terpadu ke Peta GIS (/explore):
//    - Tombol "Lihat di GIS" pada setiap slot aktivitas (membuka target marker & rute GPS seketika).
//    - Tombol "Navigasi Rute Hari Ini di GIS" untuk rute terpadu harian.
// 4. Multi-Persona Wisata (Geosite & Alam, Budaya & Tenun Ulos, Kuliner Batak, Santai Keluarga).
// 5. Interaksi Lengkap: Geser urutan aktivitas, hapus/tambah spot kustom, estimasi anggaran dinamis, & checklist.
// ====================================================================================================

import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import ReactMarkdown from 'react-markdown';
import { 
  Sparkles, Calendar, Clock, MapPin, Sun, Cloud, 
  Wind, Thermometer, Plus, Trash2, ArrowUp, ArrowDown, 
  Printer, CheckSquare, DollarSign, Navigation, 
  RotateCw, AlertCircle, CheckCircle, ShieldCheck, Compass,
  Route as RouteIcon, ArrowRight, ExternalLink, Utensils,
  Camera, Coffee, Heart, Check
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

// ====================================================================================================
// PRESET KURASI DATASET ITINERARY MULTI-HARI REGIONAL (ZERO-BLANK STATE GUARANTEE)
// ====================================================================================================
const CURATED_REGION_ITINERARIES = {
  Balige: [
    {
      dayNumber: 1,
      dateLabel: 'Hari 1',
      title: 'Hari 1: Pusaka, Pantai Pasir Putih & Gastronomi Balige',
      weather: { temp: '22°C – 25°C', status: 'Cerah Berawan', humidity: '72%', wind: '11 km/jam', outfit: 'Pakaian kasual katun & kacamata hitam' },
      budgetEst: { makan: 120000, tiket: 25000, transport: 50000, olehOleh: 150000 },
      items: [
        {
          id: 'b-1-1',
          time: '08:00 – 09:30 WIB',
          title: 'Sarapan Mie Gomak Kuah Andaliman & Kopi Lintong',
          category: 'Kuliner Pagi',
          location: 'Kedai Kopi & Warung Sarapan Balige',
          latitude: 2.3330,
          longitude: 99.0620,
          temp: '21°C',
          note: 'Memulai hari dengan kuah santan hangat rempah andaliman yang membangkitkan stamina.',
          cost: 'Rp 25.000 / porsi'
        },
        {
          id: 'b-1-2',
          time: '10:00 – 12:30 WIB',
          title: 'Pantai Pasir Putih Lumban Bul-bul Balige',
          category: 'Wisata Alam & Pantai',
          location: 'Desa Lumban Bulbul, Balige',
          latitude: 2.3320,
          longitude: 99.0720,
          temp: '25°C',
          note: 'Hamparan pasir putih alami di tepian air tawar Danau Toba dengan latar perbukitan hijau.',
          cost: 'Rp 10.000 (Retribusi)'
        },
        {
          id: 'b-1-3',
          time: '13:00 – 14:30 WIB',
          title: 'Makan Siang Dekke Naaniura & Ikan Mas Naniarsik',
          category: 'Gastronomi Autentik',
          location: 'Rumah Makan Khas Batak Balige',
          latitude: 2.3350,
          longitude: 99.0610,
          temp: '25°C',
          note: 'Sashimi tradisional Batak dengan rendaman asam jeruk jungga alami dan bumbu andaliman segar.',
          cost: 'Rp 45.000 / orang'
        },
        {
          id: 'b-1-4',
          time: '15:00 – 17:00 WIB',
          title: 'Museum Batak TB Silalahi Center',
          category: 'Pusaka & Budaya',
          location: 'Jl. Pagar Batu No. 88, Silalahi Balige',
          latitude: 2.3270,
          longitude: 99.0430,
          temp: '24°C',
          note: 'Menyimpan ribuan artefak sejarah Batak, senjata tradisional, dan replika Rumah Bolon megah.',
          cost: 'Rp 15.000 (Tiket Masuk)'
        },
        {
          id: 'b-1-5',
          time: '17:30 – 19:00 WIB',
          title: 'Belanja Souvenir & Tenun Ulos di Batikta Balige',
          category: 'Sentra UMKM Lokal',
          location: 'Pusat Kota Balige',
          latitude: 2.3340,
          longitude: 99.0640,
          temp: '22°C',
          note: 'Pusat kain tenun Ulos autentik, pakaian motif Gorga Batak, dan kerajinan tangan warga.',
          cost: 'Gratis Masuk'
        }
      ]
    },
    {
      dayNumber: 2,
      dateLabel: 'Hari 2',
      title: 'Hari 2: Lembah Hijau Meat & Sentra Tenun Ulos Harungguan',
      weather: { temp: '21°C – 24°C', status: 'Semilir Angin Lembah', humidity: '76%', wind: '14 km/jam', outfit: 'Jaket windbreaker & sepatu jalan antiselip' },
      budgetEst: { makan: 110000, tiket: 20000, transport: 60000, olehOleh: 180000 },
      items: [
        {
          id: 'b-2-1',
          time: '08:30 – 10:30 WIB',
          title: 'Desa Wisata Meat Tampahan',
          category: 'Desa Budaya & Geosite',
          location: 'Kecamatan Tampahan',
          latitude: 2.3160,
          longitude: 99.0125,
          temp: '22°C',
          note: 'Desa tenun bersejarah di lembah kaldera yang dijuluki "Desa Seribu Ulos" di bibir Danau Toba.',
          cost: 'Bebas Retribusi'
        },
        {
          id: 'b-2-2',
          time: '11:00 – 12:30 WIB',
          title: 'Penatapan Meat & Bukit Tara Bunga',
          category: 'Spot Foto Panorama',
          location: 'Desa Tara Bunga, Tampahan',
          latitude: 2.3480,
          longitude: 99.0350,
          temp: '24°C',
          note: 'Pemandangan panorama lekukan Danau Toba dan terasering sawah hijau yang memukau.',
          cost: 'Rp 5.000 / orang'
        },
        {
          id: 'b-2-3',
          time: '13:00 – 14:30 WIB',
          title: 'Makan Siang Nasi Ikan Bakar Danau & Sambal Andaliman',
          category: 'Kuliner Danau',
          location: 'Warung Makan Tepian Meat',
          latitude: 2.3170,
          longitude: 99.0140,
          temp: '24°C',
          note: 'Ikan mujair danau segar berbumbu kuning dengan pedas getir khas bumbu Batak.',
          cost: 'Rp 40.000 / orang'
        },
        {
          id: 'b-2-4',
          time: '15:00 – 17:00 WIB',
          title: 'Workshop Tenun Gedog Ulos Tradisional',
          category: 'Edukasi Budaya UMKM',
          location: 'Sanggar Tenun Warga Meat',
          latitude: 2.3150,
          longitude: 99.0110,
          temp: '23°C',
          note: 'Melihat dan mencoba langsung proses menenun kain Ulos Ragi Hotang secara manual.',
          cost: 'Sukarela / Belanja Produk'
        }
      ]
    },
    {
      dayNumber: 3,
      dateLabel: 'Hari 3',
      title: 'Hari 3: Air Terjun Kaldera, Agrowisata & Pantai Silintong',
      weather: { temp: '20°C – 23°C', status: 'Sejuk Segar Berawan', humidity: '78%', wind: '10 km/jam', outfit: 'Pakaian olahraga nyaman & baju ganti' },
      budgetEst: { makan: 115000, tiket: 30000, transport: 55000, olehOleh: 120000 },
      items: [
        {
          id: 'b-3-1',
          time: '08:30 – 11:00 WIB',
          title: 'Air Terjun Sampuran Silaen',
          category: 'Wisata Alam Tersembunyi',
          location: 'Kecamatan Silaen',
          latitude: 2.3020,
          longitude: 99.1120,
          temp: '21°C',
          note: 'Air terjun alami berudara sejuk dengan hutan lindung asri kawasan Toba.',
          cost: 'Rp 10.000 / orang'
        },
        {
          id: 'b-3-2',
          time: '11:30 – 13:30 WIB',
          title: 'Kudapan Tradisional Kue Ombusombus Hangat',
          category: 'Kuliner Warisan',
          location: 'Sentra Ombusombus Balige',
          latitude: 2.3310,
          longitude: 99.0600,
          temp: '23°C',
          note: 'Kue tepung beras ketan berbalut gula aren lumer yang disantap saat mengepul hangat.',
          cost: 'Rp 15.000 / kotak'
        },
        {
          id: 'b-3-3',
          time: '14:00 – 16:30 WIB',
          title: 'Pantai Lumban Silintong & Kafe Tepi Danau',
          category: 'Relaksasi & Sunset',
          location: 'Lumban Silintong, Balige',
          latitude: 2.3380,
          longitude: 99.0550,
          temp: '24°C',
          note: 'Menikmati hembusan angin kaldera sore hari sembari menikmati seduhan kopi Arabika Toba.',
          cost: 'Rp 30.000 / orang'
        }
      ]
    },
    {
      dayNumber: 4,
      dateLabel: 'Hari 4',
      title: 'Hari 4: Menuju Geosite Situmurun & Air Terjun Mengucur ke Danau',
      weather: { temp: '22°C – 26°C', status: 'Cerah Berangin', humidity: '70%', wind: '15 km/jam', outfit: 'Pelampung, pakaian santai & kamera anti-air' },
      budgetEst: { makan: 130000, tiket: 65000, transport: 100000, olehOleh: 100000 },
      items: [
        {
          id: 'b-4-1',
          time: '09:00 – 12:30 WIB',
          title: 'Air Terjun Situmurun / Binangalom (Via Boat)',
          category: 'Geosite Fenomenal UNESCO',
          location: 'Kecamatan Lumban Julu',
          latitude: 2.5180,
          longitude: 99.0730,
          temp: '24°C',
          note: 'Salah satu air terjun terlangka di dunia yang airnya langsung mengucur ke permukaan Danau Toba.',
          cost: 'Sewa Kapal Wisata'
        },
        {
          id: 'b-4-2',
          time: '13:00 – 14:30 WIB',
          title: 'Makan Siang Ikan Bakar Nila Danau Toba',
          category: 'Kuliner Tepi Dermaga',
          location: 'Pelabuhan Ajibata / Lumban Julu',
          latitude: 2.6640,
          longitude: 98.9300,
          temp: '25°C',
          note: 'Sajian ikan segar hasil budidaya perairan dalam kaldera dengan sambal andaliman jeruk jungga.',
          cost: 'Rp 45.000 / orang'
        }
      ]
    },
    {
      dayNumber: 5,
      dateLabel: 'Hari 5',
      title: 'Hari 5: Belanja Rempah Khas & Pelepasan Perjalanan',
      weather: { temp: '21°C – 24°C', status: 'Sejuk Kaldera', humidity: '75%', wind: '10 km/jam', outfit: 'Pakaian kasual & tas belanja lipat' },
      budgetEst: { makan: 100000, tiket: 10000, transport: 50000, olehOleh: 200000 },
      items: [
        {
          id: 'b-5-1',
          time: '08:30 – 11:00 WIB',
          title: 'Pasar Tradisional Onan Balige (Arsitektur Gorga)',
          category: 'Pasar Rakyat & Rempah',
          location: 'Pusat Kota Balige',
          latitude: 2.3345,
          longitude: 99.0630,
          temp: '22°C',
          note: 'Membeli rempah andaliman segar, bawang Batak (lokio), asam cikala, dan kopi bubuk Lintong.',
          cost: 'Belanja Bebas'
        },
        {
          id: 'b-5-2',
          time: '11:30 – 13:00 WIB',
          title: 'Santap Siang Pamungkas di Warung Kopi Legendaris Balige',
          category: 'Kuliner Penutup',
          location: 'Pusat Kota Balige',
          latitude: 2.3335,
          longitude: 99.0615,
          temp: '24°C',
          note: 'Menyeruput seduhan kopi robusta/arabika Toba sembari mempersiapkan perjalanan pulang.',
          cost: 'Rp 35.000 / orang'
        }
      ]
    }
  ],

  Samosir: [
    {
      dayNumber: 1,
      dateLabel: 'Hari 1',
      title: 'Hari 1: Pusaka Megalitik Tomok & Resor Tepi Danau Tuk Tuk',
      weather: { temp: '22°C – 26°C', status: 'Cerah Berangin', humidity: '70%', wind: '12 km/jam', outfit: 'Pakaian santai katun & kacamata hitam' },
      budgetEst: { makan: 130000, tiket: 25000, transport: 70000, olehOleh: 150000 },
      items: [
        {
          id: 's-1-1',
          time: '09:00 – 11:30 WIB',
          title: 'Desa Wisata Tomok & Makam Kuno Raja Sidabutar',
          category: 'Cagar Budaya Megalitik',
          location: 'Desa Tomok, Simanindo',
          latitude: 2.6500,
          longitude: 98.8600,
          temp: '24°C',
          note: 'Makam batu utuh tanpa semen berusia ratusan tahun dan boneka legendaris Sigale-gale.',
          cost: 'Rp 10.000 (Retribusi)'
        },
        {
          id: 's-1-2',
          time: '12:00 – 14:00 WIB',
          title: 'Makan Siang Ikan Mas Naniarsik di Tuk Tuk Siadong',
          category: 'Kuliner Autentik',
          location: 'Tuk Tuk Siadong, Simanindo',
          latitude: 2.6720,
          longitude: 98.8550,
          temp: '25°C',
          note: 'Menikmati sajian ikan bumbu kuning rempah andaliman di semenanjung eksotis Tuk Tuk.',
          cost: 'Rp 50.000 / orang'
        },
        {
          id: 's-1-3',
          time: '14:30 – 17:00 WIB',
          title: 'Batu Kursi Persidangan Huta Siallagan',
          category: 'Situs Sejarah Hukum Adat',
          location: 'Desa Siallagan, Simanindo',
          latitude: 2.6780,
          longitude: 98.8450,
          temp: '24°C',
          note: 'Pusat pengadilan adat Batak kuno yang dikelilingi pohon Hariara rindang dan benteng batu.',
          cost: 'Rp 10.000 (Tiket Masuk)'
        }
      ]
    },
    {
      dayNumber: 2,
      dateLabel: 'Hari 2',
      title: 'Hari 2: Sentra Ulos Huta Raja, Air Panas & Jembatan Tano Ponggol',
      weather: { temp: '21°C – 25°C', status: 'Cerah Berawan', humidity: '74%', wind: '10 km/jam', outfit: 'Pakaian santai & baju ganti renang' },
      budgetEst: { makan: 125000, tiket: 30000, transport: 65000, olehOleh: 200000 },
      items: [
        {
          id: 's-2-1',
          time: '09:00 – 11:30 WIB',
          title: 'Kampung Tenun Ulos Huta Raja',
          category: 'Sentra Warisan Budaya',
          location: 'Lumban Suhi-suhi, Pangururan',
          latitude: 2.6280,
          longitude: 98.7180,
          temp: '23°C',
          note: 'Deretan Rumah Bolon yang asri di mana para perempuan perajin menenun kain Ulos di teras rumah.',
          cost: 'Bebas Masuk'
        },
        {
          id: 's-2-2',
          time: '12:00 – 13:30 WIB',
          title: 'Makan Siang Mie Gomak Goreng & Kopi Samosir',
          category: 'Kuliner Lokal',
          location: 'Pangururan, Samosir',
          latitude: 2.6100,
          longitude: 98.7050,
          temp: '25°C',
          note: 'Cita rasa rempah pedas getir yang disajikan hangat di tepi perairan Samosir.',
          cost: 'Rp 30.000 / orang'
        },
        {
          id: 's-2-3',
          time: '14:00 – 16:30 WIB',
          title: 'Pemandian Air Panas Alami Aek Rangat',
          category: 'Relaksasi Panas Bumi',
          location: 'Kaki Gunung Pusuk Buhit',
          latitude: 2.6250,
          longitude: 98.6880,
          temp: '26°C',
          note: 'Air belerang alami dari aktivitas vulkanik kaldera yang menyehatkan kulit dan meredakan letih.',
          cost: 'Rp 15.000 / orang'
        },
        {
          id: 's-2-4',
          time: '17:00 – 18:30 WIB',
          title: 'Jembatan Ikonik Tano Ponggol & Terusan Samosir',
          category: 'Infrastruktur & Sunset Spot',
          location: 'Kanal Tano Ponggol, Pangururan',
          latitude: 2.6070,
          longitude: 98.6980,
          temp: '22°C',
          note: 'Spot terbaik menikmati matahari terbenam yang memisahkan Pulau Sumatera dan Pulau Samosir.',
          cost: 'Gratis'
        }
      ]
    },
    {
      dayNumber: 3,
      dateLabel: 'Hari 3',
      title: 'Hari 3: Sabana Megah Bukit Holbung & Air Terjun Efrata',
      weather: { temp: '20°C – 23°C', status: 'Sejuk Berangin', humidity: '76%', wind: '16 km/jam', outfit: 'Jaket tahan angin & sepatu trekking' },
      budgetEst: { makan: 120000, tiket: 30000, transport: 80000, olehOleh: 100000 },
      items: [
        {
          id: 's-3-1',
          time: '08:00 – 11:30 WIB',
          title: 'Bukit Holbung Samosir (Bukit Teletubbies)',
          category: 'Bentang Alam Savana',
          location: 'Desa Janji Martahan, Harian',
          latitude: 2.5830,
          longitude: 98.6330,
          temp: '21°C',
          note: 'Bukit berumput hijau membentang luas menghadap perairan biru Danau Toba yang mempesona.',
          cost: 'Rp 10.000 / orang'
        },
        {
          id: 's-3-2',
          time: '12:00 – 14:00 WIB',
          title: 'Air Terjun Efrata Harian Boho',
          category: 'Air Terjun Sejuk Alami',
          location: 'Kecamatan Harian, Samosir',
          latitude: 2.5930,
          longitude: 98.6180,
          temp: '22°C',
          note: 'Aliran air terjun deras berhiaskan tebing bebatuan alami di tengah hamparan persawahan.',
          cost: 'Rp 10.000 / orang'
        },
        {
          id: 's-3-3',
          time: '14:30 – 16:30 WIB',
          title: 'Menara Pandang Tele & Kopi Kaldera',
          category: 'Panorama 360 Derajat',
          location: 'Jalan Lintas Tele - Pangururan',
          latitude: 2.5510,
          longitude: 98.6360,
          temp: '20°C',
          note: 'Satu-satunya menara pandang yang memperlihatkan keseluruhan lanskap kaldera dan pulau Samosir.',
          cost: 'Rp 10.000 / orang'
        }
      ]
    },
    {
      dayNumber: 4,
      dateLabel: 'Hari 4',
      title: 'Hari 4: Fenomena Unik "Danau di Atas Danau" Sidihoni',
      weather: { temp: '19°C – 22°C', status: 'Sejuk Berkabut', humidity: '82%', wind: '12 km/jam', outfit: 'Pakaian hangat berlayer' },
      budgetEst: { makan: 110000, tiket: 20000, transport: 70000, olehOleh: 100000 },
      items: [
        {
          id: 's-4-1',
          time: '09:00 – 12:00 WIB',
          title: 'Danau Sidihoni (Danau di Atas Danau)',
          category: 'Fenomena Geologi Langka',
          location: 'Kecamatan Ronggur Nihuta',
          latitude: 2.5530,
          longitude: 98.7180,
          temp: '20°C',
          note: 'Danau air tawar alami yang berada di dataran tinggi pegunungan tengah Pulau Samosir.',
          cost: 'Rp 5.000 / orang'
        },
        {
          id: 's-4-2',
          time: '13:00 – 15:30 WIB',
          title: 'Danau Aek Natonang & Hutan Pinus',
          category: 'Konservasi & Relaksasi',
          location: 'Kecamatan Simanindo',
          latitude: 2.6450,
          longitude: 98.7980,
          temp: '21°C',
          note: 'Kawasan danau kedua di atas Samosir dengan udara sejuk dan ketenangan hutan pinus.',
          cost: 'Rp 10.000 / orang'
        }
      ]
    },
    {
      dayNumber: 5,
      dateLabel: 'Hari 5',
      title: 'Hari 5: Lembah Sakral Sianjur Mulamula & Pusuk Buhit',
      weather: { temp: '20°C – 24°C', status: 'Cerah Berawan', humidity: '72%', wind: '11 km/jam', outfit: 'Sepatu hiking & pakaian sopan' },
      budgetEst: { makan: 120000, tiket: 25000, transport: 80000, olehOleh: 150000 },
      items: [
        {
          id: 's-5-1',
          time: '08:30 – 12:00 WIB',
          title: 'Lembah Sianjur Mulamula & Aek Sipitudai',
          category: 'Asal-Usul Suku Batak',
          location: 'Kecamatan Sianjur Mulamula',
          latitude: 2.6120,
          longitude: 98.6250,
          temp: '22°C',
          note: 'Mata air sakral tujuh rasa dan lembah perkampungan pertama leluhur Si Raja Batak.',
          cost: 'Rp 10.000 / orang'
        },
        {
          id: 's-5-2',
          time: '13:00 – 15:00 WIB',
          title: 'Makan Siang & Belanja Souvenir Ukiran Samosir',
          category: 'Kuliner & Kerajinan',
          location: 'Pangururan / Tomok',
          latitude: 2.6150,
          longitude: 98.7000,
          temp: '24°C',
          note: 'Membeli miniatur Rumah Bolon, patung kayu gorga, dan bubuk kopi khas Samosir.',
          cost: 'Rp 40.000 / orang'
        }
      ]
    }
  ]
};

// ====================================================================================================
// PERSONA WISATA FILTER OPTIONS
// ====================================================================================================
const TRAVEL_STYLES = [
  { id: 'all', label: 'Rute Seimbang (AI)', desc: 'Kombinasi harmonis geosite, kuliner, dan budaya.' },
  { id: 'nature', label: '🏔️ Geosite & Alam', desc: 'Fokus pada bukit panorama, air terjun, dan kaldera.' },
  { id: 'culture', label: '🧵 Budaya & Ulos', desc: 'Fokus pada kampung tenun, museum, dan situs adat.' },
  { id: 'culinary', label: '🍲 Gastronomi Batak', desc: 'Fokus pada santap kuliner andaliman dan kopi lokal.' },
  { id: 'family', label: '👨‍👩‍👧 Santai Keluarga', desc: 'Akses mudah, ramah anak, dan santai di tepi danau.' }
];

const ItineraryPlanner = () => {
  const navigate = useNavigate();
  const [selectedDuration, setSelectedDuration] = useState(3);
  const [activeDayIndex, setActiveDayIndex] = useState(0);
  const [selectedStyle, setSelectedStyle] = useState('all');
  const [loading, setLoading] = useState(false);
  const [kecamatan, setKecamatan] = useState('Balige');
  const [aiNarration, setAiNarration] = useState('');
  
  // Default inisialisasi dari preset Balige agar tidak pernah kosong (Zero-Blank State)
  const [itineraryDays, setItineraryDays] = useState(
    CURATED_REGION_ITINERARIES.Balige.slice(0, 3)
  );

  
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

  // Efek ketika durasi atau kecamatan berubah
  useEffect(() => {
    generateCustomItinerary(selectedDuration, kecamatan, selectedStyle);
  }, [selectedDuration, kecamatan, selectedStyle]);

  const generateCustomItinerary = async (daysCount, targetKec, styleId = 'all') => {
    setLoading(true);

    // 1. Ambil baseline preset regional terlebih dahulu (0 ms latency)
    const baseRegionDays = CURATED_REGION_ITINERARIES[targetKec] || CURATED_REGION_ITINERARIES.Balige;
    const initialDays = [];

    for (let i = 0; i < daysCount; i++) {
      if (baseRegionDays[i]) {
        // Clone mendalam agar mutasi pergeseran/penghapusan aman
        initialDays.push(JSON.parse(JSON.stringify(baseRegionDays[i])));
      } else {
        // Fallback jika durasi melebihi preset yang ada
        const template = JSON.parse(JSON.stringify(baseRegionDays[i % baseRegionDays.length]));
        template.dayNumber = i + 1;
        template.dateLabel = `Hari ${i + 1}`;
        template.title = `Hari ${i + 1}: Eksplorasi Lanjutan ${targetKec}`;
        initialDays.push(template);
      }
    }

    // Tampilkan preset instan agar pengguna tidak melihat halaman kosong
    setItineraryDays(initialDays);

    // 2. Hubungi Backend RAG API untuk menyuntikkan narasi AI Gemini dan tempat terbaru
    try {
      let queryPrompt = `Rencana perjalanan ${daysCount} hari di kawasan ${targetKec} Danau Toba.`;
      if (styleId === 'nature') queryPrompt += ' Prioritaskan geosite alam pemandangan bukit dan danau.';
      else if (styleId === 'culture') queryPrompt += ' Prioritaskan sentra tenun ulos adat sejarah Batak.';
      else if (styleId === 'culinary') queryPrompt += ' Prioritaskan kuliner autentik andaliman naniura kopi.';
      else if (styleId === 'family') queryPrompt += ' Prioritaskan pantai pasir putih dan penginapan keluarga.';

      const data = await getFairRecommendation(queryPrompt, targetKec, 0);
      
      if (data?.ai_response) {
        setAiNarration(data.ai_response);
      }

      const destUtama = data?.destinasi_utama || [];
      const umkmList = data?.rekomendasi_umkm_sekitar || [];

      // Jika backend berhasil mengembalikan destinasi dari database, perbarui data slot dinamis
      if (destUtama.length > 0) {
        const enriched = initialDays.map((day, dIdx) => {
          const mainPoi = destUtama[dIdx % destUtama.length];
          const umkmPoi = umkmList[dIdx % (umkmList.length || 1)];
          
          const updatedItems = [...day.items];
          if (mainPoi && updatedItems[1]) {
            updatedItems[1] = {
              ...updatedItems[1],
              title: mainPoi.nama,
              location: mainPoi.nama_jalan || mainPoi.kecamatan,
              latitude: mainPoi.latitude,
              longitude: mainPoi.longitude,
              note: mainPoi.deskripsi_singkat || updatedItems[1].note
            };
          }
          if (umkmPoi && updatedItems[2]) {
            updatedItems[2] = {
              ...updatedItems[2],
              title: umkmPoi.nama,
              location: umkmPoi.nama_jalan || umkmPoi.kecamatan,
              latitude: umkmPoi.latitude,
              longitude: umkmPoi.longitude,
              note: umkmPoi.deskripsi_singkat || updatedItems[2].note
            };
          }

          return { ...day, items: updatedItems };
        });

        setItineraryDays(enriched);
      }
    } catch (e) {
      console.warn("Menggunakan kurasi itinerary regional lokal (Server offline/slow):", e);
      setAiNarration(`**Horas!** Jadwal perjalanan **${daysCount} Hari di ${targetKec}** telah disusun berdasarkan data kurasi resmi TobaRoute AI. Nikmati perpaduan geosite alam kaldera, kuliner andaliman, dan sentra tenun Ulos.`);
    } finally {
      setLoading(false);
    }
  };

  // Navigasi ke Peta GIS untuk satu spot aktivitas spesifik
  const handleNavigateSlotToGIS = (slot) => {
    const target = {
      id: slot.id,
      nama: slot.title,
      kategori: slot.category,
      kecamatan: kecamatan,
      nama_jalan: slot.location,
      latitude: slot.latitude || 2.3387,
      longitude: slot.longitude || 99.0625,
      deskripsi_singkat: slot.note
    };

    // 1. Dispatch custom event jika /explore sudah terbuka di tab lain atau background
    try {
      window.dispatchEvent(new CustomEvent('tobaroute:focus_poi', { detail: target }));
    } catch (e) {}

    // 2. Arahkan router ke halaman Jelajah GIS
    navigate(`/explore?search=${encodeURIComponent(slot.title)}`, {
      state: { targetLocation: target }
    });
  };

  // Navigasi ke Peta GIS untuk rute hari yang sedang aktif
  const handleNavigateDayRouteToGIS = (day) => {
    if (!day || !day.items || day.items.length === 0) return;
    const primaryItem = day.items.find(it => it.latitude && it.longitude) || day.items[0];
    handleNavigateSlotToGIS(primaryItem);
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
    <div className="planner-page-container fade-in" style={{ padding: '2.5rem 0 5rem 0' }}>
      <div className="container">
        
        {/* Header Studio Planner */}
        <div style={{ textAlign: 'center', maxWidth: '780px', margin: '0 auto 2.5rem auto' }}>
          <span className="section-pill-tag green" style={{ marginBottom: '0.75rem', display: 'inline-flex', alignItems: 'center', gap: '0.4rem' }}>
            <Sparkles size={13} /> Studio Perencana AI Kaldera Danau Toba
          </span>
          <h1 style={{ fontSize: '2.35rem', fontWeight: 800, color: '#0f172a', letterSpacing: '-0.025em', margin: '0 0 0.75rem 0' }}>
            Rancang Itinerary Sempurna Danau Toba
          </h1>
          <p style={{ fontSize: '1rem', color: '#64748b', lineHeight: 1.65, margin: 0 }}>
            Kustomisasi jadwal jam-ke-jam, sesuaikan perkiraan cuaca mikro, hitung estimasi anggaran, dan siapkan navigasi rute GIS dalam satu studio cerdas terpadu.
          </p>
        </div>

        {/* Studio Control Toolbar */}
        <div className="card" style={{ padding: '1.5rem', marginBottom: '2rem', background: '#ffffff', borderRadius: '16px', border: '1px solid #e2e8f0', boxShadow: '0 4px 20px rgba(0,0,0,0.04)' }}>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1.25rem', alignItems: 'flex-end' }}>
            
            {/* 1. Durasi Hari */}
            <div>
              <label style={{ display: 'flex', alignItems: 'center', gap: '0.35rem', fontSize: '0.75rem', fontWeight: 700, color: '#475569', textTransform: 'uppercase', marginBottom: '0.45rem', letterSpacing: '0.03em' }}>
                <Calendar size={13} color="#0284c7" /> Durasi Hari:
              </label>
              <div style={{ display: 'flex', gap: '0.35rem' }}>
                {[1, 2, 3, 4, 5, 7].map((num) => (
                  <button
                    key={num}
                    className={`btn-secondary${selectedDuration === num ? ' active' : ''}`}
                    onClick={() => { setSelectedDuration(num); setActiveDayIndex(0); }}
                    style={{
                      flex: 1,
                      padding: '0.5rem 0',
                      borderRadius: '8px',
                      fontWeight: 700,
                      fontSize: '0.85rem',
                      background: selectedDuration === num ? '#0284c7' : '#f8fafc',
                      color: selectedDuration === num ? '#ffffff' : '#475569',
                      borderColor: selectedDuration === num ? '#0284c7' : '#cbd5e1'
                    }}
                  >
                    {num}H
                  </button>
                ))}
              </div>
            </div>

            {/* 2. Target Wilayah */}
            <div>
              <label style={{ display: 'flex', alignItems: 'center', gap: '0.35rem', fontSize: '0.75rem', fontWeight: 700, color: '#475569', textTransform: 'uppercase', marginBottom: '0.45rem', letterSpacing: '0.03em' }}>
                <MapPin size={13} color="#0284c7" /> Fokus Wilayah:
              </label>
              <select
                value={kecamatan}
                onChange={(e) => { 
                  setKecamatan(e.target.value); 
                  setActiveDayIndex(0);
                }}
                style={{ height: '42px', fontWeight: 600, width: '100%', borderRadius: '8px', border: '1px solid #cbd5e1', padding: '0 0.75rem' }}
              >
                <option value="Balige">Balige & Kawasan Toba</option>
                <option value="Samosir">Pulau Samosir (Pangururan & Tomok)</option>
              </select>
            </div>

            {/* 3. Gaya Perjalanan (Persona) */}
            <div>
              <label style={{ display: 'flex', alignItems: 'center', gap: '0.35rem', fontSize: '0.75rem', fontWeight: 700, color: '#475569', textTransform: 'uppercase', marginBottom: '0.45rem', letterSpacing: '0.03em' }}>
                <Heart size={13} color="#0284c7" /> Gaya Perjalanan:
              </label>
              <select
                value={selectedStyle}
                onChange={(e) => setSelectedStyle(e.target.value)}
                style={{ height: '42px', fontWeight: 600, width: '100%', borderRadius: '8px', border: '1px solid #cbd5e1', padding: '0 0.75rem' }}
              >
                {TRAVEL_STYLES.map(st => (
                  <option key={st.id} value={st.id}>{st.label}</option>
                ))}
              </select>
            </div>

            {/* 4. Tombol Regenerate & Cetak */}
            <div style={{ display: 'flex', gap: '0.5rem' }}>
              <button
                className="btn-primary"
                onClick={() => generateCustomItinerary(selectedDuration, kecamatan, selectedStyle)}
                disabled={loading}
                style={{ flex: 1, height: '42px', display: 'inline-flex', alignItems: 'center', justifyContent: 'center', gap: '0.45rem' }}
              >
                <RotateCw size={14} className={loading ? 'spinner' : ''} />
                <span>{loading ? 'Menyusun...' : 'Buat Ulang Rute'}</span>
              </button>

              <button
                className="btn-secondary"
                onClick={() => window.print()}
                style={{ height: '42px', padding: '0 0.9rem', borderRadius: '8px' }}
                title="Cetak Rencana Perjalanan"
              >
                <Printer size={16} />
              </button>
            </div>

          </div>

        {/* Main Grid Studio */}
        <div style={{ display: 'grid', gridTemplateColumns: '1.6fr 0.9fr', gap: '2rem' }}>
          
          {/* Kolom Kiri: Day Tabs, Weather Card, & Timeline Items */}
          <div>
            
            {/* Day Selector Tabs & Tombol Rute GIS */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '0.75rem', marginBottom: '1.25rem' }}>
              <div style={{ display: 'flex', gap: '0.4rem', overflowX: 'auto', paddingBottom: '0.2rem' }}>
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

              {/* Tombol Aksi Langsung ke Peta GIS */}
              {currentDay && (
                <button
                  type="button"
                  className="btn-primary"
                  onClick={() => handleNavigateDayRouteToGIS(currentDay)}
                  style={{
                    height: '36px',
                    padding: '0 0.85rem',
                    fontSize: '0.8rem',
                    background: '#0284c7',
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '0.45rem',
                    borderRadius: '8px'
                  }}
                  title="Tampilkan destinasi hari ini di peta navigasi Jelajah GIS"
                >
                  <RouteIcon size={14} />
                  <span>Navigasi Hari Ini di GIS</span>
                  <ArrowRight size={12} />
                </button>
              )}
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
              <div className="daily-weather-bar" style={{ marginBottom: '1.5rem' }}>
                <div className="weather-forecast-badge">
                  <div className="weather-icon-dot"><Sun size={20} /></div>
                  <span className="weather-temp-num">{currentDay.weather?.temp}</span>
                  <div className="weather-detail-col">
                    <span className="weather-status-text">{currentDay.weather?.status}</span>
                    <span className="weather-sub-text">Kelembapan {currentDay.weather?.humidity} · Angin {currentDay.weather?.wind}</span>
                  </div>
                </div>

                <div className="weather-outfit-tip">
                  <CheckCircle size={14} color="#16a34a" />
                  <span>{currentDay.weather?.outfit}</span>
                </div>
              </div>
            )}

            {/* Timeline Items */}
            {currentDay && currentDay.items && (
              <div className="timeline-schedule-list" style={{ borderLeftColor: '#e2e8f0' }}>
                {currentDay.items.map((slot, sIdx) => (
                  <div key={slot.id || sIdx} className="timeline-slot-item">
                    <div className="timeline-bullet" />
                    <div className="timeline-slot-card" style={{ marginBottom: '0.75rem', background: '#ffffff', border: '1px solid #e2e8f0', borderRadius: '12px' }}>
                      
                      {/* Waktu & Cuaca */}
                      <div className="slot-time-col">
                        <span className="slot-time-pill">
                          <Clock size={11} /> {slot.time}
                        </span>
                        <span className="slot-weather-chip">
                          <Thermometer size={11} /> {slot.temp || '23°C'}
                        </span>
                      </div>

                      {/* Konten Aktivitas */}
                      <div className="slot-content-col">
                        <span className="slot-category-tag">{slot.category}</span>
                        <h4>{slot.title}</h4>
                        <div style={{ fontSize: '0.78rem', color: '#64748b', marginBottom: '0.35rem' }}>
                          {slot.location} · <strong style={{ color: '#16a34a' }}>{slot.cost}</strong>
                        </div>
                        <div className="slot-ai-reason">{slot.note}</div>
                      </div>

                      {/* Controls Move, GIS Navigation & Delete */}
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem', alignItems: 'flex-end', flexShrink: 0 }}>
                        
                        {/* Tombol Buka di GIS */}
                        <button
                          type="button"
                          onClick={() => handleNavigateSlotToGIS(slot)}
                          style={{
                            display: 'inline-flex',
                            alignItems: 'center',
                            gap: '0.35rem',
                            padding: '0.35rem 0.65rem',
                            background: '#f0f9ff',
                            border: '1px solid #bae6fd',
                            borderRadius: '6px',
                            color: '#0284c7',
                            fontSize: '0.75rem',
                            fontWeight: 700,
                            cursor: 'pointer',
                            transition: 'all 0.2s ease'
                          }}
                          title="Fokuskan spot ini di Peta Jelajah GIS"
                        >
                          <Compass size={12} /> Buka di GIS
                        </button>

                        {/* Kontrol Posisi Item */}
                        <div style={{ display: 'flex', gap: '0.25rem' }}>
                          <button 
                            onClick={() => moveItem(activeDayIndex, sIdx, -1)} 
                            disabled={sIdx === 0} 
                            style={{ padding: '4px 6px', background: '#f1f5f9', borderRadius: '6px', border: 'none', cursor: sIdx === 0 ? 'default' : 'pointer', opacity: sIdx === 0 ? 0.35 : 1 }} 
                            title="Geser ke Atas"
                          >
                            <ArrowUp size={13} color="#475569" />
                          </button>
                          <button 
                            onClick={() => moveItem(activeDayIndex, sIdx, 1)} 
                            disabled={sIdx === currentDay.items.length - 1} 
                            style={{ padding: '4px 6px', background: '#f1f5f9', borderRadius: '6px', border: 'none', cursor: sIdx === currentDay.items.length - 1 ? 'default' : 'pointer', opacity: sIdx === currentDay.items.length - 1 ? 0.35 : 1 }} 
                            title="Geser ke Bawah"
                          >
                            <ArrowDown size={13} color="#475569" />
                          </button>
                          <button 
                            onClick={() => deleteItem(activeDayIndex, sIdx)} 
                            style={{ padding: '4px 6px', background: '#fef2f2', borderRadius: '6px', border: 'none', cursor: 'pointer' }} 
                            title="Hapus Spot"
                          >
                            <Trash2 size={13} color="#dc2626" />
                          </button>
                        </div>

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
            
            {/* Widget Estimasi Biaya */}
            <div className="card" style={{ padding: '1.5rem', background: '#ffffff', borderRadius: '16px', border: '1px solid #e2e8f0' }}>
              <h3 style={{ fontSize: '1.05rem', fontWeight: 800, color: '#0f172a', marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                <DollarSign size={16} color="#16a34a" /> Estimasi Anggaran Wisata
              </h3>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.65rem', fontSize: '0.85rem' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', paddingBottom: '0.4rem', borderBottom: '1px dashed #e2e8f0' }}>
                  <span style={{ color: '#64748b' }}>Kuliner & Santap:</span>
                  <span style={{ fontWeight: 700, color: '#0f172a' }}>Rp {((currentDay?.budgetEst?.makan || 120000) * selectedDuration).toLocaleString('id-ID')}</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', paddingBottom: '0.4rem', borderBottom: '1px dashed #e2e8f0' }}>
                  <span style={{ color: '#64748b' }}>Tiket & Retribusi:</span>
                  <span style={{ fontWeight: 700, color: '#0f172a' }}>Rp {((currentDay?.budgetEst?.tiket || 25000) * selectedDuration).toLocaleString('id-ID')}</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', paddingBottom: '0.4rem', borderBottom: '1px dashed #e2e8f0' }}>
                  <span style={{ color: '#64748b' }}>Bahan Bakar & Transport:</span>
                  <span style={{ fontWeight: 700, color: '#0f172a' }}>Rp {((currentDay?.budgetEst?.transport || 55000) * selectedDuration).toLocaleString('id-ID')}</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', paddingBottom: '0.4rem', borderBottom: '1px dashed #e2e8f0' }}>
                  <span style={{ color: '#64748b' }}>Belanja Tenun & Oleh-Oleh:</span>
                  <span style={{ fontWeight: 700, color: '#0f172a' }}>Rp {(currentDay?.budgetEst?.olehOleh || 150000).toLocaleString('id-ID')}</span>
                </div>
                
                <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '0.4rem', paddingTop: '0.65rem', borderTop: '1.5px solid #0f172a', fontSize: '0.95rem', fontWeight: 800 }}>
                  <span>Total ({selectedDuration} Hari):</span>
                  <span style={{ color: '#0284c7' }}>
                    Rp {(
                      ((currentDay?.budgetEst?.makan || 120000) + (currentDay?.budgetEst?.tiket || 25000) + (currentDay?.budgetEst?.transport || 55000)) * selectedDuration + (currentDay?.budgetEst?.olehOleh || 150000)
                    ).toLocaleString('id-ID')}
                  </span>
                </div>
                <div style={{ fontSize: '0.75rem', color: '#94A3B8', textAlign: 'right' }}>
                  (~Rp {Math.round(grandTotalBudget / travelerCount).toLocaleString('id-ID')} / orang)
                </div>
              </div>
            </div>

            {/* Checklist Perlengkapan Wisata */}
            <div className="card" style={{ padding: '1.5rem', background: '#ffffff', borderRadius: '16px', border: '1px solid #e2e8f0' }}>
              <h3 style={{ fontSize: '1.05rem', fontWeight: 800, color: '#0f172a', marginBottom: '0.65rem', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                <CheckSquare size={16} color="#0284c7" /> Checklist Perlengkapan Kaldera
              </h3>
              <p style={{ fontSize: '0.78rem', color: '#64748b', margin: '0 0 0.85rem 0' }}>
                Disesuaikan otomatis dengan suhu sejuk kaldera (19-25°C) dan rute wisata danau.
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
                  <label key={item.id} style={{ display: 'flex', alignItems: 'center', gap: '0.55rem', fontSize: '0.82rem', color: item.done ? '#94a3b8' : '#334155', cursor: 'pointer', textDecoration: item.done ? 'line-through' : 'none' }}>
                    <input 
                      type="checkbox" 
                      checked={item.done} 
                      onChange={() => handleToggleCheck(item.id)}
                      style={{ width: '15px', height: '15px', accentColor: '#0284c7' }}
                    />
                    <span>{item.text}</span>
                  </label>
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
