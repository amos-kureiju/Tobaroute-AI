// ====================================================================================================
// FILE: frontend/src/pages/UmkmMarketplace.jsx
// TUJUAN: Halaman Direktori Keadilan UMKM Lokal Kawasan Danau Toba & Ensiklopedia Gastronomi Batak.
// ====================================================================================================

import React, { useState, useEffect } from 'react';
import { 
  Store, Utensils, Award, MapPin, Search, Sparkles, 
  Coffee, ShieldCheck, Heart, ShoppingBag, Flame, BookOpen
} from 'lucide-react';
import { getDestinations } from '../services/api';
import DestinationCard from '../components/DestinationCard';

const GASTRONOMY_HEROES = [
  {
    nama: 'Dekke Naaniura',
    sub: 'Sashimi Tradisional Batak',
    desc: 'Ikan mas segar yang dimatangkan dingin dengan rendaman asam jeruk jungga alami dan rempah andaliman tanpa api.',
    icon: <Sparkles size={22} color="#0071CE" />,
    lokasi: 'Balige, Samosir, & Muara'
  },
  {
    nama: 'Mie Gomak Andaliman',
    sub: 'Pasta Khas Tanah Batak',
    desc: 'Mie lidi kenyal berkuah santan kuning kaya andaliman yang memberikan sensasi pedas getir hangat yang khas.',
    icon: <Flame size={22} color="#EA580C" />,
    lokasi: 'Balige, Porsea, & Laguboti'
  },
  {
    nama: 'Ikan Mas Naniarsik',
    sub: 'Mahakarya Masakan Kuning',
    desc: 'Ikan mas berbumbu rempah andaliman, lokio (bawang batak), kecombrang, dan asam cikala yang dimasak hingga bumbu meresap kering.',
    icon: <Utensils size={22} color="#D97706" />,
    lokasi: 'Seluruh Kawasan Danau Toba'
  },
  {
    nama: 'Kue Ombusombus',
    sub: 'Kudapan Tradisional Manis Hangat',
    desc: 'Tepung beras ketan, parutan kelapa muda, dan gula aren merah cair yang dikukus berbalut daun pisang.',
    icon: <ShoppingBag size={22} color="#00875A" />,
    lokasi: 'Siborongborong & Balige'
  },
  {
    nama: 'Kopi Arabika Lintong',
    sub: 'Kopi Legendaris Dataran Tinggi',
    desc: 'Kopi single origin aroma rempah herba (spicy), body tebal, cokelat hitam, dan floral eksotis dari Humbang Hasundutan.',
    icon: <Coffee size={22} color="#7C3AED" />,
    lokasi: 'Lintong Nihuta & Doloksanggul'
  }
];

