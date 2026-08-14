// ====================================================================================================
// FILE: frontend/src/pages/About.jsx
// TUJUAN:
// Halaman "Tentang & Riset" TobaRoute AI.
// Menjelaskan:
// 1. Latar Belakang & Visi Riset: Mengatasi bias algoritma pariwisata yang hanya menguntungkan POI besar (Tourism Fairness).
// 2. Metodologi Sistem: Kombinasi RAG (Retrieval-Augmented Generation), Pinecone Vector DB, dan LLM Gemini.
// 3. Dampak Nyata: Pemerataan kunjungan wisatawan ke pengrajin Ulos desa dan warung kuliner tradisional.
// ====================================================================================================

import React from 'react';
import { Compass, Users, Heart } from 'lucide-react';

const About = () => {
  return (
    <main className="container main-content fade-in">
      <div className="about-header text-center" style={{ marginBottom: '3rem' }}>
        <h1 style={{ color: 'var(--color-primary-dark)', fontSize: '2.5rem', marginBottom: '1rem' }}>Tentang TobaRoute AI</h1>
        <div className="line" style={{ margin: '0 auto' }}></div>
      </div>

      <div className="about-content glass-panel" style={{ padding: '3rem', borderRadius: 'var(--radius-lg)' }}>
        {/* Bagian Visi & Latar Belakang */}
        <section style={{ marginBottom: '3rem' }}>
          <h2 style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'var(--color-primary)' }}>
            <Compass size={24} /> Visi Kami
          </h2>
          <p style={{ lineHeight: '1.8', fontSize: '1.1rem', marginTop: '1rem' }}>
            TobaRoute AI dibangun dengan satu visi besar: <strong>Mewujudkan Keadilan Pariwisata (Tourism Fairness) di kawasan Danau Toba</strong>. Kami menyadari bahwa pesatnya perkembangan pariwisata seringkali hanya menguntungkan destinasi-destinasi besar atau yang sudah sangat populer, sementara banyak UMKM (Usaha Mikro Kecil Menengah) dan destinasi lokal yang kaya akan budaya serta keindahan alam tertinggal.
          </p>
        </section>

        {/* Bagian Metodologi RAG & Algoritma Keadilan Data */}
        <section style={{ marginBottom: '3rem' }}>
          <h2 style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'var(--color-primary)' }}>
            <Heart size={24} /> Bagaimana Kami Membantu?
          </h2>
          <p style={{ lineHeight: '1.8', fontSize: '1.1rem', marginTop: '1rem' }}>
            Melalui asisten kecerdasan buatan (AI) berbasis <em>Retrieval-Augmented Generation (RAG)</em>, kami tidak hanya merekomendasikan destinasi wisata utama yang sesuai dengan preferensi liburan Anda, tetapi juga secara cerdas menyisipkan rekomendasi UMKM lokal di sekitar destinasi tersebut. 
          </p>
          <ul style={{ lineHeight: '1.8', fontSize: '1.1rem', marginTop: '1rem', paddingLeft: '1.5rem' }}>
            <li>Menyebarkan kunjungan wisatawan secara lebih merata ke 24 kecamatan lingkar Toba.</li>
            <li>Membantu pertumbuhan ekonomi masyarakat lokal di sekitar Danau Toba.</li>
            <li>Memberikan pengalaman wisata yang lebih otentik bagi pengguna dengan akurasi rute jalan nyata.</li>
          </ul>
        </section>

        {/* Bagian Informasi Tim Riset */}
        <section>
          <h2 style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'var(--color-primary)' }}>
            <Users size={24} /> Tim Pengembang & Peneliti
          </h2>
          <p style={{ lineHeight: '1.8', fontSize: '1.1rem', marginTop: '1rem' }}>
            Aplikasi ini dikembangkan untuk mengedepankan etika AI dan keadilan data, memastikan bahwa sistem rekomendasi yang dibuat bermanfaat bagi semua pihak dalam ekosistem pariwisata Danau Toba.
          </p>
        </section>
      </div>
    </main>
  );
};

export default About;
