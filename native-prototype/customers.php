<?php
require_once 'db.php';
$customers = getDummyCustomers();
?>
<!DOCTYPE html>
<html lang="id">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Data Pelanggan (Prototype)</title>
    <script src="https://cdn.tailwindcss.com"></script>
</head>
<body class="bg-gray-100 font-sans antialiased">
    <!-- Navbar -->
    <nav class="bg-blue-600 text-white p-4 shadow-md flex justify-between items-center">
        <h1 class="text-xl font-bold">RT-RW Net Management</h1>
        <div class="space-x-4">
            <a href="index.php" class="hover:text-gray-200">Dashboard & Map</a>
            <a href="customers.php" class="font-semibold underline">Pelanggan</a>
            <a href="packages.php" class="hover:text-gray-200">Paket Internet</a>
            <a href="routers.php" class="hover:text-gray-200">Perangkat Server</a>
            <a href="scanner.php" class="hover:text-gray-200">Mikrotik Scanner</a>
            <button onclick="alert('Prototype: Sistem Logout')" class="bg-red-500 hover:bg-red-700 px-3 py-1 rounded">Logout</button>
        </div>
    </nav>

    <div class="container mx-auto mt-6 px-4">
        <div class="bg-white p-6 rounded shadow mb-4 flex justify-between">
            <h2 class="text-xl font-bold text-gray-700">Daftar Pelanggan</h2>
            <button onclick="alert('Nanti muncul modal form nambah pelanggan baru manually')" class="bg-green-500 text-white px-4 py-2 rounded shadow hover:bg-green-600">+ Tambah Pelanggan</button>
        </div>

        <table class="min-w-full bg-white border border-gray-200 rounded shadow">
            <thead>
                <tr class="bg-gray-50 border-b">
                    <th class="py-2 px-4 text-left">ID</th>
                    <th class="py-2 px-4 text-left">Nama</th>
                    <th class="py-2 px-4 text-left">Status</th>
                    <th class="py-2 px-4 text-left">Titik ODP</th>
                    <th class="py-2 px-4 text-left">Aksi</th>
                </tr>
            </thead>
            <tbody>
                <?php foreach($customers as $c): ?>
                <tr class="border-b hover:bg-gray-50">
                    <td class="py-2 px-4">#<?= $c['id'] ?></td>
                    <td class="py-2 px-4 font-semibold text-gray-700"><?= htmlspecialchars($c['name']) ?></td>
                    <td class="py-2 px-4">
                        <span class="px-2 rounded text-xs text-white <?= $c['status'] == 'active' ? 'bg-green-500' : 'bg-red-500' ?>">
                            <?= strtoupper($c['status']) ?>
                        </span>
                    </td>
                    <td class="py-2 px-4">ODP-<?= $c['odp_id'] ?></td>
                    <td class="py-2 px-4 space-x-2">
                        <button onclick="alert('Buka Form Edit Data Pelanggan #<?= $c['id'] ?>')" class="text-blue-500 text-sm hover:underline">Edit</button>
                        <button onclick="alert('Kirim command Isolir ke Mikrotik untuk Hapus Akses #<?= $c['id'] ?>')" class="text-red-500 text-sm hover:underline">Isolir Manual</button>
                    </td>
                </tr>
                <?php endforeach; ?>
            </tbody>
        </table>
    </div>
</body>
</html>