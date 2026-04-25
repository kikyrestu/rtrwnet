<?php
// packages.php - Halaman Master Paket Internet (Native PHP)
session_start(); // Biar bisa pakai session untuk error/success massage
require_once 'db.php';
require_once 'routeros_api.class.php'; // Load API Mikrotik
global $conn;

// Handle Insert Paket Baru
if ($_SERVER['REQUEST_METHOD'] === 'POST' && isset($_POST['action']) && $_POST['action'] == 'add') {
    $name = $_POST['name'];
    $price = $_POST['price'];
    $speed_limit = $_POST['speed_limit'];
    $mikrotik_profile = $_POST['mikrotik_profile'];

    // Ambil Router Utama dari Database untuk dipush profilnya
    $router_res = $conn->query("SELECT * FROM routers LIMIT 1");
    if ($router_res && $router_res->num_rows > 0) {
        $router = $router_res->fetch_assoc();
        
        $API = new RouterosAPI();
        $API->debug = false;
        $API->port = $router['port'];
        
        // Coba konek ke Mikrotik
        if ($API->connect($router['host'], $router['api_user'], $router['api_pass'])) {
            // Push perintah buat profile ke Mikrotik API
            $response = $API->comm("/ppp/profile/add", [
                "name"       => $mikrotik_profile,
                "rate-limit" => $speed_limit,
                "comment"    => "Auto Created by RT-RW Net Web System"
            ]);
            
            // Cek kalau Mikrotik nolak (biasanya karena nama profile sudah ada format trap)
            if (isset($response['!trap'])) {
                $_SESSION['error_msg'] = "Mikrotik Error: " . ($response['!trap'][0]['message'] ?? 'Gagal membuat Profile PPPoE di Mikrotik.');
            } else {
                // Sukses di Mikrotik -> Sekarang baru simpan ke Database Web kita
                $stmt = $conn->prepare("INSERT INTO packages (name, price, speed_limit, mikrotik_profile) VALUES (?, ?, ?, ?)");
                $stmt->bind_param("siss", $name, $price, $speed_limit, $mikrotik_profile);
                if($stmt->execute()) {
                    $_SESSION['success_msg'] = "MANTAP! Profil '$mikrotik_profile' berhasil dibuat di Mikrotik dan Data Paket tersimpan.";
                }
                $stmt->close();
            }
            $API->disconnect();
        } else {
            $_SESSION['error_msg'] = "Gagal Konek ke Mikrotik (" . $router['host'] . "). Pastikan Router Nyala, paket tidak jadi disave.";
        }
    } else {
        $_SESSION['error_msg'] = "Data Router kosong! Tambahkan Router dulu di Menu Perangkat Server.";
    }

    header("Location: packages.php");
    exit;
}

// Ambil list paket
$result = $conn->query("SELECT * FROM packages ORDER BY price ASC");
$packages = [];
if($result) {
    while($row = $result->fetch_assoc()) {
        $packages[] = $row;
    }
}

function formatRupiah($angka){
    return "Rp " . number_format($angka,0,',','.');
}
?>
<!DOCTYPE html>
<html lang="id">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Manajemen Paket Internet</title>
    <script src="https://cdn.tailwindcss.com"></script>
