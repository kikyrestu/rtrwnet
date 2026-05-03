<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use App\Models\Invoice;
use Carbon\Carbon;

class ReportController extends Controller
{
    public function index()
    {
        $currentMonth = Carbon::now()->startOfMonth();

        $totalPaidThisMonth = Invoice::where('status', 'paid')
            ->whereMonth('created_at', $currentMonth->month)
            ->whereYear('created_at', $currentMonth->year)
            ->sum('amount');

        $totalUnpaidThisMonth = Invoice::whereIn('status', ['unpaid', 'overdue'])
            ->whereMonth('created_at', $currentMonth->month)
            ->whereYear('created_at', $currentMonth->year)
            ->sum('amount');

        $revenuePerMonth = [];
        for ($i = 5; $i >= 0; $i--) {
            $date = Carbon::now()->subMonths($i);
            $amount = Invoice::where('status', 'paid')
                ->whereMonth('created_at', $date->month)
                ->whereYear('created_at', $date->year)
                ->sum('amount');
            $revenuePerMonth[] = [
                'name' => $date->translatedFormat('M Y'),
                'amount' => (float) $amount
            ];
        }

        $paidInvoices = Invoice::with('customer')
            ->where('status', 'paid')
            ->whereMonth('created_at', $currentMonth->month)
            ->whereYear('created_at', $currentMonth->year)
            ->latest('paid_at')
            ->get()
            ->map(function($inv) {
                return [
                    'id' => $inv->id,
                    'customer_name' => $inv->customer ? $inv->customer->name : '-',
                    'amount' => $inv->amount,
                    'paid_at' => $inv->paid_at ? $inv->paid_at->format('d M Y') : '-',
                    'billing_period' => $inv->billing_period,
                ];
            });

        return response()->json([
            'total_paid' => (float) $totalPaidThisMonth,
            'total_unpaid' => (float) $totalUnpaidThisMonth,
            'revenue_chart' => $revenuePerMonth,
            'paid_invoices' => $paidInvoices,
            'current_month' => $currentMonth->format('F Y'),
        ]);
    }
}
