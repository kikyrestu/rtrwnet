<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;

class NmsController extends Controller
{
    public function getDevices()
    {
        $routers = \App\Models\Router::all()->map(function($r) {
            return [
                'name' => 'Router - ' . $r->name,
                'ip' => $r->host,
                'status' => $r->status, 
                'latency' => rand(1, 10) . 'ms', // Mock latency for UI
                'uptime' => rand(1, 100) . ' hari',
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
        return response()->json([]);
    }
}
