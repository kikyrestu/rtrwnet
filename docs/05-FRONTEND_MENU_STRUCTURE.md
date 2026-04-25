# FRONTEND MENU & CATEGORY STRUCTURE (NEXT.JS)

Dokumen ini merangkum struktur navigasi (sidebar/menu) untuk frontend Next.js yang disesuaikan dengan arsitektur backend (Laravel) dan Role-Based Access Control (RBAC).

## 1. ?? Dashboard (/dashboard)
Halaman utama yang berisi ringkasan singkat.
- **Akses:** Semua Role (Admin, Technician, Sales, Collector)
- **Sub-menu / Konten:** 
  - Statistik ringkas (Total Pelanggan, Total Tagihan, dll sesuai role)

## 2. ?? Pelanggan (/customers)
Modul manajemen pelanggan internet.
- **Akses:** Admin, Technician, Sales
- **Sub-menu:**
  - **Daftar Pelanggan** (Sales hanya melihat wilayahnya, Admin/Tech melihat semua)
  - **Registrasi Baru** (Sales, Admin)

## 3. ?? Keuangan & Tagihan (/billing)
Modul untuk manajemen tagihan bulanan dan pembayaran.
- **Akses:** Admin, Collector
- **Sub-menu:**
  - **Daftar Tagihan** (Collector hanya melihat wilayahnya)
  - **Penerimaan Pembayaran**

## 4. ?? Laporan (/reports)
Modul laporan keuangan dan analitik.
- **Akses:** Admin, Sales, Collector
- **Sub-menu:**
  - **Laporan Pendapatan** (Admin global, Sales/Collector berdasarkan wilayah)

## 5. ?? Infrastruktur Jaringan (/network)
Modul teknis manajemen alat dan topologi.
- **Akses:** Admin, Technician
- **Sub-menu:**
  - **Data Router (Mikrotik)** (+ Monitoring Realtime Traffic)
  - **Data OLT Induk**
  - **Data ODP / Tiang**
  - **Sinkronisasi Mikrotik** (Auto-Sync)

## 6. ?? Master Data & Pengaturan (/settings)
Konfigurasi inti sistem.
- **Akses:** Admin Only
- **Sub-menu:**
  - **Paket Internet**
  - **Area / Wilayah**
  - **Pengguna & RBAC** (Manajemen Teknisi, Sales, Kolektor)

---
*Catatan: Menu akan dirender secara dinamis di Next.js menggunakan state user yang didapat dari token/session backend Laravel.*
