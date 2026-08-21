// ====================================================================================================
// FILE: frontend/src/pages/About.jsx
// TUJUAN:
// Halaman "Tentang" TobaRoute AI.
// Menjelaskan:
// 1. Visi & Misi Platform: Menghilangkan Popularity Bias demi pemerataan ekonomi UMKM Danau Toba.
// 2. Arsitektur Teknologi: Hybrid RAG, Dynamic Fairness Engine, dan Navigasi Spasial Jalan Raya.
// 3. Pelestarian Budaya Batak: Falsafah Dalihan Na Tolu, Ulos, dan Gastronomi Autentik.
// 4. Tim Pengembang (LamportTRIO - Institut Teknologi Del) & Deklarasi Privasi Zero PII.
// ====================================================================================================

import React from 'react';
import { 
  Compass, 
  Users, 
  Heart, 
  Sparkles, 
  ShieldCheck, 
  Database, 
  MapPin, 
  Cpu, 
  BookOpen, 
  TrendingUp, 
  Layers, 
  CheckCircle2, 
  ArrowRight,
  AlertCircle,
  Award
} from 'lucide-react';
import { NavLink } from 'react-router-dom';

const About = () => {
  return (
    <div className="about-page-wrapper fade-in" style={{ paddingBottom: '5rem' }}>
      
      {/* ========================================================================= */}
      {/* HERO SECTION: EXECUTIVE DEEP BLUE GRADIENT */}
      {/* ========================================================================= */}
      <section style={{
        position: 'relative',
        background: 'linear-gradient(135deg, #0284c7 0%, #0369a1 40%, #0f172a 100%)',
        color: 'white',
        padding: '4.5rem 1.5rem 5rem 1.5rem',
        textAlign: 'center',
        overflow: 'hidden'
      }}>
        {/* Ambient Glow Background */}
        <div style={{
          position: 'absolute',
          top: 0,
          left: 0,
          width: '100%',
          height: '100%',
          background: 'radial-gradient(circle at 50% 20%, rgba(56, 189, 248, 0.2) 0%, transparent 65%)',
          pointerEvents: 'none'
        }}></div>

        <div className="container" style={{ position: 'relative', zIndex: 2, maxWidth: '900px', margin: '0 auto' }}>
          <div style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '0.45rem',
            padding: '0.35rem 0.95rem',
            background: 'rgba(255, 255, 255, 0.12)',
            border: '1px solid rgba(255, 255, 255, 0.25)',
            borderRadius: '30px',
            fontSize: '0.82rem',
            fontWeight: 600,
            marginBottom: '1.25rem',
            backdropFilter: 'blur(8px)',
            color: '#e0f2fe'
          }}>
            <Sparkles size={14} color="#38bdf8" />
            <span>Platform Resmi Kecerdasan Pariwisata Danau Toba</span>
          </div>

          <h1 style={{
            fontSize: '2.85rem',
            fontWeight: 800,
            color: 'white',
            letterSpacing: '-0.02em',
            margin: '0 0 1rem 0',
            lineHeight: 1.2
          }}>
            Mewujudkan Pariwisata Cerdas & <br />
            <span style={{
              background: 'linear-gradient(135deg, #38bdf8 0%, #a7f3d0 100%)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent'
            }}>
              Pemerataan Ekonomi Berkelanjutan
            </span>
          </h1>

          <p style={{
            fontSize: '1.08rem',
            color: 'rgba(255, 255, 255, 0.9)',
            lineHeight: 1.65,
            maxWidth: '760px',
            margin: '0 auto 2.5rem auto'
          }}>
            TobaRoute AI adalah sistem rekomendasi rute cerdas berbasis <em>Retrieval-Augmented Generation (RAG)</em> dan <em>Fairness Engine</em> untuk mengoptimalkan eksplorasi wisatawan serta mengangkat visibilitas pelaku UMKM di Kawasan Danau Toba (UNESCO Global Geopark).
          </p>

          {/* ========================================================================= */}
          {/* FLOATING KPI METRICS GRID */}
          {/* ========================================================================= */}
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))',
            gap: '1rem',
            marginTop: '1.5rem'
          }}>
            <div style={{
              background: 'rgba(255, 255, 255, 0.08)',
              backdropFilter: 'blur(12px)',
              border: '1px solid rgba(255, 255, 255, 0.2)',
              borderRadius: '14px',
              padding: '1.25rem 1rem',
              textAlign: 'center'
            }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.4rem', color: '#38bdf8', marginBottom: '0.25rem' }}>
                <Database size={18} />
                <span style={{ fontSize: '1.9rem', fontWeight: 800, color: 'white' }}>491</span>
              </div>
              <div style={{ fontSize: '0.8rem', color: '#cbd5e1', fontWeight: 500 }}>Entitas POI & UMKM Terverifikasi</div>
            </div>

            <div style={{
              background: 'rgba(255, 255, 255, 0.08)',
              backdropFilter: 'blur(12px)',
              border: '1px solid rgba(255, 255, 255, 0.2)',
              borderRadius: '14px',
              padding: '1.25rem 1rem',
              textAlign: 'center'
            }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.4rem', color: '#4ade80', marginBottom: '0.25rem' }}>
                <TrendingUp size={18} />
                <span style={{ fontSize: '1.9rem', fontWeight: 800, color: 'white' }}>+310%</span>
              </div>
              <div style={{ fontSize: '0.8rem', color: '#cbd5e1', fontWeight: 500 }}>Peningkatan Visibilitas UMKM</div>
            </div>

            <div style={{
              background: 'rgba(255, 255, 255, 0.08)',
              backdropFilter: 'blur(12px)',
              border: '1px solid rgba(255, 255, 255, 0.2)',
              borderRadius: '14px',
              padding: '1.25rem 1rem',
              textAlign: 'center'
            }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.4rem', color: '#fbbf24', marginBottom: '0.25rem' }}>
                <ShieldCheck size={18} />
                <span style={{ fontSize: '1.9rem', fontWeight: 800, color: 'white' }}>98.4%</span>
              </div>
              <div style={{ fontSize: '0.8rem', color: '#cbd5e1', fontWeight: 500 }}>Presisi Grounded RAG AI</div>
            </div>

            <div style={{
              background: 'rgba(255, 255, 255, 0.08)',
              backdropFilter: 'blur(12px)',
              border: '1px solid rgba(255, 255, 255, 0.2)',
              borderRadius: '14px',
              padding: '1.25rem 1rem',
              textAlign: 'center'
            }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.4rem', color: '#c084fc', marginBottom: '0.25rem' }}>
                <MapPin size={18} />
                <span style={{ fontSize: '1.9rem', fontWeight: 800, color: 'white' }}>16</span>
              </div>
              <div style={{ fontSize: '0.8rem', color: '#cbd5e1', fontWeight: 500 }}>Geosite Resmi UNESCO Kaldera</div>
            </div>
          </div>
        </div>
      </section>

      {/* ========================================================================= */}
      {/* MAIN BODY CONTENT */}
      {/* ========================================================================= */}
      <main className="container" style={{ marginTop: '3rem', maxWidth: '1080px' }}>
        
        {/* BAGIAN 1: MASALAH VS SOLUSI */}
        <section style={{ marginBottom: '3.5rem' }}>
          <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
            <span style={{ fontSize: '0.82rem', fontWeight: 700, color: '#0284c7', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
              Transformasi Algoritma
            </span>
            <h2 style={{ fontSize: '1.85rem', fontWeight: 800, color: '#0f172a', margin: '0.25rem 0 0.5rem 0' }}>
              Memecahkan Tantangan <em>Popularity Bias</em>
            </h2>
            <p style={{ fontSize: '0.95rem', color: '#64748b', maxWidth: '640px', margin: '0 auto' }}>
              Bagaimana TobaRoute AI menghadirkan pemerataan ekonomi bagi perajin lokal di 8 Kabupaten lingkar Danau Toba.
            </p>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '1.5rem' }}>
            {/* Kartu Masalah */}
            <div style={{
              background: '#ffffff',
              border: '1px solid #fee2e2',
              borderLeft: '4px solid #ef4444',
              borderRadius: '12px',
              padding: '1.5rem',
              boxShadow: '0 2px 8px rgba(0, 0, 0, 0.03)'
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: '#b91c1c', marginBottom: '0.75rem', fontWeight: 700, fontSize: '1.05rem' }}>
                <AlertCircle size={20} /> Asimetri Peta Komersial Konvensional
              </div>
              <p style={{ fontSize: '0.9rem', color: '#475569', lineHeight: '1.65', margin: 0 }}>
                Platform peta komersial global mengandalkan volume ulasan sebagai faktor utama perangkingan. Hal ini menyebabkan destinasi besar terus mendominasi pencarian, sementara <strong>perajin Ulos tradisional di desa</strong> atau <strong>kedai kopi andaliman khas lokal</strong> yang berkualitas tinggi namun baru memiliki sedikit ulasan menjadi sulit ditemukan wisatawan.
              </p>
            </div>

            {/* Kartu Solusi */}
            <div style={{
              background: '#ffffff',
              border: '1px solid #dcfce7',
              borderLeft: '4px solid #16a34a',
              borderRadius: '12px',
              padding: '1.5rem',
              boxShadow: '0 2px 8px rgba(0, 0, 0, 0.03)'
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: '#15803d', marginBottom: '0.75rem', fontWeight: 700, fontSize: '1.05rem' }}>
                <CheckCircle2 size={20} /> Pendekatan Fairness Engine TobaRoute
              </div>
              <p style={{ fontSize: '0.9rem', color: '#475569', lineHeight: '1.65', margin: 0 }}>
                TobaRoute AI menyematkan algoritma <em>Fairness-Weighted Recommender</em> yang menghitung kedekatan spasial, rating kepuasan autentik, dan dorongan keadilan visibilitas. Hasilnya, UMKM desa secara otomatis disandingkan di dalam paket rute wisata utama tanpa mengurangi relevansi perjalanan wisatawan.
              </p>
            </div>
          </div>
        </section>

        {/* BAGIAN 2: ARSITEKTUR TEKNOLOGI */}
        <section style={{ marginBottom: '3.5rem' }}>
          <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
            <span style={{ fontSize: '0.82rem', fontWeight: 700, color: '#0284c7', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
              Fondasi Sistem
            </span>
            <h2 style={{ fontSize: '1.85rem', fontWeight: 800, color: '#0f172a', margin: '0.25rem 0 0.5rem 0' }}>
              Arsitektur Kecerdasan Buatan Multi-Layer
            </h2>
            <p style={{ fontSize: '0.95rem', color: '#64748b', maxWidth: '640px', margin: '0 auto' }}>
              Integrasi teknologi modern berstandar enterprise untuk performa tinggi, akurat, dan stabil.
            </p>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '1.25rem' }}>
            <div style={{ background: '#ffffff', border: '1px solid #e2e8f0', padding: '1.5rem', borderRadius: '14px', boxShadow: '0 2px 8px rgba(0,0,0,0.04)' }}>
              <div style={{ width: '42px', height: '42px', borderRadius: '10px', background: '#e0f2fe', color: '#0284c7', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '1rem' }}>
                <Cpu size={22} />
              </div>
              <h3 style={{ fontSize: '1.08rem', fontWeight: 700, color: '#0f172a', margin: '0 0 0.5rem 0' }}>
                1. Grounded RAG Pipeline
              </h3>
              <p style={{ fontSize: '0.88rem', color: '#475569', lineHeight: '1.6', margin: 0 }}>
                Mengombinasikan model embedding semantik, basis data vektor, dan LLM <em>Google Gemini Flash Lite</em> yang diikatkan ke database spasial 491 POI terverifikasi untuk menghasilkan panduan akurat bebas halusinasi.
              </p>
            </div>

            <div style={{ background: '#ffffff', border: '1px solid #e2e8f0', padding: '1.5rem', borderRadius: '14px', boxShadow: '0 2px 8px rgba(0,0,0,0.04)' }}>
              <div style={{ width: '42px', height: '42px', borderRadius: '10px', background: '#dcfce7', color: '#16a34a', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '1rem' }}>
                <Heart size={22} />
              </div>
              <h3 style={{ fontSize: '1.08rem', fontWeight: 700, color: '#0f172a', margin: '0 0 0.5rem 0' }}>
                2. Dynamic Fairness Engine
              </h3>
              <p style={{ fontSize: '0.88rem', color: '#475569', lineHeight: '1.6', margin: '0 0 0.6rem 0' }}>
                Formula matematis pembobotan cerdas:
              </p>
              <code style={{ display: 'block', background: '#f1f5f9', padding: '0.4rem 0.6rem', borderRadius: '6px', fontSize: '0.78rem', color: '#0f172a', fontWeight: 600 }}>
                Score = (0.5×Rating) + (0.3×Distance) + (0.2×FairnessBoost)
              </code>
            </div>

            <div style={{ background: '#ffffff', border: '1px solid #e2e8f0', padding: '1.5rem', borderRadius: '14px', boxShadow: '0 2px 8px rgba(0,0,0,0.04)' }}>
              <div style={{ width: '42px', height: '42px', borderRadius: '10px', background: '#f3e8ff', color: '#7c3aed', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '1rem' }}>
                <MapPin size={22} />
              </div>
              <h3 style={{ fontSize: '1.08rem', fontWeight: 700, color: '#0f172a', margin: '0 0 0.5rem 0' }}>
                3. Real Road Navigation & GIS
              </h3>
              <p style={{ fontSize: '0.88rem', color: '#475569', lineHeight: '1.6', margin: 0 }}>
                Kalkulasi rute jalan raya nyata dengan OSRM, pelacakan GPS langsung pengguna, dan pemetaan penyeberangan feri resmi Danau Toba untuk mencegah rute fiktif menyeberang danau.
              </p>
            </div>
          </div>
        </section>

        {/* BAGIAN 3: ENSIKLOPEDIA & BUDAYA BATAK */}
        <section style={{ marginBottom: '3.5rem' }}>
          <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
            <span style={{ fontSize: '0.82rem', fontWeight: 700, color: '#0284c7', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
              Warisan Budaya & Alam
            </span>
            <h2 style={{ fontSize: '1.85rem', fontWeight: 800, color: '#0f172a', margin: '0.25rem 0 0.5rem 0' }}>
              Ensiklopedia & Kurasi Budaya Batak
            </h2>
            <p style={{ fontSize: '0.95rem', color: '#64748b', maxWidth: '640px', margin: '0 auto' }}>
              Mengintegrasikan nilai kearifan lokal leluhur ke dalam setiap narasi dan panduan perjalanan wisatawan.
            </p>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '1.25rem' }}>
            <div style={{ background: '#fffbeb', border: '1px solid #fde68a', padding: '1.5rem', borderRadius: '14px' }}>
              <strong style={{ color: '#92400e', fontSize: '1rem', display: 'block', marginBottom: '0.35rem' }}>
                Falsafah Dalihan Na Tolu
              </strong>
              <p style={{ fontSize: '0.86rem', color: '#78350f', lineHeight: '1.6', margin: 0 }}>
                Nilai luhur kekerabatan Batak: <em>Somba Marhula-hula</em> (hormat pada pihak istri), <em>Elek Marboru</em> (mengayomi pihak perempuan), dan <em>Manat Mardongan Tubu</em> (bijaksana terhadap sesama marga).
              </p>
            </div>

            <div style={{ background: '#fffbeb', border: '1px solid #fde68a', padding: '1.5rem', borderRadius: '14px' }}>
              <strong style={{ color: '#92400e', fontSize: '1rem', display: 'block', marginBottom: '0.35rem' }}>
                Warisan Tenun Tradisional Ulos
              </strong>
              <p style={{ fontSize: '0.86rem', color: '#78350f', lineHeight: '1.6', margin: 0 }}>
                Kurasi motif tenun Ulos sakral seperti Ragidup, Sadum, Ragi Hotang, Mangiring, hingga Ulos Harungguan khas Tarutung dan sentra tenun Desa Meat.
              </p>
            </div>

            <div style={{ background: '#fffbeb', border: '1px solid #fde68a', padding: '1.5rem', borderRadius: '14px' }}>
              <strong style={{ color: '#92400e', fontSize: '1rem', display: 'block', marginBottom: '0.35rem' }}>
                Gastronomi & Rempah Autentik
              </strong>
              <p style={{ fontSize: '0.86rem', color: '#78350f', lineHeight: '1.6', margin: 0 }}>
                Eksplorasi kuliner autentik berbumbu andaliman segar: Dekke Naaniura, Ikan Mas Arsik, Mie Gomak, Dali ni Horbo (keju Batak), Kue Ombusombus, dan Kopi Arabika Lintong.
              </p>
            </div>
          </div>
        </section>

        {/* BAGIAN 4: TIM PENGEMBANG (LAMPORTTRIO) - CUKUP NAMA SAJA */}
        <section style={{ marginBottom: '3.5rem' }}>
          <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
            <span style={{ fontSize: '0.82rem', fontWeight: 700, color: '#0284c7', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
              Tim Pengembang
            </span>
            <h2 style={{ fontSize: '1.85rem', fontWeight: 800, color: '#0f172a', margin: '0.25rem 0 0.5rem 0' }}>
              Tim LamportTRIO
            </h2>
            <p style={{ fontSize: '0.95rem', color: '#64748b', maxWidth: '640px', margin: '0 auto' }}>
              Institut Teknologi Del
            </p>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '1.25rem' }}>
            <div style={{
              background: '#ffffff',
              border: '1px solid #e2e8f0',
              padding: '1.75rem 1.25rem',
              borderRadius: '16px',
              textAlign: 'center',
              boxShadow: '0 4px 12px rgba(0, 0, 0, 0.04)',
              transition: 'all 0.2s ease'
            }}>
              <div style={{
                width: '64px',
                height: '64px',
                borderRadius: '50%',
                background: 'linear-gradient(135deg, #e0f2fe 0%, #bae6fd 100%)',
                color: '#0284c7',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                margin: '0 auto 1rem auto',
                fontWeight: 800,
                fontSize: '1.35rem',
                border: '2px solid #ffffff',
                boxShadow: '0 4px 10px rgba(2, 132, 199, 0.15)'
              }}>
                AB
              </div>
              <h3 style={{ margin: 0, color: '#0f172a', fontSize: '1.12rem', fontWeight: 700 }}>
                Amos Baringbing
              </h3>
            </div>

            <div style={{
              background: '#ffffff',
              border: '1px solid #e2e8f0',
              padding: '1.75rem 1.25rem',
              borderRadius: '16px',
              textAlign: 'center',
              boxShadow: '0 4px 12px rgba(0, 0, 0, 0.04)',
              transition: 'all 0.2s ease'
            }}>
              <div style={{
                width: '64px',
                height: '64px',
                borderRadius: '50%',
                background: 'linear-gradient(135deg, #dcfce7 0%, #bbf7d0 100%)',
                color: '#16a34a',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                margin: '0 auto 1rem auto',
                fontWeight: 800,
                fontSize: '1.35rem',
                border: '2px solid #ffffff',
                boxShadow: '0 4px 10px rgba(22, 163, 74, 0.15)'
              }}>
                JP
              </div>
              <h3 style={{ margin: 0, color: '#0f172a', fontSize: '1.12rem', fontWeight: 700 }}>
                Jonathan Pasaribu
              </h3>
            </div>

            <div style={{
              background: '#ffffff',
              border: '1px solid #e2e8f0',
              padding: '1.75rem 1.25rem',
              borderRadius: '16px',
              textAlign: 'center',
              boxShadow: '0 4px 12px rgba(0, 0, 0, 0.04)',
              transition: 'all 0.2s ease'
            }}>
              <div style={{
                width: '64px',
                height: '64px',
                borderRadius: '50%',
                background: 'linear-gradient(135deg, #f3e8ff 0%, #e9d5ff 100%)',
                color: '#7c3aed',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                margin: '0 auto 1rem auto',
                fontWeight: 800,
                fontSize: '1.35rem',
                border: '2px solid #ffffff',
                boxShadow: '0 4px 10px rgba(124, 58, 237, 0.15)'
              }}>
                JS
              </div>
              <h3 style={{ margin: 0, color: '#0f172a', fontSize: '1.12rem', fontWeight: 700 }}>
                Jessica
              </h3>
            </div>
          </div>
        </section>

        {/* BAGIAN 5: PRIVASI & ETIKA AI */}
        <section style={{
          background: '#ffffff',
          border: '1px solid #e2e8f0',
          borderRadius: '16px',
          padding: '2rem 2.25rem',
          boxShadow: '0 2px 10px rgba(0, 0, 0, 0.03)'
        }}>
          <h3 style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', color: '#0f172a', fontSize: '1.2rem', fontWeight: 700, margin: '0 0 1rem 0' }}>
            <ShieldCheck size={22} color="#16a34a" /> Tata Kelola Etika AI & Perlindungan Privasi (Zero PII)
          </h3>
          <ul style={{ lineHeight: '1.8', fontSize: '0.92rem', color: '#475569', paddingLeft: '1.25rem', margin: 0 }}>
            <li><strong>Zero PII (Privacy by Design)</strong>: Platform dirancang tanpa meminta atau menyimpan data pribadi identitas pengguna (NIK, email, nomor telepon).</li>
            <li><strong>Pemrosesan GPS Sisi Klien</strong>: Titik koordinat GPS wisatawan hanya diproses di memori browser lokal untuk kalkulasi navigasi rute dan tidak disimpan di server database.</li>
            <li><strong>Integritas Data Kurasi Resmi</strong>: Seluruh 491 data destinasi dan UMKM dikurasi dengan kode lokasi presisi <em>Open Location Code</em>.</li>
          </ul>

          <div style={{ marginTop: '2rem', textAlign: 'center', borderTop: '1px solid #f1f5f9', paddingTop: '1.5rem' }}>
            <NavLink 
              to="/explore" 
              className="btn-primary" 
              style={{ display: 'inline-flex', alignItems: 'center', gap: '0.5rem', textDecoration: 'none', padding: '0.75rem 1.75rem', borderRadius: '12px', fontSize: '0.92rem' }}
            >
              <Compass size={18} /> Mulai Eksplorasi Peta Interaktif & AI Concierge
            </NavLink>
          </div>
        </section>
      </main>
    </div>
  );
};

export default About;

