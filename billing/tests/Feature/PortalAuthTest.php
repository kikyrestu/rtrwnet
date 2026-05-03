<?php

namespace Tests\Feature;

use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Foundation\Testing\WithFaker;
use Tests\TestCase;
use App\Models\Customer;

class PortalAuthTest extends TestCase
{
    use RefreshDatabase;

    public function test_customer_can_login_with_valid_credentials(): void
    {
        // Setup
        $package = \App\Models\Package::create([
            'name' => 'Test Package',
            'price' => 100000,
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

        $customer = Customer::create([
            'id' => 123,
            'name' => 'Test Customer',
            'mikrotik_username' => 'testuser',
            'mikrotik_password' => 'testpass',
            'package_id' => $package->id,
            'router_id' => $router->id,
        ]);

        // Act
        $response = $this->postJson('/api/portal/login', [
            'customer_id' => 'CUST-123',
            'password' => 'pass'
        ]);

        // Assert
        $response->assertStatus(200)
                 ->assertJsonStructure([
                     'message',
                     'customer',
                     'token'
                 ]);
    }

    public function test_customer_cannot_login_with_invalid_credentials(): void
    {
        $response = $this->postJson('/api/portal/login', [
            'customer_id' => 'CUST-999',
            'password' => 'wrongpass'
        ]);

        $response->assertStatus(401)
                 ->assertJson(['message' => 'ID Pelanggan atau Password salah.']);
    }
}
