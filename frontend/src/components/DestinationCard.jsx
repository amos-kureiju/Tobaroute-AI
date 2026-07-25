import React from 'react';
import { MapPin, Star, Navigation } from 'lucide-react';
import './DestinationCard.css';

const DEFAULT_CATEGORY_IMAGES = {
  kuliner: "https://images.unsplash.com/photo-1544025162-d76694265947?auto=format&fit=crop&w=600&q=80",
  umkm: "https://images.unsplash.com/photo-1606744888344-493238951221?auto=format&fit=crop&w=600&q=80",
  wisata: "https://images.unsplash.com/photo-1572252009286-268acec5ca0a?auto=format&fit=crop&w=600&q=80",
  transportasi: "https://images.unsplash.com/photo-1544551763-46a013bb70d5?auto=format&fit=crop&w=600&q=80",
  default: "https://images.unsplash.com/photo-1504674900247-0877df9cc836?auto=format&fit=crop&w=600&q=80"
};

const DestinationCard = ({ dest, isUmkm }) => {
  const categoryKey = (dest.kategori || '').toLowerCase();
  
  // Replace missing or old car placeholder images with category-specific high quality photos
  let displayImage = dest.gambar_url;
  if (!displayImage || displayImage.includes('photo-1549317661-bd32c8ce0db2')) {
    displayImage = DEFAULT_CATEGORY_IMAGES[categoryKey] || DEFAULT_CATEGORY_IMAGES.default;
  }

  return (
    <div className={`card destination-card ${isUmkm ? 'umkm-card' : ''}`}>
      <img 
        src={displayImage} 
        alt={dest.nama} 
        className="card-image"
        onError={(e) => {
          e.target.src = DEFAULT_CATEGORY_IMAGES[categoryKey] || DEFAULT_CATEGORY_IMAGES.default;
        }} 
      />
      <div className="card-content">
        <div className="card-header">
          <h3 className="card-title">{dest.nama}</h3>
          {isUmkm && <span className="badge-umkm">Recommended UMKM</span>}
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
      </div>
    </div>
  );
};

export default DestinationCard;
