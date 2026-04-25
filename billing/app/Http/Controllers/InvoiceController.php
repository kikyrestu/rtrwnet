<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\Models\Invoice;
use App\Models\Customer;
use Carbon\Carbon;
use App\Services\WhatsAppService;
use App\Models\DistributionPoint;
use App\Services\RouterosAPI;
use Illuminate\Support\Facades\Auth;

class InvoiceController extends Controller
{
    public function index()
    {
        $query = Invoice::with('customer');
        
        // Collector hanya melihat invoice yang di region nya
        if (Auth::user()->role === 'collector' && Auth::user()->region_id) {
            $region_id = Auth::user()->region_id;
            $query->whereHas('customer', function($q) use ($region_id) {
                $q->where('region_id', $region_id);
            });
        }
        
        $invoices = $query->latest()->get();
        return view('invoices.index', compact('invoices'));
    }

    public function generate()
    {
        $currentMonth = Carbon::now()->format('F Y');
        $customers = Customer::where('status', 'active')->get();

        $count = 0;
        foreach ($customers as $customer) {
            $amount = $customer->package->price ?? 0;
            
            if ($amount <= 0) continue;

            $exists = Invoice::where('customer_id', $customer->id)
                ->where('billing_period', $currentMonth)
                ->exists();

            if (!$exists) {
                $dueDate = Carbon::now()->setDay($customer->billing_cycle_date);
                if ($dueDate->isPast()) {
                    $dueDate->addMonth();
                }

                Invoice::create([
                    'customer_id' => $customer->id,
                    'amount' => $amount,
                    'billing_period' => $currentMonth,
                    'due_date' => $dueDate,
                    'status' => 'unpaid'
                ]);
                $count++;
            }
        }

        return redirect()->route('invoices.index')->with('success', "Berhasil generate $count tagihan baru.");
    }

    public function pay(Invoice $invoice)
    {
        if ($invoice->status == 'paid') {
            return redirect()->back()->with('error', 'Tagihan sudah lunas sebelumnya.');
        }

        $invoice->update([
            'status' => 'paid',
            'paid_at' => Carbon::now()
        ]);

        if ($invoice->customer->status == 'isolated') {
            $invoice->customer->update(['status' => 'active']);
            $this->enableCustomerMikrotik($invoice->customer);
        }

        if ($invoice->customer->phone) {
            WhatsAppService::send($invoice->customer->phone, "Terima kasih, pembayaran Rp ".$invoice->amount." telah kami terima.");
        }

        return redirect()->route('invoices.index')->with('success', 'Pembayaran Diterima & Isolir Dibuka (bila terisolir).');
    }

    private function enableCustomerMikrotik(Customer $customer)
    {
        $router = $customer->router;
        if (!$router) return;

        $api = new RouterosAPI();
        $api->debug = false;

        if ($api->connect($router->host, $router->api_username, $router->api_password, $router->api_port)) {
            $secrets = $api->comm('/ppp/secret/print', ['?name' => $customer->mikrotik_username]);
            if (isset($secrets[0]['.id'])) {
                $api->comm('/ppp/secret/enable', ['.id' => $secrets[0]['.id']]);
            }
            $api->disconnect();
        }
    }
}
