'use client';

import { useEffect, useState } from 'react';
import { MapContainer, TileLayer, Marker, Popup, Polyline, useMap } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';

const initLeaflet = () => {
  const L = require('leaflet');
  delete L.Icon.Default.prototype._getIconUrl;
  L.Icon.Default.mergeOptions({
    iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
    iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
    shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
  });
};


function AutoCenterAndLocate({ dpItems, customerItems }: { dpItems: any[], customerItems: any[] }) {
  const map = useMap();
  useEffect(() => {
    const coords: [number, number][] = [];
    dpItems.forEach(c => {
      if (c.latitude && c.longitude) coords.push([parseFloat(c.latitude), parseFloat(c.longitude)]);
    });
    customerItems.forEach(c => {
      if (c.latitude && c.longitude) coords.push([parseFloat(c.latitude), parseFloat(c.longitude)]);
    });

    if (coords.length > 0) {
      const L = require('leaflet');
      map.fitBounds(L.latLngBounds(coords), { padding: [50, 50], maxZoom: 15 });
    } else {
      map.locate({ setView: true, maxZoom: 15 });
    }
  }, [dpItems, customerItems, map]);
  return null;
}

export default function TopologyMap({ customers = [], odps = [], routers = [] }: { customers?: any[], odps?: any[], routers?: any[] }) {
  const [mounted, setMounted] = useState(false);
  const [L, setL] = useState<any>(null);

  useEffect(() => {
    setMounted(true);
    if (typeof window !== 'undefined') {
      const leaflet = require('leaflet');
      initLeaflet();
      setL(leaflet);
    }
  }, []);

  if (!mounted || !L) return <div className="h-[600px] w-full bg-gray-900 border border-white/10 animate-pulse flex items-center justify-center text-gray-500 font-mono rounded-3xl">Loading Topology Map...</div>;

  const createDeviceIcon = (svgContent: string, bgColor: string, iconColor: string = 'white', size: number = 36) => {
    const html = `
      <div style="background-color: ${bgColor}; border: 3px solid white; width: ${size}px; height: ${size}px; border-radius: 50%; display: flex; align-items: center; justify-content: center; box-shadow: 0 4px 10px rgba(0,0,0,0.4); transition: transform 0.2s;">
        <svg xmlns="http://www.w3.org/2000/svg" width="${size * 0.55}" height="${size * 0.55}" viewBox="0 0 24 24" fill="none" stroke="${iconColor}" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
          ${svgContent}
        </svg>
      </div>
    `;
    return L.divIcon({
      className: 'bg-transparent',
      html: html,
      iconSize: [size, size],
      iconAnchor: [size / 2, size / 2],
      popupAnchor: [0, -size / 2]
    });
  };

  // SVG Paths untuk ilustrasi device
  const routerSvg = '<rect x="2" y="2" width="20" height="8" rx="2" ry="2"></rect><rect x="2" y="14" width="20" height="8" rx="2" ry="2"></rect><line x1="6" y1="6" x2="6.01" y2="6"></line><line x1="6" y1="18" x2="6.01" y2="18"></line>';
  const odpSvg = '<path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z"></path><polyline points="3.27 6.96 12 12.01 20.73 6.96"></polyline><line x1="12" y1="22.08" x2="12" y2="12"></line>';
  const customerSvg = '<path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"></path><polyline points="9 22 9 12 15 12 15 22"></polyline>';

  const customerActiveIcon = createDeviceIcon(customerSvg, '#10b981', 'white', 28); // Emerald (Kecil)
  const customerIsolirIcon = createDeviceIcon(customerSvg, '#ef4444', 'white', 28); // Red (Kecil)
  const odpIcon = createDeviceIcon(odpSvg, '#f59e0b', 'white', 34);     // Amber (Box/Hexagon)
  const serverIcon = createDeviceIcon(routerSvg, '#3b82f6', 'white', 40);  // Blue (Router Rack)

  return (
    <div className="h-[600px] w-full relative z-0 rounded-3xl overflow-hidden border border-white/10">
      <MapContainer center={[-6.200000, 106.816666]} zoom={12} style={{ height: '100%', width: '100%' }}>
        <AutoCenterAndLocate dpItems={odps} customerItems={customers} />
        <TileLayer
          attribution='&copy; Google Maps'
          url="http://mt0.google.com/vt/lyrs=y&hl=en&x={x}&y={y}&z={z}"
        />
        
        {/* Draw Routers/Servers */}
        {routers.map((r: any) => {
          if (!r.latitude || !r.longitude) return null;
          return (
            <Marker key={`router-${r.id}`} position={[parseFloat(r.latitude), parseFloat(r.longitude)]} icon={serverIcon}>
              <Popup>
                <strong>🖥️ Server: {r.name}</strong><br/>IP: {r.host}
              </Popup>
            </Marker>
          );
        })}

        {/* Draw ODPs / Access Points */}
        {odps.map((odp: any) => {
          if (!odp.latitude || !odp.longitude) return null;
          return (
            <Marker key={`odp-${odp.id}`} position={[parseFloat(odp.latitude), parseFloat(odp.longitude)]} icon={odpIcon}>
              <Popup>
                <strong>📡 ODP: {odp.name}</strong><br/>Kapasitas: {odp.total_ports} Port
              </Popup>
            </Marker>
          );
        })}

        {/* Draw Customers & Polylines to their ODP */}
        {customers.map((c: any) => {
          if (!c.latitude || !c.longitude) return null;
          const pos: [number, number] = [parseFloat(c.latitude), parseFloat(c.longitude)];
          
          // Find ODP to draw line
          let odpPos: [number, number] | null = null;
          if (c.distribution_point_id) {
            const myOdp = odps.find((o: any) => o.id === c.distribution_point_id);
            if (myOdp && myOdp.latitude && myOdp.longitude) {
              odpPos = [parseFloat(myOdp.latitude), parseFloat(myOdp.longitude)];
            }
          }

          return (
            <div key={`customer-group-${c.id}`}>
              <Marker position={pos} icon={c.status === 'active' ? customerActiveIcon : customerIsolirIcon}>
                <Popup>
                  <div className="font-sans min-w-[200px]">
                    <strong className="text-gray-800 text-base block mb-2 border-b pb-1">👤 {c.name}</strong>
                    <div className="space-y-1 text-sm">
                      <div className="flex justify-between">
                        <span className="text-gray-500">Status:</span>
                        <span className="font-semibold" style={{color: c.status === 'active' ? '#10b981' : '#ef4444'}}>
                          {c.status.toUpperCase()}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-500">ODP:</span>
                        <span className="font-medium text-gray-700">{c.dp?.name || 'Belum di-set'}</span>
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
              {odpPos && (
                <Polyline 
                  positions={[odpPos, pos]} 
                  pathOptions={{ color: c.status === 'active' ? '#10b981' : '#ef4444', weight: 2, opacity: 0.6, dashArray: '5, 5' }} 
                />
              )}
            </div>
          );
        })}
      </MapContainer>
    </div>
  );
}
