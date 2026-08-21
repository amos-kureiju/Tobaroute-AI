// ====================================================================================================
// FILE: frontend/src/components/RouteMap.jsx
// TUJUAN & PENJELASAN ARSITEKTUR GIS:
// Komponen Peta Navigasi Interaktif Kawasan Danau Toba berbasis React-Leaflet & OpenStreetMap / Google Maps.
//
// FITUR & PENINGKATAN:
// 1. 100% SELF-CONTAINED SVG PINS: Menggunakan L.divIcon berbasis SVG mandiri tanpa dependensi CDN gambar
//    eksternal. Bebas dari masalah gambar rusak (broken image "Marker" glitch) & selalu tajam di layar Retina.
// 2. SMART ROUTE MODE SELECTOR:
//    - Mode 'Rute Wisata Lokal' (Default jika GPS jauh): Menghubungkan destinasi wisata secara presisi di Balige.
//    - Mode 'Navigasi dari GPS': Menghitung jalur berkendara langsung dari titik keberangkatan wisatawan.
// 3. NUMBERED SEQUENCE PINS: Pin di peta memiliki nomor urut (1, 2, 3...) yang sinkron dengan alur perjalanan.
// 4. INTERACTIVE STEP NAVIGATION: Mengklik salah satu destinasi pada alur rantai akan menggeser peta (flyTo)
//    dan membuka popup informasi destinasi tersebut secara interaktif.
// 5. ROAD-NETWORK ROUTING (OSRM): Menghitung jarak jalan raya nyata (Km) dan estimasi waktu tempuh (Menit).
// ====================================================================================================

import React, { useState, useEffect, useRef, useMemo } from 'react';
import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';
import { 
  Navigation, 
  Star, 
  MapPin, 
  Flag, 
  ArrowRight, 
  Store, 
  Compass, 
  Crosshair, 
  Layers, 
  RotateCcw,
  Car,
  CheckCircle2,
  Info
} from 'lucide-react';
import RoutingMachine from './RoutingMachine';

// ====================================================================================================
// PEMBUAT IKON PIN SVG MANDIRI (ZERO BROKEN IMAGES, ZERO NETWORK DEPENDENCY)
// ====================================================================================================

// Pin Destinasi Utama & Rekomendasi UMKM Bernomor Urut
const createNumberedPin = (number, type = 'destinasi', isSelected = false) => {
  const isWisata = type === 'destinasi';
  const primaryColor = isWisata ? '#0284c7' : '#16a34a';
  const secondaryColor = isWisata ? '#0369a1' : '#15803d';
  const accentLight = isWisata ? '#38bdf8' : '#4ade80';
  const shadowColor = isWisata ? 'rgba(2, 132, 199, 0.45)' : 'rgba(22, 163, 74, 0.45)';
  const borderStroke = isSelected ? '#fbbf24' : '#ffffff';
  const strokeW = isSelected ? '3' : '2';

  const svgHtml = `
    <div style="
      position: relative;
      width: 36px;
      height: 46px;
      display: flex;
      align-items: center;
      justify-content: center;
      cursor: pointer;
      filter: drop-shadow(0 4px 6px ${shadowColor});
      transition: transform 0.2s ease;
      ${isSelected ? 'transform: scale(1.15);' : ''}
    ">
      <svg viewBox="0 0 36 46" width="36" height="46" style="overflow: visible;">
        <defs>
          <linearGradient id="grad-pin-${type}-${number}" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stop-color="${accentLight}" />
            <stop offset="100%" stop-color="${secondaryColor}" />
          </linearGradient>
        </defs>
        <!-- Teardrop Pin Body -->
        <path d="M18 1 C8.6 1 1 8.6 1 18 C1 28.5 18 45 18 45 C18 45 35 28.5 35 18 C35 8.6 27.4 1 18 1 Z" 
              fill="url(#grad-pin-${type}-${number})" 
              stroke="${borderStroke}" 
              stroke-width="${strokeW}" />
        <!-- Inner White Circle -->
        <circle cx="18" cy="17" r="11" fill="#ffffff" />
        <!-- Sequence Number / Icon -->
        <text x="18" y="21.5" text-anchor="middle" font-size="12" font-weight="800" fill="${primaryColor}" font-family="system-ui, -apple-system, sans-serif">${number}</text>
      </svg>
    </div>
  `;

  return L.divIcon({
    className: 'custom-numbered-pin',
    html: svgHtml,
    iconSize: [36, 46],
    iconAnchor: [18, 45],
    popupAnchor: [0, -42]
  });
};

