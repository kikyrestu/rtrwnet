<?php
// db.php - Koneksi database asli MySQL Laragon
$host = 'localhost';
$user = 'root';
$pass = '';
$dbname = 'rtrwnet_db';

// Koneksi ke MySQL
$conn = new mysqli($host, $user, $pass, $dbname);
if ($conn->connect_error) {
    die("Koneksi Error: Pastikan udah bikin database 'rtrwnet_db' di Laragon dan import database.sql. Detail error: " . $conn->connect_error);
}

// Mengambil data ODP dari database
function getDummyODP() {
    global $conn;
    $result = $conn->query("SELECT * FROM odps");
    $odps = [];
    if($result) {
        while($row = $result->fetch_assoc()) {
            $odps[] = $row;
        }
    }
    return $odps;
}

// Mengambil data Pelanggan dari database
function getDummyCustomers() {
    global $conn;
    $result = $conn->query("SELECT * FROM customers");
    $customers = [];
    if($result) {
        while($row = $result->fetch_assoc()) {
            $customers[] = $row;
        }
    }
    return $customers;
}
?>