import React, { useState, useEffect } from 'react';
import { Save, Image, RefreshCw, Eye, CheckCircle2, Sparkles, Tag, AlertTriangle, Layers, Layout, HelpCircle } from 'lucide-react';
import './Admin.css';

const AdminContent = () => {
  // Config States
  const [heroBadge, setHeroBadge] = useState('Platform Navigasi & Keadilan Pariwisata Danau Toba');
  const [heroTitle, setHeroTitle] = useState('Temukan Keindahan Danau Toba');
  const [heroSubtitle, setHeroSubtitle] = useState('Sistem rekomendasi berbasis kecerdasan data yang merancang rute perjalanan presisi, destinasi populer, serta memajukan ekonomi pelaku UMKM lokal.');
  const [tagsInput, setTagsInput] = useState('Wisata Alam Balige, Kuliner Khas Batak, Sentra UMKM Ulos, Transportasi Feri & Angkot');
  
  // Banner Announcement Config
  const [alertActive, setAlertActive] = useState(false);
  const [alertText, setAlertText] = useState('Info: Penyeberangan Kapal Feri Pelabuhan Ajibata - Tomok beroperasi normal setiap 1 jam.');
  const [alertBg, setAlertBg] = useState('info'); // 'info' | 'warning' | 'emerald'

  // Saved Feedback
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    // Load config from localStorage if available
    const savedConfig = localStorage.getItem('tobaguide_home_content_config');
    if (savedConfig) {
      try {
        const parsed = JSON.parse(savedConfig);
        if (parsed.heroBadge) setHeroBadge(parsed.heroBadge);
        if (parsed.heroTitle) setHeroTitle(parsed.heroTitle);
        if (parsed.heroSubtitle) setHeroSubtitle(parsed.heroSubtitle);
        if (parsed.tagsInput) setTagsInput(parsed.tagsInput);
        if (parsed.alertActive !== undefined) setAlertActive(parsed.alertActive);
        if (parsed.alertText) setAlertText(parsed.alertText);
        if (parsed.alertBg) setAlertBg(parsed.alertBg);
      } catch (e) {
        console.error('Error parsing home config:', e);
      }
    }
  }, []);

  const handleSave = (e) => {
    e.preventDefault();
    const configData = {
      heroBadge,
      heroTitle,
      heroSubtitle,
      tagsInput,
      alertActive,
      alertText,
      alertBg,
      lastUpdated: new Date().toISOString()
    };
    
    localStorage.setItem('tobaguide_home_content_config', JSON.stringify(configData));
    setSaved(true);
    setTimeout(() => setSaved(false), 3000);
  };

  const parsedTags = tagsInput.split(',').map(t => t.trim()).filter(Boolean);

  return (
    <div className="fade-in">
      <div className="card-title-row" style={{ marginBottom: '1.5rem' }}>
        <div>
          <h1 style={{ fontSize: '1.5rem', color: 'var(--admin-sidebar-bg)', margin: 0, display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
            <Layout size={26} color="#0284c7" /> Manajemen Konten Beranda & Pengumuman
          </h1>
          <p style={{ color: '#64748b', fontSize: '0.9rem', margin: '0.2rem 0 0 0' }}>
            Kelola teks hero, tag inspirasi cepat, banner pengumuman aktif, dan pratinjau langsung tampilan Beranda wisatawan.
          </p>
        </div>

        {saved && (
          <div style={{ background: '#dcfce7', color: '#15803d', padding: '0.5rem 1rem', borderRadius: '8px', fontSize: '0.85rem', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <CheckCircle2 size={18} /> Konten Beranda Berhasil Diperbarui!
          </div>
        )}
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1.7fr 1.3fr', gap: '1.5rem' }}>
        {/* Left Form Panel */}
        <div style={{ background: 'white', padding: '1.5rem', borderRadius: '12px', border: '1px solid var(--admin-border)' }}>
          <form onSubmit={handleSave}>
            <h3 style={{ fontSize: '1.05rem', color: '#0f172a', marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <Sparkles size={18} color="#0284c7" /> Konfigurasi Teks Hero Banner
            </h3>

            <div className="form-group-admin">
              <label>TEXT BADGE HERO</label>
              <input 
                type="text" 
                value={heroBadge} 
                onChange={(e) => setHeroBadge(e.target.value)} 
                required
              />
            </div>

            <div className="form-group-admin">
              <label>JUDUL UTAMA HERO</label>
              <input 
                type="text" 
                value={heroTitle} 
                onChange={(e) => setHeroTitle(e.target.value)} 
                required
              />
            </div>

            <div className="form-group-admin">
              <label>SUBJUDUL / PENJELASAN HERO</label>
              <textarea 
                rows="3" 
                value={heroSubtitle} 
                onChange={(e) => setHeroSubtitle(e.target.value)}
                style={{ width: '100%', padding: '0.75rem', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '0.95rem', outline: 'none', fontFamily: 'inherit' }}
                required
              />
            </div>

            <div className="form-group-admin">
              <label>TAG INSPIRASI PENCARIAN CEPAT (Pisahkan dengan Koma)</label>
              <input 
                type="text" 
                value={tagsInput} 
                onChange={(e) => setTagsInput(e.target.value)} 
                placeholder="Wisata Alam Balige, Kuliner Khas Batak, Sentra UMKM Ulos, Transportasi Feri"
              />
            </div>

            <h3 style={{ fontSize: '1.05rem', color: '#0f172a', marginTop: '1.8rem', marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <AlertTriangle size={18} color="#b45309" /> Banner Pengumuman & Alert Pengunjung
            </h3>

            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '1rem', background: '#f8fafc', padding: '0.75rem 1rem', borderRadius: '8px', border: '1px solid #e2e8f0' }}>
              <input 
                type="checkbox" 
                id="alertActive"
                checked={alertActive}
                onChange={(e) => setAlertActive(e.target.checked)}
                style={{ width: '18px', height: '18px', cursor: 'pointer' }}
              />
              <label htmlFor="alertActive" style={{ margin: 0, fontWeight: 600, color: '#0f172a', cursor: 'pointer', textTransform: 'none' }}>
                Aktifkan Banner Pengumuman di Atas Beranda
              </label>
            </div>

            {alertActive && (
              <>
                <div className="form-group-admin">
                  <label>TEKS PENGUMUMAN ALERTLINE</label>
                  <input 
                    type="text" 
                    value={alertText}
                    onChange={(e) => setAlertText(e.target.value)}
                    placeholder="Info jadwal penyeberangan kapal feri..."
                  />
                </div>

                <div className="form-group-admin">
                  <label>TEMA WARNA BANNER</label>
                  <select value={alertBg} onChange={(e) => setAlertBg(e.target.value)}>
                    <option value="info">Info Biru Muda (#e0f2fe)</option>
                    <option value="warning">Peringatan Kuning/Kuning Emas (#fef3c7)</option>
                    <option value="emerald">Pengumuman Hijau Emerald (#dcfce7)</option>
                  </select>
                </div>
              </>
            )}

            <button type="submit" className="btn-admin-save" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', width: '100%', justifyContent: 'center', height: '46px', marginTop: '1.5rem', fontSize: '0.95rem' }}>
              <Save size={18} />
              <span>Simpan & Terapkan Perubahan Beranda</span>
            </button>
          </form>
        </div>

        {/* Right Live Preview Box */}
        <div style={{ background: 'white', padding: '1.5rem', borderRadius: '12px', border: '1px solid var(--admin-border)', display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.85rem', fontWeight: 'bold', color: '#0369a1', marginBottom: '1.2rem' }}>
              <Eye size={18} /> PRATINJAU LANGSUNG HERO BERANDA
            </div>

            {/* Live Render Card */}
            <div style={{ background: 'linear-gradient(135deg, #072a4a 0%, #0369a1 100%)', padding: '1.8rem 1.2rem', borderRadius: '14px', color: 'white', textAlign: 'center', boxShadow: '0 10px 25px rgba(0,0,0,0.15)' }}>
              {alertActive && (
                <div style={{ 
                  background: alertBg === 'warning' ? '#fef3c7' : alertBg === 'emerald' ? '#dcfce7' : '#e0f2fe',
                  color: alertBg === 'warning' ? '#92400e' : alertBg === 'emerald' ? '#15803d' : '#0369a1',
                  padding: '0.4rem 0.8rem',
                  borderRadius: '20px',
                  fontSize: '0.75rem',
                  fontWeight: 600,
                  marginBottom: '1rem',
                  display: 'inline-block'
                }}>
                  📢 {alertText}
                </div>
              )}

              <div style={{ background: 'rgba(255,255,255,0.15)', fontSize: '0.72rem', padding: '0.25rem 0.75rem', borderRadius: '14px', display: 'inline-block', marginBottom: '0.85rem', fontWeight: 600, letterSpacing: '0.5px' }}>
                {heroBadge}
              </div>

              <h2 style={{ fontSize: '1.4rem', margin: '0 0 0.6rem 0', color: 'white', fontWeight: 800 }}>{heroTitle}</h2>
              <p style={{ fontSize: '0.8rem', opacity: 0.9, lineHeight: 1.5, margin: '0 auto 1.2rem auto', maxWidth: '90%' }}>{heroSubtitle}</p>

              {/* Tags Preview */}
              <div style={{ display: 'flex', gap: '0.4rem', justifyContent: 'center', flexWrap: 'wrap' }}>
                {parsedTags.map((tag, idx) => (
                  <span key={idx} style={{ background: 'rgba(255,255,255,0.2)', fontSize: '0.7rem', padding: '0.2rem 0.6rem', borderRadius: '12px' }}>
                    {tag}
                  </span>
                ))}
              </div>
            </div>
          </div>

          <div style={{ fontSize: '0.78rem', color: '#94a3b8', marginTop: '1.5rem', borderTop: '1px solid #f1f5f9', paddingTop: '1rem' }}>
            🔄 Pratinjau diperbarui secara real-time saat Anda mengetik. Klik <strong>Simpan</strong> untuk menerapkan ke pengunjung web.
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminContent;
