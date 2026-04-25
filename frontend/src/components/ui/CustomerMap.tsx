'use client';

import { useEffect, useState } from 'react';
import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import { api } from '@/lib/api';

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

function AutoCenterAndLocate({ customers }: { customers: any[] }) {
  const map = useMap();
  useEffect(() => {
    const coords: [number, number][] = [];
    customers.forEach(c => {
      if (c.latitude && c.longitude) {
        coords.push([parseFloat(c.latitude), parseFloat(c.longitude)]);
      }
    });

    if (coords.length > 0) {
      const L = require('leaflet');
      map.fitBounds(L.latLngBounds(coords), { padding: [50, 50], maxZoom: 15 });
    } else {
      map.locate({ setView: true, maxZoom: 15 });
    }
  }, [customers, map]);
  return null;
}

export default function CustomerMap({ customers = [] }: { customers?: any[] }) {
  const [mounted, setMounted] = useState(false);
  const [activeSessions, setActiveSessions] = useState<Record<string, any>>({});
  const [L, setL] = useState<any>(null);

  useEffect(() => {
    setMounted(true);
    if (typeof window !== 'undefined') {
      const leaflet = require('leaflet');
      initLeaflet();
      setL(leaflet);
    }
  }, []);

  useEffect(() => {
    const fetchActiveSessions = async () => {
      try {
        const res = await api.get('/monitor/customers/active');
        setActiveSessions(res.active_usernames || {});
      } catch (err) {
        // err logged
      }
    };
    if (mounted && customers.length > 0) {
      fetchActiveSessions();
    }
  }, [mounted, customers]);

  if (!mounted || !L) return <div className="h-[500px] w-full bg-gray-900 border border-white/10 animate-pulse flex items-center justify-center text-gray-500 font-mono">Loading Map...</div>;

  const createStatusIcon = (isOnline: boolean) => {
    const bgColor = isOnline ? '#10b981' : '#ef4444'; // Emerald for UP/Online, Red for DOWN/Offline
    const svgContent = '<path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"></path><polyline points="9 22 9 12 15 12 15 22"></polyline>';
    const html = `
      <div style="background-color: ${bgColor}; border: 3px solid white; width: 32px; height: 32px; border-radius: 50%; display: flex; align-items: center; justify-content: center; box-shadow: 0 4px 10px rgba(0,0,0,0.4); transition: transform 0.2s;">
        <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
          ${svgContent}
        </svg>
      </div>
    `;
    return L.divIcon({
      className: 'bg-transparent',
      html: html,
      iconSize: [32, 32],
      iconAnchor: [16, 16],
      popupAnchor: [0, -16]
    });
  };

  return (
    <div className="h-[500px] w-full relative z-0">
      <MapContainer center={[-6.200000, 106.816666]} zoom={12} style={{ height: '100%', width: '100%' }}>
        <TileLayer
          attribution='&copy; Google Maps'
          url="http://mt0.google.com/vt/lyrs=y&hl=en&x={x}&y={y}&z={z}"
        />
        {customers.map((c: any) => {
          if (!c.latitude || !c.longitude) return null;
            const isOnline = activeSessions[c.mikrotik_username] !== undefined && c.status === 'active';
            const uptime = activeSessions[c.mikrotik_username]?.uptime;
            const address = activeSessions[c.mikrotik_username]?.address;

            return (
              <Marker key={c.id} position={[parseFloat(c.latitude), parseFloat(c.longitude)]} icon={createStatusIcon(isOnline)}>
                <Popup>
                  <div className="font-sans min-w-[200px]">
                    <strong className="text-gray-800 text-base block mb-2 border-b pb-1">👤 {c.name}</strong>
                    <div className="space-y-1 text-sm">
                      <div className="flex justify-between">
                        <span className="text-gray-500">Koneksi:</span>
                        <span className="font-semibold" style={{color: isOnline ? '#10b981' : '#ef4444'}}>
                          {isOnline ? 'ONLINE' : 'OFFLINE'}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-500">Status Akun:</span>
                        <span className="font-medium text-gray-700">{c.status.toUpperCase()}</span>
                      </div>
                      {isOnline && uptime && (
                        <div className="flex justify-between">
                          <span className="text-gray-500">Uptime:</span>
                          <span className="font-medium text-gray-700">{uptime}</span>
                        </div>
                      )}
                      {isOnline && address && (
                        <div className="flex justify-between">
                          <span className="text-gray-500">IP:</span>
                          <span className="font-medium text-blue-600">{address}</span>
                        </div>
                      )}
                    <div className="flex justify-between">
                      <span className="text-gray-500">Paket:</span>
                      <span className="font-medium text-gray-700">{c.package?.name || '-'}</span>
                    </div>
                    {(c.ont_merk || c.ont_sn) && (
                      <div className="mt-2 pt-2 border-t border-gray-100 bg-gray-50 p-2 rounded-lg">
                        <strong className="text-xs text-gray-400 uppercase tracking-wider mb-1 block">Info Perangkat (ONU/ONT)</strong>
                        <div className="flex justify-between text-xs mb-1">
                          <span className="text-gray-500">Merk:</span>
                          <span className="font-medium text-gray-700">{c.ont_merk || '-'}</span>
                        </div>
                        <div className="flex justify-between text-xs">
                          <span className="text-gray-500">S/N:</span>
                          <span className="font-mono font-medium text-gray-700">{c.ont_sn || '-'}</span>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </Popup>
            </Marker>
          );
        })}
      </MapContainer>
    </div>
  );
}