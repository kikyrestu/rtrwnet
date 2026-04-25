<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\Models\Router;
use App\Models\Package;
use App\Models\Customer;
use App\Services\RouterosAPI;
use Illuminate\Support\Facades\DB;

class SyncController extends Controller
{
    public function index()
    {
        $routers = Router::all();
        return view('sync.index', compact('routers'));
    }

    public function process(Request $request)
    {
        $request->validate(['router_id' => 'required']);
        $router = Router::findOrFail($request->router_id);

        $api = new RouterosAPI();
        $api->debug = false;

        if (!$api->connect($router->host, $router->api_username, $router->api_password, $router->api_port)) {
            return back()->with('error', 'Gagal terkoneksi ke Router Mikrotik!');
        }

        $packagesCount = 0;
        $customersCount = 0;

        DB::beginTransaction();
        try {
            // 1. Sync PPPoE Profiles as Packages
            $profiles = $api->comm('/ppp/profile/print');
            foreach ($profiles as $profile) {
                if (!isset($profile['name'])) continue;
                
                $profName = $profile['name'];
                
                $package = Package::where('mikrotik_profile_name', $profName)->first();
                if (!$package) {
                    $package = new Package();
                    $package->mikrotik_profile_name = $profName;
                    $package->name = ($profName === 'default' || $profName === 'default-encryption') 
                                        ? "Mikrotik $profName" 
                                        : $profName;
                    $package->price = 0;
                }
                
                $package->rate_limit = $profile['rate-limit'] ?? null;
                $package->local_address = $profile['local-address'] ?? null;
                $package->remote_address = $profile['remote-address'] ?? null;
                $package->save();
                
                $packagesCount++;
            }

            // 2. Sync PPPoE Secrets as Customers
            $secrets = $api->comm('/ppp/secret/print');
            foreach ($secrets as $secret) {
                if (!isset($secret['name'])) continue;
                
                $username = $secret['name'];
                $password = $secret['password'] ?? '';
                $profileName = $secret['profile'] ?? 'default';
                $disabled = isset($secret['disabled']) && $secret['disabled'] === 'true';

                // Find matching package to attach
                $package = Package::where('mikrotik_profile_name', $profileName)->first();
                if (!$package) {
                    // Fallback to default if somehow missing
                    $package = Package::where('mikrotik_profile_name', 'default')->first();
                }

                $customer = Customer::where('mikrotik_username', $username)->first();
                if (!$customer) {
                    $customer = new Customer();
                    $customer->mikrotik_username = $username;
                    $customer->name = $username; // Use username as initial real name
                    $customer->billing_cycle_date = 1;
                }

                $customer->mikrotik_password = $password;
                $customer->router_id = $router->id;
                // If we somehow still have no $package, skip to avoid SQL error
                if ($package) {
                    $customer->package_id = $package->id;
                }
                
                $customer->status = $disabled ? 'inactive' : 'active';
                
                if ($customer->package_id) {
                    $customer->save();
                    $customersCount++;
                }
            }

            DB::commit();
            $api->disconnect();

            return back()->with('success', "Sukses! $packagesCount Profil PPPoE dan $customersCount Secret PPPoE berhasil disinkronkan.");
        } catch (\Exception $e) {
            DB::rollBack();
            $api->disconnect();
            return back()->with('error', 'Terjadi kesalahan sinkronisasi: ' . $e->getMessage());
        }
    }
}