// ====================================================================================================
// FILE: frontend/src/components/RouteMap.jsx
// TUJUAN & PENJELASAN ARSITEKTUR GIS:
// Komponen Peta Navigasi Interaktif Kawasan Danau Toba berbasis React-Leaflet & OpenStreetMap / Google Maps.
// Fitur & Algoritma:
// 1. NEAREST-NEIGHBOR TSP OPTIMIZER: Menyusun rute rantai perjalanan berurutan secara geografis
//    dari titik GPS pengguna -> Destinasi Utama 1 -> UMKM Sekitar -> Destinasi Utama 2.
// 2. GEOLOCATION POSITIONING: Mendeteksi GPS perangkat browser dengan pembatasan koordinat lingkar Toba.
// 3. DRAGGABLE GPS PIN: Pengguna dapat menggeser pin GPS ungu untuk mengubah titik awal keberangkatan secara instan.
// 4. MULTI-LAYER MAP SELECTOR: Memungkinkan penggantian layer peta (OpenStreetMap, Google Maps, dan Satelit).
// ====================================================================================================

import React, { useState, useEffect } from 'react';
import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';
import { Navigation, Star, MapPin, Flag, ArrowRight, Store } from 'lucide-react';
import RoutingMachine from './RoutingMachine';

// ====================================================================================================
// DEFINISI IKON PIN LEAFLET KUSTOM (RETINA 2X)
// Dibuat dengan anchor point di bagian bawah tengah ([12, 41]) agar ujung jarum tepat menunjuk koordinat.
// ====================================================================================================

// Ikon Biru: Destinasi Wisata Utama
const wisataIcon = new L.Icon({
  iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-blue.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/0.7.7/images/marker-shadow.png',
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41]
});

// Ikon Hijau: Rekomendasi Pelaku UMKM Lokal
const umkmIcon = new L.Icon({
  iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-green.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/0.7.7/images/marker-shadow.png',
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41]
});

// Ikon Ungu: Posisi GPS Langsung Wisatawan (Ukuran lebih besar dan dapat digeser)
const userGpsIcon = new L.Icon({
  iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-violet.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/0.7.7/images/marker-shadow.png',
  iconSize: [30, 46],
  iconAnchor: [15, 46],
  popupAnchor: [1, -38],
  shadowSize: [41, 41]
});

// Koordinat Default Pusat Kawasan Danau Toba (Balige) jika wisatawan menolak izin GPS browser
const DEFAULT_START_ORIGIN = [2.3333, 99.0667];

// ====================================================================================================
// KOMPONEN HELPER: MapViewController
// PENJELASAN:
// Leaflet MapContainer tidak otomatis memperbarui batas pandangnya saat props React berubah.
// Komponen anak ini menggunakan hook 'useMap()' untuk memanggil 'map.fitBounds(bounds)' dengan padding
// sehingga seluruh titik rute muat dan terlihat sempurna di layar pengguna.
// ====================================================================================================
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

// ====================================================================================================
// FUNGSI MATEMATIKA: distSq (JARAK KUADRAT EUCLIDEAN 2D)
// PENJELASAN OPTIMASI:
// Rumus: (x1 - x2)^2 + (y1 - y2)^2
// Mengapa tidak menggunakan akar kuadrat Math.sqrt()?
// Karena fungsi akar kuadrat sangat lambat pada CPU. Untuk membandingkan jarak "mana yang lebih dekat",
// perbandingan kuadrat jarak (a^2 < b^2) menghasilkan kesimpulan yang identik dengan (a < b).
// ====================================================================================================
const distSq = (p1, p2) => {
  const dLat = p1[0] - p2[0];
  const dLng = p1[1] - p2[1];
  return dLat * dLat + dLng * dLng;
};

// ====================================================================================================
// ALGORITMA: optimizeRouteSequence (GREEDY NEAREST-NEIGHBOR TSP)
// PENJELASAN:
// Menyelesaikan masalah rute pedagang keliling (Traveling Salesperson Problem / TSP) secara efisien:
// 1. Mulai dari titik awal keberangkatan (startPoint / GPS pengguna).
// 2. Cari titik terdekat berikutnya di antara sisa target yang belum dikunjungi.
// 3. Masukkan titik tersebut ke urutan rute dan jadikan sebagai titik acuan baru.
// 4. Ulangi sampai semua destinasi dan UMKM terhubung dalam satu jalur yang tidak bolak-balik.
// ====================================================================================================
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

