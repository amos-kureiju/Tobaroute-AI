// ====================================================================================================
// FILE: frontend/src/components/DestinationCard.jsx
// TUJUAN & PENJELASAN KOMPONEN:
// Komponen Kartu Destinasi & Rekomendasi UMKM Interaktif (Versi Ringkas & Modern).
// Menampilkan:
// 1. Thumbnail resolusi tinggi dengan fallback kategori.
// 2. Badge khusus UMKM Lokal & Kategori.
// 3. Nama tempat, kecamatan, dan rating bintang.
// 4. Deskripsi singkat 2-baris yang rapi (tidak memanjang ke bawah).
// 5. Panel "Detail" yang padat, terstruktur, dan bebas dari pengulangan teks yang panjang.
// 6. Tombol "Lihat Rute Peta" untuk menghubungkan langsung ke GIS navigation.
// ====================================================================================================

import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { MapPin, Star, Navigation, Info, Route, ChevronUp, CheckCircle, Quote, Compass, BookOpen, Clock, Tag, Utensils, RefreshCw, Sparkles } from 'lucide-react';
import { getDestinationAIInsight } from '../services/api';
import './DestinationCard.css';

// Gambar default kategori jika gambar kosong
const DEFAULT_CATEGORY_IMAGES = {
  kuliner: "https://images.unsplash.com/photo-1555396273-367ea4eb4db5?auto=format&fit=crop&w=800&q=80",
  umkm: "https://images.unsplash.com/photo-1607344645866-009c320c5ab8?auto=format&fit=crop&w=800&q=80",
  wisata: "https://images.unsplash.com/photo-1506744038136-46273834b3fb?auto=format&fit=crop&w=800&q=80",
  transportasi: "https://images.unsplash.com/photo-1544551763-46a013bb70d5?auto=format&fit=crop&w=800&q=80",
  default: "https://images.unsplash.com/photo-1504674900247-0877df9cc836?auto=format&fit=crop&w=800&q=80"
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
  const [aiInsight, setAiInsight] = useState(null);
  const [loadingAI, setLoadingAI] = useState(false);
  
  const navigate = useNavigate();
  const location = useLocation();
  const categoryKey = (dest.kategori || '').toLowerCase();

  let displayImage = dest.gambar_url;
  if (!displayImage || displayImage.includes('photo-1549317661-bd32c8ce0db2') || displayImage.includes('photo-1572252009286') || displayImage.includes('photo-1606744888344') || displayImage.includes('photo-1584100936595')) {
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

  // Helper pembersih alamat presisi agar ringkas
  const cleanAddressText = (rawAddress, kecamatan) => {
    if (!rawAddress) return `Kecamatan ${kecamatan}, Kawasan Danau Toba`;
    let cleaned = rawAddress.replace(/^[A-Z0-9]{4}\+[A-Z0-9]{2,4},\s*/i, '').trim();
    cleaned = cleaned.replace(/,\s*Kawasan Danau Toba/gi, '').trim();
    // Hilangkan pengulangan kode pos / negara panjang jika sudah jelas
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
        .slice(0, 4); // Maksimal 4 chip fasilitas agar rapi
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
        {/* Badge Kategori & UMKM */}
        {isUmkm ? (
          <span className="badge-umkm">Recommended UMKM</span>
        ) : (
          <span className="badge-category">{dest.kategori || 'Wisata'}</span>
        )}
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

        {/* PANEL DETAIL RINGKAS & TERSTRUKTUR (ACCORDION) */}
        {isExpanded && (
          <div className="inline-detail-panel fade-in">
            {/* Wawasan Singkat 1-2 Kalimat */}
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

            {/* Fasilitas Singkat (Jika Ada) */}
            {quickInfo.facilities && quickInfo.facilities.length > 0 && (
              <div className="compact-facilities-row">
                {quickInfo.facilities.map((fac, idx) => (
                  <span key={idx} className="compact-fac-chip">
                    <CheckCircle size={11} color="#10b981" /> {fac}
                  </span>
                ))}
              </div>
            )}

            {/* Alamat Ringkas 1 Baris */}
            <div className="compact-address-row">
              <MapPin size={13} color="#ef4444" style={{ flexShrink: 0 }} />
              <span className="compact-address-text">{formattedAddress}</span>
            </div>
          </div>
        )}

        {/* Tombol Aksi Bawah Kartu */}
        <div className="card-actions">
          <button 
            type="button" 
            className={`btn-card-action btn-detail ${isExpanded ? 'active' : ''}`}
            onClick={() => setIsExpanded(!isExpanded)}
          >
            {isExpanded ? (
              <>Tutup <ChevronUp size={13} /></>
            ) : (
              <><Info size={13} /> Ringkasan</>
            )}
          </button>

          <button 
            type="button" 
            className="btn-card-action btn-route" 
            onClick={handleNavigateToExplore}
          >
            <Route size={13} /> Rute Peta
          </button>
        </div>
      </div>
    </div>
  );
};

export default DestinationCard;
