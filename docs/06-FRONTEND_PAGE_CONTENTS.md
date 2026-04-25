# FRONTEND PAGE CONTENTS & UI COMPONENTS (NEXT.JS)

Dokumen ini mendeskripsikan secara detail isi konten (tabel, grafik, form, tombol aksi) dari setiap halaman yang akan dibangun di frontend Next.js.

## 1. Dashboard (/dashboard)
Halaman ringkasan kondisi bisnis dan jaringan.
- **Komponen UI:**
  - **Cards (Summary):** Total Pelanggan Aktif, Total Pelanggan Isolir, Total Tagihan Belum Dibayar, Pendapatan Bulan Ini.
  - **Charts:**
    - Bar Chart: Pendapatan per bulan (Filterable by Region untuk Admin).
    - Doughnut Chart: Status Pelanggan (Active vs Isolated).
  - **Widget:** Log aktivitas terbaru (opsional) atau daftar pelanggan yang jatuh tempo hari ini.

## 2. Pelanggan (/customers)
Halaman pengelolaan data nasabah internet.
- **Daftar Pelanggan (Table):**
  - **Kolom:** ID, Nama, No. HP, Paket, Regional, Status (Active/Isolated), ODP/Port.
  - **Filter:** Sortir berdasarkan Wilayah (hanya Admin), Status, dan Pencarian Nama.
  - **Aksi:** Detail, Edit, Hapus (Admin), Tombol Isolir/Buka Isolir Manual, **Tombol Lihat Peta**.
- **Form Tambah/Edit Customer:**
  - **Input:** Nama, Email, No. HP, Alamat lengkap, Pilih Wilayah, Pilih Paket, Pilih Router Mikrotik, Username/Password PPPoE, Pilih OLT & ODP.
  - **Fitur Khusus Maps:** Peta (Google Maps/Leaflet) dengan tombol **"Get Current Location (Pinpoint Lokasi Sekarang)"** untuk mendapatkan Latitude & Longitude otomatis secara akurat dari GPS perangkat teknisi.
  - **Fitur Khusus:** **Peta Lokasi (Maps) + Tombol "Get Current Location"** untuk melacak/pinpoint koordinat (Latitude/Longitude) otomatis ke lokasi HP/Laptop teknisi saat pemasangan.

## 3. Keuangan & Tagihan (/billing)
Halaman operasional penagihan dan kasir.
- **Daftar Tagihan (Table):**
  - **Kolom:** No. Tagihan, Nama Pelanggan, Periode Bulan, Jatuh Tempo, Nominal (Rp), Status (Paid/Unpaid).
  - **Aksi:** Tombol "Bayar" (Memunculkan modal konfirmasi), Tombol "Kirim WA/Cetak Struk".
- **Header Actions:**
  - Tombol "Generate Tagihan Bulan Ini" (Otomatis membuat tagihan bagi yang belum punya di bulan berjalan).

## 4. Laporan (/reports)
Halaman rekapitulasi untuk evaluasi keuangan.
- **Komponen UI:**
  - **Filter Global:** Rentang Tanggal (Start Date - End Date), Filter Wilayah.
  - **Summary Cards:** Total Pemasukan Bersih, Total Potensi (Unpaid).
  - **Tabel Transaksi Terbayar:** Menampilkan semua invoice status 'Paid' dengan tanggal pembayaran.
  - **Aksi:** Export ke PDF / Excel / CSV.

## 5. Infrastruktur Jaringan (/network)
Halaman teknis untuk mengelola alat.
- **Data Router (/network/routers):**
  - **Tabel:** Model, IP Address, API Port, Status Koneksi.
  - **Aksi Khusus:** Tombol "Monitor Traffic", Tombol "Lihat Lokasi GPS".
  - **Form Tambah/Edit:** Input data API, **Peta Lokasi (Maps) + "Get Current Location"**.
- **Data OLT & ODP (/network/olt & /network/odp):**
  - **Tabel:** Nama Alat, Kapasitas Port, Port Terpakai, Wilayah, Aksi "Lihat di Peta".
  - **Form Tambah/Edit:** Input nama alat, port, **Peta Lokasi (Maps) + "Get Current Location"**.
- **Auto-Sync (/network/sync):**
  - **UI:** Tombol raksasa "Mulai Sinkronisasi Mikrotik", beserta konsol log text box.

## 6. Master Data & Pengaturan (/settings)
Halaman CRUD dasar untuk parameter sistem.
- **Paket Internet:** Tabel (Nama Paket, Harga, Kecepatan) & Form Input.
- **Wilayah:** Tabel (Nama Wilayah, Deskripsi) & Form Input.
- **Pengguna & RBAC (/settings/users):**
  - **Tabel:** Nama, Email, Role (Badge Colors), Wilayah Tugas.
  - **Form:** Input detail user, Dropdown Role, Dropdown Wilayah.
