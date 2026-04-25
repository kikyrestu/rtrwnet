'use client';

import { useEffect, useState, useRef, useMemo } from 'react';
import Swal from 'sweetalert2';
import { MapContainer, TileLayer, Marker, useMap } from 'react-leaflet';
import { LocateFixed } from 'lucide-react';
import 'leaflet/dist/leaflet.css';

// Fix typical Leaflet marker icon issue in Next.js/React
const initLeaflet = () => {
  const L = require('leaflet');
  delete L.Icon.Default.prototype._getIconUrl;
  L.Icon.Default.mergeOptions({
    iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
    iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
    shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
  });
};

function MapCenterSetter({ center }: { center: [number, number] }) {
  const map = useMap();
  useEffect(() => {
    if (map) {
      map.setView(center, map.getZoom());
    }
  }, [center, map]);
  return null;
}

interface MapInputProps {
  lat: number;
  lng: number;
  onChange: (lat: number, lng: number) => void;
}

export default function MapInput({ lat, lng, onChange }: MapInputProps) {
  const [mounted, setMounted] = useState(false);
  const fallbackCenter: [number, number] = [-6.200000, 106.816666]; // Default Jakarta
  const center: [number, number] = [lat || fallbackCenter[0], lng || fallbackCenter[1]];

  useEffect(() => {
    setMounted(true);
    if (typeof window !== 'undefined') {
      initLeaflet();
    }
  }, []);

  const eventHandlers = useMemo(
    () => ({
      dragend(e: any) {
        const marker = e.target;
        if (marker != null) {
          const position = marker.getLatLng();
          onChange(position.lat, position.lng);
        }
      },
    }),
    [onChange]
  );

  const getCurrentLocation = (e: React.MouseEvent) => {
    e.preventDefault();
    if (!navigator.geolocation) {
      Swal.fire({text: 'Browser tidak mendukung Geolocation / GPS', background: '#1e293b', color: '#f8fafc', icon: 'info'});
      return;
    }

    navigator.geolocation.getCurrentPosition(
      (position) => {
        onChange(position.coords.latitude, position.coords.longitude);
      },
      (error) => {
        Swal.fire({text: `Gagal mengambil lokasi: ${error.message}`, background: '#1e293b', color: '#f8fafc', icon: 'info'});
      },
      { enableHighAccuracy: true, timeout: 10000, maximumAge: 0 }
    );
  };

  if (!mounted) return <div className="h-64 w-full bg-gray-800 animate-pulse rounded-xl flex items-center justify-center text-gray-500">Memuat Peta...</div>;

  return (
    <div className="h-64 w-full rounded-xl overflow-hidden border border-white/10 relative z-0 group">
      {/* Floating GPS Button */}
      <button 
        onClick={getCurrentLocation}
        title="Dapatkan Posisi GPS Saat Ini"
        className="absolute top-3 right-3 z-[1000] bg-white text-blue-600 p-2.5 rounded-xl shadow-lg border border-gray-200 hover:bg-blue-50 active:scale-95 transition-all flex items-center justify-center"
      >
        <LocateFixed size={20} />
      </button>

      <MapContainer center={center} zoom={15} style={{ height: '100%', width: '100%' }}>
        <MapCenterSetter center={center} />
        <TileLayer
          attribution='&copy; Google Maps'
          url="http://mt0.google.com/vt/lyrs=y&hl=en&x={x}&y={y}&z={z}"
        />
        <Marker
          draggable={true}
          eventHandlers={eventHandlers}
          position={center}
        />
      </MapContainer>
    </div>
  );
}