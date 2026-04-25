<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\Models\Invoice;
use Carbon\Carbon;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Auth;

class ReportController extends Controller
{
    public function index()
    {
        $currentMonth = Carbon::now()->startOfMonth();
        
        $paidQuery = Invoice::where('status', 'paid')
            ->whereMonth('invoices.created_at', $currentMonth->month)
            ->whereYear('invoices.created_at', $currentMonth->year);

        $unpaidQuery = Invoice::whereIn('status', ['unpaid', 'overdue'])
            ->whereMonth('invoices.created_at', $currentMonth->month)
            ->whereYear('invoices.created_at', $currentMonth->year);

        $historyQuery = Invoice::select(
                DB::raw('sum(amount) as sums'),
                DB::raw("DATE_FORMAT(invoices.created_at,'%M %Y') as months")
            )->where('status', 'paid')->groupBy('months');
            
        // Jika bukan admin dan punya region, filter by region mereka
        if (Auth::user()->role !== 'admin' && Auth::user()->region_id) {
            $region_id = Auth::user()->region_id;
            $paidQuery->whereHas('customer', function($q) use ($region_id) { $q->where('region_id', $region_id); });
            $unpaidQuery->whereHas('customer', function($q) use ($region_id) { $q->where('region_id', $region_id); });
            $historyQuery->whereHas('customer', function($q) use ($region_id) { $q->where('region_id', $region_id); });
        }
            
        $totalPaidThisMonth = $paidQuery->sum('amount');
        $totalUnpaidThisMonth = $unpaidQuery->sum('amount');
        $revenuePerMonth = $historyQuery->get();

        return view('reports.index', compact('totalPaidThisMonth', 'totalUnpaidThisMonth', 'revenuePerMonth', 'currentMonth'));
    }
}
