import React, { useState, useEffect, useRef } from 'react';
import { useLocation } from 'react-router-dom';
import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';
import { getDestinations, getFairRecommendation, sendChatMessage } from '../services/api';
import { Map, AlertCircle, Navigation, Star, Send, Bot, User, Compass, Route as RouteIcon, MapPin, Search, ChevronLeft, Menu, LocateFixed, X, Sparkles } from 'lucide-react';
import ReactMarkdown from 'react-markdown';
import RoutingMachine from '../components/RoutingMachine';

// Custom icons using external URLs for Leaflet
const wisataIcon = new L.Icon({
  iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-blue.png',
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

// Helper component to trigger map flyTo dynamically
const MapFlyController = ({ centerCoords, zoom = 13 }) => {
  const map = useMap();
  useEffect(() => {
    if (centerCoords && centerCoords[0] && centerCoords[1]) {
      map.flyTo(centerCoords, zoom, { duration: 1.5 });
    }
  }, [centerCoords, zoom, map]);
  return null;
};

const DEFAULT_TOBA_CENTER = [2.6105, 98.8106];
const DEFAULT_START_ORIGIN = [2.3333, 99.0667]; // Pusat Balige sebagai titik awal default rute

const KECAMATAN_CENTERS = {
  'balige': { name: 'Kecamatan Balige', coords: [2.3333, 99.0667] },
  'laguboti': { name: 'Kecamatan Laguboti', coords: [2.3500, 99.1333] },
  'porsea': { name: 'Kecamatan Porsea', coords: [2.4500, 99.1500] },
  'lumban julu': { name: 'Kecamatan Lumban Julu', coords: [2.5833, 99.0833] },
  'tampahan': { name: 'Kecamatan Tampahan', coords: [2.3333, 99.0167] },
  'pangururan': { name: 'Kecamatan Pangururan', coords: [2.6000, 98.7000] },
  'simanindo': { name: 'Kecamatan Simanindo', coords: [2.6833, 98.7500] },
  'harian': { name: 'Kecamatan Harian', coords: [2.5833, 98.6333] },
  'muara': { name: 'Kecamatan Muara', coords: [2.3333, 98.9167] },
  'silaen': { name: 'Kecamatan Silaen', coords: [2.3833, 99.2000] },
};

const QUICK_LOCATIONS = [
  { name: 'Kota Laguboti', query: 'Tunjukkan lokasi Kota Laguboti' },
  { name: 'Kota Balige', query: 'Tunjukkan lokasi Kota Balige' },
  { name: 'Pantai Lumban Bulbul', query: 'Di mana lokasi Pantai Pasir Putih Lumban Bulbul Balige?' },
  { name: 'Museum TB Silalahi', query: 'Di mana lokasi Museum Batak T.B. Silalahi Center?' },
  { name: 'Sentra Ulos Hutaraja', query: 'Di mana lokasi Kampung Ulos Hutaraja?' },
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
  const [displayedMarkers, setDisplayedMarkers] = useState([]); // Dynamic pins for requested query only
  const [loadingMap, setLoadingMap] = useState(true);
  const [error, setError] = useState('');
  
  // Interactive Location State
  const [mapCenter, setMapCenter] = useState(DEFAULT_TOBA_CENTER);
  const [mapZoom, setMapZoom] = useState(10);
  const [activeTarget, setActiveTarget] = useState(null);
  const [routeWaypoints, setRouteWaypoints] = useState([]);
  const [mapStyle, setMapStyle] = useState('google_streets'); // Default to Google Maps look
  const [isPanelCollapsed, setIsPanelCollapsed] = useState(false);

  // Live GPS Geolocation State
  const [userLocation, setUserLocation] = useState(null);
  const [gpsLoading, setGpsLoading] = useState(false);
  const [gpsError, setGpsError] = useState('');

  // Handle Geolocation API
  const handleEnableGPS = () => {
    if (!navigator.geolocation) {
      setGpsError('Browser Anda tidak mendukung fitur Geolocation GPS.');
      return;
    }

    setGpsLoading(true);
    setGpsError('');

    navigator.geolocation.getCurrentPosition(
      (position) => {
        const coords = [position.coords.latitude, position.coords.longitude];
        setUserLocation(coords);
        setMapCenter(coords);
        setMapZoom(13);
        setGpsLoading(false);

        if (activeTarget && activeTarget.latitude && activeTarget.longitude) {
          setRouteWaypoints([coords, [activeTarget.latitude, activeTarget.longitude]]);
        }
      },
      (err) => {
        console.error(err);
        setGpsError('Gagal mengakses lokasi GPS. Tolong izinkan akses lokasi di browser Anda.');
        setGpsLoading(false);
      },
      { enableHighAccuracy: true, timeout: 10000 }
    );
  };

  // Chatbot State
  const [chatMessages, setChatMessages] = useState([
    {
      role: 'model',
      text: 'Selamat datang di Panduan Navigasi TobaRoute. Anda dapat menanyakan lokasi kecamatan (misalnya "Lokasi Laguboti") atau rekomendasi wisata & kuliner spesifik (misalnya "Wisata pantai di Balige") untuk menampilkan posisi dan rute navigasinya di peta.',
      targetDest: null
    }
  ]);
  const [chatInput, setChatInput] = useState('');
  const [isChatLoading, setIsChatLoading] = useState(false);
  const chatEndRef = useRef(null);

  // Fetch initial batch of destinations for search lookup
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

    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const coords = [position.coords.latitude, position.coords.longitude];
          setUserLocation(coords);
        },
        (err) => {
          console.warn("GPS Location access denied, using Balige default origin.");
        },
        { enableHighAccuracy: true, timeout: 8000 }
      );
    }
  }, []);

  // Listen for targetLocation passed via router state (from DestinationCard)
  useEffect(() => {
    if (location.state?.targetLocation) {
      const target = location.state.targetLocation;
      highlightLocationOnMap(target);
      setDisplayedMarkers([target]);
      setChatMessages(prev => [
        ...prev,
        {
          role: 'model',
          text: `Navigasi rute aktif menuju **${target.nama}** (${target.kecamatan}). Peta telah difokuskan ke lokasi destinasi!`,
          targetDest: target
        }
      ]);
    }
  }, [location.state]);

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [chatMessages]);

  // Focus location and draw road route on map
  const highlightLocationOnMap = (targetObj, relatedPlaces = []) => {
    if (!targetObj || !targetObj.latitude || !targetObj.longitude) return;

    const targetCoords = [targetObj.latitude, targetObj.longitude];
    const startOrigin = userLocation || DEFAULT_START_ORIGIN;

    setActiveTarget(targetObj);
    setMapCenter(targetCoords);
    setMapZoom(13);

    if (relatedPlaces && relatedPlaces.length > 0) {
      setDisplayedMarkers(relatedPlaces);
    }

    if (Math.abs(startOrigin[0] - targetCoords[0]) < 0.005 && Math.abs(startOrigin[1] - targetCoords[1]) < 0.005) {
      setRouteWaypoints([]);
    } else {
      setRouteWaypoints([startOrigin, targetCoords]);
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

      const attractionKeywords = [
        'pantai', 'wisata', 'kuliner', 'makan', 'hotel', 'homestay', 'warung', 
        'restoran', 'kafe', 'cafe', 'ulos', 'taman', 'air terjun', 'pelabuhan', 
        'gereja', 'masjid', 'toko', 'pasar', 'oleh-oleh', 'rekomen', 'rekomendasi', 
        'bagus', 'terbaik', 'spot', 'ke mana', 'pergi ke', 'tempat'
      ];

      const hasAttractionIntent = attractionKeywords.some(k => lowerQ.includes(k));

      let matchedKecamatanKey = null;
      Object.keys(KECAMATAN_CENTERS).forEach(key => {
        if (lowerQ.includes(key)) {
          matchedKecamatanKey = key;
        }
      });

      let matchedTarget = null;
      let relevantMarkers = [];
      let aiText = '';

      if (matchedKecamatanKey && !hasAttractionIntent) {
        const kecInfo = KECAMATAN_CENTERS[matchedKecamatanKey];
        const kecDestinations = destinations.filter(d => d.kecamatan.toLowerCase().includes(matchedKecamatanKey));
        let lat = kecInfo.coords[0];
        let lng = kecInfo.coords[1];
        
        if (kecDestinations.length > 0) {
          const sumLat = kecDestinations.reduce((acc, d) => acc + d.latitude, 0);
          const sumLng = kecDestinations.reduce((acc, d) => acc + d.longitude, 0);
          lat = sumLat / kecDestinations.length;
          lng = sumLng / kecDestinations.length;
        }

        matchedTarget = {
          id: `kec-${matchedKecamatanKey}`,
          nama: kecInfo.name,
          kecamatan: kecInfo.name.replace('Kecamatan ', ''),
          kategori: 'Kawasan / Kota',
          deskripsi_singkat: `Pusat wilayah ${kecInfo.name} di kawasan Danau Toba.`,
          latitude: lat,
          longitude: lng,
          rating: 4.9,
          jumlah_ulasan: kecDestinations.length
        };

        // Show top 8 destinations in that kecamatan on map
        relevantMarkers = kecDestinations.slice(0, 8);

        aiText = `Berikut adalah peta dan rute navigasi menuju pusat **${kecInfo.name}**.\n\nApabila Anda mencari **tempat wisata populer, pantai, kuliner khas Batak, atau sentra UMKM** di ${kecInfo.name.replace('Kecamatan ', '')}, silakan tanyakan kepada saya (misal: *"apa tempat wisata rekomendasi di ${kecInfo.name.replace('Kecamatan ', '')}?"*)!`;

      } else {
        const recData = await getFairRecommendation(queryText, matchedKecamatanKey ? matchedKecamatanKey : '');
        
        const mainDests = recData.destinasi_utama || [];
        const umkmDests = recData.rekomendasi_umkm_sekitar || [];
        relevantMarkers = [...mainDests, ...umkmDests];

        if (mainDests.length > 0) {
          matchedTarget = mainDests[0];
        } else if (umkmDests.length > 0) {
          matchedTarget = umkmDests[0];
        } else {
          matchedTarget = destinations.find(d => 
            d.nama.toLowerCase().includes(lowerQ) || 
            lowerQ.includes(d.nama.toLowerCase())
          );
          if (matchedTarget) relevantMarkers = [matchedTarget];
        }

        aiText = recData.ai_response;
        if (!aiText) {
          const chatRes = await sendChatMessage(queryText, chatMessages);
          aiText = chatRes.reply;
        }
      }

      setChatMessages([
        ...updatedMessages,
        {
          role: 'model',
          text: aiText,
          targetDest: matchedTarget
        }
      ]);

      if (matchedTarget) {
        highlightLocationOnMap(matchedTarget, relevantMarkers);
      } else if (relevantMarkers.length > 0) {
        setDisplayedMarkers(relevantMarkers);
      }
    } catch (err) {
      console.error(err);
      setChatMessages([
        ...updatedMessages,
        {
          role: 'model',
          text: 'Mohon maaf, terjadi kendala saat mencari lokasi. Pastikan server backend uvicorn aktif.',
          targetDest: null
        }
      ]);
    } finally {
      setIsChatLoading(false);
    }
  };

  return (
    <div className="gmaps-layout-wrapper fade-in">
      {/* FLOATING TOP-LEFT CONTROLS (Search Bar & Map Style Switcher) */}
      <div className="gmaps-top-left-controls">
        {/* Floating Google Maps Search Bar */}
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
            placeholder="Telusuri lokasi wisata / kuliner di Danau Toba..."
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

        {/* Row below search: Map Style Switcher & GPS Button */}
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
            className="gmaps-gps-btn-badge"
            onClick={handleEnableGPS}
            disabled={gpsLoading}
            title="Pusatkan ke Lokasi GPS Anda Saat Ini"
          >
            <LocateFixed size={14} />
            <span>{gpsLoading ? 'Mencari...' : 'Lokasi Saya'}</span>
          </button>
        </div>
      </div>

      {/* LEAFLET FULL-BLEED MAP */}
      {loadingMap ? (
        <div style={{ height: '100%', width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#e5e3df' }}>
          <div className="spinner" style={{ borderColor: '#0284c7', borderTopColor: 'transparent', width: '40px', height: '40px' }}></div>
        </div>
      ) : (
        <MapContainer 
          key={`map-dest-${displayedMarkers.length}-${activeTarget?.id || 'none'}`}
          center={mapCenter} 
          zoom={mapZoom} 
          style={{ height: '100%', width: '100%' }}
          zoomControl={false}
        >
          <TileLayer
            attribution={MAP_STYLES[mapStyle].attribution}
            url={MAP_STYLES[mapStyle].url}
          />

          {/* Controller to flyTo target coordinates smoothly */}
          <MapFlyController centerCoords={mapCenter} zoom={mapZoom} />
          
          {/* User Live GPS Marker */}
          {userLocation && (
            <Marker position={userLocation} icon={userGpsIcon}>
              <Popup>
                <div style={{ minWidth: '140px', textAlign: 'center' }}>
                  <h4 style={{ margin: '0 0 0.2rem 0', color: '#6b21a8' }}>Lokasi Anda (GPS)</h4>
                  <p style={{ margin: 0, fontSize: '0.8rem', color: '#64748b' }}>Titik Keberangkatan Awal</p>
                </div>
              </Popup>
            </Marker>
          )}

          {/* Real Road Routing Machine */}
          {routeWaypoints.length >= 2 && (
            <RoutingMachine waypoints={routeWaypoints} />
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
                    <MapPin size={12} /> Target Pencarian Navigasi
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
                  {activeTarget.deskripsi_singkat && (
                    <p style={{ margin: '0', fontSize: '0.85rem', lineHeight: '1.4' }}>
                      {activeTarget.deskripsi_singkat}
                    </p>
                  )}
                </div>
              </Popup>
            </Marker>
          )}

          {/* Dynamically requested relevant destinations markers */}
          {displayedMarkers.map((dest, idx) => {
            if (!dest.latitude || !dest.longitude) return null;
            if (activeTarget && (activeTarget.id === dest.id || activeTarget.nama.trim().toLowerCase() === dest.nama.trim().toLowerCase())) {
              return null;
            }
            const isUmkm = (dest.kategori || '').toLowerCase() === 'umkm';

            return (
              <Marker 
                key={`disp-marker-${dest.id || idx}-${dest.nama}`} 
                position={[dest.latitude, dest.longitude]} 
                icon={isUmkm ? umkmIcon : wisataIcon}
              >
                <Popup>
                  <div style={{ minWidth: '220px' }}>
                    <h4 style={{ margin: '0 0 0.4rem 0', color: isUmkm ? 'var(--color-accent-dark, #16a34a)' : 'var(--color-primary-dark)' }}>
                      {dest.nama}
                    </h4>
                    
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.25rem', marginBottom: '0.4rem', fontSize: '0.85rem', color: '#64748b' }}>
                      <Navigation size={12} /> {dest.kecamatan}
                    </div>
                    
                    {dest.rating && (
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.25rem', marginBottom: '0.5rem', fontSize: '0.85rem', color: '#64748b' }}>
                        <Star size={12} fill="#fbbf24" color="#fbbf24" /> {dest.rating} ({dest.jumlah_ulasan || 10} ulasan)
                      </div>
                    )}

                    <p style={{ margin: '0', fontSize: '0.85rem', lineHeight: '1.4' }}>
                      {dest.deskripsi_singkat}
                    </p>
                    
                    {isUmkm && (
                      <div style={{ marginTop: '0.5rem', padding: '0.25rem 0.5rem', background: '#dcfce7', color: '#166534', borderRadius: '4px', fontSize: '0.75rem', display: 'inline-block', fontWeight: 'bold' }}>
                        Rekomendasi UMKM Lokal
                      </div>
                    )}
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
                  <Sparkles size={18} color="#0284c7" />
                </div>
                <div>
                  <h3 style={{ fontSize: '0.92rem', margin: 0, fontWeight: '700', color: '#0f172a' }}>
                    Asisten TobaRoute
                  </h3>
                  <div style={{ fontSize: '0.74rem', color: '#64748b', marginTop: '2px' }}>
                    Panduan navigasi & rekomendasi tempat
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
              <div className="chips-label"><Compass size={12} /> Lokasi Populer:</div>
              <div className="chips-list">
                {QUICK_LOCATIONS.map((loc, idx) => (
                  <button key={idx} onClick={() => handleLocationSearch(null, loc.query)}>
                    {loc.name}
                  </button>
                ))}
              </div>
            </div>

            {/* Active Route Info Overlay */}
            {activeTarget && (
              <div className="active-route-badge" style={{ position: 'relative', top: 0, right: 0, margin: '0.5rem', zIndex: 1, border: '1px solid #7dd3fc', background: '#f0f9ff' }}>
                <div className="badge-icon"><RouteIcon size={18} color="#0284c7" /></div>
                <div className="badge-info">
                  <span className="badge-title">
                    {userLocation ? 'Lokasi Anda (GPS)' : 'Awal: Balige'} ➔ {activeTarget.nama}
                  </span>
                  <span className="badge-sub">{activeTarget.kecamatan} • {activeTarget.kategori.toUpperCase()}</span>
                </div>
                <button className="badge-close" onClick={() => { setActiveTarget(null); setRouteWaypoints([]); }}>✕</button>
              </div>
            )}

            {/* Chat Messages Stream */}
            <div className="chat-panel-messages" style={{ flex: 1 }}>
              {chatMessages.map((msg, idx) => (
                <div key={idx} className={`chat-message ${msg.role}`}>
                  <div className="message-icon">
                    {msg.role === 'model' ? <Bot size={16} /> : <User size={16} />}
                  </div>
                  <div className="message-content">
                    {msg.role === 'model' ? (
                      <>
                        <ReactMarkdown>{msg.text}</ReactMarkdown>
                        {msg.targetDest && (
                          <div 
                            className="location-card-action" 
                            onClick={() => highlightLocationOnMap(msg.targetDest)}
                            title="Klik untuk lihat rute di peta"
                          >
                            <div className="loc-card-header">
                              <MapPin size={16} color="#ef4444" />
                              <strong>{msg.targetDest.nama}</strong>
                            </div>
                            <p className="loc-card-desc">{msg.targetDest.kecamatan} • {msg.targetDest.deskripsi_singkat}</p>
                            <div className="loc-card-btn">
                              <RouteIcon size={14} /> Lihat Rute & Pin di Peta
                            </div>
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
                placeholder="Tanyakan lokasi / rekomendasi wisata..." 
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


