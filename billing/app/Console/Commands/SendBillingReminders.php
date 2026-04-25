<?php

namespace App\Console\Commands;

use Illuminate\Console\Attributes\Description;
use Illuminate\Console\Attributes\Signature;
use Illuminate\Console\Command;
use App\Models\Invoice;
use Carbon\Carbon;
use App\Services\WhatsAppService;

#[Signature('billing:reminder')]
#[Description('Kirim blast peringatan Jatuh Tempo WA H-3 ke pelanggan otomatis')]
class SendBillingReminders extends Command
{
    /**
     * Execute the console command.
     */
    public function handle()
    {
        $targetDate = Carbon::today()->addDays(3);

        $invoices = Invoice::with('customer')
            ->where('status', 'unpaid')
            ->whereDate('due_date', $targetDate->toDateString())
            ->get();

        $count = 0;
        foreach ($invoices as $inv) {
            $customer = $inv->customer;
            if ($customer && $customer->phone) {
                // Formatting Rupiah
                $nominal = number_format($inv->amount, 0, ',', '.');
                $tglJatuhTempo = Carbon::parse($inv->due_date)->format('d M Y');
                
                $pesan = "Halo, {$customer->name}!\n\n";
                $pesan .= "Tagihan Internet Anda akan *JATUH TEMPO H-3* (tanggal {$tglJatuhTempo}) sebesar:\n";
                $pesan .= "*Rp {$nominal}*\n\n";
                $pesan .= "Mohon segera melakukan pembayaran agar koneksi internet Anda tidak terputus/terisolir otomatis oleh sistem.\n";
                $pesan .= "\nTerima Kasih!\n- Admin RT-RW Net";

                WhatsAppService::send($customer->phone, $pesan);
                $this->info("Kirim Peringatan H-3 ke: {$customer->name} ({$customer->phone})");
                $count++;
            }
        }

        $this->info("Selesai. Terkirim ke {$count} pelanggan yang nunggak H-3.");
    }
}
