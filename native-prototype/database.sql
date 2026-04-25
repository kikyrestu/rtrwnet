-- Buat database jika belum ada
CREATE DATABASE IF NOT EXISTS rtrwnet_db;
USE rtrwnet_db;

-- Tabel ODP (Titik Distribusi)
CREATE TABLE IF NOT EXISTS odps (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    lat DECIMAL(10, 6) NOT NULL,
    lng DECIMAL(10, 6) NOT NULL,
    ports INT NOT NULL,
    available INT NOT NULL
);

-- Tabel Customers (Pelanggan)
CREATE TABLE IF NOT EXISTS customers (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    lat DECIMAL(10, 6) NOT NULL,
    lng DECIMAL(10, 6) NOT NULL,
    odp_id INT,
    status ENUM('active', 'isolated') DEFAULT 'active',
    FOREIGN KEY (odp_id) REFERENCES odps(id)
);

-- Insert Data Dummy ODP
INSERT INTO odps (id, name, lat, lng, ports, available) VALUES
(1, 'ODP-01', -6.200000, 106.816666, 8, 3),
(2, 'ODP-02', -6.204000, 106.820000, 16, 10);

-- Insert Data Dummy Pelanggan
INSERT INTO customers (id, name, lat, lng, odp_id, status) VALUES
(101, 'Pak Budi', -6.201000, 106.817000, 1, 'active'),
(102, 'Bu Tejo', -6.198000, 106.815000, 1, 'isolated'),
(103, 'Mas Paijo', -6.205000, 106.822000, 2, 'active');
