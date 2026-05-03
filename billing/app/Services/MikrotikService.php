<?php

namespace App\Services;

use App\Models\Router;
use App\Models\Customer;
use App\Models\Package;

class MikrotikService
{
    /**
     * Get a connected RouterosAPI instance
     * 
     * @param Router $router
     * @return RouterosAPI|null
     */
    public function getConnectedApi(Router $router): ?RouterosAPI
    {
        $api = app(RouterosAPI::class);
        $api->debug = false;
        $api->port = $router->api_port ?? 8728; // Enforce correct port setup

        if ($api->connect($router->host, $router->api_username, $router->api_password)) {
            return $api;
        }

        return null;
    }

    /**
     * Sync Customer PPP Secret to Mikrotik
     * 
     * @param string $action 'add', 'set', 'remove'
     * @param Customer $customer
     * @param string|null $oldUsername Needed for 'set' action if username changed
     * @return bool
     */
    public function syncCustomerSecret(string $action, Customer $customer, string $oldUsername = null): bool
    {
        if (!$customer->router || !$customer->package) {
            return false;
        }

        $api = $this->getConnectedApi($customer->router);
        if (!$api) {
            \Log::error("Failed to connect to Mikrotik {$customer->router->host} for syncing customer {$customer->name}");
            return false;
        }

        try {
            if ($action === 'add') {
                $api->comm('/ppp/secret/add', [
                    'name'     => $customer->mikrotik_username,
                    'password' => $customer->mikrotik_password,
                    'profile'  => $customer->package->mikrotik_profile_name,
                    'service'  => 'any',
                    'comment'  => $customer->name
                ]);
            } elseif ($action === 'set') {
                $targetUsername = $oldUsername ?: $customer->mikrotik_username;
                $secrets = $api->comm('/ppp/secret/print', ['?name' => $targetUsername]);
                
                if (isset($secrets[0])) {
                    $api->comm('/ppp/secret/set', [
                        '.id'      => $secrets[0]['.id'],
                        'name'     => $customer->mikrotik_username,
                        'password' => $customer->mikrotik_password,
                        'profile'  => $customer->package->mikrotik_profile_name,
                        'comment'  => $customer->name
                    ]);
                } else {
                    // Fallback to add if it doesn't exist but we are trying to update
                    $this->syncCustomerSecret('add', $customer);
                }
            } elseif ($action === 'remove') {
                $secrets = $api->comm('/ppp/secret/print', ['?name' => $customer->mikrotik_username]);
                if (isset($secrets[0])) {
                    $api->comm('/ppp/secret/remove', [
                        '.id' => $secrets[0]['.id']
                    ]);
                }
            }
            $api->disconnect();
            return true;
        } catch (\Exception $e) {
            \Log::error("Error syncing customer secret to Mikrotik: {$e->getMessage()}");
            return false;
        }
    }

    /**
     * Sync Package Profile to Mikrotik
     * 
     * @param string $action 'add', 'set', 'remove'
     * @param Package $package
     * @param string|null $oldProfileName
     * @return bool
     */
    public function syncProfile(string $action, Package $package, string $oldProfileName = null): bool
    {
        // For packages we need to sync across all routers usually, 
        // but let's assume we fetch all routers first
        $routers = Router::all();
        $successCount = 0;

        foreach ($routers as $router) {
            $api = $this->getConnectedApi($router);
            if (!$api) continue;

            try {
                if ($action === 'add') {
                    $api->comm('/ppp/profile/add', [
                        'name'        => $package->mikrotik_profile_name,
                        'rate-limit'  => $package->rate_limit,
                        'comment'     => 'Auto-Synced by System'
                    ]);
                } elseif ($action === 'set') {
                    $targetName = $oldProfileName ?: $package->mikrotik_profile_name;
                    $profiles = $api->comm('/ppp/profile/print', ['?name' => $targetName]);
                    
                    if (isset($profiles[0])) {
                        $api->comm('/ppp/profile/set', [
                            '.id'         => $profiles[0]['.id'],
                            'name'        => $package->mikrotik_profile_name,
                            'rate-limit'  => $package->rate_limit
                        ]);
                    }
                } elseif ($action === 'remove') {
                    $profiles = $api->comm('/ppp/profile/print', ['?name' => $package->mikrotik_profile_name]);
                    if (isset($profiles[0])) {
                        $api->comm('/ppp/profile/remove', [
                            '.id' => $profiles[0]['.id']
                        ]);
                    }
                }
                $api->disconnect();
                $successCount++;
            } catch (\Exception $e) {
                \Log::error("Error syncing profile to Mikrotik {$router->host}: {$e->getMessage()}");
            }
        }

        return $successCount > 0;
    }
}