// Pin Posisi GPS Wisatawan dengan Efek Gelombang Radar (Pulsing Glow)
const createGpsPin = () => {
  const svgHtml = `
    <div style="
      position: relative;
      width: 44px;
      height: 44px;
      display: flex;
      align-items: center;
      justify-content: center;
      cursor: default;
    ">
      <!-- Radar Wave Animation -->
      <div style="
        position: absolute;
        width: 42px;
        height: 42px;
        border-radius: 50%;
        background: rgba(147, 51, 234, 0.35);
        animation: toba-gps-radar 2s infinite cubic-bezier(0.2, 0.8, 0.4, 1);
      "></div>
      <!-- Center Glowing Pin -->
      <div style="
        position: relative;
        width: 28px;
        height: 28px;
        border-radius: 50%;
        background: linear-gradient(135deg, #a855f7, #7e22ce);
        border: 3px solid #ffffff;
        box-shadow: 0 4px 10px rgba(126, 34, 206, 0.5);
        display: flex;
        align-items: center;
        justify-content: center;
      ">
        <svg width="14" height="14" viewBox="0 0 24 24" fill="white">
          <path d="M12 2L4.5 20.29l.71.71L12 18l6.79 3 .71-.71z" />
        </svg>
      </div>
    </div>
  `;

  return L.divIcon({
    className: 'custom-gps-pin',
    html: svgHtml,
    iconSize: [44, 44],
    iconAnchor: [22, 22],
    popupAnchor: [0, -24]
  });
};

// Koordinat Default Pusat Balige
const DEFAULT_BALIGE_CENTER = [2.3347, 99.0645];

// ====================================================================================================
// KOMPONEN HELPER: MapViewController
// Mengatur batas pandang peta (fitBounds) secara otomatis saat rute berubah atau fokus diubah
// ====================================================================================================
const MapViewController = ({ waypoints, center, focusCoords, zoomLevel }) => {
  const map = useMap();

  useEffect(() => {
    if (focusCoords && focusCoords[0] && focusCoords[1]) {
      map.flyTo(focusCoords, zoomLevel || 15, { duration: 1.0 });
    } else if (waypoints && waypoints.length >= 2) {
      const bounds = L.latLngBounds(waypoints);
      map.fitBounds(bounds, { padding: [50, 50], maxZoom: 16 });
    } else if (center) {
      map.setView(center, zoomLevel || 13);
    }
  }, [waypoints, center, focusCoords, zoomLevel, map]);

  return null;
};

// ====================================================================================================
// FUNGSI MATEMATIKA: Jarak Euclidean & Nearest-Neighbor TSP
// ====================================================================================================
const distSq = (p1, p2) => {
  const dLat = p1[0] - p2[0];
  const dLng = p1[1] - p2[1];
  return dLat * dLat + dLng * dLng;
};

const haversineDistanceKm = (lat1, lon1, lat2, lon2) => {
  const R = 6371.0;
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLon = ((lon2 - lon1) * Math.PI) / 180;
  const a = 
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos((lat1 * Math.PI) / 180) * Math.cos((lat2 * Math.PI) / 180) *
    Math.sin(dLon / 2) * Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
};

const optimizeRouteSequence = (startPoint, targets) => {
  if (!targets || targets.length <= 1) return targets;
  
  let current = startPoint;
  let unvisited = [...targets];
  const sorted = [];

  while (unvisited.length > 0) {
    let nearestIdx = 0;
    let minD = distSq(current, unvisited[0].coords);

    for (let i = 1; i < unvisited.length; i++) {
      const d = distSq(current, unvisited[i].coords);
      if (d < minD) {
        minD = d;
        nearestIdx = i;
      }
    }

    const nextTarget = unvisited.splice(nearestIdx, 1)[0];
    sorted.push(nextTarget);
    current = nextTarget.coords;
  }

  return sorted;
};

