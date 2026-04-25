<?php
// scanner.php - Prototype AUTO-DISCOVERY REAL MIKROTIK (Native PHP)
require_once 'db.php';                    // Panggil database MySQL asli
require_once 'routeros_api.class.php';    // Panggil Library Mikrotik API asli

$scan_results = null;
$error_msg = null;

// Jika user ngeklik tombol submit / POST form "Jalankan Scanner Nyata"
if ($_SERVER['REQUEST_METHOD'] === 'POST' && isset($_POST['scan'])) {
    $ip = $_POST['ip'];
    $port = empty($_POST['port']) ? 8728 : $_POST['port']; // Tangkap custom port, default 8728
    $user = $_POST['user'];
    $pass = $_POST['pass'];

    $API = new RouterosAPI();
    $API->debug = false; // Matikan debug biar nggak ngerusak HTML
    $API->port = $port;  // Set API port kustom sebelum connect

    // Coba konek ke Mikrotik pake API Asli
    if ($API->connect($ip, $user, $pass)) {
        // Ambil data User PPPoE Secret dari Mikrotik
        $secrets = $API->comm("/ppp/secret/print");
        
        $scan_results = [];
        foreach ($secrets as $row) {
            // Kita tampung hasilnya
            $scan_results[] = [
                'name'    => $row['name'],
                'profile' => $row['profile'] ?? '-',
                'comment' => $row['comment'] ?? 'Tidak ada info', // Tambahan narik data comment
                'caller'  => $row['caller-id'] ?? 'Belum ada MAC', // Tambahan narik MAC Address
                'status'  => isset($row['disabled']) && $row['disabled'] == 'true' ? 'isolated' : 'active'
            ];
        }
        $API->disconnect();
    } else {
        $error_msg = "Gagal konek ke Router Mikrotik! Cek IP / User / Pass, dan pastikan Service 'api' (Port 8728) nyala di menu IP -> Services.";
    }
}

