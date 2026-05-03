<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use App\Models\ModuleConfig;

class ClientPortalController extends Controller
{
    private $defaults = [
        'can_view_billing' => 'true',
        'can_view_history' => 'true',
        'can_report_issue' => 'true',
        'can_download_invoice' => 'false',
        'can_change_password' => 'true',
    ];

    public function getConfig()
    {
        $config = ModuleConfig::getForModule('client_portal', $this->defaults);
        
        foreach ($config as $key => $val) {
            $config[$key] = $val === "true";
        }

        return response()->json($config);
    }

    public function updateConfig(Request $request)
    {
        $data = [];
        foreach ($this->defaults as $key => $val) {
            $data[$key] = $request->has($key) && $request->get($key) ? "true" : "false";
        }

        ModuleConfig::updateForModule('client_portal', $data);

        return response()->json(['message' => 'Konfigurasi Portal Pelanggan disimpan']);
    }

    public function getStats()
    {
        return response()->json([
            'total_accounts' => \App\Models\Customer::count(),
            'login_today' => rand(5, 30), // dummy
            'check_billing' => rand(10, 50),
            'report_issue' => \App\Models\Ticket::whereDate('created_at', today())->count(),
        ]);
    }
}
