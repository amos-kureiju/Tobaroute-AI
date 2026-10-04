// ====================================================================================================
// FILE: frontend/src/components/DestinationCard.jsx
// TUJUAN & PENJELASAN KOMPONEN:
// Komponen Kartu Destinasi & Rekomendasi UMKM Interaktif dengan Panduan Akses Transportasi Lengkap.
// Menampilkan:
// 1. Thumbnail resolusi tinggi dengan fallback kategori.
// 2. Badge khusus UMKM Lokal & Kategori.
// 3. Nama tempat, kecamatan, dan rating bintang.
// 4. Quick Transport Summary Chips (Jarak dari Bandara Silangit, jenis angkot/kendaraan).
// 5. Panel Detail Interaktif dengan Tab: "Wawasan & Info" dan "Akses Transportasi" (Bandara, Angkot, Feri, Rental).
// 6. Tombol Aksi Cepat: "Akses Transport", "Ringkasan", dan "Rute Peta".
// ====================================================================================================

import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { 
  MapPin, Star, Navigation, Info, Route, ChevronUp, CheckCircle, 
  Clock, Utensils, Plane, Car, Bus, Ship, Bike, DollarSign, 
  ExternalLink, Sparkles, AlertCircle, Compass
} from 'lucide-react';
import { getDestinationAIInsight } from '../services/api';
import { getClientTransportGuide } from '../utils/transportHelper';
import './DestinationCard.css';

// Gambar default kategori jika gambar kosong
const DEFAULT_CATEGORY_IMAGES = {
  kuliner: "https://images.unsplash.com/photo-1555396273-367ea4eb4db5?auto=format&fit=crop&w=800&q=80",
  umkm: "https://images.unsplash.com/photo-1606744824163-985d376605aa?auto=format&fit=crop&w=800&q=80",
  penginapan: "https://images.unsplash.com/photo-1566073771259-6a8506099945?auto=format&fit=crop&w=800&q=80",
  wisata: "https://images.unsplash.com/photo-1506744038136-46273834b3fb?auto=format&fit=crop&w=800&q=80",
  transportasi: "https://images.unsplash.com/photo-1544551763-46a013bb70d5?auto=format&fit=crop&w=800&q=80",
  default: "https://images.unsplash.com/photo-1506744038136-46273834b3fb?auto=format&fit=crop&w=800&q=80"
};

// Fallback wawasan ringkas instan (0 ms latency)
const getLocalHeuristicInsight = (nama, kecamatan, kategori, deskripsi_singkat) => {
  const n = (nama || '').toLowerCase();
  const k = (kategori || '').toLowerCase();
  const d = (deskripsi_singkat || '').toLowerCase();

  if (n.includes('ulos') || k.includes('ulos') || d.includes('ulos') || n.includes('tenun') || d.includes('tenun')) {
    return {
      storytelling: `Sentra kerajinan tangan di ${kecamatan} yang melestarikan teknik tenun Ulos tradisional Batak sarat makna doa leluhur.`,
      must_try: `Melihat proses tenun motif Sadum / Ragi Hotang dan membeli kain asli dari pengrajin warga.`,
      travel_tips: `Kunjungi pada pagi atau siang hari saat pengrajin aktif menenun.`,
      highlight_tags: ['Tenun Asli', 'UMKM Lokal', 'Budaya Batak']
    };
  } else if (n.includes('gula') || n.includes('aren') || d.includes('aren') || d.includes('gula')) {
    return {
      storytelling: `Diproduksi murni dari sadapan pohon enau alami ${kecamatan} tanpa bahan pengawet kimia.`,
      must_try: `Membeli gula aren cetak dan sirup aren alami untuk pemanis kopi Arabika Toba.`,
      travel_tips: `Simpan di tempat sejuk dan kedap udara agar keaslian aroma terjaga.`,
      highlight_tags: ['Nira Murni', 'Produksi Warga', 'Tanpa Pengawet']
    };
  } else if (k.includes('kuliner') || n.includes('makan') || n.includes('resto') || n.includes('kopi') || n.includes('warung') || n.includes('cafe')) {
    return {
      storytelling: `Kuliner autentik di ${kecamatan} yang menghidangkan kekayaan bumbu rempah tradisional khas Batak Toba.`,
      must_try: `Mencicipi sajian andalan dengan bumbu rempah andaliman segar.`,
      travel_tips: `Waktu terbaik berkunjung adalah jam makan siang (11.30 - 13.30 WIB).`,
      highlight_tags: ['Rempah Andaliman', 'Kuliner Khas', 'Bahan Segar']
    };
  } else if (k.includes('penginapan') || n.includes('hotel') || n.includes('homestay') || n.includes('resort')) {
    return {
      storytelling: `Akomodasi ramah keluarga di ${kecamatan} dengan suasana tenang dan panorama asri Danau Toba.`,
      must_try: `Menikmati kopi hangat di pagi hari dengan pemandangan danau kaldera.`,
      travel_tips: `Lakukan reservasi terlebih dahulu terutama saat akhir pekan atau musim libur.`,
      highlight_tags: ['Suasana Tenang', 'Pemandangan Danau', 'Akses Strategis']
    };
  } else {
    return {
      storytelling: `Destinasi alam unggulan di wilayah ${kecamatan} dengan panorama bentang alam kaldera Danau Toba.`,
      must_try: `Menikmati pemandangan bentang danau dari sudut terbaik dan berfoto di spot alami.`,
      travel_tips: `Gunakan pakaian santai yang nyaman dan bawa jaket ringan karena udara sejuk.`,
      highlight_tags: ['UNESCO Geopark', 'Panorama Alam', 'Spot Foto']
    };
  }
};

