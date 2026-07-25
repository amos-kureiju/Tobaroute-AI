import React, { useState } from 'react';
import { MapContainer, TileLayer, Marker, Popup, Polyline, useMap } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';
import { Navigation, Star, Crosshair, MapPin, Flag, ArrowRight, CheckCircle2, AlertCircle } from 'lucide-react';
import RoutingMachine from './RoutingMachine';

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

const userGpsIcon = new L.Icon({
  iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-violet.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/0.7.7/images/marker-shadow.png',
  iconSize: [32, 50],
  iconAnchor: [16, 50],
  popupAnchor: [1, -40],
  shadowSize: [41, 41]
});

const DEFAULT_START_ORIGIN = [2.3333, 99.0667]; // Pusat Balige sebagai titik awal default jika GPS belum aktif

// Component to dynamically adjust map view when waypoints change
const MapViewController = ({ center, waypoints }) => {
  const map = useMap();
  React.useEffect(() => {
    if (waypoints && waypoints.length > 0) {
      const bounds = L.latLngBounds(waypoints);
      map.fitBounds(bounds, { padding: [40, 40] });
    } else if (center) {
      map.setView(center, 11);
    }
  }, [center, waypoints, map]);
  return null;
};

const RouteMap = ({ destinasiUtama = [], umkmSekitar = [] }) => {
  const [userLocation, setUserLocation] = useState(null);
  const [gpsLoading, setGpsLoading] = useState(false);
  const [gpsError, setGpsError] = useState('');

  // Hanya ambil destinasi & UMKM yang memiliki latitude dan longitude
  const validDestinasi = destinasiUtama.filter(d => d.latitude && d.longitude);
  const validUmkm = umkmSekitar.filter(u => u.latitude && u.longitude);

  if (validDestinasi.length === 0 && validUmkm.length === 0) {
    return null;
  }

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
        setGpsError(''); // Pastikan pesan error terhapus jika sukses
        setGpsLoading(false);
      },
      (err) => {
        console.error(err);
        setGpsError('Gagal mengakses lokasi GPS. Tolong izinkan akses lokasi di browser Anda.');
        setGpsLoading(false);
      },
      { enableHighAccuracy: true, timeout: 10000 }
    );
  };

  // Kumpulkan SELURUH titik tujuan (Destinasi Utama + UMKM)
  const allTargets = [
    ...validDestinasi.map(d => [d.latitude, d.longitude]),
    ...validUmkm.map(u => [u.latitude, u.longitude])
  ];

  // Hitung koordinat rute:
  // Jika GPS aktif -> [userLocation, ...allTargets]
  // Jika GPS belum aktif -> [DEFAULT_START_ORIGIN (Balige), ...allTargets] jika cuma 1 titik, atau allTargets jika > 1 titik
  let routeCoordinates = [];
  if (userLocation) {
    routeCoordinates = [userLocation, ...allTargets];
  } else if (allTargets.length === 1) {
    routeCoordinates = [DEFAULT_START_ORIGIN, ...allTargets];
  } else {
    routeCoordinates = allTargets;
  }

  const center = userLocation 
    ? userLocation 
    : (allTargets.length > 0 ? allTargets[0] : [2.6105, 98.8106]);

  return (
    <div className="route-map-container" style={{ marginTop: '2rem' }}>
      {/* Route Header & Sequence Control */}
      <div className="route-controls-panel glass-panel" style={{ padding: '1rem 1.25rem', marginBottom: '1rem', borderRadius: 'var(--radius-lg)' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '0.75rem' }}>
          <div>
            <h4 style={{ margin: 0, color: 'var(--color-primary-dark)', display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '1.1rem' }}>
              <Navigation size={20} color="#0284c7" /> Alur Rute Navigasi Perjalanan
            </h4>
            <p style={{ margin: '0.2rem 0 0 0', fontSize: '0.85rem', color: '#64748b' }}>
              {userLocation ? 'Rute dimulai langsung dari lokasi GPS Anda saat ini.' : 'Klik tombol GPS untuk menghitung rute presisi dari posisi Anda berada.'}
            </p>
          </div>

          <button 
            type="button" 
            onClick={handleEnableGPS} 
            disabled={gpsLoading}
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '0.4rem',
              padding: '0.5rem 1rem',
              background: userLocation ? '#dcfce7' : 'var(--color-primary)',
              color: userLocation ? '#166534' : 'white',
              border: userLocation ? '1px solid #86efac' : 'none',
              borderRadius: '8px',
              fontWeight: 600,
              fontSize: '0.85rem',
              cursor: gpsLoading ? 'wait' : 'pointer',
              transition: 'all 0.2s'
            }}
          >
            {gpsLoading ? (
              <>Mengambil GPS...</>
            ) : userLocation ? (
              <><CheckCircle2 size={16} /> GPS Aktif (Lokasi Anda)</>
            ) : (
              <><Crosshair size={16} /> Aktifkan Lokasi Saya (GPS)</>
            )}
          </button>
        </div>

        {gpsError && !userLocation && (
          <div style={{ marginTop: '0.5rem', color: '#ef4444', fontSize: '0.8rem', display: 'flex', alignItems: 'center', gap: '0.3rem' }}>
            <AlertCircle size={14} /> {gpsError}
          </div>
        )}

        {/* Visual Route Sequence Chain */}
        <div style={{ marginTop: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem', flexWrap: 'wrap', background: 'rgba(255,255,255,0.8)', padding: '0.75rem', borderRadius: '8px', border: '1px solid #e2e8f0' }}>
          {/* Start Point */}
          <div style={{ display: 'inline-flex', alignItems: 'center', gap: '0.3rem', background: userLocation ? '#f3e8ff' : '#e0f2fe', color: userLocation ? '#6b21a8' : '#0369a1', padding: '0.35rem 0.65rem', borderRadius: '6px', fontSize: '0.8rem', fontWeight: 600 }}>
            <MapPin size={14} /> {userLocation ? 'Awal: Lokasi Anda (GPS)' : 'Awal: Pusat Balige'}
          </div>

          {validDestinasi.map((dest, idx) => (
            <React.Fragment key={dest.id}>
              <ArrowRight size={14} color="#94a3b8" />
              <div style={{ display: 'inline-flex', alignItems: 'center', gap: '0.3rem', background: '#f1f5f9', color: '#1e293b', padding: '0.35rem 0.65rem', borderRadius: '6px', fontSize: '0.8rem', fontWeight: 500 }}>
                <Flag size={13} color="#0284c7" /> {idx + 1}. {dest.nama}
              </div>
            </React.Fragment>
          ))}

          {validUmkm.map((umkm, idx) => (
            <React.Fragment key={`seq-umkm-${umkm.id}`}>
              <ArrowRight size={14} color="#94a3b8" />
              <div style={{ display: 'inline-flex', alignItems: 'center', gap: '0.3rem', background: '#dcfce7', color: '#15803d', padding: '0.35rem 0.65rem', borderRadius: '6px', fontSize: '0.8rem', fontWeight: 600 }}>
                🏬 {umkm.nama} (UMKM)
              </div>
            </React.Fragment>
          ))}
        </div>
      </div>

      {/* Map Container Wrapper */}
      <div className="route-map-wrapper glass-panel" style={{ height: '420px', width: '100%', borderRadius: 'var(--radius-lg)', overflow: 'hidden', padding: '0.5rem' }}>
        <MapContainer 
          center={center} 
          zoom={11} 
          style={{ height: '100%', width: '100%', borderRadius: 'calc(var(--radius-lg) - 0.5rem)' }}
        >
          <TileLayer
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          />

          <MapViewController center={center} waypoints={routeCoordinates} />

          {/* User Live GPS Marker */}
          {userLocation && (
            <Marker position={userLocation} icon={userGpsIcon}>
              <Popup>
                <div style={{ minWidth: '140px', textAlign: 'center' }}>
                  <h4 style={{ margin: '0 0 0.2rem 0', color: '#6b21a8' }}>📍 Posisimu Saat Ini</h4>
                  <p style={{ margin: 0, fontSize: '0.8rem', color: '#64748b' }}>Titik Awal Rute Navigasi (GPS)</p>
                </div>
              </Popup>
            </Marker>
          )}

          {/* Fallback Polyline agar garis rute selalu terlihat meskipun Leaflet Routing Machine sedang memuat */}
          {routeCoordinates.length >= 2 && (
            <Polyline 
              positions={routeCoordinates} 
              color="#0ea5e9" 
              weight={4} 
              dashArray="8, 8" 
              opacity={0.7} 
            />
          )}

          {/* Real Road Routing Machine */}
          {routeCoordinates.length >= 2 && (
            <RoutingMachine waypoints={routeCoordinates} />
          )}

          {/* Destinasi Utama Markers */}
          {validDestinasi.map((dest, idx) => (
            <Marker 
              key={`dest-${dest.id}`} 
              position={[dest.latitude, dest.longitude]} 
              icon={wisataIcon}
            >
              <Popup>
                <div style={{ minWidth: '160px' }}>
                  <h4 style={{ margin: '0 0 0.5rem 0', color: 'var(--color-primary-dark)' }}>
                    {idx + 1}. {dest.nama}
                  </h4>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.25rem', marginBottom: '0.4rem', fontSize: '0.85rem', color: '#64748b' }}>
                    <Navigation size={12} /> {dest.kecamatan}
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.25rem', fontSize: '0.85rem', color: '#64748b' }}>
                    <Star size={12} fill="#fbbf24" color="#fbbf24" /> {dest.rating}
                  </div>
                </div>
              </Popup>
            </Marker>
          ))}

          {/* UMKM Markers */}
          {validUmkm.map(umkm => (
            <Marker 
              key={`umkm-${umkm.id}`} 
              position={[umkm.latitude, umkm.longitude]} 
              icon={umkmIcon}
            >
              <Popup>
                <div style={{ minWidth: '160px' }}>
                  <h4 style={{ margin: '0 0 0.5rem 0', color: 'var(--color-accent-dark, #16a34a)' }}>
                    {umkm.nama}
                  </h4>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.25rem', marginBottom: '0.4rem', fontSize: '0.85rem', color: '#64748b' }}>
                    <Navigation size={12} /> {umkm.kecamatan}
                  </div>
                  <div style={{ marginTop: '0.4rem', padding: '0.2rem 0.4rem', background: '#dcfce7', color: '#166534', borderRadius: '4px', fontSize: '0.75rem', display: 'inline-block', fontWeight: 'bold' }}>
                    Rekomendasi UMKM
                  </div>
                </div>
              </Popup>
            </Marker>
          ))}
        </MapContainer>
      </div>
    </div>
  );
};

export default RouteMap;
