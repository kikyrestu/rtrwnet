<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use App\Models\Customer;
use Illuminate\Support\Facades\DB;
use App\Models\Invoice;
use App\Models\Package;
use Carbon\Carbon;

class DashboardController extends Controller
{
    public function index(Request $request)
    {
        $totalCustomers = Customer::where('status', 'active')->count();
        $currentMonth = now()->format('F Y');
        
        $monthlyRevenue = Invoice::where('status', 'paid')
            ->where('billing_period', $currentMonth)
            ->sum('amount');
            
        $totalTunggakan = Invoice::where('status', 'unpaid')->sum('amount');

        $paketTerlaris = Customer::select('package_id', DB::raw('count(*) as total'))
            ->groupBy('package_id')
            ->orderByDesc('total')
            ->with('package')
            ->first();
            
        $namaPaketTerlaris = $paketTerlaris && $paketTerlaris->package ? $paketTerlaris->package->name : 'Belum Ada';

        $revenueChart = [];
        for ($i = 5; $i >= 0; $i--) {
            $date = Carbon::now()->subMonths($i);
            $periodString = $date->format('F Y');
            $amount = Invoice::where('status', 'paid')
                ->where('billing_period', $periodString)
                ->sum('amount');
                
            $revenueChart[] = [
                'name' => $date->translatedFormat('M'),
                'amount' => (float) $amount
            ];
        }

        $recentInvoices = Invoice::with(['customer.package'])
            ->orderBy('created_at', 'desc')
            ->take(5)
            ->get()
            ->map(function ($invoice) {
                return [
                    'id' => $invoice->id,
                    'name' => $invoice->customer ? $invoice->customer->name : 'Unknown',
                    'package' => ($invoice->customer && $invoice->customer->package) ? $invoice->customer->package->name : '-',
                    'status' => ucfirst($invoice->status),
                    'date' => $invoice->created_at->format('d M Y'),
                    'amount' => 'Rp ' . number_format($invoice->amount, 0, ',', '.')
                ];
            });

        $notifications = [
            [ 'type' => 'alert', 'msg' => 'Server Load Normal', 'time' => '10m ago' ],
            [ 'type' => 'user', 'msg' => 'Auto-isolir berhasil dijalankan', 'time' => '1h ago' ],
        ];

        return response()->json([
            'total_customers' => $totalCustomers,
            'monthly_revenue' => (float) $monthlyRevenue,
            'total_tunggakan' => (float) $totalTunggakan,
            'paket_terlaris' => $namaPaketTerlaris,
            'revenue_chart' => $revenueChart,
            'recent_transactions' => $recentInvoices,
            'notifications' => $notifications
        ]);
    }
}
