// ====================================================================================================
// FILE: frontend/src/pages/Explore.jsx
// TUJUAN:
// Halaman Peta Eksplorasi Interaktif Kawasan Danau Toba.
// Fitur Utama:
// 1. Peta Penuh (Full-Screen Interactive GIS): Leaflet Map dengan penanda warna kategori berbeda.
// 2. Filter Multi-Kategori (Wisata, Kuliner Batak, Sentra UMKM, Penginapan, Transportasi Feri).
// 3. Filter Multi-Kecamatan (24 Wilayah Lingkar Toba).
// 4. Panel Drawer Detail POI: Info operasional, tarif tiket, menu, dan kode alamat presisi.
// 5. Floating AI Chatbot Concierge: Chatbot interaktif tanya-jawab rute dan budaya Batak (Gemini AI).
// 6. Real Road Navigation Routing: Menghitung rute perjalanan mobil dari titik GPS ke destinasi tujuan.
// ====================================================================================================

import React, { useState, useEffect, useRef } from 'react';
import { useLocation } from 'react-router-dom';
import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';
import { getDestinations, getFairRecommendation, sendChatMessage } from '../services/api';
import { 
  Map, AlertCircle, Navigation, Star, Send, Bot, User, Compass, 
  Route as RouteIcon, MapPin, Search, ChevronLeft, Menu, LocateFixed, 
  X, Sparkles, Layers, Store, Utensils, Hotel, Car, Trash2, Copy, 
  Check, ExternalLink, Info, Clock, Plane, Bus, Ship, Bike, DollarSign, ArrowRight 
} from 'lucide-react';
import ReactMarkdown from 'react-markdown';
import RoutingMachine from '../components/RoutingMachine';
import { getClientTransportGuide } from '../utils/transportHelper';
import './Explore.css';

// HELPER: Membersihkan nilai 'nan', 'null', atau tanda strip dari database
const formatDescription = (desc) => {
  if (!desc) return 'Destinasi unggulan di kawasan Danau Toba dengan keindahan alam dan nilai budaya yang khas.';
  let clean = String(desc)
    .replace(/Menu Rekomendasi:\s*(nan|none|null|-)/gi, '')
    .replace(/Fasilitas:\s*(nan|none|null|-)/gi, '')
    .replace(/Estimasi Biaya:\s*(nan|none|null|-)/gi, '')
    .replace(/Jam Operasional:\s*(nan|none|null|-)/gi, '')
    .replace(/Menu:\s*(nan|none|null|-)/gi, '')
    .replace(/Tiket Masuk:\s*(nan|none|null|-)/gi, '')
    .replace(/Ulasan:\s*(nan|none|null|-)/gi, '')
    .replace(/\b(nan|none|null)\b/gi, '')
    .trim();
  if (!clean || clean.length < 5) {
    return 'Destinasi unggulan di kawasan Danau Toba dengan keindahan alam dan nilai budaya yang khas.';
  }
  return clean;
};

// Verified Crisp SVG Marker Icons (Zero Broken Image Risk)
// Verified Crisp SVG Marker Icons with Optional Route Sequence Numbering
const createExplorePin = (category = '', isSelected = false, orderNumber = null) => {
  const cat = String(category).toLowerCase();
  let primaryColor = '#0284c7';
  let accentLight = '#38bdf8';
  let iconSvg = orderNumber 
    ? `<text x="16" y="19" text-anchor="middle" font-size="11" font-family="system-ui, -apple-system, sans-serif" font-weight="900" fill="#0284c7">${orderNumber}</text>`
    : '<circle cx="16" cy="15" r="5" fill="#0284c7"/>';

  if (cat.includes('kuliner') || cat.includes('makan') || cat.includes('resto') || cat.includes('cafe')) {
    primaryColor = '#ea580c';
    accentLight = '#fb923c';
    if (!orderNumber) iconSvg = '<path d="M12 11v7M14 11v7M13 11v7M18 11v3a2 2 0 0 1-2 2v3" stroke="#ea580c" stroke-width="1.8" stroke-linecap="round" fill="none"/>';
    else iconSvg = `<text x="16" y="19" text-anchor="middle" font-size="11" font-family="system-ui, -apple-system, sans-serif" font-weight="900" fill="#ea580c">${orderNumber}</text>`;
  } else if (cat.includes('umkm') || cat.includes('oleh') || cat.includes('ulos') || cat.includes('toko') || cat.includes('pasar')) {
    primaryColor = '#16a34a';
    accentLight = '#4ade80';
    if (!orderNumber) iconSvg = '<path d="M11 13h10v6H11z M13 13a3 3 0 0 1 6 0" stroke="#16a34a" stroke-width="1.6" fill="none"/>';
    else iconSvg = `<text x="16" y="19" text-anchor="middle" font-size="11" font-family="system-ui, -apple-system, sans-serif" font-weight="900" fill="#16a34a">${orderNumber}</text>`;
  } else if (cat.includes('penginapan') || cat.includes('hotel') || cat.includes('homestay')) {
    primaryColor = '#d97706';
    accentLight = '#fbbf24';
    if (!orderNumber) iconSvg = '<path d="M10 18v-5h12v5 M10 15h12 M12 11h2v2h-2z" stroke="#d97706" stroke-width="1.6" fill="none"/>';
    else iconSvg = `<text x="16" y="19" text-anchor="middle" font-size="11" font-family="system-ui, -apple-system, sans-serif" font-weight="900" fill="#d97706">${orderNumber}</text>`;
  } else if (cat.includes('transportasi') || cat.includes('mobil') || cat.includes('kapal')) {
    primaryColor = '#475569';
    accentLight = '#94a3b8';
    if (!orderNumber) iconSvg = '<path d="M11 12h10l-1 6H12z M13 18v2 M19 18v2" stroke="#475569" stroke-width="1.6" fill="none"/>';
    else iconSvg = `<text x="16" y="19" text-anchor="middle" font-size="11" font-family="system-ui, -apple-system, sans-serif" font-weight="900" fill="#475569">${orderNumber}</text>`;
  } else {
    primaryColor = '#0284c7';
    accentLight = '#38bdf8';
    if (!orderNumber) iconSvg = '<path d="M16 10l5 9H11z" fill="#0284c7"/>';
    else iconSvg = `<text x="16" y="19" text-anchor="middle" font-size="11" font-family="system-ui, -apple-system, sans-serif" font-weight="900" fill="#0284c7">${orderNumber}</text>`;
  }

  const borderStroke = isSelected ? '#fbbf24' : '#ffffff';
  const strokeW = isSelected ? '3' : '2';

  const html = `
    <div style="
      position: relative;
      width: 32px;
      height: 42px;
      display: flex;
      align-items: center;
      justify-content: center;
      cursor: pointer;
      filter: drop-shadow(0 3px 6px rgba(0,0,0,0.25));
      transition: transform 0.2s ease;
      ${isSelected ? 'transform: scale(1.22);' : ''}
    ">
      <svg viewBox="0 0 32 42" width="32" height="42" style="overflow: visible;">
        <defs>
          <linearGradient id="grad-cat-${primaryColor.replace('#','')}" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stop-color="${accentLight}" />
            <stop offset="100%" stop-color="${primaryColor}" />
          </linearGradient>
        </defs>
        <path d="M16 1 C7.5 1 1 7.5 1 16 C1 25.5 16 41 16 41 C16 41 31 25.5 31 16 C31 7.5 24.5 1 16 1 Z" 
              fill="url(#grad-cat-${primaryColor.replace('#','')})" 
              stroke="${borderStroke}" 
              stroke-width="${strokeW}" />
        <circle cx="16" cy="15" r="9.5" fill="#ffffff" />
        ${iconSvg}
      </svg>
    </div>
  `;

  return L.divIcon({
    className: 'custom-explore-pin',
    html: html,
    iconSize: [32, 42],
    iconAnchor: [16, 41],
    popupAnchor: [0, -38]
  });
};

const activeTargetIcon = L.divIcon({
  className: 'custom-active-target-pin',
  html: `
    <div style="
      position: relative;
      width: 38px;
      height: 48px;
      display: flex;
      align-items: center;
      justify-content: center;
      cursor: pointer;
      filter: drop-shadow(0 4px 10px rgba(220, 38, 38, 0.6));
    ">
      <svg viewBox="0 0 36 48" width="38" height="48" style="overflow: visible;">
        <defs>
          <linearGradient id="grad-active-target" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stop-color="#f87171" />
            <stop offset="100%" stop-color="#dc2626" />
          </linearGradient>
        </defs>
        <path d="M18 1 C8.6 1 1 8.6 1 18 C1 29 18 47 18 47 C18 47 35 29 35 18 C35 8.6 27.4 1 18 1 Z" 
              fill="url(#grad-active-target)" 
              stroke="#ffffff" 
              stroke-width="2.5" />
        <circle cx="18" cy="17" r="11" fill="#ffffff" />
        <circle cx="18" cy="17" r="7" fill="#dc2626" />
        <circle cx="18" cy="17" r="3" fill="#ffffff" />
      </svg>
    </div>
  `,
  iconSize: [38, 48],
  iconAnchor: [19, 47],
  popupAnchor: [0, -42]
});