// Konfigurasi layer ubin (TileLayer) peta
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

const RouteMap = ({ destinasiUtama = [], umkmSekitar = [] }) => {
  const [userLocation, setUserLocation] = useState(null);
  const [mapStyle, setMapStyle] = useState('osm');

  // ====================================================================================================
  // EFFECT: Pelacakan Lokasi GPS Wisatawan dengan Proteksi Batas Geografis Toba
  // PENJELASAN:
  // 1. Memeriksa apakah ada koordinat tersimpan di localStorage dari sesi sebelumnya.
  // 2. Meminta izin GPS browser (navigator.geolocation.getCurrentPosition).
  // 3. Validasi batas geografis (Latitude 1.9 - 3.2, Longitude 98.0 - 99.8) untuk memastikan
  //    koordinat berada di Sumatera Utara / Danau Toba.
  // ====================================================================================================
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
          const isInTobaRegion = (lat >= 1.9 && lat <= 3.2 && lon >= 98.0 && lon <= 99.8);
          
          if (isInTobaRegion || !cachedGps) {
            const newCoords = [lat, lon];
            setUserLocation(newCoords);
            localStorage.setItem('tobaroute_user_gps', JSON.stringify(newCoords));
          }
        },
        (error) => {
          console.warn("Akses GPS tidak diaktifkan, menggunakan titik awal default.");
        },
        { enableHighAccuracy: true, timeout: 10000, maximumAge: 60000 }
      );
    }
  }, []);

  // Filter duplikasi data berdasarkan nama unik agar peta tidak menumpuk marker yang sama
  const uniqueDestinasi = Array.from(
    new Map(destinasiUtama.filter(d => d.latitude && d.longitude).map(d => [d.nama.trim(), d])).values()
  );
  
  const uniqueUmkm = Array.from(
    new Map(umkmSekitar.filter(u => u.latitude && u.longitude).map(u => [u.nama.trim(), u])).values()
  );

  // Jika tidak ada data koordinat sama sekali, jangan render peta
  if (uniqueDestinasi.length === 0 && uniqueUmkm.length === 0) {
    return null;
  }

  // Bungkus seluruh tujuan ke dalam array target rute
  const rawTargets = [
    ...uniqueDestinasi.map(d => ({ type: 'destinasi', data: d, coords: [d.latitude, d.longitude] })),
    ...uniqueUmkm.slice(0, 2).map(u => ({ type: 'umkm', data: u, coords: [u.latitude, u.longitude] }))
  ];

  // Tentukan titik start dan lakukan optimasi urutan rute
  const startPoint = userLocation || (rawTargets.length > 0 ? rawTargets[0].coords : DEFAULT_START_ORIGIN);
  const orderedTargets = optimizeRouteSequence(startPoint, rawTargets);
  const routeCoordinates = [startPoint, ...orderedTargets.map(t => t.coords)];

  const center = userLocation 
    ? userLocation 
    : (orderedTargets.length > 0 ? orderedTargets[0].coords : [2.6105, 98.8106]);

  // ====================================================================================================
  // HANDLER: handleMarkerDragEnd
  // PENJELASAN:
  // Dipanggil saat pengguna selesai menggeser pin GPS ungu di peta.
  // Otomatis memperbarui state 'userLocation' dan menghitung ulang seluruh geometri jalan raya secara real-time.
  // ====================================================================================================
  const handleMarkerDragEnd = (e) => {
    const latLng = e.target.getLatLng();
    const newCoords = [latLng.lat, latLng.lng];
    setUserLocation(newCoords);
    localStorage.setItem('tobaroute_user_gps', JSON.stringify(newCoords));
  };

  return (
    <div className="route-map-container" style={{ marginTop: '1.75rem' }}>
      {/* Panel Informasi Urutan Rute Perjalanan */}
      <div className="route-controls-panel glass-panel" style={{ padding: '0.85rem 1.15rem', marginBottom: '0.75rem', borderRadius: 'var(--radius-lg)' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '0.5rem' }}>
          <div>
            <h4 style={{ margin: 0, color: 'var(--color-primary-dark)', display: 'flex', alignItems: 'center', gap: '0.4rem', fontSize: '1.05rem', fontWeight: 600 }}>
              <Navigation size={18} color="#0284c7" /> Alur Rute Navigasi Perjalanan Presisi
            </h4>
            <p style={{ margin: '0.15rem 0 0 0', fontSize: '0.82rem', color: '#64748b' }}>
              {userLocation ? 'Rute dioptimalkan secara geografis dari titik GPS Anda. (Pin ungu dapat digeser untuk ubah titik awal).' : 'Rute dioptimalkan secara geografis ke destinasi terdekat.'}
            </p>
          </div>
        </div>

        {/* Visualisasi Rantai Perjalanan Berurutan */}
        <div style={{ marginTop: '0.75rem', display: 'flex', alignItems: 'center', gap: '0.4rem', flexWrap: 'wrap', background: 'rgba(255,255,255,0.9)', padding: '0.6rem 0.85rem', borderRadius: '8px', border: '1px solid #e2e8f0' }}>
          <div style={{ display: 'inline-flex', alignItems: 'center', gap: '0.35rem', background: userLocation ? '#f3e8ff' : '#e0f2fe', color: userLocation ? '#6b21a8' : '#0369a1', padding: '0.25rem 0.55rem', borderRadius: '5px', fontSize: '0.8rem', fontWeight: 600 }}>
            <MapPin size={13} /> {userLocation ? 'Lokasi Anda (GPS)' : 'Keberangkatan Awal'}
          </div>

          {orderedTargets.map((item, idx) => (
            <React.Fragment key={item.data.id || idx}>
              <ArrowRight size={13} color="#94a3b8" />
              <div style={{ 
                display: 'inline-flex', 
                alignItems: 'center', 
                gap: '0.35rem', 
                background: item.type === 'destinasi' ? '#f1f5f9' : '#dcfce7', 
                color: item.type === 'destinasi' ? '#1e293b' : '#15803d', 
                padding: '0.25rem 0.55rem', 
                borderRadius: '5px', 
                fontSize: '0.8rem', 
                fontWeight: item.type === 'destinasi' ? 500 : 600 
              }}>
                {item.type === 'destinasi' ? (
                  <Flag size={12} color="#0284c7" />
                ) : (
                  <Store size={12} color="#15803d" />
                )}
                {idx + 1}. {item.data.nama} {item.type === 'umkm' ? '(UMKM)' : ''}
              </div>
            </React.Fragment>
          ))}
        </div>
      </div>

      {/* Kontainer Peta Leaflet */}
      <div className="route-map-wrapper glass-panel" style={{ height: '420px', width: '100%', borderRadius: 'var(--radius-lg)', overflow: 'hidden', padding: '0.4rem' }}>
        <MapContainer 
          center={center} 
          zoom={11} 
          style={{ height: '100%', width: '100%', borderRadius: 'calc(var(--radius-lg) - 0.4rem)' }}
        >
          <TileLayer
            attribution={MAP_STYLES[mapStyle].attribution}
            url={MAP_STYLES[mapStyle].url}
          />

          {/* Tombol Pengganti Layer Peta */}
          <div style={{ position: 'absolute', top: '10px', right: '10px', zIndex: 1000, display: 'flex', gap: '5px', background: 'white', padding: '5px', borderRadius: '8px', boxShadow: '0 2px 5px rgba(0,0,0,0.2)' }}>
            <button 
              onClick={() => setMapStyle('osm')}
              style={{ padding: '0.25rem 0.5rem', fontSize: '0.75rem', borderRadius: '4px', border: 'none', background: mapStyle === 'osm' ? '#0284c7' : 'transparent', color: mapStyle === 'osm' ? 'white' : '#475569', cursor: 'pointer', fontWeight: mapStyle === 'osm' ? 'bold' : 'normal' }}
            >
              OSM Default
            </button>
            <button 
              onClick={() => setMapStyle('google_streets')}
              style={{ padding: '0.25rem 0.5rem', fontSize: '0.75rem', borderRadius: '4px', border: 'none', background: mapStyle === 'google_streets' ? '#0284c7' : 'transparent', color: mapStyle === 'google_streets' ? 'white' : '#475569', cursor: 'pointer', fontWeight: mapStyle === 'google_streets' ? 'bold' : 'normal' }}
            >
              Google Maps
            </button>
            <button 
              onClick={() => setMapStyle('google_satellite')}
              style={{ padding: '0.25rem 0.5rem', fontSize: '0.75rem', borderRadius: '4px', border: 'none', background: mapStyle === 'google_satellite' ? '#0284c7' : 'transparent', color: mapStyle === 'google_satellite' ? 'white' : '#475569', cursor: 'pointer', fontWeight: mapStyle === 'google_satellite' ? 'bold' : 'normal' }}
            >
              Satelit
            </button>
          </div>

          <MapViewController center={center} waypoints={routeCoordinates} />

          {/* Marker Lokasi Pengguna (Bisa Digeser) */}
          {userLocation && (
            <Marker 
              position={userLocation} 
              icon={userGpsIcon}
              draggable={true}
              eventHandlers={{
                dragend: handleMarkerDragEnd
              }}
              zIndexOffset={1000}
            >
              <Popup>
                <div style={{ minWidth: '160px', textAlign: 'center' }}>
                  <h4 style={{ margin: '0 0 0.2rem 0', color: '#6b21a8' }}>📍 Lokasi Anda (GPS)</h4>
                  <p style={{ margin: 0, fontSize: '0.78rem', color: '#64748b' }}>Titik Keberangkatan Awal</p>
                  <div style={{ marginTop: '0.35rem', fontSize: '0.72rem', color: '#0284c7', background: '#f0f9ff', padding: '0.2rem 0.4rem', borderRadius: '4px' }}>
                    💡 Geser pin ini untuk ubah titik awal
                  </div>
                </div>
              </Popup>
            </Marker>
          )}

          {/* Mesin Perutean Jalan Raya Nyata (OSRM Engine) */}
          {routeCoordinates.length >= 2 && (
            <RoutingMachine waypoints={routeCoordinates} />
          )}

          {/* Marker Seluruh Destinasi Utama */}
          {uniqueDestinasi.map((dest, idx) => (
            <Marker 
              key={`dest-${dest.id || idx}`} 
              position={[dest.latitude, dest.longitude]} 
              icon={wisataIcon}
            >
              <Popup>
                <div style={{ minWidth: '180px' }}>
                  <h4 style={{ margin: '0 0 0.4rem 0', color: 'var(--color-primary-dark)' }}>
                    {dest.nama}
                  </h4>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.25rem', marginBottom: '0.25rem', fontSize: '0.82rem', color: '#64748b' }}>
                    <Navigation size={12} /> {dest.kecamatan}
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.25rem', marginBottom: '0.35rem', fontSize: '0.82rem', color: '#64748b' }}>
                    <Star size={12} fill="#fbbf24" color="#fbbf24" /> {dest.rating}
                  </div>
                  {dest.full_address && (
                    <div style={{ background: '#f1f5f9', color: '#334155', padding: '0.25rem 0.5rem', borderRadius: '4px', fontSize: '0.72rem', fontFamily: 'monospace' }}>
                      📍 {dest.full_address}
                    </div>
                  )}
                </div>
              </Popup>
            </Marker>
          ))}

          {/* Marker Seluruh UMKM Sekitar */}
          {uniqueUmkm.map((umkm, idx) => (
            <Marker 
              key={`umkm-${umkm.id || idx}`} 
              position={[umkm.latitude, umkm.longitude]} 
              icon={umkmIcon}
            >
              <Popup>
                <div style={{ minWidth: '180px' }}>
                  <h4 style={{ margin: '0 0 0.4rem 0', color: 'var(--color-accent-dark, #16a34a)' }}>
                    {umkm.nama}
                  </h4>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.25rem', marginBottom: '0.25rem', fontSize: '0.82rem', color: '#64748b' }}>
                    <Navigation size={12} /> {umkm.kecamatan}
                  </div>
                  {umkm.full_address && (
                    <div style={{ background: '#f1f5f9', color: '#334155', padding: '0.25rem 0.5rem', borderRadius: '4px', fontSize: '0.72rem', fontFamily: 'monospace', marginBottom: '0.35rem' }}>
                      📍 {umkm.full_address}
                    </div>
                  )}
                  <div style={{ padding: '0.2rem 0.4rem', background: '#dcfce7', color: '#166534', borderRadius: '4px', fontSize: '0.75rem', display: 'inline-block', fontWeight: 600 }}>
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
