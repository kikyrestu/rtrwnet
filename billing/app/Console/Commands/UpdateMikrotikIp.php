<?php

namespace App\Console\Commands;

use Illuminate\Console\Attributes\Description;
use Illuminate\Console\Attributes\Signature;
use Illuminate\Console\Command;
use App\Models\Router;

#[Signature('mikrotik:update-ip {ip?}')]
#[Description('Update IP Mikrotik easily')]
class UpdateMikrotikIp extends Command
{
    /**
     * Execute the console command.
     */
    public function handle()
    {
        $router = Router::first();
        if (!$router) {
            $this->error("Tabel routers kosong.");
            return;
        }

        $ip = $this->argument('ip');
        if (!$ip) {
            $ip = $this->ask("Masukkan IP Mikrotik dari VirtualBox (misal 192.168.18.xxx)");
        }

        $oldIp = $router->host;
        $router->host = $ip;
        $router->save();

        $this->info("SUCCESS! IP Router/Mikrotik '{$router->name}' telah diperbarui dari {$oldIp} ke {$ip}");
    }
}