</head>
<body class="bg-gray-100 font-sans antialiased">
    <!-- Navbar -->
    <nav class="bg-blue-600 text-white p-4 shadow-md flex items-center justify-between">
        <h1 class="text-xl font-bold">RT-RW Net Management</h1>
        <div class="space-x-4">
            <a href="index.php" class="hover:text-gray-200">Dashboard & Map</a>
            <a href="customers.php" class="hover:text-gray-200">Pelanggan</a>
            <a href="packages.php" class="font-semibold underline">Paket Internet</a>
            <a href="routers.php" class="hover:text-gray-200">Perangkat Server</a>
            <a href="scanner.php" class="hover:text-gray-200">Mikrotik Scanner</a>
            <button onclick="alert('Prototype: Sistem Logout')" class="bg-red-500 hover:bg-red-700 px-3 py-1 rounded">Logout</button>
        </div>
    </nav>

    <div class="container mx-auto mt-8 px-4 max-w-5xl">
        <div class="flex justify-between items-center mb-6">
            <h2 class="text-2xl font-bold text-gray-800">Daftar Paket Layanan</h2>
            <button onclick="document.getElementById('modalTambah').classList.remove('hidden')" class="bg-green-500 hover:bg-green-600 text-white px-4 py-2 rounded shadow font-bold flex items-center gap-2">
                + Tambah Paket
            </button>
        </div>

        <?php if(isset($_SESSION['success_msg'])): ?>
            <div class="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded relative mb-4" role="alert">
                <strong class="font-bold">Sukses!</strong>
                <span class="block sm:inline"><?= $_SESSION['success_msg'] ?></span>
            </div>
            <?php unset($_SESSION['success_msg']); ?>
        <?php endif; ?>

        <?php if(isset($_SESSION['error_msg'])): ?>
            <div class="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative mb-4" role="alert">
                <strong class="font-bold">Error!</strong>
                <span class="block sm:inline"><?= $_SESSION['error_msg'] ?></span>
            </div>
            <?php unset($_SESSION['error_msg']); ?>
        <?php endif; ?>

        <div class="bg-white rounded shadow overflow-hidden">
            <table class="min-w-full">
                <thead class="bg-gray-50 border-b">
                    <tr>
                        <th class="py-3 px-4 text-left font-semibold text-gray-600">Nama Paket</th>
                        <th class="py-3 px-4 text-left font-semibold text-gray-600">Harga Bulanan</th>
                        <th class="py-3 px-4 text-center font-semibold text-gray-600">Limit Speed (Up/Down)</th>
                        <th class="py-3 px-4 text-left font-semibold text-gray-600">Mikrotik Profile</th>
                        <th class="py-3 px-4 text-center font-semibold text-gray-600">Aksi</th>
                    </tr>
                </thead>
                <tbody>
                    <?php if(count($packages) == 0): ?>
                        <tr><td colspan="5" class="text-center py-6 text-gray-500 italic">Belum ada data paket internet.</td></tr>
                    <?php else: ?>
                        <?php foreach($packages as $p): ?>
                        <tr class="hover:bg-gray-50 border-b">
                            <td class="py-3 px-4 font-bold text-indigo-600"><?= htmlspecialchars($p['name']) ?></td>
                            <td class="py-3 px-4 font-semibold text-green-600"><?= formatRupiah($p['price']) ?></td>
                            <td class="py-3 px-4 text-center">
                                <span class="bg-gray-100 text-gray-700 px-2 py-1 rounded font-mono text-sm border border-gray-200">
                                    <?= htmlspecialchars($p['speed_limit']) ?>
                                </span>
                            </td>
                            <td class="py-3 px-4 text-gray-600 font-mono text-sm"><?= htmlspecialchars($p['mikrotik_profile']) ?></td>
                            <td class="py-3 px-4 text-center space-x-2">
                                <button onclick="alert('Edit paket <?= $p['name'] ?>')" class="text-sm bg-blue-100 text-blue-600 px-3 py-1 rounded hover:bg-blue-200">Edit</button>
                                <button onclick="alert('Hapus paket <?= $p['name'] ?>')" class="text-sm bg-red-100 text-red-600 px-3 py-1 rounded hover:bg-red-200">Hapus</button>
                            </td>
                        </tr>
                        <?php endforeach; ?>
                    <?php endif; ?>
                </tbody>
            </table>
        </div>
        
        <div class="mt-4 p-4 bg-blue-50 border-l-4 border-blue-400 text-sm text-blue-800 shadow">
            <strong>Konsep Billing:</strong> Paket ini akan dipasangkan ke Data Pelanggan. Saat tanggal jatuh tempo (Billing Cycle), sistem akan otomatis *generate invoice* sejumlah harga di paket ini. Kalau nunggak, sistem bakal ngubah Profile PPPoE di Mikrotik jadi profil "Isolir".
        </div>
    </div>

    <!-- Modal Form Tambah Paket -->
    <div id="modalTambah" class="fixed inset-0 bg-black bg-opacity-50 hidden flex items-center justify-center z-50">
        <div class="bg-white p-6 rounded-lg w-full max-w-md shadow-xl relative">
            <h3 class="text-xl font-bold text-gray-800 mb-4 border-b pb-2">Tambah Paket Baru</h3>
            <button onclick="document.getElementById('modalTambah').classList.add('hidden')" class="absolute top-4 right-4 text-gray-400 hover:text-gray-800 text-2xl font-bold">&times;</button>
            
            <form action="packages.php" method="POST" class="space-y-4">
                <input type="hidden" name="action" value="add">
                
                <div>
                    <label class="block text-gray-700 font-semibold mb-1">Nama Paket</label>
                    <input type="text" name="name" required placeholder="Contoh: Paket Warnet Ngebut" class="w-full border p-2 rounded focus:outline-none focus:ring-2 focus:ring-blue-400">
                </div>
                
                <div>
                    <label class="block text-gray-700 font-semibold mb-1">Harga Bulanan (Rp)</label>
                    <input type="number" name="price" required placeholder="Contoh: 150000" class="w-full border p-2 rounded focus:outline-none focus:ring-2 focus:ring-blue-400">
                </div>
                
                <div>
                    <label class="block text-gray-700 font-semibold mb-1">Limit Speed (Upload/Download)</label>
                    <input type="text" name="speed_limit" required placeholder="Contoh: 10M/10M" class="w-full border p-2 rounded focus:outline-none focus:ring-2 focus:ring-blue-400">
                </div>
                
                <div>
                    <label class="block text-gray-700 font-semibold mb-1">Mikrotik Profile</label>
                    <input type="text" name="mikrotik_profile" required placeholder="Contoh: Profile-10M" class="w-full border p-2 rounded focus:outline-none focus:ring-2 focus:ring-blue-400">
                    <p class="text-xs text-gray-500 mt-1">Harus sama persis dengan nama *Profile* di dalam router Mikrotik.</p>
                </div>
                
                <div class="flex justify-end space-x-2 pt-4 border-t">
                    <button type="button" onclick="document.getElementById('modalTambah').classList.add('hidden')" class="bg-gray-300 hover:bg-gray-400 text-gray-800 px-4 py-2 rounded shadow">Batal</button>
                    <button type="submit" class="bg-green-500 hover:bg-green-600 text-white px-4 py-2 rounded shadow font-bold">Simpan Paket</button>
                </div>
            </form>
        </div>
    </div>
</body>
</html>