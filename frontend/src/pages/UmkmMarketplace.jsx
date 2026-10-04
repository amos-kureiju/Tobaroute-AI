// ====================================================================================================
// FILE: frontend/src/pages/UmkmMarketplace.jsx
// TUJUAN: Halaman Direktori Keadilan UMKM Lokal Kawasan Danau Toba & Ensiklopedia Gastronomi Batak.
// ====================================================================================================

import React, { useState, useEffect } from 'react';
import { 
  Store, Utensils, Award, MapPin, Search, Sparkles, 
  Coffee, ShieldCheck, Heart, ShoppingBag, Flame, BookOpen, ArrowRight, AlertCircle, RefreshCw
} from 'lucide-react';
import { getDestinations } from '../services/api';
import DestinationCard from '../components/DestinationCard';

const GASTRONOMY_HEROES = [
  {
    nama: 'Dekke Naaniura',
    sub: 'Sashimi Tradisional Batak',
    desc: 'Ikan mas segar yang dimatangkan dingin dengan rendaman asam jeruk jungga alami dan rempah andaliman tanpa api.',
    icon: <Sparkles size={22} color="#0284c7" />,
    lokasi: 'Balige, Samosir, & Muara'
  },
  {
    nama: 'Mie Gomak Andaliman',
    sub: 'Pasta Khas Tanah Batak',
    desc: 'Mie lidi kenyal berkuah santan kuning kaya andaliman yang memberikan sensasi pedas getir hangat yang khas.',
    icon: <Flame size={22} color="#ea580c" />,
    lokasi: 'Balige, Porsea, & Laguboti'
  },
  {
    nama: 'Ikan Mas Naniarsik',
    sub: 'Mahakarya Masakan Kuning',
    desc: 'Ikan mas berbumbu rempah andaliman, lokio (bawang batak), kecombrang, dan asam cikala yang dimasak hingga bumbu meresap kering.',
    icon: <Utensils size={22} color="#d97706" />,
    lokasi: 'Seluruh Kawasan Danau Toba'
  },
  {
    nama: 'Kue Ombusombus',
    sub: 'Kudapan Tradisional Manis Hangat',
    desc: 'Tepung beras ketan, parutan kelapa muda, dan gula aren merah cair yang dikukus berbalut daun pisang.',
    icon: <ShoppingBag size={22} color="#16a34a" />,
    lokasi: 'Siborongborong & Balige'
  },
  {
    nama: 'Kopi Arabika Lintong',
    sub: 'Kopi Legendaris Dataran Tinggi',
    desc: 'Kopi single origin aroma rempah herba (spicy), body tebal, cokelat hitam, dan floral eksotis dari Humbang Hasundutan.',
    icon: <Coffee size={22} color="#8b5cf6" />,
    lokasi: 'Lintong Nihuta & Doloksanggul'
  }
];

