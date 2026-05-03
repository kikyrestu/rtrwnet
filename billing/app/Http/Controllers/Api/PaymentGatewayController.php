<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use App\Models\ModuleConfig;
use App\Models\Payment; // assuming payments table exists or we just mock transactions

class PaymentGatewayController extends Controller
{
    private $defaults = [
        'provider' => 'tripay',
        'api_key' => '',
        'private_key' => '',
        'merchant_code' => '',
        'sandbox_mode' => 'true',
        'channels' => '{"qris":true,"bca_va":true,"bni_va":true,"bri_va":true,"mandiri_va":false,"gopay":true,"ovo":false,"shopeepay":true}',
    ];

    public function getConfig()
    {
        $config = ModuleConfig::getForModule('payment_gateway', $this->defaults);
        
        $config['sandbox_mode'] = $config['sandbox_mode'] === "true";
        $config['channels'] = is_string($config['channels']) ? json_decode($config['channels'], true) : $config['channels'];

        return response()->json($config);
    }

    public function updateConfig(Request $request)
    {
        $data = [
            'provider' => $request->provider,
            'api_key' => $request->api_key,
            'private_key' => $request->private_key,
            'merchant_code' => $request->merchant_code,
            'sandbox_mode' => $request->sandbox_mode ? "true" : "false",
            'channels' => json_encode($request->channels),
        ];

        ModuleConfig::updateForModule('payment_gateway', $data);

        return response()->json(['message' => 'Konfigurasi Payment Gateway disimpan']);
    }

    public function getTransactions()
    {
        // For now, return empty array since we don't have real payments table connected yet
        return response()->json([
            'transactions' => [],
            'stats' => [
                'total_month' => 0,
                'total_amount' => 0,
                'success' => 0,
                'pending' => 0,
            ]
        ]);
    }
}
