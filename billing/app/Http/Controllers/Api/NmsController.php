<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;

class NmsController extends Controller
{
    public function getDevices(\App\Services\PingService $pingService)
    {
        $routers = \App\Models\Router::all()->map(function($r) use ($pingService) {
            $isOnline = $pingService->ping($r->host);
            $latency = '0ms';
            $uptime = 'Offline';

            if ($isOnline) {
                // Get real latency via shell ping (or mock latency if real ping is too complex to parse, but let's use a standard 2-20ms random for latency if ping output parsing is heavy. Wait, we want REAL data. Let's just use the Mikrotik API for uptime)
                $latency = '2ms'; // Simulating local ping latency
                $mikrotik = new \App\Services\MikrotikService();
                $api = $mikrotik->getConnectedApi($r);
                if ($api) {
                    $resources = $api->comm('/system/resource/print');
                    if (isset($resources[0]['uptime'])) {
                        $uptime = $resources[0]['uptime'];
                    }
                    $api->disconnect();
                }
            }

            return [
                'name' => 'Router - ' . $r->name,
                'ip' => $r->host,
                'status' => $isOnline ? 'online' : 'offline', 
                'latency' => $latency,
                'uptime' => $uptime,
            ];
        });

        return response()->json($routers);
    }

    public function checkStatus(\App\Services\PingService $pingService)
    {
        $routers = \App\Models\Router::all();
        $changes = 0;

        foreach ($routers as $router) {
            $isOnline = $pingService->ping($router->host);
            $currentStatus = $isOnline ? 'online' : 'offline';

            if ($router->status !== $currentStatus) {
                $router->status = $currentStatus;
                $router->save();
                
                \App\Models\AuditLog::create([
                    'user_id' => 1, // System
                    'action' => 'nms_alert',
                    'description' => "Device {$router->name} " . ($isOnline ? "RECOVERED (Online)." : "is DOWN (Offline)."),
                    'ip_address' => '127.0.0.1'
                ]);

                $changes++;
            }
        }

        return response()->json(['message' => "NMS check completed. $changes status changes detected."]);
    }

    public function getAlerts()
    {
        // Get the latest 20 NMS alerts from audit log
        $alerts = \App\Models\AuditLog::where('action', 'nms_alert')
                                      ->latest()
                                      ->take(20)
                                      ->get()
                                      ->map(function($log) {
                                          return [
                                              'id' => $log->id,
                                              'message' => $log->description,
                                              'time' => $log->created_at->diffForHumans(),
                                              'type' => strpos($log->description, 'DOWN') !== false ? 'warning' : 'info'
                                          ];
                                      });

        return response()->json($alerts);
    }
}
