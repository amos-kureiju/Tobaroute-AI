import React, { useState, useEffect } from 'react';
import { MapContainer, TileLayer, Marker, Popup, Polyline, useMap } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';
import { Navigation, Star, MapPin, Flag, ArrowRight, Store } from 'lucide-react';
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
  iconSize: [30, 46],
  iconAnchor: [15, 46],
  popupAnchor: [1, -38],
  shadowSize: [41, 41]
});

const DEFAULT_START_ORIGIN = [2.3333, 99.0667]; // Pusat Balige sebagai titik awal default jika GPS tidak aktif

// Component to dynamically adjust map view when waypoints change
const MapViewController = ({ center, waypoints }) => {
  const map = useMap();
  useEffect(() => {
    if (waypoints && waypoints.length > 0) {
      const bounds = L.latLngBounds(waypoints);
      map.fitBounds(bounds, { padding: [45, 45] });
    } else if (center) {
      map.setView(center, 11);
    }
  }, [center, waypoints, map]);
  return null;
};

const RouteMap = ({ destinasiUtama = [], umkmSekitar = [] }) => {
  const [userLocation, setUserLocation] = useState(null);

  // Automatic GPS Geolocation trigger without manual button
  useEffect(() => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setUserLocation([position.coords.latitude, position.coords.longitude]);
        },
        (error) => {
          console.warn("Akses GPS tidak diaktifkan, menggunakan titik awal default Balige.");
        },
        { enableHighAccuracy: true, timeout: 8000 }
      );
    }
  }, []);

  // Deduplicate destinations & UMKM by unique name to avoid duplicate items in route chain
  const uniqueDestinasi = Array.from(
    new Map(destinasiUtama.filter(d => d.latitude && d.longitude).map(d => [d.nama.trim(), d])).values()
  );
  
  const uniqueUmkm = Array.from(
    new Map(umkmSekitar.filter(u => u.latitude && u.longitude).map(u => [u.nama.trim(), u])).values()
  );

  if (uniqueDestinasi.length === 0 && uniqueUmkm.length === 0) {
    return null;
  }

  // Combine unique targets (Main Destinations + max 2 UMKM)
  const allTargets = [
    ...uniqueDestinasi.map(d => [d.latitude, d.longitude]),
    ...uniqueUmkm.slice(0, 2).map(u => [u.latitude, u.longitude])
  ];

  // Route coordinates logic:
  // If GPS is active -> [userLocation, ...allTargets]
  // Else -> [DEFAULT_START_ORIGIN (Balige), ...allTargets]
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
    <div className="route-map-container" style={{ marginTop: '1.75rem' }}>
      {/* Route Header & Professional Sequence Panel */}
      <div className="route-controls-panel glass-panel" style={{ padding: '0.85rem 1.15rem', marginBottom: '0.75rem', borderRadius: 'var(--radius-lg)' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '0.5rem' }}>
          <div>
            <h4 style={{ margin: 0, color: 'var(--color-primary-dark)', display: 'flex', alignItems: 'center', gap: '0.4rem', fontSize: '1.05rem', fontWeight: 600 }}>
              <Navigation size={18} color="#0284c7" /> Alur Rute Navigasi Perjalanan
            </h4>
            <p style={{ margin: '0.15rem 0 0 0', fontSize: '0.82rem', color: '#64748b' }}>
              {userLocation ? 'Rute dihitung secara otomatis dari posisi GPS Anda saat ini.' : 'Rute dihitung otomatis dari pusat Balige menuju destinasi target.'}
            </p>
          </div>
        </div>

        {/* Professional Visual Route Sequence Chain */}
        <div style={{ marginTop: '0.75rem', display: 'flex', alignItems: 'center', gap: '0.4rem', flexWrap: 'wrap', background: 'rgba(255,255,255,0.9)', padding: '0.6rem 0.85rem', borderRadius: '8px', border: '1px solid #e2e8f0' }}>
          {/* Start Point */}
          <div style={{ display: 'inline-flex', alignItems: 'center', gap: '0.35rem', background: userLocation ? '#f3e8ff' : '#e0f2fe', color: userLocation ? '#6b21a8' : '#0369a1', padding: '0.25rem 0.55rem', borderRadius: '5px', fontSize: '0.8rem', fontWeight: 600 }}>
            <MapPin size={13} /> {userLocation ? 'Lokasi Anda (GPS)' : 'Awal: Balige'}
          </div>

          {uniqueDestinasi.map((dest, idx) => (
            <React.Fragment key={dest.id || idx}>
              <ArrowRight size={13} color="#94a3b8" />
              <div style={{ display: 'inline-flex', alignItems: 'center', gap: '0.35rem', background: '#f1f5f9', color: '#1e293b', padding: '0.25rem 0.55rem', borderRadius: '5px', fontSize: '0.8rem', fontWeight: 500 }}>
                <Flag size={12} color="#0284c7" /> {idx + 1}. {dest.nama}
              </div>
            </React.Fragment>
          ))}

          {uniqueUmkm.slice(0, 2).map((umkm, idx) => (
            <React.Fragment key={umkm.id || idx}>
              <ArrowRight size={13} color="#94a3b8" />
              <div style={{ display: 'inline-flex', alignItems: 'center', gap: '0.35rem', background: '#dcfce7', color: '#15803d', padding: '0.25rem 0.55rem', borderRadius: '5px', fontSize: '0.8rem', fontWeight: 600 }}>
                <Store size={12} color="#15803d" /> {umkm.nama} (UMKM)
              </div>
            </React.Fragment>
          ))}
        </div>
      </div>

      {/* Map Container Wrapper */}
      <div className="route-map-wrapper glass-panel" style={{ height: '420px', width: '100%', borderRadius: 'var(--radius-lg)', overflow: 'hidden', padding: '0.4rem' }}>
        <MapContainer 
          center={center} 
          zoom={11} 
          style={{ height: '100%', width: '100%', borderRadius: 'calc(var(--radius-lg) - 0.4rem)' }}
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
                  <h4 style={{ margin: '0 0 0.2rem 0', color: '#6b21a8' }}>Lokasi Anda (GPS)</h4>
                  <p style={{ margin: 0, fontSize: '0.8rem', color: '#64748b' }}>Titik Keberangkatan Awal</p>
                </div>
              </Popup>
            </Marker>
          )}

          {/* Fallback Polyline for instant visual route display */}
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
          {uniqueDestinasi.map((dest, idx) => (
            <Marker 
              key={`dest-${dest.id || idx}`} 
              position={[dest.latitude, dest.longitude]} 
              icon={wisataIcon}
            >
              <Popup>
                <div style={{ minWidth: '160px' }}>
                  <h4 style={{ margin: '0 0 0.4rem 0', color: 'var(--color-primary-dark)' }}>
                    {idx + 1}. {dest.nama}
                  </h4>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.25rem', marginBottom: '0.35rem', fontSize: '0.82rem', color: '#64748b' }}>
                    <Navigation size={12} /> {dest.kecamatan}
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.25rem', fontSize: '0.82rem', color: '#64748b' }}>
                    <Star size={12} fill="#fbbf24" color="#fbbf24" /> {dest.rating}
                  </div>
                </div>
              </Popup>
            </Marker>
          ))}

          {/* UMKM Markers */}
          {uniqueUmkm.map((umkm, idx) => (
            <Marker 
              key={`umkm-${umkm.id || idx}`} 
              position={[umkm.latitude, umkm.longitude]} 
              icon={umkmIcon}
            >
              <Popup>
                <div style={{ minWidth: '160px' }}>
                  <h4 style={{ margin: '0 0 0.4rem 0', color: 'var(--color-accent-dark, #16a34a)' }}>
                    {umkm.nama}
                  </h4>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.25rem', marginBottom: '0.35rem', fontSize: '0.82rem', color: '#64748b' }}>
                    <Navigation size={12} /> {umkm.kecamatan}
                  </div>
                  <div style={{ marginTop: '0.35rem', padding: '0.2rem 0.4rem', background: '#dcfce7', color: '#166534', borderRadius: '4px', fontSize: '0.75rem', display: 'inline-block', fontWeight: 600 }}>
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
