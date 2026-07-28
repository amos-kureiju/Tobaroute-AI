import React, { useState } from 'react';
import { Save, Image, RefreshCw, Eye, CheckCircle2 } from 'lucide-react';
import './Admin.css';

const AdminContent = () => {
  const [heroTitle, setHeroTitle] = useState('Temukan Keindahan Danau Toba');
  const [heroSubtitle, setHeroSubtitle] = useState('Sistem rekomendasi berbasis kecerdasan data yang merancang rute perjalanan presisi, destinasi populer, serta memajukan ekonomi pelaku UMKM lokal.');
  const [heroBadge, setHeroBadge] = useState('Platform Navigasi & Keadilan Pariwisata Danau Toba');
  const [saved, setSaved] = useState(false);

  const handleSave = (e) => {
    e.preventDefault();
    setSaved(true);
    setTimeout(() => setSaved(false), 2500);
  };

  return (
    <div className="fade-in">
      <div className="card-title-row" style={{ marginBottom: '1.5rem' }}>
        <div>
          <h1 style={{ fontSize: '1.5rem', color: 'var(--admin-sidebar-bg)', margin: 0 }}>Manajemen Konten Beranda</h1>
          <p style={{ color: '#64748b', fontSize: '0.9rem', margin: '0.2rem 0 0 0' }}>Konfigurasi teks hero, banner, dan pesan utama platform TobaRoute AI.</p>
        </div>
        
        {saved && (
          <div style={{ background: '#dcfce7', color: '#15803d', padding: '0.4rem 0.85rem', borderRadius: '6px', fontSize: '0.85rem', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
            <CheckCircle2 size={16} /> Perubahan Disimpan!
          </div>
        )}
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1.8fr 1fr', gap: '1.5rem' }}>
        {/* Left Form Panel */}
        <div style={{ background: 'white', padding: '1.5rem', borderRadius: '12px', border: '1px solid var(--admin-border)' }}>
          <form onSubmit={handleSave}>
            <div className="form-group-admin">
              <label>TEXT BADGE HERO</label>
              <input 
                type="text" 
                value={heroBadge} 
                onChange={(e) => setHeroBadge(e.target.value)} 
              />
            </div>

            <div className="form-group-admin">
              <label>JUDUL UTAMA HERO</label>
              <input 
                type="text" 
                value={heroTitle} 
                onChange={(e) => setHeroTitle(e.target.value)} 
              />
            </div>

            <div className="form-group-admin">
              <label>SUBJUDUL HERO</label>
              <textarea 
                rows="4" 
                value={heroSubtitle} 
                onChange={(e) => setHeroSubtitle(e.target.value)}
                style={{ width: '100%', padding: '0.75rem', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '0.95rem', outline: 'none', fontFamily: 'inherit' }}
              />
            </div>

            <button type="submit" className="btn-admin-save" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', width: '100%', justifyContent: 'center', height: '44px' }}>
              <Save size={18} />
              <span>Perbarui Konten Beranda</span>
            </button>
          </form>
        </div>

        {/* Right Live Preview Box */}
        <div style={{ background: 'white', padding: '1.5rem', borderRadius: '12px', border: '1px solid var(--admin-border)', display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.85rem', fontWeight: 'bold', color: '#0369a1', marginBottom: '1rem' }}>
              <Eye size={16} /> PRATINJAU LANGSUNG
            </div>

            <div style={{ background: 'linear-gradient(135deg, #072a4a 0%, #0369a1 100%)', padding: '1.5rem', borderRadius: '12px', color: 'white', textCenter: 'center' }}>
              <div style={{ background: 'rgba(255,255,255,0.15)', fontSize: '0.7rem', padding: '0.2rem 0.5rem', borderRadius: '12px', display: 'inline-block', marginBottom: '0.75rem' }}>
                {heroBadge}
              </div>
              <h3 style={{ fontSize: '1.2rem', margin: '0 0 0.5rem 0', color: 'white' }}>{heroTitle}</h3>
              <p style={{ fontSize: '0.78rem', opacity: 0.85, lineHeight: 1.4, margin: 0 }}>{heroSubtitle}</p>
            </div>
          </div>

          <div style={{ fontSize: '0.78rem', color: '#94a3b8', marginTop: '1.5rem' }}>
            Terakhir diubah oleh Admin Portal (Superuser) pada {new Date().toLocaleTimeString()}
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminContent;
