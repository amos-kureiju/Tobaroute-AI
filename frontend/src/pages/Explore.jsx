import React, { useState, useEffect, useRef } from 'react';
import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';
import { getDestinations, getFairRecommendation, sendChatMessage } from '../services/api';
import { Map, AlertCircle, Navigation, Star, Send, Bot, User, Compass, Route as RouteIcon, MapPin, Sparkles } from 'lucide-react';
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

const Explore = () => {
  const [destinations, setDestinations] = useState([]);
  const [loadingMap, setLoadingMap] = useState(true);
  const [error, setError] = useState('');
  
  // Interactive Location State
  const [mapCenter, setMapCenter] = useState(DEFAULT_TOBA_CENTER);
  const [mapZoom, setMapZoom] = useState(10);
  const [activeTarget, setActiveTarget] = useState(null);
  const [routeWaypoints, setRouteWaypoints] = useState([]);

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

        // If there is an active target, recalculate route starting from user GPS!
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
      text: 'Horas! Saya Asisten Lokasi TobaRoute. Tanyakan lokasi kota/kecamatan (misal: "Lokasi Laguboti") atau tempat wisata spesifik (misal: "Wisata pantai di Balige"), saya akan langsung menunjukkan rutenya di peta!',
      targetDest: null
    }
  ]);
  const [chatInput, setChatInput] = useState('');
  const [isChatLoading, setIsChatLoading] = useState(false);
  const chatEndRef = useRef(null);

  // Fetch initial batch of destinations for background map
  useEffect(() => {
    const fetchAllDestinations = async () => {
      try {
        setLoadingMap(true);
        const data = await getDestinations('', 200);
        setDestinations(data);
      } catch (err) {
        console.error(err);
        setError('Gagal memuat data lokasi dari server.');
      } finally {
        setLoadingMap(false);
      }
    };
    fetchAllDestinations();
  }, []);

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [chatMessages]);

  // Focus location and draw road route on map
  const highlightLocationOnMap = (targetObj) => {
    if (!targetObj || !targetObj.latitude || !targetObj.longitude) return;

    const targetCoords = [targetObj.latitude, targetObj.longitude];
    const startOrigin = userLocation || DEFAULT_START_ORIGIN;

    setActiveTarget(targetObj);
    setMapCenter(targetCoords);
    setMapZoom(13);

    // If target is same as origin, zoom in without polyline to itself
    if (Math.abs(startOrigin[0] - targetCoords[0]) < 0.005 && Math.abs(startOrigin[1] - targetCoords[1]) < 0.005) {
      setRouteWaypoints([]);
    } else {
      // Draw route from User GPS (or Balige origin) to target
      setRouteWaypoints([startOrigin, targetCoords]);
    }
  };

  // Process location query from chatbot
  const handleLocationSearch = async (e, customQuery = null) => {
    if (e) e.preventDefault();
    const queryText = customQuery || chatInput.trim();
    if (!queryText) return;

    if (!customQuery) setChatInput('');

    // Add user message
    const updatedMessages = [...chatMessages, { role: 'user', text: queryText }];
    setChatMessages(updatedMessages);
    setIsChatLoading(true);

    try {
      const lowerQ = queryText.toLowerCase();

      // Keywords indicating tourist attraction or specific recommendation search
      const attractionKeywords = [
        'pantai', 'wisata', 'kuliner', 'makan', 'hotel', 'homestay', 'warung', 
        'restoran', 'kafe', 'cafe', 'ulos', 'taman', 'air terjun', 'pelabuhan', 
        'gereja', 'masjid', 'toko', 'pasar', 'oleh-oleh', 'rekomen', 'rekomendasi', 
        'bagus', 'terbaik', 'spot', 'ke mana', 'pergi ke', 'tempat'
      ];

      const hasAttractionIntent = attractionKeywords.some(k => lowerQ.includes(k));

      // Check if user is asking for a specific Kecamatan/City location
      let matchedKecamatanKey = null;
      Object.keys(KECAMATAN_CENTERS).forEach(key => {
        if (lowerQ.includes(key)) {
          matchedKecamatanKey = key;
        }
      });

      let matchedTarget = null;
      let aiText = '';

      // CASE 1: User asks ONLY for a City/Kecamatan location (e.g. "lokasi laguboti", "tunjukkan kota balige") WITHOUT asking for specific attractions
      if (matchedKecamatanKey && !hasAttractionIntent) {
        const kecInfo = KECAMATAN_CENTERS[matchedKecamatanKey];
        
        // Find center coordinates of destinations in that kecamatan if available
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

        aiText = `Berikut adalah peta dan rute navigasi menuju pusat **${kecInfo.name}**.\n\nApabila Anda mencari **tempat wisata populer, pantai, kuliner khas Batak, atau sentra UMKM** di ${kecInfo.name.replace('Kecamatan ', '')}, silakan tanyakan kepada saya (misal: *"apa tempat wisata rekomendasi di ${kecInfo.name.replace('Kecamatan ', '')}?"*)!`;

      } else {
        // CASE 2: User is asking for tourist spots, recommendations, or specific places
        const recData = await getFairRecommendation(queryText, matchedKecamatanKey ? matchedKecamatanKey : '');
        
        if (recData.destinasi_utama && recData.destinasi_utama.length > 0) {
          matchedTarget = recData.destinasi_utama[0];
        } else if (recData.rekomendasi_umkm_sekitar && recData.rekomendasi_umkm_sekitar.length > 0) {
          matchedTarget = recData.rekomendasi_umkm_sekitar[0];
        } else {
          // Fallback: search in loaded destinations list
          matchedTarget = destinations.find(d => 
            d.nama.toLowerCase().includes(lowerQ) || 
            lowerQ.includes(d.nama.toLowerCase())
          );
        }

        aiText = recData.ai_response;
        if (!aiText) {
          const chatRes = await sendChatMessage(queryText, chatMessages);
          aiText = chatRes.reply;
        }
      }

      // Add AI reply with matched target context
      setChatMessages([
        ...updatedMessages,
        {
          role: 'model',
          text: aiText,
          targetDest: matchedTarget
        }
      ]);

      // Highlight location and draw route on map
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
          targetDest: null
        }
      ]);
    } finally {
      setIsChatLoading(false);
    }
  };

  return (
    <main className="container main-content fade-in" style={{ paddingTop: '2rem', paddingBottom: '3rem' }}>
      {/* Header */}
      <div className="explore-header" style={{ marginBottom: '1.5rem' }}>
        <h1 style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'var(--color-primary-dark)', fontSize: '2rem' }}>
          <Map size={32} /> Peta Navigasi Interaktif & Asisten Lokasi
        </h1>
        <p style={{ color: 'var(--color-text-muted)', fontSize: '1.05rem', marginTop: '0.25rem' }}>
          Tanyakan lokasi tempat pada Asisten AI di sebelah kanan untuk langsung melihat rute navigasi dan pin penanda di peta.
        </p>
      </div>

      {error && (
        <div className="error-message fade-in" style={{ marginBottom: '1rem' }}>
          <AlertCircle size={18} /> {error}
        </div>
      )}

      {/* Main 2-Column Split Layout */}
      <div className="explore-split-layout">
        {/* LEFT COLUMN: LEAFLET ROUTE MAP */}
        <div className="map-column glass-panel">
          {loadingMap ? (
            <div className="loading-state" style={{ height: '600px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <div className="spinner" style={{ borderColor: 'var(--color-primary)', borderTopColor: 'transparent', width: '40px', height: '40px' }}></div>
            </div>
          ) : (
            <div style={{ height: '620px', width: '100%', borderRadius: 'var(--radius-lg)', overflow: 'hidden', position: 'relative' }}>
              <MapContainer 
                center={mapCenter} 
                zoom={mapZoom} 
                style={{ height: '100%', width: '100%' }}
              >
                <TileLayer
                  attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                  url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                />

                {/* Controller to flyTo target coordinates smoothly */}
                <MapFlyController centerCoords={mapCenter} zoom={mapZoom} />
                
                {/* User Live GPS Marker */}
                {userLocation && (
                  <Marker position={userLocation} icon={userGpsIcon}>
                    <Popup>
                      <div style={{ minWidth: '140px', textAlign: 'center' }}>
                        <h4 style={{ margin: '0 0 0.2rem 0', color: '#6b21a8' }}>📍 Posisimu Saat Ini</h4>
                        <p style={{ margin: 0, fontSize: '0.8rem', color: '#64748b' }}>Titik Awal Navigasi Rute (GPS)</p>
                      </div>
                    </Popup>
                  </Marker>
                )}

                {/* Real Road Routing Machine */}
                {routeWaypoints.length >= 2 && (
                  <RoutingMachine waypoints={routeWaypoints} />
                )}

                {/* All destinations markers */}
                {destinations.map(dest => {
                  if (!dest.latitude || !dest.longitude) return null;
                  const isUmkm = dest.kategori.toLowerCase() === 'umkm';
                  const isActive = activeTarget && activeTarget.id === dest.id;

                  return (
                    <Marker 
                      key={dest.id} 
                      position={[dest.latitude, dest.longitude]} 
                      icon={isActive ? activeTargetIcon : (isUmkm ? umkmIcon : wisataIcon)}
                    >
                      <Popup autoOpen={isActive}>
                        <div style={{ minWidth: '220px' }}>
                          {isActive && (
                            <div style={{ background: '#ef4444', color: 'white', padding: '0.2rem 0.5rem', borderRadius: '4px', fontSize: '0.75rem', fontWeight: 'bold', marginBottom: '0.4rem', display: 'inline-flex', alignItems: 'center', gap: '0.25rem' }}>
                              <MapPin size={12} /> Target Pencarian Chatbot
                            </div>
                          )}

                          <h4 style={{ margin: '0 0 0.4rem 0', color: isUmkm ? 'var(--color-accent-dark, #16a34a)' : 'var(--color-primary-dark)' }}>
                            {dest.nama}
                          </h4>
                          
                          <div style={{ display: 'flex', alignItems: 'center', gap: '0.25rem', marginBottom: '0.4rem', fontSize: '0.85rem', color: '#64748b' }}>
                            <Navigation size={12} /> {dest.kecamatan}
                          </div>
                          
                          <div style={{ display: 'flex', alignItems: 'center', gap: '0.25rem', marginBottom: '0.5rem', fontSize: '0.85rem', color: '#64748b' }}>
                            <Star size={12} fill="#fbbf24" color="#fbbf24" /> {dest.rating} ({dest.jumlah_ulasan} ulasan)
                          </div>

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

              {/* GPS Overlay Control Button */}
              <div style={{ position: 'absolute', top: '12px', right: '12px', zIndex: 1000 }}>
                <button
                  type="button"
                  onClick={handleEnableGPS}
                  disabled={gpsLoading}
                  style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '0.4rem',
                    padding: '0.5rem 0.9rem',
                    background: userLocation ? '#dcfce7' : 'rgba(255, 255, 255, 0.95)',
                    color: userLocation ? '#166534' : '#0369a1',
                    border: userLocation ? '1px solid #86efac' : '1px solid #cbd5e1',
                    borderRadius: '8px',
                    fontWeight: 600,
                    fontSize: '0.8rem',
                    boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
                    cursor: gpsLoading ? 'wait' : 'pointer',
                    backdropFilter: 'blur(8px)'
                  }}
                >
                  {gpsLoading ? (
                    <>Mengambil GPS...</>
                  ) : userLocation ? (
                    <>📍 GPS Aktif (Lokasi Anda)</>
                  ) : (
                    <>🎯 Gunakan Lokasi Saya (GPS)</>
                  )}
                </button>
              </div>

              {/* Active Route Info Overlay Badge */}
              {activeTarget && (
                <div className="active-route-badge glass-panel fade-in">
                  <div className="badge-icon"><RouteIcon size={20} color="#0284c7" /></div>
                  <div className="badge-info">
                    <span className="badge-title">
                      {userLocation ? '📍 Lokasi Anda (GPS)' : '📍 Balige'} ➔ {activeTarget.nama}
                    </span>
                    <span className="badge-sub">{activeTarget.kecamatan} • {activeTarget.kategori.toUpperCase()}</span>
                  </div>
                  <button className="badge-close" onClick={() => { setActiveTarget(null); setRouteWaypoints([]); }}>✕</button>
                </div>
              )}
            </div>
          )}
        </div>

        {/* RIGHT COLUMN: LOCATION ASSISTANT CHATBOT PANEL */}
        <div className="chatbot-column glass-panel">
          {/* Chat Panel Header */}
          <div className="chat-panel-header">
            <div className="panel-header-title">
              <Bot size={22} />
              <div>
                <h3>Asisten Lokasi AI</h3>
                <span>Tanya lokasi & rute langsung di peta</span>
              </div>
            </div>
          </div>

          {/* Quick Location Chips */}
          <div className="location-quick-chips">
            <div className="chips-label"><Compass size={13} /> Cari Lokasi Cepat:</div>
            <div className="chips-list">
              {QUICK_LOCATIONS.map((loc, idx) => (
                <button key={idx} onClick={() => handleLocationSearch(null, loc.query)}>
                  {loc.name}
                </button>
              ))}
            </div>
          </div>

          {/* Chat Messages Stream */}
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
                      
                      {/* Interactive Location Target Card inside AI Message */}
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

          {/* Chat Input Form */}
          <form className="chat-panel-input" onSubmit={handleLocationSearch}>
            <input 
              type="text" 
              placeholder="Tanyakan lokasi (misal: Di mana Pantai Meat?)..." 
              value={chatInput}
              onChange={(e) => setChatInput(e.target.value)}
              disabled={isChatLoading}
            />
            <button type="submit" disabled={!chatInput.trim() || isChatLoading}>
              <Send size={18} />
            </button>
          </form>
        </div>
      </div>
    </main>
  );
};

export default Explore;

