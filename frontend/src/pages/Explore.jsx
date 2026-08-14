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
import { Map, AlertCircle, Navigation, Star, Send, Bot, User, Compass, Route as RouteIcon, MapPin, Search, ChevronLeft, Menu, LocateFixed, X, Sparkles, Layers, Store, Utensils, Hotel, Car } from 'lucide-react';
import ReactMarkdown from 'react-markdown';
import RoutingMachine from '../components/RoutingMachine';

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

// Verified Crisp Marker Icons
const wisataIcon = new L.Icon({
  iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-blue.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/0.7.7/images/marker-shadow.png',
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41]
});

const kulinerIcon = new L.Icon({
  iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-orange.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/0.7.7/images/marker-shadow.png',
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41]
});

const umkmIcon = new L.Icon({
  iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-green.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/0.7.7/images/marker-shadow.png',
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41]
});

const hotelIcon = new L.Icon({
  iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-gold.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/0.7.7/images/marker-shadow.png',
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41]
});

const transportIcon = new L.Icon({
  iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-grey.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/0.7.7/images/marker-shadow.png',
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41]
});

const activeTargetIcon = new L.Icon({
  iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-red.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/0.7.7/images/marker-shadow.png',
  iconSize: [32, 50],
  iconAnchor: [16, 50],
  popupAnchor: [1, -40],
  shadowSize: [41, 41]
});

const userGpsIcon = new L.Icon({
  iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-violet.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/0.7.7/images/marker-shadow.png',
  iconSize: [32, 50],
  iconAnchor: [16, 50],
  popupAnchor: [1, -40],
  shadowSize: [41, 41]
});

const getMarkerIconByCategory = (category = '') => {
  const cat = String(category).toLowerCase();
  if (cat.includes('kuliner') || cat.includes('makan') || cat.includes('resto') || cat.includes('cafe')) {
    return kulinerIcon;
  }
  if (cat.includes('umkm') || cat.includes('oleh') || cat.includes('ulos') || cat.includes('toko')) {
    return umkmIcon;
  }
  if (cat.includes('penginapan') || cat.includes('hotel') || cat.includes('homestay')) {
    return hotelIcon;
  }
  if (cat.includes('transportasi') || cat.includes('mobil') || cat.includes('kapal')) {
    return transportIcon;
  }
  return wisataIcon;
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
  'laguboti': { name: 'Kecamatan Laguboti', coords: [2.3544, 99.1264] },
  'balige': { name: 'Kecamatan Balige', coords: [2.3387, 99.0625] },
  'sigumpar': { name: 'Kecamatan Sigumpar', coords: [2.3920, 99.1550] },
  'porsea': { name: 'Kecamatan Porsea', coords: [2.4475, 99.1538] },
  'silaen': { name: 'Kecamatan Silaen', coords: [2.3870, 99.2051] },
  'tampahan': { name: 'Kecamatan Tampahan', coords: [2.3160, 99.0125] },
  'lumban julu': { name: 'Kecamatan Lumban Julu', coords: [2.6010, 99.0480] },
  'ajibata': { name: 'Kecamatan Ajibata', coords: [2.6650, 98.9320] },
  'parapat': { name: 'Kecamatan Parapat', coords: [2.6620, 98.9350] },
  'girsang sipangan bolon': { name: 'Kecamatan Girsang Sipangan Bolon', coords: [2.6620, 98.9350] },
  'pangururan': { name: 'Kecamatan Pangururan', coords: [2.6033, 98.7050] },
  'simanindo': { name: 'Kecamatan Simanindo', coords: [2.7252, 98.7869] },
  'harian': { name: 'Kecamatan Harian', coords: [2.5830, 98.6330] },
  'sianjur mulamula': { name: 'Kecamatan Sianjur Mulamula', coords: [2.5890, 98.6420] },
  'onan runggu': { name: 'Kecamatan Onan Runggu', coords: [2.5020, 98.9210] },
  'palipi': { name: 'Kecamatan Palipi', coords: [2.4450, 98.7900] },
  'ronggur nihuta': { name: 'Kecamatan Ronggur Nihuta', coords: [2.5800, 98.7700] },
  'muara': { name: 'Kecamatan Muara', coords: [2.3378, 98.9048] },
  'baktiraja': { name: 'Kecamatan Baktiraja', coords: [2.3250, 98.8150] },
  'doloksanggul': { name: 'Kecamatan Doloksanggul', coords: [2.2570, 98.7510] },
  'pollung': { name: 'Kecamatan Pollung', coords: [2.3100, 98.6800] },
  'berastagi': { name: 'Kecamatan Berastagi', coords: [3.1870, 98.5110] },
  'sidikalang': { name: 'Kecamatan Sidikalang', coords: [2.7480, 98.3120] },
  'tarutung': { name: 'Kecamatan Tarutung', coords: [2.0250, 98.9730] }
};

