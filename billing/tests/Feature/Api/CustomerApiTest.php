<?php

namespace Tests\Feature\Api;

use App\Models\Customer;
use App\Models\Package;
use App\Models\Router;
use App\Models\Region;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\Queue;
use App\Jobs\SyncCustomerJob;
use Tests\TestCase;

class CustomerApiTest extends TestCase
{
    use RefreshDatabase;

    protected function setUp(): void
    {
        parent::setUp();
        Queue::fake(); // Prevent actual Mikrotik sync
    }

    private function getDependencies()
    {
        $region = Region::create(['code' => 'REG3', 'name' => 'Region Customer']);
        $package = Package::create([
            'name' => 'Paket A', 
            'price' => 150000, 
            'rate_limit' => '10M/10M', 
            'mikrotik_profile_name' => 'paket-a'
        ]);
        $router = Router::create([
            'name' => 'Router X', 
            'host' => '10.0.0.1', 
            'api_username' => 'admin', 
            'api_password' => 'secret', 
            'api_port' => 8728,
            'region_id' => $region->id
        ]);
        
        return [$package, $router];
    }

    public function test_can_list_all_customers()
    {
        [$package, $router] = $this->getDependencies();

        Customer::create([
            'name' => 'Budi Santoso',
            'phone' => '08123456789',
            'package_id' => $package->id,
            'router_id' => $router->id,
            'mikrotik_username' => 'budi123',
            'mikrotik_password' => 'pass123',
        ]);

        $response = $this->getJson('/api/customers');

        $response->assertStatus(200)
                 ->assertJsonCount(1)
                 ->assertJsonFragment(['name' => 'Budi Santoso']);
    }

    public function test_can_create_a_customer()
    {
        [$package, $router] = $this->getDependencies();

        $payload = [
            'name' => 'Andi Wijaya',
            'phone' => '08987654321',
            'address' => 'Jl. Pahlawan No. 1',
            'package_id' => $package->id,
            'router_id' => $router->id,
            'mikrotik_username' => 'andi1',
            'mikrotik_password' => 'rahasia',
        ];

        $response = $this->postJson('/api/customers', $payload);

        $response->assertStatus(201)
                 ->assertJsonFragment(['name' => 'Andi Wijaya']);

        $this->assertDatabaseHas('customers', ['mikrotik_username' => 'andi1']);
        Queue::assertPushed(SyncCustomerJob::class);
    }

    public function test_can_update_a_customer()
    {
        [$package, $router] = $this->getDependencies();

        $customer = Customer::create([
            'name' => 'Citra Lestari',
            'package_id' => $package->id,
            'router_id' => $router->id,
            'mikrotik_username' => 'citra_l',
            'mikrotik_password' => '12345',
        ]);

        $payload = [
            'name' => 'Citra Lestari (Updated)',
            'status' => 'isolated'
        ];

        $response = $this->putJson("/api/customers/{$customer->id}", $payload);

        $response->assertStatus(200)
                 ->assertJsonFragment(['name' => 'Citra Lestari (Updated)']);

        $this->assertDatabaseHas('customers', [
            'id' => $customer->id,
            'name' => 'Citra Lestari (Updated)',
            'status' => 'isolated'
        ]);
    }

    public function test_can_delete_a_customer()
    {
        [$package, $router] = $this->getDependencies();

        $customer = Customer::create([
            'name' => 'Deleted User',
            'package_id' => $package->id,
            'router_id' => $router->id,
            'mikrotik_username' => 'del_user',
            'mikrotik_password' => 'xxxxx',
        ]);

        $response = $this->deleteJson("/api/customers/{$customer->id}");

        $response->assertStatus(200);
        $this->assertDatabaseMissing('customers', ['id' => $customer->id]);
        Queue::assertPushed(SyncCustomerJob::class);
    }
}