// Jika user ngeklik tombol "Import Semua"
if ($_SERVER['REQUEST_METHOD'] === 'POST' && isset($_POST['import'])) {
    // Karena kita tidak ingin menyimpan raw string di $_POST terus menerus di versi Native kasaran, 
    // kita convert value hidden jadi json array
    $scan_results_json = json_decode($_POST['scan_results_json'], true);
    
    global $conn;
    $count = 0;
    foreach ($scan_results_json as $user) {
        $name = $conn->real_escape_string($user['name']);
        $status = $conn->real_escape_string($user['status']);
        
        // Isi koordinat 0 kasaran dulu (-6 dan 106 kisaran Jakarta)
        $lat = -6.200000;
        $lng = 106.816666;
        
        // Hindari duplikat (cek apakah nama PPPoE udah ada)
        $check = $conn->query("SELECT id FROM customers WHERE name = '$name'");
        if ($check->num_rows == 0) {
            $conn->query("INSERT INTO customers (name, lat, lng, status) VALUES ('$name', '$lat', '$lng', '$status')");
            $count++;
        }
    }
    
    // Redirect ke list customers pakai JS script
    echo "<script>alert('Berhasil mengimport $count pelanggan baru!'); window.location.href='customers.php';</script>";
}
?>
<!DOCTYPE html>
<html lang="id">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Mikrotik Scanner (Real Target)</title>
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
            <a href="routers.php" class="hover:text-gray-200">Perangkat Server</a>
            <a href="scanner.php" class="font-semibold underline">Mikrotik Scanner</a>
            <button onclick="alert('Prototype: Sistem Logout')" class="bg-red-500 hover:bg-red-700 px-3 py-1 rounded">Logout</button>
        </div>
    </nav>

    <div class="container mx-auto mt-8 px-4 max-w-4xl">
        <h2 class="text-2xl font-bold text-gray-800 mb-6">Auto-Discovery (Live Mikrotik)</h2>

        <?php if ($error_msg): ?>
            <div class="bg-red-100 text-red-700 p-4 rounded mb-6 border border-red-300 shadow">
                <?= $error_msg ?>
            </div>
        <?php endif; ?>

        <!-- Form Koneksi Real ke Mikrotik -->
        <form method="POST" class="bg-white p-6 rounded shadow mb-6">
            <h3 class="text-lg font-semibold text-gray-700 mb-4">Akses API RouterOS</h3>
            <div class="grid grid-cols-1 md:grid-cols-5 gap-4">
                <div class="col-span-1 md:col-span-2">
                    <label class="block text-sm text-gray-600 mb-1">IP Public / Local Router</label>
                    <input type="text" name="ip" required placeholder="192.168.88.1" value="<?= $_POST['ip'] ?? '' ?>" class="w-full border rounded p-2 focus:outline-blue-500" />
                </div>
                <div>
                    <label class="block text-sm text-gray-600 mb-1">API Port</label>
                    <input type="number" name="port" required placeholder="8728" value="<?= $_POST['port'] ?? '8728' ?>" class="w-full border rounded p-2 focus:outline-blue-500" />
                </div>
                <div>
                    <label class="block text-sm text-gray-600 mb-1">Username API</label>
                    <input type="text" name="user" required placeholder="admin" value="<?= $_POST['user'] ?? '' ?>" class="w-full border rounded p-2 focus:outline-blue-500" />
                </div>
                <div>
                    <label class="block text-sm text-gray-600 mb-1">Password API</label>
                    <input type="password" name="pass" placeholder="Kosongi jika tak ada" class="w-full border rounded p-2 focus:outline-blue-500" />
                </div>
            </div>
            <div class="mt-4 flex justify-end">
                <button type="submit" name="scan" class="bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-6 rounded shadow flex items-center gap-2">
                    Jalankan Scanner Asli
                </button>
            </div>
        </form>

        <!-- Scan Result Section -->
        <?php if (is_array($scan_results)): ?>
        <div class="bg-white p-6 rounded shadow mt-6">
            <div class="flex justify-between items-center mb-4">
                <h3 class="text-lg font-semibold text-green-600">Terbaca: <?= count($scan_results) ?> Data PPPoE dari Mikrotik!</h3>
                <form method="POST">
                    <!-- Tahan JSON payload -->
                    <input type="hidden" name="scan_results_json" value="<?= htmlspecialchars(json_encode($scan_results)) ?>" />
                    <button type="submit" name="import" class="bg-green-500 hover:bg-green-600 text-white font-bold px-4 py-2 rounded focus:outline-none shadow">
                        Import Semuanya ke MySQL
                    </button>
                </form>
            </div>
            
            <table class="min-w-full border border-gray-200 rounded">
                <thead class="bg-gray-50">
                    <tr>
                        <th class="py-2 px-4 text-left border-b">Akun PPPoE</th>
                        <th class="py-2 px-4 text-left border-b">Detail (Komentar)</th>
                        <th class="py-2 px-4 text-left border-b">MAC Router</th>
                        <th class="py-2 px-4 text-left border-b">Profile (Paket Dasar)</th>
                        <th class="py-2 px-4 text-left border-b">Status</th>
                    </tr>
                </thead>
                <tbody>
                    <?php if(count($scan_results) == 0): ?>
                        <tr><td colspan="5" class="text-center py-4 text-gray-500">Router ini tidak memiliki user PPPoE Secret.</td></tr>
                    <?php else: ?>
                        <?php foreach($scan_results as $idx => $u): ?>
                        <tr class="hover:bg-gray-50">
                            <td class="py-2 px-4 border-b font-semibold text-gray-700">#<?= $idx+1 ?> - <?= htmlspecialchars($u['name']) ?></td>
                            <td class="py-2 px-4 border-b text-sm italic text-gray-500"><?= htmlspecialchars($u['comment']) ?></td>
                            <td class="py-2 px-4 border-b text-xs font-mono text-gray-500"><?= htmlspecialchars($u['caller']) ?></td>
                            <td class="py-2 px-4 border-b">
                                <span class="bg-blue-100 text-blue-700 px-2 py-1 rounded text-xs"><?= htmlspecialchars($u['profile']) ?></span>
                            </td>
                            <td class="py-2 px-4 border-b">
                                <span class="px-2 py-1 rounded text-xs font-semibold text-white <?= $u['status'] == 'active' ? 'bg-green-500' : 'bg-red-500' ?>">
                                    <?= strtoupper($u['status']) ?>
                                </span>
                            </td>
                        </tr>
                        <?php endforeach; ?>
                    <?php endif; ?>
                </tbody>
            </table>
        </div>
        <?php endif; ?>
    </div>
</body>
</html>