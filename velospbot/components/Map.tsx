'use client'

import { useEffect } from 'react';
import { MapContainer, TileLayer, Marker, useMap, ZoomControl, Polyline } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';

// Фикс для иконок маркеров
const icon = L.icon({
  iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
  iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
  iconSize: [25, 41],
  iconAnchor: [12, 41],
});

interface MapProps {
  center: [number, number];
  isTracking: boolean;
  locationHistory: Array<{coords: {latitude: number; longitude: number}}>;
}

function LocationUpdater({ center, isTracking }: { center: [number, number]; isTracking: boolean }) {
  const map = useMap();
  
  useEffect(() => {
    if (isTracking) {
      map.setView(center, 17, { animate: true });
    }
  }, [center, map, isTracking]);

  return null;
}

export default function Map({ center, isTracking, locationHistory }: MapProps) {
  const positions = locationHistory.map(loc => [loc.coords.latitude, loc.coords.longitude] as [number, number]);

  return (
    <div style={{ height: '60vh', width: '100%', marginBottom: '1rem' }}>
      <MapContainer
        center={center}
        zoom={16}
        style={{ height: '100%', width: '100%' }}
        zoomControl={false}
        dragging={true}
        touchZoom={true}
        doubleClickZoom={true}
      >
        <ZoomControl position="bottomright" />
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        <Marker position={center} icon={icon} />
        {positions.length > 1 && (
          <Polyline 
            positions={positions}
            color="blue"
            weight={3}
            opacity={0.7}
          />
        )}
        <LocationUpdater center={center} isTracking={isTracking} />
      </MapContainer>
    </div>
  );
} 