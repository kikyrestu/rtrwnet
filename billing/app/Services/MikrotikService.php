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

    /**
     * Isolate a customer by disabling their PPPoE secret and kicking active session
     * 
     * @param Customer $customer
     * @return bool
     */
    public function isolateCustomer(Customer $customer): bool
    {
        if (!$customer->router) {
            \Log::error("Isolate failed: Customer {$customer->name} has no router assigned.");
            return false;
        }

        $api = $this->getConnectedApi($customer->router);
        if (!$api) {
            \Log::error("Isolate failed: Could not connect to router {$customer->router->host}");
            return false;
        }

        try {
            // 1. Disable PPPoE Secret
            $secrets = $api->comm('/ppp/secret/print', ['?name' => $customer->mikrotik_username]);
            if (isset($secrets[0])) {
                $api->comm('/ppp/secret/set', [
                    '.id' => $secrets[0]['.id'],
                    'disabled' => 'yes'
                ]);
            } else {
                \Log::warning("Isolate: Secret {$customer->mikrotik_username} not found on router.");
            }

            // 2. Kick Active Session (agar langsung mati)
            $active = $api->comm('/ppp/active/print', ['?name' => $customer->mikrotik_username]);
            if (isset($active[0])) {
                $api->comm('/ppp/active/remove', [
                    '.id' => $active[0]['.id']
                ]);
            }

            $api->disconnect();
            return true;
        } catch (\Exception $e) {
            \Log::error("Error isolating customer on Mikrotik: {$e->getMessage()}");
            return false;
        }
    }

    /**
     * Un-Isolate a customer by enabling their PPPoE secret
     */
    public function unisolateCustomer(Customer $customer): bool
    {
        if (!$customer->router) return false;

        $api = $this->getConnectedApi($customer->router);
        if (!$api) return false;

        try {
            $secrets = $api->comm('/ppp/secret/print', ['?name' => $customer->mikrotik_username]);
            if (isset($secrets[0])) {
                $api->comm('/ppp/secret/set', [
                    '.id' => $secrets[0]['.id'],
                    'disabled' => 'no'
                ]);
            }
            $api->disconnect();
            return true;
        } catch (\Exception $e) {
            \Log::error("Error unisolating customer: {$e->getMessage()}");
            return false;
        }
    }

    /**
     * Add Hotspot User Profile to router
     */
    public function syncHotspotProfile(Router $router, \App\Models\HotspotProfile $profile): bool
    {
        $api = $this->getConnectedApi($router);
        if (!$api) return false;

        try {
            $existing = $api->comm('/ip/hotspot/user/profile/print', ['?name' => $profile->name]);
            if (isset($existing[0])) {
                // Update
                $api->comm('/ip/hotspot/user/profile/set', [
                    '.id' => $existing[0]['.id'],
                    'rate-limit' => $profile->rate_limit,
                    'shared-users' => $profile->shared_users
                ]);
            } else {
                // Add
                $api->comm('/ip/hotspot/user/profile/add', [
                    'name' => $profile->name,
                    'rate-limit' => $profile->rate_limit,
                    'shared-users' => $profile->shared_users
                ]);
            }
            $api->disconnect();
            return true;
        } catch (\Exception $e) {
            \Log::error("Error syncing hotspot profile: {$e->getMessage()}");
            return false;
        }
    }

    /**
     * Generate / Add Hotspot Users (Vouchers) to router
     */
    public function syncHotspotUsers(Router $router, array $vouchers, string $profileName): bool
    {
        $api = $this->getConnectedApi($router);
        if (!$api) return false;

        try {
            foreach ($vouchers as $v) {
                $api->comm('/ip/hotspot/user/add', [
                    'name' => $v['username'],
                    'password' => $v['password'],
                    'profile' => $profileName,
                    'server' => 'all'
                ]);
            }
            $api->disconnect();
            return true;
        } catch (\Exception $e) {
            \Log::error("Error syncing hotspot users: {$e->getMessage()}");
            return false;
        }
    }

    /**
     * Remove Hotspot User (Voucher) from router
     */
    public function removeHotspotUser(Router $router, string $username): bool
    {
        $api = $this->getConnectedApi($router);
        if (!$api) return false;

        try {
            $users = $api->comm('/ip/hotspot/user/print', ['?name' => $username]);
            if (isset($users[0])) {
                $api->comm('/ip/hotspot/user/remove', ['.id' => $users[0]['.id']]);
            }
            $api->disconnect();
            return true;
        } catch (\Exception $e) {
            \Log::error("Error removing hotspot user: {$e->getMessage()}");
            return false;
        }
    }

    /**
     * Remove Hotspot Profile from router
     */
    public function removeHotspotProfile(Router $router, string $profileName): bool
    {
        $api = $this->getConnectedApi($router);
        if (!$api) return false;

        try {
            $profiles = $api->comm('/ip/hotspot/user/profile/print', ['?name' => $profileName]);
            if (isset($profiles[0])) {
                $api->comm('/ip/hotspot/user/profile/remove', ['.id' => $profiles[0]['.id']]);
            }
            $api->disconnect();
            return true;
        } catch (\Exception $e) {
            \Log::error("Error removing hotspot profile: {$e->getMessage()}");
            return false;
        }
    }
}