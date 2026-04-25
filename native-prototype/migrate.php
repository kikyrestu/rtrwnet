<?php
// migrate.php - Auto setup database untuk Laragon
$host = 'localhost';
$user = 'root';
$pass = '';

// Buat koneksi ke server MySQL (tanpa memilih database dulu)
$conn = new mysqli($host, $user, $pass);

if ($conn->connect_error) {
    die("Koneksi ke MySQL gagal. Pastikan MySQL di Laragon sudah jalan! Error: " . $conn->connect_error);
}

// Baca file database.sql
$sql = file_get_contents(__DIR__ . '/database.sql');

// Eksekusi semua query
if ($conn->multi_query($sql)) {
    do {
        // Clear buffer setelah tiap query biar nggak nyantol
        if ($result = $conn->store_result()) {
            $result->free();
        }
    } while ($conn->more_results() && $conn->next_result());
    
    echo "Mantap! Database 'rtrwnet_db' dan tabel berhasil dibuat & diisi data otomatis.\n";
} else {
    echo "Error pas instalasi: " . $conn->error . "\n";
}

$conn->close();
?>