const DestinationCard = ({ dest, isUmkm }) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const [activeTab, setActiveTab] = useState('info'); // 'info' atau 'transport'
  const [aiInsight, setAiInsight] = useState(null);
  const [loadingAI, setLoadingAI] = useState(false);
  
  const navigate = useNavigate();
  const location = useLocation();
  const categoryKey = (dest.kategori || '').toLowerCase();

  // Dapatkan panduan transportasi instan (0 ms) & sinkron dengan response backend
  const transport = getClientTransportGuide(dest);

  let displayImage = dest.gambar_url;
  if (!displayImage || 
      displayImage.includes('photo-1507525428034-b723cf961d3e') ||
      displayImage.includes('photo-1549317661-bd32c8ce0db2') || 
      displayImage.includes('photo-1572252009286') || 
      displayImage.includes('photo-1606744888344') || 
      displayImage.includes('photo-1584100936595')) {
    displayImage = DEFAULT_CATEGORY_IMAGES[categoryKey] || DEFAULT_CATEGORY_IMAGES.default;
  }

  useEffect(() => {
    if (isExpanded && !aiInsight) {
      const initialInsight = getLocalHeuristicInsight(dest.nama, dest.kecamatan, dest.kategori, dest.deskripsi_singkat);
      setAiInsight(initialInsight);

      if (dest.id && dest.id !== 9999) {
        setLoadingAI(true);
        getDestinationAIInsight(dest.id)
          .then((res) => {
            if (res && res.storytelling) {
              setAiInsight(res);
            }
          })
          .catch(() => {})
          .finally(() => {
            setLoadingAI(false);
          });
      }
    }
  }, [isExpanded, dest.id]);

  const handleNavigateToExplore = (e) => {
    if (e) e.stopPropagation();

    if (location.pathname === '/explore') {
      window.dispatchEvent(new CustomEvent('select-target-dest', { detail: dest }));
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } else {
      navigate('/explore', { state: { targetLocation: dest } });
    }
  };

  const handleOpenTransportTab = (e) => {
    if (e) e.stopPropagation();
    if (!isExpanded) {
      setIsExpanded(true);
      setActiveTab('transport');
    } else if (activeTab !== 'transport') {
      setActiveTab('transport');
    } else {
      setIsExpanded(false);
    }
  };

  const handleOpenInfoTab = (e) => {
    if (e) e.stopPropagation();
    if (!isExpanded) {
      setIsExpanded(true);
      setActiveTab('info');
    } else if (activeTab !== 'info') {
      setActiveTab('info');
    } else {
      setIsExpanded(false);
    }
  };

  // Helper pembersih alamat presisi agar ringkas
  const cleanAddressText = (rawAddress, kecamatan) => {
    if (!rawAddress) return `Kecamatan ${kecamatan}, Kawasan Danau Toba`;
    let cleaned = rawAddress.replace(/^[A-Z0-9]{4}\+[A-Z0-9]{2,4},\s*/i, '').trim();
    cleaned = cleaned.replace(/,\s*Kawasan Danau Toba/gi, '').trim();
    cleaned = cleaned.replace(/\s*\([A-Z0-9+]+\s+.*?\)/gi, '').trim();
    if (!cleaned) cleaned = `Kecamatan ${kecamatan}`;
    return cleaned;
  };

  // Ekstraksi info singkat (menu, jam, harga, fasilitas)
  const parseQuickInfo = (fullText) => {
    const raw = (fullText || '').trim();
    let menu = null;
    let hours = null;
    let price = null;
    let facilities = [];

    const menuMatch = raw.match(/Menu(?: Rekomendasi)?:\s*([^.]+)/i);
    if (menuMatch && menuMatch[1] && !['-', 'nan', 'none', 'null'].includes(menuMatch[1].trim().toLowerCase())) {
      menu = menuMatch[1].trim();
    }

    const hoursMatch = raw.match(/Jam (?:Operasional|Buka):\s*([^.]+)/i);
    if (hoursMatch && hoursMatch[1] && !['-', 'nan', 'none', 'null'].includes(hoursMatch[1].trim().toLowerCase())) {
      hours = hoursMatch[1].trim();
    }

    const priceMatch = raw.match(/(?:Estimasi Biaya|HTM|Tiket Masuk|Tarif):\s*([^.]+)/i);
    if (priceMatch && priceMatch[1] && !['-', 'nan', 'none', 'null'].includes(priceMatch[1].trim().toLowerCase())) {
      price = priceMatch[1].trim();
    }

    const facMatch = raw.match(/Fasilitas(?:\s*Umum)?:\s*([^.]+)/i);
    if (facMatch && facMatch[1]) {
      facilities = facMatch[1]
        .split(/[,/]/)
        .map(f => f.trim())
        .filter(f => f && f !== '-' && !['nan', 'none', 'null', 'tidak ada'].includes(f.toLowerCase()))
        .slice(0, 4);
    }

    return { menu, hours, price, facilities };
  };

  const quickInfo = parseQuickInfo(dest.deskripsi_lengkap);
  const formattedAddress = cleanAddressText(dest.nama_jalan, dest.kecamatan);

  return (
    <div className={`card destination-card ${isUmkm ? 'umkm-card' : ''} ${isExpanded ? 'is-card-expanded' : ''}`}>
      {/* Gambar Thumbnail Kartu */}
      <div className="card-image-wrapper">
        <img 
          src={displayImage} 
          alt={dest.nama} 
          className="card-image"
          onError={(e) => {
            e.target.src = DEFAULT_CATEGORY_IMAGES[categoryKey] || DEFAULT_CATEGORY_IMAGES.default;
          }} 
        />
        {/* Badge Kategori & UMKM Akurat */}
        {(() => {
          const cat = (dest.kategori || '').toLowerCase();
          const n = (dest.nama || '').toLowerCase();
          if (cat === 'umkm' || n.includes('ulos') || n.includes('tenun') || n.includes('batik') || n.includes('souvenir') || n.includes('kerajinan')) {
            return <span className="badge-umkm" style={{ background: '#059669', color: '#ffffff' }}>Recommended UMKM</span>;
          }
          if (cat === 'kuliner' || n.includes('makan') || n.includes('kopi') || n.includes('cafe') || n.includes('mie gomak')) {
            return <span className="badge-umkm" style={{ background: '#ea580c', color: '#ffffff' }}>Kuliner Khas</span>;
          }
          if (cat === 'penginapan' || n.includes('homestay') || n.includes('hotel') || n.includes('inn') || n.includes('cottage')) {
            return <span className="badge-umkm" style={{ background: '#4f46e5', color: '#ffffff' }}>Homestay Warga</span>;
          }
          if (cat === 'transportasi' || n.includes('pelabuhan') || n.includes('dermaga') || n.includes('feri')) {
            return <span className="badge-category" style={{ background: '#0891b2', color: '#ffffff' }}>Transportasi Feri</span>;
          }
          return <span className="badge-category">{dest.kategori || 'Wisata'}</span>;
        })()}
      </div>

      {/* Badan Konten Kartu */}
      <div className="card-content">
        <div className="card-header">
          <h3 className="card-title" title={dest.nama}>{dest.nama}</h3>
        </div>

        {/* Metadata: Kecamatan & Rating */}
        <div className="card-meta">
          <span className="meta-item">
            <Navigation size={13} color="#0284c7" />
            {dest.kecamatan}
          </span>
          <span className="meta-item rating">
            <Star size={13} fill="#f59e0b" color="#f59e0b" />
            {dest.rating || 4.5} ({dest.jumlah_ulasan || 12})
          </span>
        </div>

        {/* Deskripsi Singkat 2-Baris Rapi */}
        <p className="card-description">{dest.deskripsi_singkat || 'Destinasi rekomendasi di Kawasan Danau Toba.'}</p>

        {/* QUICK TRANSPORT PREVIEW CHIPS (Langsung terlihat bagi wisatawan) */}
        {transport && (
          <div className="card-transport-preview">
            <span className="transport-chip-badge airport" title={`Jarak ke Bandara Silangit: ${transport.jarak_bandara_km} km`}>
              <Plane size={11} /> {transport.durasi_bandara} Silangit
            </span>
            <span className="transport-chip-badge transit" title={transport.angkutan_umum?.nama_moda}>
              <Bus size={11} /> {transport.angkutan_umum?.nama_moda ? (transport.angkutan_umum.nama_moda.includes('Angkot') ? 'Angkot Tersedia' : 'Bus / Ojek') : 'Akses Terjangkau'}
            </span>
            {transport.kapal_feri && (
              <span className="transport-chip-badge ferry" title="Tersedia penyeberangan kapal feri">
                <Ship size={11} /> Jalur Feri
              </span>
            )}
          </div>
        )}

        {/* PANEL DETAIL INTERAKTIF (ACCORDION & TABBED) */}
        {isExpanded && (
          <div className="inline-detail-panel fade-in">
            {/* Tab Navigation Switcher */}
            <div className="detail-panel-tabs">
              <button 
                type="button" 
                className={`detail-tab-btn ${activeTab === 'info' ? 'active' : ''}`}
                onClick={() => setActiveTab('info')}
              >
                <Info size={13} /> Wawasan & Info
              </button>
              <button 
                type="button" 
                className={`detail-tab-btn ${activeTab === 'transport' ? 'active' : ''}`}
                onClick={() => setActiveTab('transport')}
              >
                <Bus size={13} /> Akses Transportasi
              </button>
            </div>

            {/* TAB 1: INFORMASI & WAWASAN BUDAYA */}
            {activeTab === 'info' && (
              <div className="tab-content-info fade-in">
                {aiInsight && (
                  <div className="compact-insight-box">
                    <p className="compact-story-text">
                      {aiInsight.storytelling}
                    </p>

                    {/* Grid 2-Kolom: Pengalaman & Tips */}
                    <div className="compact-grid-highlights">
                      {(quickInfo.menu || aiInsight.must_try) && (
                        <div className="compact-highlight-item">
                          <span className="highlight-tag-label">
                            <Utensils size={12} color="#0284c7" /> {quickInfo.menu ? 'Menu Pilihan' : 'Aktivitas Utama'}
                          </span>
                          <span className="highlight-tag-desc">
                            {quickInfo.menu || aiInsight.must_try}
                          </span>
                        </div>
                      )}

                      {(quickInfo.hours || aiInsight.travel_tips) && (
                        <div className="compact-highlight-item">
                          <span className="highlight-tag-label">
                            <Clock size={12} color="#16a34a" /> {quickInfo.hours ? 'Jam Buka' : 'Tips Kunjungan'}
                          </span>
                          <span className="highlight-tag-desc">
                            {quickInfo.hours || aiInsight.travel_tips}
                          </span>
                        </div>
                      )}
                    </div>

                    {/* Tag Pills Singkat */}
                    {aiInsight.highlight_tags && aiInsight.highlight_tags.length > 0 && (
                      <div className="compact-tags-row">
                        {aiInsight.highlight_tags.slice(0, 3).map((tag, idx) => (
                          <span key={idx} className="compact-tag-chip">
                            {tag.replace(/^#/, '')}
                          </span>
                        ))}
                      </div>
                    )}
                  </div>
                )}

                {/* Fasilitas Singkat */}
                {quickInfo.facilities && quickInfo.facilities.length > 0 && (
                  <div className="compact-facilities-row">
                    {quickInfo.facilities.map((fac, idx) => (
                      <span key={idx} className="compact-fac-chip">
                        <CheckCircle size={11} color="#10b981" /> {fac}
                      </span>
                    ))}
                  </div>
                )}

                {/* Alamat Ringkas */}
                <div className="compact-address-row">
                  <MapPin size={13} color="#ef4444" style={{ flexShrink: 0 }} />
                  <span className="compact-address-text">{formattedAddress}</span>
                </div>
              </div>
            )}

            {/* TAB 2: PANDUAN AKSES TRANSPORTASI LENGKAP */}
            {activeTab === 'transport' && transport && (
              <div className="tab-content-transport fade-in">
                {/* 1. Akses Bandara Silangit */}
                <div className="transport-guide-card airport-card">
                  <div className="transport-guide-header">
                    <Plane size={14} color="#0284c7" />
                    <strong>Dari Bandara Silangit (DTB)</strong>
                    <span className="badge-dist-tag">{transport.durasi_bandara} ({transport.jarak_bandara_km} km)</span>
                  </div>
                  <p className="transport-guide-desc">
                    {transport.bandara_access?.rute_utama || `Akses via Jalan Lintas Sumatera menuju ${dest.kecamatan}`}
                  </p>
                  <div className="transport-sub-options">
                    <span>• Taksi Bandara Silangit / Shuttle DAMRI</span>
                    <span>• Rental Mobil Pick-up Bandara</span>
                  </div>
                </div>

                {/* 2. Angkutan Umum & Ojek */}
                <div className="transport-guide-card transit-card">
                  <div className="transport-guide-header">
                    <Bus size={14} color="#16a34a" />
                    <strong>Angkutan Umum & Ojek</strong>
                  </div>
                  <div className="transport-row-detail">
                    <span className="detail-key">Moda:</span>
                    <span className="detail-val">{transport.angkutan_umum?.nama_moda}</span>
                  </div>
                  <div className="transport-row-detail">
                    <span className="detail-key">Trayek:</span>
                    <span className="detail-val">{transport.angkutan_umum?.trayek}</span>
                  </div>
                  <div className="transport-row-detail">
                    <span className="detail-key">Ongkos:</span>
                    <span className="detail-val fare">{transport.angkutan_umum?.estimasi_tarif}</span>
                  </div>
                </div>

                {/* 3. Penyeberangan Feri (Jika Ada) */}
                {transport.kapal_feri && (
                  <div className="transport-guide-card ferry-card">
                    <div className="transport-guide-header">
                      <Ship size={14} color="#0284c7" />
                      <strong>Jalur Penyeberangan Feri Danau</strong>
                    </div>
                    {transport.kapal_feri.dermaga_pilihan && transport.kapal_feri.dermaga_pilihan[0] && (
                      <div className="ferry-route-box">
                        <div className="ferry-rute-title">
                          {transport.kapal_feri.dermaga_pilihan[0].rute}
                        </div>
                        <div className="ferry-meta-row">
                          <span>🚢 {transport.kapal_feri.dermaga_pilihan[0].kapal}</span>
                          <span>⏱️ {transport.kapal_feri.dermaga_pilihan[0].durasi}</span>
                        </div>
                        <div className="ferry-fare-row">
                          <span>Tarif: {transport.kapal_feri.dermaga_pilihan[0].tarif_orang}</span>
                        </div>
                      </div>
                    )}
                  </div>
                )}

                {/* 4. Kendaraan Pribadi & Rental */}
                <div className="transport-guide-card rental-card">
                  <div className="transport-guide-header">
                    <Car size={14} color="#d97706" />
                    <strong>Sewa Motor & Mobil</strong>
                  </div>
                  <div className="rental-options-grid">
                    <div className="rental-pill">
                      <Bike size={12} color="#0284c7" />
                      <div>
                        <strong>Sewa Motor</strong>
                        <span>{transport.kendaraan_pribadi?.sewa_motor?.estimasi_tarif || 'Rp 80.000/hari'}</span>
                      </div>
                    </div>
                    <div className="rental-pill">
                      <Car size={12} color="#16a34a" />
                      <div>
                        <strong>Mobil + Driver</strong>
                        <span>{transport.kendaraan_pribadi?.sewa_mobil?.estimasi_tarif || 'Rp 500.000/hari'}</span>
                      </div>
                    </div>
                  </div>
                  <p className="road-condition-note">
                    🛣️ {transport.kendaraan_pribadi?.kondisi_akses}
                  </p>
                </div>
              </div>
            )}
          </div>
        )}

        {/* Tombol Aksi Bawah Kartu */}
        <div className="card-actions-3col">
          <button 
            type="button" 
            className={`btn-card-action btn-transport-toggle ${isExpanded && activeTab === 'transport' ? 'active' : ''}`}
            onClick={handleOpenTransportTab}
            title="Lihat informasi akses transportasi ke tempat ini"
          >
            <Bus size={13} /> {isExpanded && activeTab === 'transport' ? 'Tutup Info' : 'Transport'}
          </button>

          <button 
            type="button" 
            className={`btn-card-action btn-detail ${isExpanded && activeTab === 'info' ? 'active' : ''}`}
            onClick={handleOpenInfoTab}
            title="Lihat ulasan dan wawasan lengkap"
          >
            <Info size={13} /> {isExpanded && activeTab === 'info' ? 'Tutup' : 'Detail'}
          </button>

          <button 
            type="button" 
            className="btn-card-action btn-route" 
            onClick={handleNavigateToExplore}
            title="Lihat rute di peta interaktif"
          >
            <Route size={13} /> Rute Peta
          </button>
        </div>
      </div>
    </div>
  );
};

export default DestinationCard;
