<?php

use Illuminate\Foundation\Inspiring;
use Illuminate\Support\Facades\Artisan;
use Illuminate\Support\Facades\Schedule;

Artisan::command('inspire', function () {
    $this->comment(Inspiring::quote());
})->purpose('Display an inspiring quote');

// Setup Cron Job untuk Sistem Billing & Isolir Otomatis
Schedule::command('billing:generate')->monthly(); // Generate tagihan setiap bulan
Schedule::command('billing:reminder')->dailyAt('08:00'); // Peringatan WA H-3 Jatuh Tempo setiap jam 8 pagi
Schedule::command('billing:isolir')->dailyAt('00:05'); // Eksekusi isolir jam 12:05 malam setiap hari
