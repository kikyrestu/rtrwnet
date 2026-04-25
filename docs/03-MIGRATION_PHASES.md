# Migration & Development Phases

Gunakan checklist ini sebagai panduan utama penyelesaian fitur.
Setiap menyelesaikan satu langkah, centang task (`[x]`) menggunakan tool.

## Phase 0: Prototype (Native PHP & UI Kasar)
- [x] Setup struktur folder dasar & koneksi database (`db.php`).
- [x] Bikin UI kasar Dashboard & Maps pake Leaflet (`index.php`).
- [x] Bikin UI kasar List Pelanggan (`customers.php`).
- [x] Bikin UI kasar Perangkat Induk Billing (`routers.php`).
- [x] Bikin UI kasar Auto-Discovery/Scanner Mikrotik (`scanner.php`).

## Phase 0.5: Real Integration Prototype (Native PHP)
- [x] Wipe/truncate seluruh data dummy (`truncate.php`).
- [x] Import/download `routeros_api.class.php`.
- [x] Rombak ulang UI `scanner.php` jadi *real connection* ke router (`/ppp/secret/print`).

## Phase 1: Laravel Prototype (Full-stack HTML Kasar) -> DIRECT PIVOT
- [x] Pindahkan file PHP native ke folder terpisah (`native-prototype/`).
- [x] Inisialisasi Project Laravel (Folder `billing`).
- [x] Setup Laravel Database & Koneksi (`.env`).
- [x] Implementasi Migration Tabel `routers`, `packages`, dan `customers`.

## Phase 2: CRM & Network Inventory (Laravel Backend)
- [x] CRUD Data `routers` (Mikrotik).
- [x] CRUD Data `packages` (Paket Internet).
- [x] Database FTTH Enterprise: Setup Tabel `regions`, `olts`, dan `distribution_points`.
- [x] CRUD Data FTTH (Cabang, OLT, ODP).
- [x] Update UI CRUD `customers` (Pendaftaran Pelanggan Baru + Setting ODP & ONT MAC/SN).

## Phase 3: Billing & Invoicing Engine
- [x] Setup Laravel Task Scheduling (Cron).
- [x] Logic generate tagihan otomatis (`invoices`) bulanan berdasarkan `billing_cycle_date`.
- [x] Modul Pembayaran Kasir (Upload struk + Approve Pembayaran).
- [x] Laporan Pendapatan (Revenue Report).

## Phase 4: Mikrotik & WhatsApp Automation (The Brain)
- [x] Auto-Discovery: Fitur "Sync Mikrotik" untuk scan otomatis Data User (PPPoE/Hotspot) & Profile/Paket Internet ke database `customers`.
- [x] Integrasi RouterOS API: Auto-create PPPoE user saat pelanggan baru dibuat.
- [x] Cronjob Auto-Isolir: Ubah profil PPPoE pelanggan menunggak jadi "Isolir" (`billing:isolir`).
- [x] Auto-Open: Ubah balik profil PPPoE saat bayar diverifikasi.
- [x] Integrasi API WhatsApp: WA Blast "H-3 Jatuh Tempo".
- [x] Integrasi API WhatsApp: WA Blast "Tagihan Lunas / Terima Kasih".

## Phase 5: GIS Mapping (Frontend Next.js)
- [x] Setup React-Leaflet di Next.js.
- [x] Fetch data koordinat ODP dan Pelanggan dari API Laravel.
- [x] Render Marker ODP dengan informasi sisa Port.
- [x] Render Marker Pelanggan dengan status warna (Hijau=Aktif, Merah=Isolir).
- [x] Draw Polyline korelasi jaringan dari ODP ke Pelanggan.
- [ ] Optimasi dengan Marker Clustering apabila data > 500 titik.
