import React, { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { MapPin, Star, Navigation, Info, Route, ChevronDown, ChevronUp, Store, CheckCircle, Quote, Compass } from 'lucide-react';
import './DestinationCard.css';

// STUNNING, HIGH-DEFINITION VERIFIED UNSPLASH PHOTOS
const DEFAULT_CATEGORY_IMAGES = {
  kuliner: "https://images.unsplash.com/photo-1555396273-367ea4eb4db5?auto=format&fit=crop&w=800&q=80",
  umkm: "https://images.unsplash.com/photo-1607344645866-009c320c5ab8?auto=format&fit=crop&w=800&q=80",
  wisata: "https://images.unsplash.com/photo-1506744038136-46273834b3fb?auto=format&fit=crop&w=800&q=80",
  transportasi: "https://images.unsplash.com/photo-1544551763-46a013bb70d5?auto=format&fit=crop&w=800&q=80",
  default: "https://images.unsplash.com/photo-1504674900247-0877df9cc836?auto=format&fit=crop&w=800&q=80"
};

const DestinationCard = ({ dest, isUmkm }) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();
  const categoryKey = (dest.kategori || '').toLowerCase();

  let displayImage = dest.gambar_url;
  if (!displayImage || displayImage.includes('photo-1549317661-bd32c8ce0db2') || displayImage.includes('photo-1572252009286') || displayImage.includes('photo-1606744888344') || displayImage.includes('photo-1584100936595')) {
    displayImage = DEFAULT_CATEGORY_IMAGES[categoryKey] || DEFAULT_CATEGORY_IMAGES.default;
  }

  const handleNavigateToExplore = (e) => {
    if (e) e.stopPropagation();

    if (location.pathname === '/explore') {
      window.dispatchEvent(new CustomEvent('select-target-dest', { detail: dest }));
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } else {
      navigate('/explore', { state: { targetLocation: dest } });
    }
  };

  const cleanAddressText = (rawAddress, kecamatan) => {
    if (!rawAddress) return `Kecamatan ${kecamatan}, Kawasan Danau Toba`;
    let cleaned = rawAddress.replace(/^[A-Z0-9]{4}\+[A-Z0-9]{2,4},\s*/i, '').trim();
    if (!cleaned) cleaned = `Kecamatan ${kecamatan}`;
    return cleaned;
  };

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
    <div className={`card destination-card ${isUmkm ? 'umkm-card' : ''} ${isExpanded ? 'is-card-expanded' : ''}`}>
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

        {/* INLINE EXPANDED DETAIL PANEL (Does NOT cover AI response or Map!) */}
        {isExpanded && (
          <div className="inline-detail-panel fade-in">
            <div className="inline-section">
              <h4 className="inline-section-title">Deskripsi Lengkap</h4>
              <p className="inline-text">{parsed.desc}</p>
            </div>

            {parsed.facilities.length > 0 && (
              <div className="inline-section">
                <h4 className="inline-section-title">Fasilitas Tersedia</h4>
                <div className="inline-facilities-chips">
                  {parsed.facilities.map((fac, idx) => (
                    <span key={idx} className="inline-chip">
                      <CheckCircle size={12} color="#10b981" /> {fac}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {parsed.review && (
              <div className="inline-section">
                <h4 className="inline-section-title">Ulasan Pengunjung</h4>
                <div className="inline-quote-card">
                  <Quote size={14} color="#0284c7" />
                  <p>"{parsed.review}"</p>
                </div>
              </div>
            )}

            <div className="inline-section">
              <h4 className="inline-section-title">Alamat Presisi</h4>
              <div className="inline-address-box">
                <MapPin size={14} color="#ef4444" />
                <span>{formattedAddress}, Kawasan Danau Toba</span>
              </div>
            </div>
          </div>
        )}

        {/* Card Action Buttons */}
        <div className="card-actions">
          <button 
            type="button" 
            className={`btn-card-action btn-detail ${isExpanded ? 'active' : ''}`}
            onClick={() => setIsExpanded(!isExpanded)}
          >
            {isExpanded ? (
              <>Sembunyikan <ChevronUp size={14} /></>
            ) : (
              <><Info size={14} /> Detail</>
            )}
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
  );
};

export default DestinationCard;