const UmkmMarketplace = () => {
  const [destinations, setDestinations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [selectedKecamatan, setSelectedKecamatan] = useState('');

  useEffect(() => {
    fetchUmkmData();
  }, [selectedKecamatan]);

  const fetchUmkmData = async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await getDestinations(selectedKecamatan, 1000);
      const umkmOnly = data.filter(d => {
        const cat = (d.kategori || '').toLowerCase();
        return cat.includes('kuliner') || cat.includes('umkm') || cat.includes('makan') || cat.includes('oleh') || cat.includes('ulos') || cat.includes('tenun') || cat.includes('kopi') || cat.includes('penginapan');
      });

      // Urutkan cerdas: Prioritaskan Sentra Tenun Ulos & Kerajinan (UMKM asli), lalu Kuliner, lalu Homestay
      umkmOnly.sort((a, b) => {
        const catA = (a.kategori || '').toLowerCase();
        const catB = (b.kategori || '').toLowerCase();
        const rank = (c) => (c === 'umkm' ? 1 : c === 'kuliner' ? 2 : 3);
        if (rank(catA) !== rank(catB)) {
          return rank(catA) - rank(catB);
        }
        return (b.rating || 0) - (a.rating || 0);
      });

      setDestinations(umkmOnly);
    } catch (e) {
      console.error("Error fetching UMKM marketplace data:", e);
      setError("Gagal terhubung ke server backend TobaRoute. Pastikan server backend FastAPI aktif.");
    } finally {
      setLoading(false);
    }
  };

  const categoryCounts = {
    all: destinations.length,
    umkm: destinations.filter(d => {
      const c = (d.kategori || '').toLowerCase();
      return c.includes('umkm') || c.includes('ulos') || c.includes('tenun') || c.includes('kerajinan') || c.includes('oleh');
    }).length,
    kuliner: destinations.filter(d => {
      const c = (d.kategori || '').toLowerCase();
      return c.includes('kuliner') || c.includes('makan') || c.includes('resto') || c.includes('kopi');
    }).length,
    penginapan: destinations.filter(d => {
      const c = (d.kategori || '').toLowerCase();
      return c.includes('penginapan') || c.includes('hotel') || c.includes('homestay');
    }).length,
  };

  const filteredItems = destinations.filter(item => {
    const matchQuery = !searchQuery || 
      (item.nama || '').toLowerCase().includes(searchQuery.toLowerCase()) || 
      (item.deskripsi_singkat || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
      (item.kecamatan || '').toLowerCase().includes(searchQuery.toLowerCase());

    const cat = (item.kategori || '').toLowerCase();
    let matchCat = true;
    if (selectedCategory === 'kuliner') {
      matchCat = cat.includes('kuliner') || cat.includes('makan') || cat.includes('resto') || cat.includes('kopi');
    } else if (selectedCategory === 'umkm') {
      matchCat = cat.includes('umkm') || cat.includes('oleh') || cat.includes('ulos') || cat.includes('tenun') || cat.includes('kerajinan');
    } else if (selectedCategory === 'penginapan') {
      matchCat = cat.includes('penginapan') || cat.includes('hotel') || cat.includes('homestay');
    }

    return matchQuery && matchCat;
  });

  return (
    <div className="umkm-page-container fade-in" style={{ padding: '2.5rem 0 4.5rem 0' }}>
      <div className="container">
        
        {/* Header Etalase UMKM */}
        <div style={{ textAlign: 'center', maxWidth: '820px', margin: '0 auto 2.5rem auto' }}>
          <span className="section-pill-tag green" style={{ marginBottom: '0.65rem' }}>
            <ShieldCheck size={13} /> Direktori Keadilan Ekonomi UMKM & Kuliner Lokal
          </span>
          <h1 style={{ fontSize: '2.25rem', fontWeight: 800, color: '#0f172a', letterSpacing: '-0.025em', margin: '0 0 0.65rem 0' }}>
            Sentra UMKM & Gastronomi Danau Toba
          </h1>
          <p style={{ fontSize: '0.98rem', color: '#64748b', lineHeight: 1.6, margin: 0 }}>
            Koleksi lengkap 243 entitas ekonomi lokal: <strong>11 Sentra Tenun Ulos & Kerajinan Tangan</strong>, <strong>186 Kedai Kuliner & Kopi Tradisional</strong>, dan <strong>46 Homestay Warga</strong> di 8 kabupaten lingkar Danau Toba.
          </p>
        </div>

        {/* Section 1: Ensiklopedia Gastronomi Batak */}
        <section style={{ marginBottom: '3rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1.15rem' }}>
            <Utensils size={18} color="#0284c7" />
            <h2 style={{ fontSize: '1.2rem', fontWeight: 800, color: '#0f172a', margin: 0 }}>
              5 Kuliner Ikonik Warisan Budaya Batak
            </h2>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(210px, 1fr))', gap: '1rem' }}>
            {GASTRONOMY_HEROES.map((g, idx) => (
              <div 
                key={idx} 
                className="card" 
                style={{ padding: '1.15rem', borderRadius: '16px', background: '#ffffff', display: 'flex', flexDirection: 'column' }}
              >
                <div style={{ width: '42px', height: '42px', borderRadius: '10px', background: '#f8fafc', border: '1px solid #e2e8f0', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '0.65rem' }}>
                  {g.icon}
                </div>
                <h3 style={{ fontSize: '0.98rem', fontWeight: 800, color: '#0f172a', margin: '0 0 0.15rem 0' }}>{g.nama}</h3>
                <span style={{ fontSize: '0.7rem', fontWeight: 700, color: '#0284c7', display: 'block', marginBottom: '0.35rem', textTransform: 'uppercase', letterSpacing: '0.02em' }}>{g.sub}</span>
                <p style={{ fontSize: '0.78rem', color: '#64748b', lineHeight: 1.5, margin: '0 0 0.75rem 0', flex: 1 }}>{g.desc}</p>
                <div style={{ fontSize: '0.72rem', color: '#166534', fontWeight: 700, background: '#dcfce7', padding: '0.2rem 0.5rem', borderRadius: '6px', width: 'fit-content' }}>
                  <MapPin size={11} style={{ display: 'inline', marginRight: '3px' }} /> {g.lokasi}
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* Section 2: Filter & Search Bar */}
        <div className="card" style={{ padding: '1.15rem 1.35rem', marginBottom: '2rem', background: '#ffffff', borderRadius: '16px' }}>
          <div style={{ display: 'grid', gridTemplateColumns: '1.4fr 1fr auto', gap: '0.85rem', alignItems: 'center' }}>
            
            <div style={{ position: 'relative' }}>
              <Search size={16} style={{ position: 'absolute', left: '1rem', top: '50%', transform: 'translateY(-50%)', color: '#94a3b8' }} />
              <input
                type="text"
                placeholder="Cari warung, ulos, kerajinan, atau kopi..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                style={{ height: '42px', paddingLeft: '2.5rem', paddingRight: '1rem' }}
              />
            </div>

            <div>
              <select
                value={selectedKecamatan}
                onChange={(e) => setSelectedKecamatan(e.target.value)}
                style={{ height: '42px' }}
              >
                <option value="">Semua Kecamatan Lingkar Toba</option>
                <option value="Balige">Balige</option>
                <option value="Laguboti">Laguboti</option>
                <option value="Porsea">Porsea</option>
                <option value="Tampahan">Tampahan (Desa Meat)</option>
                <option value="Parapat">Parapat</option>
                <option value="Pangururan">Pangururan</option>
                <option value="Simanindo">Simanindo (Tomok)</option>
                <option value="Muara">Muara</option>
                <option value="Baktiraja">Baktiraja</option>
                <option value="Doloksanggul">Doloksanggul (Lintong)</option>
                <option value="Tarutung">Tarutung</option>
              </select>
            </div>

            {/* Filter Tabs dengan Counter Dinamis */}
            <div style={{ display: 'flex', gap: '0.4rem', flexWrap: 'wrap' }}>
              {[
                { id: 'all', label: 'Semua', count: categoryCounts.all },
                { id: 'umkm', label: '🧵 Tenun Ulos', count: categoryCounts.umkm },
                { id: 'kuliner', label: '🍲 Kuliner Batak', count: categoryCounts.kuliner },
                { id: 'penginapan', label: '🏡 Homestay', count: categoryCounts.penginapan }
              ].map(cat => (
                <button
                  key={cat.id}
                  className={`btn-secondary${selectedCategory === cat.id ? ' active' : ''}`}
                  onClick={() => setSelectedCategory(cat.id)}
                  style={{
                    height: '42px',
                    padding: '0 0.85rem',
                    fontSize: '0.8rem',
                    borderRadius: '8px',
                    background: selectedCategory === cat.id ? '#0284c7' : '#f8fafc',
                    color: selectedCategory === cat.id ? '#ffffff' : '#475569',
                    borderColor: selectedCategory === cat.id ? '#0284c7' : '#cbd5e1',
                    fontWeight: selectedCategory === cat.id ? 700 : 600,
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '0.35rem',
                    cursor: 'pointer'
                  }}
                >
                  <span>{cat.label}</span>
                  <span style={{
                    fontSize: '0.7rem',
                    padding: '0.1rem 0.4rem',
                    borderRadius: '999px',
                    background: selectedCategory === cat.id ? 'rgba(255,255,255,0.25)' : '#e2e8f0',
                    color: selectedCategory === cat.id ? '#ffffff' : '#64748b',
                    fontWeight: 700
                  }}>
                    {cat.count}
                  </span>
                </button>
              ))}
            </div>

          </div>
        </div>

        {/* Section 3: Grid Kartu UMKM */}
        {loading ? (
          <div className="grid">
            {[1, 2, 3, 4].map(i => <div key={i} className="skeleton-loading card-skeleton" />)}
          </div>
        ) : error ? (
          <div className="card" style={{ textAlign: 'center', padding: '3rem 1.5rem', background: '#fff1f2', borderRadius: '16px', border: '1px solid #fecdd3' }}>
            <AlertCircle size={44} color="#e11d48" style={{ marginBottom: '1rem', display: 'inline-block' }} />
            <h3 style={{ fontSize: '1.15rem', color: '#9f1239', margin: '0 0 0.5rem 0' }}>Gagal Memuat Data UMKM</h3>
            <p style={{ color: '#be123c', fontSize: '0.88rem', margin: '0 0 1.25rem 0', maxWidth: '480px', marginLeft: 'auto', marginRight: 'auto' }}>
              {error}
            </p>
            <button 
              className="btn-primary" 
              onClick={fetchUmkmData}
              style={{ display: 'inline-flex', alignItems: 'center', gap: '0.5rem', padding: '0.65rem 1.5rem', borderRadius: '10px', fontSize: '0.9rem', cursor: 'pointer' }}
            >
              <RefreshCw size={15} /> Coba Muat Ulang
            </button>
          </div>
        ) : filteredItems.length > 0 ? (
          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.15rem', background: '#f8fafc', padding: '0.75rem 1.15rem', borderRadius: '12px', border: '1px solid #e2e8f0', flexWrap: 'wrap', gap: '0.5rem' }}>
              <span style={{ fontSize: '0.88rem', color: '#334155', fontWeight: 600 }}>
                {selectedCategory === 'all' && (
                  <>Menampilkan total <strong>{filteredItems.length}</strong> entitas ekonomi lokal (<strong>{categoryCounts.umkm}</strong> Sentra Tenun & Kerajinan, <strong>{categoryCounts.kuliner}</strong> Kuliner Batak, <strong>{categoryCounts.penginapan}</strong> Homestay Warga)</>
                )}
                {selectedCategory === 'umkm' && (
                  <>Menampilkan <strong>{filteredItems.length}</strong> Sentra Tenun Ulos Tradisional & Kerajinan Tangan UMKM terverifikasi</>
                )}
                {selectedCategory === 'kuliner' && (
                  <>Menampilkan <strong>{filteredItems.length}</strong> Warung Kuliner Tradisional Batak & Kedai Kopi Lintong Danau Toba</>
                )}
                {selectedCategory === 'penginapan' && (
                  <>Menampilkan <strong>{filteredItems.length}</strong> Homestay & Penginapan Ramah Warga Lokal</>
                )}
              </span>
              <span style={{ fontSize: '0.75rem', color: '#0284c7', fontWeight: 700, background: '#e0f2fe', padding: '0.25rem 0.65rem', borderRadius: '6px' }}>
                Dataset: 491 Destinasi Toba
              </span>
            </div>

            <div className="grid">
              {filteredItems.map(dest => (
                <DestinationCard key={dest.id} dest={dest} isUmkm={true} />
              ))}
            </div>
          </div>
        ) : (
          <div className="card" style={{ textAlign: 'center', padding: '3.5rem 1.5rem', background: '#ffffff', borderRadius: '16px' }}>
            <Store size={44} color="#94a3b8" style={{ marginBottom: '1rem' }} />
            <h3 style={{ fontSize: '1.15rem', color: '#0f172a', margin: '0 0 0.35rem 0' }}>Tidak ada UMKM yang cocok dengan pencarian</h3>
            <p style={{ color: '#64748b', fontSize: '0.88rem', margin: 0 }}>Coba ubah kata kunci atau pilih opsi kecamatan yang berbeda.</p>
          </div>
        )}

      </div>
    </div>
  );
};

export default UmkmMarketplace;