const UmkmMarketplace = () => {
  const [destinations, setDestinations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [selectedKecamatan, setSelectedKecamatan] = useState('');

  useEffect(() => {
    fetchUmkmData();
  }, [selectedKecamatan]);

  const fetchUmkmData = async () => {
    setLoading(true);
    try {
      const data = await getDestinations(selectedKecamatan, 1000);
      const umkmOnly = data.filter(d => {
        const cat = (d.kategori || '').toLowerCase();
        return cat.includes('kuliner') || cat.includes('umkm') || cat.includes('makan') || cat.includes('oleh') || cat.includes('ulos') || cat.includes('tenun') || cat.includes('kopi') || cat.includes('penginapan');
      });
      setDestinations(umkmOnly);
    } catch (e) {
      console.error("Error fetching UMKM marketplace data:", e);
    } finally {
      setLoading(false);
    }
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
    <div className="umkm-page-container fade-in" style={{ padding: '3rem 0 5rem 0' }}>
      <div className="container">
        
        {/* Header Etalase UMKM */}
        <div style={{ textAlign: 'center', maxWidth: '780px', margin: '0 auto 3rem auto' }}>
          <span className="badge badge-green" style={{ marginBottom: '0.85rem' }}>
            <ShieldCheck size={13} /> Direktori Keadilan Ekonomi UMKM
          </span>
          <h1 style={{ fontSize: '2.4rem', fontWeight: 800, color: '#0A0F1E', letterSpacing: '-0.025em', margin: '0 0 0.75rem 0' }}>
            Sentra UMKM & Gastronomi Danau Toba
          </h1>
          <p style={{ fontSize: '1rem', color: '#64748B', lineHeight: 1.65 }}>
            Temukan pengrajin tenun Ulos asli, warung kuliner tradisional berempah andaliman, kedai kopi Lintong, dan homestay warga lokal yang menghidupkan pariwisata Danau Toba.
          </p>
        </div>

        {/* Section 1: Ensiklopedia Gastronomi Batak */}
        <section style={{ marginBottom: '3.5rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', marginBottom: '1.25rem' }}>
            <Utensils size={18} color="#0071CE" />
            <h2 style={{ fontSize: '1.25rem', fontWeight: 800, color: '#0A0F1E', margin: 0 }}>
              5 Kuliner Ikonik Warisan Leluhur
            </h2>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(210px, 1fr))', gap: '1rem' }}>
            {GASTRONOMY_HEROES.map((g, idx) => (
              <div 
                key={idx} 
                className="card" 
                style={{ padding: '1.25rem', borderRadius: '16px', background: '#ffffff', display: 'flex', flexDirection: 'column' }}
              >
                <div style={{ width: '42px', height: '42px', borderRadius: '10px', background: '#F8FAFC', border: '1px solid #E2E8F0', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '0.75rem' }}>
                  {g.icon}
                </div>
                <h3 style={{ fontSize: '1rem', fontWeight: 800, color: '#0A0F1E', margin: '0 0 0.2rem 0' }}>{g.nama}</h3>
                <span style={{ fontSize: '0.72rem', fontWeight: 700, color: '#0071CE', display: 'block', marginBottom: '0.4rem', textTransform: 'uppercase', letterSpacing: '0.02em' }}>{g.sub}</span>
                <p style={{ fontSize: '0.8rem', color: '#64748B', lineHeight: 1.5, margin: '0 0 0.85rem 0', flex: 1 }}>{g.desc}</p>
                <div style={{ fontSize: '0.72rem', color: '#00623F', fontWeight: 700, background: '#E6F5EE', padding: '0.25rem 0.5rem', borderRadius: '6px', width: 'fit-content' }}>
                  <MapPin size={11} style={{ display: 'inline', marginRight: '3px' }} /> {g.lokasi}
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* Section 2: Filter & Search Bar */}
        <div className="card" style={{ padding: '1.25rem 1.5rem', marginBottom: '2rem', background: '#ffffff', borderRadius: '16px' }}>
          <div style={{ display: 'grid', gridTemplateColumns: '1.5fr 1fr auto', gap: '1rem', alignItems: 'center' }}>
            
            <div style={{ position: 'relative' }}>
              <Search size={16} style={{ position: 'absolute', left: '1rem', top: '50%', transform: 'translateY(-50%)', color: '#94A3B8' }} />
              <input
                type="text"
                placeholder="Cari nama warung, oleh-oleh, tenun ulos, atau kopi..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                style={{ height: '44px', paddingLeft: '2.5rem', paddingRight: '1rem' }}
              />
            </div>

            <div>
              <select
                value={selectedKecamatan}
                onChange={(e) => setSelectedKecamatan(e.target.value)}
                style={{ height: '44px' }}
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

            {/* Filter Tabs */}
            <div style={{ display: 'flex', gap: '0.35rem' }}>
              {[
                { id: 'all', label: 'Semua' },
                { id: 'kuliner', label: 'Kuliner' },
                { id: 'umkm', label: 'Tenun & Ulos' },
                { id: 'penginapan', label: 'Homestay' }
              ].map(cat => (
                <button
                  key={cat.id}
                  className={`btn-secondary${selectedCategory === cat.id ? ' active' : ''}`}
                  onClick={() => setSelectedCategory(cat.id)}
                  style={{
                    height: '44px',
                    padding: '0 0.95rem',
                    fontSize: '0.82rem',
                    borderRadius: '10px',
                    background: selectedCategory === cat.id ? '#0071CE' : '#F8FAFC',
                    color: selectedCategory === cat.id ? '#ffffff' : '#475569',
                    borderColor: selectedCategory === cat.id ? '#0071CE' : '#E2E8F0'
                  }}
                >
                  {cat.label}
                </button>
              ))}
            </div>

          </div>
        </div>

        {/* Section 3: Grid Kartu UMKM */}
        {loading ? (
          <div className="grid">
            {[1, 2, 3].map(i => <div key={i} className="skeleton-loading card-skeleton" />)}
          </div>
        ) : filteredItems.length > 0 ? (
          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem' }}>
              <span style={{ fontSize: '0.88rem', color: '#64748B', fontWeight: 600 }}>
                Menampilkan <strong>{filteredItems.length}</strong> entitas UMKM & Kuliner terverifikasi
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
            <Store size={44} color="#94A3B8" style={{ marginBottom: '1rem' }} />
            <h3 style={{ fontSize: '1.15rem', color: '#0A0F1E', margin: '0 0 0.35rem 0' }}>Tidak ada UMKM yang cocok dengan pencarian</h3>
            <p style={{ color: '#64748B', fontSize: '0.88rem', margin: 0 }}>Coba ubah kata kunci atau pilih opsi kecamatan yang berbeda.</p>
          </div>
        )}

      </div>
    </div>
  );
};

export default UmkmMarketplace;
