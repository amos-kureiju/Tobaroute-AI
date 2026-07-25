import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { MapPin, Star, Navigation, Info, Route, X, Store, CheckCircle, Quote, Compass, Award } from 'lucide-react';
import './DestinationCard.css';

// STUNNING, HIGH-DEFINITION VERIFIED UNSPLASH PHOTOS (NO BROKEN BLOCKS)
const DEFAULT_CATEGORY_IMAGES = {
  kuliner: "https://images.unsplash.com/photo-1555396273-367ea4eb4db5?auto=format&fit=crop&w=1000&q=80",
  umkm: "https://images.unsplash.com/photo-1607344645866-009c320c5ab8?auto=format&fit=crop&w=1000&q=80",
  wisata: "https://images.unsplash.com/photo-1506744038136-46273834b3fb?auto=format&fit=crop&w=1000&q=80",
  transportasi: "https://images.unsplash.com/photo-1544551763-46a013bb70d5?auto=format&fit=crop&w=1000&q=80",
  default: "https://images.unsplash.com/photo-1504674900247-0877df9cc836?auto=format&fit=crop&w=1000&q=80"
};

const DestinationCard = ({ dest, isUmkm }) => {
  const [showModal, setShowModal] = useState(false);
  const navigate = useNavigate();
  const categoryKey = (dest.kategori || '').toLowerCase();

  let displayImage = dest.gambar_url;
  if (!displayImage || displayImage.includes('photo-1549317661-bd32c8ce0db2') || displayImage.includes('photo-1572252009286') || displayImage.includes('photo-1606744888344')) {
    displayImage = DEFAULT_CATEGORY_IMAGES[categoryKey] || DEFAULT_CATEGORY_IMAGES.default;
  }

  const handleNavigateToExplore = (e) => {
    if (e) e.stopPropagation();
    setShowModal(false);
    navigate('/explore', { state: { targetLocation: dest } });
  };

  // Clean raw Plus Codes (e.g. 934X+C47, ) and format cleanly
  const cleanAddressText = (rawAddress, kecamatan) => {
    if (!rawAddress) return `Kecamatan ${kecamatan}, Kawasan Danau Toba`;
    let cleaned = rawAddress.replace(/^[A-Z0-9]{4}\+[A-Z0-9]{2,4},\s*/i, '').trim();
    if (!cleaned) cleaned = `Kecamatan ${kecamatan}`;
    return cleaned;
  };

  // Structured details parser
  const parseDetails = (fullText, shortText) => {
    const raw = fullText || shortText || '';
    if (!raw.includes('Fasilitas:')) {
      return { 
        desc: raw || 'Destinasi kebanggaan di kawasan Danau Toba dengan keunikan budaya dan keindahan alam.', 
        facilities: [], 
        review: null 
      };
    }

    const desc = shortText || 'Destinasi kebanggaan di kawasan Danau Toba dengan keunikan budaya dan keindahan alam.';
    let facilities = [];
    let review = null;

    const facMatch = raw.match(/Fasilitas:\s*([^.]+)/i);
    if (facMatch && facMatch[1]) {
      facilities = facMatch[1].split(',').map(f => f.trim()).filter(f => f && f !== '-');
    }

    const revMatch = raw.match(/Ulasan Awal:\s*"([^"]+)"/i) || raw.match(/Ulasan Awal:\s*([^.]+)/i);
    if (revMatch && revMatch[1] && revMatch[1].trim() !== '-') {
      review = revMatch[1].trim();
    }

    return { desc, facilities, review };
  };

  const parsed = parseDetails(dest.deskripsi_lengkap, dest.deskripsi_singkat);
  const formattedAddress = cleanAddressText(dest.nama_jalan, dest.kecamatan);

  return (
    <>
      {/* Card UI */}
      <div className={`card destination-card ${isUmkm ? 'umkm-card' : ''}`}>
        <div className="card-image-wrapper">
          <img 
            src={displayImage} 
            alt={dest.nama} 
            className="card-image"
            onError={(e) => {
              e.target.src = DEFAULT_CATEGORY_IMAGES[categoryKey] || DEFAULT_CATEGORY_IMAGES.default;
            }} 
          />
          {isUmkm && <span className="badge-umkm">Recommended UMKM</span>}
        </div>

        <div className="card-content">
          <div className="card-header">
            <h3 className="card-title">{dest.nama}</h3>
          </div>

          <div className="card-meta">
            <span className="meta-item">
              <Navigation size={14} />
              {dest.kecamatan}
            </span>
            <span className="meta-item rating">
              <Star size={14} fill="#fbbf24" color="#fbbf24" />
              {dest.rating} ({dest.jumlah_ulasan})
            </span>
          </div>

          <p className="card-description">{dest.deskripsi_singkat}</p>
          <p className="card-address">{formattedAddress}</p>

          {/* Card Actions */}
          <div className="card-actions">
            <button 
              type="button" 
              className="btn-card-action btn-detail" 
              onClick={() => setShowModal(true)}
            >
              <Info size={14} /> Detail
            </button>

            <button 
              type="button" 
              className="btn-card-action btn-route" 
              onClick={handleNavigateToExplore}
            >
              <Route size={14} /> Lihat Rute Peta
            </button>
          </div>
        </div>
      </div>

      {/* ULTRA-PREMIUM CENTRED DETAIL MODAL OVERLAY */}
      {showModal && (
        <div className="pro-modal-backdrop fade-in" onClick={() => setShowModal(false)}>
          <div className="pro-modal-container" onClick={(e) => e.stopPropagation()}>
            
            {/* Modal Close Button */}
            <button className="pro-modal-close" onClick={() => setShowModal(false)} title="Tutup">
              <X size={20} />
            </button>

            {/* Header Hero Image */}
            <div className="pro-modal-hero">
              <img 
                src={displayImage} 
                alt={dest.nama} 
                onError={(e) => {
                  e.target.src = DEFAULT_CATEGORY_IMAGES[categoryKey] || DEFAULT_CATEGORY_IMAGES.default;
                }}
              />
              <div className="pro-modal-hero-overlay"></div>
              
              <div className="pro-modal-hero-content">
                <div className="pro-modal-tags">
                  <span className="pro-tag category-tag">
                    <Compass size={13} /> {dest.kategori.toUpperCase()}
                  </span>
                  <span className="pro-tag location-tag">
                    <Navigation size={13} /> Kec. {dest.kecamatan}
                  </span>
                  {isUmkm && (
                    <span className="pro-tag umkm-tag">
                      <Award size={13} /> REKOMENDASI UMKM LOKAL
                    </span>
                  )}
                </div>
                <h2 className="pro-modal-title">{dest.nama}</h2>
              </div>
            </div>

            {/* Modal Body */}
            <div className="pro-modal-body">
              
              {/* Stat Highlights Bar */}
              <div className="pro-stats-grid">
                <div className="pro-stat-card rating-card">
                  <div className="stat-icon-circle amber">
                    <Star size={18} fill="#f59e0b" color="#f59e0b" />
                  </div>
                  <div className="stat-text">
                    <span className="stat-value">{dest.rating} / 5.0</span>
                    <span className="stat-label">{dest.jumlah_ulasan} Ulasan Pengunjung</span>
                  </div>
                </div>

                <div className="pro-stat-card area-card">
                  <div className="stat-icon-circle blue">
                    <Navigation size={18} color="#0284c7" />
                  </div>
                  <div className="stat-text">
                    <span className="stat-value">Kec. {dest.kecamatan}</span>
                    <span className="stat-label">Kawasan Danau Toba</span>
                  </div>
                </div>

                <div className="pro-stat-card cat-card">
                  <div className="stat-icon-circle green">
                    <Store size={18} color="#16a34a" />
                  </div>
                  <div className="stat-text">
                    <span className="stat-value">{dest.kategori.toUpperCase()}</span>
                    <span className="stat-label">Sektor Destinasi</span>
                  </div>
                </div>
              </div>

              {/* Description Section */}
              <div className="pro-section">
                <h3 className="pro-section-title">Deskripsi & Daya Tarik Utama</h3>
                <p className="pro-description">{parsed.desc}</p>
              </div>

              {/* Facilities Chips if available */}
              {parsed.facilities.length > 0 && (
                <div className="pro-section">
                  <h3 className="pro-section-title">Fasilitas Tersedia</h3>
                  <div className="pro-facilities-wrapper">
                    {parsed.facilities.map((fac, i) => (
                      <div key={i} className="pro-facility-chip">
                        <CheckCircle size={14} color="#10b981" />
                        <span>{fac}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Visitor Review Box if available */}
              {parsed.review && (
                <div className="pro-section">
                  <h3 className="pro-section-title">Ulasan Pengunjung</h3>
                  <div className="pro-quote-card">
                    <Quote size={22} color="#0284c7" className="quote-icon" />
                    <p className="quote-text">"{parsed.review}"</p>
                  </div>
                </div>
              )}

              {/* Clean Address Box */}
              <div className="pro-section">
                <h3 className="pro-section-title">Alamat & Akses Lokasi</h3>
                <div className="pro-address-box">
                  <MapPin size={18} color="#ef4444" className="pin-icon" />
                  <span>{formattedAddress}, Kawasan Danau Toba</span>
                </div>
              </div>
            </div>

            {/* Modal Footer Actions */}
            <div className="pro-modal-footer">
              <button 
                type="button" 
                className="btn-pro-close" 
                onClick={() => setShowModal(false)}
              >
                Tutup
              </button>
              <button 
                type="button" 
                className="btn-pro-navigate" 
                onClick={handleNavigateToExplore}
              >
                <Route size={18} />
                <span>Lihat Navigasi Rute di Peta Jelajah</span>
              </button>
            </div>

          </div>
        </div>
      )}
    </>
  );
};

export default DestinationCard;
