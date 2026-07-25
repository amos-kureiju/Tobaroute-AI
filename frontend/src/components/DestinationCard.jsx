import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { MapPin, Star, Navigation, Info, Route, X, Store, CheckCircle, Quote, Compass } from 'lucide-react';
import './DestinationCard.css';

const DEFAULT_CATEGORY_IMAGES = {
  kuliner: "https://images.unsplash.com/photo-1544025162-d76694265947?auto=format&fit=crop&w=600&q=80",
  umkm: "https://images.unsplash.com/photo-1606744888344-493238951221?auto=format&fit=crop&w=600&q=80",
  wisata: "https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=600&q=80",
  transportasi: "https://images.unsplash.com/photo-1544551763-46a013bb70d5?auto=format&fit=crop&w=600&q=80",
  default: "https://images.unsplash.com/photo-1504674900247-0877df9cc836?auto=format&fit=crop&w=600&q=80"
};

const DestinationCard = ({ dest, isUmkm }) => {
  const [showModal, setShowModal] = useState(false);
  const navigate = useNavigate();
  const categoryKey = (dest.kategori || '').toLowerCase();

  let displayImage = dest.gambar_url;
  if (!displayImage || displayImage.includes('photo-1549317661-bd32c8ce0db2') || displayImage.includes('photo-1572252009286')) {
    displayImage = DEFAULT_CATEGORY_IMAGES[categoryKey] || DEFAULT_CATEGORY_IMAGES.default;
  }

  const handleNavigateToExplore = (e) => {
    if (e) e.stopPropagation();
    setShowModal(false);
    navigate('/explore', { state: { targetLocation: dest } });
  };

  // Helper to clean raw Plus Codes (e.g. 934X+C47, )
  const cleanAddressText = (rawAddress, kecamatan) => {
    if (!rawAddress) return `Kecamatan ${kecamatan}, Kawasan Danau Toba`;
    let cleaned = rawAddress.replace(/^[A-Z0-9]{4}\+[A-Z0-9]{2,4},\s*/i, '').trim();
    if (!cleaned) cleaned = `Kecamatan ${kecamatan}`;
    return cleaned;
  };

  // Helper to structure raw description text
  const parseDetails = (fullText, shortText) => {
    const raw = fullText || shortText || '';
    if (!raw.includes('Fasilitas:')) {
      return { 
        desc: raw || 'Destinasi unggulan di kawasan Danau Toba.', 
        facilities: [], 
        review: null 
      };
    }

    const desc = shortText || 'Destinasi unggulan di kawasan Danau Toba.';
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

          {/* Action Buttons */}
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

      {/* Detail Modal Overlay */}
      {showModal && (
        <div className="modal-backdrop fade-in" onClick={() => setShowModal(false)}>
          <div className="modal-content glass-panel" onClick={(e) => e.stopPropagation()}>
            <button className="modal-close-btn" onClick={() => setShowModal(false)}>
              <X size={18} />
            </button>

            <div className="modal-header-image">
              <img src={displayImage} alt={dest.nama} />
              <div className="modal-image-overlay"></div>
              <div className="modal-title-box">
                <h2>{dest.nama}</h2>
                <div className="modal-sub-info">
                  <span className="modal-tag"><Navigation size={13} /> {dest.kecamatan}</span>
                  <span className="modal-tag category"><Compass size={13} /> {dest.kategori.toUpperCase()}</span>
                </div>
              </div>
            </div>

            <div className="modal-body">
              {/* Metric Row */}
              <div className="modal-meta-row">
                <div className="modal-meta-pill rating">
                  <Star size={15} fill="#fbbf24" color="#fbbf24" /> {dest.rating} dari {dest.jumlah_ulasan} Ulasan Pengunjung
                </div>
                {isUmkm && (
                  <div className="modal-meta-pill umkm">
                    <Store size={14} /> Mitra UMKM Lokal Toba
                  </div>
                )}
              </div>

              {/* Description */}
              <div className="modal-section">
                <h4>Deskripsi & Daya Tarik:</h4>
                <p>{parsed.desc}</p>
              </div>

              {/* Facilities Chips if available */}
              {parsed.facilities.length > 0 && (
                <div className="modal-section">
                  <h4>Fasilitas Tersedia:</h4>
                  <div className="facilities-grid">
                    {parsed.facilities.map((fac, i) => (
                      <span key={i} className="facility-chip">
                        <CheckCircle size={13} color="#10b981" /> {fac}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {/* Review Quote Box if available */}
              {parsed.review && (
                <div className="modal-section">
                  <h4>Ulasan Pengunjung:</h4>
                  <div className="review-quote-box">
                    <Quote size={18} color="#0284c7" className="quote-icon" />
                    <p>"{parsed.review}"</p>
                  </div>
                </div>
              )}

              {/* Clean Location Address */}
              <div className="modal-section">
                <h4>Alamat Lokasi:</h4>
                <p className="address-text">
                  <MapPin size={15} color="#ef4444" /> {formattedAddress}
                </p>
              </div>

              {/* Footer CTA */}
              <div className="modal-actions-footer">
                <button 
                  type="button" 
                  className="btn-modal-explore" 
                  onClick={handleNavigateToExplore}
                >
                  <Route size={18} /> Navigasi Rute di Peta Jelajah
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default DestinationCard;
