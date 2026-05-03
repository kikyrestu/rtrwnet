<?php

namespace Tests\Unit;

use Tests\TestCase;
use App\Services\MikrotikService;
use App\Services\RouterosAPI;
use App\Models\Customer;
use App\Models\Router;
use App\Models\Package;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Mockery;

class MikrotikServiceTest extends TestCase
{
    use RefreshDatabase;

    protected function setUp(): void
    {
        parent::setUp();
    }

    public function test_sync_customer_secret_success()
    {
        // Mocking RouterosAPI
        $mockApi = Mockery::mock(RouterosAPI::class);
        
        // Mock connect and comm methods
        $mockApi->shouldReceive('connect')->once()->andReturn(true);
        $mockApi->shouldReceive('comm')->with('/ppp/secret/add', Mockery::any())->once();
        $mockApi->shouldReceive('disconnect')->once();

        // Bind mock to container
        $this->app->instance(RouterosAPI::class, $mockApi);

        // Setup models
        $router = Router::create([
            'name' => 'Test Router',
            'host' => '127.0.0.1',
            'api_username' => 'admin',
            'api_password' => 'admin',
            'api_port' => 8728
        ]);

        $package = Package::create([
            'name' => '10 Mbps',
            'price' => 150000,
            'rate_limit' => '10M/10M',
            'mikrotik_profile_name' => '10M_Profile'
        ]);

        $customer = Customer::create([
            'name' => 'John Doe',
            'mikrotik_username' => 'johndoe',
            'mikrotik_password' => 'secret123',
            'router_id' => $router->id,
            'package_id' => $package->id,
            'status' => 'active'
        ]);

        $service = new MikrotikService();
        
        $result = $service->syncCustomerSecret('add', $customer);

        $this->assertTrue($result);
    }

    public function test_sync_customer_secret_handles_connection_failure()
    {
        // Mocking RouterosAPI to fail connection
        $mockApi = Mockery::mock(RouterosAPI::class);
        $mockApi->shouldReceive('connect')->once()->andReturn(false);

        $this->app->instance(RouterosAPI::class, $mockApi);

        // Setup models
        $router = Router::create([
            'name' => 'Fail Router',
            'host' => '10.0.0.1',
            'api_username' => 'admin',
            'api_password' => 'admin',
        ]);

        $package = Package::create([
            'name' => '10 Mbps',
            'price' => 150000,
            'rate_limit' => '10M/10M',
            'mikrotik_profile_name' => '10M_Profile'
        ]);

        $customer = Customer::create([
            'name' => 'Jane Doe',
            'mikrotik_username' => 'janedoe',
            'mikrotik_password' => 'secret123',
            'router_id' => $router->id,
            'package_id' => $package->id,
        ]);

        $service = new MikrotikService();
        $result = $service->syncCustomerSecret('add', $customer);

        // Should gracefully fail without crashing
        $this->assertFalse($result);
    }
}
