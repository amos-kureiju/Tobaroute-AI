// ====================================================================================================
// FILE: frontend/src/components/RoutingMachine.jsx
// TUJUAN:
// Komponen kalkulator navigasi jalan raya (Road-Network Routing Engine) untuk peta Leaflet.
// Mengirimkan koordinat titik singgah (Waypoints) ke Open Source Routing Machine (OSRM API)
// untuk mendapatkan geometri jalan raya nyata (bukan garis lurus), estimasi jarak (KM), dan durasi (Menit).
// ====================================================================================================

import React, { useState, useEffect } from 'react';
import { Polyline, useMap } from 'react-leaflet';

const RoutingMachine = ({ waypoints, onRouteInfo }) => {
  const map = useMap();
  const [roadCoordinates, setRoadCoordinates] = useState([]);

  useEffect(() => {
    if (!map || !waypoints || waypoints.length < 2) {
      setRoadCoordinates([]);
      return;
    }

    const start = waypoints[0];
    const end = waypoints[waypoints.length - 1];

    if (!start || !end || !start[0] || !start[1] || !end[0] || !end[1]) {
      return;
    }

    let isMounted = true;

    // ====================================================================================================
    // FUNGSI: fetchRoute
    // TUJUAN:
    // Mengambil rute perjalanan jalan raya dari OSRM API publik dan fallback server OSM Jerman.
    // ====================================================================================================
    const fetchRoute = async () => {
      // OSRM menggunakan urutan format: lon,lat;lon,lat
      const waypointsParam = waypoints.map(wp => `${wp[1]},${wp[0]}`).join(';');
      const primaryUrl = `https://router.project-osrm.org/route/v1/driving/${waypointsParam}?overview=full&geometries=geojson`;
      const fallbackUrl = `https://routing.openstreetmap.de/routed-car/route/v1/driving/${waypointsParam}?overview=full&geometries=geojson`;

      let routeData = null;

      try {
        const res = await fetch(primaryUrl);
        if (res.ok) {
          routeData = await res.json();
        }
      } catch (err) {
        console.warn('OSRM Primary API timeout/error, mencoba fallback...', err);
      }

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

      if (routeData && routeData.routes && routeData.routes.length > 0) {
        const route = routeData.routes[0];
        // Konversi GeoJSON [lon, lat] ke koordinat Leaflet [lat, lon]
        const latLngs = route.geometry.coordinates.map(coord => [coord[1], coord[0]]);
        setRoadCoordinates(latLngs);

        // Kirimkan info total jarak (km) dan estimasi waktu berkendara (menit) ke komponen induk
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
        // Fallback jika kedua server OSRM tidak merespons: gambar garis lurus antar titik
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

    return () => {
      isMounted = false;
    };
  }, [waypoints, map]);

  if (!roadCoordinates || roadCoordinates.length < 2) {
    return null;
  }

  return (
    <>
      {/* Garis bayangan luar (Glow effect) untuk kontras tinggi di atas peta satelit/jalan */}
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
      {/* Garis rute utama yang tajam */}
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
