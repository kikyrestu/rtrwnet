<?php

namespace App\Console\Commands;

use Illuminate\Console\Attributes\Description;
use Illuminate\Console\Attributes\Signature;
use Illuminate\Console\Command;
use App\Models\Customer;
use App\Models\Invoice;
use Carbon\Carbon;
use Illuminate\Support\Facades\DB;

#[Signature('billing:generate')]
#[Description('Otomatis membuat tagihan PPPoE pelanggan rtrwnet')]
class GenerateInvoices extends Command
{
    /**
     * Execute the console command.
     */
    public function handle()
    {
        $today = Carbon::today()->day; // contoh: 16
        $currentPeriod = Carbon::now()->format('Y-m'); // contoh: 2026-04

        $customers = Customer::with('package')->where('status', 'active')
            ->where('billing_cycle_date', '<=', $today)
            ->get();

        $generatedCount = 0;

        DB::beginTransaction();
        try {
            foreach ($customers as $customer) {
                // Jangan tagih kalau sudah punya invoice di bulan yang sama
                $hasInvoice = Invoice::where('customer_id', $customer->id)
                    ->where('billing_period', $currentPeriod)
                    ->exists();

                if (!$hasInvoice && $customer->package) {
                    $due = Carbon::now()->addDays(7); // Jatuh tempo H+7
                    
                    Invoice::create([
                        'customer_id' => $customer->id,
                        'billing_period' => $currentPeriod,
                        'amount' => $customer->package->price,
                        'status' => 'unpaid',
                        'due_date' => $due,
                    ]);
                    $generatedCount++;
                }
            }
            DB::commit();
            $this->info("Sukses! {$generatedCount} Tagihan telah dibuat untuk periode {$currentPeriod}.");
        } catch (\Exception $e) {
            DB::rollBack();
            $this->error("Gagal membuat tagihan: " . $e->getMessage());
        }
    }
}
