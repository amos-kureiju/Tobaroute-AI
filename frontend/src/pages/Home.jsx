// ====================================================================================================
// FILE: frontend/src/pages/Home.jsx
// TUJUAN:
// Halaman Beranda Utama TobaRoute AI.
// Menggabungkan:
// 1. Polarsteps & SNCF-inspired Modern Hero dengan pencarian cerdas terpadu.
// 2. Travel DNA AI Persona Card interaktif (kustomisasi avatar, 4 tipe persona, dan 1-klik rute).
// 3. Rekomendasi Rute Keadilan (Fairness RAG) dengan Itinerary jam-ke-jam Multi-Hari (Hari 1, 2, 3).
// 4. Bar Cuaca Mikro Kaldera Toba & Outfit Advisor.
// 5. Analisis Kurasi Naratif dari Gemini AI & Peta Rute GIS Interaktif (RouteMap).
// 6. Grid Destinasi Utama & Rekomendasi UMKM Lokal (DestinationCard).
// 7. Integrasi Seamless ke Studio Itinerary AI (/planner) dan Peta Jelajah GIS (/explore).
// ====================================================================================================

import React, { useState, useEffect, useMemo } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import {
  Search, MapPin, Sparkles, AlertCircle, Compass, ShieldCheck,
  Route, Store, Clock, RotateCw, Car, Bike, Ship, Mountain,
  Users, Sun, Wind, CheckCircle, Navigation, Award, Calendar,
  ArrowRight, Utensils, ChevronRight, Thermometer, Star, Upload,
  X, Copy, Check, Share2, Layers, BookOpen, RefreshCw
} from 'lucide-react';
import { getFairRecommendation } from '../services/api';
import DestinationCard from '../components/DestinationCard';
import RouteMap from '../components/RouteMap';
import ReactMarkdown from 'react-markdown';

// Tag inspirasi pencarian cepat
const POPULAR_TAGS = [
  { label: 'Wisata Alam Balige', query: 'Wisata alam dan pantai pemandangan indah di Balige', kec: 'Balige' },
  { label: 'Kuliner Khas Batak', query: 'Rumah makan kuliner khas Batak naniarsik dan mie gomak', kec: 'Balige' },
  { label: 'Sentra Tenun Ulos', query: 'Tempat pembuatan dan kerajinan Tenun Ulos buatan UMKM lokal', kec: 'Balige' },
  { label: 'Geosite & Sabana Samosir', query: 'Bukit Holbung geosite batu kursi pusuk buhit samosir', kec: 'Samosir' },
  { label: 'Rute Feri Danau', query: 'Rute angkutan umum dan kapal feri penyeberangan Danau Toba', kec: 'Parapat' },
];

// Profil persona wisatawan AI
const TRAVEL_PERSONAS = [
  {
    id: 'culinary',
    title: 'The Culinary Adventurer',
    label: 'Pecinta Kuliner',
    desc: 'Mie Gomak andaliman, Dekke Naaniura segar, Ikan Mas Naniarsik, dan Kopi Arabika Lintong.',
    avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=600&q=80',
    defaultQuery: 'Wisata kuliner khas Batak autentik naniarsik naniura dan warung kopi lokal',
    defaultKec: 'Balige'
  },
  {
    id: 'heritage',
    title: 'The Cultural Seeker',
    label: 'Penjelajah Budaya',
    desc: 'Kampung Ulos Huta Raja, Batu Kursi Siallagan, Desa Meat, dan sejarah Sisingamangaraja XII.',
    avatar: '/sangathebat.jpg',
    defaultQuery: 'Wisata budaya sejarah Batak museum kampung ulos dan makam raja',

    defaultKec: 'Balige'
  },
  {
    id: 'nature',
    title: 'The Scenic Explorer',
    label: 'Pencinta Panorama',
    desc: 'Bukit Holbung, Geosite Sipinsur, Air Terjun Situmurun, dan Danau Sidihoni.',
    avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=600&q=80',
    defaultQuery: 'Wisata alam panorama bukit air terjun dan spot pemandangan kaldera Danau Toba',
    defaultKec: 'Samosir'
  },
  {
    id: 'family',
    title: 'The Family & Staycationer',
    label: 'Hotel & Staycation Nyaman',
    desc: 'Resort tepi danau, hotel view kaldera, pantai pasir putih, dan penginapan ramah keluarga.',
    avatar: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&w=600&q=80',
    defaultQuery: 'Rekomendasi hotel penginapan resort nyaman tepi danau dan wisata santai',
    defaultKec: 'Parapat'
  }
];

const getAvatarSrc = (avatar) => {
  if (!avatar) return 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=400&q=80';
  if (avatar.startsWith('http://') || avatar.startsWith('https://') || avatar.startsWith('data:') || avatar.startsWith('blob:')) {
    return avatar;
  }
  if (avatar.includes('sangathebat') || avatar.includes('hebat')) return '/sangathebat.jpg';
  return avatar.startsWith('/') ? avatar : `/${avatar}`;
};


const WEATHER_PRESETS = [
  { temp: '22 – 26°C', status: 'Cerah Berawan', humidity: '72%', wind: '12 km/jam', outfit: 'Pakaian santai katun, kacamata hitam, dan jaket tipis untuk pagi/sore hari' },
  { temp: '21 – 24°C', status: 'Semilir Angin Kaldera', humidity: '78%', wind: '15 km/jam', outfit: 'Jaket ringan tahan angin dan alas kaki nyaman untuk area danau & perbukitan' },
  { temp: '20 – 23°C', status: 'Sejuk Menyegarkan', humidity: '82%', wind: '10 km/jam', outfit: 'Sweater hangat, sepatu antiselip, dan kamera untuk berburu lanskap kaldera' }
];

