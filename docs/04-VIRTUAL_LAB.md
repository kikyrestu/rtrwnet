# Virtual Lab Setup (Mikrotik Tanpa Hardware)

Karena pengembangan sistem dilakukan tanpa perangkat Mikrotik fisik, kita menggunakan **Mikrotik CHR (Cloud Hosted Router)** sebagai simulator.

## Software yang Dibutuhkan
1. **VirtualBox** atau **VMware Workstation Player** (Gratis).
   - *Fungsi:* Menjalankan Virtual Machine (Mesin Virtual) di dalam laptop/PC.
2. **Mikrotik CHR (Cloud Hosted Router)** image.
   - *Fungsi:* Sistem operasi Mikrotik resmi yang didesain khusus untuk Virtual Machine.
   - *Lisensi:* Gratis seumur hidup (limit port speed 1 Mbps, sangat cukup untuk testing API & ngoding).
   - *Download:* [mikrotik.com/download](https://mikrotik.com/download) -> Pilih "Cloud Hosted Router" -> Download versi VDI (untuk VirtualBox) atau VMDK (untuk VMware).
3. **Winbox**
   - *Fungsi:* Aplikasi GUI untuk meremote/setting Mikrotik CHR yang sudah jalan di Virtual Machine.

## Langkah Setup Cepat (VirtualBox)
1. **Bikin VM Baru:**
   - Buka VirtualBox -> New.
   - OS Type: Linux (Other Linux 64-bit).
   - RAM: Cukup 256 MB atau 512 MB.
   - Hard Disk: "Use an existing virtual hard disk file" -> Pilih file VDI Mikrotik CHR yang didownload.
2. **Setting Network (Krusial):**
   - Sebelum di-start, buka *Settings* VM -> *Network*.
   - Adapter 1: Ubah "Attached to" menjadi **Bridged Adapter** atau **Host-only Adapter**.
     - *Tujuannya biar PHP (Laragon) di laptop lu bisa nge-ping ke IP Mikrotik virtual ini.*
3. **Start VM & Login:**
   - Jalankan VM. Tunggu sampai muncul tulisan `MikroTik Login`.
   - Default login: `admin` (password kosong, tekan Enter).
4. **Setting IP & Service via Winbox:**
   - Buka Winbox di laptop lu. Nanti di tab "Neighbors", Mikrotik virtual lu bakal kedetect (via MAC Address).
   - Klik MAC Address-nya -> Connect.
   - Buka menu **IP -> Addresses**, tambahkan IP satu segmen dengan IP laptop lu (misal laptop lu `192.168.1.10`, Mikrotiknya kasih `192.168.1.20/24` di ether1). ATAU:
   - **(Sangat Disarankan biar otomatis IP-nya ikut WiFi):** Buka menu **IP -> DHCP Client**, klik tombol `+`, pilih `ether1`, lalu `Apply`. Nanti Mikrotik otomatis dapat IP Dinamis dari WiFi Host (misal WiFi Kost/Hotspot HP).
   - Buka menu **IP -> Services**, enable/nyalakan `api` (port 8728).

## Trik Anti-Pusing Ganti WiFi (Host-Only Adapter)
Kalau lu sering pindah-pindah dari **Hotspot HP ke WiFi Kost**, IP dari Bridged Adapter bakal selalu berubah dan bikin Laravel lu putus koneksi.
**Solusi Terbaik:**
1. Masuk ke VirtualBox -> Settings VM Mikrotik -> **Network**.
2. **Adapter 1 (Untuk Internet):** Biarkan `Bridged Adapter` (Atau `NAT`).
3. **Adapter 2 (Khusus Komunikasi API dengan Laravel):** Centang `Enable Network Adapter`, ubah ke **Host-Only Adapter** (Pilih `VirtualBox Host-Only Ethernet Adapter`).
4. Buka Winbox/Terminal Mikrotik, setup IP Statis di Adapter 2 (`ether2`) dengan command:
   ```bash
   /ip address add address=192.168.56.2/24 interface=ether2
   ```
5. Di Laravel, masukkan IP `192.168.56.2` sebagai IP Router. IP ini **tidak akan pernah berubah** seumur hidup walaupun lu pindah WiFi 100 kali.
5. **Bikin Data Dummy di Mikrotik CHR:**
   - Buka menu **PPP -> Secrets**, bikin beberapa user PPPoE boongan (misal `tester1`, `tester2`).
   
## Testing ke PHP
Setelah setup di atas selesai, buka web `scanner.php` lu, masukin IP Mikrotik CHR tadi. Boom! Data langsung ketarik seolah-olah lu punya Mikrotik beneran.
