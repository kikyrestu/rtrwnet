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
        $transactions = Payment::with('invoice.customer')->latest()->take(50)->get();
        
        $totalMonth = Payment::whereMonth('verified_at', now()->month)
                             ->whereYear('verified_at', now()->year)
                             ->count();
                             
        $totalAmount = Payment::whereMonth('verified_at', now()->month)
                              ->whereYear('verified_at', now()->year)
                              ->sum('amount_paid');

        return response()->json([
            'transactions' => $transactions->map(function($p) {
                return [
                    'id' => $p->id,
                    'reference' => 'INV-' . $p->invoice_id,
                    'customer' => $p->invoice && $p->invoice->customer ? $p->invoice->customer->name : 'Unknown',
                    'amount' => $p->amount_paid,
                    'method' => $p->payment_method,
                    'date' => $p->verified_at ? $p->verified_at->format('Y-m-d H:i') : null,
                    'status' => 'success'
                ];
            }),
            'stats' => [
                'total_month' => $totalMonth,
                'total_amount' => $totalAmount,
                'success' => $totalMonth,
                'pending' => 0, // Since we only save verified payments for now
            ]
        ]);
    }
}
