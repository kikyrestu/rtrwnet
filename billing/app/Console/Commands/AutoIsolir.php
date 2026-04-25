<?php

namespace App\Console\Commands;

use Illuminate\Console\Attributes\Description;
use Illuminate\Console\Attributes\Signature;
use Illuminate\Console\Command;
use App\Models\Invoice;
use App\Services\RouterosAPI;
use Carbon\Carbon;
use Illuminate\Support\Facades\DB;

#[Signature('billing:isolir')]
#[Description('Auto-Isolir internet pelanggan yang nunggak bayar')]
class AutoIsolir extends Command
{
    /**
     * Execute the console command.
     */
    public function handle()
    {
        // Cari tagihan yang telat bayar dan pelanggan masih aktif
        $overdueInvoices = Invoice::with(['customer.router', 'customer.package'])
            ->where('status', 'unpaid')
            ->where('due_date', '<', Carbon::today())
            ->whereHas('customer', function($q) {
                $q->where('status', 'active');
            })
            ->get();

        $isolatedCount = 0;

        foreach ($overdueInvoices as $invoice) {
            $customer = $invoice->customer;
            $router = $customer->router;

            if ($router) {
                $api = new RouterosAPI();
                $api->debug = false;
                $api->port = $router->api_port ?? 8728; // <--- Set port as property properly

                if ($api->connect($router->host, $router->api_username, $router->api_password)) {
                    $this->info("Mengisolir: {$customer->name} (Router: {$router->host})");

                    // Cari secret pelanggan
                    $secrets = $api->comm('/ppp/secret/print', ['?name' => $customer->mikrotik_username]);
                    if (isset($secrets[0])) {
                        // Disable akun (matikan total) sesuai request client
                        $api->comm('/ppp/secret/disable', [
                            '.id' => $secrets[0]['.id']
                        ]);
                    }

                    // Kick dari status Active biar disconnect dan reconnect dengan Profile Isolir
                    $actives = $api->comm('/ppp/active/print', ['?name' => $customer->mikrotik_username]);
                    if (isset($actives[0])) {
                        $api->comm('/ppp/active/remove', ['.id' => $actives[0]['.id']]);
                    }

                    $api->disconnect();

                    // Update status db
                    $customer->update(['status' => 'isolated']);
                    
                    // Supaya Invoice tahu udah di action, ubah jadi overdue atau tetep unpaid aja (gpp)
                    $invoice->update(['status' => 'overdue']);
                    $isolatedCount++;
                } else {
                    $this->error("Gagal connect ke Router {$router->host} untuk isolir {$customer->name}");
                }
            }
        }

        $this->info("Selesai! {$isolatedCount} pelanggan nakal telah diisolir.");
    }
}