const userGpsIcon = L.divIcon({
  className: 'custom-gps-pin',
  html: `
    <div style="
      position: relative;
      width: 42px;
      height: 42px;
      display: flex;
      align-items: center;
      justify-content: center;
      cursor: grab;
    ">
      <div style="
        position: absolute;
        width: 40px;
        height: 40px;
        border-radius: 50%;
        background: rgba(147, 51, 234, 0.3);
        animation: toba-gps-radar 2s infinite cubic-bezier(0.2, 0.8, 0.4, 1);
      "></div>
      <div style="
        position: relative;
        width: 26px;
        height: 26px;
        border-radius: 50%;
        background: linear-gradient(135deg, #a855f7, #7e22ce);
        border: 3px solid #ffffff;
        box-shadow: 0 4px 10px rgba(126, 34, 206, 0.5);
        display: flex;
        align-items: center;
        justify-content: center;
      ">
        <svg width="12" height="12" viewBox="0 0 24 24" fill="white">
          <path d="M12 2L4.5 20.29l.71.71L12 18l6.79 3 .71-.71z" />
        </svg>
      </div>
    </div>
  `,
  iconSize: [42, 42],
  iconAnchor: [21, 21],
  popupAnchor: [0, -22]
});

const getMarkerIconByCategory = (category = '', isSelected = false, orderNumber = null) => {
  return createExplorePin(category, isSelected, orderNumber);
};

// Helper component to trigger map flyTo dynamically
const MapFlyController = ({ centerCoords, zoom = 13 }) => {
  const map = useMap();
  useEffect(() => {
    if (centerCoords && centerCoords[0] && centerCoords[1]) {
      map.flyTo(centerCoords, zoom, { duration: 1.2 });
    }
  }, [centerCoords, zoom, map]);
  return null;
};

const DEFAULT_TOBA_CENTER = [2.3544, 99.1264];
const DEFAULT_START_ORIGIN = [2.3387, 99.0625];

const KECAMATAN_CENTERS = {
  // 24 Kecamatan Resmi Kawasan Danau Toba
  'laguboti': { name: 'Kecamatan Laguboti', coords: [2.3544, 99.1264], zoom: 14 },
  'balige': { name: 'Kecamatan Balige', coords: [2.3387, 99.0625], zoom: 14 },
  'sigumpar': { name: 'Kecamatan Sigumpar', coords: [2.3920, 99.1550], zoom: 14 },
  'porsea': { name: 'Kecamatan Porsea', coords: [2.4475, 99.1538], zoom: 14 },
  'silaen': { name: 'Kecamatan Silaen', coords: [2.3870, 99.2051], zoom: 14 },
  'tampahan': { name: 'Kecamatan Tampahan', coords: [2.3160, 99.0125], zoom: 14 },
  'lumban julu': { name: 'Kecamatan Lumban Julu', coords: [2.6010, 99.0480], zoom: 14 },
  'ajibata': { name: 'Kecamatan Ajibata', coords: [2.6650, 98.9320], zoom: 14 },
  'parapat': { name: 'Kecamatan Parapat', coords: [2.6620, 98.9350], zoom: 14 },
  'girsang sipangan bolon': { name: 'Kecamatan Girsang Sipangan Bolon', coords: [2.6620, 98.9350], zoom: 14 },
  'pangururan': { name: 'Kecamatan Pangururan', coords: [2.6033, 98.7050], zoom: 14 },
  'simanindo': { name: 'Kecamatan Simanindo', coords: [2.7252, 98.7869], zoom: 14 },
  'harian': { name: 'Kecamatan Harian', coords: [2.5830, 98.6330], zoom: 14 },
  'sianjur mulamula': { name: 'Kecamatan Sianjur Mulamula', coords: [2.5890, 98.6420], zoom: 14 },
  'onan runggu': { name: 'Kecamatan Onan Runggu', coords: [2.5020, 98.9210], zoom: 14 },
  'palipi': { name: 'Kecamatan Palipi', coords: [2.4450, 98.7900], zoom: 14 },
  'ronggur nihuta': { name: 'Kecamatan Ronggur Nihuta', coords: [2.5800, 98.7700], zoom: 14 },
  'muara': { name: 'Kecamatan Muara', coords: [2.3378, 98.9048], zoom: 14 },
  'baktiraja': { name: 'Kecamatan Baktiraja', coords: [2.3250, 98.8150], zoom: 14 },
  'doloksanggul': { name: 'Kecamatan Doloksanggul', coords: [2.2570, 98.7510], zoom: 14 },
  'pollung': { name: 'Kecamatan Pollung', coords: [2.3100, 98.6800], zoom: 14 },
  'berastagi': { name: 'Kecamatan Berastagi', coords: [3.1870, 98.5110], zoom: 14 },
  'sidikalang': { name: 'Kecamatan Sidikalang', coords: [2.7480, 98.3120], zoom: 14 },
  'tarutung': { name: 'Kecamatan Tarutung', coords: [2.0250, 98.9730], zoom: 14 },
  'silahisabungan': { name: 'Kecamatan Silahisabungan', coords: [2.8100, 98.5200], zoom: 13 },

  // Wilayah Kabupaten & Pulau
  'samosir': { name: 'Pulau & Kabupaten Samosir', coords: [2.6033, 98.7050], zoom: 11 },
  'pulau samosir': { name: 'Pulau Samosir', coords: [2.6033, 98.7050], zoom: 11 },
  'kabupaten samosir': { name: 'Kabupaten Samosir', coords: [2.6033, 98.7050], zoom: 11 },
  'toba': { name: 'Kabupaten Toba', coords: [2.3387, 99.0625], zoom: 11 },
  'kabupaten toba': { name: 'Kabupaten Toba', coords: [2.3387, 99.0625], zoom: 11 },
  'taput': { name: 'Kabupaten Tapanuli Utara', coords: [2.0250, 98.9730], zoom: 11 },
  'tapanuli utara': { name: 'Kabupaten Tapanuli Utara', coords: [2.0250, 98.9730], zoom: 11 },
  'humbahas': { name: 'Kabupaten Humbang Hasundutan', coords: [2.2570, 98.7510], zoom: 11 },
  'humbang hasundutan': { name: 'Kabupaten Humbang Hasundutan', coords: [2.2570, 98.7510], zoom: 11 },
  'simalungun': { name: 'Kabupaten Simalungun', coords: [2.6620, 98.9350], zoom: 11 },
  'karo': { name: 'Kabupaten Karo', coords: [3.1870, 98.5110], zoom: 11 },
  'dairi': { name: 'Kabupaten Dairi', coords: [2.7480, 98.3120], zoom: 11 },

  // Landmark Populer Kawasan Kaldera
  'huta ginjang': { name: 'Huta Ginjang (Muara)', coords: [2.3378, 98.9048], zoom: 14 },
  'hutaginjang': { name: 'Huta Ginjang (Muara)', coords: [2.3378, 98.9048], zoom: 14 },
  'puncak huta ginjang': { name: 'Huta Ginjang (Muara)', coords: [2.3378, 98.9048], zoom: 14 },
  'holbung': { name: 'Bukit Holbung', coords: [2.5830, 98.6330], zoom: 14 },
  'bukit holbung': { name: 'Bukit Holbung', coords: [2.5830, 98.6330], zoom: 14 },
  'sipinsur': { name: 'Geosite Sipinsur', coords: [2.3100, 98.6800], zoom: 14 },
  'geosite sipinsur': { name: 'Geosite Sipinsur', coords: [2.3100, 98.6800], zoom: 14 },
  'meat': { name: 'Desa Wisata Meat', coords: [2.3160, 99.0125], zoom: 14 },
  'desa meat': { name: 'Desa Wisata Meat', coords: [2.3160, 99.0125], zoom: 14 },
  'tomok': { name: 'Desa Wisata Tomok', coords: [2.6500, 98.8600], zoom: 14 },
  'siallagan': { name: 'Huta Siallagan', coords: [2.6780, 98.8450], zoom: 14 },
  'batu kursi': { name: 'Huta Siallagan', coords: [2.6780, 98.8450], zoom: 14 },
  'huta raja': { name: 'Kampung Ulos Huta Raja', coords: [2.6280, 98.7180], zoom: 14 },
  'hutaraja': { name: 'Kampung Ulos Huta Raja', coords: [2.6280, 98.7180], zoom: 14 },
  'aek rangat': { name: 'Pemandian Air Panas Aek Rangat', coords: [2.6250, 98.6880], zoom: 14 },
  'aekrangat': { name: 'Pemandian Air Panas Aek Rangat', coords: [2.6250, 98.6880], zoom: 14 },
  'efrata': { name: 'Air Terjun Efrata', coords: [2.5930, 98.6180], zoom: 14 },
  'situmurun': { name: 'Air Terjun Situmurun', coords: [2.5180, 99.0730], zoom: 14 },
  'binangalom': { name: 'Air Terjun Binangalom', coords: [2.5180, 99.0730], zoom: 14 },
  'sipisopiso': { name: 'Air Terjun Sipiso-piso', coords: [2.9160, 98.5280], zoom: 14 },
  'sipiso piso': { name: 'Air Terjun Sipiso-piso', coords: [2.9160, 98.5280], zoom: 14 },
  'bakkara': { name: 'Lembah Bakkara', coords: [2.3250, 98.8150], zoom: 14 },
  'tano ponggol': { name: 'Jembatan Tano Ponggol', coords: [2.6070, 98.6980], zoom: 14 },
  'tanoponggol': { name: 'Jembatan Tano Ponggol', coords: [2.6070, 98.6980], zoom: 14 },
  'salib kasih': { name: 'Wisata Rohani Salib Kasih', coords: [2.0080, 98.9810], zoom: 14 },
  'salibkasih': { name: 'Wisata Rohani Salib Kasih', coords: [2.0080, 98.9810], zoom: 14 },
  'parbubu': { name: 'Pemandian Air Soda Parbubu', coords: [2.0150, 98.9620], zoom: 14 },
  'sidihoni': { name: 'Danau Sidihoni', coords: [2.5530, 98.7180], zoom: 14 },
  'aek natonang': { name: 'Danau Aek Natonang', coords: [2.6450, 98.7980], zoom: 14 },
  'tele': { name: 'Menara Pandang Tele', coords: [2.5510, 98.6360], zoom: 14 },
  'bulbul': { name: 'Pantai Lumban Bulbul', coords: [2.3320, 99.0720], zoom: 14 },
  'lumban bulbul': { name: 'Pantai Lumban Bulbul', coords: [2.3320, 99.0720], zoom: 14 }
};

