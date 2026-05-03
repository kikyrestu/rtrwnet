<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use App\Models\ModuleConfig;
use App\Models\AutoSuspendLog;

class AutoSuspendController extends Controller
{
    private $defaults = [
        'grace_period_days' => 7,
        'auto_unsuspend' => "true",
        'notify_before_days' => 3,
        'notify_via_whatsapp' => "false",
    ];

    public function getConfig()
    {
        $config = ModuleConfig::getForModule('auto_suspend', $this->defaults);
        
        // Type casting
        $config['grace_period_days'] = (int)$config['grace_period_days'];
        $config['notify_before_days'] = (int)$config['notify_before_days'];
        $config['auto_unsuspend'] = $config['auto_unsuspend'] === "true";
        $config['notify_via_whatsapp'] = $config['notify_via_whatsapp'] === "true";

        return response()->json($config);
    }

    public function updateConfig(Request $request)
    {
        $data = [
            'grace_period_days' => $request->grace_period_days,
            'notify_before_days' => $request->notify_before_days,
            'auto_unsuspend' => $request->auto_unsuspend ? "true" : "false",
            'notify_via_whatsapp' => $request->notify_via_whatsapp ? "true" : "false",
        ];

        ModuleConfig::updateForModule('auto_suspend', $data);

        return response()->json(['message' => 'Konfigurasi Auto Suspend disimpan']);
    }

    public function getLogs()
    {
        $logs = AutoSuspendLog::with('customer')->latest()->take(50)->get()->map(function($log) {
            return [
                'id' => $log->id,
                'customer_name' => $log->customer->name ?? 'Unknown',
                'action' => $log->action,
                'reason' => $log->reason,
                'created_at' => $log->created_at,
            ];
        });

        // Dummy stats
        return response()->json([
            'logs' => $logs,
            'stats' => [
                'total_isolated' => AutoSuspendLog::where('action', 'suspend')->count(),
                'unsuspend_today' => AutoSuspendLog::where('action', 'unsuspend')->whereDate('created_at', today())->count(),
                'will_isolate' => 8, // Dummy logic for now
            ]
        ]);
    }

    public function run()
    {
        $gracePeriod = (int)ModuleConfig::getForModule('auto_suspend', $this->defaults)['grace_period_days'];
        
        $overdueCustomers = \App\Models\Customer::where('status', 'active')
            ->whereHas('invoices', function($q) use ($gracePeriod) {
                $q->where('status', 'unpaid')
                  ->where('due_date', '<', \Carbon\Carbon::now()->subDays($gracePeriod)->format('Y-m-d'));
            })->get();

        $suspendedCount = 0;

        foreach ($overdueCustomers as $customer) {
            $customer->status = 'isolated';
            $customer->save();

            AutoSuspendLog::create([
                'customer_id' => $customer->id,
                'action' => 'suspend',
                'reason' => 'Tagihan melewati masa tenggang (' . $gracePeriod . ' hari)',
            ]);
            $suspendedCount++;
        }

        return response()->json(['message' => "Auto suspend selesai. $suspendedCount pelanggan diisolir."]);
    }
}
