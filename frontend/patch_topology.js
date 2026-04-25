const fs = require('fs');
let c = fs.readFileSync('d:/PROJECT/RT-RWNET_PAKAAM/frontend/src/components/ui/TopologyMap.tsx', 'utf8');

if(!c.includes('AutoCenterAndLocate')) {
  let modified = c.replace(/import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';/, "import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet';\nimport { useEffect } from 'react';");

  const autoLocator = 
function AutoCenterAndLocate({ dpItems, customerItems }: { dpItems: any[], customerItems: any[] }) {
  const map = useMap();
  useEffect(() => {
    const coords = [];
    if(Array.isArray(dpItems)) {
        dpItems.forEach(c => {
          if (c.latitude && c.longitude) coords.push([parseFloat(c.latitude), parseFloat(c.longitude)]);
        });
    }
    if(Array.isArray(customerItems)) {
        customerItems.forEach(c => {
          if (c.latitude && c.longitude) coords.push([parseFloat(c.latitude), parseFloat(c.longitude)]);
        });
    }

    if (coords.length > 0) {
      const L = require('leaflet');
      map.fitBounds(L.latLngBounds(coords), { padding: [50, 50], maxZoom: 15 });
    } else {
      map.locate({ setView: true, maxZoom: 15 });
    }
  }, [dpItems, customerItems, map]);
  return null;
}

export default function TopologyMap;

  modified = modified.replace(/export default function TopologyMap/, autoLocator);
  modified = modified.replace(/<MapContainer center={\[-6.200000, 106.816666\]} zoom={12} style={{ height: '100%', width: '100%' }}>/g, "<MapContainer center={[-6.200000, 106.816666]} zoom={12} style={{ height: '100%', width: '100%' }}>\n          <AutoCenterAndLocate dpItems={distributionPoints} customerItems={customers} />");

  fs.writeFileSync('d:/PROJECT/RT-RWNET_PAKAAM/frontend/src/components/ui/TopologyMap.tsx', modified);
  console.log('TopologyMap patched.');
} else {
  console.log('TopologyMap already patched.');
}
