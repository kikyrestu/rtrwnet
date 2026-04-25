<?php
// routers.php - Halaman Perangkat / Mikrotik Induk (Native PHP)
require_once 'db.php';
global $conn;

// Ambil list router
$result = $conn->query("SELECT * FROM routers");
$routers = [];
if($result) {
    while($row = $result->fetch_assoc()) {
        $routers[] = $row;
    }
}
?>
<!DOCTYPE html>
<html lang="id">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Manajemen Perangkat / Router</title>
    <script src="https://cdn.tailwindcss.com"></script>
</head>
<body class="bg-gray-100 font-sans antialiased">
    <!-- Navbar -->
    <nav class="bg-blue-600 text-white p-4 shadow-md flex items-center justify-between">
        <h1 class="text-xl font-bold">RT-RW Net Management</h1>
        <div class="space-x-4">
            <a href="index.php" class="hover:text-gray-200">Dashboard & Map</a>
            <a href="customers.php" class="hover:text-gray-200">Pelanggan</a>
            <a href="packages.php" class="hover:text-gray-200">Paket Internet</a>
            <a href="routers.php" class="font-semibold underline">Perangkat Server</a>
            <a href="scanner.php" class="hover:text-gray-200">Mikrotik Scanner</a>
            <button onclick="alert('Prototype: Sistem Logout')" class="bg-red-500 hover:bg-red-700 px-3 py-1 rounded">Logout</button>
        </div>
    </nav>

    <div class="container mx-auto mt-8 px-4 max-w-5xl">
        <div class="flex justify-between items-center mb-6">
            <h2 class="text-2xl font-bold text-gray-800">Daftar Mikrotik Pusat (NAS/Routers)</h2>
            <button onclick="alert('Fitur kasaran: Nanti muncul popup buat add Mikrotik IP baru!')" class="bg-green-500 hover:bg-green-600 text-white px-4 py-2 rounded shadow font-bold flex items-center gap-2">
                + Tambah Router Baru
            </button>
        </div>

        <div class="bg-white rounded shadow overflow-hidden">
            <table class="min-w-full">
                <thead class="bg-gray-50 border-b">
                    <tr>
                        <th class="py-3 px-4 text-left font-semibold text-gray-600">Nama Router / Cabang</th>
                        <th class="py-3 px-4 text-left font-semibold text-gray-600">IP Host (Remote)</th>
                        <th class="py-3 px-4 text-left font-semibold text-gray-600">Port API</th>
                        <th class="py-3 px-4 text-left font-semibold text-gray-600">User API</th>
                        <th class="py-3 px-4 text-left font-semibold text-gray-600">Status Ping</th>
                        <th class="py-3 px-4 text-center font-semibold text-gray-600">Aksi</th>
                    </tr>
                </thead>
                <tbody>
                    <?php if(count($routers) == 0): ?>
                        <tr><td colspan="6" class="text-center py-6 text-gray-500 italic">Belum ada router Mikrotik yang ditambahkan.</td></tr>
                    <?php else: ?>
                        <?php foreach($routers as $r): ?>
                        <tr class="hover:bg-gray-50 border-b">
                            <td class="py-3 px-4 font-bold text-blue-600"><?= htmlspecialchars($r['name']) ?></td>
                            <td class="py-3 px-4 font-mono text-sm text-gray-700"><?= htmlspecialchars($r['host']) ?></td>
                            <td class="py-3 px-4 text-gray-700"><?= htmlspecialchars($r['port']) ?></td>
                            <td class="py-3 px-4 text-gray-700"><?= htmlspecialchars($r['api_user']) ?></td>
                            <td class="py-3 px-4">
                                <span class="px-3 py-1 rounded-full text-xs font-semibold text-white <?= $r['status'] == 'online' ? 'bg-green-500' : 'bg-red-500' ?>">
                                    <?= strtoupper($r['status']) ?>
                                </span>
                            </td>
                            <td class="py-3 px-4 text-center space-x-2">
                                <button onclick="alert('Test Ping ke <?= $r['host'] ?>... PONG! 10ms')" class="text-sm bg-blue-100 text-blue-600 px-3 py-1 rounded hover:bg-blue-200">Test API</button>
                                <button onclick="alert('Membuka detail router <?= $r['name'] ?>')" class="text-sm bg-gray-100 text-gray-600 px-3 py-1 rounded hover:bg-gray-200">Edit</button>
                            </td>
                        </tr>
                        <?php endforeach; ?>
                    <?php endif; ?>
                </tbody>
            </table>
        </div>
        
        <div class="mt-4 p-4 bg-yellow-50 border-l-4 border-yellow-400 text-sm text-yellow-800">
            <strong>Konsep:</strong> Di aplikasi billing standar, Router di tabel ini ibarat "Otak"-nya. Kalau lu nge-add pelanggan di data pelanggan, lu tinggal pilih pelanggan itu nempel ke mikrotik yang mana. Jadi sistem tau harus ngisolir PPPoE di mikrotik IP yang bener :)
        </div>
    </div>
</body>
</html>