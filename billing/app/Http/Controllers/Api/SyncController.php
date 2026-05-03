<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use App\Models\Router;
use App\Models\Customer;
use App\Models\Package;
use App\Services\RouterosAPI;
use Illuminate\Support\Facades\DB;

class SyncController extends Controller
{
    public function process(Request $request)
    {
        $request->validate(['router_id' => 'required']);
        $router = Router::findOrFail($request->router_id);

        $api = new RouterosAPI();
        $api->debug = false;

        if (!$api->connect($router->host, $router->api_username, $router->api_password, $router->api_port)) {
            return response()->json(['message' => 'Gagal terkoneksi ke Router Mikrotik!'], 500);
        }

        $packagesCount = 0;
        $customersCount = 0;

        DB::beginTransaction();
        try {
            $profiles = $api->comm('/ppp/profile/print');
            foreach ($profiles as $profile) {
                if (!isset($profile['name'])) continue;
                $profName = $profile['name'];
                $package = Package::where('mikrotik_profile_name', $profName)->first();
                if (!$package) {
                    $package = new Package();
                    $package->mikrotik_profile_name = $profName;
                    $package->name = ($profName === 'default' || $profName === 'default-encryption') ? "Mikrotik $profName" : $profName;
                    $package->price = 0;
                }
                $package->rate_limit = $profile['rate-limit'] ?? null;
                $package->local_address = $profile['local-address'] ?? null;
                $package->remote_address = $profile['remote-address'] ?? null;
                $package->save();
                $packagesCount++;
            }

            $secrets = $api->comm('/ppp/secret/print');
            foreach ($secrets as $secret) {
                if (!isset($secret['name'])) continue;
                $username = $secret['name'];
                $password = $secret['password'] ?? '';
                $profileName = $secret['profile'] ?? 'default';
                $disabled = isset($secret['disabled']) && $secret['disabled'] === 'true';
                $package = Package::where('mikrotik_profile_name', $profileName)->first();
                if (!$package) $package = Package::where('mikrotik_profile_name', 'default')->first();

                $customer = Customer::where('mikrotik_username', $username)->first();
                if (!$customer) {
                    $customer = new Customer();
                    $customer->mikrotik_username = $username;
                    $customer->name = $username;
                    $customer->billing_cycle_date = 1;
                }
                $customer->mikrotik_password = $password;
                $customer->router_id = $router->id;
                if ($package) $customer->package_id = $package->id;
                
                if ($disabled) {
                    if ($customer->status === 'active') {
                        $customer->status = 'inactive';
                    }
                } else {
                    $customer->status = 'active'; 
                }

                if ($customer->package_id) {
                    $customer->save();
                    $customersCount++;
                }
            }

            DB::commit();
            $api->disconnect();
            return response()->json(['message' => "Sukses! $packagesCount Profil dan $customersCount Secret berhasil disinkronkan.", 'packages' => $packagesCount, 'customers' => $customersCount]);
        } catch (\Exception $e) {
            DB::rollBack();
            $api->disconnect();
            return response()->json(['message' => 'Terjadi kesalahan: ' . $e->getMessage()], 500);
        }
    }
}