const QUICK_LOCATIONS = [
  { name: '✈️ Dari Bandara Silangit', query: 'Bagaimana cara dan tarif transportasi dari Bandara Silangit ke Balige, Parapat, dan Samosir?' },
  { name: '🚢 Jadwal & Tarif Feri', query: 'Berapa jadwal dan tarif kapal feri penyeberangan Danau Toba dari Ajibata ke Ambarita dan Tomok?' },
  { name: '💰 Estimasi Biaya Liburan', query: 'Berapa estimasi rincian biaya liburan 2 hari 1 malam di Danau Toba untuk backpacker dan keluarga?' },
  { name: '🍲 Kuliner & Tempat Halal', query: 'Apa saja rekomendasi kuliner khas Batak dan pilihan rumah makan halal di sekitar Danau Toba?' },
  { name: '🧵 Beli Ulos Asli Pengrajin', query: 'Di mana tempat terbaik membeli kain tenun Ulos asli langsung dari pengrajin warga dan berapa harganya?' },
  { name: '🛵 Sewa Motor & Mobil', query: 'Berapa tarif sewa sepeda motor dan rental mobil per hari di Danau Toba dan apa saja tips rutenya?' },
  { name: '🌤️ Cuaca & Tips Pakaian', query: 'Bagaimana kondisi cuaca kaldera Danau Toba dan apa tips pakaian serta waktu terbaik berkunjung?' },
  { name: '🗺️ Itinerary 3D2N Samosir', query: 'Buatkan rencana perjalanan itinerary 3 hari 2 malam keliling Pulau Samosir dan Toba yang lengkap dan ramah keluarga' }
];

const MAP_STYLES = {
  osm: {
    url: 'https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png',
    attribution: '&copy; OpenStreetMap'
  },
  google_streets: {
    url: 'https://mt1.google.com/vt/lyrs=m&x={x}&y={y}&z={z}',
    attribution: '&copy; Google Maps'
  },
  google_satellite: {
    url: 'https://mt1.google.com/vt/lyrs=s,h&x={x}&y={y}&z={z}',
    attribution: '&copy; Google Maps Satellite'
  }
};

