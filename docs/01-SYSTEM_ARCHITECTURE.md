# Master Blueprint: Sistem Manajemen RT/RW Net

## 1. Tech Stack
- **Frontend:** Next.js (React), TailwindCSS, Leaflet.js (untuk GIS/Maps).
- **Backend:** Laravel (PHP), MySQL/PostgreSQL.
- **Integrasi Pihak Ketiga:**
  - RouterOS API (untuk komunikasi langsung dengan Mikrotik).
  - WhatsApp Gateway API (Fonnte/Wablas/Baileys) untuk notifikasi otomatis.

## 2. Aktor & Role (Multi-User)
1. **Admin (Superadmin):** Akses penuh ke seluruh sistem (Keuangan, Daftar Router Mikrotik, Pengaturan Paket, User Management).
2. **Staff / Cashier:** Akses ke Data Pelanggan, Tagihan bulanan, Approve Pembayaran Manual, Log WhatsApp.
3. **Teknisi (Field Engineer):** Akses mobile-friendly untuk melihat Peta (GIS), koordinat ODP terdekat, daftar tugas pemasangan/gangguan.

## 3. Modul Utama
### A. Customer Relationship Management (CRM) & Billing
- Pencatatan data lengkap pelanggan (Nama, Alamat, Koordinat Lat/Lng, No WA).
- Penentuan paket internet & router Mikrotik yang digunakan pelanggan.
- **Cronjob bulanan:** Generate tagihan otomatis setiap tanggal siklus pembayaran.
- Manajemen pembayaran manual (upload bukti bayar).

### B. Network & Device Inventory (Hierarki Perangkat)
- **Titik Pusat:** Mikrotik Router (IP, Username, Password API).
- **Titik Distribusi:** ODP (Fiber) / Access Point (Wireless). Memiliki koordinat Lat/Lng dan kapasitas port.
- **Titik Akhir:** ONT / CPE (Modem di rumah pelanggan).

### C. GIS / Mapping
- Peta interaktif menampilkan *marker* rumah pelanggan, *marker* tiang/ODP.
- Menggambar garis (Polyline) dari koordinat ODP ke koordinat rumah pelanggan.
- Implementasi *Marker Clustering* dan *Lazy Loading* agar browser tidak berat saat meload ribuan titik.

### D. Mikrotik Automation & Auto-Discovery
- **Auto-Sync / Scanning:** Saat Router Mikrotik pertama kali ditambahkan via API, sistem dapat melakukan scanning otomatis untuk menarik data: 
  - Daftar *User PPPoE / Hotspot* (di-import menjadi data pelanggan).
  - Daftar *Profile* (di-import menjadi paket internet/bandwidth).
  - Info Sistem (CPU, Uptime, Versi RouterOS).
- Auto-Isolir: Script berjalan mengubah status/profil user di Mikrotik (PPPoE/Hotspot) jika pelanggan menunggak.
- Auto-Open: Mengembalikan koneksi saat Staff menyetujui pembayaran.
- Real-time status: Cek apakah user sedang aktif (Online) atau Offline langsung dari dashboard via API.
