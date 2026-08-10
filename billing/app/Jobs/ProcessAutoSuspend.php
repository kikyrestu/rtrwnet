<?php

namespace App\Jobs;

use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Foundation\Queue\Queueable;
use Illuminate\Foundation\Bus\Dispatchable;
use Illuminate\Queue\InteractsWithQueue;
use Illuminate\Queue\SerializesModels;
use App\Models\Customer;
use App\Models\AutoSuspendLog;

class ProcessAutoSuspend implements ShouldQueue
{
    use Dispatchable, InteractsWithQueue, Queueable, SerializesModels;

    protected $customerId;
    protected $gracePeriod;

    /**
     * Create a new job instance.
     */
    public function __construct($customerId, $gracePeriod)
    {
        $this->customerId = $customerId;
        $this->gracePeriod = $gracePeriod;
    }

    /**
     * Execute the job.
     */
    public function handle(): void
    {
        // Eager load router for mikrotik service
        $customer = Customer::with('router')->find($this->customerId);
        
        if ($customer && $customer->status === 'active') {
            $customer->status = 'isolated';
            $customer->save();

            AutoSuspendLog::create([
                'customer_id' => $customer->id,
                'action' => 'suspend',
                'reason' => 'Tagihan melewati masa tenggang (' . $this->gracePeriod . ' hari)',
            ]);

            // 1. Isolir di Mikrotik secara Nyata
            $mikrotik = new \App\Services\MikrotikService();
            $mikrotik->isolateCustomer($customer);

            // 2. Kirim Notifikasi WhatsApp
            try {
                $wa = \App\Services\WhatsAppService::make();
                $pesan = "Yth. Pelanggan {$customer->name},\n\nMohon maaf, layanan internet Anda sementara kami bekukan karena melewati batas waktu pembayaran. Segera lakukan pembayaran agar layanan kembali aktif.\n\nTerima Kasih,\nAdmin PAKAAM";
                $wa->send($customer->phone, $pesan);
            } catch (\Exception $e) {
                \Log::error("Gagal mengirim WA Isolir ke {$customer->phone}: " . $e->getMessage());
            }
        }
    }
}
