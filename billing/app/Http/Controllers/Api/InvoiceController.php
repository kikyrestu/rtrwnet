<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use App\Models\Customer;
use App\Models\Invoice;
use App\Jobs\SyncCustomerJob;
use App\Services\WhatsAppService;
use Carbon\Carbon;

class InvoiceController extends Controller
{
    public function index(Request $request)
    {
        $query = Invoice::with(['customer.package', 'customer.region']);
        
        if ($request->has('status') && $request->status !== 'all') {
            $query->where('status', $request->status);
        }
        if ($request->has('search') && $request->search) {
            $query->whereHas('customer', function($q) use ($request) {
                $q->where('name', 'like', "%{$request->search}%");
            });
        }

        return response()->json($query->latest()->get());
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
                if ($dueDate->isPast()) $dueDate->addMonth();

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

        return response()->json(['message' => "Berhasil generate $count tagihan baru.", 'count' => $count]);
    }

    public function pay(Invoice $invoice)
    {
        if ($invoice->status == 'paid') {
            return response()->json(['message' => 'Tagihan sudah lunas sebelumnya.'], 400);
        }

        $invoice->update(['status' => 'paid', 'paid_at' => Carbon::now()]);

        if ($invoice->customer->status == 'isolated') {
            $invoice->customer->update(['status' => 'active']);
            SyncCustomerJob::dispatch($invoice->customer, 'set');
        }

        if ($invoice->customer->phone) {
            try {
                WhatsAppService::send($invoice->customer->phone, "Terima kasih, pembayaran Rp " . number_format($invoice->amount, 0, ',', '.') . " telah kami terima.");
            } catch (\Exception $e) {}
        }

        return response()->json(['message' => 'Pembayaran diterima & isolir dibuka (bila terisolir).']);
    }

    public function show(Invoice $invoice)
    {
        return response()->json($invoice->load('customer.package'));
    }

    public function remind(Invoice $invoice)
    {
        if (!$invoice->customer || !$invoice->customer->phone) {
            return response()->json(['message' => 'Pelanggan tidak memiliki nomor WhatsApp.'], 400);
        }

        if ($invoice->status == 'paid') {
            return response()->json(['message' => 'Tagihan sudah lunas, tidak perlu diingatkan.'], 400);
        }

        $phone = $invoice->customer->phone;
        $amount = number_format($invoice->amount, 0, ',', '.');
        $month = $invoice->billing_period;
        $name = $invoice->customer->name;
        
        $msg = "Halo $name, \n\nIni adalah pengingat tagihan internet Anda untuk periode $month sebesar Rp $amount. Mohon segera melakukan pembayaran agar koneksi tetap lancar.\n\nTerima kasih.";

        try {
            WhatsAppService::send($phone, $msg);
            return response()->json(['message' => 'Reminder WhatsApp berhasil dikirim.']);
        } catch (\Exception $e) {
            return response()->json(['message' => 'Gagal mengirim WA: ' . $e->getMessage()], 500);
        }
    }
}
