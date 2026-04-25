<?php
$conn = new mysqli('localhost', 'root', '', 'rtrwnet_db');
if ($conn->connect_error) die("Koneksi gagal");

$sql = "CREATE TABLE IF NOT EXISTS packages (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(100),
    price INT,
    speed_limit VARCHAR(50),
    mikrotik_profile VARCHAR(100)
)";
$conn->query($sql);
$conn->query("TRUNCATE TABLE packages");

// Insert dummy paket
$conn->query("INSERT INTO packages (name, price, speed_limit, mikrotik_profile) VALUES 
('Hemat 10 Mbps', 150000, '10M/10M', 'Paket-10M'),
('Keluarga 20 Mbps', 250000, '20M/20M', 'Paket-20M'),
('Gamer 50 Mbps', 400000, '50M/50M', 'Paket-50M')");

echo "Tabel Packages berhasil di-setup!\n";
