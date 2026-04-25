# Database Mapping & Schema Design

Berikut adalah rancangan awal relasi database (Relational Database) untuk sistem.

## 1. `users` (Akses Sistem)
- `id`
- `name`
- `email`, `password`
- `role` (enum: 'admin', 'staff', 'teknisi')

## 2. `packages` (Paket Layanan)
- `id`
- `name` (misal: "Home 20 Mbps")
- `price`
- `mikrotik_profile_name` (nama profil di Mikrotik)
- `rate_limit` (misal: "10M/10M")
- `local_address` (opsional gateway)
- `remote_address` (opsional ip pool)

## 3. `routers` (Mikrotik Pusat)
- `id`
- `name` (misal: "Mikrotik Pusat OLT")
- `host` (IP Target)
- `api_username`
- `api_password`
- `api_port`

## 4. `distribution_points` (ODP / Access Point)
- `id`
- `router_id` (FK to routers)
- `name` (misal: "ODP-01-Mawar")
- `type` (enum: 'fiber', 'wireless')
- `latitude`
- `longitude`
- `total_ports`
- `available_ports`

## 5. `customers` (Pelanggan)
- `id`
- `nik`, `name`, `phone` (WA)
- `address`
- `latitude`, `longitude`
- `package_id` (FK to packages)
- `router_id` (FK to routers)
- `distribution_point_id` (FK to distribution_points - untuk narik garis di map)
- `dp_port_number` (nomor port di ODP)
- `mikrotik_username` (PPPoE/Hotspot id)
- `mikrotik_password`
- `status` (enum: 'active', 'isolated', 'inactive')
- `billing_cycle_date` (tanggal tagihan turun)

## 6. `invoices` (Tagihan)
- `id`
- `customer_id` (FK to customers)
- `invoice_number`
- `amount`
- `status` (enum: 'unpaid', 'paid')
- `due_date`
- `paid_at`

## 7. `payments` (Pembayaran Manual)
- `id`
- `invoice_id` (FK to invoices)
- `amount_paid`
- `payment_method`
- `payment_proof` (URL gambar/struk)
- `verified_by` (FK to users - staff yang approve)
- `verified_at`
