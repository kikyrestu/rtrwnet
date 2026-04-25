<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\Models\Router;
use App\Models\Package;
use App\Models\Customer;
use App\Services\RouterosAPI;

class MikrotikDebugController extends Controller
{
    public function debug($type, $id)
    {
        $api = new RouterosAPI();
        $api->debug = false;
        $data = ['status' => 'UNKNOWN'];

        try {
            if ($type === 'router') {
                $router = Router::findOrFail($id);
                if ($api->connect($router->host, $router->api_username, $router->api_password, $router->api_port)) {
                    $response = $api->comm('/system/resource/print');
                    $api->disconnect();
                    $data = ['status' => 'OK', 'action' => 'Ping Router', 'mikrotik_response' => $response];
                } else {
                    $data = ['status' => 'FAILED', 'message' => 'Cannot connect'];
                }
            }
            
            if ($type === 'package') {
                $package = Package::findOrFail($id);
                $router = Router::first();
                if (!$router) {
                    $data = ['status' => 'FAILED', 'message' => 'No router'];
                } else {
                    if ($api->connect($router->host, $router->api_username, $router->api_password, $router->api_port)) {
                        $response = $api->comm('/ppp/profile/print', ['?name' => $package->mikrotik_profile_name]);
                        $api->disconnect();
                        $data = ['status' => 'OK', 'action' => 'Check PPPoE Profile', 'mikrotik_response' => $response];
                    } else {
                        $data = ['status' => 'FAILED', 'message' => 'Cannot connect'];
                    }
                }
            }
            
            if ($type === 'customer') {
                $customer = Customer::with('router')->findOrFail($id);
                $router = $customer->router;
                if (!$router) {
                    $data = ['status' => 'FAILED', 'message' => 'No router assigned'];
                } else {
                    if ($api->connect($router->host, $router->api_username, $router->api_password, $router->api_port)) {
                        $response = $api->comm('/ppp/secret/print', ['?name' => $customer->mikrotik_username]);
                        $api->disconnect();
                        $data = ['status' => 'OK', 'action' => 'Check PPPoE Secret', 'mikrotik_response' => $response];
                    } else {
                        $data = ['status' => 'FAILED', 'message' => 'Cannot connect'];
                    }
                }
            }
        } catch (\Exception $e) {
            $data = ['status' => 'ERROR', 'message' => $e->getMessage()];
        }

        return view('mikrotik.debug', compact('data', 'type', 'id'));
    }
}