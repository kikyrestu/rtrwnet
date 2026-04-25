<?php
$conn = new mysqli('localhost', 'root', '', 'rtrwnet_db');
if ($conn->connect_error) {
    die("Koneksi gagal: " . $conn->connect_error);
}
$conn->query('SET FOREIGN_KEY_CHECKS=0');
$conn->query('TRUNCATE TABLE customers');
$conn->query('TRUNCATE TABLE odps');
$conn->query('SET FOREIGN_KEY_CHECKS=1');
echo "Data dummy berhasil dihapus 100%! Database bersih.\n";
