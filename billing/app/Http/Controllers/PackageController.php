<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\Models\Package;
use App\Models\Router;
use App\Services\RouterosAPI;

class PackageController extends Controller
{
    public function index() 
    { 
        return view('packages.index', ['packages' => Package::all()]); 
    }
    
    public function create() 
    { 
        $mikrotikData = $this->getMikrotikOptions();
        return view('packages.create', $mikrotikData); 
    }
    
    public function store(Request $request) 
    { 
        $package = Package::create($request->all()); 
        $this->syncMikrotikProfile('add', $package);
        return redirect()->route('packages.index'); 
    }
    
    public function show(Package $package) {}
    
    public function edit(Package $package) 
    { 
        $mikrotikData = $this->getMikrotikOptions();
        $mikrotikData['package'] = $package;
        return view('packages.edit', $mikrotikData); 
    }
    
    public function update(Request $request, Package $package) 
    { 
        $oldProfileName = $package->mikrotik_profile_name;
        $package->update($request->all()); 
        $this->syncMikrotikProfile('set', $package, $oldProfileName);
        return redirect()->route('packages.index'); 
    }
    
    public function destroy(Package $package) 
    { 
        $this->syncMikrotikProfile('remove', $package);
        $package->delete(); 
        return redirect()->route('packages.index'); 
    }

    private function getMikrotikOptions()
    {
        $router = Router::first();
        $addresses = [];
        $pools = [];

        if ($router) {
            $api = new RouterosAPI();
            $api->debug = false;
            try {
                if ($api->connect($router->host, $router->api_username, $router->api_password, $router->api_port)) {
                    $rawAddresses = $api->comm('/ip/address/print');
                    foreach ($rawAddresses as $addr) {
                        if (isset($addr['address'])) {
                            $ip = explode('/', $addr['address'])[0];
                            $interface = $addr['interface'] ?? 'unknown';
                            $addresses[$ip] = "$ip ($interface)";
                        }
                    }

                    $rawPools = $api->comm('/ip/pool/print');
                    foreach ($rawPools as $pool) {
                        if (isset($pool['name'])) {
                            $pools[$pool['name']] = $pool['name'];
                        }
                    }
                    $api->disconnect();
                }
            } catch (\Exception $e) {
                // Return empty arrays if mikrotik is unreachable
            }
        }
        
        return compact('addresses', 'pools');
    }

    private function syncMikrotikProfile($action, Package $package, $oldProfileName = null)
    {
        $router = Router::first();
        if (!$router) return;

        $api = new RouterosAPI();
        $api->debug = false;

        $profileName = $package->mikrotik_profile_name;
        
        $params = ['name' => $profileName];
        if (!empty($package->local_address)) $params['local-address'] = $package->local_address;
        if (!empty($package->remote_address)) $params['remote-address'] = $package->remote_address;
        if (!empty($package->rate_limit)) $params['rate-limit'] = $package->rate_limit;

        if ($api->connect($router->host, $router->api_username, $router->api_password, $router->api_port)) {
            if ($action === 'add') {
                $api->comm('/ppp/profile/add', $params);
            } elseif ($action === 'set') {
                $searchName = $oldProfileName ?: $profileName;
                $profiles = $api->comm('/ppp/profile/print', ['?name' => $searchName]);
                if (isset($profiles[0]['.id'])) {
                    $params['.id'] = $profiles[0]['.id'];
                    $api->comm('/ppp/profile/set', $params);
                } else {
                    $api->comm('/ppp/profile/add', $params);
                }
            } elseif ($action === 'remove') {
                $profiles = $api->comm('/ppp/profile/print', ['?name' => $profileName]);
                if (isset($profiles[0]['.id'])) {
                    $api->comm('/ppp/profile/remove', [
                        '.id' => $profiles[0]['.id']
                    ]);
                }
            }
            $api->disconnect();
        }
    }
}