<?php
require_once 'db.php'; // Panggil file koneksi (kasaran dulu)
$odps = getDummyODP();
$customers = getDummyCustomers();
?>
<!DOCTYPE html>
<html lang="id">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>RT-RW Net Dashboard (Prototype)</title>
    <!-- Tailwind CSS (CDN for quick prototyping) -->
    <script src="https://cdn.tailwindcss.com"></script>
    <!-- Leaflet CSS -->
    <link rel="stylesheet" href="https://unpkg.com/leaflet@1.9.4/dist/leaflet.css" integrity="sha256-p4NxAoJBhIIN+hmNHrzRCf9tD/miZyoHS5obTRR9BMY=" crossorigin=""/>
    <style>
        #map { height: 500px; width: 100%; z-index: 10; }
    </style>
</head>
<body class="bg-gray-100 font-sans antialiased">
    <!-- Navbar -->
    <nav class="bg-blue-600 text-white p-4 shadow-md flex justify-between items-center">
        <h1 class="text-xl font-bold">RT-RW Net Management</h1>
        <div class="space-x-4">
            <a href="index.php" class="font-semibold underline">Dashboard & Map</a>
            <a href="customers.php" class="hover:text-gray-200">Pelanggan</a>
            <a href="packages.php" class="hover:text-gray-200">Paket Internet</a>
            <a href="routers.php" class="hover:text-gray-200">Perangkat Server</a>
            <a href="scanner.php" class="hover:text-gray-200">Mikrotik Scanner</a>
            <button onclick="alert('Prototype: Sistem Logout')" class="bg-red-500 hover:bg-red-700 px-3 py-1 rounded">Logout</button>
        </div>
    </nav>

    <!-- Content area -->
    <div class="container mx-auto mt-6 px-4">
        <!-- Stats widget -->
        <div class="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
            <div class="bg-white p-4 rounded shadow">
                <p class="text-gray-500 text-sm">Total Pelanggan Aktif</p>
                <p class="text-2xl font-bold text-green-600">45</p>
            </div>
            <div class="bg-white p-4 rounded shadow">
                <p class="text-gray-500 text-sm">Pelanggan Terisolir</p>
                <p class="text-2xl font-bold text-red-600">3</p>
            </div>
            <div class="bg-white p-4 rounded shadow">
                <p class="text-gray-500 text-sm">Total ODP/Tiang</p>
                <p class="text-2xl font-bold text-blue-600">5</p>
            </div>
        </div>

        <!-- Map area -->
        <div class="bg-white rounded shadow p-4 relative">
            <h2 class="text-lg font-bold text-gray-700 mb-2">Peta Jaringan & Pelanggan</h2>
            <div id="map" class="border rounded"></div>
        </div>
    </div>

    <!-- Leaflet JS -->
    <script src="https://unpkg.com/leaflet@1.9.4/dist/leaflet.js" integrity="sha256-20nQCchB9co0qIjJZRGuk2/Z9VM+kNiyxNV1lvTlZBo=" crossorigin=""></script>
    <script>
        // Init Map
        const map = L.map('map').setView([-6.200000, 106.816666], 15);
        L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
            attribution: '© OpenStreetMap'
        }).addTo(map);

        // Data JSON dr PHP Backend dummy
        const odps = <?php echo json_encode($odps); ?>;
        const customers = <?php echo json_encode($customers); ?>;

        const odpIcon = L.icon({
            iconUrl: 'https://cdn-icons-png.flaticon.com/512/3254/3254068.png', 
            iconSize: [30, 30]
        });

        const activeIcon = L.icon({
            iconUrl: 'https://cdn-icons-png.flaticon.com/512/14090/14090159.png', // pin hijau manual buat mockup
            iconSize: [25, 25]
        });

        const isolatedIcon = L.icon({
            iconUrl: 'https://cdn-icons-png.flaticon.com/512/2950/2950157.png', // pin merah manual buat mockup
            iconSize: [25, 25]
        });

        let odpMarkers = {};

        // 1. Gambar Marker ODP
        odps.forEach(function(odp) {
            let marker = L.marker([odp.lat, odp.lng], {icon: odpIcon}).addTo(map)
                .bindPopup("<b>" + odp.name + "</b><br>Sisa Port: " + odp.available + "/" + odp.ports);
            // simpan referensi marker buat narik garis
            odpMarkers[odp.id] = marker;
        });

        // 2. Gambar Marker Pelanggan + Tarik Garis Polyline ke ODP
        customers.forEach(function(cust) {
            let iconTarget = cust.status === 'active' ? activeIcon : isolatedIcon;
            let statusText = cust.status === 'active' ? 'Aktif' : 'Terisolir';

            // marker
            L.marker([cust.lat, cust.lng], {icon: iconTarget}).addTo(map)
                .bindPopup("<b>" + cust.name + "</b><br>Status: " + statusText);

            // polyline kabel
            if (cust.odp_id && odpMarkers[cust.odp_id]) {
                let odpLatlng = odpMarkers[cust.odp_id].getLatLng();
                let lineOptions = {
                    color: cust.status === 'active' ? '#10B981' : '#EF4444', 
                    weight: 2, 
                    dashArray: '5, 5' // efek kabel putus2 buat ilustrasi
                };
                L.polyline([[cust.lat, cust.lng], odpLatlng], lineOptions).addTo(map);
            }
        });
    </script>
</body>
</html>