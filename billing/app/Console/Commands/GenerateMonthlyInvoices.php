<?php

namespace App\Console\Commands;

use Illuminate\Console\Attributes\Description;
use Illuminate\Console\Attributes\Signature;
use Illuminate\Console\Command;

class GenerateMonthlyInvoices extends Command
{
    protected $signature = 'billing:generate-invoices';

    /**
     * The console command description.
     *
     * @var string
     */
    protected $description = 'Generate monthly invoices for all active customers';

    /**
     * Execute the console command.
     */
    public function handle()
    {
        $currentPeriod = \Carbon\Carbon::now()->format('Y-m');
        $dueDate = \Carbon\Carbon::now()->startOfMonth()->addDays(9)->format('Y-m-d'); // Tanggal 10
        
        $this->info("Starting invoice generation for period: $currentPeriod");

        $customers = \App\Models\Customer::where('status', 'active')
            ->whereHas('package')
            ->with('package')
            ->get();

        $count = 0;
        $skipped = 0;

        foreach ($customers as $customer) {
            $exists = \App\Models\Invoice::where('customer_id', $customer->id)
                ->where('billing_period', $currentPeriod)
                ->exists();

            if ($exists) {
                $skipped++;
                continue;
            }

            \App\Models\Invoice::create([
                'customer_id' => $customer->id,
                'amount' => $customer->package->price,
                'status' => 'unpaid',
                'billing_period' => $currentPeriod,
                'due_date' => $dueDate
            ]);

            $count++;
        }

        $this->info("Completed! Generated $count new invoices. Skipped $skipped duplicates.");
    }
}
