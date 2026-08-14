import React, { useState, useEffect } from 'react';
import { Polyline, useMap } from 'react-leaflet';
import L from 'leaflet';

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

    const fetchRoute = async () => {
      // OSRM coordinates: lon,lat;lon,lat
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
        // Convert GeoJSON [lon, lat] ke Leaflet [lat, lon]
        const latLngs = route.geometry.coordinates.map(coord => [coord[1], coord[0]]);
        setRoadCoordinates(latLngs);

        if (onRouteInfo) {
          onRouteInfo({
            distanceKm: (route.distance / 1000).toFixed(1),
            durationMin: Math.max(1, Math.round(route.duration / 60)),
            waypointsCount: latLngs.length
          });
        }

        try {
          const bounds = L.latLngBounds(latLngs);
          map.fitBounds(bounds, { padding: [50, 50], maxZoom: 15, animate: true });
        } catch (e) {
          console.warn('fitBounds error:', e);
        }
      } else {
        // Fallback: jalur langsung bersih jika offline
        setRoadCoordinates(waypoints);
        try {
          const bounds = L.latLngBounds(waypoints);
          map.fitBounds(bounds, { padding: [50, 50], maxZoom: 15 });
        } catch (e) {}
      }
    };

    fetchRoute();

    return () => {
      isMounted = false;
    };
  }, [map, JSON.stringify(waypoints)]);

  if (!roadCoordinates || roadCoordinates.length < 2) {
    return null;
  }

  return (
    <>
      {/* Casing / White Border Outline for clean contrast */}
      <Polyline
        positions={roadCoordinates}
        pathOptions={{
          color: '#ffffff',
          weight: 8,
          opacity: 0.95,
          lineCap: 'round',
          lineJoin: 'round'
        }}
      />
      {/* Primary Navigation Blue Road Line */}
      <Polyline
        positions={roadCoordinates}
        pathOptions={{
          color: '#0284c7',
          weight: 5,
          opacity: 1,
          lineCap: 'round',
          lineJoin: 'round'
        }}
      />
    </>
  );
};

export default RoutingMachine;
