<?php

namespace Tests\Feature;

use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;
use App\Models\Customer;
use App\Models\Invoice;
use App\Models\ModuleConfig;
use Carbon\Carbon;

class AutoSuspendTest extends TestCase
{
    use RefreshDatabase;

    private function setupBaseData()
    {
        $package = \App\Models\Package::create([
            'name' => 'Test Package',
            'price' => 150000,
            'rate_limit' => '10M/10M',
            'mikrotik_profile_name' => 'profile1'
        ]);

        $router = \App\Models\Router::create([
            'name' => 'Test Router',
            'host' => '127.0.0.1',
            'api_username' => 'admin',
            'api_password' => 'admin',
            'api_port' => 8728
        ]);

        ModuleConfig::updateOrCreate(
            ['module' => 'auto_suspend', 'key' => 'grace_period_days'],
            ['value' => '1']
        );

        return [$package, $router];
    }

    public function test_customer_suspended_when_invoice_past_due_and_grace_period(): void
    {
        list($package, $router) = $this->setupBaseData();

        $customer = Customer::create([
            'id' => 1,
            'name' => 'Late Customer',
            'mikrotik_username' => 'late',
            'mikrotik_password' => 'pass',
            'package_id' => $package->id,
            'router_id' => $router->id,
            'status' => 'active'
        ]);

        Invoice::create([
            'id' => 1,
            'customer_id' => $customer->id,
            'amount' => 150000,
            'status' => 'unpaid',
            'billing_period' => '2026-05',
            'due_date' => Carbon::now()->subDays(2)->format('Y-m-d') // Past due > grace period
        ]);

        $response = $this->postJson('/api/auto-suspend/run');
        
        $response->assertStatus(200);

        $this->assertDatabaseHas('customers', [
            'id' => 1,
            'status' => 'isolated'
        ]);
    }

    public function test_customer_not_suspended_if_within_grace_period(): void
    {
        list($package, $router) = $this->setupBaseData();

        $customer = Customer::create([
            'id' => 2,
            'name' => 'Grace Customer',
            'mikrotik_username' => 'grace',
            'mikrotik_password' => 'pass',
            'package_id' => $package->id,
            'router_id' => $router->id,
            'status' => 'active'
        ]);

        Invoice::create([
            'id' => 2,
            'customer_id' => $customer->id,
            'amount' => 150000,
            'status' => 'unpaid',
            'billing_period' => '2026-05',
            'due_date' => Carbon::now()->format('Y-m-d') // Due today, within grace period
        ]);

        $this->postJson('/api/auto-suspend/run');

        $this->assertDatabaseHas('customers', [
            'id' => 2,
            'status' => 'active'
        ]);
    }
}
