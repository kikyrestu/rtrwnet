<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\Models\Router;
use App\Services\RouterosAPI;

class MikrotikMonitorController extends Controller
{
    public function index(Router $router)
    {
        $api = new RouterosAPI();
        $api->debug = false;

        if (!$api->connect($router->host, $router->api_username, $router->api_password, $router->api_port)) {
            return redirect()->route('routers.index')->with('error', 'Status Offline: Gagal koneksi ke Mikrotik ' . $router->name);
        }

        // Fetch Data dari Mikrotik
        $resources = $api->comm('/system/resource/print');
        $boards = $api->comm('/system/routerboard/print');
        $interfaces = $api->comm('/interface/print');
        $secrets = $api->comm('/ppp/secret/print');
        $actives = $api->comm('/ppp/active/print');
        
        $api->disconnect();

        // Calculate Data
        $res = $resources[0] ?? [];
        $cpu = intval($res['cpu-load'] ?? 0);
        $uptime = $res['uptime'] ?? '-';
        $version = $res['version'] ?? '-';
        $boardName = $boards[0]['board-name'] ?? $res['board-name'] ?? '-';
        
        $freeMem = intval($res['free-memory'] ?? 0);
        $totalMem = intval($res['total-memory'] ?? 1);
        $memUsage = round((($totalMem - $freeMem) / $totalMem) * 100);
        
        $totalPPP = is_array($secrets) ? count($secrets) : 0;
        $onlinePPP = is_array($actives) ? count($actives) : 0;
        $offlinePPP = max(0, $totalPPP - $onlinePPP);

        return view('routers.monitor', compact(
            'router', 'cpu', 'uptime', 'version', 'boardName', 'memUsage',
            'totalPPP', 'onlinePPP', 'offlinePPP', 'interfaces'
        ));
    }

    public function traffic(Router $router, Request $request)
    {
        $interface = $request->get('interface', 'ether1');
        
        $api = new RouterosAPI();
        $api->debug = false;
        
        if ($api->connect($router->host, $router->api_username, $router->api_password, $router->api_port)) {
            $api->write('/interface/monitor-traffic', false);
            $api->write('=interface='.$interface, false);
            $api->write('=once=', true);
            $read = $api->read(false);
            $traffic = $api->parseResponse($read);
            $api->disconnect();
            
            if (isset($traffic[0])) {
                return response()->json([
                    'success' => true,
                    'tx' => intval($traffic[0]['tx-bits-per-second'] ?? 0),
                    'rx' => intval($traffic[0]['rx-bits-per-second'] ?? 0)
                ]);
            }
        }
        
        return response()->json(['success' => false, 'tx' => 0, 'rx' => 0]);
    }
}