const Home = () => {
  const navigate = useNavigate();
  const [query, setQuery] = useState('');
  const [kecamatan, setKecamatan] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [results, setResults] = useState(null);
  const [searchOffset, setSearchOffset] = useState(0);
  const [userCoords, setUserCoords] = useState(null);
  const [activeCategoryTab, setActiveCategoryTab] = useState('all');
  const [selectedPersona, setSelectedPersona] = useState(TRAVEL_PERSONAS[0]);
  const [activeDayTab, setActiveDayTab] = useState(0);
  const [copiedSchedule, setCopiedSchedule] = useState(false);

  useEffect(() => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (pos) => setUserCoords({ lat: pos.coords.latitude, lon: pos.coords.longitude }),
        () => console.warn("Akses GPS belum diaktifkan oleh browser")
      );
    }
    try {
      const savedResults = sessionStorage.getItem('tobaroute_last_results');
      if (savedResults) setResults(JSON.parse(savedResults));
      const savedQuery = sessionStorage.getItem('tobaroute_last_query');
      if (savedQuery) setQuery(savedQuery);
      const savedKec = sessionStorage.getItem('tobaroute_last_kec');
      if (savedKec) setKecamatan(savedKec);
    } catch {}
  }, []);

  const handleAvatarUpload = (e) => {
    const file = e.target.files?.[0];
    if (file) {
      const imageUrl = URL.createObjectURL(file);
      setSelectedPersona((prev) => ({
        ...prev,
        avatar: imageUrl,
        customAvatar: true
      }));
    }
  };

  const handleResetAvatar = () => {
    const defaultPersona = TRAVEL_PERSONAS.find(p => p.id === selectedPersona.id) || TRAVEL_PERSONAS[0];
    setSelectedPersona((prev) => ({
      ...prev,
      avatar: defaultPersona.avatar,
      customAvatar: false
    }));
  };

  const handleTabSelect = (tabKey, presetQuery, targetKec = '') => {
    setActiveCategoryTab(tabKey);
    if (presetQuery) {
      setQuery(presetQuery);
      if (targetKec) setKecamatan(targetKec);
      handleSearch(null, presetQuery, false, 0, targetKec);
    }
  };

  const handleSearch = async (e, customQuery = null, forceNext = false, forceOffset = null, customKec = null) => {
    if (e) e.preventDefault();
    const searchQuery = customQuery !== null ? customQuery : (query || selectedPersona.defaultQuery);
    const targetKec = customKec !== null ? customKec : (kecamatan || (selectedPersona.id === 'heritage' ? 'Balige' : ''));
    
    if (!searchQuery.trim()) {
      setError('Masukkan kata kunci wisata (contoh: "Wisata alam sejuk dan makan naniarsik")');
      return;
    }
    const newOffset = forceOffset !== null ? forceOffset : (forceNext ? searchOffset + 1 : 0);
    setSearchOffset(newOffset);
    setQuery(searchQuery);
    setLoading(true);
    setError('');
    
    try {
      const data = await getFairRecommendation(searchQuery, targetKec, newOffset, userCoords?.lat, userCoords?.lon);
      setResults(data);
      sessionStorage.setItem('tobaroute_last_results', JSON.stringify(data));
      sessionStorage.setItem('tobaroute_last_query', searchQuery);
      sessionStorage.setItem('tobaroute_last_kec', targetKec);
      setTimeout(() => {
        document.getElementById('results-section')?.scrollIntoView({ behavior: 'smooth' });
      }, 150);
    } catch (err) {
      setError('Koneksi ke server backend terganggu. Periksa jaringan Anda dan coba lagi.');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleResetSearch = () => {
    setResults(null);
    setQuery('');
    setKecamatan('');
    sessionStorage.removeItem('tobaroute_last_results');
    sessionStorage.removeItem('tobaroute_last_query');
    sessionStorage.removeItem('tobaroute_last_kec');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleForwardToPlanner = () => {
    navigate('/planner', {
      state: {
        query: query || selectedPersona.defaultQuery,
        kecamatan: kecamatan || 'Balige',
        initialResults: results,
        duration: 3
      }
    });
  };

  // Membangun rencana itinerary multi-hari dengan destinasi berbeda dan terklaster per hari
  const dayPlans = useMemo(() => {
    const destList = results?.destinasi_utama || [];
    const umkmList = results?.rekomendasi_umkm_sekitar || [];
    const lowerQ = (query || '').toLowerCase();
    const isHotelQuery = lowerQ.includes('hotel') || lowerQ.includes('penginapan') || lowerQ.includes('homestay') || lowerQ.includes('resort');

    // Bagi destinasi ke dalam kelompok berbeda per hari agar tidak ada duplikasi lokasi
    return [0, 1, 2].map((dayIdx) => {
      const weather = WEATHER_PRESETS[dayIdx % WEATHER_PRESETS.length];
      
      // Pilih slice destinasi berbeda untuk masing-masing hari
      const d1 = destList[(dayIdx * 2) % Math.max(destList.length, 1)] || destList[0] || { 
        nama: dayIdx === 0 ? 'Pantai Pasir Putih Lumban Bulbul' : dayIdx === 1 ? 'Bukit Holbung Sabana Samosir' : 'Geosite Sipinsur Humbahas', 
        kecamatan: dayIdx === 0 ? (kecamatan || 'Balige') : dayIdx === 1 ? 'Simanindo' : 'Doloksanggul', 
        kategori: 'wisata',
        latitude: dayIdx === 0 ? 2.3485 : dayIdx === 1 ? 2.5830 : 2.2688,
        longitude: dayIdx === 0 ? 99.0712 : dayIdx === 1 ? 98.7210 : 98.7495
      };

      const u1 = umkmList[(dayIdx * 2) % Math.max(umkmList.length, 1)] || umkmList[0] || { 
        nama: dayIdx === 0 ? 'RM Nauli Balige (Dekke Naaniura & Arsik)' : dayIdx === 1 ? 'Sentra Tenun Ulos Tradisional Tomok' : 'Kedai Kopi Arabika Lintong', 
        kecamatan: dayIdx === 0 ? (kecamatan || 'Balige') : dayIdx === 1 ? 'Simanindo' : 'Doloksanggul', 
        kategori: 'kuliner',
        latitude: (d1.latitude || 2.3333) + 0.005,
        longitude: (d1.longitude || 99.0667) + 0.005
      };

      const d2 = destList[(dayIdx * 2 + 1) % Math.max(destList.length, 1)] || destList[1] || { 
        nama: dayIdx === 0 ? 'Museum Batak TB Silalahi Center' : dayIdx === 1 ? 'Batu Kursi Persidangan Huta Siallagan' : 'Lembah Hijau Bakkara & Air Terjun Janji', 
        kecamatan: dayIdx === 0 ? 'Balige' : dayIdx === 1 ? 'Simanindo' : 'Baktiraja', 
        kategori: 'wisata',
        latitude: (d1.latitude || 2.3333) - 0.008,
        longitude: (d1.longitude || 99.0667) - 0.006
      };

      const u2 = umkmList[(dayIdx * 2 + 1) % Math.max(umkmList.length, 1)] || umkmList[1] || { 
        nama: dayIdx === 0 ? 'Batikta Sentra Kerajinan Balige' : dayIdx === 1 ? 'Kedai Kopi & Kuliner Tepi Danau Tuk-Tuk' : 'Sentra Oleh-Oleh Ombusombus', 
        kecamatan: dayIdx === 0 ? 'Balige' : dayIdx === 1 ? 'Simanindo' : 'Siborongborong', 
        kategori: 'umkm',
        latitude: (d2.latitude || 2.3333) + 0.004,
        longitude: (d2.longitude || 99.0667) + 0.004
      };

      const dayTitle = dayIdx === 0 
        ? `Hari 1 — Pusaka Budaya & Kuliner ${d1.kecamatan || 'Balige'}` 
        : dayIdx === 1 
        ? `Hari 2 — Eksplorasi Geosite & Pulau Samosir` 
        : `Hari 3 — Panorama Kaldera, Sunset & Belanja UMKM`;

      return {
        dayNumber: dayIdx + 1,
        title: dayTitle,
        weather,
        destinasiUtama: [d1, d2],
        umkmSekitar: [u1, u2],
        slots: [
          { 
            time: '08:00 – 09:30 WIB', 
            title: `Sarapan Mie Gomak Kuah Andaliman & Kopi Lintong (${u1.kecamatan || 'Lokal'})`, 
            category: 'Kuliner Pagi', 
            location: u1.nama_jalan || `Pusat Kuliner ${u1.kecamatan || 'Lokal'}`, 
            temp: '21°C', 
            reason: 'Mengisi stamina pagi dengan kuah santan berempah andaliman yang hangat sebelum perjalanan.', 
            transit: '10 mnt berkendara (3.5 km) · Bisa menggunakan Becak Motor (Bentor) tarif ~Rp 10.000' 
          },
          { 
            time: '10:00 – 12:30 WIB', 
            title: d1.nama, 
            category: d1.kategori || 'Destinasi Utama', 
            location: `${d1.nama_jalan || ''} (${d1.kecamatan || 'Kawasan Toba'})`, 
            temp: '24°C', 
            reason: d1.deskripsi_singkat || 'Waktu terbaik untuk menikmati pemandangan alam dengan pencahayaan matahari pagi yang cerah.', 
            transit: '15 mnt berkendara (4.8 km) · Tersedia Angkot antar-kecamatan (Sampri/KBT) ~Rp 7.000' 
          },
          { 
            time: '13:00 – 14:30 WIB', 
            title: u1.nama, 
            category: (u1.kategori || '').toLowerCase().includes('kuliner') ? 'Kuliner Siang Autentik' : 'Sentra UMKM Lokal', 
            location: `${u1.nama_jalan || ''} (${u1.kecamatan || 'Pusat Kuliner'})`, 
            temp: '25°C', 
            reason: 'Mendukung UMKM lokal dan mencicipi olahan rempah Batak autentik (Naniarsik / Naaniura) di sekitar rute.', 
            transit: dayIdx === 1 
              ? 'Penyeberangan Feri KMP Ihan Batak via Loket Pelabuhan Ajibata (Tiket ~Rp 15.000)' 
              : '20 mnt berkendara (6.2 km) via jalan lintas lingkar Danau Toba' 
          },
          { 
            time: '15:30 – 17:30 WIB', 
            title: d2.nama, 
            category: d2.kategori || 'Wisata & Budaya', 
            location: `${d2.nama_jalan || ''} (${d2.kecamatan || 'Kawasan Toba'})`, 
            temp: '23°C', 
            reason: d2.deskripsi_singkat || 'Menikmati golden hour senja kaldera yang asri dan berbelanja cinderamata tenun ulos langsung dari pengrajin.', 
            transit: '10 mnt berkendara · Tersedia Becak Motor (Bentor) lokal' 
          },
          { 
            time: '19:00 – 21:00 WIB', 
            title: u2.nama, 
            category: 'Santap Malam & Istirahat', 
            location: `${u2.nama_jalan || ''} (${u2.kecamatan || 'Kawasan Toba'})`, 
            temp: '20°C', 
            reason: 'Menutup hari dengan santap malam khas tepi danau, kopi hangat, dan istirahat optimal.', 
            transit: 'Tiba di Penginapan / Selesai' 
          },
        ]
      };
    });
  }, [results, kecamatan, query]);

  const activePlan = dayPlans[activeDayTab] || dayPlans[0];


  const handleCopySchedule = () => {
    if (!activePlan) return;
    let text = `🗓️ Rencana Perjalanan TobaRoute AI: ${activePlan.title}\n`;
    text += `🌤️ Cuaca: ${activePlan.weather.temp} (${activePlan.weather.status}) - ${activePlan.weather.outfit}\n\n`;
    activePlan.slots.forEach((s, idx) => {
      text += `${idx + 1}. [${s.time}] ${s.title} (${s.category})\n   📍 Lokasi: ${s.location}\n   💡 Catatan: ${s.reason}\n\n`;
    });
    text += `Dibuat otomatis oleh TobaRoute AI - Kecerdasan Wisata Danau Toba`;
    navigator.clipboard.writeText(text);
    setCopiedSchedule(true);
    setTimeout(() => setCopiedSchedule(false), 3000);
  };

  return (
    <>
      {/* ====================================================== */}
      {/* HERO SECTION                                           */}
      {/* ====================================================== */}
      <section className="polar-hero">
        <div className="container">
          <div className="polar-hero-grid">

            {/* Left Column — Search & Inspiration */}
            <div className="polar-hero-left fade-in">

              <h1 className="polar-hero-title">
                Jelajahi Magis Kaldera,<br />
                <span className="glow-accent">Temukan Surga Sejati</span><br />
                Danau Toba.
              </h1>

              <p className="polar-hero-subtitle">
                Rancang liburan impian Anda dalam hitungan detik. Nikmati mahakarya alam kaldera, kuliner legendaris, dan kekayaan budaya Batak yang tak terlupakan.
              </p>

              {/* SNCF-style Clean Search Bar */}
              <div className="sncf-search-wrapper">

                <div className="sncf-search-tabs">
                  {[
                    { key: 'all', icon: <Search size={13} />, label: 'Semua' },
                    { key: 'kuliner', icon: <Utensils size={13} />, label: 'Kuliner Khas' },
                    { key: 'wisata', icon: <Mountain size={13} />, label: 'Wisata Alam' },
                    { key: 'umkm', icon: <Store size={13} />, label: 'Sentra UMKM' },
                    { key: 'transport', icon: <Ship size={13} />, label: 'Feri & Rute' },
                  ].map(tab => (
                    <button
                      key={tab.key}
                      type="button"
                      className={`sncf-tab-btn${activeCategoryTab === tab.key ? ' active' : ''}`}
                      onClick={() => handleTabSelect(
                        tab.key,
                        tab.key === 'kuliner' ? 'Rumah makan kuliner khas Batak naniarsik dan mie gomak' :
                        tab.key === 'wisata' ? 'Wisata alam panorama bukit pantai dan geosite kaldera' :
                        tab.key === 'umkm' ? 'Sentra UMKM pembuatan kerajinan tenun ulos' :
                        tab.key === 'transport' ? 'Rute transportasi umum dan kapal feri penyeberangan' : '',
                        tab.key === 'kuliner' ? 'Balige' : ''
                      )}
                    >
                      {tab.icon} {tab.label}
                    </button>
                  ))}
                </div>

                <form className="sncf-search-pill-box" onSubmit={handleSearch}>
                  <div className="sncf-input-field" style={{ flex: 1.4 }}>
                    <Search className="sncf-icon" size={17} />
                    <input
                      type="text"
                      placeholder={
                        activeCategoryTab === 'kuliner' ? 'Cari kuliner khas Batak (naniarsik, mie gomak)...' :
                        activeCategoryTab === 'wisata' ? 'Cari bukit, geosite, air terjun kaldera...' :
                        activeCategoryTab === 'umkm' ? 'Cari pengrajin tenun ulos, kopi, oleh-oleh...' :
                        activeCategoryTab === 'transport' ? 'Cari jadwal feri Ajibata-Ambarita, kapal motor...' :
                        'Apa yang ingin Anda jelajahi? (misal: wisata budaya dan kuliner Batak)'
                      }
                      value={query}
                      onChange={(e) => setQuery(e.target.value)}
                    />
                    {query && (
                      <button 
                        type="button" 
                        onClick={() => setQuery('')}
                        style={{ background: 'none', border: 'none', color: '#94A3B8', cursor: 'pointer', padding: '0.2rem', display: 'flex', alignItems: 'center' }}
                        title="Hapus teks"
                      >
                        <X size={14} />
                      </button>
                    )}
                  </div>
                  
                  <div className="sncf-divider" />
                  
                  <div className="sncf-input-field" style={{ flex: 1 }}>
                    <MapPin className="sncf-icon" size={16} />
                    <select value={kecamatan} onChange={(e) => setKecamatan(e.target.value)}>
                      <option value="">Semua Kecamatan (Kawasan Toba)</option>
                      <option value="Balige">Balige & Toba</option>
                      <option value="Samosir">Pulau Samosir (Pangururan & Tomok)</option>
                      <option value="Parapat">Parapat & Girsang Sipangan Bolon</option>
                      <option value="Doloksanggul">Humbahas (Sipinsur & Bakkara)</option>
                      <option value="Tarutung">Tapanuli Utara (Muara & Tarutung)</option>
                      <option value="Berastagi">Karo (Tongging & Sipiso-piso)</option>
                      <option value="Sidikalang">Dairi (Silalahi & Tao)</option>
                      <option value="Laguboti">Laguboti & Porsea</option>
                    </select>
                  </div>

                  <button type="submit" className="sncf-submit-btn" disabled={loading}>
                    {loading ? <div className="spinner" /> : <><Search size={15} /> Cari Rute</>}
                  </button>
                </form>

              </div>

              {/* Quick Tags */}
              <div className="hero-quick-tags">
                <span className="quick-tag-label">Inspirasi:</span>
                <div className="tags-wrapper">
                  {POPULAR_TAGS.map((tag, i) => (
                    <button 
                      key={i} 
                      className="tag-pill" 
                      onClick={() => {
                        setKecamatan(tag.kec);
                        handleSearch(null, tag.query, false, 0, tag.kec);
                      }}
                    >
                      {tag.label}
                    </button>
                  ))}
                </div>
              </div>

              {error && (
                <div className="error-message fade-in" style={{ marginTop: '1rem' }}>
                  <AlertCircle size={16} /> {error}
                </div>
              )}

            </div>

            {/* Right Column — AI Persona & Live Itinerary Showcase */}
            <div className="polar-hero-right fade-in">
              <div className="hero-showcase-container">

                {/* Persona DNA Card */}
                <div className="hero-persona-card">
                  <div className="hero-persona-header">
                    <div>
                      <div className="persona-badge"><Sparkles size={11} /> Travel DNA AI</div>
                      <div className="persona-title">{selectedPersona.title}</div>
                      <div className="persona-sub">{selectedPersona.label}</div>
                    </div>
                    <div style={{ display: 'flex', gap: '0.35rem' }}>
                      <button
                        type="button"
                        className="btn-persona-switch"
                        onClick={() => {
                          const nextIdx = (TRAVEL_PERSONAS.findIndex(p => p.id === selectedPersona.id) + 1) % TRAVEL_PERSONAS.length;
                          setSelectedPersona(TRAVEL_PERSONAS[nextIdx]);
                        }}
                        title="Ganti Persona Wisatawan"
                      >
                        <RotateCw size={13} /> Ganti
                      </button>
                    </div>
                  </div>

                  {/* Persona Selector Tabs */}
                  <div style={{ display: 'flex', gap: '0.35rem', overflowX: 'auto', padding: '0.2rem 0', marginBottom: '0.85rem' }}>
                    {TRAVEL_PERSONAS.map((p) => (
                      <button
                        key={p.id}
                        type="button"
                        onClick={() => setSelectedPersona(p)}
                        style={{
                          padding: '0.25rem 0.6rem',
                          borderRadius: '6px',
                          fontSize: '0.72rem',
                          fontWeight: 700,
                          background: selectedPersona.id === p.id ? '#0071CE' : 'rgba(255,255,255,0.08)',
                          color: selectedPersona.id === p.id ? '#ffffff' : '#CBD5E1',
                          border: 'none',
                          cursor: 'pointer',
                          whiteSpace: 'nowrap'
                        }}
                      >
                        {p.label}
                      </button>
                    ))}
                  </div>

                  <div className="hero-persona-body">
                    <div className="hero-avatar-wrapper">
                      <img 
                        src={getAvatarSrc(selectedPersona.avatar)} 
                        alt="Persona traveler" 
                        className="hero-avatar-img"
                        onError={(e) => {
                          e.target.onerror = null;
                          e.target.src = 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=400&q=80';
                        }}
                      />
                      <label htmlFor="avatar-file-input" className="hero-avatar-overlay" title="Klik untuk unggah foto (.jpg / .png)">
                        <Upload size={14} />
                        <span>Ganti Foto</span>
                      </label>
                      <input 
                        id="avatar-file-input" 
                        type="file" 
                        accept="image/jpeg,image/png,image/jpg" 
                        onChange={handleAvatarUpload}
                        style={{ display: 'none' }} 
                      />
                    </div>
                    <div className="hero-persona-info">
                      <p className="hero-persona-desc">{selectedPersona.desc}</p>
                      
                      <div style={{ display: 'flex', gap: '0.4rem', flexWrap: 'wrap' }}>
                        <button 
                          type="button"
                          className="btn-persona-explore"
                          onClick={() => {
                            setKecamatan(selectedPersona.defaultKec || 'Balige');
                            handleSearch(null, selectedPersona.defaultQuery, false, 0, selectedPersona.defaultKec || 'Balige');
                          }}
                        >
                          <span>Eksplorasi Rute Persona</span>
                          <ArrowRight size={13} />
                        </button>
                        
                        {selectedPersona.customAvatar && (
                          <button
                            type="button"
                            onClick={handleResetAvatar}
                            style={{ background: 'none', border: '1px solid rgba(255,255,255,0.2)', color: '#94A3B8', padding: '0.35rem 0.6rem', borderRadius: '8px', fontSize: '0.72rem', cursor: 'pointer' }}
                            title="Reset ke Foto Asli"
                          >
                            Reset Foto
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                </div>

                {/* Live Itinerary Roadmap Snippet */}
                <div className="hero-live-preview-card">
                  <div className="hero-live-header">
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', color: '#0369a1', fontWeight: 700, fontSize: '0.82rem' }}>
                      <Route size={14} />
                      <span>Rencana Rute Hari Ini — {selectedPersona.label}</span>
                    </div>
                    <span className="live-weather-pill"><Sun size={12} /> 23°C Cerah Berawan</span>
                  </div>

                  <div className="hero-route-stepper">
                    {[
                      { step: 1, name: selectedPersona.id === 'nature' ? 'Geosite Sipinsur' : selectedPersona.id === 'family' ? 'Resort Danau Toba' : 'Kedai Kopi & Mie Gomak', sub: selectedPersona.id === 'nature' ? 'Panorama Hutan Pinus' : 'Sarapan Rempah Batak', time: '08:00 WIB' },
                      { step: 2, name: selectedPersona.id === 'heritage' ? 'Kampung Ulos Meat' : selectedPersona.id === 'nature' ? 'Bukit Holbung Sabana' : 'Desa Wisata & Kuliner', sub: 'Pusat Kerajinan & Budaya', time: '10:30 WIB' },
                      { step: 3, name: selectedPersona.id === 'nature' ? 'Air Terjun Situmurun' : 'Pantai Lumban Bulbul', sub: 'Wisata Air Kaldera & Sunset', time: '14:30 WIB' },
                    ].map((s, i) => (
                      <div key={i} className="hero-stepper-item">
                        <div className="hero-step-num">{s.step}</div>
                        <div className="hero-step-details">
                          <div className="hero-step-title-row">
                            <span className="hero-step-name">{s.name}</span>
                            <span className="hero-step-time">{s.time}</span>
                          </div>
                          <span className="hero-step-sub">{s.sub}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

              </div>
            </div>

          </div>
        </div>
      </section>

      {/* ====================================================== */}
      {/* RESULTS & ITINERARY SECTION                            */}
      {/* ====================================================== */}
      <main className="container main-content section-anchor" id="results-section" style={{ marginTop: '3rem' }}>

        {loading && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
            <div className="skeleton-loading" style={{ height: '160px', borderRadius: '16px' }} />
            <div className="grid">
              {[1, 2, 3].map(i => <div key={i} className="skeleton-loading card-skeleton" />)}
            </div>
          </div>
        )}

        {results && !loading && (
          <div className="results-container fade-in">

            {/* Itinerary Schedule Card */}
            <section className="itinerary-view-card" style={{ marginBottom: '2.5rem' }}>

              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '1rem', marginBottom: '1.5rem' }}>
                <div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.35rem' }}>
                    <span className="badge badge-blue"><Sparkles size={12} /> AI Travel Schedule</span>
                    <span style={{ fontSize: '0.8rem', color: '#64748B' }}>
                      Query: <strong style={{ color: '#0F172A' }}>"{query}"</strong>
                    </span>
                  </div>
                  <h2 style={{ fontSize: '1.45rem', fontWeight: 800, margin: '0 0 0.3rem 0', color: '#0F172A' }}>
                    Rencana Itinerary Perjalanan Danau Toba
                  </h2>
                  <p style={{ fontSize: '0.875rem', color: '#64748B', margin: 0 }}>
                    Jadwal jam-ke-jam, prakiraan cuaca mikro kaldera, estimasi jarak jalan raya, dan singgah UMKM lokal.
                  </p>
                </div>

                <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap', alignItems: 'center' }}>
                  <button
                    onClick={handleForwardToPlanner}
                    className="btn-primary"
                    style={{ fontSize: '0.82rem', padding: '0.55rem 1.15rem', display: 'inline-flex', alignItems: 'center', gap: '0.4rem' }}
                  >
                    <Calendar size={14} /> Kustomisasi di Studio Planner <ArrowRight size={14} />
                  </button>

                  <button
                    className="btn-secondary"
                    onClick={handleCopySchedule}
                    style={{ fontSize: '0.82rem', padding: '0.55rem 0.95rem', display: 'inline-flex', alignItems: 'center', gap: '0.35rem' }}
                    title="Salin Jadwal Hari Ini ke Clipboard"
                  >
                    {copiedSchedule ? <><Check size={14} color="#00875A" /> Tersalin!</> : <><Copy size={14} /> Salin</>}
                  </button>

                  <button
                    className="btn-secondary"
                    onClick={(e) => handleSearch(e, null, true)}
                    style={{ fontSize: '0.82rem', padding: '0.55rem 0.95rem', display: 'inline-flex', alignItems: 'center', gap: '0.35rem' }}
                    title="Cari Kombinasi Rute Lain"
                  >
                    <RotateCw size={14} /> Opsi Lain
                  </button>

                  <button
                    onClick={handleResetSearch}
                    style={{ background: '#F1F5F9', border: '1px solid #E2E8F0', color: '#64748B', borderRadius: '8px', padding: '0.55rem 0.8rem', fontSize: '0.82rem', cursor: 'pointer' }}
                    title="Kembali ke Tampilan Awal"
                  >
                    <X size={14} />
                  </button>
                </div>
              </div>

              {/* Day Tabs */}
              <div className="itinerary-day-tabs">
                {dayPlans.map((dp, idx) => (
                  <button
                    key={idx}
                    className={`day-tab-btn${activeDayTab === idx ? ' active' : ''}`}
                    onClick={() => setActiveDayTab(idx)}
                  >
                    <Calendar size={14} /> {dp.title}
                  </button>
                ))}
              </div>

              {/* Weather Bar */}
              <div className="daily-weather-bar">
                <div className="weather-forecast-badge">
                  <div className="weather-icon-dot"><Sun size={20} /></div>
                  <span className="weather-temp-num">{activePlan.weather.temp}</span>
                  <div className="weather-detail-col">
                    <span className="weather-status-text">{activePlan.weather.status}</span>
                    <span className="weather-sub-text">
                      Kelembapan {activePlan.weather.humidity} · Angin Danau {activePlan.weather.wind}
                    </span>
                  </div>
                </div>
                <div className="weather-outfit-tip">
                  <CheckCircle size={14} />
                  <span>{activePlan.weather.outfit}</span>
                </div>
              </div>

              {/* Timeline Items */}
              <div className="timeline-schedule-list">
                {activePlan.slots.map((slot, sIdx) => (
                  <div key={sIdx} className="timeline-slot-item">
                    <div className="timeline-bullet" />
                    <div className="timeline-slot-card">

                      <div className="slot-time-col">
                        <span className="slot-time-pill">
                          <Clock size={11} /> {slot.time}
                        </span>
                        <span className="slot-weather-chip">
                          <Thermometer size={11} /> {slot.temp} · {activePlan.weather.status}
                        </span>
                      </div>

                      <div className="slot-content-col">
                        <span className="slot-category-tag">{slot.category}</span>
                        <h4>{slot.title}</h4>
                        <div className="slot-ai-reason">{slot.reason}</div>
                      </div>

                      <div style={{ flexShrink: 0, display: 'flex', gap: '0.4rem' }}>
                        <button
                          className="btn-ghost"
                          style={{ fontSize: '0.78rem', padding: '0.4rem 0.75rem' }}
                          onClick={() => document.getElementById('map-section')?.scrollIntoView({ behavior: 'smooth' })}
                          title="Fokuskan ke Peta Rute"
                        >
                          <Navigation size={13} /> Peta
                        </button>
                      </div>
                    </div>

                    {sIdx < activePlan.slots.length - 1 && (
                      <div className="transit-connector-bar">
                        <div className="transit-icon-chip"><Route size={13} /></div>
                        <span>{slot.transit}</span>
                      </div>
                    )}
                  </div>
                ))}
              </div>

            </section>

            {/* AI Concierge Response & Route Map */}
            <section className="ai-response section-anchor" id="map-section">
              <div className="ai-header">
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
                  <Sparkles size={18} color="#0071CE" />
                  <h3 style={{ margin: 0 }}>Kurasi Senior Travel Concierge TobaRoute</h3>
                </div>
                <span className="badge badge-green" style={{ fontSize: '0.72rem' }}>
                  <ShieldCheck size={12} /> Terverifikasi Budaya & Logistik Rute
                </span>
              </div>
              <div className="ai-body">
                <ReactMarkdown>{results.ai_response}</ReactMarkdown>
              </div>
              <div style={{ marginTop: '1.5rem' }}>
                <RouteMap 
                  destinasiUtama={activePlan.destinasiUtama || results.destinasi_utama} 
                  umkmSekitar={activePlan.umkmSekitar || results.rekomendasi_umkm_sekitar} 
                />
              </div>
            </section>

            {/* Destinasi Utama Grid */}
            <section className="destinations-section" style={{ marginTop: '3rem' }}>
              <div className="section-header">
                <h2>Destinasi Utama ({results.destinasi_utama.length})</h2>
                <div className="line" />
              </div>
              {results.destinasi_utama.length > 0 ? (
                <div className="grid">
                  {results.destinasi_utama.map(dest => (
                    <DestinationCard key={dest.id} dest={dest} isUmkm={false} />
                  ))}
                </div>
              ) : (
                <p className="no-data">Tidak ada destinasi utama yang ditemukan untuk filter ini.</p>
              )}
            </section>

            {/* Rekomendasi UMKM Lokal Grid */}
            <section className="umkm-section" style={{ marginTop: '3.5rem', marginBottom: '4rem' }}>
              <div className="section-header">
                <h2>Rekomendasi UMKM & Kuliner Lokal Sekitar ({results.rekomendasi_umkm_sekitar.length})</h2>
                <div className="line line-accent" />
              </div>
              {results.rekomendasi_umkm_sekitar.length > 0 ? (
                <div className="grid">
                  {results.rekomendasi_umkm_sekitar.map(umkm => (
                    <DestinationCard key={umkm.id} dest={umkm} isUmkm={true} />
                  ))}
                </div>
              ) : (
                <p className="no-data">Tidak ada rekomendasi UMKM untuk pencarian ini.</p>
              )}
            </section>

          </div>
        )}

        {/* ====================================================== */}
        {/* EDITORIAL SHOWCASE (Hanya tampil saat belum ada hasil) */}
        {/* ====================================================== */}
        {!results && !loading && (
          <div className="fade-in">

            <div className="polar-showcase-section">

              {/* Feature 1 — Personal DNA */}
              <div className="polar-showcase-row">
                <div className="polar-preview-box">
                  <div className="polar-preview-card-inner">
                    <span className="badge badge-blue" style={{ marginBottom: '0.65rem' }}>Travel Style</span>
                    <h4 style={{ fontSize: '1rem', fontWeight: 800, marginBottom: '0.35rem' }}>The Culinary Adventurer</h4>
                    <img
                      src="https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&w=400&q=80"
                      alt="Culinary traveler"
                      style={{ width: '100%', height: '130px', objectFit: 'cover', borderRadius: '10px', marginBottom: '0.75rem' }}
                    />
                    <p style={{ fontSize: '0.78rem', color: '#667085', lineHeight: 1.5, margin: 0 }}>
                      Penjelajah kuliner yang mencari hidangan autentik rempah andaliman, sajian Dekke Naaniura segar, dan kopi di kedai lokal pinggir danau.
                    </p>
                  </div>
                </div>
                <div className="polar-showcase-text">
                  <span className="badge badge-slate" style={{ marginBottom: '1rem' }}>Personalisasi AI</span>
                  <h2>Mempelajari Gaya dan Selera Wisata Anda</h2>
                  <p>
                    Dari eksplorasi tenang tepi danau, petualangan trekking geosite kaldera, hingga berburu kuliner autentik Batak — TobaRoute AI mempelajari preferensi Anda untuk merancang rute yang benar-benar pas.
                  </p>
                  <button className="btn-primary" onClick={() => handleSearch(null, 'Wisata kuliner autentik Batak naniarsik mie gomak')}>
                    Coba Eksplorasi Kuliner <ChevronRight size={16} />
                  </button>
                </div>
              </div>

              {/* Feature 2 — Studio Planner */}
              <div className="polar-showcase-row reverse">
                <div className="polar-preview-box">
                  <div className="polar-preview-card-inner">
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.75rem' }}>
                      <span style={{ fontSize: '0.78rem', fontWeight: 700 }}>Samosir Roadtrip</span>
                      <span className="badge badge-blue" style={{ padding: '0.15rem 0.5rem', fontSize: '0.65rem' }}>2 Malam</span>
                    </div>
                    {[
                      { name: 'Desa Tomok', sub: 'Batu Kursi & Makam Raja', day: 'Hari 1' },
                      { name: 'Bukit Holbung', sub: 'Sunset Sabana Kaldera', day: 'Hari 2' },
                    ].map((item, i) => (
                      <div key={i} style={{ background: '#F9FAFB', border: '1px solid #E4E7EC', borderRadius: '8px', padding: '0.6rem 0.75rem', marginBottom: '0.4rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <div>
                          <strong style={{ fontSize: '0.82rem' }}>{item.name}</strong>
                          <div style={{ fontSize: '0.68rem', color: '#94A3B8' }}>{item.sub}</div>
                        </div>
                        <span className={`badge ${i === 0 ? 'badge-blue' : 'badge-green'}`} style={{ fontSize: '0.65rem', padding: '0.15rem 0.5rem' }}>{item.day}</span>
                      </div>
                    ))}
                  </div>
                </div>
                <div className="polar-showcase-text">
                  <span className="badge badge-slate" style={{ marginBottom: '1rem' }}>Studio Planner</span>
                  <h2>Edit dan Eksplorasi Jadwal Secara Bebas</h2>
                  <p>
                    Atur ulang urutan jam kunjungan, tambahkan singgah UMKM lokal, atau sesuaikan durasi hari di Studio Planner. Peta rute GIS diperbarui seketika mengikuti perubahan Anda.
                  </p>
                  <NavLink to="/planner" className="btn-primary" style={{ textDecoration: 'none', display: 'inline-flex', alignItems: 'center', gap: '0.4rem' }}>
                    Buka Studio Itinerary <ArrowRight size={16} />
                  </NavLink>
                </div>
              </div>

              {/* Feature 3 — Moda & Kebutuhan */}
              <div className="polar-showcase-row">
                <div className="polar-preview-box">
                  <div className="polar-preview-card-inner">
                    <p style={{ fontSize: '0.75rem', fontWeight: 700, marginBottom: '0.65rem' }}>Preferensi Perjalanan</p>
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.4rem', marginBottom: '0.75rem' }}>
                      <div style={{ border: '1.5px solid #0071CE', background: '#EBF4FF', borderRadius: '8px', padding: '0.5rem', textAlign: 'center', fontSize: '0.72rem', fontWeight: 700, color: '#0071CE' }}>
                        Road Trip
                      </div>
                      <div style={{ border: '1px solid #E4E7EC', background: '#F9FAFB', borderRadius: '8px', padding: '0.5rem', textAlign: 'center', fontSize: '0.72rem', color: '#94A3B8' }}>
                        Feri Danau
                      </div>
                    </div>
                    <div style={{ background: '#F9FAFB', border: '1px solid #E4E7EC', borderRadius: '8px', padding: '0.6rem', fontSize: '0.72rem', color: '#475569', lineHeight: 1.5 }}>
                      "Bersama keluarga dengan anak-anak, menginginkan rute santai, penginapan nyaman, dan bebas macet."
                    </div>
                  </div>
                </div>
                <div className="polar-showcase-text">
                  <span className="badge badge-slate" style={{ marginBottom: '1rem' }}>Kustomisasi Penuh</span>
                  <h2>Bentuk Rencana Sesuai Kebutuhan Anda</h2>
                  <p>
                    Beri tahu AI siapa yang ikut (keluarga, pasangan, solo), moda transportasi pilihan (mobil, motor, feri), dan lokasi wajib yang ingin dikunjungi.
                  </p>
                  <button className="btn-primary" onClick={() => handleSearch(null, 'Wisata keluarga balige pantai bulbul penginapan resort')}>
                    <Users size={16} /> Rancang Trip Keluarga
                  </button>
                </div>
              </div>

              {/* Feature 4 — Feri Logistik */}
              <div className="polar-showcase-row reverse">
                <div className="polar-preview-box">
                  <div className="polar-preview-card-inner">
                    <img
                      src="https://images.unsplash.com/photo-1506744038136-46273834b3fb?auto=format&fit=crop&w=400&q=80"
                      alt="Lake Toba ferry route"
                      style={{ width: '100%', height: '130px', objectFit: 'cover', borderRadius: '10px', marginBottom: '0.75rem' }}
                    />
                    <div className="badge badge-green" style={{ marginBottom: '0.5rem', display: 'inline-flex' }}>Info Feri Ro-Ro</div>
                    <p style={{ fontSize: '0.75rem', color: '#374151', fontWeight: 600, lineHeight: 1.4, margin: 0 }}>
                      Jadwal KMP Ihan Batak: 08.00 · 11.00 · 14.30 WIB<br />
                      <span style={{ fontWeight: 400, color: '#94A3B8' }}>Ajibata (Parapat) ↔ Ambarita (Samosir)</span>
                    </p>
                  </div>
                </div>
                <div className="polar-showcase-text">
                  <span className="badge badge-slate" style={{ marginBottom: '1rem' }}>Navigasi Danau</span>
                  <h2>Perjalanan Cerdas Antar Titik Kunjungan</h2>
                  <p>
                    Estimasi waktu tempuh realistis terintegrasi dengan jadwal kapal feri penyeberangan Danau Toba. Liburan tetap efisien, bebas kebingungan, dan tepat waktu.
                  </p>
                  <button className="btn-primary" onClick={() => handleSearch(null, 'Rute feri ajibata ambarita dan transportasi kapal motor')}>
                    <Ship size={16} /> Cek Logistik Feri
                  </button>
                </div>
              </div>

              {/* Feature 5 — Keadilan UMKM */}
              <div className="polar-showcase-row">
                <div className="polar-preview-box">
                  <div className="polar-preview-card-inner">
                    <strong style={{ fontSize: '0.9rem', display: 'block', marginBottom: '0.2rem' }}>Desa Wisata Meat</strong>
                    <span className="badge badge-green" style={{ marginBottom: '0.65rem', display: 'inline-flex' }}>Sentra Tenun Ulos</span>
                    <div style={{ background: '#EBF4FF', borderLeft: '3px solid #0071CE', padding: '0.55rem 0.7rem', borderRadius: '0 8px 8px 0', fontSize: '0.78rem', color: '#1E3A5F', lineHeight: 1.5 }}>
                      <strong>Mengapa cocok:</strong> Karena Anda menyukai keaslian budaya Batak dan ingin melihat proses tenun Ulos di tepi sawah kaldera.
                    </div>
                  </div>
                </div>
                <div className="polar-showcase-text">
                  <span className="badge badge-slate" style={{ marginBottom: '1rem' }}>Keadilan UMKM</span>
                  <h2>Pahami Mengapa Setiap Rekomendasi Cocok</h2>
                  <p>
                    Setiap destinasi dan UMKM dilengkapi penjelasan personal dari AI — mengapa tempat tersebut pas dengan minat dan kondisi cuaca saat kunjungan Anda.
                  </p>
                  <NavLink to="/umkm" className="btn-primary" style={{ textDecoration: 'none', display: 'inline-flex', alignItems: 'center', gap: '0.4rem' }}>
                    <Store size={16} /> Direktori Sentra UMKM
                  </NavLink>
                </div>
              </div>

            </div>

            {/* Stats Banner */}
            <div className="stats-banner">
              {[
                { num: '491', label: 'Entitas Wisata & UMKM' },
                { num: '24', label: 'Kecamatan Terdata' },
                { num: '16', label: 'Geosite UNESCO' },
                { num: '100%', label: 'Keadilan Porsi UMKM' },
              ].map((s, i, arr) => (
                <React.Fragment key={i}>
                  <div className="stat-item">
                    <span className="stat-number">{s.num}</span>
                    <span className="stat-label">{s.label}</span>
                  </div>
                  {i < arr.length - 1 && <div className="stat-divider" />}
                </React.Fragment>
              ))}
            </div>

            {/* Call To Action Box */}
            <div style={{ marginTop: '2.5rem', background: '#0C1220', borderRadius: '24px', padding: '3rem 2.5rem', textAlign: 'center', border: '1px solid rgba(255,255,255,0.06)' }}>
              <p style={{ fontSize: '0.75rem', fontWeight: 700, letterSpacing: '0.1em', textTransform: 'uppercase', color: '#38BDF8', marginBottom: '0.75rem' }}>Studio Perencana AI</p>
              <h3 style={{ fontSize: '1.75rem', fontWeight: 800, color: '#F1F5F9', letterSpacing: '-0.02em', marginBottom: '0.75rem', lineHeight: 1.25 }}>
                Buka Studio Itinerary & Peta GIS<br />Interaktif
              </h3>
              <p style={{ fontSize: '0.95rem', color: '#64748B', maxWidth: '560px', margin: '0 auto 2rem', lineHeight: 1.65 }}>
                Atur anggaran, checklist perlengkapan, dan navigasi rute jalan raya secara presisi dengan AI Concierge yang memahami seluruh kawasan Danau Toba.
              </p>
              <div style={{ display: 'flex', gap: '0.75rem', justifyContent: 'center', flexWrap: 'wrap' }}>
                <NavLink
                  to="/planner"
                  style={{ background: '#0071CE', color: '#fff', fontWeight: 700, padding: '0.85rem 2rem', borderRadius: '12px', textDecoration: 'none', display: 'inline-flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.9rem', transition: '0.2s' }}
                >
                  <Calendar size={17} /> Buka Studio Itinerary
                </NavLink>
                <NavLink
                  to="/explore"
                  style={{ background: 'rgba(255,255,255,0.07)', color: '#CBD5E1', border: '1px solid rgba(255,255,255,0.12)', fontWeight: 600, padding: '0.85rem 2rem', borderRadius: '12px', textDecoration: 'none', display: 'inline-flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.9rem', transition: '0.2s' }}
                >
                  <Compass size={17} /> Jelajah Peta GIS
                </NavLink>
              </div>
            </div>

          </div>
        )}

      </main>
    </>
  );
};

export default Home;
