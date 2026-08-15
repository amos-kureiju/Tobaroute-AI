// ====================================================================================================
// FILE: frontend/src/components/RoutingMachine.jsx
// TUJUAN & PENJELASAN ARSITEKTUR NAVIGASI JALAN RAYA:
// Komponen kalkulator navigasi jalan raya (Road-Network Routing Engine) untuk peta Leaflet.
//
// MENGAPA MENGGUNAKAN OSRM (OPEN SOURCE ROUTING MACHINE)?
// Menghubungkan titik di peta dengan garis lurus (Euclidean line) adalah keliru dalam navigasi wisata,
// karena wisatawan berkendara melalui jalan aspal, kelokan bukit, dan jembatan.
// OSRM menggunakan graf jaringan jalan OpenStreetMap dan algoritma 'Contraction Hierarchies'
// untuk menghitung rute mobil tercepat, jarak presisi (Kilometer), dan estimasi waktu tempuh (Menit).
// ====================================================================================================

import React, { useState, useEffect } from 'react';
import { Polyline, useMap } from 'react-leaflet';

const RoutingMachine = ({ waypoints, onRouteInfo }) => {
  const map = useMap();
  // State untuk menyimpan array koordinat geometri jalan raya [[lat, lon], [lat, lon], ...]
  const [roadCoordinates, setRoadCoordinates] = useState([]);

  useEffect(() => {
    // Validasi: perutean hanya dapat dihitung jika ada minimal 2 titik singgah (titik awal & tujuan)
    if (!map || !waypoints || waypoints.length < 2) {
      setRoadCoordinates([]);
      return;
    }

    const start = waypoints[0];
    const end = waypoints[waypoints.length - 1];

    if (!start || !end || !start[0] || !start[1] || !end[0] || !end[1]) {
      return;
    }

    // Flag untuk mencegah memory leak / race condition jika komponen di-unmount saat fetch berlangsung
    let isMounted = true;

    // ====================================================================================================
    // FUNGSI ASINKRON: fetchRoute
    // PENJELASAN:
    // 1. OSRM API mewajibkan urutan koordinat: "Longitude,Latitude;Longitude,Latitude" (Format GeoJSON).
    // 2. Memanggil server utama OSRM ('router.project-osrm.org').
    // 3. Jika server utama sibuk/timeout, otomatis beralih ke server cadangan ('routing.openstreetmap.de').
    // 4. Mengonversi kembali koordinat GeoJSON [lon, lat] menjadi format Leaflet [lat, lon].
    // ====================================================================================================
    const fetchRoute = async () => {
      // 1. Susun parameter titik singgah dalam format OSRM (lon,lat)
      const waypointsParam = waypoints.map(wp => `${wp[1]},${wp[0]}`).join(';');
      const primaryUrl = `https://router.project-osrm.org/route/v1/driving/${waypointsParam}?overview=full&geometries=geojson`;
      const fallbackUrl = `https://routing.openstreetmap.de/routed-car/route/v1/driving/${waypointsParam}?overview=full&geometries=geojson`;

      let routeData = null;

      // 2. Mencoba server OSRM primer
      try {
        const res = await fetch(primaryUrl);
        if (res.ok) {
          routeData = await res.json();
        }
      } catch (err) {
        console.warn('OSRM Primary API timeout, beralih ke server fallback...', err);
      }

      // 3. Mencoba server OSRM cadangan jika primer gagal
      if (!routeData || !routeData.routes || routeData.routes.length === 0) {
        try {
          const resFallback = await fetch(fallbackUrl);
          if (resFallback.ok) {
            routeData = await resFallback.json();
          }
        } catch (err) {
          console.warn('OSRM Fallback API error:', err);
        }
      }

      if (!isMounted) return;

      // 4. Ekstraksi Geometri Jalan Raya & Metrik Waktu Tempuh
      if (routeData && routeData.routes && routeData.routes.length > 0) {
        const route = routeData.routes[0];
        
        // Membalikkan [longitude, latitude] dari OSRM menjadi [latitude, longitude] untuk Leaflet Polyline
        const latLngs = route.geometry.coordinates.map(coord => [coord[1], coord[0]]);
        setRoadCoordinates(latLngs);

        // Mengirimkan total jarak (km) dan durasi (menit) ke komponen induk
        if (onRouteInfo) {
          const distanceKm = (route.distance / 1000).toFixed(1);
          const durationMins = Math.round(route.duration / 60);
          onRouteInfo({
            distanceKm,
            durationMins,
            success: true
          });
        }
      } else {
        // Fallback darurat: gambar garis langsung antar titik jika kedua server OSRM tidak merespons
        setRoadCoordinates(waypoints);
        if (onRouteInfo) {
          onRouteInfo({
            distanceKm: '~',
            durationMins: '~',
            success: false
          });
        }
      }
    };

    fetchRoute();

    // Cleanup function saat effect dibongkar
    return () => {
      isMounted = false;
    };
  }, [waypoints, map]);

  if (!roadCoordinates || roadCoordinates.length < 2) {
    return null;
  }

  return (
    <>
      {/* LAYER 1 (BAYANGAN / GLOW EFFECT):
          Garis biru tebal dengan opasitas 35% di bawah garis utama untuk memberikan kontras
          yang sangat jelas saat dilihat di atas citra satelit Google ataupun peta jalan. */}
      <Polyline
        positions={roadCoordinates}
        pathOptions={{
          color: '#0369a1',
          weight: 7,
          opacity: 0.35,
          lineCap: 'round',
          lineJoin: 'round'
        }}
      />

      {/* LAYER 2 (GARIS NAVIGASI UTAMA):
          Garis biru cerah tajam yang merepresentasikan jalur jalan raya yang harus dilalui kendaraan. */}
      <Polyline
        positions={roadCoordinates}
        pathOptions={{
          color: '#0284c7',
          weight: 4.5,
          opacity: 0.95,
          lineCap: 'round',
          lineJoin: 'round'
        }}
      />
    </>
  );
};

export default RoutingMachine;
