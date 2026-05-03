<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use App\Models\InventoryCategory;

class InventoryCategorySeeder extends Seeder
{
    public function run(): void
    {
        $categories = [
            ['name' => 'ONT / Modem', 'unit' => 'unit', 'description' => 'Perangkat ONT dan modem pelanggan'],
            ['name' => 'Router CPE', 'unit' => 'unit', 'description' => 'Router customer premises equipment'],
            ['name' => 'Kabel Fiber Optic', 'unit' => 'meter', 'description' => 'Kabel serat optik berbagai jenis'],
            ['name' => 'Konektor & Adapter', 'unit' => 'pcs', 'description' => 'Konektor SC/APC, SC/UPC, adapter FO'],
            ['name' => 'Tiang / Pole', 'unit' => 'buah', 'description' => 'Tiang jaringan dan aksesorisnya'],
            ['name' => 'Splitter', 'unit' => 'pcs', 'description' => 'PLC Splitter 1:8, 1:16, 1:32'],
            ['name' => 'ODP Box', 'unit' => 'unit', 'description' => 'Optical Distribution Point box'],
            ['name' => 'Kabel UTP / LAN', 'unit' => 'meter', 'description' => 'Kabel UTP Cat5e, Cat6'],
            ['name' => 'Aksesoris Lainnya', 'unit' => 'pcs', 'description' => 'Klem, sling, hook, dan aksesoris lain'],
        ];

        foreach ($categories as $category) {
            InventoryCategory::updateOrCreate(
                ['name' => $category['name']],
                $category
            );
        }
    }
}
