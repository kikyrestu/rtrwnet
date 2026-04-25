<?php
$conn = new mysqli('localhost', 'root', '', 'rtrwnet_db');
if ($conn->connect_error) die("Koneksi gagal");

$sql = "CREATE TABLE IF NOT EXISTS routers (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(100),
    host VARCHAR(100),
    port INT DEFAULT 8728,
    api_user VARCHAR(100),
    api_pass VARCHAR(100),
    status ENUM('online', 'offline') DEFAULT 'online'
)";
$conn->query($sql);

// Hapus isi biar rapi kalau pernah jalan
$conn->query("TRUNCATE TABLE routers");

// Insert router dari VirtualBox lu tadi
$conn->query("INSERT INTO routers (name, host, port, api_user, api_pass) VALUES ('Mikrotik Perumahan', '10.147.146.150', 8728, 'admin', 'Kikyrestu089')");

echo "Tabel Routers berhasil di-setup!\n";