// Pilihan Layer Peta
const MAP_STYLES = {
  osm: {
    name: 'OSM Standard',
    url: 'https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png',
    attribution: '&copy; OpenStreetMap'
  },
  google_streets: {
    name: 'Google Maps',
    url: 'https://mt1.google.com/vt/lyrs=m&x={x}&y={y}&z={z}',
    attribution: '&copy; Google Maps'
  },
  google_satellite: {
    name: 'Satelit',
    url: 'https://mt1.google.com/vt/lyrs=s,h&x={x}&y={y}&z={z}',
    attribution: '&copy; Google Maps Satellite'
  }
};

// ====================================================================================================
// KOMPONEN UTAMA: RouteMap
// ====================================================================================================
const RouteMap = ({ destinasiUtama = [], umkmSekitar = [] }) => {
  const [userLocation, setUserLocation] = useState(null);
  const [mapStyle, setMapStyle] = useState('osm');
  const [routeMode, setRouteMode] = useState('destinations_only'); // 'destinations_only' | 'from_gps'
  const [selectedLocation, setSelectedLocation] = useState(null);
  const [focusTarget, setFocusTarget] = useState(null);
  const [routeMetrics, setRouteMetrics] = useState({ distanceKm: null, durationMins: null });

  // 1. Deteksi Geolocation Wisatawan
  useEffect(() => {
    const cachedGps = localStorage.getItem('tobaroute_user_gps');
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
          const isInTobaRegion = (lat >= 1.8 && lat <= 3.4 && lon >= 98.0 && lon <= 99.9);
          
          if (isInTobaRegion || !cachedGps) {
            const newCoords = [lat, lon];
            setUserLocation(newCoords);
            localStorage.setItem('tobaroute_user_gps', JSON.stringify(newCoords));
          }
        },
        (error) => {
          console.warn("Akses GPS dinonaktifkan / tidak tersedia.");
        },
        { enableHighAccuracy: true, timeout: 8000, maximumAge: 60000 }
      );
    }
  }, []);

  // 2. Filter Duplikasi Data Destinasi & UMKM
  const uniqueDestinasi = useMemo(() => {
    return Array.from(
      new Map(
        destinasiUtama
          .filter(d => d.latitude && d.longitude)
          .map(d => [d.nama.trim().toLowerCase(), d])
      ).values()
    );
  }, [destinasiUtama]);

  const uniqueUmkm = useMemo(() => {
    return Array.from(
      new Map(
        umkmSekitar
          .filter(u => u.latitude && u.longitude)
          .map(u => [u.nama.trim().toLowerCase(), u])
      ).values()
    );
  }, [umkmSekitar]);

  // Jika tidak ada data sama sekali, jangan render
  if (uniqueDestinasi.length === 0 && uniqueUmkm.length === 0) {
    return null;
  }

  // 3. Susun Target Rute & Urutan Navigasi Presisi
  const rawTargets = useMemo(() => {
    return [
      ...uniqueDestinasi.map(d => ({ type: 'destinasi', data: d, coords: [d.latitude, d.longitude] })),
      ...uniqueUmkm.slice(0, 2).map(u => ({ type: 'umkm', data: u, coords: [u.latitude, u.longitude] }))
    ];
  }, [uniqueDestinasi, uniqueUmkm]);

  // Hitung Titik Tengah Destinasi
  const destinationCenter = useMemo(() => {
    if (rawTargets.length === 0) return DEFAULT_BALIGE_CENTER;
    const avgLat = rawTargets.reduce((acc, t) => acc + t.coords[0], 0) / rawTargets.length;
    const avgLon = rawTargets.reduce((acc, t) => acc + t.coords[1], 0) / rawTargets.length;
    return [avgLat, avgLon];
  }, [rawTargets]);

  // Hitung Jarak GPS Pengguna ke Pusat Destinasi
  const gpsDistanceToDests = useMemo(() => {
    if (!userLocation || !destinationCenter) return null;
    return haversineDistanceKm(
      userLocation[0], userLocation[1],
      destinationCenter[0], destinationCenter[1]
    );
  }, [userLocation, destinationCenter]);

  // 4. Urutkan Rantai Perjalanan Berdasarkan Mode yang Dipilih
  const { orderedTargets, routeWaypoints } = useMemo(() => {
    if (rawTargets.length === 0) {
      return { orderedTargets: [], routeWaypoints: [] };
    }

    if (routeMode === 'from_gps' && userLocation) {
      // Rute berawal dari GPS pengguna
      const sorted = optimizeRouteSequence(userLocation, rawTargets);
      const waypoints = [userLocation, ...sorted.map(t => t.coords)];
      return { orderedTargets: sorted, routeWaypoints: waypoints };
    } else {
      // Rute fokus antar destinasi wisata lokal (mulai dari destinasi pertama)
      const baseStart = rawTargets[0].coords;
      const sorted = optimizeRouteSequence(baseStart, rawTargets);
      const waypoints = sorted.map(t => t.coords);
      return { orderedTargets: sorted, routeWaypoints: waypoints };
    }
  }, [rawTargets, routeMode, userLocation]);

  // 5. Handler Geser Pin GPS
  const handleGpsMarkerDragEnd = (e) => {
    const latLng = e.target.getLatLng();
    const newCoords = [latLng.lat, latLng.lng];
    setUserLocation(newCoords);
    localStorage.setItem('tobaroute_user_gps', JSON.stringify(newCoords));
  };

  // 6. Handler Klik Destinasi di Bar Alur Perjalanan
  const handleSelectStep = (item) => {
    setSelectedLocation(item.data);
    setFocusTarget(item.coords);
  };

  // 7. Handler Reset Fokus
  const handleResetFocus = () => {
    setSelectedLocation(null);
    setFocusTarget(null);
  };

  // 8. Handler Reset GPS ke Pusat Wisata
  const handleResetGpsToBalige = () => {
    const newCoords = [destinationCenter[0] + 0.005, destinationCenter[1] + 0.005];
    setUserLocation(newCoords);
    localStorage.setItem('tobaroute_user_gps', JSON.stringify(newCoords));
    setFocusTarget(newCoords);
  };

  return (
    <div className="route-map-container" style={{ marginTop: '1.5rem' }}>
      {/* Header Panel Navigasi & Mode Selector */}
      <div className="route-controls-panel glass-panel" style={{ padding: '1rem 1.25rem', marginBottom: '0.85rem', borderRadius: 'var(--radius-lg)' }}>
        
        {/* Baris Atas: Judul & Mode Navigasi Toggle */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '0.75rem' }}>
          <div>
            <h4 style={{ margin: 0, color: 'var(--color-primary-dark)', display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '1.08rem', fontWeight: 700 }}>
              <Navigation size={20} color="#0284c7" /> Alur Rute Navigasi Perjalanan Presisi
            </h4>
            <p style={{ margin: '0.2rem 0 0 0', fontSize: '0.82rem', color: '#64748b' }}>
              Rute perjalanan efisien yang menghubungkan destinasi utama dan UMKM kuliner sekitar.
            </p>
          </div>

          {/* Mode Selector Button Group */}
          <div style={{ display: 'flex', gap: '0.4rem', background: '#f1f5f9', padding: '0.25rem', borderRadius: '8px' }}>
            <button
              onClick={() => { setRouteMode('destinations_only'); handleResetFocus(); }}
              style={{
                padding: '0.4rem 0.75rem',
                fontSize: '0.8rem',
                fontWeight: 600,
                borderRadius: '6px',
                border: 'none',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '0.35rem',
                background: routeMode === 'destinations_only' ? '#0284c7' : 'transparent',
                color: routeMode === 'destinations_only' ? '#ffffff' : '#475569',
                transition: 'all 0.2s ease',
                boxShadow: routeMode === 'destinations_only' ? '0 2px 5px rgba(2, 132, 199, 0.3)' : 'none'
              }}
            >
              <Compass size={14} /> Rute Wisata Lokal
            </button>

            {userLocation && (
              <button
                onClick={() => { setRouteMode('from_gps'); handleResetFocus(); }}
                style={{
                  padding: '0.4rem 0.75rem',
                  fontSize: '0.8rem',
                  fontWeight: 600,
                  borderRadius: '6px',
                  border: 'none',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.35rem',
                  background: routeMode === 'from_gps' ? '#7e22ce' : 'transparent',
                  color: routeMode === 'from_gps' ? '#ffffff' : '#475569',
                  transition: 'all 0.2s ease',
                  boxShadow: routeMode === 'from_gps' ? '0 2px 5px rgba(126, 34, 206, 0.3)' : 'none'
                }}
              >
                <Car size={14} /> Navigasi dari GPS
              </button>
            )}
          </div>
        </div>

        {/* Notifikasi Info jika GPS berada di luar area */}
        {userLocation && gpsDistanceToDests && gpsDistanceToDests > 5.0 && routeMode === 'destinations_only' && (
          <div style={{
            marginTop: '0.65rem',
            padding: '0.5rem 0.75rem',
            background: '#f0f9ff',
            border: '1px solid #bae6fd',
            borderRadius: '6px',
            fontSize: '0.78rem',
            color: '#0369a1',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            flexWrap: 'wrap',
            gap: '0.5rem'
          }}>
            <span style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
              <Info size={14} color="#0284c7" />
              Titik GPS Anda terdeteksi berjarak <strong>{gpsDistanceToDests.toFixed(1)} km</strong> dari lokasi wisata. Peta saat ini difokuskan pada kluster wisata lokal.
            </span>
            <button
              onClick={() => setRouteMode('from_gps')}
              style={{
                background: '#0284c7',
                color: 'white',
                border: 'none',
                padding: '0.2rem 0.55rem',
                borderRadius: '4px',
                fontSize: '0.74rem',
                fontWeight: 600,
                cursor: 'pointer'
              }}
            >
              Mulai Rute dari GPS Saya
            </button>
          </div>
        )}

        {/* Baris Rantai Perjalanan Berurutan (Interactive Steps) */}
        <div style={{
          marginTop: '0.75rem',
          display: 'flex',
          alignItems: 'center',
          gap: '0.4rem',
          flexWrap: 'wrap',
          background: 'rgba(255,255,255,0.92)',
          padding: '0.65rem 0.85rem',
          borderRadius: '8px',
          border: '1px solid #e2e8f0'
        }}>
          {routeMode === 'from_gps' && userLocation && (
            <>
              <div 
                onClick={() => setFocusTarget(userLocation)}
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '0.35rem',
                  background: '#f3e8ff',
                  color: '#6b21a8',
                  padding: '0.3rem 0.6rem',
                  borderRadius: '6px',
                  fontSize: '0.8rem',
                  fontWeight: 700,
                  cursor: 'pointer',
                  border: '1px solid #d8b4fe'
                }}
                title="Klik untuk pusatkan ke titik GPS"
              >
                <MapPin size={13} color="#7e22ce" /> Lokasi Anda (GPS)
              </div>
              <ArrowRight size={13} color="#94a3b8" />
            </>
          )}

          {orderedTargets.map((item, idx) => {
            const isDest = item.type === 'destinasi';
            const isCurrent = selectedLocation && selectedLocation.id === item.data.id;

            return (
              <React.Fragment key={item.data.id || idx}>
                {idx > 0 && <ArrowRight size={13} color="#94a3b8" />}
                <button
                  onClick={() => handleSelectStep(item)}
                  style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '0.4rem',
                    background: isCurrent ? (isDest ? '#0284c7' : '#16a34a') : (isDest ? '#f0f9ff' : '#f0fdf4'),
                    color: isCurrent ? '#ffffff' : (isDest ? '#0369a1' : '#15803d'),
                    padding: '0.3rem 0.65rem',
                    borderRadius: '6px',
                    fontSize: '0.8rem',
                    fontWeight: 600,
                    border: `1px solid ${isCurrent ? 'transparent' : (isDest ? '#bae6fd' : '#bbf7d0')}`,
                    cursor: 'pointer',
                    transition: 'all 0.15s ease',
                    boxShadow: isCurrent ? '0 2px 6px rgba(0,0,0,0.15)' : 'none'
                  }}
                  title="Klik untuk melihat di peta"
                >
                  <span style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    width: '18px',
                    height: '18px',
                    borderRadius: '50%',
                    background: isCurrent ? 'rgba(255,255,255,0.25)' : (isDest ? '#0284c7' : '#16a34a'),
                    color: '#ffffff',
                    fontSize: '0.72rem',
                    fontWeight: 'bold'
                  }}>
                    {idx + 1}
                  </span>
                  <span>{item.data.nama}</span>
                  {item.type === 'umkm' && (
                    <span style={{ 
                      fontSize: '0.68rem', 
                      background: isCurrent ? 'rgba(255,255,255,0.2)' : '#dcfce7', 
                      color: isCurrent ? '#ffffff' : '#166534', 
                      padding: '0.1rem 0.35rem', 
                      borderRadius: '4px' 
                    }}>
                      UMKM
                    </span>
                  )}
                </button>
              </React.Fragment>
            );
          })}
        </div>

        {/* Metrik Perjalanan (Jarak & Waktu Tempuh) */}
        {routeMetrics.distanceKm && (
          <div style={{ marginTop: '0.5rem', display: 'flex', alignItems: 'center', gap: '1rem', fontSize: '0.78rem', color: '#475569' }}>
            <span>Total Jarak Berkendara: <strong>{routeMetrics.distanceKm} km</strong></span>
            <span>Estimasi Waktu: <strong>{routeMetrics.durationMins} menit</strong></span>
          </div>
        )}
      </div>

      {/* Kontainer Peta Leaflet */}
      <div className="route-map-wrapper glass-panel" style={{ height: '440px', width: '100%', borderRadius: 'var(--radius-lg)', overflow: 'hidden', padding: '0.4rem', position: 'relative' }}>
        <MapContainer 
          center={destinationCenter} 
          zoom={13} 
          style={{ height: '100%', width: '100%', borderRadius: 'calc(var(--radius-lg) - 0.4rem)' }}
          zoomControl={true}
        >
          <TileLayer
            attribution={MAP_STYLES[mapStyle].attribution}
            url={MAP_STYLES[mapStyle].url}
          />

          {/* Kontrol Layer Peta & Aksi Cepat */}
          <div style={{
            position: 'absolute',
            top: '12px',
            right: '12px',
            zIndex: 1000,
            display: 'flex',
            gap: '6px',
            background: 'rgba(255, 255, 255, 0.95)',
            backdropFilter: 'blur(6px)',
            padding: '4px 6px',
            borderRadius: '8px',
            boxShadow: '0 2px 8px rgba(0,0,0,0.15)',
            border: '1px solid rgba(0,0,0,0.08)'
          }}>
            <button 
              onClick={() => setMapStyle('osm')}
              style={{
                padding: '0.25rem 0.55rem',
                fontSize: '0.75rem',
                borderRadius: '5px',
                border: 'none',
                background: mapStyle === 'osm' ? '#0284c7' : 'transparent',
                color: mapStyle === 'osm' ? 'white' : '#475569',
                cursor: 'pointer',
                fontWeight: mapStyle === 'osm' ? '700' : '500'
              }}
            >
              OSM Standard
            </button>
            <button 
              onClick={() => setMapStyle('google_streets')}
              style={{
                padding: '0.25rem 0.55rem',
                fontSize: '0.75rem',
                borderRadius: '5px',
                border: 'none',
                background: mapStyle === 'google_streets' ? '#0284c7' : 'transparent',
                color: mapStyle === 'google_streets' ? 'white' : '#475569',
                cursor: 'pointer',
                fontWeight: mapStyle === 'google_streets' ? '700' : '500'
              }}
            >
              Google Maps
            </button>
            <button 
              onClick={() => setMapStyle('google_satellite')}
              style={{
                padding: '0.25rem 0.55rem',
                fontSize: '0.75rem',
                borderRadius: '5px',
                border: 'none',
                background: mapStyle === 'google_satellite' ? '#0284c7' : 'transparent',
                color: mapStyle === 'google_satellite' ? 'white' : '#475569',
                cursor: 'pointer',
                fontWeight: mapStyle === 'google_satellite' ? '700' : '500'
              }}
            >
              Satelit
            </button>
          </div>

          {/* Tombol Aksi Cepat (Pusatkan Destinasi & Reset) */}
          <div style={{
            position: 'absolute',
            bottom: '16px',
            right: '12px',
            zIndex: 1000,
            display: 'flex',
            flexDirection: 'column',
            gap: '6px'
          }}>
            <button
              onClick={handleResetFocus}
              style={{
                background: 'rgba(255, 255, 255, 0.95)',
                color: '#0284c7',
                border: '1px solid #bae6fd',
                padding: '0.4rem 0.75rem',
                borderRadius: '8px',
                fontSize: '0.76rem',
                fontWeight: 600,
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '0.35rem',
                boxShadow: '0 2px 6px rgba(0,0,0,0.12)'
              }}
              title="Pusatkan kembali ke seluruh titik rute"
            >
              <Crosshair size={14} /> Pusatkan Rute
            </button>
          </div>

          {/* Dynamic Map Camera Controller */}
          <MapViewController 
            waypoints={routeWaypoints} 
            center={destinationCenter} 
            focusCoords={focusTarget} 
            zoomLevel={focusTarget ? 16 : 13} 
          />

          {/* Marker Lokasi Pengguna (GPS) - Tetap pada Titik Koordinat Pengguna */}
          {userLocation && (
            <Marker 
              position={userLocation} 
              icon={createGpsPin()}
              draggable={false}
              zIndexOffset={1000}
            >
              <Popup>
                <div style={{ minWidth: '160px', textAlign: 'center' }}>
                  <div style={{ background: '#f3e8ff', color: '#6b21a8', padding: '0.25rem 0.6rem', borderRadius: '4px', fontSize: '0.78rem', fontWeight: 700, display: 'inline-block', marginBottom: '0.3rem' }}>
                    Lokasi GPS Anda
                  </div>
                  <p style={{ margin: 0, fontSize: '0.8rem', color: '#475569' }}>
                    Titik Keberangkatan Awal
                  </p>
                </div>
              </Popup>
            </Marker>
          )}

          {/* OSRM Routing Machine (Jalan Raya Nyata) */}
          {routeWaypoints.length >= 2 && (
            <RoutingMachine waypoints={routeWaypoints} onRouteInfo={setRouteMetrics} />
          )}

          {/* Marker Seluruh Destinasi yang Terurut */}
          {orderedTargets.map((item, idx) => {
            const isSelected = selectedLocation && selectedLocation.id === item.data.id;
            const pinIcon = createNumberedPin(idx + 1, item.type, isSelected);

            return (
              <Marker 
                key={`dest-ordered-${item.data.id || idx}`} 
                position={item.coords} 
                icon={pinIcon}
                zIndexOffset={isSelected ? 900 : 500}
              >
                <Popup>
                  <div style={{ minWidth: '190px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.35rem' }}>
                      <span style={{ 
                        background: item.type === 'destinasi' ? '#0284c7' : '#16a34a', 
                        color: 'white', 
                        padding: '0.15rem 0.45rem', 
                        borderRadius: '4px', 
                        fontSize: '0.72rem', 
                        fontWeight: 700 
                      }}>
                        Stop #{idx + 1} - {item.type === 'destinasi' ? 'Destinasi Utama' : 'UMKM Sekitar'}
                      </span>
                      {item.data.rating && (
                        <span style={{ display: 'flex', alignItems: 'center', gap: '2px', fontSize: '0.8rem', fontWeight: 700, color: '#b45309' }}>
                          <Star size={12} fill="#fbbf24" color="#fbbf24" /> {item.data.rating}
                        </span>
                      )}
                    </div>

                    <h4 style={{ margin: '0 0 0.3rem 0', color: 'var(--color-primary-dark)', fontSize: '0.95rem' }}>
                      {item.data.nama}
                    </h4>

                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.25rem', marginBottom: '0.35rem', fontSize: '0.8rem', color: '#64748b' }}>
                      <Navigation size={12} /> {item.data.kecamatan}
                    </div>

                    {item.data.nama_jalan && (
                      <div style={{ background: '#f1f5f9', color: '#334155', padding: '0.25rem 0.5rem', borderRadius: '4px', fontSize: '0.72rem', marginBottom: '0.4rem' }}>
                        {item.data.nama_jalan}
                      </div>
                    )}

                    {item.data.deskripsi_singkat && (
                      <p style={{ margin: 0, fontSize: '0.78rem', color: '#475569', lineHeight: '1.35' }}>
                        {item.data.deskripsi_singkat}
                      </p>
                    )}
                  </div>
                </Popup>
              </Marker>
            );
          })}
        </MapContainer>
      </div>
    </div>
  );
};

export default RouteMap;
