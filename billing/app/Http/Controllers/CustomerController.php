<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\Models\Customer;
use App\Models\Package;
use App\Models\Router;
use App\Models\DistributionPoint;
use App\Services\RouterosAPI;
use Illuminate\Support\Facades\Auth;
use App\Models\Region;

class CustomerController extends Controller
{
    public function index() 
    { 
        $query = Customer::with(['package', 'router', 'dp']);
        if (Auth::user()->role === 'sales') {
            $query->where('region_id', Auth::user()->region_id);
        }
        return view('customers.index', ['customers' => $query->get()]); 
    }
    
    public function create() 
    { 
        $regions = (Auth::user()->role === 'sales') 
            ? Region::where('id', Auth::user()->region_id)->get() 
            : Region::all();
            
        return view('customers.create', [
            'packages' => Package::all(), 
            'routers' => Router::all(), 
            'dps' => DistributionPoint::all(),
            'regions' => $regions
        ]); 
    }
    
    public function store(Request $request) 
    { 
        $data = $request->all();
        if (Auth::user()->role === 'sales' && Auth::user()->region_id) {
            $data['region_id'] = Auth::user()->region_id; // paksa region sesuai sales
        }
        $customer = Customer::create($data);
        $this->syncMikrotikSecret('add', $customer);
        return redirect()->route('customers.index'); 
    }
    
    public function show(Customer $customer) {}
    
    public function edit(Customer $customer) 
    { 
        return view('customers.edit', [
            'customer' => $customer, 
            'packages' => Package::all(), 
            'routers' => Router::all(), 
            'dps' => DistributionPoint::all()
        ]); 
    }
    
    public function update(Request $request, Customer $customer) 
    { 
        $oldUsername = $customer->mikrotik_username;
        $customer->update($request->all()); 
        
        // Reload customer to get updated relations if needed
        $customer->load('package', 'router');
        
        $this->syncMikrotikSecret('set', $customer, $oldUsername);
        return redirect()->route('customers.index'); 
    }
    
    public function destroy(Customer $customer) 
    { 
        $this->syncMikrotikSecret('remove', $customer);
        $customer->delete();
        return redirect()->route('customers.index'); 
    }

    private function syncMikrotikSecret($action, Customer $customer, $oldUsername = null)
    {
        $router = $customer->router;
        if (!$router) return;

        $package = $customer->package;
        $profileName = $package ? $package->mikrotik_profile_name : 'default';

        $api = new RouterosAPI();
        $api->debug = false;

        if ($api->connect($router->host, $router->api_username, $router->api_password, $router->api_port)) {
            if ($action === 'add') {
                $api->comm('/ppp/secret/add', [
                    'name' => $customer->mikrotik_username,
                    'password' => $customer->mikrotik_password,
                    'profile' => $profileName,
                    'service' => 'pppoe'
                ]);
            } elseif ($action === 'set') {
                $searchName = $oldUsername ?: $customer->mikrotik_username;
                $secrets = $api->comm('/ppp/secret/print', ['?name' => $searchName]);
                if (isset($secrets[0]['.id'])) {
                    $api->comm('/ppp/secret/set', [
                        '.id' => $secrets[0]['.id'],
                        'name' => $customer->mikrotik_username,
                        'password' => $customer->mikrotik_password,
                        'profile' => $profileName
                    ]);
                } else {
                    $api->comm('/ppp/secret/add', [
                        'name' => $customer->mikrotik_username,
                        'password' => $customer->mikrotik_password,
                        'profile' => $profileName,
                        'service' => 'pppoe'
                    ]);
                }
            } elseif ($action === 'remove') {
                $secrets = $api->comm('/ppp/secret/print', ['?name' => $customer->mikrotik_username]);
                if (isset($secrets[0]['.id'])) {
                    $api->comm('/ppp/secret/remove', [
                        '.id' => $secrets[0]['.id']
                    ]);
                }
            }
            $api->disconnect();
        }
    }
}
