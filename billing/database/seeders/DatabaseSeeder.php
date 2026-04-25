<?php

namespace Database\Seeders;

use App\Models\User;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Hash;

class DatabaseSeeder extends Seeder
{
    /**
     * Seed the application's database.
     */
    public function run(): void
    {
        User::firstOrCreate(['email' => 'admin@pakaam.net'], [
            'name' => 'Super Admin',
            'password' => Hash::make('password'),
            'role' => 'admin'
        ]);

        User::firstOrCreate(['email' => 'teknisi@pakaam.net'], [
            'name' => 'Teknisi Jaringan',
            'password' => Hash::make('password'),
            'role' => 'technician'
        ]);

        User::firstOrCreate(['email' => 'sales@pakaam.net'], [
            'name' => 'Sales Marketer',
            'password' => Hash::make('password'),
            'role' => 'sales'
        ]);

        User::firstOrCreate(['email' => 'kolektor@pakaam.net'], [
            'name' => 'Kolektor Lapangan',
            'password' => Hash::make('password'),
            'role' => 'collector'
        ]);
    }
}