const QUICK_LOCATIONS = [
  { name: 'Kecamatan Laguboti', query: 'Tunjukkan destinasi wisata dan rute di Laguboti' },
  { name: 'Kecamatan Balige', query: 'Tunjukkan destinasi wisata dan rute di Balige' },
  { name: 'Pantai Lumban Bulbul', query: 'Di mana lokasi Pantai Pasir Putih Lumban Bulbul Balige?' },
  { name: 'Pantai Pardinggaran', query: 'Di mana lokasi Pantai Pardinggaran Laguboti?' },
  { name: 'Mual Sirambe', query: 'Di mana lokasi Mual Sirambe Sitangkola Laguboti?' },
  { name: 'Museum TB Silalahi', query: 'Di mana lokasi Museum Batak T.B. Silalahi Center?' },
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

  // Live GPS Geolocation State
  const [userLocation, setUserLocation] = useState(null);
  const [gpsLoading, setGpsLoading] = useState(false);
  const [gpsError, setGpsError] = useState('');

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
      text: 'Selamat datang di **TobaRoute AI**. Silakan tanyakan destinasi wisata, kuliner, atau sentra UMKM di kecamatan yang ingin Anda tuju (misalnya *"Wisata dan UMKM di Laguboti"*). Pin lokasi akurat dan rute navigasi dari GPS Anda akan otomatis ditampilkan di peta.',
      recommendedPlaces: []
    }
  ]);
  const [chatInput, setChatInput] = useState('');
  const [isChatLoading, setIsChatLoading] = useState(false);
  const chatEndRef = useRef(null);

  // Fetch initial batch of all destinations for search lookup and retrieve saved GPS
  useEffect(() => {
    const fetchAllDestinations = async () => {
      try {
        setLoadingMap(true);
        const data = await getDestinations('', 1000);
        setDestinations(data);
      } catch (err) {
        console.error(err);
        setError('Gagal memuat data lokasi dari server.');
      } finally {
        setLoadingMap(false);
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

  // Listen for targetLocation passed via router state (from DestinationCard)
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

      let matchedKecamatanKey = null;
      Object.keys(KECAMATAN_CENTERS).forEach(key => {
        if (lowerQ.includes(key)) {
          matchedKecamatanKey = key;
        }
      });

      if (matchedKecamatanKey) {
        const kecInfo = KECAMATAN_CENTERS[matchedKecamatanKey];
        setActiveKecamatanName(kecInfo.name.replace('Kecamatan ', ''));
        setMapCenter(kecInfo.coords);
        setMapZoom(14);
      }

      const recData = await getFairRecommendation(
        queryText, 
        matchedKecamatanKey ? matchedKecamatanKey : '',
        0,
        userLocation ? userLocation[0] : null,
        userLocation ? userLocation[1] : null
      );
      
      const mainDests = recData.destinasi_utama || [];
      const umkmDests = recData.rekomendasi_umkm_sekitar || [];
      const allRecommendations = [...mainDests, ...umkmDests];

      // HANYA tampilkan pin-pin rekomendasi yang relevan untuk query / kecamatan ini
      setDisplayedMarkers(allRecommendations);
      setActiveCategoryFilter('all');

      let matchedTarget = null;
      if (mainDests.length > 0) {
        matchedTarget = mainDests[0];
      } else if (umkmDests.length > 0) {
        matchedTarget = umkmDests[0];
      } else {
        matchedTarget = destinations.find(d => 
          d.nama.toLowerCase().includes(lowerQ) || 
          lowerQ.includes(d.nama.toLowerCase())
        );
        if (matchedTarget) {
          setDisplayedMarkers([matchedTarget]);
        }
      }

      let aiText = recData.ai_response;
      if (!aiText) {
        const chatRes = await sendChatMessage(queryText, chatMessages);
        aiText = chatRes.reply;
      }

      setChatMessages([
        ...updatedMessages,
        {
          role: 'model',
          text: aiText,
          recommendedPlaces: allRecommendations
        }
      ]);

      if (matchedTarget) {
        highlightLocationOnMap(matchedTarget);
      }
    } catch (err) {
      console.error(err);
      setChatMessages([
        ...updatedMessages,
        {
          role: 'model',
          text: 'Mohon maaf, terjadi kendala saat mencari lokasi. Pastikan server backend uvicorn aktif.',
          recommendedPlaces: []
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
              ✨ Semua ({displayedMarkers.length}{activeKecamatanName ? ` di ${activeKecamatanName}` : ''})
            </button>
            {countWisata > 0 && (
              <button 
                className={`category-pill-btn ${activeCategoryFilter === 'wisata' ? 'active' : ''}`}
                onClick={() => setActiveCategoryFilter('wisata')}
              >
                🏞️ Wisata ({countWisata})
              </button>
            )}
            {countUmkm > 0 && (
              <button 
                className={`category-pill-btn ${activeCategoryFilter === 'umkm' ? 'active' : ''}`}
                onClick={() => setActiveCategoryFilter('umkm')}
              >
                🛍️ UMKM ({countUmkm})
              </button>
            )}
            {countKuliner > 0 && (
              <button 
                className={`category-pill-btn ${activeCategoryFilter === 'kuliner' ? 'active' : ''}`}
                onClick={() => setActiveCategoryFilter('kuliner')}
              >
                🍜 Kuliner ({countKuliner})
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
              <span>📏 Jarak: ~{routeInfo.distanceKm} km</span>
              <span>⏱️ Waktu: ~{routeInfo.durationMin} menit</span>
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
              draggable={true}
              eventHandlers={{
                dragend: (e) => {
                  const latLng = e.target.getLatLng();
                  const newCoords = [latLng.lat, latLng.lng];
                  setUserLocation(newCoords);
                  localStorage.setItem('tobaroute_user_gps', JSON.stringify(newCoords));
                  sessionStorage.setItem('tobaroute_user_gps', JSON.stringify(newCoords));
                  if (activeTarget && activeTarget.latitude && activeTarget.longitude) {
                    setRouteWaypoints([newCoords, [activeTarget.latitude, activeTarget.longitude]]);
                  }
                }
              }}
            >
              <Popup>
                <div style={{ minWidth: '160px', textAlign: 'center' }}>
                  <h4 style={{ margin: '0 0 0.2rem 0', color: '#6b21a8', fontSize: '0.9rem' }}>📍 Lokasi Anda (GPS Aktif)</h4>
                  <p style={{ margin: 0, fontSize: '0.78rem', color: '#64748b' }}>Titik Pangkal / Keberangkatan Awal</p>
                  <div style={{ marginTop: '0.35rem', fontSize: '0.72rem', color: '#0284c7', background: '#f0f9ff', padding: '0.2rem 0.4rem', borderRadius: '4px' }}>
                    💡 Geser pin ini untuk ubah lokasi GPS Anda
                  </div>
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
              draggable={true}
              eventHandlers={{
                dragend: (e) => {
                  const latLng = e.target.getLatLng();
                  const newCoords = [latLng.lat, latLng.lng];
                  setUserLocation(newCoords);
                  localStorage.setItem('tobaroute_user_gps', JSON.stringify(newCoords));
                  sessionStorage.setItem('tobaroute_user_gps', JSON.stringify(newCoords));
                  if (activeTarget && activeTarget.latitude && activeTarget.longitude) {
                    setRouteWaypoints([newCoords, [activeTarget.latitude, activeTarget.longitude]]);
                  }
                }
              }}
            >
              <Popup>
                <div style={{ minWidth: '160px', textAlign: 'center' }}>
                  <h4 style={{ margin: '0 0 0.2rem 0', color: '#6b21a8', fontSize: '0.9rem' }}>Titik Keberangkatan Awal</h4>
                  <p style={{ margin: 0, fontSize: '0.78rem', color: '#64748b' }}>Pusat Balige (Default)</p>
                  <div style={{ marginTop: '0.35rem', fontSize: '0.72rem', color: '#0284c7', background: '#f0f9ff', padding: '0.2rem 0.4rem', borderRadius: '4px' }}>
                    💡 Geser pin ini untuk sesuaikan titik awal
                  </div>
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
            const icon = getMarkerIconByCategory(dest.kategori);

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
                    Asisten TobaRoute
                  </h3>
                  <div style={{ fontSize: '0.75rem', color: '#64748b', marginTop: '2px' }}>
                    Navigasi presisi & rekomendasi berbasis GPS
                  </div>
                </div>
              </div>

              <button 
                className="gmaps-panel-close-btn"
                onClick={() => setIsPanelCollapsed(true)}
                title="Sembunyikan Panel"
              >
                <X size={16} />
              </button>
            </div>

            {/* Quick Location Chips */}
            <div className="location-quick-chips">
              <div className="chips-label"><Compass size={12} /> Rekomendasi Cepat:</div>
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
                                    {place.kecamatan} {place.rating ? `• ⭐ ${place.rating}` : ''} • {formatDescription(place.deskripsi_singkat)}
                                  </div>

                                  <button 
                                    className="rec-card-action-btn"
                                    onClick={() => highlightLocationOnMap(place)}
                                    title="Lihat Rute di Peta"
                                  >
                                    <RouteIcon size={13} /> Lihat Rute & Pin di Peta
                                  </button>
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
                placeholder="Tanyakan lokasi / kuliner di kecamatan..." 
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
    </div>
  );
};

export default Explore;


