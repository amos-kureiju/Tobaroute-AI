// ====================================================================================================
// FILE: frontend/src/pages/Home.jsx
// ====================================================================================================

import React, { useState, useEffect, useMemo } from 'react';
import { NavLink } from 'react-router-dom';
import {
  Search, MapPin, Sparkles, AlertCircle, Compass, ShieldCheck,
  Route, Store, Clock, RotateCw, Car, Bike, Ship, Mountain,
  Users, Sun, Wind, CheckCircle, Navigation, Award, Calendar,
  ArrowRight, Utensils, ChevronRight, Thermometer, Star
} from 'lucide-react';
import { getFairRecommendation } from '../services/api';
import DestinationCard from '../components/DestinationCard';
import RouteMap from '../components/RouteMap';
import ReactMarkdown from 'react-markdown';

const POPULAR_TAGS = [
  { label: 'Wisata Alam Balige', query: 'Wisata alam dan pantai pemandangan indah di Balige' },
  { label: 'Kuliner Khas Batak', query: 'Rumah makan kuliner khas Batak naniarsik dan mie gomak' },
  { label: 'Sentra Tenun Ulos', query: 'Tempat pembuatan dan kerajinan Tenun Ulos buatan UMKM lokal' },
  { label: 'Rute Feri Danau', query: 'Rute angkutan umum dan kapal feri penyeberangan Danau Toba' },
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
  { temp: '22 – 26°C', status: 'Cerah Berawan', humidity: '72%', wind: '12 km/jam', outfit: 'Pakaian santai katun, kacamata, dan jaket tipis untuk pagi/sore hari' },
  { temp: '21 – 24°C', status: 'Semilir Angin Kaldera', humidity: '78%', wind: '15 km/jam', outfit: 'Jaket ringan tahan angin dan alas kaki nyaman untuk area danau' }
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
        title: dayIdx === 0 ? `Hari 1 — ${kecamatan || 'Balige'}` : `Hari 2 — Penyeberangan Samosir`,
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
      {/* HERO                                                   */}
      {/* ====================================================== */}
      <section className="polar-hero">
        <div className="container">
          <div className="polar-hero-grid">

            {/* Left Column */}
            <div className="polar-hero-left fade-in">

              {/* Trust Row */}
              <div className="polar-trust-badges">
                <span className="polar-trust-item"><Award size={13} /> UNESCO Global Geopark</span>
                <span className="polar-trust-sep">·</span>
                <span className="polar-trust-item"><ShieldCheck size={13} /> Kemenparekraf RI</span>
                <span className="polar-trust-sep">·</span>
                <span className="polar-trust-item"><CheckCircle size={13} /> 100% Fairness UMKM</span>
              </div>

              <h1 className="polar-hero-title">
                AI Trip Planner yang<br />
                <span className="glow-accent">Memahami Selera Wisata</span><br />
                Danau Toba Anda.
              </h1>

              <p className="polar-hero-subtitle">
                Jadwal presisi per jam, prakiraan cuaca mikro kaldera, rute adil yang memberdayakan UMKM lokal — semua dalam satu platform.
              </p>

              {/* SNCF Clean Search Bar */}
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
                      placeholder="Apa yang ingin Anda jelajahi? (misal: wisata budaya keluarga)"
                      value={query}
                      onChange={(e) => setQuery(e.target.value)}
                    />
                  </div>
                  <div className="sncf-divider" />
                  <div className="sncf-input-field">
                    <MapPin className="sncf-icon" size={16} />
                    <select value={kecamatan} onChange={(e) => setKecamatan(e.target.value)}>
                      <option value="">Semua Kecamatan</option>
                      <option value="Balige">Balige & Toba Tengah</option>
                      <option value="Samosir">Pulau Samosir</option>
                      <option value="Parapat">Parapat (Simalungun)</option>
                      <option value="Doloksanggul">Humbahas (Sipinsur)</option>
                      <option value="Tarutung">Tapanuli Utara</option>
                      <option value="Berastagi">Karo (Tongging)</option>
                      <option value="Sidikalang">Dairi (Silalahi)</option>
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

            {/* Right Column — Phone Mockup */}
            <div className="polar-hero-right fade-in">
              <div className="polar-phone-wrapper">

                {/* Floating Persona Card */}
                <div className="polar-floating-persona">
                  <div className="persona-badge">Travel DNA</div>
                  <div className="persona-title">{selectedPersona.title}</div>
                  <div className="persona-avatar-wrap">
                    <img src={selectedPersona.avatar} alt="Persona traveler" className="persona-avatar" />
                  </div>
                  <p style={{ fontSize: '0.7rem', color: '#64748B', lineHeight: 1.4, marginBottom: '0.65rem' }}>
                    {selectedPersona.desc}
                  </p>
                  <button
                    className="btn-persona-action"
                    onClick={() => {
                      const nextIdx = (TRAVEL_PERSONAS.findIndex(p => p.id === selectedPersona.id) + 1) % TRAVEL_PERSONAS.length;
                      setSelectedPersona(TRAVEL_PERSONAS[nextIdx]);
                    }}
                  >
                    <RotateCw size={11} /> Ganti Persona
                  </button>
                </div>

                {/* Phone Frame */}
                <div className="polar-phone-frame">
                  <div className="polar-phone-notch" />
                  <div className="polar-phone-screen">
                    <div className="polar-phone-map-bg">
                      <div className="polar-phone-header">
                        <span>Danau Toba Roadtrip</span>
                        <span>2D1N</span>
                      </div>
                      <div className="polar-map-pin" style={{ top: '38%', left: '22%' }}>1 Balige</div>
                      <div className="polar-map-pin" style={{ top: '55%', left: '52%', background: '#00875A' }}>2 Meat</div>
                      <div className="polar-map-pin" style={{ top: '28%', right: '14%', background: '#6366F1' }}>3 Samosir</div>
                      <div style={{ marginTop: 'auto', background: 'rgba(12,18,32,0.6)', borderRadius: '6px', padding: '3px 8px', alignSelf: 'flex-start', fontSize: '0.65rem', color: '#E0F2FE', fontWeight: 600 }}>
                        23°C — Cerah Berawan
                      </div>
                    </div>
                    <div className="polar-phone-sheet">
                      <div className="polar-sheet-header">
                        <span>Rute Aktif</span>
                        <span>4 Titik</span>
                      </div>
                      {[
                        { name: 'Balige Kota', sub: 'Sarapan Mie Gomak', time: '08:00' },
                        { name: 'Desa Meat', sub: 'Sentra Tenun Ulos', time: '10:30' },
                        { name: 'Pantai Pasir Putih', sub: 'Makan Siang Arsik', time: '13:00' },
                      ].map((s, i) => (
                        <div key={i} className="polar-stop-mini">
                          <div>
                            <strong>{s.name}</strong>
                            <span style={{ fontSize: '0.68rem', color: '#94A3B8', display: 'block' }}>{s.sub}</span>
                          </div>
                          <span style={{ fontSize: '0.72rem', fontWeight: 700, color: '#0071CE' }}>{s.time}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>

              </div>
            </div>

          </div>
        </div>
      </section>

      {/* ====================================================== */}
      {/* RESULTS                                               */}
      {/* ====================================================== */}
      <main className="container main-content section-anchor" id="results-section" style={{ marginTop: '3rem' }}>

        {loading && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
            <div className="skeleton-loading" style={{ height: '160px', borderRadius: '16px' }} />
            <div className="grid">
              {[1,2,3].map(i => <div key={i} className="skeleton-loading card-skeleton" />)}
            </div>
          </div>
        )}

        {results && !loading && (
          <div className="results-container fade-in">

            {/* Itinerary Section */}
            <section className="itinerary-view-card" style={{ marginBottom: '2rem' }}>

              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '1rem', marginBottom: '1.5rem' }}>
                <div>
                  <h2 style={{ fontSize: '1.35rem', fontWeight: 800, marginBottom: '0.3rem' }}>Rencana Itinerary Perjalanan</h2>
                  <p style={{ fontSize: '0.875rem', color: '#667085', margin: 0 }}>
                    Jadwal jam-ke-jam, prakiraan cuaca mikro, estimasi jarak, dan singgah UMKM lokal.
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
                    <RotateCw size={14} /> Opsi Lain
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

            {/* AI Concierge Response */}
            <section className="ai-response section-anchor" id="map-section">
              <div className="ai-header">
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
                  <Sparkles size={18} color="#0071CE" />
                  <h3>Kurasi Senior Travel Concierge TobaRoute</h3>
                </div>
              </div>
              <div className="ai-body">
                <ReactMarkdown>{results.ai_response}</ReactMarkdown>
              </div>
              <RouteMap destinasiUtama={results.destinasi_utama} umkmSekitar={results.rekomendasi_umkm_sekitar} />
            </section>

            {/* Destinations */}
            <section className="destinations-section">
              <div className="section-header">
                <h2>Destinasi Utama</h2>
                <div className="line" />
              </div>
              {results.destinasi_utama.length > 0 ? (
                <div className="grid">
                  {results.destinasi_utama.map(dest => <DestinationCard key={dest.id} dest={dest} isUmkm={false} />)}
                </div>
              ) : <p className="no-data">Tidak ada destinasi yang ditemukan.</p>}
            </section>

            {/* UMKM */}
            <section className="umkm-section">
              <div className="section-header">
                <h2>Rekomendasi UMKM Lokal</h2>
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

        {/* ====================================================== */}
        {/* SHOWCASE — Only shown before search                   */}
        {/* ====================================================== */}
        {!results && !loading && (
          <div className="fade-in">

            <div className="polar-showcase-section">

              {/* Feature 1 */}
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
                    <p style={{ fontSize: '0.78rem', color: '#667085', lineHeight: 1.5 }}>
                      Penjelajah kuliner yang mencari hidangan autentik rempah andaliman, sajian naniura segar, dan kopi di kedai lokal pinggir danau.
                    </p>
                  </div>
                </div>
                <div className="polar-showcase-text">
                  <span className="badge badge-slate" style={{ marginBottom: '1rem' }}>Personalisasi</span>
                  <h2>Mempelajari Gaya dan Selera Wisata Anda</h2>
                  <p>
                    Dari eksplorasi tenang tepi danau, petualangan trekking geosite kaldera, hingga berburu kuliner autentik Batak — TobaRoute AI mempelajari preferensi Anda untuk merancang rute yang benar-benar pas.
                  </p>
                  <button className="btn-primary" onClick={() => handleSearch(null, 'Wisata kuliner autentik Batak')}>
                    Coba Sekarang <ChevronRight size={16} />
                  </button>
                </div>
              </div>

              {/* Feature 2 */}
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
                  <span className="badge badge-slate" style={{ marginBottom: '1rem' }}>Itinerary</span>
                  <h2>Edit dan Eksplorasi Jadwal Secara Bebas</h2>
                  <p>
                    Atur ulang urutan jam kunjungan, tambahkan singgah UMKM lokal, atau ubah durasi hari di Studio Planner. Peta rute GIS diperbarui seketika mengikuti perubahan Anda.
                  </p>
                  <NavLink to="/planner" className="btn-primary" style={{ textDecoration: 'none', display: 'inline-flex', alignItems: 'center', gap: '0.4rem' }}>
                    Buka Studio Itinerary <ArrowRight size={16} />
                  </NavLink>
                </div>
              </div>

              {/* Feature 3 */}
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
                      "Bersama keluarga dengan anak-anak, menginginkan rute santai dan bebas macet."
                    </div>
                  </div>
                </div>
                <div className="polar-showcase-text">
                  <span className="badge badge-slate" style={{ marginBottom: '1rem' }}>Kustomisasi</span>
                  <h2>Bentuk Rencana Sesuai Kebutuhan Anda</h2>
                  <p>
                    Beri tahu AI siapa yang ikut (keluarga, pasangan, solo), moda transportasi pilihan (mobil, motor, feri), dan lokasi wajib yang ingin dikunjungi.
                  </p>
                  <button className="btn-primary" onClick={() => handleSearch(null, 'Wisata keluarga balige pantai bulbul')}>
                    <Users size={16} /> Rancang Trip Keluarga
                  </button>
                </div>
              </div>

              {/* Feature 4 */}
              <div className="polar-showcase-row reverse">
                <div className="polar-preview-box">
                  <div className="polar-preview-card-inner">
                    <img
                      src="https://images.unsplash.com/photo-1506744038136-46273834b3fb?auto=format&fit=crop&w=400&q=80"
                      alt="Lake Toba ferry route"
                      style={{ width: '100%', height: '130px', objectFit: 'cover', borderRadius: '10px', marginBottom: '0.75rem' }}
                    />
                    <div className="badge badge-green" style={{ marginBottom: '0.5rem', display: 'inline-flex' }}>Info Feri</div>
                    <p style={{ fontSize: '0.75rem', color: '#374151', fontWeight: 600, lineHeight: 1.4 }}>
                      Jadwal KMP Ihan Batak: 08.00 · 11.00 · 14.30 WIB<br />
                      <span style={{ fontWeight: 400, color: '#94A3B8' }}>Ajibata – Ambarita (Samosir)</span>
                    </p>
                  </div>
                </div>
                <div className="polar-showcase-text">
                  <span className="badge badge-slate" style={{ marginBottom: '1rem' }}>Navigasi</span>
                  <h2>Perjalanan Cerdas Antar Titik Kunjungan</h2>
                  <p>
                    Estimasi waktu tempuh realistis terintegrasi dengan jadwal kapal feri penyeberangan Danau Toba. Liburan tetap efisien, bebas kebingungan, dan tepat waktu.
                  </p>
                  <button className="btn-primary" onClick={() => handleSearch(null, 'Rute feri ajibata ambarita dan transportasi')}>
                    <Ship size={16} /> Cek Logistik Feri
                  </button>
                </div>
              </div>

              {/* Feature 5 */}
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
                  <span className="badge badge-slate" style={{ marginBottom: '1rem' }}>Transparansi AI</span>
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

            {/* Stats */}
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

            {/* CTA */}
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