const Explore = () => {
  const location = useLocation();
  const [destinations, setDestinations] = useState([]);
  const [displayedMarkers, setDisplayedMarkers] = useState([]);
  const [activeKecamatanName, setActiveKecamatanName] = useState('');
  const [loadingMap, setLoadingMap] = useState(true);
  const [error, setError] = useState('');
  
  // Interactive Location & Filtering State
  const [mapCenter, setMapCenter] = useState(DEFAULT_TOBA_CENTER);
  const [mapZoom, setMapZoom] = useState(12);
  const [activeTarget, setActiveTarget] = useState(null);
  const [routeWaypoints, setRouteWaypoints] = useState([]);
  const [routeInfo, setRouteInfo] = useState(null);
  const [mapStyle, setMapStyle] = useState('google_streets');
  const [activeCategoryFilter, setActiveCategoryFilter] = useState('all');
  const [isPanelCollapsed, setIsPanelCollapsed] = useState(false);

  // Detail Modal & Chat Actions State
  const [selectedPoiModal, setSelectedPoiModal] = useState(null);
  const [copiedIndex, setCopiedIndex] = useState(null);

  // Live GPS Geolocation State
  const [userLocation, setUserLocation] = useState(null);
  const [gpsLoading, setGpsLoading] = useState(false);
  const [gpsError, setGpsError] = useState('');

  const handleCopyText = (text, idx) => {
    if (!text) return;
    navigator.clipboard.writeText(text);
    setCopiedIndex(idx);
    setTimeout(() => setCopiedIndex(null), 2500);
  };

  const handleClearChatMessages = () => {
    setChatMessages([
      {
        role: 'model',
        text: 'Horas! Obrolan telah dibersihkan. Silakan tanyakan destinasi wisata, kuliner autentik, sentra UMKM, atau rute transportasi di kecamatan yang ingin Anda tuju.',
        recommendedPlaces: []
      }
    ]);
  };

  // Handle Geolocation API with LocalStorage Persistence & High Accuracy
  const handleEnableGPS = (onSuccess = null) => {
    if (!navigator.geolocation) {
      setGpsError('Browser Anda tidak mendukung fitur Geolocation GPS.');
      return;
    }

    setGpsLoading(true);
    setGpsError('');

    navigator.geolocation.getCurrentPosition(
      (position) => {
        const lat = position.coords.latitude;
        const lon = position.coords.longitude;
        const coords = [lat, lon];
        
        setUserLocation(coords);
        localStorage.setItem('tobaroute_user_gps', JSON.stringify(coords));
        sessionStorage.setItem('tobaroute_user_gps', JSON.stringify(coords));
        setGpsLoading(false);

        if (activeTarget && activeTarget.latitude && activeTarget.longitude) {
          setRouteWaypoints([coords, [activeTarget.latitude, activeTarget.longitude]]);
        } else if (displayedMarkers.length === 0) {
          setMapCenter(coords);
          setMapZoom(13);
        }

        if (onSuccess) onSuccess(coords);
      },
      (err) => {
        console.warn('Gagal akses GPS:', err);
        setGpsError('Izin GPS belum aktif. Menggunakan titik acuan tersimpan.');
        setGpsLoading(false);
      },
      { enableHighAccuracy: true, timeout: 10000, maximumAge: 60000 }
    );
  };

  // Chatbot State
  const [chatMessages, setChatMessages] = useState([
    {
      role: 'model',
      text: 'Horas! Selamat datang di **TobaRoute AI Concierge** (didukung oleh Google Gemini). Anda dapat menanyakan apa saja — mulai dari rekomendasi wisata & kuliner khas, rute GPS, sejarah geosite kaldera, filosofi adat Batak & tenun Ulos, rencana itinerary, hingga pertanyaan umum lainnya layaknya ChatGPT / Gemini. Silakan ketik pertanyaan Anda di bawah!',
      recommendedPlaces: []
    }
  ]);
  const [chatInput, setChatInput] = useState('');
  const [isChatLoading, setIsChatLoading] = useState(false);
  const chatEndRef = useRef(null);

  // Fetch initial batch of all destinations for search lookup and retrieve saved GPS
  useEffect(() => {
    let isCancelled = false;

    // Safety fallback: pastikan loadingMap dihentikan maksimal setelah 2.5 detik
    const timer = setTimeout(() => {
      if (!isCancelled) setLoadingMap(false);
    }, 2500);

    const fetchAllDestinations = async () => {
      try {
        setLoadingMap(true);
        const data = await getDestinations('', 1000);
        if (!isCancelled && data) {
          setDestinations(data);
        }
      } catch (err) {
        console.error(err);
        if (!isCancelled) setError('Gagal memuat data lokasi dari server.');
      } finally {
        if (!isCancelled) setLoadingMap(false);
      }
    };

    fetchAllDestinations();

    // Check cached GPS in localStorage first
    const cachedGps = localStorage.getItem('tobaroute_user_gps') || sessionStorage.getItem('tobaroute_user_gps');
    if (cachedGps) {
      try {
        const parsed = JSON.parse(cachedGps);
        if (Array.isArray(parsed) && parsed.length === 2 && !isNaN(parsed[0]) && !isNaN(parsed[1])) {
          setUserLocation(parsed);
        }
      } catch (e) {}
    }

    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const lat = position.coords.latitude;
          const lon = position.coords.longitude;
          const isInTobaRegion = (lat >= 1.9 && lat <= 3.2 && lon >= 98.0 && lon <= 99.8);
          
          if (isInTobaRegion || !cachedGps) {
            const coords = [lat, lon];
            setUserLocation(coords);
            localStorage.setItem('tobaroute_user_gps', JSON.stringify(coords));
          }
        },
        (err) => {
          console.warn("GPS Location access pending user action.");
        },
        { enableHighAccuracy: true, timeout: 10000, maximumAge: 60000 }
      );
    }
  }, []);

  // Listen for targetLocation passed via router state (from DestinationCard, Chatbot, or Itinerary)
  useEffect(() => {
    if (location.state?.targetLocation) {
      const target = location.state.targetLocation;
      setDisplayedMarkers([target]);
      highlightLocationOnMap(target);
      if (target.kecamatan) {
        setActiveKecamatanName(target.kecamatan);
      }
      setChatMessages(prev => [
        ...prev,
        {
          role: 'model',
          text: `Navigasi rute aktif menuju **${target.nama}** (${target.kecamatan}). Peta telah difokuskan ke lokasi destinasi dengan titik awal GPS Anda!`,
          recommendedPlaces: [target]
        }
      ]);
    }
  }, [location.state]);

  // Listen for real-time focus events dispatched by floating AIChatWidget while on /explore
  useEffect(() => {
    const handleCustomFocus = (e) => {
      const target = e.detail;
      if (target && target.latitude && target.longitude) {
        setDisplayedMarkers([target]);
        highlightLocationOnMap(target);
        if (target.kecamatan) {
          setActiveKecamatanName(target.kecamatan);
        }
        setChatMessages(prev => [
          ...prev,
          {
            role: 'model',
            text: `Navigasi rute aktif menuju **${target.nama}** (${target.kecamatan}). Peta telah difokuskan ke lokasi destinasi dengan titik awal GPS Anda!`,
            recommendedPlaces: [target]
          }
        ]);
      }
    };

    window.addEventListener('tobaroute:focus_poi', handleCustomFocus);
    return () => window.removeEventListener('tobaroute:focus_poi', handleCustomFocus);
  }, [userLocation]);

  // Listen for query parameters in URL (?search=... or ?poi=... or ?name=...)
  useEffect(() => {
    if (!destinations || destinations.length === 0) return;
    const params = new URLSearchParams(location.search);
    const searchVal = params.get('search') || params.get('poi') || params.get('name') || params.get('q');
    if (searchVal && !location.state?.targetLocation) {
      const qLower = searchVal.trim().toLowerCase();
      const found = destinations.find(d => 
        String(d.id) === qLower || 
        (d.nama || '').toLowerCase() === qLower ||
        (d.nama || '').toLowerCase().includes(qLower)
      );
      if (found) {
        setDisplayedMarkers([found]);
        highlightLocationOnMap(found);
      }
    }
  }, [destinations, location.search, location.state]);

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [chatMessages]);

  // Focus location and draw road route on map strictly anchored from user GPS
  const highlightLocationOnMap = (targetObj) => {
    if (!targetObj || !targetObj.latitude || !targetObj.longitude) return;

    const targetCoords = [targetObj.latitude, targetObj.longitude];
    setActiveTarget(targetObj);
    setMapCenter(targetCoords);
    setMapZoom(14);

    if (targetObj.kecamatan) {
      setActiveKecamatanName(targetObj.kecamatan);
    }

    if (userLocation) {
      setRouteWaypoints([userLocation, targetCoords]);
    } else {
      handleEnableGPS((coords) => {
        setRouteWaypoints([coords, targetCoords]);
      });
      setRouteWaypoints([DEFAULT_START_ORIGIN, targetCoords]);
    }
  };

  // Navigasi rute dari Bandara Internasional Silangit (DTB)
  const highlightLocationFromSilangit = (targetObj) => {
    if (!targetObj || !targetObj.latitude || !targetObj.longitude) return;
    const silangitCoords = [2.2590, 98.9950]; // Titik Koordinat Bandara Silangit DTB
    const targetCoords = [targetObj.latitude, targetObj.longitude];
    setActiveTarget(targetObj);
    setMapCenter(targetCoords);
    setMapZoom(13);

    if (targetObj.kecamatan) {
      setActiveKecamatanName(targetObj.kecamatan);
    }

    setRouteWaypoints([silangitCoords, targetCoords]);
    setSelectedPoiModal(null);
  };

  // Process location query from chatbot
  const handleLocationSearch = async (e, customQuery = null) => {
    if (e) e.preventDefault();
    const queryText = customQuery || chatInput.trim();
    if (!queryText) return;

    if (!customQuery) setChatInput('');

    const updatedMessages = [...chatMessages, { role: 'user', text: queryText }];
    setChatMessages(updatedMessages);
    setIsChatLoading(true);

    try {
      const lowerQ = queryText.toLowerCase();

      // 1. Deteksi nama kecamatan / kabupaten / pulau / landmark dari kueri baru
      let matchedLocationKey = null;
      const cleanLowerQ = lowerQ.replace(/[^a-z0-9]/g, '');
      const sortedKeys = Object.keys(KECAMATAN_CENTERS).sort((a, b) => b.length - a.length);

      for (const key of sortedKeys) {
        const cleanKey = key.replace(/[^a-z0-9]/g, '');
        if (lowerQ.includes(key) || (cleanKey.length >= 4 && cleanLowerQ.includes(cleanKey))) {
          matchedLocationKey = key;
          break;
        }
      }

      const effectiveKecamatan = matchedLocationKey || (activeKecamatanName ? activeKecamatanName.toLowerCase() : '');

      if (matchedLocationKey) {
        const locInfo = KECAMATAN_CENTERS[matchedLocationKey];
        setActiveKecamatanName(locInfo.name.replace('Kecamatan ', '').replace('Kabupaten & ', '').replace('Pulau & ', ''));
        setMapCenter(locInfo.coords);
        setMapZoom(locInfo.zoom || 14);
      }

      // 2. Deteksi apakah pengguna meminta menampilkan seluruh lokasi (misal: "tunjukkan 163 lokasi" / "tampilkan semua")
      const isShowAllQuery = lowerQ.includes('tampilkan semua') || lowerQ.includes('tunjukkan semua') || lowerQ.includes('semua lokasi') || lowerQ.includes('tunjukkan 163') || lowerQ.includes('semua tempat');

      if (isShowAllQuery && effectiveKecamatan && destinations.length > 0) {
        const allInKec = destinations.filter(d => (d.kecamatan || '').toLowerCase() === effectiveKecamatan || (d.kecamatan || '').toLowerCase().includes(effectiveKecamatan));
        if (allInKec.length > 0) {
          setDisplayedMarkers(allInKec);
          setActiveCategoryFilter('all');
          
          setChatMessages([
            ...updatedMessages,
            {
              role: 'model',
              text: `Horas! Seluruh **${allInKec.length} lokasi** di wilayah **${effectiveKecamatan.toUpperCase()}** kini telah ditampilkan di peta interaktif. Anda dapat mengklik pin mana pun di peta atau kartu di samping untuk melihat rute jalan raya resmi dari lokasi GPS Anda.`,
              recommendedPlaces: allInKec
            }
          ]);
          return;
        }
      }

      // 3. Panggil API Chatbot Cerdas Universal (Gemini Flash Lite dengan Multi-turn Reasoning & POI Database Live)
      const chatRes = await sendChatMessage(queryText, updatedMessages);
      const aiText = chatRes.reply || '';
      let recommendedPlaces = chatRes.recommended_places || [];

      // Jika ada kecamatan/wilayah yang terdeteksi dari backend
      if (chatRes.target_kecamatan) {
        const rawTarget = chatRes.target_kecamatan.toLowerCase();
        const cleanTarget = rawTarget.replace(/[^a-z0-9]/g, '');
        let foundTargetKey = null;

        for (const key of sortedKeys) {
          const cleanKey = key.replace(/[^a-z0-9]/g, '');
          if (rawTarget.includes(key) || (cleanKey.length >= 4 && cleanTarget.includes(cleanKey))) {
            foundTargetKey = key;
            break;
          }
        }

        if (foundTargetKey && !matchedLocationKey) {
          const locInfo = KECAMATAN_CENTERS[foundTargetKey];
          setActiveKecamatanName(locInfo.name.replace('Kecamatan ', '').replace('Kabupaten & ', '').replace('Pulau & ', ''));
          setMapCenter(locInfo.coords);
          setMapZoom(locInfo.zoom || 14);
        } else if (!matchedLocationKey) {
          setActiveKecamatanName(chatRes.target_kecamatan);
        }
      }

      // Jika rekomendasi tempat ditemukan dari backend, tampilkan di peta dan susun rute jalan raya berurutan
      if (recommendedPlaces.length > 0) {
        setDisplayedMarkers(recommendedPlaces);
        setActiveCategoryFilter('all');
        setActiveTarget(recommendedPlaces[0]);

        const validCoords = recommendedPlaces
          .filter(p => p.latitude && p.longitude)
          .map(p => [parseFloat(p.latitude), parseFloat(p.longitude)]);

        if (validCoords.length >= 2) {
          const waypoints = userLocation ? [userLocation, ...validCoords] : validCoords;
          setRouteWaypoints(waypoints);
          setMapCenter(validCoords[0]);
          setMapZoom(14);
        } else if (validCoords.length === 1) {
          highlightLocationOnMap(recommendedPlaces[0]);
        }
      } else if (effectiveKecamatan && (lowerQ.includes('wisata') || lowerQ.includes('makan') || lowerQ.includes('kuliner') || lowerQ.includes('umkm') || lowerQ.includes('hotel'))) {
        const fallbackKec = destinations.filter(d => (d.kecamatan || '').toLowerCase() === effectiveKecamatan || (d.kecamatan || '').toLowerCase().includes(effectiveKecamatan));
        if (fallbackKec.length > 0) {
          setDisplayedMarkers(fallbackKec.slice(0, 6));
          recommendedPlaces = fallbackKec.slice(0, 4);
          setActiveTarget(fallbackKec[0]);
          const validCoords = fallbackKec.slice(0, 4)
            .filter(p => p.latitude && p.longitude)
            .map(p => [parseFloat(p.latitude), parseFloat(p.longitude)]);
          if (validCoords.length >= 2) {
            setRouteWaypoints(userLocation ? [userLocation, ...validCoords] : validCoords);
          }
        }
      }

      setChatMessages([
        ...updatedMessages,
        {
          role: 'model',
          text: aiText || 'Horas! Ada yang bisa saya bantu jelaskan lagi mengenai destinasi, rute, budaya, atau topik lainnya?',
          recommendedPlaces: recommendedPlaces
        }
      ]);
    } catch (err) {
      console.error("Explore Search Error:", err);
      // Fallback cerdas berbasis data lokal jika server backend belum aktif
      let localMatches = [];
      if (destinations && destinations.length > 0) {
        const keywords = queryText.toLowerCase().split(/\s+/).filter(k => k.length >= 3);
        localMatches = destinations.filter(d => {
          const text = `${d.nama} ${d.deskripsi_singkat || ''} ${d.kategori || ''} ${d.kecamatan || ''}`.toLowerCase();
          return keywords.some(k => text.includes(k));
        }).slice(0, 6);
      }

      let fallbackText = '';
      if (localMatches.length > 0) {
        setDisplayedMarkers(localMatches);
        setActiveCategoryFilter('all');
        highlightLocationOnMap(localMatches[0]);
        const listText = localMatches.map(p => `- **${p.nama}** (${p.kecamatan || 'Kawasan Toba'}): ${p.deskripsi_singkat || p.kategori}`).join('\n');
        fallbackText = `Horas! Berikut adalah destinasi & kuliner yang cocok dengan pencarian **"${queryText}"**:\n\n${listText}\n\n*Pin lokasi di peta interaktif telah disesuaikan.*`;
      } else {
        fallbackText = `Horas! Mohon pastikan server backend FastAPI Anda telah berjalan di port 8080 (jalankan perintah: \`uvicorn app.main:app --port 8080 --reload\` di folder backend atau jalankan file \`run_tobaguide.bat\`).`;
      }

      setChatMessages([
        ...updatedMessages,
        {
          role: 'model',
          text: fallbackText,
          recommendedPlaces: localMatches
        }
      ]);
    } finally {
      setIsChatLoading(false);
    }
  };

  // Filter markers based on active contextual category filter
  const filteredVisibleMarkers = displayedMarkers.filter(dest => {
    if (!dest.latitude || !dest.longitude) return false;
    if (activeCategoryFilter === 'all') return true;

    const destCat = (dest.kategori || '').toLowerCase();
    if (activeCategoryFilter === 'wisata' && destCat.includes('wisata')) return true;
    if (activeCategoryFilter === 'kuliner' && (destCat.includes('kuliner') || destCat.includes('resto') || destCat.includes('cafe'))) return true;
    if (activeCategoryFilter === 'umkm' && (destCat.includes('umkm') || destCat.includes('oleh') || destCat.includes('ulos') || destCat.includes('toko'))) return true;
    if (activeCategoryFilter === 'penginapan' && (destCat.includes('penginapan') || destCat.includes('hotel') || destCat.includes('homestay'))) return true;

    return false;
  });

  const countWisata = displayedMarkers.filter(d => (d.kategori || '').toLowerCase().includes('wisata')).length;
  const countUmkm = displayedMarkers.filter(d => {
    const c = (d.kategori || '').toLowerCase();
    return c.includes('umkm') || c.includes('oleh') || c.includes('ulos');
  }).length;
  const countKuliner = displayedMarkers.filter(d => {
    const c = (d.kategori || '').toLowerCase();
    return c.includes('kuliner') || c.includes('resto') || c.includes('cafe');
  }).length;

  const handleClearMarkers = () => {
    setDisplayedMarkers([]);
    setActiveTarget(null);
    setRouteWaypoints([]);
    setRouteInfo(null);
    setActiveKecamatanName('');
    setActiveCategoryFilter('all');
  };

  return (
    <div className="gmaps-layout-wrapper fade-in">
      {/* FLOATING TOP-LEFT CONTROLS (Search Bar, Contextual Filters & Map Switcher) */}
      <div className="gmaps-top-left-controls">
        {/* Floating Search Bar */}
        <form 
          className="gmaps-search-bar-card"
          onSubmit={(e) => {
            if (isPanelCollapsed) setIsPanelCollapsed(false);
            handleLocationSearch(e);
          }}
        >
          <Search size={18} color="#0284c7" />
          <input 
            type="text" 
            placeholder="Cari wisata, kuliner, UMKM di Laguboti / Balige..."
            value={chatInput}
            onChange={(e) => setChatInput(e.target.value)}
            onFocus={() => { if (isPanelCollapsed) setIsPanelCollapsed(false); }}
          />
          {chatInput && (
            <button 
              type="button" 
              onClick={() => setChatInput('')}
              style={{ background: 'transparent', border: 'none', color: '#94a3b8', cursor: 'pointer', display: 'flex', alignItems: 'center' }}
            >
              <X size={16} />
            </button>
          )}
        </form>

        {/* Row 2: Contextual Filter Pills - ONLY shown when recommendation results are active */}
        {displayedMarkers.length > 0 && (
          <div className="map-category-filter-bar">
            <button 
              className={`category-pill-btn ${activeCategoryFilter === 'all' ? 'active' : ''}`}
              onClick={() => setActiveCategoryFilter('all')}
            >
              Semua ({displayedMarkers.length}{activeKecamatanName ? ` di ${activeKecamatanName}` : ''})
            </button>
            {countWisata > 0 && (
              <button 
                className={`category-pill-btn ${activeCategoryFilter === 'wisata' ? 'active' : ''}`}
                onClick={() => setActiveCategoryFilter('wisata')}
              >
                Wisata ({countWisata})
              </button>
            )}
            {countUmkm > 0 && (
              <button 
                className={`category-pill-btn ${activeCategoryFilter === 'umkm' ? 'active' : ''}`}
                onClick={() => setActiveCategoryFilter('umkm')}
              >
                UMKM ({countUmkm})
              </button>
            )}
            {countKuliner > 0 && (
              <button 
                className={`category-pill-btn ${activeCategoryFilter === 'kuliner' ? 'active' : ''}`}
                onClick={() => setActiveCategoryFilter('kuliner')}
              >
                Kuliner ({countKuliner})
              </button>
            )}
            <button 
              className="category-pill-btn"
              onClick={handleClearMarkers}
              title="Bersihkan pin dari peta"
              style={{ color: '#ef4444', borderColor: '#fecaca', background: '#fff5f5' }}
            >
              <X size={12} /> Bersihkan
            </button>
          </div>
        )}

        {/* Row 3: Map Style Switcher & GPS Button */}
        <div className="gmaps-top-controls-row">
          <div className="gmaps-style-switcher">
            <button 
              className={`gmaps-style-btn ${mapStyle === 'osm' ? 'active' : ''}`}
              onClick={() => setMapStyle('osm')}
            >
              OSM
            </button>
            <button 
              className={`gmaps-style-btn ${mapStyle === 'google_streets' ? 'active' : ''}`}
              onClick={() => setMapStyle('google_streets')}
            >
              Google Maps
            </button>
            <button 
              className={`gmaps-style-btn ${mapStyle === 'google_satellite' ? 'active' : ''}`}
              onClick={() => setMapStyle('google_satellite')}
            >
              Satelit
            </button>
          </div>

          <button 
            className={`gmaps-gps-btn-badge ${userLocation ? 'gps-active' : ''}`}
            onClick={() => handleEnableGPS()}
            disabled={gpsLoading}
            title="Aktifkan & Pusatkan ke Lokasi GPS Anda"
            style={{
              background: userLocation ? '#f3e8ff' : '#ffffff',
              color: userLocation ? '#7c3aed' : '#0369a1',
              border: userLocation ? '1px solid #c084fc' : '1px solid #e2e8f0',
              fontWeight: 600
            }}
          >
            <LocateFixed size={14} color={userLocation ? '#7c3aed' : '#0284c7'} />
            <span>{gpsLoading ? 'Mencari GPS...' : userLocation ? 'GPS Aktif' : 'Aktifkan GPS'}</span>
          </button>
        </div>
      </div>

      {/* FLOATING ACTIVE ROAD NAVIGATION CARD (When a route is active) */}
      {activeTarget && (
        <div 
          className="floating-nav-card fade-in"
          style={{
            position: 'absolute',
            bottom: '24px',
            left: '20px',
            zIndex: 1000,
            background: 'rgba(255, 255, 255, 0.96)',
            backdropFilter: 'blur(10px)',
            borderRadius: '12px',
            boxShadow: '0 10px 25px -5px rgba(0, 0, 0, 0.15)',
            border: '1px solid #bae6fd',
            padding: '0.85rem 1.15rem',
            maxWidth: '380px',
            width: 'calc(100% - 40px)'
          }}
        >
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '0.4rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', color: '#0284c7', fontWeight: 'bold', fontSize: '0.88rem' }}>
              <RouteIcon size={16} />
              <span>Rute Jalan Raya Resmi</span>
            </div>
            <button 
              onClick={() => { setActiveTarget(null); setRouteWaypoints([]); setRouteInfo(null); }}
              style={{ background: 'transparent', border: 'none', color: '#94a3b8', cursor: 'pointer', padding: '2px' }}
              title="Tutup Navigasi"
            >
              <X size={16} />
            </button>
          </div>

          <div style={{ fontSize: '0.84rem', color: '#334155', marginBottom: '0.5rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem', color: '#6b21a8', fontWeight: 600, marginBottom: '2px' }}>
              <MapPin size={13} color="#7c3aed" /> Awal: {userLocation ? 'Lokasi GPS Anda' : 'Pusat Balige (Default)'}
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem', color: '#0f172a', fontWeight: 700 }}>
              <Navigation size={13} color="#ef4444" /> Tujuan: {activeTarget.nama} ({activeTarget.kecamatan})
            </div>
          </div>

          {routeInfo && (
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', background: '#f0f9ff', padding: '0.4rem 0.65rem', borderRadius: '6px', marginBottom: '0.6rem', fontSize: '0.8rem', color: '#0369a1', fontWeight: 600 }}>
              <span>Jarak: ~{routeInfo.distanceKm} km</span>
              <span>Waktu: ~{routeInfo.durationMin} menit</span>
            </div>
          )}

          <div style={{ display: 'flex', gap: '0.5rem' }}>
            <a 
              href={`https://www.google.com/maps/dir/?api=1&origin=${userLocation ? `${userLocation[0]},${userLocation[1]}` : `${DEFAULT_START_ORIGIN[0]},${DEFAULT_START_ORIGIN[1]}`}&destination=${activeTarget.latitude},${activeTarget.longitude}`}
              target="_blank" 
              rel="noopener noreferrer"
              style={{
                flex: 1,
                display: 'inline-flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '0.35rem',
                background: '#0284c7',
                color: 'white',
                padding: '0.45rem 0.75rem',
                borderRadius: '6px',
                fontSize: '0.8rem',
                fontWeight: 600,
                textDecoration: 'none',
                transition: 'background 0.2s'
              }}
            >
              <Navigation size={13} /> Buka di Google Maps
            </a>
            {!userLocation && (
              <button
                onClick={() => handleEnableGPS()}
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '0.3rem',
                  background: '#f3e8ff',
                  color: '#7c3aed',
                  border: '1px solid #c084fc',
                  padding: '0.45rem 0.65rem',
                  borderRadius: '6px',
                  fontSize: '0.78rem',
                  fontWeight: 600,
                  cursor: 'pointer'
                }}
              >
                <LocateFixed size={13} /> Aktifkan GPS
              </button>
            )}
          </div>
        </div>
      )}

      {/* LEAFLET FULL-BLEED MAP */}
      {loadingMap ? (
        <div style={{ height: '100%', width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#e5e3df' }}>
          <div className="spinner" style={{ borderColor: '#0284c7', borderTopColor: 'transparent', width: '40px', height: '40px' }}></div>
        </div>
      ) : (
        <MapContainer 
          key={`map-dest-${filteredVisibleMarkers.length}-${activeTarget?.id || 'none'}-${userLocation ? 'gps-on' : 'gps-off'}`}
          center={mapCenter} 
          zoom={mapZoom} 
          style={{ height: '100%', width: '100%' }}
          zoomControl={false}
        >
          <TileLayer
            attribution={MAP_STYLES[mapStyle].attribution}
            url={MAP_STYLES[mapStyle].url}
          />

          <MapFlyController centerCoords={mapCenter} zoom={mapZoom} />
          
          {/* User Live GPS Pin Marker (Starting Point A) */}
          {userLocation && (
            <Marker 
              position={userLocation} 
              icon={userGpsIcon} 
              zIndexOffset={900}
              draggable={false}
            >
              <Popup>
                <div style={{ minWidth: '160px', textAlign: 'center' }}>
                  <h4 style={{ margin: '0 0 0.2rem 0', color: '#6b21a8', fontSize: '0.9rem' }}>Lokasi Anda (GPS Aktif)</h4>
                  <p style={{ margin: 0, fontSize: '0.78rem', color: '#64748b' }}>Titik Pangkal / Keberangkatan Awal</p>
                </div>
              </Popup>
            </Marker>
          )}

          {/* Default Start Origin Marker if GPS is not enabled and route is active */}
          {!userLocation && routeWaypoints.length >= 2 && (
            <Marker 
              position={routeWaypoints[0]} 
              icon={userGpsIcon} 
              zIndexOffset={900}
              draggable={false}
            >
              <Popup>
                <div style={{ minWidth: '160px', textAlign: 'center' }}>
                  <h4 style={{ margin: '0 0 0.2rem 0', color: '#6b21a8', fontSize: '0.9rem' }}>Titik Keberangkatan Awal</h4>
                  <p style={{ margin: 0, fontSize: '0.78rem', color: '#64748b' }}>Pusat Balige (Default)</p>
                </div>
              </Popup>
            </Marker>
          )}

          {/* Real Road Routing Engine (Clean OSRM Road Polyline) */}
          {routeWaypoints.length >= 2 && (
            <RoutingMachine waypoints={routeWaypoints} onRouteInfo={setRouteInfo} />
          )}

          {/* Guaranteed Active Target Destination Red Pin Marker */}
          {activeTarget && activeTarget.latitude && activeTarget.longitude && (
            <Marker 
              key={`active-target-${activeTarget.id || activeTarget.nama}`} 
              position={[activeTarget.latitude, activeTarget.longitude]} 
              icon={activeTargetIcon}
              zIndexOffset={1000}
            >
              <Popup autoOpen={true}>
                <div style={{ minWidth: '220px' }}>
                  <div style={{ background: '#ef4444', color: 'white', padding: '0.25rem 0.5rem', borderRadius: '4px', fontSize: '0.75rem', fontWeight: 'bold', marginBottom: '0.4rem', display: 'inline-flex', alignItems: 'center', gap: '0.25rem' }}>
                    <MapPin size={12} /> Target Navigasi Rute
                  </div>
                  <h4 style={{ margin: '0 0 0.4rem 0', color: 'var(--color-primary-dark)' }}>
                    {activeTarget.nama}
                  </h4>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.25rem', marginBottom: '0.4rem', fontSize: '0.85rem', color: '#64748b' }}>
                    <Navigation size={12} /> {activeTarget.kecamatan}
                  </div>
                  {activeTarget.rating && (
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.25rem', marginBottom: '0.5rem', fontSize: '0.85rem', color: '#64748b' }}>
                      <Star size={12} fill="#fbbf24" color="#fbbf24" /> {activeTarget.rating}
                    </div>
                  )}
                  <p style={{ margin: '0', fontSize: '0.85rem', lineHeight: '1.4' }}>
                    {formatDescription(activeTarget.deskripsi_singkat)}
                  </p>
                </div>
              </Popup>
            </Marker>
          )}

          {/* Render ONLY Requested / Recommended Places (Clean & Focused) */}
          {filteredVisibleMarkers.map((dest, idx) => {
            if (!dest.latitude || !dest.longitude) return null;
            if (activeTarget && (activeTarget.id === dest.id || activeTarget.nama.trim().toLowerCase() === dest.nama.trim().toLowerCase())) {
              return null;
            }
            const orderNum = filteredVisibleMarkers.length <= 8 ? idx + 1 : null;
            const icon = getMarkerIconByCategory(dest.kategori, false, orderNum);

            return (
              <Marker 
                key={`disp-marker-${dest.id || idx}-${dest.nama}`} 
                position={[dest.latitude, dest.longitude]} 
                icon={icon}
              >
                <Popup>
                  <div style={{ minWidth: '220px' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.3rem' }}>
                      <span className={`rec-card-badge badge-cat-${(dest.kategori || 'wisata').toLowerCase()}`}>
                        {dest.kategori || 'Wisata'}
                      </span>
                      {dest.rating && (
                        <span style={{ fontSize: '0.8rem', fontWeight: 'bold', color: '#b45309', display: 'flex', alignItems: 'center', gap: '2px' }}>
                          <Star size={12} fill="#fbbf24" color="#fbbf24" /> {dest.rating}
                        </span>
                      )}
                    </div>

                    <h4 style={{ margin: '0 0 0.3rem 0', color: 'var(--color-primary-dark)', fontSize: '0.92rem' }}>
                      {dest.nama}
                    </h4>
                    
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.25rem', marginBottom: '0.4rem', fontSize: '0.82rem', color: '#64748b' }}>
                      <Navigation size={12} /> {dest.kecamatan}
                    </div>

                    <p style={{ margin: '0 0 0.5rem 0', fontSize: '0.82rem', lineHeight: '1.4', color: '#475569' }}>
                      {formatDescription(dest.deskripsi_singkat)}
                    </p>
                    
                    <button
                      onClick={() => highlightLocationOnMap(dest)}
                      style={{
                        width: '100%',
                        background: '#0284c7',
                        color: 'white',
                        border: 'none',
                        borderRadius: '6px',
                        padding: '0.4rem',
                        fontSize: '0.8rem',
                        fontWeight: 600,
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        gap: '0.3rem'
                      }}
                    >
                      <RouteIcon size={13} /> Rute dari GPS Saya
                    </button>
                  </div>
                </Popup>
              </Marker>
            );
          })}
        </MapContainer>
      )}

      {/* FLOATING RIGHT SIDE PROFESSIONAL AI CHATBOT PANEL */}
      <div className={`gmaps-right-panel ${isPanelCollapsed ? 'collapsed' : ''}`}>
        {isPanelCollapsed ? (
          <button 
            className="gmaps-collapsed-btn"
            onClick={() => setIsPanelCollapsed(false)}
          >
            <Sparkles size={16} color="#0284c7" />
            <span>Asisten TobaRoute</span>
          </button>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', height: '100%', overflow: 'hidden' }}>
            {/* Professional Card Header */}
            <div className="gmaps-panel-header-pro">
              <div className="header-title-flex">
                <div className="bot-avatar-badge">
                  <Sparkles size={20} color="#0284c7" />
                </div>
                <div>
                  <h3 style={{ fontSize: '0.94rem', margin: 0, fontWeight: '700', color: '#0f172a' }}>
                    Asisten TobaRoute AI
                  </h3>
                  <div style={{ fontSize: '0.75rem', color: '#64748b', marginTop: '2px' }}>
                    Navigasi presisi & pemandu RAG Danau Toba
                  </div>
                </div>
              </div>

              <div style={{ display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
                <button 
                  className="gmaps-panel-close-btn"
                  onClick={handleClearChatMessages}
                  title="Bersihkan Percakapan Chat"
                  style={{ color: '#64748b' }}
                >
                  <Trash2 size={15} />
                </button>
                <button 
                  className="gmaps-panel-close-btn"
                  onClick={() => setIsPanelCollapsed(true)}
                  title="Sembunyikan Panel"
                >
                  <X size={16} />
                </button>
              </div>
            </div>

            {/* Quick Location Chips */}
            <div className="location-quick-chips">
              <div className="chips-label"><Compass size={12} /> Inspirasi Cepat:</div>
              <div className="chips-list">
                {QUICK_LOCATIONS.map((loc, idx) => (
                  <button key={idx} onClick={() => handleLocationSearch(null, loc.query)}>
                    {loc.name}
                  </button>
                ))}
              </div>
            </div>

            {/* Chat Messages Stream with Rich Typography & Multiple Recommendation Cards */}
            <div className="chat-panel-messages">
              {chatMessages.map((msg, idx) => (
                <div key={idx} className={`chat-message ${msg.role}`}>
                  <div className="message-icon">
                    {msg.role === 'model' ? <Bot size={16} /> : <User size={16} />}
                  </div>
                  <div className="message-content">
                    {msg.role === 'model' ? (
                      <>
                        <ReactMarkdown>{msg.text}</ReactMarkdown>
                        
                        {/* Copy Action Button */}
                        <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '0.4rem' }}>
                          <button
                            onClick={() => handleCopyText(msg.text, idx)}
                            style={{
                              background: 'transparent',
                              border: 'none',
                              color: '#94a3b8',
                              cursor: 'pointer',
                              fontSize: '0.72rem',
                              display: 'inline-flex',
                              alignItems: 'center',
                              gap: '4px',
                              padding: '0.15rem 0.35rem',
                              borderRadius: '4px'
                            }}
                            title="Salin Teks Jawaban"
                          >
                            {copiedIndex === idx ? <Check size={13} color="#16a34a" /> : <Copy size={13} />}
                            <span style={{ color: copiedIndex === idx ? '#16a34a' : '#94a3b8' }}>
                              {copiedIndex === idx ? 'Disalin!' : 'Salin Jawaban'}
                            </span>
                          </button>
                        </div>
                        
                        {/* Multiple Recommendation Cards */}
                        {msg.recommendedPlaces && msg.recommendedPlaces.length > 0 && (
                          <div className="rec-cards-container">
                            {msg.recommendedPlaces.slice(0, 4).map((place, pIdx) => {
                              const catKey = (place.kategori || 'wisata').toLowerCase();
                              return (
                                <div key={place.id || pIdx} className="rec-card-item">
                                  <div className="rec-card-top">
                                    <div className="rec-card-title">
                                      <MapPin size={14} color="#ef4444" />
                                      <span>{place.nama}</span>
                                    </div>
                                    <span className={`rec-card-badge badge-cat-${catKey}`}>
                                      {place.kategori || 'Wisata'}
                                    </span>
                                  </div>
                                  
                                  <div className="rec-card-sub">
                                    {place.kecamatan} {place.rating ? `• Rating ${place.rating}` : ''} • {formatDescription(place.deskripsi_singkat)}
                                  </div>

                                  <div style={{ display: 'flex', gap: '0.35rem', marginTop: '0.4rem' }}>
                                    <button 
                                      className="rec-card-action-btn"
                                      onClick={() => highlightLocationOnMap(place)}
                                      title="Lihat Rute di Peta"
                                      style={{ flex: 1 }}
                                    >
                                      <RouteIcon size={13} /> Rute di Peta
                                    </button>
                                    <button 
                                      className="rec-card-action-btn"
                                      onClick={() => setSelectedPoiModal(place)}
                                      title="Lihat Detail Lengkap"
                                      style={{ background: '#f1f5f9', color: '#334155', border: '1px solid #cbd5e1' }}
                                    >
                                      <Info size={13} /> Detail
                                    </button>
                                  </div>
                                </div>
                              );
                            })}
                          </div>
                        )}
                      </>
                    ) : (
                      msg.text
                    )}
                  </div>
                </div>
              ))}

              {isChatLoading && (
                <div className="chat-message model">
                  <div className="message-icon"><Bot size={16} /></div>
                  <div className="message-content loading">
                    <span className="dot"></span>
                    <span className="dot"></span>
                    <span className="dot"></span>
                  </div>
                </div>
              )}
              <div ref={chatEndRef} />
            </div>

            {/* Bottom Chat Input Form */}
            <form className="chat-panel-input" onSubmit={handleLocationSearch}>
              <input 
                type="text" 
                placeholder="Tanyakan lokasi, rute, atau kuliner di kecamatan..." 
                value={chatInput}
                onChange={(e) => setChatInput(e.target.value)}
                disabled={isChatLoading}
              />
              <button type="submit" disabled={!chatInput.trim() || isChatLoading}>
                <Send size={16} />
              </button>
            </form>
          </div>
        )}
      </div>

      {/* POI DETAIL MODAL OVERLAY */}
      {selectedPoiModal && (
        <div 
          className="modal-backdrop fade-in" 
          style={{
            position: 'fixed',
            top: 0,
            left: 0,
            width: '100vw',
            height: '100vh',
            background: 'rgba(15, 23, 42, 0.65)',
            backdropFilter: 'blur(8px)',
            zIndex: 9999,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '1rem'
          }} 
          onClick={() => setSelectedPoiModal(null)}
        >
          <div 
            className="modal-content-card glass-panel fade-in-up" 
            style={{
              background: 'white',
              borderRadius: '16px',
              maxWidth: '540px',
              width: '100%',
              maxHeight: '90vh',
              overflowY: 'auto',
              boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)',
              padding: '0',
              position: 'relative'
            }} 
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header Banner */}
            <div style={{
              position: 'relative',
              height: '180px',
              background: 'linear-gradient(135deg, #0284c7 0%, #0369a1 100%)',
              borderTopLeftRadius: '16px',
              borderTopRightRadius: '16px',
              overflow: 'hidden',
              display: 'flex',
              alignItems: 'flex-end',
              padding: '1.25rem'
            }}>
              {selectedPoiModal.gambar_url && (
                <img 
                  src={selectedPoiModal.gambar_url} 
                  alt={selectedPoiModal.nama} 
                  style={{
                    position: 'absolute',
                    top: 0,
                    left: 0,
                    width: '100%',
                    height: '100%',
                    objectFit: 'cover',
                    opacity: 0.75
                  }} 
                />
              )}
              <div style={{
                position: 'absolute',
                top: 0,
                left: 0,
                width: '100%',
                height: '100%',
                background: 'linear-gradient(to top, rgba(15, 23, 42, 0.85) 0%, transparent 70%)'
              }} />

              <button 
                onClick={() => setSelectedPoiModal(null)}
                style={{
                  position: 'absolute',
                  top: '12px',
                  right: '12px',
                  background: 'rgba(255, 255, 255, 0.9)',
                  border: 'none',
                  borderRadius: '50%',
                  width: '32px',
                  height: '32px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  cursor: 'pointer',
                  color: '#0f172a',
                  zIndex: 2,
                  boxShadow: '0 2px 6px rgba(0,0,0,0.2)'
                }}
              >
                <X size={18} />
              </button>

              <div style={{ position: 'relative', zIndex: 1, color: 'white' }}>
                <div style={{ display: 'flex', gap: '0.4rem', marginBottom: '0.35rem', flexWrap: 'wrap' }}>
                  <span className={`rec-card-badge badge-cat-${(selectedPoiModal.kategori || 'wisata').toLowerCase()}`}>
                    {selectedPoiModal.kategori || 'Wisata'}
                  </span>
                  {selectedPoiModal.rating && (
                    <span style={{ background: 'rgba(251, 191, 36, 0.95)', color: '#78350f', padding: '0.15rem 0.5rem', borderRadius: '20px', fontSize: '0.75rem', fontWeight: 700, display: 'inline-flex', alignItems: 'center', gap: '3px' }}>
                      <Star size={12} fill="#78350f" color="#78350f" /> {selectedPoiModal.rating}
                    </span>
                  )}
                </div>
                <h2 style={{ margin: 0, fontSize: '1.35rem', fontWeight: 800, textShadow: '0 2px 4px rgba(0,0,0,0.5)' }}>
                  {selectedPoiModal.nama}
                </h2>
              </div>
            </div>

            {/* Body Content */}
            <div style={{ padding: '1.25rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', color: '#64748b', fontSize: '0.88rem', marginBottom: '1rem', fontWeight: 500 }}>
                <MapPin size={16} color="#ef4444" />
                <span>{selectedPoiModal.nama_jalan || `Kecamatan ${selectedPoiModal.kecamatan}, Kabupaten Toba`}</span>
              </div>

              {/* Quick Details Table */}
              <div style={{
                background: '#f8fafc',
                border: '1px solid #e2e8f0',
                borderRadius: '10px',
                padding: '0.85rem',
                marginBottom: '1rem',
                display: 'grid',
                gridTemplateColumns: '1fr 1fr',
                gap: '0.75rem',
                fontSize: '0.82rem'
              }}>
                <div>
                  <span style={{ color: '#94a3b8', display: 'flex', alignItems: 'center', gap: '4px', marginBottom: '2px' }}>
                    <Navigation size={13} /> Wilayah / Kecamatan
                  </span>
                  <strong style={{ color: '#0f172a' }}>Kecamatan {selectedPoiModal.kecamatan}</strong>
                </div>
                <div>
                  <span style={{ color: '#94a3b8', display: 'flex', alignItems: 'center', gap: '4px', marginBottom: '2px' }}>
                    <Clock size={13} /> Status Operasional
                  </span>
                  <strong style={{ color: '#16a34a' }}>Beroperasi Resmi</strong>
                </div>
              </div>

              {/* Description */}
              <div style={{ marginBottom: '1rem' }}>
                <h4 style={{ margin: '0 0 0.4rem 0', fontSize: '0.95rem', color: '#0f172a', fontWeight: 700 }}>
                  Informasi & Deskripsi Lengkap
                </h4>
                <p style={{ margin: 0, fontSize: '0.88rem', color: '#334155', lineHeight: '1.6' }}>
                  {formatDescription(selectedPoiModal.deskripsi_lengkap || selectedPoiModal.deskripsi_singkat)}
                </p>
              </div>

              {/* SECTION PANDUAN AKSES TRANSPORTASI WISATAWAN */}
              {(() => {
                const modalTransport = getClientTransportGuide(selectedPoiModal);
                if (!modalTransport) return null;
                return (
                  <div style={{
                    background: '#f0fdf4',
                    border: '1.5px solid #86efac',
                    borderRadius: '12px',
                    padding: '1rem',
                    marginBottom: '1.25rem'
                  }}>
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.75rem' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.45rem', color: '#166534', fontWeight: 800, fontSize: '0.95rem' }}>
                        <Bus size={18} color="#16a34a" />
                        <span>Panduan Akses & Transportasi Wisatawan</span>
                      </div>
                      <span style={{ background: '#dcfce7', color: '#15803d', fontSize: '0.72rem', fontWeight: 700, padding: '0.2rem 0.55rem', borderRadius: '20px' }}>
                        Terverifikasi
                      </span>
                    </div>

                    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.65rem', fontSize: '0.82rem' }}>
                      {/* 1. Akses Bandara Silangit */}
                      <div style={{ background: '#ffffff', border: '1px solid #cbd5e1', borderRadius: '8px', padding: '0.65rem' }}>
                        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.25rem' }}>
                          <span style={{ display: 'flex', alignItems: 'center', gap: '4px', fontWeight: 700, color: '#0284c7' }}>
                            <Plane size={14} /> Dari Bandara Silangit (DTB)
                          </span>
                          <strong style={{ color: '#0f172a', fontSize: '0.78rem' }}>
                            {modalTransport.durasi_bandara} ({modalTransport.jarak_bandara_km} km)
                          </strong>
                        </div>
                        <p style={{ margin: 0, color: '#475569', fontSize: '0.78rem', lineHeight: '1.4' }}>
                          {modalTransport.bandara_access?.rute_utama}. Tersedia Taksi Bandara, DAMRI Shuttle, dan Rental Mobil Bandara.
                        </p>
                      </div>

                      {/* 2. Angkutan Umum & Ojek */}
                      <div style={{ background: '#ffffff', border: '1px solid #cbd5e1', borderRadius: '8px', padding: '0.65rem' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '4px', fontWeight: 700, color: '#16a34a', marginBottom: '0.25rem' }}>
                          <Bus size={14} /> Angkutan Umum & Ojek Lokal
                        </div>
                        <div style={{ color: '#334155', fontSize: '0.78rem', lineHeight: '1.4' }}>
                          <div>• <strong>Trayek:</strong> {modalTransport.angkutan_umum?.trayek}</div>
                          <div>• <strong>Ongkos:</strong> <span style={{ color: '#15803d', fontWeight: 700 }}>{modalTransport.angkutan_umum?.estimasi_tarif}</span></div>
                          <div>• <strong>Titik Turun:</strong> {modalTransport.angkutan_umum?.titik_turun}</div>
                        </div>
                      </div>

                      {/* 3. Kapal Feri (Jika Ada) */}
                      {modalTransport.kapal_feri && modalTransport.kapal_feri.dermaga_pilihan && modalTransport.kapal_feri.dermaga_pilihan[0] && (
                        <div style={{ background: '#ffffff', border: '1px solid #cbd5e1', borderRadius: '8px', padding: '0.65rem' }}>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '4px', fontWeight: 700, color: '#0369a1', marginBottom: '0.25rem' }}>
                            <Ship size={14} /> Penyeberangan Feri Danau Toba
                          </div>
                          <div style={{ color: '#334155', fontSize: '0.78rem', lineHeight: '1.4' }}>
                            <div>• <strong>Rute:</strong> {modalTransport.kapal_feri.dermaga_pilihan[0].rute}</div>
                            <div>• <strong>Kapal & Jadwal:</strong> {modalTransport.kapal_feri.dermaga_pilihan[0].kapal} ({modalTransport.kapal_feri.dermaga_pilihan[0].jadwal})</div>
                            <div>• <strong>Tarif:</strong> {modalTransport.kapal_feri.dermaga_pilihan[0].tarif_orang}</div>
                          </div>
                        </div>
                      )}

                      {/* 4. Rental Kendaraan & Kondisi Jalan */}
                      <div style={{ background: '#ffffff', border: '1px solid #cbd5e1', borderRadius: '8px', padding: '0.65rem' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '4px', fontWeight: 700, color: '#d97706', marginBottom: '0.25rem' }}>
                          <Car size={14} /> Sewa Kendaraan & Kondisi Jalan
                        </div>
                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.4rem', marginBottom: '0.3rem', fontSize: '0.76rem' }}>
                          <span style={{ background: '#f8fafc', padding: '0.25rem 0.4rem', borderRadius: '4px', border: '1px solid #e2e8f0' }}>
                            🛵 <strong>Sewa Motor:</strong> {modalTransport.kendaraan_pribadi?.sewa_motor?.estimasi_tarif || 'Rp 80rb/hari'}
                          </span>
                          <span style={{ background: '#f8fafc', padding: '0.25rem 0.4rem', borderRadius: '4px', border: '1px solid #e2e8f0' }}>
                            🚗 <strong>Mobil + Sopir:</strong> {modalTransport.kendaraan_pribadi?.sewa_mobil?.estimasi_tarif || 'Rp 500rb/hari'}
                          </span>
                        </div>
                        <p style={{ margin: 0, color: '#64748b', fontSize: '0.74rem' }}>
                          🛣️ {modalTransport.kendaraan_pribadi?.kondisi_akses}
                        </p>
                      </div>
                    </div>
                  </div>
                );
              })()}

              {/* Action Buttons */}
              <div style={{ display: 'flex', gap: '0.6rem', flexWrap: 'wrap' }}>
                <button 
                  onClick={() => {
                    const item = selectedPoiModal;
                    setSelectedPoiModal(null);
                    highlightLocationOnMap(item);
                  }}
                  style={{
                    flex: '1 1 180px',
                    background: '#0284c7',
                    color: 'white',
                    border: 'none',
                    borderRadius: '8px',
                    padding: '0.65rem 1rem',
                    fontSize: '0.86rem',
                    fontWeight: 700,
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '0.4rem'
                  }}
                >
                  <RouteIcon size={16} /> Navigasi dari GPS Saya
                </button>

                <button 
                  onClick={() => {
                    const item = selectedPoiModal;
                    highlightLocationFromSilangit(item);
                  }}
                  style={{
                    flex: '1 1 180px',
                    background: '#0f766e',
                    color: 'white',
                    border: 'none',
                    borderRadius: '8px',
                    padding: '0.65rem 1rem',
                    fontSize: '0.86rem',
                    fontWeight: 700,
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '0.4rem'
                  }}
                >
                  <Plane size={16} /> Rute dari Bandara Silangit
                </button>
                
                <a 
                  href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(selectedPoiModal.nama + ' ' + (selectedPoiModal.kecamatan || ''))}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  style={{
                    background: '#f1f5f9',
                    color: '#334155',
                    border: '1px solid #cbd5e1',
                    borderRadius: '8px',
                    padding: '0.65rem 1rem',
                    fontSize: '0.86rem',
                    fontWeight: 600,
                    textDecoration: 'none',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '0.35rem'
                  }}
                >
                  <ExternalLink size={15} /> Google Maps
                </a>
              </div>
            </div>

          </div>
        </div>
      )}
    </div>
  );
};

export default Explore;


