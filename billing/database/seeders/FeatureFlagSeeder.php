<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use App\Models\FeatureFlag;

class FeatureFlagSeeder extends Seeder
{
    public function run(): void
    {
        $features = [
            [
                'key' => 'auto_suspend',
                'name' => 'Auto Isolir & Buka Blokir',
                'description' => 'Otomatis mengisolir pelanggan yang telat bayar dan membuka blokir setelah pembayaran diterima melalui Mikrotik API.',
                'icon' => 'ShieldOff',
                'category' => 'billing',
                'is_enabled' => true,
            ],
            [
                'key' => 'payment_gateway',
                'name' => 'Payment Gateway (QRIS/VA)',
                'description' => 'Integrasi pembayaran online melalui Tripay/Midtrans. Pelanggan bisa bayar tagihan via QRIS, Virtual Account, dan e-wallet.',
                'icon' => 'CreditCard',
                'category' => 'billing',
                'is_enabled' => true,
            ],
            [
                'key' => 'whatsapp',
                'name' => 'Notifikasi WhatsApp',
                'description' => 'Kirim notifikasi otomatis ke pelanggan via WhatsApp (reminder tagihan, konfirmasi pembayaran, info gangguan).',
                'icon' => 'MessageCircle',
                'category' => 'communication',
                'is_enabled' => true,
            ],
            [
                'key' => 'hotspot',
                'name' => 'Hotspot Voucher Generator',
                'description' => 'Generate dan kelola voucher WiFi hotspot. Support cetak voucher ke printer thermal.',
                'icon' => 'Ticket',
                'category' => 'network',
                'is_enabled' => true,
            ],
            [
                'key' => 'ticketing',
                'name' => 'Tiket & Helpdesk',
                'description' => 'Sistem tiket gangguan pelanggan. Assign teknisi, tracking status perbaikan, upload foto before/after.',
                'icon' => 'Headphones',
                'category' => 'customer',
                'is_enabled' => true,
            ],
            [
                'key' => 'client_portal',
                'name' => 'Portal Pelanggan',
                'description' => 'Halaman login khusus pelanggan untuk cek tagihan, history pembayaran, dan lapor gangguan.',
                'icon' => 'UserCircle',
                'category' => 'customer',
                'is_enabled' => true,
            ],
            [
                'key' => 'nms_alert',
                'name' => 'Network Monitoring Alert (NMS)',
                'description' => 'Monitoring otomatis perangkat jaringan (ping OLT, Router, ODP). Kirim alert WhatsApp jika perangkat down.',
                'icon' => 'Bell',
                'category' => 'network',
                'is_enabled' => true,
            ],
            [
                'key' => 'gis',
                'name' => 'Topologi Jaringan (GIS)',
                'description' => 'Pemetaan lokasi ODP, tiang, dan pelanggan dalam map interaktif (Google Maps/Leaflet).',
                'icon' => 'Map',
                'category' => 'network',
                'is_enabled' => true,
            ],
            [
                'key' => 'acs',
                'name' => 'TR-069 Auto Configuration Server',
                'description' => 'Auto-provisioning modem ONT/Router pelanggan dari jarak jauh tanpa harus ke lokasi.',
                'icon' => 'Router',
                'category' => 'network',
                'is_enabled' => true,
            ],
        ];

        foreach ($features as $feature) {
            FeatureFlag::updateOrCreate(
                ['key' => $feature['key']],
                $feature
            );
        }
    }
}
