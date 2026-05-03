<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use App\Models\Router;
use App\Services\RouterosAPI;

class MonitorController extends Controller
{
    public function monitorRouter(Router $router)
    {
        $api = new RouterosAPI();
        $api->debug = false;

        if (!$api->connect($router->host, $router->api_username, $router->api_password, $router->api_port)) {
            return response()->json(['message' => 'Gagal terkoneksi ke Router!'], 500);
        }

        // System Resources
        $resources = $api->comm('/system/resource/print');
        $resource = $resources[0] ?? [];

        // Identity
        $identity = $api->comm('/system/identity/print');
        $routerName = $identity[0]['name'] ?? $router->name;

        // Active PPPoE
        $activeConnections = $api->comm('/ppp/active/print');
        $pppoeList = [];
        foreach ($activeConnections as $conn) {
            $pppoeList[] = [
                'name' => $conn['name'] ?? '-',
                'service' => $conn['service'] ?? '-',
                'caller_id' => $conn['caller-id'] ?? '-',
                'address' => $conn['address'] ?? '-',
                'uptime' => $conn['uptime'] ?? '-',
                'encoding' => $conn['encoding'] ?? '-',
            ];
        }

        // Interfaces
        $interfaces = $api->comm('/interface/print');
        $ifList = [];
        foreach ($interfaces as $iface) {
            $ifList[] = [
                'name' => $iface['name'] ?? '-',
                'type' => $iface['type'] ?? '-',
                'running' => ($iface['running'] ?? 'false') === 'true',
                'disabled' => ($iface['disabled'] ?? 'false') === 'true',
                'tx_byte' => (int) ($iface['tx-byte'] ?? 0),
                'rx_byte' => (int) ($iface['rx-byte'] ?? 0),
                'link_downs' => (int) ($iface['link-downs'] ?? 0),
            ];
        }

        $api->disconnect();

        // Parse memory
        $totalMem = (int) ($resource['total-memory'] ?? 0);
        $freeMem = (int) ($resource['free-memory'] ?? 0);
        $usedMem = $totalMem - $freeMem;

        // Parse HDD
        $totalHdd = (int) ($resource['total-hdd-space'] ?? 0);
        $freeHdd = (int) ($resource['free-hdd-space'] ?? 0);

        return response()->json([
            'router_name' => $routerName,
            'router_host' => $router->host,
            'system' => [
                'board_name' => $resource['board-name'] ?? '-',
                'architecture' => $resource['architecture-name'] ?? '-',
                'version' => $resource['version'] ?? '-',
                'uptime' => $resource['uptime'] ?? '-',
                'cpu_load' => (int) ($resource['cpu-load'] ?? 0),
                'cpu_count' => (int) ($resource['cpu-count'] ?? 1),
                'total_memory' => $totalMem,
                'used_memory' => $usedMem,
                'free_memory' => $freeMem,
                'total_hdd' => $totalHdd,
                'free_hdd' => $freeHdd,
            ],
            'active_pppoe' => $pppoeList,
            'interfaces' => $ifList,
        ]);
    }

    public function getActiveSessionsAll()
    {
        $routers = Router::all();
        $activeUsernames = [];

        foreach ($routers as $router) {
            $api = new RouterosAPI();
            $api->debug = false;
            
            if ($api->connect($router->host, $router->api_username, $router->api_password, $router->api_port)) {
                $activeConnections = $api->comm('/ppp/active/print');
                foreach ($activeConnections as $conn) {
                    if (isset($conn['name'])) {
                        $activeUsernames[$conn['name']] = [
                            'uptime' => $conn['uptime'] ?? '-',
                            'address' => $conn['address'] ?? '-'
                        ];
                    }
                }
                $api->disconnect();
            }
        }

        return response()->json([
            'active_usernames' => $activeUsernames
        ]);
    }
}
