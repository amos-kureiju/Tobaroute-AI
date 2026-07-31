import React, { useState, useEffect } from 'react';
import { Search, Map, Sparkles, AlertCircle, Compass, ShieldCheck, Route, Store, History, Clock, ArrowRight, RotateCw } from 'lucide-react';
import { getFairRecommendation } from '../services/api';
import DestinationCard from '../components/DestinationCard';
import RouteMap from '../components/RouteMap';
import ReactMarkdown from 'react-markdown';

const POPULAR_TAGS = [
  { label: 'Wisata Alam Balige', query: 'Wisata alam dan pantai pemandangan indah di Balige' },
  { label: 'Kuliner Khas Batak', query: 'Rumah makan kuliner khas Batak naniarsik dan mie gomak' },
  { label: 'Sentra UMKM Ulos', query: 'Tempat pembuatan dan kerajinan Tenun Ulos buatan UMKM lokal' },
  { label: 'Transportasi Feri & Angkot', query: 'Rute angkutan umum dan kapal feri penyeberangan Danau Toba' },
];

const Home = () => {
  const [query, setQuery] = useState('');
  const [kecamatan, setKecamatan] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [results, setResults] = useState(null);
  const [recentSearches, setRecentSearches] = useState([]);
  const [searchOffset, setSearchOffset] = useState(0);
  const [userCoords, setUserCoords] = useState(null);
  const [homeConfig, setHomeConfig] = useState({
    heroBadge: 'Platform Navigasi & Keadilan Pariwisata Danau Toba',
    heroTitle: 'Temukan Keindahan Danau Toba',
    heroSubtitle: 'Sistem rekomendasi berbasis kecerdasan data yang merancang rute perjalanan presisi, destinasi populer, serta memajukan ekonomi pelaku UMKM lokal.',
    alertActive: false,
    alertText: '',
    alertBg: 'info'
  });

  // Track User GPS Coordinates for nearest-first recommendations
  useEffect(() => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (pos) => {
          setUserCoords({ lat: pos.coords.latitude, lon: pos.coords.longitude });
        },
        (err) => console.warn("Akses GPS belum diaktifkan")
      );
    }
  }, []);

  // Restore saved search results from sessionStorage on mount
  useEffect(() => {
    try {
      const savedConfig = localStorage.getItem('tobaguide_home_content_config');
      if (savedConfig) {
        setHomeConfig(JSON.parse(savedConfig));
      }

      const savedQuery = sessionStorage.getItem('tobaroute_last_query');
      const savedKec = sessionStorage.getItem('tobaroute_last_kecamatan');
      const savedResults = sessionStorage.getItem('tobaroute_last_results');
      const savedRecent = localStorage.getItem('tobaroute_recent_searches');

      if (savedQuery) setQuery(savedQuery);
      if (savedKec) setKecamatan(savedKec);
      if (savedResults) setResults(JSON.parse(savedResults));
      if (savedRecent) setRecentSearches(JSON.parse(savedRecent));
    } catch (e) {
      console.error("Error restoring session search state:", e);
    }
  }, []);

  const handleSearch = async (e, customQuery = null, forceNextOffset = false) => {
    if (e) e.preventDefault();
    const searchQuery = customQuery || query;

    if (!searchQuery.trim()) {
      setError('Mohon masukkan keinginan wisata Anda (misal: "tempat yang tenang dan sejuk untuk keluarga")');
      return;
    }

    let newOffset = 0;
    const lastQuery = sessionStorage.getItem('tobaroute_last_query');
    const lastKec = sessionStorage.getItem('tobaroute_last_kecamatan');

    if (forceNextOffset || (searchQuery === lastQuery && kecamatan === lastKec)) {
      newOffset = searchOffset + 1;
    } else {
      newOffset = 0;
    }
    
    setSearchOffset(newOffset);
    setQuery(searchQuery);
    setLoading(true);
    setError('');
    
    try {
      const data = await getFairRecommendation(
        searchQuery, 
        kecamatan, 
        newOffset, 
        userCoords?.lat, 
        userCoords?.lon
      );
      setResults(data);

      // Save to sessionStorage so switching pages never loses results
      sessionStorage.setItem('tobaroute_last_results', JSON.stringify(data));
      sessionStorage.setItem('tobaroute_last_query', searchQuery);
      sessionStorage.setItem('tobaroute_last_kecamatan', kecamatan);

      // Scroll to results smoothly
      setTimeout(() => {
        const el = document.getElementById('results-section');
        if (el) el.scrollIntoView({ behavior: 'smooth' });
      }, 100);
    } catch (err) {
      setError('Koneksi terganggu. Menggunakan data tersimpan jika ada.');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      {/* Alert Announcement Banner if active */}
      {homeConfig.alertActive && homeConfig.alertText && (
        <div style={{
          background: homeConfig.alertBg === 'warning' ? '#fef3c7' : homeConfig.alertBg === 'emerald' ? '#dcfce7' : '#e0f2fe',
          color: homeConfig.alertBg === 'warning' ? '#92400e' : homeConfig.alertBg === 'emerald' ? '#15803d' : '#0369a1',
          padding: '0.6rem 1rem',
          textAlign: 'center',
          fontSize: '0.85rem',
          fontWeight: 600,
          borderBottom: '1px solid rgba(0,0,0,0.05)'
        }}>
          {homeConfig.alertText}
        </div>
      )}

      {/* Hero Section */}
      <header className="hero hero-enhanced">
        <div className="hero-background-overlay"></div>
        
        <div className="container hero-content fade-in">
          <div className="hero-badge">
            <Compass size={14} color="#38bdf8" />
            <span>{homeConfig.heroBadge}</span>
          </div>

          <h1 className="hero-title">
            {homeConfig.heroTitle}
          </h1>

          <p className="hero-subtitle">
            {homeConfig.heroSubtitle}
          </p>
          
          {/* Main Search Bar */}
          <form className="search-form glass-panel-hero" onSubmit={handleSearch}>
            <div className="input-group">
              <Search className="input-icon" size={18} />
              <input 
                type="text" 
                placeholder="Apa yang ingin Anda jelajahi? (misal: Wisata budaya keluarga di Balige)" 
                value={query}
                onChange={(e) => setQuery(e.target.value)}
              />
            </div>

            <div className="input-group location">
              <Map className="input-icon" size={18} />
              <select value={kecamatan} onChange={(e) => setKecamatan(e.target.value)}>
                <option value="">Semua Kecamatan</option>
                <option value="Ajibata">Ajibata</option>
                <option value="Baktiraja">Baktiraja</option>
                <option value="Balige">Balige</option>
                <option value="Berastagi">Berastagi</option>
                <option value="Doloksanggul">Doloksanggul</option>
                <option value="Girsang Sipangan Bolon">Girsang Sipangan Bolon</option>
                <option value="Harian">Harian</option>
                <option value="Laguboti">Laguboti</option>
                <option value="Lumban Julu">Lumban Julu</option>
                <option value="Muara">Muara</option>
                <option value="Onan Runggu">Onan Runggu</option>
                <option value="Pangururan">Pangururan</option>
                <option value="Parapat">Parapat</option>
                <option value="Porsea">Porsea</option>
                <option value="Ronggur Nihuta">Ronggur Nihuta</option>
                <option value="Salak">Salak</option>
                <option value="Sianjur Mulamula">Sianjur Mulamula</option>
                <option value="Sidikalang">Sidikalang</option>
                <option value="Silaen">Silaen</option>
                <option value="Silahisabungan">Silahisabungan</option>
                <option value="Simanindo">Simanindo</option>
                <option value="Tampahan">Tampahan</option>
                <option value="Tarutung">Tarutung</option>
                <option value="Toba">Toba</option>
              </select>
            </div>

            <button type="submit" className="btn-primary btn-hero-submit" disabled={loading}>
              {loading ? (
                <div className="spinner"></div>
              ) : (
                <>
                  <Sparkles size={16} />
                  <span>Cari Rute</span>
                </>
              )}
            </button>
          </form>

          {/* Quick Suggestion Tags */}
          <div className="hero-quick-tags">
            <span className="quick-tag-label"><Compass size={14} /> Inspirasi Cepat:</span>
            <div className="tags-wrapper">
              {POPULAR_TAGS.map((tag, idx) => (
                <button key={idx} className="tag-pill" onClick={() => handleSearch(null, tag.query)}>
                  {tag.label}
                </button>
              ))}
            </div>
          </div>

          {/* Recent Search History Chips if available */}
          {recentSearches.length > 0 && (
            <div className="hero-recent-history fade-in">
              <span className="recent-history-label"><Clock size={13} /> Terakhir Dicari:</span>
              <div className="recent-chips-wrapper">
                {recentSearches.map((item) => (
                  <button key={item.id} className="recent-chip" onClick={() => handleSearch(null, item.query)}>
                    "{item.query.length > 35 ? item.query.slice(0, 35) + '...' : item.query}"
                  </button>
                ))}
              </div>
            </div>
          )}

          {error && (
            <div className="error-message fade-in">
              <AlertCircle size={18} /> {error}
            </div>
          )}
        </div>
      </header>


      {/* Main Content */}
      <main className="container main-content" id="results-section">
        {loading && (
          <div className="loading-state">
            <div className="skeleton-loading ai-bubble-skeleton"></div>
            <div className="grid">
              <div className="skeleton-loading card-skeleton"></div>
              <div className="skeleton-loading card-skeleton"></div>
              <div className="skeleton-loading card-skeleton"></div>
            </div>
          </div>
        )}

        {/* Results Section */}
        {results && !loading && (
          <div className="results-container fade-in">
            {/* AI Response & Route Map */}
            <section className="ai-response glass-panel">
              <div className="ai-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '0.5rem' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  <Sparkles size={24} color="var(--color-primary)" />
                  <h3 style={{ margin: 0 }}>Saran Perjalanan TobaRoute</h3>
                </div>
                <button 
                  className="btn-secondary" 
                  onClick={(e) => handleSearch(e, null, true)}
                  disabled={loading}
                  style={{ 
                    display: 'inline-flex', 
                    alignItems: 'center', 
                    gap: '0.4rem', 
                    padding: '0.45rem 0.85rem', 
                    borderRadius: '8px', 
                    fontSize: '0.82rem', 
                    fontWeight: 600,
                    cursor: 'pointer',
                    background: '#f0f9ff',
                    color: '#0284c7',
                    border: '1px solid #bae6fd'
                  }}
                >
                  <RotateCw size={14} className={loading ? 'animate-spin' : ''} /> 
                  Cari Opsi Kuliner & Lokasi Lainnya (Opsi #{searchOffset + 1})
                </button>
              </div>
              <div className="ai-body">
                <ReactMarkdown>{results.ai_response}</ReactMarkdown>
              </div>
              
              {/* Route Map */}
              <RouteMap destinasiUtama={results.destinasi_utama} umkmSekitar={results.rekomendasi_umkm_sekitar} />
            </section>

            {/* Destinations */}
            <section className="destinations-section">
              <div className="section-header">
                <h2>Destinasi Utama</h2>
                <div className="line"></div>
              </div>
              {results.destinasi_utama.length > 0 ? (
                <div className="grid">
                  {results.destinasi_utama.map(dest => (
                    <DestinationCard key={dest.id} dest={dest} isUmkm={false} />
                  ))}
                </div>
              ) : (
                <p className="no-data">Tidak ada destinasi utama yang ditemukan untuk pencarian ini.</p>
              )}
            </section>

            {/* UMKM */}
            <section className="umkm-section">
              <div className="section-header">
                <h2>Dukung UMKM Lokal Sekitar</h2>
                <div className="line line-accent"></div>
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

        {/* Feature Highlights Section */}
        {!results && !loading && (
          <section className="features-highlight-section fade-in">
            <div className="section-title-center">
              <h2>Keunggulan Platform TobaRoute AI</h2>
              <p>Sistem navigasi cerdas yang menggabungkan kecerdasan buatan dan prinsip keadilan ekonomi lokal.</p>
            </div>

            <div className="features-grid">
              <div className="feature-card">
                <div className="feature-icon icon-blue">
                  <Sparkles size={28} />
                </div>
                <h3>RAG Semantik & LLM Gemini</h3>
                <p>Memahami keinginan perjalanan wisatawan berdasarkan makna, preferensi keluarga, dan konteks lokasi.</p>
              </div>

              <div className="feature-card">
                <div className="feature-icon icon-green">
                  <Store size={28} />
                </div>
                <h3>Fairness Engine UMKM</h3>
                <p>Memberikan panggung yang adil bagi pengrajin Ulos, warung kuliner lokal, dan hidden gems berulasan awal.</p>
              </div>

              <div className="feature-card">
                <div className="feature-icon icon-purple">
                  <Route size={28} />
                </div>
                <h3>Navigasi Rute Jalan Real</h3>
                <p>Perhitungan rute geografis interaktif yang mengikuti jalan raya Danau Toba menggunakan Leaflet Routing.</p>
              </div>

              <div className="feature-card">
                <div className="feature-icon icon-amber">
                  <ShieldCheck size={28} />
                </div>
                <h3>Transportasi Terintegrasi</h3>
                <p>Informasi rute angkutan umum lokal, kapal feri penyeberangan pulau, dan titik pelabuhan pariwisata.</p>
              </div>
            </div>

            {/* Stats Banner */}
            <div className="stats-banner glass-panel">
              <div className="stat-item">
                <span className="stat-number">713+</span>
                <span className="stat-label">Entitas Wisata & UMKM</span>
              </div>
              <div className="stat-divider"></div>
              <div className="stat-item">
                <span className="stat-number">24</span>
                <span className="stat-label">Kecamatan Strategis</span>
              </div>
              <div className="stat-divider"></div>
              <div className="stat-item">
                <span className="stat-number">100%</span>
                <span className="stat-label">Presisi RAG Semantik</span>
              </div>
              <div className="stat-divider"></div>
              <div className="stat-item">
                <span className="stat-number">24/7</span>
                <span className="stat-label">Asisten Pemandu Cerdas</span>
              </div>
            </div>
          </section>
        )}
      </main>
    </>
  );
};

export default Home;

