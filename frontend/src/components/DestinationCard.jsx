import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { MapPin, Star, Navigation, Info, Route, ChevronDown, ChevronUp, Store, CheckCircle, Quote, Compass, Sparkles, Lightbulb, Check, RefreshCw } from 'lucide-react';
import { getDestinationAIInsight } from '../services/api';
import './DestinationCard.css';

// STUNNING, HIGH-DEFINITION VERIFIED UNSPLASH PHOTOS
const DEFAULT_CATEGORY_IMAGES = {
  kuliner: "https://images.unsplash.com/photo-1555396273-367ea4eb4db5?auto=format&fit=crop&w=800&q=80",
  umkm: "https://images.unsplash.com/photo-1607344645866-009c320c5ab8?auto=format&fit=crop&w=800&q=80",
  wisata: "https://images.unsplash.com/photo-1506744038136-46273834b3fb?auto=format&fit=crop&w=800&q=80",
  transportasi: "https://images.unsplash.com/photo-1544551763-46a013bb70d5?auto=format&fit=crop&w=800&q=80",
  default: "https://images.unsplash.com/photo-1504674900247-0877df9cc836?auto=format&fit=crop&w=800&q=80"
};

const getLocalHeuristicInsight = (nama, kecamatan, kategori, deskripsi_singkat) => {
  const n = (nama || '').toLowerCase();
  const k = (kategori || '').toLowerCase();
  const d = (deskripsi_singkat || '').toLowerCase();

  if (n.includes('ulos') || k.includes('ulos') || d.includes('ulos') || n.includes('tenun') || d.includes('tenun')) {
    return {
      storytelling: `Sentra kerajinan tangan di ${kecamatan} ini melestarikan teknik tenun tradisional Batak secara turun-temurun, di mana setiap helai kain Ulos ditenun dengan teliti dan sarat makna berkat serta doa leluhur.`,
      must_try: `Melihat langsung proses pembuatan motif Ulos sakral (seperti Sadum atau Ragi Hotang) serta membeli kain tenun asli langsung dari pengrajin warga setempat.`,
      travel_tips: `Disarankan berkunjung pada pagi atau siang hari saat pengrajin aktif menenun. Anda juga dapat bertanya tentang makna filosofis setiap motif ulos.`,
      highlight_tags: ['Tenun Tangan Asli', 'Pemberdayaan UMKM', 'Warisan Budaya Batak']
    };
  } else if (n.includes('gula') || n.includes('aren') || d.includes('aren') || d.includes('gula') || n.includes('palm sugar')) {
    return {
      storytelling: `Diproduksi secara murni dari sadapan pohon enau alami perbukitan ${kecamatan} tanpa bahan kimia pengawet, menghasilkan cita rasa manis karamel legit yang harum khas tanah vulkanik Danau Toba.`,
      must_try: `Membeli gula aren cetak murni dan sirup aren alami yang sangat cocok sebagai pemanis kopi Arabika Toba atau bahan baku kue tradisional.`,
      travel_tips: `Simpan di tempat sejuk dan kedap udara agar keaslian rasa dan aroma legitnya tetap terjaga prima.`,
      highlight_tags: ['100% Nira Aren Murni', 'Tanpa Pengawet', 'Produksi Rumahan Warga']
    };
  } else if (k.includes('kuliner') || n.includes('makan') || n.includes('resto') || n.includes('kopi') || n.includes('warung') || n.includes('cafe')) {
    return {
      storytelling: `Destinasi kuliner autentik di kawasan ${kecamatan} yang menghidangkan kekayaan bumbu rempah tradisional khas Batak Toba (seperti andaliman, asam cikala, dan lokio) yang dimasak segar setiap hari.`,
      must_try: `Mencicipi sajian andalan hangat yang diracik dengan bumbu rempah andaliman segar untuk pengalaman gastronomi Danau Toba yang berkesan.`,
      travel_tips: `Waktu terbaik berkunjung adalah menjelang jam makan siang (11.30 - 13.30 WIB) untuk menikmati sajian yang baru matang.`,
      highlight_tags: ['Rempah Andaliman Segar', 'Kuliner Khas Autentik', 'Bahan Segar Lokal']
    };
  } else if (k.includes('penginapan') || n.includes('hotel') || n.includes('homestay') || n.includes('resort')) {
    return {
      storytelling: `Akomodasi berkonsep ramah keluarga di ${kecamatan} yang menawarkan suasana menginap tenang dengan udara sejuk dan panorama asri bentang kaldera Danau Toba.`,
      must_try: `Menikmati secangkir kopi hangat di pagi hari sambil menyaksikan kabut dan matahari terbit di atas perairan Danau Toba.`,
      travel_tips: `Lakukan konfirmasi pemesanan terlebih dahulu terutama saat akhir pekan atau musim liburan.`,
      highlight_tags: ['Udara Sejuk Pegunungan', 'Suasana Tenang', 'Akses Strategis']
    };
  } else {
    return {
      storytelling: `Destinasi unggulan di wilayah ${kecamatan} yang menyuguhkan keindahan panorama alam kaldera Danau Toba (UNESCO Global Geopark) dengan suasana damai yang sangat asri.`,
      must_try: `Menikmati pemandangan bentang alam danau dari sudut pandang terbaik, berfoto di spot panorama alami, dan menikmati ketenangan alam.`,
      travel_tips: `Gunakan pakaian santai yang nyaman dan bawa jaket ringan karena embusan angin danau yang sejuk di pagi/sore hari.`,
      highlight_tags: ['UNESCO Geopark', 'Spot Foto Eksotis', 'Panorama Alam Asri']
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

  // Load AI Insight on expand
  useEffect(() => {
    if (isExpanded && !aiInsight) {
      // Set initial instant rich heuristic
      const initialInsight = getLocalHeuristicInsight(dest.nama, dest.kecamatan, dest.kategori, dest.deskripsi_singkat);
      setAiInsight(initialInsight);

      // Fetch dynamic deep Gemini insight if dest.id exists
      if (dest.id && dest.id !== 9999) {
        setLoadingAI(true);
        getDestinationAIInsight(dest.id)
          .then((res) => {
            if (res && res.storytelling) {
              setAiInsight(res);
            }
          })
          .catch((err) => {
            // Keep heuristic fallback
            console.log("Using cached AI heuristic insight");
          })
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

  const cleanAddressText = (rawAddress, kecamatan) => {
    if (!rawAddress) return `Kecamatan ${kecamatan}, Kawasan Danau Toba`;
    let cleaned = rawAddress.replace(/^[A-Z0-9]{4}\+[A-Z0-9]{2,4},\s*/i, '').trim();
    cleaned = cleaned.replace(/,\s*Kawasan Danau Toba/gi, '').trim();
    if (!cleaned) cleaned = `Kecamatan ${kecamatan}`;
    return cleaned;
  };

  const parseDetails = (fullText, shortText) => {
    const raw = (fullText || '').trim();
    const short = (shortText || '').trim();

    // Extract Menu Rekomendasi
    let menu = null;
    const menuMatch = raw.match(/Menu Rekomendasi:\s*([^.]+)/i) || raw.match(/Menu:\s*([^.]+)/i);
    if (menuMatch && menuMatch[1]) {
      const val = menuMatch[1].trim();
      if (val !== '-' && !['nan', 'none', 'null'].includes(val.toLowerCase())) {
        menu = val;
      }
    }

    // Extract Jam Operasional
    let hours = null;
    const hoursMatch = raw.match(/Jam Operasional:\s*([^.]+)/i) || raw.match(/Jam Buka:\s*([^.]+)/i) || raw.match(/WAKTU OPERASIONAL:\s*([^.]+)/i);
    if (hoursMatch && hoursMatch[1]) {
      const val = hoursMatch[1].trim();
      if (val !== '-' && !['nan', 'none', 'null'].includes(val.toLowerCase())) {
        hours = val;
      }
    }

    // Extract Estimasi Biaya / HTM / Tarif
    let price = null;
    const priceMatch = raw.match(/Estimasi (?:Biaya|Harga|Tarif):\s*([^.]+)/i) || raw.match(/(?:Tiket Masuk|HTM|Tarif|Estimasi Biaya):\s*([^.]+)/i);
    if (priceMatch && priceMatch[1]) {
      const val = priceMatch[1].trim();
      if (val !== '-' && !['nan', 'none', 'null'].includes(val.toLowerCase())) {
        price = val;
      }
    }

    // Extract Facilities
    let facilities = [];
    const facMatch = raw.match(/Fasilitas(?:\s*Umum|\s*Penunjang)?:\s*([^.]+)/i);
    if (facMatch && facMatch[1]) {
      facilities = facMatch[1]
        .split(/[,/]/)
        .map(f => f.trim())
        .filter(f => f && f !== '-' && !['nan', 'none', 'null', 'tidak ada', 'nil'].includes(f.toLowerCase()));
    }

    // Extract Reviews
    let review = null;
    const revMatch = raw.match(/Ulasan(?:\s*Awal)?:\s*"([^"]+)"/i) || raw.match(/Ulasan(?:\s*Awal)?:\s*([^.]+)/i);
    if (revMatch && revMatch[1]) {
      const val = revMatch[1].trim();
      if (val !== '-' && !['nan', 'none', 'null'].includes(val.toLowerCase())) {
        review = val;
      }
    }

    // Check-in / Check-out for hotel
    let checkInOut = null;
    const checkMatch = raw.match(/Check-in:\s*([^,]+),\s*Check-out:\s*([^.]+)/i);
    if (checkMatch && checkMatch[1] && checkMatch[2]) {
      checkInOut = `Check-in: ${checkMatch[1].trim()} | Check-out: ${checkMatch[2].trim()}`;
    }

    // Determine if there is distinct rich textual explanation
    let distinctDesc = null;
    if (raw && !raw.startsWith('Menu Rekomendasi:') && !raw.startsWith('Fasilitas:') && !raw.startsWith('Tiket Masuk:') && !raw.startsWith('Rute:')) {
      if (raw !== short && raw.length > 20) {
        distinctDesc = raw;
      }
    }

    return { distinctDesc, menu, hours, price, facilities, review, checkInOut };
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

        {/* INLINE EXPANDED DETAIL PANEL (RICH AI STORYTELLING & TRAVEL INSIGHTS) */}
        {isExpanded && (
          <div className="inline-detail-panel fade-in">
            {/* AI TRAVEL CONCIERGE INSIGHT BOX */}
            <div className="inline-ai-insight-box">
              <div className="ai-insight-header">
                <span className="ai-insight-badge">
                  <Sparkles size={13} color="#0284c7" /> Wawasan Cerdas AI Gemini
                </span>
                {loadingAI && <RefreshCw size={12} className="spin" color="#0284c7" />}
              </div>

              {aiInsight && (
                <>
                  <p className="ai-storytelling-text">
                    {aiInsight.storytelling}
                  </p>

                  {aiInsight.must_try && (
                    <div className="ai-highlight-row">
                      <span className="ai-highlight-label">🎯 Pengalaman Wajib:</span>
                      <span className="ai-highlight-val">{aiInsight.must_try}</span>
                    </div>
                  )}

                  {aiInsight.travel_tips && (
                    <div className="ai-highlight-row">
                      <span className="ai-highlight-label">💡 Tips Wisatawan:</span>
                      <span className="ai-highlight-val">{aiInsight.travel_tips}</span>
                    </div>
                  )}

                  {aiInsight.highlight_tags && aiInsight.highlight_tags.length > 0 && (
                    <div className="ai-tags-row">
                      {aiInsight.highlight_tags.map((tag, idx) => (
                        <span key={idx} className="ai-tag-chip">
                          #{tag}
                        </span>
                      ))}
                    </div>
                  )}
                </>
              )}
            </div>

            {/* ADDITIONAL RICH DETAILS IF AVAILABLE */}
            {parsed.distinctDesc && (
              <div className="inline-section">
                <h4 className="inline-section-title">Informasi Lengkap</h4>
                <p className="inline-text">{parsed.distinctDesc}</p>
              </div>
            )}

            {parsed.menu && (
              <div className="inline-section">
                <h4 className="inline-section-title">Menu Rekomendasi</h4>
                <div className="inline-menu-badge">
                  🍽️ <span>{parsed.menu}</span>
                </div>
              </div>
            )}

            {(parsed.hours || parsed.price || parsed.checkInOut) && (
              <div className="inline-section">
                <h4 className="inline-section-title">Jadwal & Tarif</h4>
                <div className="inline-info-grid">
                  {parsed.hours && (
                    <div className="inline-info-item">
                      <span className="info-label">🕒 Operasional:</span>
                      <span className="info-value">{parsed.hours}</span>
                    </div>
                  )}
                  {parsed.price && (
                    <div className="inline-info-item">
                      <span className="info-label">🏷️ Estimasi Biaya:</span>
                      <span className="info-value">{parsed.price}</span>
                    </div>
                  )}
                  {parsed.checkInOut && (
                    <div className="inline-info-item">
                      <span className="info-label">🏨 Waktu:</span>
                      <span className="info-value">{parsed.checkInOut}</span>
                    </div>
                  )}
                </div>
              </div>
            )}

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
