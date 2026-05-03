<?php

namespace App\Services;

use Illuminate\Support\Facades\Log;

class GenieAcsService
{
    /**
     * Mengambil metrik realtime dari GenieACS.
     * Dalam simulasi ini kita melakukan Mocking Data.
     */
    public function getDeviceStatus($sn)
    {
        Log::info("GenieACS: Fetching status for SN: $sn");

        // Simulasi network delay
        sleep(1);

        // Simulasi Response Data
        return [
            'success' => true,
            'sn' => $sn,
            'status' => 'Online',
            'optical_rx' => rand(-2500, -1800) / 100, // Hasilnya -25.00 sampai -18.00 dBm
            'optical_tx' => rand(150, 300) / 100,     // Hasilnya 1.50 sampai 3.00 dBm
            'cpu_usage' => rand(10, 85) . '%',
            'temperature' => rand(35, 55) . ' C',
            'uptime' => rand(1, 45) . ' days',
            'wan_ip' => '10.10.' . rand(1, 255) . '.' . rand(1, 255)
        ];
    }

    /**
     * Memerintahkan GenieACS untuk mereboot perangkat.
     */
    public function rebootDevice($sn)
    {
        Log::info("GenieACS: Sending Reboot Command to SN: $sn");
        
        sleep(2); // Simulasi delay API

        return [
            'success' => true,
            'message' => 'Perintah reboot berhasil dikirim ke perangkat.'
        ];
    }

    /**
     * Mengubah nama (SSID) dan password WiFi via TR-069.
     */
    public function setWifiPassword($sn, $ssid, $password)
    {
        Log::info("GenieACS: Updating WiFi for SN: $sn | SSID: $ssid");

        sleep(2); // Simulasi provisioning delay

        return [
            'success' => true,
            'message' => 'Parameter WiFi berhasil diperbarui.'
        ];
    }
}
