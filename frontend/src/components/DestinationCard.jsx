import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { MapPin, Star, Navigation, Info, Route, X, Sparkles, Store } from 'lucide-react';
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
  
  // Replace missing or old car placeholder images with category-specific high quality photos
  let displayImage = dest.gambar_url;
  if (!displayImage || displayImage.includes('photo-1549317661-bd32c8ce0db2') || displayImage.includes('photo-1572252009286')) {
    displayImage = DEFAULT_CATEGORY_IMAGES[categoryKey] || DEFAULT_CATEGORY_IMAGES.default;
  }

  // Navigate to Explore page and highlight route for this destination
  const handleNavigateToExplore = (e) => {
    if (e) e.stopPropagation();
    setShowModal(false);
    navigate('/explore', { state: { targetLocation: dest } });
  };

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
          <p className="card-address">{dest.nama_jalan}</p>

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
              <X size={20} />
            </button>

            <div className="modal-header-image">
              <img src={displayImage} alt={dest.nama} />
              <div className="modal-image-overlay"></div>
              <div className="modal-title-box">
                <h2>{dest.nama}</h2>
                <span className="modal-kecamatan"><Navigation size={14} /> {dest.kecamatan} • {dest.kategori.toUpperCase()}</span>
              </div>
            </div>

            <div className="modal-body">
              <div className="modal-meta-row">
                <div className="modal-meta-pill rating">
                  <Star size={16} fill="#fbbf24" color="#fbbf24" /> {dest.rating} dari {dest.jumlah_ulasan} ulasan
                </div>
                {isUmkm && (
                  <div className="modal-meta-pill umkm">
                    <Store size={14} /> Mitra Rekomendasi UMKM Lokal
                  </div>
                )}
              </div>

              <div className="modal-section">
                <h4>Informasi Lengkap:</h4>
                <p>{dest.deskripsi_lengkap || dest.deskripsi_singkat}</p>
              </div>

              <div className="modal-section">
                <h4>Alamat Lokasi:</h4>
                <p className="address-text"><MapPin size={15} color="#ef4444" /> {dest.nama_jalan}, Kecamatan {dest.kecamatan}, Kawasan Danau Toba</p>
              </div>

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
